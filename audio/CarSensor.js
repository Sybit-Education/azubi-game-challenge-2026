const FAST_BEEP_MS = 140;
const SLOW_BEEP_MS = 900;
const WARNING_SECONDS = 4;
const REACTION_SECONDS = 2;

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function isLiveCar(car) {
  if (!car || !car.active || car.dead) return false;
  return Boolean(car.body && car.body.enable);
}

function getVelocity(car) {
  let y = car.body.velocity?.y ?? 0;

  // Enemy cars use their own speed property; player cars use Phaser physics.
  if (Number.isFinite(car.speed)) y = car.speed;

  return { x: car.body.velocity?.x ?? 0, y };
}

// Time window during which the cars would overlap on one axis.
// A collision requires the overlap windows for both X and Y to coincide.
function getOverlapTime(playerMin, playerMax, otherMin, otherMax, relativeSpeed) {
  if (relativeSpeed === 0) {
    const separated = otherMax < playerMin || otherMin > playerMax;
    if (separated) return null;

    // With no relative movement, existing overlap continues indefinitely.
    return { start: -Infinity, end: Infinity };
  }

  const firstContact = (playerMin - otherMax) / relativeSpeed;
  const lastContact = (playerMax - otherMin) / relativeSpeed;

  // Negative velocity reverses the order of the contact times.
  return {
    start: Math.min(firstContact, lastContact),
    end: Math.max(firstContact, lastContact),
  };
}

export function collisionTime(player, other) {
  const playerBody = player.body;
  const otherBody = other.body;
  const playerVelocity = getVelocity(player);
  const otherVelocity = getVelocity(other);

  // Relative velocity: how does the other car move from the player's perspective?
  const speedX = otherVelocity.x - playerVelocity.x;
  const speedY = otherVelocity.y - playerVelocity.y;
  const horizontal = getOverlapTime(
    playerBody.left,
    playerBody.right,
    otherBody.left,
    otherBody.right,
    speedX,
  );
  const vertical = getOverlapTime(
    playerBody.top,
    playerBody.bottom,
    otherBody.top,
    otherBody.bottom,
    speedY,
  );

  if (!horizontal || !vertical) return Infinity;

  const collisionStart = Math.max(horizontal.start, vertical.start, 0);
  const collisionEnd = Math.min(horizontal.end, vertical.end);
  if (collisionStart > collisionEnd) return Infinity;

  return collisionStart;
}

export function nextCollision(player, cars) {
  if (!isLiveCar(player)) return null;

  let next = null;
  for (const car of cars) {
    if (car === player || !isLiveCar(car)) continue;

    const seconds = collisionTime(player, car);
    if (!Number.isFinite(seconds)) continue;
    if (!next || seconds < next.seconds) next = { car, seconds };
  }
  return next;
}

export function carDistance(player, other) {
  // Measure the gap between car edges. Overlapping areas have a gap of zero.
  const playerBody = player.body;
  const otherBody = other.body;
  const gapX = Math.max(playerBody.left - otherBody.right, otherBody.left - playerBody.right, 0);
  const gapY = Math.max(playerBody.top - otherBody.bottom, otherBody.top - playerBody.bottom, 0);
  return Math.hypot(gapX, gapY);
}

export function nearestCar(player, cars) {
  if (!isLiveCar(player)) return null;

  let nearest = null;
  for (const car of cars) {
    if (car === player || !isLiveCar(car)) continue;

    const distance = carDistance(player, car);
    if (!nearest || distance < nearest.distance) nearest = { car, distance };
  }
  return nearest;
}

export default class CarSensor {
  constructor(scene, player, detune = 0) {
    this.scene = scene;
    this.player = player;
    this.sinceLastBeep = Infinity; // Allow the first beep to play immediately.
    this.urgent = false;
    this.sound = scene.sound.add('car-sensor', { volume: 0.18, detune });
    scene.events.once('shutdown', () => this.sound.destroy());
  }

  getWarning(cars) {
    const accessibilityEnabled = this.scene.registry.get('accessibility enabled') ?? false;

    if (accessibilityEnabled) {
      const prediction = nextCollision(this.player, cars);
      if (prediction && prediction.seconds <= WARNING_SECONDS) {
        // Beeping speeds up between four and two seconds before a predicted collision.
        // From two seconds onward, use the fastest interval to allow time to steer away.
        const progress = clamp(
          (prediction.seconds - REACTION_SECONDS) / (WARNING_SECONDS - REACTION_SECONDS),
          0,
          1,
        );
        return {
          car: prediction.car,
          interval: FAST_BEEP_MS + (SLOW_BEEP_MS - FAST_BEEP_MS) * progress,
          urgent: prediction.seconds <= REACTION_SECONDS,
        };
      }
    }

    const nearest = nearestCar(this.player, cars);
    const range = this.scene.scale.height * 0.3;
    if (!nearest || nearest.distance >= range) return null;

    return {
      car: nearest.car,
      interval: FAST_BEEP_MS + (SLOW_BEEP_MS - FAST_BEEP_MS) * (nearest.distance / range),
      urgent: false,
    };
  }

  stop() {
    if (this.sound.isPlaying) this.sound.stop();
    this.sinceLastBeep = Infinity;
    this.urgent = false;
  }

  update(delta, cars) {
    const warning = this.getWarning(cars);
    if (!warning) {
      this.stop();
      return;
    }

    // When a warning becomes urgent, do not wait for the previous slow interval.
    if (warning.urgent && !this.urgent) this.sinceLastBeep = Infinity;
    this.urgent = warning.urgent;
    this.sinceLastBeep += delta;

    if (this.scene.sound.locked || this.sound.isPlaying) return;
    if (this.sinceLastBeep < warning.interval) return;

    // pan: -1 = left, 0 = center, 1 = right.
    const roadHalfWidth = this.scene.track1.displayWidth / 2;
    const pan = clamp((warning.car.x - this.player.x) / roadHalfWidth, -1, 1);
    if (this.sound.play({ pan })) this.sinceLastBeep = 0;
  }
}
