const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const isLiveCar = (car) => car?.active && !car.dead && car.body?.enable;
// Each recording has its own approach length so its loudest part matches the pass.
export const PASS_BY_VARIANTS = [
  { key: 'car-pass-by', approachSeconds: 2 },
  { key: 'car-pass-by-johnnyfarmer', approachSeconds: 1.775 },
  { key: 'car-pass-by-961-studios', approachSeconds: 1.425 },
];
const velocity = (car) => ({
  x: car.body.velocity?.x ?? 0,
  y: Number.isFinite(car.speed) ? car.speed : (car.body.velocity?.y ?? 0),
});

export function timeUntilPass(player, other) {
  const speed = velocity(other).y - velocity(player).y;
  if (speed === 0) return Infinity;
  const seconds = -(other.y - player.y) / speed;
  return seconds >= 0 ? seconds : Infinity;
}

export default class CarPassBy {
  constructor(scene, players) {
    this.scene = scene;
    this.players = players;
    this.history = new Map(players.map((player) => [player, new Map()]));
    this.playing = new Set();
    this.variants = new WeakMap();
    this.lastVariant = null;
    scene.events.once('shutdown', () => this.destroy());
  }

  update(cars) {
    const currentCars = new Set(cars.filter(isLiveCar));

    for (const player of this.players) {
      const history = this.history.get(player);
      if (!isLiveCar(player)) {
        history.clear();
        continue;
      }

      for (const car of history.keys()) {
        if (!currentCars.has(car)) history.delete(car);
      }

      for (const car of currentCars) {
        if (car === player) continue;
        const x = car.x - player.x;
        const y = car.y - player.y;
        const previous = history.get(car);
        const variant = this.variantFor(car);
        const state = { x, y, started: previous?.started ?? false };
        history.set(car, state);
        if (state.started) continue;

        const crossed = previous && ((previous.y < 0 && y >= 0) || (previous.y > 0 && y <= 0));
        const seconds = crossed ? 0 : timeUntilPass(player, car);
        if (seconds > variant.approachSeconds || (!crossed && seconds === 0)) continue;

        // Predict the side at the upcoming pass; interpolate if a fast car
        // already crossed the player's position between two updates.
        const fraction = crossed ? -previous.y / (y - previous.y) : 0;
        const crossingX = crossed
          ? previous.x + fraction * (x - previous.x)
          : x + (velocity(car).x - velocity(player).x) * seconds;
        const carHalfWidths = (player.body.width + car.body.width) / 2;
        const hearingRange = this.scene.track1.displayWidth;
        if (Math.abs(crossingX) <= carHalfWidths || Math.abs(crossingX) >= hearingRange) {
          continue;
        }

        // Two player cars passing each other represent one audible encounter.
        if (this.history.get(car)?.get(player)?.started) {
          state.started = true;
          continue;
        }
        if (this.play(player, car, seconds, variant)) state.started = true;
      }
    }

    for (const entry of [...this.playing]) {
      if (!isLiveCar(entry.player) || !isLiveCar(entry.car)) {
        this.remove(entry);
        continue;
      }
      this.position(entry);
    }
  }

  variantFor(car) {
    let variant = this.variants.get(car);
    if (!variant) {
      const choices = PASS_BY_VARIANTS.filter((entry) => entry !== this.lastVariant);
      variant = choices[Math.floor(Math.random() * choices.length)];
      this.variants.set(car, variant);
      this.lastVariant = variant;
    }
    return variant;
  }

  play(player, car, seconds, variant) {
    if (this.scene.sound.locked) return false;
    const sound = this.scene.sound.add(variant.key);
    const entry = {
      player,
      car,
      sound,
      approachDistance: Math.hypot(car.x - player.x, car.y - player.y),
    };
    this.playing.add(entry);
    this.position(entry);
    sound.once('complete', () => this.remove(entry));
    // If detection starts late, skip the corresponding part of the approach
    // so the recording's peak still lines up with the expected pass.
    if (
      !sound.play({ seek: clamp(variant.approachSeconds - seconds, 0, variant.approachSeconds) })
    ) {
      this.remove(entry);
      return false;
    }
    return true;
  }

  position({ player, car, sound, approachDistance }) {
    const roadWidth = this.scene.track1.displayWidth;
    const x = car.x - player.x;
    const distance = Math.hypot(x, car.y - player.y);
    sound.setPan(clamp(x / (roadWidth / 2), -1, 1));
    const hearingRange = Math.max(roadWidth * 1.5, approachDistance * 1.5);
    sound.setVolume(0.35 * clamp(1 - distance / hearingRange, 0, 1));
  }

  remove(entry) {
    if (this.playing.delete(entry)) entry.sound.destroy();
  }

  destroy() {
    for (const entry of [...this.playing]) this.remove(entry);
    this.history.clear();
  }
}
