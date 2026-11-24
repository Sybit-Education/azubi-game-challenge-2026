// Turns the browser's raw gamepad list into one virtual pad per player.
//
// A virtual pad has the shape:
//   { axes: [x, y], buttons: [4 action slots], shoulders: [SL, SR], joyCon,
//     dpad: { up, down, left, right } }
// `buttons` are the game's four action slots. For regular gamepads they follow
// the W3C standard face-button positions (0 = bottom, 1 = right, 2 = left, 3 = top).
// For a sideways Joy-Con, slots 1 and 2 are swapped so the right button (X on the
// right Joy-Con) is slot 2, the game's confirm button:
//   0 = bottom, 1 = left, 2 = right (confirm), 3 = top (back).
//
// Joy-Con handling (Chromium):
// - When both Joy-Cons are connected, Chrome merges them into a single
//   "Joy-Con L+R" gamepad held upright. We split it again: the right half is
//   Player 1 and the left half is Player 2, each held sideways (SL/SR on top,
//   stick on the left, face buttons / D-pad on the right).
// - A single Joy-Con is already remapped by Chrome for sideways use, so it is
//   read like a standard gamepad. A right Joy-Con is always Player 1.

const STANDARD_DPAD = { up: 12, down: 13, left: 14, right: 15 };
const NO_DPAD = { up: false, down: false, left: false, right: false };

// Sideways right Joy-Con (rotated clockwise): A bottom, B left, X right, Y top.
// Standard indexes in the merged pad: 0 = B, 1 = A, 2 = Y, 3 = X.
// Slots: A, B, X (confirm), Y (back).
const COMBINED_RIGHT_FACE_BUTTONS = [1, 0, 3, 2];
// Sideways left Joy-Con (rotated counter-clockwise): D-pad left is bottom,
// up is left, down is right (confirm), right is top (back).
const COMBINED_LEFT_FACE_BUTTONS = [
  STANDARD_DPAD.left,
  STANDARD_DPAD.up,
  STANDARD_DPAD.down,
  STANDARD_DPAD.right,
];
// A single Joy-Con is already remapped by Chrome to standard positions;
// swap left/right so its right button confirms too.
const SINGLE_JOYCON_FACE_BUTTONS = [0, 2, 1, 3];
const STANDARD_FACE_BUTTONS = [0, 1, 2, 3];

// Shoulder buttons [SL, SR]. In the merged pad they have their own indexes;
// a single Joy-Con (and any standard pad) reports them as L1/R1.
const COMBINED_RIGHT_SHOULDERS = [20, 21];
const COMBINED_LEFT_SHOULDERS = [18, 19];
const STANDARD_SHOULDERS = [4, 5];

// Stick handling: below the deadzone nothing is pressed. Above it, a direction
// only counts when the stick points far enough toward it, so pushing forward
// slightly crooked does not change lanes, while real diagonals still do both.
const STICK_DEADZONE = 0.3;
// Steering needs a clear sideways push: at least half way out to the side...
const STEER_DEADZONE = 0.5;
// ...and the stick at least 50° away from straight up/down.
const MIN_HORIZONTAL_SHARE = Math.sin((50 * Math.PI) / 180);
// Gas/brake needs the stick at least 30° away from straight left/right.
const MIN_VERTICAL_SHARE = Math.sin((30 * Math.PI) / 180);

export function stickDirections(x, y) {
  const magnitude = Math.hypot(x, y);
  if (!(magnitude >= STICK_DEADZONE)) {
    return { left: false, right: false, up: false, down: false };
  }
  const horizontal =
    Math.abs(x) >= STEER_DEADZONE && Math.abs(x) >= magnitude * MIN_HORIZONTAL_SHARE;
  const vertical = Math.abs(y) >= magnitude * MIN_VERTICAL_SHARE;
  return {
    left: horizontal && x < 0,
    right: horizontal && x > 0,
    up: vertical && y < 0,
    down: vertical && y > 0,
  };
}

function isJoyCon(gamepad) {
  return /joy[\s-]?con/i.test(gamepad?.id ?? '');
}

function isCombinedJoyCon(gamepad) {
  const id = gamepad?.id ?? '';
  return isJoyCon(gamepad) && (/L\s*\+\s*R/i.test(id) || /Product:\s*200e/i.test(id));
}

function isRightJoyCon(gamepad) {
  const id = gamepad?.id ?? '';
  return (
    isJoyCon(gamepad) && !isCombinedJoyCon(gamepad) && /\(R\)|Product:\s*2007|-2007-/i.test(id)
  );
}

function isLeftJoyCon(gamepad) {
  const id = gamepad?.id ?? '';
  return (
    isJoyCon(gamepad) && !isCombinedJoyCon(gamepad) && /\(L\)|Product:\s*2006|-2006-/i.test(id)
  );
}

function axis(gamepad, index) {
  const value = gamepad?.axes?.[index];
  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

function negate(value) {
  return value === 0 ? 0 : -value;
}

function pressed(gamepad, index) {
  const button = gamepad?.buttons?.[index];
  if (typeof button === 'number') return button > 0.5;
  return Boolean(button?.pressed);
}

function standardPad(gamepad) {
  if (!gamepad) return null;
  const faceButtons = isJoyCon(gamepad) ? SINGLE_JOYCON_FACE_BUTTONS : STANDARD_FACE_BUTTONS;
  return {
    axes: [axis(gamepad, 0), axis(gamepad, 1)],
    buttons: faceButtons.map((index) => pressed(gamepad, index)),
    shoulders: STANDARD_SHOULDERS.map((index) => pressed(gamepad, index)),
    joyCon: isJoyCon(gamepad),
    dpad: {
      up: pressed(gamepad, STANDARD_DPAD.up),
      down: pressed(gamepad, STANDARD_DPAD.down),
      left: pressed(gamepad, STANDARD_DPAD.left),
      right: pressed(gamepad, STANDARD_DPAD.right),
    },
  };
}

// Right half of a merged pad, held sideways. Its stick is axes 2/3; rotating it
// clockwise means "up" is the stick's original left and "right" its original up.
function combinedRightPad(gamepad) {
  return {
    axes: [negate(axis(gamepad, 3)), axis(gamepad, 2)],
    buttons: COMBINED_RIGHT_FACE_BUTTONS.map((index) => pressed(gamepad, index)),
    shoulders: COMBINED_RIGHT_SHOULDERS.map((index) => pressed(gamepad, index)),
    joyCon: true,
    dpad: { ...NO_DPAD },
  };
}

// Left half of a merged pad, held sideways. Its stick is axes 0/1; rotating it
// counter-clockwise means "up" is the stick's original right and "right" its original down.
function combinedLeftPad(gamepad) {
  return {
    axes: [axis(gamepad, 1), negate(axis(gamepad, 0))],
    buttons: COMBINED_LEFT_FACE_BUTTONS.map((index) => pressed(gamepad, index)),
    shoulders: COMBINED_LEFT_SHOULDERS.map((index) => pressed(gamepad, index)),
    joyCon: true,
    dpad: { ...NO_DPAD },
  };
}

function padPriority(gamepad) {
  if (isRightJoyCon(gamepad)) return 0;
  if (isLeftJoyCon(gamepad)) return 2;
  return 1;
}

export function getPlayerPads(gamepads) {
  const connectedPads = Array.from(gamepads ?? []).filter(
    (gamepad) => gamepad && gamepad.connected !== false,
  );

  const combined = connectedPads.find(isCombinedJoyCon);
  if (combined) {
    return { player1: combinedRightPad(combined), player2: combinedLeftPad(combined) };
  }

  // Right Joy-Con first, left Joy-Con last, everything else keeps browser order.
  const ordered = connectedPads
    .map((gamepad, order) => ({ gamepad, order }))
    .sort((a, b) => padPriority(a.gamepad) - padPriority(b.gamepad) || a.order - b.order)
    .map(({ gamepad }) => gamepad);

  return { player1: standardPad(ordered[0]), player2: standardPad(ordered[1]) };
}
