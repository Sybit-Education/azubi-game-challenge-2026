const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const isLiveCar = (car) => car?.active && !car.dead && car.body?.enable;

// Other cars move down the road using `speed`; players use Arcade velocity.
const velocity = (car) => ({
  x: car.body.velocity?.x ?? 0,
  y: Number.isFinite(car.speed) ? car.speed : (car.body.velocity?.y ?? 0),
});

function axisContact(aMin, aMax, bMin, bMax, speed) {
  if (speed === 0) {
    return bMax < aMin || bMin > aMax ? null : [-Infinity, Infinity];
  }
  const first = (aMin - bMax) / speed;
  const last = (aMax - bMin) / speed;
  return [Math.min(first, last), Math.max(first, last)];
}

// Estimated seconds until both collision bodies overlap at their current speeds.
// A car in an adjacent lane is only a collision risk if its movement crosses ours.
export function collisionTime(player, other) {
  const a = player.body;
  const b = other.body;
  const playerVelocity = velocity(player);
  const otherVelocity = velocity(other);
  const x = axisContact(a.left, a.right, b.left, b.right, otherVelocity.x - playerVelocity.x);
  const y = axisContact(a.top, a.bottom, b.top, b.bottom, otherVelocity.y - playerVelocity.y);
  if (!x || !y) return Infinity;
  const entry = Math.max(x[0], y[0], 0);
  const exit = Math.min(x[1], y[1]);
  return entry <= exit ? entry : Infinity;
}

export function nextCollision(player, cars) {
  if (!isLiveCar(player)) return null;
  let next = null;
  for (const car of cars) {
    if (car === player || !isLiveCar(car)) continue;
    const seconds = collisionTime(player, car);
    if (Number.isFinite(seconds) && (!next || seconds < next.seconds)) {
      next = { car, seconds };
    }
  }
  return next;
}

// Measure the gap between collision bodies rather than the cars' center points.
export function carDistance(first, second) {
  const a = first.body;
  const b = second.body;
  const gapX = Math.max(a.left - b.right, b.left - a.right, 0);
  const gapY = Math.max(a.top - b.bottom, b.top - a.bottom, 0);
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
    this.sinceLastBeep = Infinity;
    this.urgent = false;
    this.sound = scene.sound.add('car-sensor', { volume: 0.18, detune });
    scene.events.once('shutdown', () => this.sound.destroy());
  }

  update(delta, cars) {
    const nearest = nearestCar(this.player, cars);
    const range = this.scene.scale.height * 0.3;
    const accessibilityEnabled = this.scene.registry.get('accessibility enabled') ?? false;
    const prediction = accessibilityEnabled ? nextCollision(this.player, cars) : null;
    // Warn up to four seconds ahead; use the fastest beeps from two seconds ahead.
    const approaching = prediction && prediction.seconds <= 4;

    if (!approaching && (!nearest || nearest.distance >= range)) {
      if (this.sound.isPlaying) this.sound.stop();
      this.sinceLastBeep = Infinity;
      this.urgent = false;
      return;
    }

    // Begin immediately on entering the sensor range, then adapt the interval.
    // At 1200px screen height: 360px range; 140–900ms between beep starts.
    const urgent = approaching && prediction.seconds <= 2;
    const interval = approaching
      ? 140 + 760 * clamp((prediction.seconds - 2) / 2, 0, 1)
      : 140 + 760 * clamp(nearest.distance / range, 0, 1);
    if (urgent && !this.urgent) this.sinceLastBeep = Infinity;
    this.urgent = Boolean(urgent);
    this.sinceLastBeep += delta;

    if (this.scene.sound.locked || this.sound.isPlaying || this.sinceLastBeep < interval) {
      return;
    }

    const roadHalfWidth = this.scene.track1.displayWidth / 2;
    const target = approaching ? prediction.car : nearest.car;
    const pan = clamp((target.x - this.player.x) / roadHalfWidth, -1, 1);
    if (this.sound.play({ pan })) this.sinceLastBeep = 0;
  }
}
