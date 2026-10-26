import assert from 'node:assert/strict';
import test from 'node:test';

import { CarSpatialAudioSystem } from '../../src/accessibility/audio/CarSpatialAudioSystem.js';

class FakeSpatialSource {
  constructor() {
    this.positions = [];
    this.frequencies = [];
    this.destroyed = false;
  }

  setPosition(position) {
    this.positions.push(position);
  }

  setFrequency(frequency) {
    this.frequencies.push(frequency);
  }

  destroy() {
    this.destroyed = true;
  }
}

class FakeCrashSound {
  constructor() {
    this.positions = [];
    this.destroyed = false;
  }

  play(position) {
    this.positions.push(position);
  }

  destroy() {
    this.destroyed = true;
  }
}

class FakeScrapeSound {
  constructor() {
    this.started = [];
    this.stopCalls = 0;
    this.destroyed = false;
  }

  start(pan) {
    this.started.push(pan);
  }

  stop() {
    this.stopCalls += 1;
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
    gameSpeed: 700,
  });

  assert.deepEqual(createdKinds, ['listener', 'enemy', 'opponent']);
  const [listenerSource, enemySource, opponentSource] = createdSources;
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
    gameSpeed: 700,
  });

  assert.equal(listenerSource.destroyed, false);
  assert.equal(enemySource.destroyed, true);
  assert.equal(opponentSource.destroyed, true);

  system.destroy();

  assert.equal(listenerSource.destroyed, true);
});

test('keeps a centered listener engine, announces stable lane changes, and updates scrape cues', () => {
  const createdKinds = [];
  const createdSources = [];
  const announcedLanes = [];
  const scrapeSound = new FakeScrapeSound();
  const laneCue = {
    silenceCalls: 0,
    announce: (lane) => announcedLanes.push(lane),
    silence() {
      this.silenceCalls += 1;
    },
    destroy() {
      this.destroyed = true;
    },
  };
  const listenerCar = {
    x: 350,
    y: 800,
    active: true,
    boundaryParticles: { emitting: false },
    leftLimit: 240,
    rightLimit: 760,
  };
  const system = new CarSpatialAudioSystem({
    isEnemyCar: () => false,
    laneCue,
    scrapeSound,
    sourceFactory: (kind) => {
      const source = new FakeSpatialSource();
      createdKinds.push(kind);
      createdSources.push(source);
      return source;
    },
  });

  system.update({
    listenerCar,
    roadObjects: [],
    opponentCar: null,
    roadLeftEdge: 100,
    roadWidth: 800,
    viewportHeight: 1000,
    gameSpeed: 700,
  });

  assert.deepEqual(createdKinds, ['listener']);
  assert.deepEqual(createdSources[0].positions[0], { x: 0, y: 0, z: 0 });
  assert.deepEqual(createdSources[0].frequencies, [84]);
  assert.deepEqual(announcedLanes, [1]);
  assert.equal(scrapeSound.stopCalls, 1);

  listenerCar.x = 510;
  system.update({
    listenerCar,
    roadObjects: [],
    opponentCar: null,
    roadLeftEdge: 100,
    roadWidth: 800,
    viewportHeight: 1000,
    gameSpeed: 1600,
  });

  assert.deepEqual(announcedLanes, [1]);

  listenerCar.x = 240;
  listenerCar.boundaryParticles.emitting = true;
  system.update({
    listenerCar,
    roadObjects: [],
    opponentCar: null,
    roadLeftEdge: 100,
    roadWidth: 800,
    viewportHeight: 1000,
    gameSpeed: 1600,
  });

  assert.deepEqual(createdKinds, ['listener']);
  assert.deepEqual(createdSources[0].frequencies, [84, 132, 132]);
  assert.deepEqual(announcedLanes, [1, 0]);
  assert.deepEqual(scrapeSound.started, [-1]);

  listenerCar.dead = true;
  system.update({
    listenerCar,
    roadObjects: [],
    opponentCar: null,
    roadLeftEdge: 100,
    roadWidth: 800,
    viewportHeight: 1000,
    gameSpeed: 1600,
  });

  assert.equal(createdSources[0].destroyed, true);
  assert.equal(laneCue.silenceCalls, 1);
  assert.equal(scrapeSound.stopCalls, 2);

  system.destroy();

  assert.equal(laneCue.silenceCalls, 2);
  assert.equal(laneCue.destroyed, true);
  assert.equal(scrapeSound.destroyed, true);
});

test('positions crash sounds relative to the listener car', () => {
  const crashSound = new FakeCrashSound();
  const listenerCar = { x: 500, y: 800, active: true };
  const opponentCar = { x: 700, y: 600, active: true };
  const system = new CarSpatialAudioSystem({
    crashSound,
    isEnemyCar: () => false,
    sourceFactory: () => new FakeSpatialSource(),
  });

  system.update({
    listenerCar,
    roadObjects: [],
    opponentCar,
    roadWidth: 800,
    viewportHeight: 1000,
    gameSpeed: 700,
  });

  assert.equal(typeof system.playCrash, 'function');
  system.playCrash(listenerCar);
  system.playCrash(opponentCar);

  assert.deepEqual(crashSound.positions, [
    { x: 0, y: 0, z: -0, forwardDistance: 0 },
    { x: 2, y: 0, z: -6, forwardDistance: 200 },
  ]);

  system.destroy();

  assert.equal(crashSound.destroyed, true);
});

test('keeps the last listener position for a later opponent crash', () => {
  const crashSound = new FakeCrashSound();
  const listenerCar = { x: 500, y: 800, active: true };
  const opponentCar = { x: 700, y: 600, active: true };
  const system = new CarSpatialAudioSystem({
    crashSound,
    isEnemyCar: () => false,
    sourceFactory: () => new FakeSpatialSource(),
  });
  const frame = {
    listenerCar,
    roadObjects: [],
    opponentCar,
    roadWidth: 800,
    viewportHeight: 1000,
    gameSpeed: 700,
  };

  system.update(frame);
  listenerCar.dead = true;
  system.update(frame);
  system.playCrash(opponentCar);

  assert.deepEqual(crashSound.positions, [{ x: 2, y: 0, z: -6, forwardDistance: 200 }]);
});
