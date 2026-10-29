import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';
import {
  ICE_WARNING_SECONDS,
  MAX_PICKUP_WARNING_SECONDS,
} from '../../src/accessibility/warningTiming.js';

// Run the actual spawn-position function without loading Phaser's browser objects.
const source = fs.readFileSync(
  new URL('../../src/scenes/GameSceneRoadObjects.js', import.meta.url),
  'utf8',
);
const helper = source.slice(
  source.indexOf('function getSpawnY'),
  source.indexOf('function addPlayerCollider'),
);
const getSpawnY = vm.runInNewContext(`${helper}\ngetSpawnY`, {
  ICE_WARNING_SECONDS,
  MAX_PICKUP_WARNING_SECONDS,
});

for (const type of ['item', 'ice']) {
  test(`${type} spawns return to normal after player 1 dies, even if player 2 survives`, () => {
    const survivor = { dead: false, body: { top: 900 } };
    const scene = {
      registry: { get: () => true },
      elapsedTime: 10000,
      scale: { height: 1200 },
      car: survivor,
      secondCar: null,
    };
    const beforeDeath = getSpawnY(scene, type);
    scene.car = { dead: true, body: null };
    scene.secondCar = survivor;
    assert.equal(getSpawnY(scene, type), -200);
    assert.ok(beforeDeath < -200);

    scene.secondCar = null;
    assert.equal(getSpawnY(scene, type), -200);
    scene.secondCar = { dead: true, body: null };
    assert.equal(getSpawnY(scene, type), -200);
  });
}
