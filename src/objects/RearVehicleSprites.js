export const REAR_WIDTH = 216;
export const REAR_HEIGHT = 200;
// Rendered rear-view height relative to its width; used to size hitboxes to the drawn footprint.
export const REAR_ASPECT = REAR_HEIGHT / REAR_WIDTH;
const OUTLINE = '#0d1020';
const TIRE = '#15161a';
const GLASS = '#23252d';
const TAIL_LIGHT = '#e8402a';
const TAIL_GLOW = '#ffb347';

const REAR_PALETTES = {
  'rear-car': '#2d4fe6',
  'rear-car2': '#9b1fe0',
  'rear-enemy-car1': '#5fd6c0',
  'rear-enemy-car2': '#e8454a',
  'rear-enemy-car3': '#d9d2cf',
};

const PLAYER_REAR_KEYS = new Set(['rear-car', 'rear-car2']);

// Maps top-down texture keys to their rear-view counterpart.
export const REAR_VEHICLE_KEYS = {
  car: 'rear-car',
  carShield: 'rear-car',
  car2: 'rear-car2',
  carShield2: 'rear-car2',
  'enemy-car1': 'rear-enemy-car1',
  'enemy-car2': 'rear-enemy-car2',
  'enemy-car3': 'rear-enemy-car3',
};

function shade(hex, amount) {
  const value = Number.parseInt(hex.slice(1), 16);
  const target = amount < 0 ? 0 : 255;
  const channel = (shift) => {
    const current = (value >> shift) & 0xff;
    return Math.round(current + (target - current) * Math.abs(amount));
  };
  return `rgb(${channel(16)}, ${channel(8)}, ${channel(0)})`;
}

function fillRoundedRect(ctx, x, y, width, height, radius, fill, outlined = true) {
  ctx.beginPath();
  ctx.roundRect(x, y, width, height, radius);
  ctx.fillStyle = fill;
  ctx.fill();
  if (outlined) {
    ctx.lineWidth = 3;
    ctx.strokeStyle = OUTLINE;
    ctx.stroke();
  }
}

// Region of the top-down player skin that contains the white Sybit "S" on the roof.
const LOGO_CROP = { x: 60, y: 160, width: 96, height: 112 };

// Returns the white logo as a transparent canvas, or null if it cannot be found.
function extractLogo(source) {
  const { x, y, width, height } = LOGO_CROP;
  const scan = document.createElement('canvas');
  scan.width = width;
  scan.height = height;
  const scanContext = scan.getContext('2d', { willReadFrequently: true });
  scanContext.drawImage(source, x, y, width, height, 0, 0, width, height);

  const image = scanContext.getImageData(0, 0, width, height);
  const pixels = image.data;
  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;
  for (let index = 0; index < pixels.length; index += 4) {
    const luminance = (pixels[index] + pixels[index + 1] + pixels[index + 2]) / 3;
    const alpha = Math.min(1, Math.max(0, (luminance - 130) / 70));
    pixels[index] = 255;
    pixels[index + 1] = 255;
    pixels[index + 2] = 255;
    pixels[index + 3] = alpha * 255;
    if (alpha > 0) {
      const pixel = index / 4;
      const px = pixel % width;
      const py = Math.floor(pixel / width);
      minX = Math.min(minX, px);
      minY = Math.min(minY, py);
      maxX = Math.max(maxX, px);
      maxY = Math.max(maxY, py);
    }
  }
  if (maxX < 0) return null;

  scanContext.putImageData(image, 0, 0);
  const logoWidth = maxX - minX + 1;
  const logoHeight = maxY - minY + 1;
  const logo = document.createElement('canvas');
  logo.width = logoWidth;
  logo.height = logoHeight;
  logo
    .getContext('2d')
    .drawImage(scan, minX, minY, logoWidth, logoHeight, 0, 0, logoWidth, logoHeight);
  return logo;
}

// Rear face narrows when the car is seen at an angle.
const TURN_BODY_SQUASH = 0.72;

// Flank shows on the side opposite the steer direction.
function paintSideFlank(ctx, body, turn) {
  ctx.save();
  if (turn > 0) {
    ctx.translate(REAR_WIDTH, 0);
    ctx.scale(-1, 1);
  }
  fillRoundedRect(ctx, 188, 112, 22, 66, 8, TIRE);
  ctx.beginPath();
  ctx.moveTo(148, 58);
  ctx.lineTo(206, 72);
  ctx.lineTo(206, 164);
  ctx.lineTo(148, 186);
  ctx.closePath();
  ctx.fillStyle = shade(body, -0.45);
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = OUTLINE;
  ctx.stroke();
  ctx.restore();
}

function paintRearVehicle(ctx, body, logo, turn = 0) {
  ctx.clearRect(0, 0, REAR_WIDTH, REAR_HEIGHT);

  ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
  ctx.beginPath();
  ctx.ellipse(108, 190, 80, 7, 0, 0, Math.PI * 2);
  ctx.fill();

  if (turn) {
    paintSideFlank(ctx, body, turn);
  } else {
    fillRoundedRect(ctx, 22, 118, 16, 56, 6, TIRE);
    fillRoundedRect(ctx, 178, 118, 16, 56, 6, TIRE);
  }

  ctx.save();
  if (turn) {
    ctx.translate(108, 0);
    ctx.scale(TURN_BODY_SQUASH, 1);
    ctx.translate(-108, 0);
  }

  const bodyGradient = ctx.createLinearGradient(36, 0, 180, 0);
  bodyGradient.addColorStop(0, shade(body, -0.3));
  bodyGradient.addColorStop(0.5, body);
  bodyGradient.addColorStop(1, shade(body, -0.3));
  fillRoundedRect(ctx, 36, 60, 144, 124, 40, bodyGradient);

  fillRoundedRect(ctx, 30, 86, 156, 10, 5, shade(body, -0.5));

  fillRoundedRect(ctx, 62, 18, 92, 70, 30, shade(body, -0.15));
  fillRoundedRect(ctx, 72, 32, 72, 42, 14, GLASS);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.18)';
  ctx.beginPath();
  ctx.moveTo(82, 66);
  ctx.lineTo(100, 36);
  ctx.lineTo(110, 36);
  ctx.lineTo(92, 66);
  ctx.closePath();
  ctx.fill();

  if (logo) {
    const logoHeight = 38;
    const logoWidth = (logo.width * logoHeight) / logo.height;
    ctx.drawImage(logo, 108 - logoWidth / 2, 100, logoWidth, logoHeight);
  }

  fillRoundedRect(ctx, 44, 110, 36, 14, 6, TAIL_LIGHT);
  fillRoundedRect(ctx, 136, 110, 36, 14, 6, TAIL_LIGHT);
  ctx.fillStyle = TAIL_GLOW;
  ctx.fillRect(50, 113, 22, 4);
  ctx.fillRect(144, 113, 22, 4);

  fillRoundedRect(ctx, 90, 142, 36, 12, 3, '#e9e9ec');

  fillRoundedRect(ctx, 34, 160, 148, 22, 10, shade(body, -0.6));
  for (const x of [70, 146]) {
    ctx.beginPath();
    ctx.arc(x, 172, 6, 0, Math.PI * 2);
    ctx.fillStyle = '#8a8f9a';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = OUTLINE;
    ctx.stroke();
  }
  ctx.restore();
}

// Texture key of the side view shown while the car steers left (lean < 0) or right (lean > 0).
export function rearTurnKey(key, lean) {
  return `${key}-turn-${lean < 0 ? 'left' : 'right'}`;
}

const TREAD_SPACING = 8;
const TREAD_COLOR = '#4a4e5a';
const REAR_WHEELS = [
  [22, 118, 14, 56],
  [180, 118, 14, 56],
];
const SIDE_WHEELS = {
  left: [6, 112, 22, 66],
  right: [188, 112, 22, 66],
};

// Draws the tread grooves on the visible wheels in sprite space; roll is in texels.
export function drawWheelTread(ctx, turn, roll) {
  const wheels = turn ? [turn < 0 ? SIDE_WHEELS.right : SIDE_WHEELS.left] : REAR_WHEELS;
  const offset = ((roll % TREAD_SPACING) + TREAD_SPACING) % TREAD_SPACING;
  ctx.fillStyle = TREAD_COLOR;
  for (const [x, y, width, height] of wheels) {
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(x, y, width, height, 6);
    ctx.clip();
    for (let lineY = y - TREAD_SPACING + offset; lineY < y + height; lineY += TREAD_SPACING) {
      ctx.fillRect(x, lineY, width, 2);
    }
    ctx.restore();
  }
}

function paintRearTexture(textures, key, body, logo, turn) {
  const texture = textures.createCanvas(key, REAR_WIDTH, REAR_HEIGHT);
  paintRearVehicle(texture.getContext(), body, logo, turn);
  texture.refresh();
}

export function createRearVehicleTextures(textures) {
  const logo = extractLogo(textures.get('car').getSourceImage());
  for (const [key, body] of Object.entries(REAR_PALETTES)) {
    const isPlayer = PLAYER_REAR_KEYS.has(key);
    if (!textures.exists(key)) {
      paintRearTexture(textures, key, body, isPlayer ? logo : null, 0);
    }
    if (!isPlayer) continue;
    for (const lean of [-1, 1]) {
      const turnKey = rearTurnKey(key, lean);
      if (!textures.exists(turnKey)) paintRearTexture(textures, turnKey, body, logo, lean);
    }
  }
}
