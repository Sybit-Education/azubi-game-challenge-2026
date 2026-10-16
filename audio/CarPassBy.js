function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function isLiveCar(car) {
  if (!car || !car.active || car.dead) return false;
  return Boolean(car.body && car.body.enable);
}

function getVelocity(car) {
  let y = car.body.velocity?.y ?? 0;
  if (Number.isFinite(car.speed)) y = car.speed;
  return { x: car.body.velocity?.x ?? 0, y };
}

// Time of the loudest point in each recording, measured from the file start.
export const PASS_BY_VARIANTS = [
  { key: 'car-pass-by', approachSeconds: 2 },
  { key: 'car-pass-by-johnnyfarmer', approachSeconds: 1.775 },
  { key: 'car-pass-by-961-studios', approachSeconds: 1.425 },
];

export function timeUntilPass(player, other) {
  const relativeSpeed = getVelocity(other).y - getVelocity(player).y;
  if (relativeSpeed === 0) return Infinity;

  const distanceY = other.y - player.y;
  const seconds = -distanceY / relativeSpeed;
  // A negative value means the car is already moving away.
  if (seconds < 0) return Infinity;
  return seconds;
}

export default class CarPassBy {
  constructor(scene, players) {
    this.scene = scene;
    this.players = players;
    this.encounters = []; // Each encounter pairs a player car with another car.
    this.playing = []; // Active sounds whose position and volume need updating.
    this.variants = new WeakMap(); // Keep the same sound variant for each car.
    this.lastVariant = null;
    scene.events.once('shutdown', () => this.destroy());
  }

  update(cars) {
    const liveCars = cars.filter(isLiveCar);
    this.encounters = this.encounters.filter(
      (encounter) => liveCars.includes(encounter.player) && liveCars.includes(encounter.car),
    );

    for (const player of this.players) {
      if (!isLiveCar(player)) continue;
      for (const car of liveCars) {
        if (car !== player) this.checkPass(player, car);
      }
    }

    this.updatePlayingSounds();
  }

  getEncounter(player, car) {
    let encounter = this.encounters.find((entry) => entry.player === player && entry.car === car);
    if (!encounter) {
      encounter = {
        player,
        car,
        previousX: car.x - player.x,
        previousY: car.y - player.y,
        started: false,
      };
      this.encounters.push(encounter);
    }
    return encounter;
  }

  checkPass(player, car) {
    const encounter = this.getEncounter(player, car);
    const previousX = encounter.previousX;
    const previousY = encounter.previousY;
    const distanceX = car.x - player.x;
    const distanceY = car.y - player.y;
    encounter.previousX = distanceX;
    encounter.previousY = distanceY;
    const variant = this.variantFor(car);
    if (encounter.started) return;

    // A sign change means the car moved from ahead of the player to behind them
    // (or vice versa). This also detects fast cars passing between two frames.
    const passedNow = (previousY < 0 && distanceY >= 0) || (previousY > 0 && distanceY <= 0);
    let seconds = timeUntilPass(player, car);
    if (passedNow) seconds = 0;
    if (seconds > variant.approachSeconds) return;
    if (seconds === 0 && !passedNow) return;

    let sideAtPass;
    if (passedNow) {
      // What fraction of the last frame occurred before the cars passed?
      const frameFraction = -previousY / (distanceY - previousY);
      sideAtPass = previousX + frameFraction * (distanceX - previousX);
    } else {
      const relativeSpeedX = getVelocity(car).x - getVelocity(player).x;
      sideAtPass = distanceX + relativeSpeedX * seconds;
    }

    const minimumSideDistance = (player.body.width + car.body.width) / 2;
    const hearingRange = this.scene.track1.displayWidth;
    if (Math.abs(sideAtPass) <= minimumSideDistance) return; // Collision rather than a pass-by.
    if (Math.abs(sideAtPass) >= hearingRange) return;

    // Play only one sound when two player cars pass each other.
    const alreadyHeard = this.encounters.some(
      (entry) => entry.player === car && entry.car === player && entry.started,
    );
    if (alreadyHeard) {
      encounter.started = true;
      return;
    }

    encounter.started = this.play(player, car, seconds, variant);
  }

  variantFor(car) {
    let variant = this.variants.get(car);
    if (!variant) {
      // Exclude the previous variant so successive new cars sound different.
      const choices = PASS_BY_VARIANTS.filter((entry) => entry !== this.lastVariant);
      const randomIndex = Math.floor(Math.random() * choices.length);
      variant = choices[randomIndex];
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
    this.playing.push(entry);
    this.position(entry);
    sound.once('complete', () => this.remove(entry));

    // If a car is detected late, skip ahead in the recording.
    // Example: peak at 2s, pass expected in 1s -> start playback at second 1.
    const startAt = clamp(variant.approachSeconds - seconds, 0, variant.approachSeconds);
    if (!sound.play({ seek: startAt })) {
      this.remove(entry);
      return false;
    }
    return true;
  }

  updatePlayingSounds() {
    // Iterate backward because remove() deletes entries from this array.
    for (let index = this.playing.length - 1; index >= 0; index--) {
      const entry = this.playing[index];
      if (!isLiveCar(entry.player) || !isLiveCar(entry.car)) {
        this.remove(entry);
      } else {
        this.position(entry);
      }
    }
  }

  position(entry) {
    const roadWidth = this.scene.track1.displayWidth;
    const distanceX = entry.car.x - entry.player.x;
    const distanceY = entry.car.y - entry.player.y;
    const distance = Math.hypot(distanceX, distanceY);
    const hearingRange = Math.max(roadWidth * 1.5, entry.approachDistance * 1.5);

    // Distance controls volume; the side controls stereo (-1 left, +1 right).
    const pan = clamp(distanceX / (roadWidth / 2), -1, 1);
    const volume = 0.35 * clamp(1 - distance / hearingRange, 0, 1);
    entry.sound.setPan(pan);
    entry.sound.setVolume(volume);
  }

  remove(entry) {
    const index = this.playing.indexOf(entry);
    if (index === -1) return;
    this.playing.splice(index, 1);
    entry.sound.destroy();
  }

  destroy() {
    while (this.playing.length > 0) this.remove(this.playing[0]);
    this.encounters = [];
  }
}
