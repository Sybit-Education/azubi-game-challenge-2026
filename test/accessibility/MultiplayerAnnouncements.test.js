import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';
import CoinAnnouncements from '../../src/accessibility/CoinAnnouncements.js';
import { ICE_WARNING_SECONDS } from '../../src/accessibility/warningTiming.js';

test('only player 1 coins are announced and death cancels pending balances', () => {
  const messages = [];
  const cancellations = [];
  const scene = {
    car: { dead: false },
    secondCar: { dead: false },
    registry: { get: () => true },
    ItemManager: { coinBudgetPlayer1: 0, coinBudgetPlayer2: 5 },
    speech: {
      speak: (text) => messages.push(text),
      cancel: (key) => cancellations.push(key),
    },
  };
  const announcer = new CoinAnnouncements(scene);
  announcer.update();
  assert.deepEqual(messages, []);
  scene.ItemManager.coinBudgetPlayer1 = 5;
  announcer.update();
  assert.deepEqual(messages, ['5 coins']);
  scene.car.dead = true;
  scene.ItemManager.coinBudgetPlayer2 = 10;
  announcer.update();
  assert.deepEqual(messages, ['5 coins']);
  assert.deepEqual(cancellations, ['coins']);
});

class Ice {}
const warnings = fs
  .readFileSync(new URL('../../src/scenes/GameSceneWarnings.js', import.meta.url), 'utf8')
  .replace(/^import .*;\n/gm, '')
  .replaceAll('export function', 'function');
const updateIceWarning = vm.runInNewContext(`${warnings}\nupdateIceWarning`, {
  Ice,
  ICE_WARNING_SECONDS,
  Phaser: { Math: { Clamp: (value, min, max) => Math.max(min, Math.min(max, value)) } },
});

test('ice only warns for player 1 and stops when that player dies', () => {
  const played = [];
  const scene = {
    registry: { get: () => true },
    car: {
      active: true,
      dead: false,
      x: 100,
      body: { enable: true, top: 700, velocity: { y: 0 } },
    },
    secondCar: { active: true, dead: false, lane: 2 },
    sound: { locked: false },
    iceWarning: {
      isPlaying: false,
      play: (config) => {
        played.push(config);
        return true;
      },
      stop() {
        this.isPlaying = false;
      },
    },
    warnedIce: new WeakMap(),
    getPlayerLane: () => 1,
    scale: { height: 1200 },
    track1: { displayWidth: 800 },
    roadObjects: [
      Object.assign(new Ice(), {
        active: true,
        lane: 2,
        x: 100,
        speed: 700,
        body: { enable: true, bottom: 0 },
      }),
    ],
  };
  updateIceWarning(scene);
  assert.equal(played.length, 0);
  scene.roadObjects[0].lane = 1;
  updateIceWarning(scene);
  updateIceWarning(scene);
  assert.equal(played.length, 1);
  scene.car.dead = true;
  scene.car.body = null;
  scene.iceWarning.isPlaying = true;
  updateIceWarning(scene);
  assert.equal(scene.iceWarning.isPlaying, false);
  assert.equal(played.length, 1);
});
