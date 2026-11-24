import Phaser from 'phaser';
import { getPlayerPads, stickDirections } from './gamepadPadSelection.js';
import { rumble } from './rumble.js';

// Edge-triggered gamepad action slots (see gamepadPadSelection.js)
const BUTTON_COUNT = 4;

// Every item box opens with the same little "pop" before the item's own signature
const ITEM_BOX_POP = [{ ms: 20, weak: 0.6 }, { ms: 35 }];

// Smooth swell built from short steps: eases up over the first `rise` part, then fades
// out gently, scaled to `peak` motor levels.
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

// Sloshing sway: swings between the deep and the sharp motor `cycles` times while it
// calms down, like a car swinging around on a slippery surface.
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

// In-race vibration patterns: steps played back to back (see rumble.js).
// strong = deep low rumble, weak = sharp high buzz, 0–1 each; { ms } alone is a pause.
const RUMBLE_PATTERNS = {
  // Name input's virtual keyboard, tuned like a clicky (blue switch) keyboard: tiny,
  // sharp ticks on the high-pitched motor with barely any low rumble
  keyboard: {
    // Moving between keys: one crisp tick
    move: [{ ms: 5, weak: 0.7 }],
    // Wrapping around an edge: the same tick with a little more body
    wrap: [{ ms: 7, strong: 0.25, weak: 0.85 }],
    // Typing a letter: "click-clack", a sharp click going down and a lighter one coming
    // back up, like a real clicky switch
    type: [{ ms: 5, weak: 1 }, { ms: 16 }, { ms: 4, weak: 0.55 }],
    // Deleting: a single duller click, lower than typing
    delete: [{ ms: 7, strong: 0.35, weak: 0.45 }],
    // Nothing to do (name full, nothing to delete, empty name): two quick dull bumps
    denied: [{ ms: 12, strong: 0.35 }, { ms: 30 }, { ms: 12, strong: 0.3 }],
    // ENTER: two clicks rolling into one firm, snappy hit
    enter: [
      { ms: 5, weak: 0.8 },
      { ms: 18 },
      { ms: 5, weak: 0.9 },
      { ms: 18 },
      { ms: 18, strong: 0.5, weak: 1 },
    ],
    // Player 2's controller when it's their turn to type
    yourTurn: [{ ms: 8, weak: 0.8 }, { ms: 40 }, { ms: 8, weak: 0.8 }],
  },
  // Back to menu (every screen): a "rewind", ticks speeding up and dropping from sharp to deep, then a
  // soft thump as you land back in the menu
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
  // Heart pickup: one smooth, warm swell that eases in and fades out
  heart: swell(520, { strong: 0.55, weak: 0.18 }),
  // 2x star: snappy "ting-ting-POP", two bright taps and a short punchy hit
  coinMultiplier: [
    { ms: 20, weak: 0.9 },
    { ms: 30 },
    { ms: 20, weak: 0.9 },
    { ms: 25 },
    { ms: 45, strong: 0.6, weak: 0.8 },
    { ms: 40, strong: 0.15, weak: 0.3 },
  ],
  // Oil slick: a wet splash, the car sloshing around without grip, then the tyres
  // bite again right when the slide ends (~1.25 s, see ItemManager.oilEffect)
  oil: [
    { ms: 40, strong: 0.1, weak: 0.55 },
    { ms: 30 },
    ...slosh(1180, 0.45),
    { ms: 60, strong: 0.5, weak: 0.45 },
    { ms: 50, strong: 0.15 },
  ],
  // Squishy "boing": a springy tap, a soft thud, then a little wobble
  duck: [
    { ms: 25, strong: 0.15, weak: 0.7 },
    { ms: 45, strong: 0.55, weak: 0.2 },
    { ms: 35 },
    { ms: 30, strong: 0.25, weak: 0.35 },
    { ms: 40, strong: 0.1, weak: 0.15 },
  ],
  // Start countdown: the engine starts, revs and launches (idle in between is a hold)
  countdown: {
    // Starter motor cranking (chug-chug-chug), then the engine catches with a cough
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
    // Quick throttle blip
    2: [
      { ms: 80, strong: 0.35, weak: 0.2 },
      { ms: 120, strong: 0.55, weak: 0.35 },
      { ms: 150, strong: 0.3, weak: 0.12 },
    ],
    // Bigger, longer rev, building up to the launch
    1: [
      { ms: 80, strong: 0.4, weak: 0.25 },
      { ms: 160, strong: 0.7, weak: 0.45 },
      { ms: 300, strong: 0.6, weak: 0.4 },
    ],
    // Clutch drop: launch kick, pull, a short gap for the shift, second gear kicks in,
    // then the acceleration fades as the car drives off
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
    // Power-down whoosh: the deep rumble drains away into a thin buzz
    shrink: [
      ...ITEM_BOX_POP,
      { ms: 60, strong: 0.6, weak: 0.15 },
      { ms: 60, strong: 0.4, weak: 0.3 },
      { ms: 60, strong: 0.2, weak: 0.45 },
      { ms: 60, strong: 0.08, weak: 0.5 },
      { ms: 80, weak: 0.25 },
    ],
    // Power-up: builds from a hum to a big boom
    grow: [
      ...ITEM_BOX_POP,
      { ms: 60, strong: 0.1, weak: 0.25 },
      { ms: 60, strong: 0.25, weak: 0.3 },
      { ms: 60, strong: 0.45, weak: 0.3 },
      { ms: 60, strong: 0.65, weak: 0.2 },
      { ms: 120, strong: 1, weak: 0.4 },
      { ms: 80, strong: 0.3 },
    ],
    // Two electric zaps, then the bubble hums and settles around you
    shield: [
      ...ITEM_BOX_POP,
      { ms: 30, weak: 0.9 },
      { ms: 30 },
      { ms: 30, weak: 0.9 },
      { ms: 40 },
      { ms: 150, strong: 0.25, weak: 0.3 },
      { ms: 100, strong: 0.12, weak: 0.15 },
    ],
    // Just the pop: the 'dizzy' hold (rumble.js) runs for as long as the wobble lasts
    nausea: [...ITEM_BOX_POP],
    // Clacks being pulled in faster and faster, then a snap
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
  // Hard impact on both motors, then a deep rumble that dies away
  crash: [
    { ms: 70, strong: 1, weak: 1 },
    { ms: 110, strong: 0.8, weak: 0.35 },
    { ms: 150, strong: 0.5, weak: 0.12 },
    { ms: 200, strong: 0.22, weak: 0 },
  ],
  // Same shape, lighter and shorter: you survived
  extraLifeHit: [
    { ms: 50, strong: 0.75, weak: 0.8 },
    { ms: 90, strong: 0.4, weak: 0.15 },
    { ms: 110, strong: 0.15, weak: 0 },
  ],
  // "Ka-ching": two quick high ticks, the second one brighter
  coin: [{ ms: 25, strong: 0.05, weak: 0.45 }, { ms: 40 }, { ms: 35, strong: 0.1, weak: 0.75 }],
};

// Pickups that still vibrate on the 'reduced' setting (see rumbleEffect)
const REDUCED_EFFECTS = new Set(['heart', 'coinMultiplier']);

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

// Keyboard keys that belong to Player 2 (arrows, numpad shop keys); every other key
// counts as Player 1's
const PLAYER_2_KEY_CODES = new Set(
  ['UP', 'DOWN', 'LEFT', 'RIGHT', 'NUMPAD_ONE', 'NUMPAD_TWO', 'NUMPAD_THREE'].map(
    (name) => Phaser.Input.Keyboard.KeyCodes[name],
  ),
);

export default class InputManager {
  constructor(scene) {
    this.scene = scene;
    // Track previous frame states for edge-triggering buttons
    this.previousButtonP1 = new Array(BUTTON_COUNT).fill(false);
    this.previousButtonP2 = new Array(BUTTON_COUNT).fill(false);
    this.previousSpace = false;
    this.hasUpdated = false;
    // Pad flags from the last frame, to notice newly pressed input (see update())
    this.previousPadFlags = { 1: [], 2: [] };
    // Last device per player in a race ('pad' | 'keyboard'), so one player switching to
    // the keyboard doesn't depend on what the other player does
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

    // Keyboard and mouse switch the last input away from the gamepad
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

  // True while a gamepad or Joy-Con was the last input (not keyboard / mouse)
  // True while `player`'s last input was their controller (per player, for the race HUD)
  playerUsingPad(player) {
    return this.lastDevice?.[player] === 'pad';
  }

  get usingGamepad() {
    return this.lastInput === 'gamepad' || this.lastInput === 'joycon';
  }

  // Short buzz on Player 1's controller only (just their Joy-Con when two are merged).
  // Skipped while keyboard / mouse was the last input.
  rumbleP1(durationMs = 3, magnitude = 0.4) {
    if (this.usingGamepad) {
      rumble.play(1, [{ ms: durationMs, strong: magnitude, weak: magnitude }]);
    }
  }

  // Clicking any menu button: the same clicky "click-clack" as typing on the name input's
  // keyboard, on Player 1's controller. Only while a controller is in use.
  rumbleClick() {
    if (this.usingGamepad) this.rumblePlayer(1, RUMBLE_PATTERNS.keyboard.type);
  }

  // Crash on the crashed player's own controller (1 or 2): a big hit when the car is
  // destroyed, a lighter one when an extra life saves it.
  // Crashes are highlights: they still vibrate on the 'reduced' setting.
  rumbleCrash(player, destroyed) {
    const pattern = destroyed ? RUMBLE_PATTERNS.crash : RUMBLE_PATTERNS.extraLifeHit;
    this.rumblePlayer(player, pattern, true);
  }

  // Coin pickup on the collecting player's controller.
  rumbleCoin(player) {
    this.rumblePlayer(player, RUMBLE_PATTERNS.coin);
  }

  // Hitting a duck.
  rumbleDuck(player) {
    this.rumblePlayer(player, RUMBLE_PATTERNS.duck);
  }

  // Name input's virtual keyboard on the typing player's controller: 'move', 'wrap',
  // 'type', 'delete', 'denied', 'enter' or 'yourTurn'. Only while a controller is in use.
  rumbleKeyboard(player, effect) {
    const pattern = RUMBLE_PATTERNS.keyboard[effect];
    if (pattern && this.usingGamepad) this.rumblePlayer(player, pattern);
  }

  // Back to the menu (every screen's back action): the "rewind" on Player 1's controller,
  // who controls the menus. Only while a controller is in use.
  rumbleBack() {
    if (this.usingGamepad) this.rumblePlayer(1, RUMBLE_PATTERNS.back);
  }

  // Pickups and road hazards: 'heart', 'coinMultiplier' or 'oil'. The heart and the 2x
  // star are highlights that still play on the 'reduced' setting; the long oil slide isn't.
  rumbleEffect(player, name) {
    const pattern = RUMBLE_PATTERNS[name];
    if (pattern) this.rumblePlayer(player, pattern, REDUCED_EFFECTS.has(name));
  }

  // Opening an item box: a unique feel per item ('shrink', 'grow', 'shield', 'nausea', 'magnet').
  // Getting an item (from a box, or bought in the shop with `fromBox: false`, which skips
  // the box's opening pop). Items are highlights: they still play on the 'reduced' setting.
  rumbleItem(player, item, { fromBox = true } = {}) {
    const pattern = RUMBLE_PATTERNS.items[item];
    if (!pattern) return;
    this.rumblePlayer(player, fromBox ? pattern : pattern.slice(ITEM_BOX_POP.length), true);
  }

  // Start countdown on `player`'s controller: step is 3, 2, 1 or 'go'.
  // The GO launch is a highlight: it still plays on the 'reduced' setting.
  rumbleCountdown(player, step) {
    const pattern = RUMBLE_PATTERNS.countdown[step];
    if (pattern) this.rumblePlayer(player, pattern, step === 'go');
  }

  // Continuous effects ('scrape', 'dizzy', 'idle'); call every frame while they last.
  rumbleHold(player, kind) {
    rumble.hold(player, kind);
  }

  // Plays a pattern (see RUMBLE_PATTERNS) on one player's own controller, whatever the
  // last input was. `essential` patterns still play on the 'reduced' vibration setting.
  rumblePlayer(player, pattern, essential = false) {
    rumble.play(player, pattern, essential);
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
    rumble.update(pads); // sends this frame's mixed vibration to the controllers
    const padP1 = readPad(pads.player1);
    const padP2 = readPad(pads.player2);

    // A pad counts as used only when something is newly pressed or pushed, so a stick
    // that rests slightly off-centre (Joy-Con drift) can't keep overriding the keyboard
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
