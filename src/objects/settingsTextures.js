// Settings menu textures drawn in code instead of PNGs with baked-in text, so every label
// and button uses the same font. Each one is drawn at the size of the PNG it replaces
// (same pixel measurements), so the scene scales and positions them exactly as before.

const FONT = 'Tiny5';
const TEXT_COLOR = 'rgba(242, 242, 242, 0.9)'; // the original images' text is 90 % opaque
const TITLE_COLOR = '#f2f2f2';
const INFO_COLOR = 'rgba(242, 242, 242, 0.55)';
const OUTLINE_COLOR = '#dcd9e2';
const SWITCH_ON_FILL = 'rgba(193, 199, 255, 0.5)';

// Pill buttons (game mode, haptic feedback): 804 × 147 with a 3 px outline, the text
// left-aligned and a small triangle on the right
const PILL = { width: 804, height: 147, outline: 3, textLeft: 59, textTop: 51, textHeight: 46 };
const ARROWS = {
  left: [745, 55, 745, 95, 714, 75],
  right: [714, 55, 714, 95, 745, 75],
};
// On/off switch: 321 × 120, "ON" / "OFF" centred where the original text was
const SWITCH = { width: 321, height: 120, outline: 3, textTop: 36, textHeight: 46 };
const SWITCH_TEXT_CENTER = { on: 117, off: 215 };

// Haptic feedback values, also used as the button labels
export const HAPTIC_LABELS = { full: 'FULL', reduced: 'REDUCED', off: 'OFF' };

// Height of capital letters as a fraction of the font size, so text can be drawn with the
// exact letter height of the images it replaces
function capHeightRatio(context) {
  context.font = `100px ${FONT}`;
  return context.measureText('H').actualBoundingBoxAscent / 100 || 0.7;
}

function newCanvas(width, height) {
  const canvas = document.createElement('canvas');
  canvas.width = Math.ceil(width);
  canvas.height = height;
  return canvas;
}

// Draws `text` with capitals `letterHeight` px tall and their top at `top`
function drawText(context, text, x, top, letterHeight, color, align = 'left') {
  context.font = `${letterHeight / capHeightRatio(context)}px ${FONT}`;
  context.fillStyle = color;
  context.textAlign = align;
  context.textBaseline = 'alphabetic';
  context.fillText(text, x, top + letterHeight);
}

function measureText(text, letterHeight) {
  const context = newCanvas(1, 1).getContext('2d');
  context.font = `${letterHeight / capHeightRatio(context)}px ${FONT}`;
  return context.measureText(text).width;
}

function addTexture(scene, key, canvas) {
  if (scene.textures.exists(key)) scene.textures.remove(key);
  scene.textures.addCanvas(key, canvas);
}

// A text label: letters `letterHeight` tall from the top of an `imageHeight` tall texture
function addLabel(scene, key, text, { imageHeight, letterHeight, color = TEXT_COLOR }) {
  const canvas = newCanvas(measureText(text, letterHeight) + 2, imageHeight);
  drawText(canvas.getContext('2d'), text, 0, 0, letterHeight, color);
  addTexture(scene, key, canvas);
}

function roundedOutline(context, width, height, lineWidth) {
  const inset = lineWidth / 2;
  const radius = (height - lineWidth) / 2;
  context.beginPath();
  context.roundRect(inset, inset, width - lineWidth, height - lineWidth, radius);
}

function addPill(scene, key, text, arrow) {
  const canvas = newCanvas(PILL.width, PILL.height);
  const context = canvas.getContext('2d');
  roundedOutline(context, PILL.width, PILL.height, PILL.outline);
  context.lineWidth = PILL.outline;
  context.strokeStyle = OUTLINE_COLOR;
  context.stroke();
  drawText(context, text, PILL.textLeft, PILL.textTop, PILL.textHeight, TEXT_COLOR);
  if (arrow) {
    const [x1, y1, x2, y2, x3, y3] = ARROWS[arrow];
    context.beginPath();
    context.moveTo(x1, y1);
    context.lineTo(x2, y2);
    context.lineTo(x3, y3);
    context.closePath();
    context.fillStyle = OUTLINE_COLOR;
    context.fill();
  }
  addTexture(scene, key, canvas);
}

function addSwitch(scene, key, on) {
  const canvas = newCanvas(SWITCH.width, SWITCH.height);
  const context = canvas.getContext('2d');
  roundedOutline(context, SWITCH.width, SWITCH.height, SWITCH.outline);
  if (on) {
    context.fillStyle = SWITCH_ON_FILL;
    context.fill();
  }
  context.lineWidth = SWITCH.outline;
  context.strokeStyle = OUTLINE_COLOR;
  context.stroke();
  const center = on ? SWITCH_TEXT_CENTER.on : SWITCH_TEXT_CENTER.off;
  drawText(
    context,
    on ? 'ON' : 'OFF',
    center,
    SWITCH.textTop,
    SWITCH.textHeight,
    TEXT_COLOR,
    'center',
  );
  addTexture(scene, key, canvas);
}

/**
 * Creates every settings texture under the keys the scene uses. Needs the Tiny5 font to
 * be loaded (BootScene waits for it).
 */
export function createSettingsTextures(scene) {
  // Title keeps the heavy, fully opaque look of the original
  addLabel(scene, 'settingsLabel', 'SETTINGS', {
    imageHeight: 147,
    letterHeight: 145,
    color: TITLE_COLOR,
  });

  const label = { imageHeight: 70, letterHeight: 69 };
  addLabel(scene, 'accessibilityModeLabel', 'ACCESSIBILITY MODE', label);
  addLabel(scene, 'gameModeLabel', 'GAME MODE', label);
  addLabel(scene, 'hapticFeedbackLabel', 'HAPTIC FEEDBACK', label);
  addLabel(scene, 'hapticFeedbackInfo', 'WORKS WITH NINTENDO JOY-CONS', {
    imageHeight: 46,
    letterHeight: 45,
    color: INFO_COLOR,
  });

  addSwitch(scene, 'switchOn', true);
  addSwitch(scene, 'switchOff', false);

  addPill(scene, 'standardModeButton', 'STANDARD MODE', 'right');
  addPill(scene, 'christmasModeButton', 'CHRISTMAS MODE', 'left');
  for (const [level, text] of Object.entries(HAPTIC_LABELS)) {
    addPill(scene, `hapticButton-${level}`, text, null);
    addPill(scene, `hapticButton-${level}-current`, text, 'left');
  }
}
