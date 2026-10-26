import Phaser from 'phaser';

import EnemyCar from '../objects/EnemyCar.js';
import Ice from '../objects/Ice.js';
import RandomObstacle from '../objects/RandomObstacle.js';

function getObstaclesAhead(scene, car, lane) {
  return scene.roadObjects.filter((object) => {
    const isObstacle = object instanceof EnemyCar || object instanceof RandomObstacle;
    return (
      object.active && isObstacle && object.lane === lane && object.body.bottom <= car.body.top
    );
  });
}

function getTimeUntilObstacle(scene, car, obstacle) {
  if (!Number.isFinite(obstacle.speed)) return Infinity;

  const distance = car.body.top - obstacle.body.bottom;
  const heightFactor = scene.scale.height / 1200;
  const obstacleSpeed = obstacle.speed * heightFactor;
  const closingSpeed = obstacleSpeed - car.body.velocity.y;

  if (closingSpeed <= 0) return Infinity;
  return Math.max(0, distance) / closingSpeed;
}

function getSoonestObstacleAhead(scene, car, lane) {
  const obstacles = getObstaclesAhead(scene, car, lane);
  let soonest = null;

  for (const obstacle of obstacles) {
    const seconds = getTimeUntilObstacle(scene, car, obstacle);
    if (!Number.isFinite(seconds)) continue;
    if (soonest === null || seconds < soonest.seconds) soonest = { obstacle, seconds };
  }

  return soonest;
}

export function updateLaneDanger(scene) {
  scene.currentLaneDanger = null;
  if (scene.car.dead) return;

  const lane = scene.getPlayerLane(scene.car);
  const soonest = getSoonestObstacleAhead(scene, scene.car, lane);
  if (soonest && soonest.seconds <= 4) {
    scene.currentLaneDanger = { ...soonest, lane };
  }
}

export function updateIceWarning(scene) {
  if (!scene.registry.get('accessibility enabled')) {
    if (scene.iceWarning.isPlaying) scene.iceWarning.stop();
    return;
  }

  // Keep spoken warnings from overlapping; retry pending warnings next frame.
  if (scene.sound.locked || scene.iceWarning.isPlaying) return;

  let nextWarning = null;
  for (const car of [scene.car, scene.secondCar]) {
    if (!car || !car.active || car.dead || !car.body?.enable) continue;

    let warned = scene.warnedIce.get(car);
    if (!warned) {
      warned = new WeakSet();
      scene.warnedIce.set(car, warned);
    }

    const lane = scene.getPlayerLane(car);
    for (const ice of scene.roadObjects) {
      if (!(ice instanceof Ice) || !ice.active || !ice.body?.enable) continue;
      if (ice.lane !== lane || warned.has(ice)) continue;
      if (ice.body.bottom > car.body.top) continue;

      const seconds = getTimeUntilObstacle(scene, car, ice);
      if (!Number.isFinite(seconds) || seconds > 3) continue;
      if (nextWarning === null || seconds < nextWarning.seconds) {
        nextWarning = { car, ice, seconds, warned };
      }
    }
  }

  if (nextWarning === null) return;

  const pan = Phaser.Math.Clamp(
    (nextWarning.ice.x - nextWarning.car.x) / (scene.track1.displayWidth / 2),
    -1,
    1,
  );

  if (scene.iceWarning.play({ pan })) {
    // Mark only successful playback, once per ice patch and player.
    nextWarning.warned.add(nextWarning.ice);
  }
}
