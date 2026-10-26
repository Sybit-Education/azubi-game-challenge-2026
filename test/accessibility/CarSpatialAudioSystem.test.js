import assert from 'node:assert/strict';
import test from 'node:test';

import { CarSpatialAudioSystem } from '../../src/accessibility/audio/CarSpatialAudioSystem.js';

class FakeSpatialSource {
  constructor() {
    this.positions = [];
    this.destroyed = false;
  }

  setPosition(position) {
    this.positions.push(position);
  }

  destroy() {
    this.destroyed = true;
  }
}

test('owns sources for the selected enemy and opponent cars', () => {
  const createdKinds = [];
  const createdSources = [];
  const listenerCar = { x: 500, y: 800, active: true };
  const enemyCar = { x: 500, y: 200, active: true, enemy: true };
  const opponentCar = { x: 700, y: 100, active: true };
  const system = new CarSpatialAudioSystem({
    isEnemyCar: (roadObject) => roadObject.enemy === true,
    sourceFactory: (kind) => {
      const source = new FakeSpatialSource();
      createdKinds.push(kind);
      createdSources.push(source);
      return source;
    },
  });

  system.update({
    listenerCar,
    roadObjects: [enemyCar],
    opponentCar,
    roadWidth: 800,
    viewportHeight: 1000,
  });

  assert.equal(createdKinds[0], 'enemy');
  assert.equal(createdKinds[1], 'opponent');
  const [enemySource, opponentSource] = createdSources;
  assert.deepEqual(enemySource.positions[0], {
    x: 0,
    y: 0,
    z: -18,
    forwardDistance: 600,
  });
  assert.equal(opponentSource.positions.length, 1);

  system.update({
    listenerCar,
    roadObjects: [],
    opponentCar: null,
    roadWidth: 800,
    viewportHeight: 1000,
  });

  assert.equal(enemySource.destroyed, true);
  assert.equal(opponentSource.destroyed, true);
});
