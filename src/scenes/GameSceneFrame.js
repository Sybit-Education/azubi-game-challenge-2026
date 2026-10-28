import { updateIceWarning, updateLaneDanger } from './GameSceneWarnings.js';

function updatePlayerOne(scene) {
  if (scene.car.dead) return;

  scene.car.move(scene.InputManager.getControlsP1);
  const currentLane = scene.getPlayerLane(scene.car);
  let currentRoadEdge = null;

  if (scene.car.x <= scene.car.leftLimit) {
    currentRoadEdge = 'left';
  } else if (scene.car.x >= scene.car.rightLimit) {
    currentRoadEdge = 'right';
  }

  const edgeChanged = currentRoadEdge !== scene.lastPlayerRoadEdge;

  if (scene.registry.get('accessibility enabled')) {
    if (edgeChanged && currentRoadEdge !== null) {
      scene.gameStatus.textContent = `${currentRoadEdge} road edge`;
      const pan = currentRoadEdge === 'left' ? -1 : 1;
      scene.sound.play('road-edge-hit', { volume: 0.25, pan });
      scene.sound.play('collision-hit', { volume: 0.15, pan });
    }
  }

  scene.lastPlayerLane = currentLane;
  scene.lastPlayerRoadEdge = currentRoadEdge;
  scene.car.update_boundary_particles();
  scene.car.intendedXVelocity = scene.car.body.velocity.x;
}

function updatePlayerTwo(scene) {
  if (!scene.secondCar || scene.secondCar.dead) return;

  scene.secondCar.move(scene.InputManager.getControlsP2);
  scene.secondCar.update_boundary_particles();
  scene.secondCar.intendedXVelocity = scene.secondCar.body.velocity.x;
}

function updateRoadEdgeScrape(scene) {
  // The second car is null in single-player.
  const scraping = [scene.car, scene.secondCar].some(
    (car) => car && !car.dead && car.boundaryParticles?.emitting,
  );

  if (scraping) {
    if (!scene.roadEdgeScrape.isPlaying && !scene.sound.locked) {
      scene.roadEdgeScrape.play();
    }
  } else {
    scene.roadEdgeScrape.stop();
  }
}

function updateRoadObjects(scene, delta) {
  scene.roadObjects = scene.roadObjects.filter((roadObject) => {
    roadObject.move(scene.elapsedTime, delta);
    return roadObject.active;
  });

  updateLaneDanger(scene);
  updateIceWarning(scene);
}

function updateAudio(scene, delta) {
  scene.laneAnnouncements.update();
  // Update after movement so sounds use the cars' current positions.
  const carsForAudio = scene.getCarsForAudio();
  const obstaclesForAudio = scene.getObstaclesForAudio();
  for (const sensor of scene.carSensors) sensor.update(delta, obstaclesForAudio);
  scene.carPassBy.update(carsForAudio);
}

function updateOverlapCheck(scene) {
  if (!scene.secondCar || scene.secondCar.dead) return; // single player has no second car

  let onTop = false;

  scene.physics.overlap(
    scene.car,
    scene.secondCar,
    () => {
      // only runs when they overlap at least 50%
      onTop = true;
    },
    (a, b) => {
      const overlapX = Math.min(a.body.right, b.body.right) - Math.max(a.body.left, b.body.left);
      const overlapY = Math.min(a.body.bottom, b.body.bottom) - Math.max(a.body.top, b.body.top);
      const overlapPercent = (overlapX * overlapY) / (a.body.width * a.body.height);
      return overlapPercent >= 0.5;
    },
  );

  // shield and extra life already blink the alpha, don't fight them
  if (scene.ItemManager.schildAktivCar2 || scene.ItemManager.invulnerableCar2) return;

  const targetAlpha = onTop ? 0.5 : 1;
  scene.secondCar.alpha += (targetAlpha - scene.secondCar.alpha) * 0.1; // 10% closer each frame
}

function updateTrackAndHud(scene, delta) {
  const targetTrackSpeed = Math.min(1600, 700 + scene.elapsedTime * 0.005);
  scene.track1.speed = targetTrackSpeed;
  scene.track2.speed = targetTrackSpeed;

  if (!scene.car.dead) scene.car.update_meters(targetTrackSpeed, delta);
  if (scene.secondCar && !scene.secondCar.dead) {
    scene.secondCar.update_meters(targetTrackSpeed, delta);
  }

  for (const wall of scene.walls) {
    wall.speed = targetTrackSpeed;
    wall.move(delta);
  }

  scene.track1.move(delta);
  scene.track2.move(delta);
  scene.hud.update();
  scene.ItemManager.itemShop();
  scene.coinAnnouncements.update();
  scene.coinText1.setText(String(scene.ItemManager.coinBudgetPlayer1));

  if (scene.isMultiplayer && scene.coinText2) {
    scene.coinText2.setText(String(scene.ItemManager.coinBudgetPlayer2));
  }
}

export function updateGameScene(scene, delta) {
  if (!scene.registry.get('accessibility enabled')) scene.speech.silence();
  scene.InputManager.update();
  scene.elapsedTime += delta;

  updatePlayerOne(scene);
  updateRoadEdgeScrape(scene);
  updatePlayerTwo(scene);
  updateOverlapCheck(scene);
  updateRoadObjects(scene, delta);
  updateAudio(scene, delta);
  updateTrackAndHud(scene, delta);
}
