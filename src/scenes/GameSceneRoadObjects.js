import Phaser from 'phaser';

import Coin from '../objects/Coin.js';
import CoinMultiplier from '../objects/CoinMultiplier.js';
import EnemyCar from '../objects/EnemyCar.js';
import ExtraLife from '../objects/ExtraLife.js';
import Ice from '../objects/Ice.js';
import Item from '../objects/Item.js';
import RandomObstacle from '../objects/RandomObstacle.js';
import { hitRandomObstacle } from './GameSceneCollisions.js';

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
  const spawnY = -200;

  if (positionFree(scene, lane, spawnY)) {
    let roadObject;

    if (type === 'coin') {
      roadObject = new Coin(scene, roadObjectX, spawnY, lane);
      scene.physics.add.overlap(
        scene.car,
        roadObject,
        () => scene.ItemManager.coinBudgetPlus1(scene.car.coinMultiplier),
        undefined,
        scene,
      );
      scene.physics.add.overlap(scene.car, roadObject, scene.collectCoin, undefined, scene);

      if (scene.secondCar) {
        scene.physics.add.overlap(
          scene.secondCar,
          roadObject,
          () => scene.ItemManager.coinBudgetPlus2(scene.secondCar.coinMultiplier),
          undefined,
          scene,
        );
        scene.physics.add.overlap(scene.secondCar, roadObject, scene.collectCoin, undefined, scene);
      }
    } else if (type === 'coinMultiplier') {
      roadObject = new CoinMultiplier(scene, roadObjectX, spawnY, lane);
      scene.physics.add.overlap(
        scene.car,
        roadObject,
        scene.ItemManager.multiplyCoins1,
        undefined,
        scene.ItemManager,
      );

      if (scene.secondCar) {
        scene.physics.add.overlap(
          scene.secondCar,
          roadObject,
          scene.ItemManager.multiplyCoins2,
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
      scene.physics.add.collider(
        scene.car,
        roadObject,
        scene.ItemManager.lebenCheckCar1,
        undefined,
        scene.ItemManager,
      );

      if (scene.secondCar) {
        scene.physics.add.collider(
          scene.secondCar,
          roadObject,
          scene.ItemManager.lebenCheckCar2,
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
    delay = Phaser.Math.Between(2000, 4000);
  } else if (type === 'ice') {
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
