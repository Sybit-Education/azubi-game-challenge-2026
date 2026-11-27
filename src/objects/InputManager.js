import Phaser from 'phaser';
import { getPlayerPads, stickDirections } from './gamepadPadSelection.js';
import { rumble } from './rumble.js';

const BUTTON_COUNT = 4;

// The stick must return below this sideways tilt before it can steer that way again.
// Lower than the steer threshold, so a stick resting at the edge can't flicker.
const STEER_RELEASE = 0.3;

const ITEM_BOX_POP = [{ ms: 20, weak: 0.6 }, { ms: 35 }];

// Eases up over the first `rise` part, then fades out
function swell(totalMs, peak, { steps = 13, rise = 0.3 } = {}) {
  return Array.from({ length: steps }, (_, index) => {
    const x = (index + 0.5) / steps;
    const level =
      x < rise
        ? Math.sin((Math.PI / 2) * (x / rise))
        : Math.cos((Math.PI / 2) * ((x - rise) / (1 - rise)));
    return { ms: totalMs / steps, strong: peak.strong * level, weak: peak.weak * level };
  });
}

// Swings between the deep and the sharp motor `cycles` times while calming down
function slosh(totalMs, peak, { cycles = 3, steps = 40 } = {}) {
  return Array.from({ length: steps }, (_, index) => {
    const x = (index + 0.5) / steps;
    const wave = Math.sin(2 * Math.PI * cycles * x);
    const calm = 1 - 0.6 * x;
    return {
      ms: totalMs / steps,
      strong: peak * calm * Math.max(0, wave),
      weak: peak * 0.8 * calm * Math.max(0, -wave),
    };
  });
}

// Steps play back to back (see rumble.js). strong = deep rumble, weak = sharp buzz,
// 0–1 each; { ms } alone is a pause.
const RUMBLE_PATTERNS = {
  // Name input's virtual keyboard, tuned like a clicky keyboard
  keyboard: {
    move: [{ ms: 5, weak: 0.7 }],
    wrap: [{ ms: 7, strong: 0.25, weak: 0.85 }],
    type: [{ ms: 5, weak: 1 }, { ms: 16 }, { ms: 4, weak: 0.55 }],
    delete: [{ ms: 7, strong: 0.35, weak: 0.45 }],
    denied: [{ ms: 12, strong: 0.35 }, { ms: 30 }, { ms: 12, strong: 0.3 }],
    enter: [
      { ms: 5, weak: 0.8 },
      { ms: 18 },
      { ms: 5, weak: 0.9 },
      { ms: 18 },
      { ms: 18, strong: 0.5, weak: 1 },
    ],
    yourTurn: [{ ms: 8, weak: 0.8 }, { ms: 40 }, { ms: 8, weak: 0.8 }],
  },
  // "Rewind": ticks speeding up and dropping from sharp to deep, then a soft thump
  back: [
    { ms: 4, weak: 0.8 },
    { ms: 10 },
    { ms: 4, strong: 0.1, weak: 0.7 },
    { ms: 7 },
    { ms: 5, strong: 0.2, weak: 0.55 },
    { ms: 5 },
    { ms: 6, strong: 0.35, weak: 0.35 },
    { ms: 4 },
    { ms: 18, strong: 0.5, weak: 0.15 },
    { ms: 20, strong: 0.15 },
  ],
  heart: swell(520, { strong: 0.55, weak: 0.18 }),
  coinMultiplier: [
    { ms: 20, weak: 0.9 },
    { ms: 30 },
    { ms: 20, weak: 0.9 },
    { ms: 25 },
    { ms: 45, strong: 0.6, weak: 0.8 },
    { ms: 40, strong: 0.15, weak: 0.3 },
  ],
  // Lasts as long as the slide (~1.25 s, see ItemManager.oilEffect)
  oil: [
    { ms: 40, strong: 0.1, weak: 0.55 },
    { ms: 30 },
    ...slosh(1180, 0.45),
    { ms: 60, strong: 0.5, weak: 0.45 },
    { ms: 50, strong: 0.15 },
  ],
  duck: [
    { ms: 25, strong: 0.15, weak: 0.7 },
    { ms: 45, strong: 0.55, weak: 0.2 },
    { ms: 35 },
    { ms: 30, strong: 0.25, weak: 0.35 },
    { ms: 40, strong: 0.1, weak: 0.15 },
  ],
  // Engine starts, revs and launches
  countdown: {
    3: [
      { ms: 45, strong: 0.2, weak: 0.5 },
      { ms: 45 },
      { ms: 45, strong: 0.25, weak: 0.55 },
      { ms: 45 },
      { ms: 45, strong: 0.3, weak: 0.6 },
      { ms: 35 },
      { ms: 130, strong: 0.75, weak: 0.35 },
      { ms: 200, strong: 0.3, weak: 0.08 },
    ],
    2: [
      { ms: 80, strong: 0.35, weak: 0.2 },
      { ms: 120, strong: 0.55, weak: 0.35 },
      { ms: 150, strong: 0.3, weak: 0.12 },
    ],
    1: [
      { ms: 80, strong: 0.4, weak: 0.25 },
      { ms: 160, strong: 0.7, weak: 0.45 },
      { ms: 300, strong: 0.6, weak: 0.4 },
    ],
    go: [
      { ms: 60, strong: 1, weak: 1 },
      { ms: 150, strong: 0.85, weak: 0.55 },
      { ms: 150, strong: 0.65, weak: 0.35 },
      { ms: 50, strong: 0.12 },
      { ms: 70, strong: 0.75, weak: 0.5 },
      { ms: 200, strong: 0.45, weak: 0.22 },
      { ms: 250, strong: 0.2, weak: 0.06 },
    ],
  },
  items: {
    shrink: [
      ...ITEM_BOX_POP,
      { ms: 60, strong: 0.6, weak: 0.15 },
      { ms: 60, strong: 0.4, weak: 0.3 },
      { ms: 60, strong: 0.2, weak: 0.45 },
      { ms: 60, strong: 0.08, weak: 0.5 },
      { ms: 80, weak: 0.25 },
    ],
    grow: [
      ...ITEM_BOX_POP,
      { ms: 60, strong: 0.1, weak: 0.25 },
      { ms: 60, strong: 0.25, weak: 0.3 },
      { ms: 60, strong: 0.45, weak: 0.3 },
      { ms: 60, strong: 0.65, weak: 0.2 },
      { ms: 120, strong: 1, weak: 0.4 },
      { ms: 80, strong: 0.3 },
    ],
    shield: [
      ...ITEM_BOX_POP,
      { ms: 30, weak: 0.9 },
      { ms: 30 },
      { ms: 30, weak: 0.9 },
      { ms: 40 },
      { ms: 150, strong: 0.25, weak: 0.3 },
      { ms: 100, strong: 0.12, weak: 0.15 },
    ],
    // The 'dizzy' hold (rumble.js) covers the rest of the wobble
    nausea: [...ITEM_BOX_POP],
    magnet: [
      ...ITEM_BOX_POP,
      { ms: 35, strong: 0.45, weak: 0.35 },
      { ms: 110 },
      { ms: 35, strong: 0.5, weak: 0.4 },
      { ms: 75 },
      { ms: 35, strong: 0.6, weak: 0.45 },
      { ms: 45 },
      { ms: 35, strong: 0.7, weak: 0.5 },
      { ms: 25 },
      { ms: 80, strong: 0.9, weak: 0.7 },
    ],
  },
  crash: [
    { ms: 70, strong: 1, weak: 1 },
    { ms: 110, strong: 0.8, weak: 0.35 },
    { ms: 150, strong: 0.5, weak: 0.12 },
    { ms: 200, strong: 0.22, weak: 0 },
  ],
  extraLifeHit: [
    { ms: 50, strong: 0.75, weak: 0.8 },
    { ms: 90, strong: 0.4, weak: 0.15 },
    { ms: 110, strong: 0.15, weak: 0 },
  ],
  coin: [{ ms: 25, strong: 0.05, weak: 0.45 }, { ms: 40 }, { ms: 35, strong: 0.1, weak: 0.75 }],
};

// Pickups that still vibrate on the 'reduced' setting
const REDUCED_EFFECTS = new Set(['heart', 'coinMultiplier']);

// Registry key: 'keyboard' | 'pointer' | 'gamepad' | 'joycon'
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

function readPad(pad) {
  const [axisX, axisY] = pad?.axes ?? [0, 0];
  const stick = stickDirections(axisX, axisY);
  const dpad = pad?.dpad ?? {};
  return {
    left: stick.left || Boolean(dpad.left),
    right: stick.right || Boolean(dpad.right),
    up: stick.up || Boolean(dpad.up),
    down: stick.down || Boolean(dpad.down),
    stickX: Number(axisX) || 0,
    shoulderLeft: Boolean(pad?.shoulders?.[0]),
    shoulderRight: Boolean(pad?.shoulders?.[1]),
    buttons: Array.from({ length: BUTTON_COUNT }, (_, index) => Boolean(pad?.buttons?.[index])),
    joyCon: Boolean(pad?.joyCon),
    connected: Boolean(pad),
  };
}

function padFlags(state) {
  return [
    state.left,
    state.right,
    state.up,
    state.down,
    state.shoulderLeft,
    state.shoulderRight,
    ...state.buttons,
  ];
}

// Every other key counts as Player 1's
const PLAYER_2_KEY_CODES = new Set(
  ['UP', 'DOWN', 'LEFT', 'RIGHT', 'NUMPAD_ONE', 'NUMPAD_TWO', 'NUMPAD_THREE'].map(
    (name) => Phaser.Input.Keyboard.KeyCodes[name],
  ),
);

export default class InputManager {
  constructor(scene) {
    this.scene = scene;
    this.previousButtonP1 = new Array(BUTTON_COUNT).fill(false);
    this.previousButtonP2 = new Array(BUTTON_COUNT).fill(false);
    this.previousSpace = false;
    this.hasUpdated = false;
    this.previousPadFlags = { 1: [], 2: [] };
    this.steerArmed = { 1: { left: true, right: true }, 2: { left: true, right: true } };
    // Per player, so one player switching to the keyboard doesn't affect the other
    const startDevice = this.usingGamepad ? 'pad' : 'keyboard';
    this.lastDevice = { 1: startDevice, 2: startDevice };
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

    const onKeyboard = (event) => {
      this.setLastInput('keyboard');
      this.lastDevice[PLAYER_2_KEY_CODES.has(event?.keyCode) ? 2 : 1] = 'keyboard';
    };
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

  playerUsingPad(player) {
    return this.lastDevice?.[player] === 'pad';
  }

  get usingGamepad() {
    return this.lastInput === 'gamepad' || this.lastInput === 'joycon';
  }

  // Player 1 only (just their Joy-Con when two are merged)
  rumbleP1(durationMs = 3, magnitude = 0.4) {
    if (this.usingGamepad) {
      rumble.play(1, [{ ms: durationMs, strong: magnitude, weak: magnitude }]);
    }
  }

  rumbleClick() {
    if (this.usingGamepad) this.rumblePlayer(1, RUMBLE_PATTERNS.keyboard.type);
  }

  rumbleCrash(player, destroyed) {
    const pattern = destroyed ? RUMBLE_PATTERNS.crash : RUMBLE_PATTERNS.extraLifeHit;
    this.rumblePlayer(player, pattern, true);
  }

  rumbleCoin(player) {
    this.rumblePlayer(player, RUMBLE_PATTERNS.coin);
  }

  rumbleDuck(player) {
    this.rumblePlayer(player, RUMBLE_PATTERNS.duck);
  }

  // effect: 'move' | 'wrap' | 'type' | 'delete' | 'denied' | 'enter' | 'yourTurn'
  rumbleKeyboard(player, effect) {
    const pattern = RUMBLE_PATTERNS.keyboard[effect];
    if (pattern && this.usingGamepad) this.rumblePlayer(player, pattern);
  }

  rumbleBack() {
    if (this.usingGamepad) this.rumblePlayer(1, RUMBLE_PATTERNS.back);
  }

  // name: 'heart' | 'coinMultiplier' | 'oil'
  rumbleEffect(player, name) {
    const pattern = RUMBLE_PATTERNS[name];
    if (pattern) this.rumblePlayer(player, pattern, REDUCED_EFFECTS.has(name));
  }

  // fromBox: false (bought in the shop) skips the box's opening pop
  rumbleItem(player, item, { fromBox = true } = {}) {
    const pattern = RUMBLE_PATTERNS.items[item];
    if (!pattern) return;
    this.rumblePlayer(player, fromBox ? pattern : pattern.slice(ITEM_BOX_POP.length), true);
  }

  // step: 3 | 2 | 1 | 'go'
  rumbleCountdown(player, step) {
    const pattern = RUMBLE_PATTERNS.countdown[step];
    if (pattern) this.rumblePlayer(player, pattern, step === 'go');
  }

  // kind: 'scrape' | 'dizzy' | 'idle'; call every frame while it lasts
  rumbleHold(player, kind) {
    rumble.hold(player, kind);
  }

  // `essential` patterns still play on the 'reduced' vibration setting
  rumblePlayer(player, pattern, essential = false) {
    rumble.play(player, pattern, essential);
  }

  resetButtonStates() {
    this.previousButtonP1.fill(false);
    this.previousButtonP2.fill(false);
    this.previousSpace = false;
    this.hasUpdated = false;
  }

  // True only on the frame the stick or D-pad is pushed (see STEER_RELEASE)
  padSteerPushes(player, pad) {
    const armed = this.steerArmed[player];
    const pushes = {};
    for (const [direction, sign] of [
      ['left', -1],
      ['right', 1],
    ]) {
      pushes[direction] = this.hasUpdated && armed[direction] && pad[direction];
      if (pad[direction]) armed[direction] = false;
      else if (pad.stickX * sign < STEER_RELEASE) armed[direction] = true;
    }
    return pushes;
  }

  update() {
    const gamepadEnabled = this.scene.input.gamepad?.enabled !== false;
    const pads = gamepadEnabled
      ? getPlayerPads(readBrowserGamepads())
      : { player1: null, player2: null };
    rumble.update(pads);
    const padP1 = readPad(pads.player1);
    const padP2 = readPad(pads.player2);

    // Only newly pressed input counts, so a drifting Joy-Con stick can't keep
    // overriding the keyboard
    for (const [player, pad] of [
      [1, padP1],
      [2, padP2],
    ]) {
      const flags = padFlags(pad);
      const previous = this.previousPadFlags[player];
      if (flags.some((on, index) => on && !previous[index])) {
        this.setLastInput(pad.joyCon ? 'joycon' : 'gamepad');
        this.lastDevice[player] = 'pad';
      }
      this.previousPadFlags[player] = flags;
    }
    this.showJoyConPrompts = padP1.joyCon && this.lastInput === 'joycon';
    this.padConnectedP1 = padP1.connected;
    this.padConnectedP2 = padP2.connected;

    // Enter / Escape count as Player 1's select / back
    const buttonsP1 = [...padP1.buttons];
    buttonsP1[2] ||= this.keys.select.isDown;
    buttonsP1[3] ||= this.keys.escape.isDown;
    const buttonsP2 = padP2.buttons;

    const justPressedP1 = buttonsP1.map(
      (isDown, index) => this.hasUpdated && isDown && !this.previousButtonP1[index],
    );
    const justPressedP2 = buttonsP2.map(
      (isDown, index) => this.hasUpdated && isDown && !this.previousButtonP2[index],
    );
    const spaceIsDown = this.hasUpdated && this.keys.space.isDown && !this.previousSpace;

    // Held keys keep steering; the controller steers one lane per push.
    // Menus use padLeft / padRight instead.
    const steerP1 = this.padSteerPushes(1, padP1);
    const steerP2 = this.padSteerPushes(2, padP2);
    this.getControlsP1 = {
      left: this.keys.leftP1.isDown || steerP1.left,
      right: this.keys.rightP1.isDown || steerP1.right,
      up: this.keys.upP1.isDown || padP1.up,
      down: this.keys.downP1.isDown || padP1.down,
      accelerate: this.keys.upP1.isDown || padP1.shoulderRight,
      brake: this.keys.downP1.isDown || padP1.shoulderLeft,
      padLeft: padP1.left,
      padRight: padP1.right,
      padUp: padP1.up,
      padDown: padP1.down,
      button1: justPressedP1[0],
      button2: justPressedP1[1],
      button3: justPressedP1[2],
      button4: justPressedP1[3],
      // A, B, X, Y, SL, SR
      padHeld: [...padP1.buttons, padP1.shoulderLeft, padP1.shoulderRight],
      space: spaceIsDown,
    };

    this.getControlsP2 = {
      left: this.keys.leftP2.isDown || steerP2.left,
      right: this.keys.rightP2.isDown || steerP2.right,
      up: this.keys.upP2.isDown || padP2.up,
      down: this.keys.downP2.isDown || padP2.down,
      accelerate: this.keys.upP2.isDown || padP2.shoulderRight,
      brake: this.keys.downP2.isDown || padP2.shoulderLeft,
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

    buttonsP1.forEach((isDown, index) => (this.previousButtonP1[index] = isDown));
    buttonsP2.forEach((isDown, index) => (this.previousButtonP2[index] = isDown));
    this.previousSpace = this.keys.space.isDown;
    this.hasUpdated = true;
  }
}
