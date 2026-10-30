import Phaser from 'phaser';

import Coin from '../objects/Coin.js';
import CoinMultiplier from '../objects/CoinMultiplier.js';
import EnemyCar from '../objects/EnemyCar.js';
import ExtraLife from '../objects/ExtraLife.js';
import Ice from '../objects/Ice.js';
import Oil from '../objects/Oil.js';
import Item from '../objects/Item.js';
import RandomObstacle from '../objects/RandomObstacle.js';
import { hitRandomObstacle } from './GameSceneCollisions.js';
import { ICE_WARNING_SECONDS, MAX_PICKUP_WARNING_SECONDS } from '../accessibility/warningTiming.js';

function getSpawnY(scene, type) {
  if (!scene.registry.get('accessibility enabled')) return -200;

  const warningSeconds =
    type === 'ice' ? ICE_WARNING_SECONDS : type === 'item' ? MAX_PICKUP_WARNING_SECONDS : 0;
  if (warningSeconds === 0) return -200;

  // Extra lead time belongs to player 1; player 2 continues with normal spawns.
  const car = scene.car;
  if (!car || car.dead || !car.body) return -200;

  // Start farther ahead so the warning has time to finish before the object arrives.
  // Include the acceleration expected during the warning window, plus a size buffer.
  const speed = Math.min(1600, 700 + (scene.elapsedTime + warningSeconds * 1000) * 0.005);
  const pixelsPerSecond = speed * (scene.scale.height / 1200);
  return Math.min(-200, car.body.top - pixelsPerSecond * warningSeconds - 200);
}

function addPlayerCollider(scene, roadObject, callback) {
  for (const car of [scene.car, scene.secondCar].filter(Boolean)) {
    scene.physics.add.collider(car, roadObject, callback, undefined, scene);
  }
}

function positionFree(scene, lane, spawnY) {
  const minimumDistance = 500;

  return scene.roadObjects.every((roadObject) => {
    if (roadObject.lane !== lane) return true;
    return Math.abs(roadObject.y - spawnY) >= minimumDistance;
  });
}

export function createRoadObject(scene, type) {
  const laneCount = 4;
  const laneWidth = scene.track1.displayWidth / laneCount;
  const roadLeftEdge = scene.scale.width / 2 - scene.track1.displayWidth / 2;
  const lane = Phaser.Math.Between(0, laneCount - 1);
  const roadObjectX = roadLeftEdge + lane * laneWidth + laneWidth / 2;
  const spawnY = getSpawnY(scene, type);

  if (positionFree(scene, lane, spawnY)) {
    let roadObject;

    if (type === 'coin') {
      roadObject = new Coin(scene, roadObjectX, spawnY, lane);
      scene.physics.add.overlap(scene.car, roadObject, scene.collectCoin, undefined, scene);

      if (scene.secondCar) {
        scene.physics.add.overlap(scene.secondCar, roadObject, scene.collectCoin, undefined, scene);
      }
    } else if (type === 'coinMultiplier') {
      roadObject = new CoinMultiplier(scene, roadObjectX, spawnY, lane);
      scene.physics.add.overlap(
        scene.car,
        roadObject,
        scene.ItemManager.multiplyCoins,
        undefined,
        scene.ItemManager,
      );

      if (scene.secondCar) {
        scene.physics.add.overlap(
          scene.secondCar,
          roadObject,
          scene.ItemManager.multiplyCoins,
          undefined,
          scene.ItemManager,
        );
      }
    } else if (type === 'item') {
      roadObject = new Item(scene, roadObjectX, spawnY, lane);
      roadObject.setScale(0.1);
      scene.physics.add.overlap(scene.car, roadObject, scene.collectItem, undefined, scene);
      if (scene.secondCar) {
        scene.physics.add.overlap(scene.secondCar, roadObject, scene.collectItem, undefined, scene);
      }
    } else if (type === 'extraLife') {
      roadObject = new ExtraLife(scene, roadObjectX, spawnY, lane);
      roadObject.setTexture('extraLife');
      roadObject.setScale(0.08);
      scene.physics.add.overlap(scene.car, roadObject, scene.collectExtraLife, undefined, scene);

      if (scene.secondCar) {
        scene.physics.add.overlap(
          scene.secondCar,
          roadObject,
          scene.collectExtraLife,
          undefined,
          scene,
        );
      }
    } else if (type === 'enemy-car') {
      roadObject = new EnemyCar(scene, roadObjectX, spawnY, lane);
      roadObject.body.setSize(roadObject.width, roadObject.height);
      roadObject.body.setImmovable(true);
      roadObject.setDepth(100000);
      scene.physics.add.collider(
        scene.car,
        roadObject,
        scene.ItemManager.lebenCheck,
        undefined,
        scene.ItemManager,
      );

      if (scene.secondCar) {
        scene.physics.add.collider(
          scene.secondCar,
          roadObject,
          scene.ItemManager.lebenCheck,
          undefined,
          scene.ItemManager,
        );
      }
    } else if (type === 'ice') {
      roadObject = new Ice(scene, roadObjectX, spawnY, lane);
      scene.physics.add.overlap(
        scene.car,
        roadObject,
        scene.ItemManager.iceEffect,
        undefined,
        scene.ItemManager,
      );

      if (scene.secondCar) {
        scene.physics.add.overlap(
          scene.secondCar,
          roadObject,
          scene.ItemManager.iceEffect,
          undefined,
          scene.ItemManager,
        );
      }
    } else if (type === 'oil') {
      roadObject = new Oil(scene, roadObjectX, spawnY, lane);
      scene.physics.add.overlap(
        scene.car,
        roadObject,
        scene.ItemManager.oilEffect,
        undefined,
        scene.ItemManager,
      );
      if (scene.secondCar) {
        scene.physics.add.overlap(
          scene.secondCar,
          roadObject,
          scene.ItemManager.oilEffect,
          undefined,
          scene.ItemManager,
        );
      }
    } else if (type === 'random-obstacle') {
      roadObject = new RandomObstacle(scene, roadObjectX, spawnY, lane);
      roadObject.body.setSize(roadObject.width, roadObject.height);
      roadObject.body.setImmovable(true);
      addPlayerCollider(scene, roadObject, (car, obstacle) =>
        hitRandomObstacle(scene, car, obstacle),
      );
    }

    scene.roadObjects.push(roadObject);
  }

  let delay;
  if (type === 'coin') {
    delay = Phaser.Math.Between(500, 2000);
  } else if (type === 'item') {
    delay = Phaser.Math.Between(5000, 10000);
  } else if (type === 'enemy-car') {
    delay = Phaser.Math.Between(1000, 2000);
  } else if (type === 'ice') {
    delay = Phaser.Math.Between(6000, 12000);
  } else if (type === 'oil') {
    delay = Phaser.Math.Between(6000, 12000);
  } else if (type === 'coinMultiplier') {
    delay = Phaser.Math.Between(10000, 20000);
  } else if (type === 'extraLife') {
    delay = Phaser.Math.Between(15000, 30000);
  } else if (type === 'random-obstacle') {
    delay = Phaser.Math.Between(1500, 9000);
  }

  scene.time.delayedCall(delay, () => createRoadObject(scene, type));
}
