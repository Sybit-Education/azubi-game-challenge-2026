import Phaser from 'phaser';
import { getPlayerPads, stickDirections } from './gamepadPadSelection.js';

// Edge-triggered gamepad action slots (see gamepadPadSelection.js)
const BUTTON_COUNT = 4;

// Registry key holding the last input type used anywhere in the game:
// 'keyboard' | 'pointer' | 'gamepad' | 'joycon'
export const LAST_INPUT_KEY = 'lastInputDevice';

function readBrowserGamepads() {
  if (typeof navigator === 'undefined' || typeof navigator.getGamepads !== 'function') {
    return [];
  }
  try {
    return navigator.getGamepads() ?? [];
  } catch {
    return [];
  }
}

// Reads one virtual pad (see gamepadPadSelection.js) into direction and button flags.
function readPad(pad) {
  const [axisX, axisY] = pad?.axes ?? [0, 0];
  const stick = stickDirections(axisX, axisY);
  const dpad = pad?.dpad ?? {};
  return {
    stickUp: stick.up,
    stickDown: stick.down,
    left: stick.left || Boolean(dpad.left),
    right: stick.right || Boolean(dpad.right),
    up: stick.up || Boolean(dpad.up),
    down: stick.down || Boolean(dpad.down),
    // SL / SR, held state: they steer left / right during the race
    shoulderLeft: Boolean(pad?.shoulders?.[0]),
    shoulderRight: Boolean(pad?.shoulders?.[1]),
    buttons: Array.from({ length: BUTTON_COUNT }, (_, index) => Boolean(pad?.buttons?.[index])),
    joyCon: Boolean(pad?.joyCon),
    connected: Boolean(pad),
  };
}

// True while anything on the pad is pressed or pushed.
function isPadActive(state) {
  return (
    state.left ||
    state.right ||
    state.up ||
    state.down ||
    state.shoulderLeft ||
    state.shoulderRight ||
    state.buttons.some(Boolean)
  );
}

export default class InputManager {
  constructor(scene) {
    this.scene = scene;
    // Track previous frame states for edge-triggering buttons
    this.previousButtonP1 = new Array(BUTTON_COUNT).fill(false);
    this.previousButtonP2 = new Array(BUTTON_COUNT).fill(false);
    this.previousSpace = false;
    this.hasUpdated = false;
  }

  create() {
    this.scene.input.gamepad?.once('connected', (pad) => {
      console.debug('Controller connected!', pad?.id);
    });
    this.keys = this.scene.input.keyboard.addKeys({
      upP1: Phaser.Input.Keyboard.KeyCodes.W,
      downP1: Phaser.Input.Keyboard.KeyCodes.S,
      leftP1: Phaser.Input.Keyboard.KeyCodes.A,
      rightP1: Phaser.Input.Keyboard.KeyCodes.D,
      upP2: Phaser.Input.Keyboard.KeyCodes.UP,
      downP2: Phaser.Input.Keyboard.KeyCodes.DOWN,
      leftP2: Phaser.Input.Keyboard.KeyCodes.LEFT,
      rightP2: Phaser.Input.Keyboard.KeyCodes.RIGHT,
      select: Phaser.Input.Keyboard.KeyCodes.ENTER,
      escape: Phaser.Input.Keyboard.KeyCodes.ESC,
      space: Phaser.Input.Keyboard.KeyCodes.SPACE,
    });

    // Keyboard and mouse switch the last input away from the gamepad
    const onKeyboard = () => this.setLastInput('keyboard');
    const onPointer = () => this.setLastInput('pointer');
    this.scene.input.keyboard.on('keydown', onKeyboard);
    this.scene.input.on('pointerdown', onPointer);
    this.scene.input.on('pointermove', onPointer);
    this.scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.scene.input.keyboard?.off('keydown', onKeyboard);
      this.scene.input.off('pointerdown', onPointer);
      this.scene.input.off('pointermove', onPointer);
    });
  }

  setLastInput(device) {
    if (this.scene.registry.get(LAST_INPUT_KEY) !== device) {
      this.scene.registry.set(LAST_INPUT_KEY, device);
    }
  }

  get lastInput() {
    return this.scene.registry.get(LAST_INPUT_KEY);
  }

  // True while a gamepad or Joy-Con was the last input (not keyboard / mouse)
  get usingGamepad() {
    return this.lastInput === 'gamepad' || this.lastInput === 'joycon';
  }

  resetButtonStates() {
    this.previousButtonP1.fill(false);
    this.previousButtonP2.fill(false);
    this.previousSpace = false;
    this.hasUpdated = false;
  }

  update() {
    const gamepadEnabled = this.scene.input.gamepad?.enabled !== false;
    const pads = gamepadEnabled
      ? getPlayerPads(readBrowserGamepads())
      : { player1: null, player2: null };
    const padP1 = readPad(pads.player1);
    const padP2 = readPad(pads.player2);

    for (const pad of [padP1, padP2]) {
      if (isPadActive(pad)) this.setLastInput(pad.joyCon ? 'joycon' : 'gamepad');
    }
    // Show Switch button prompts while Player 1 holds a Joy-Con and it was used last
    this.showJoyConPrompts = padP1.joyCon && this.lastInput === 'joycon';
    // Whether each player has a gamepad (used for the in-race shop button icons)
    this.padConnectedP1 = padP1.connected;
    this.padConnectedP2 = padP2.connected;

    // Raw button states; keyboard Enter/Escape count as Player 1's select/back
    const buttonsP1 = [...padP1.buttons];
    buttonsP1[2] ||= this.keys.select.isDown;
    buttonsP1[3] ||= this.keys.escape.isDown;
    const buttonsP2 = padP2.buttons;

    // "Just pressed" states (true only on the exact frame the button goes down)
    const justPressedP1 = buttonsP1.map(
      (isDown, index) => this.hasUpdated && isDown && !this.previousButtonP1[index],
    );
    const justPressedP2 = buttonsP2.map(
      (isDown, index) => this.hasUpdated && isDown && !this.previousButtonP2[index],
    );
    const spaceIsDown = this.hasUpdated && this.keys.space.isDown && !this.previousSpace;

    // left/right steer the car (stick, D-pad or SL/SR); menus use padLeft/padRight
    this.getControlsP1 = {
      left: this.keys.leftP1.isDown || padP1.left || padP1.shoulderLeft,
      right: this.keys.rightP1.isDown || padP1.right || padP1.shoulderRight,
      up: this.keys.upP1.isDown || padP1.up,
      down: this.keys.downP1.isDown || padP1.down,
      accelerate: this.keys.upP1.isDown || padP1.stickUp,
      brake: this.keys.downP1.isDown || padP1.stickDown,
      // Gamepad-only directions, for menus that handle the keyboard separately
      padLeft: padP1.left,
      padRight: padP1.right,
      padUp: padP1.up,
      padDown: padP1.down,
      button1: justPressedP1[0],
      button2: justPressedP1[1],
      button3: justPressedP1[2],
      button4: justPressedP1[3],
      // Gamepad buttons currently held (no keyboard): A, B, X, Y, SL, SR
      padHeld: [...padP1.buttons, padP1.shoulderLeft, padP1.shoulderRight],
      space: spaceIsDown,
    };

    this.getControlsP2 = {
      left: this.keys.leftP2.isDown || padP2.left || padP2.shoulderLeft,
      right: this.keys.rightP2.isDown || padP2.right || padP2.shoulderRight,
      up: this.keys.upP2.isDown || padP2.up,
      down: this.keys.downP2.isDown || padP2.down,
      accelerate: this.keys.upP2.isDown || padP2.stickUp,
      brake: this.keys.downP2.isDown || padP2.stickDown,
      padLeft: padP2.left,
      padRight: padP2.right,
      padUp: padP2.up,
      padDown: padP2.down,
      button1: justPressedP2[0],
      button2: justPressedP2[1],
      button3: justPressedP2[2],
      button4: justPressedP2[3],
      padHeld: [...padP2.buttons, padP2.shoulderLeft, padP2.shoulderRight],
    };

    // Save current states into previous states for the next frame check
    buttonsP1.forEach((isDown, index) => (this.previousButtonP1[index] = isDown));
    buttonsP2.forEach((isDown, index) => (this.previousButtonP2[index] = isDown));
    this.previousSpace = this.keys.space.isDown;
    this.hasUpdated = true;
  }
}
