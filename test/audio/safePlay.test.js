import assert from 'node:assert/strict';
import test from 'node:test';

import { safePlay } from '../../audio/safePlay.js';

/**
 * Creates a playback fixture whose resume state changes asynchronously.
 *
 * @param {object} [options={}] - Initial audio state.
 * @param {AudioContextState} [options.state='running'] - Initial context state.
 * @param {boolean} [options.locked=false] - Initial Phaser audio lock.
 * @returns A fixture with the fake scene, recorded playback calls and resume count.
 */
function createScene({ state = 'running', locked = false } = {}) {
  const played = [];
  let resumes = 0;
  const context = {
    state,
    resume() {
      resumes++;
      return Promise.resolve().then(() => {
        context.state = 'running';
      });
    },
  };
  return {
    played,
    get resumes() {
      return resumes;
    },
    scene: {
      sound: {
        context,
        locked,
        play: (key, config) => {
          played.push({ key, config });
          return true;
        },
      },
      cache: { audio: { exists: () => true } },
    },
  };
}

/**
 * Overrides browser activation for one test and restores navigator afterwards.
 *
 * @param {import('node:test').TestContext} context - Test owning the cleanup hook.
 * @param {boolean} hasBeenActive - Whether a prior user gesture should be reported.
 * @returns {void}
 */
function setUserActivation(context, hasBeenActive) {
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'navigator');
  Object.defineProperty(globalThis, 'navigator', {
    configurable: true,
    value: { userActivation: { hasBeenActive } },
  });
  context.after(() => {
    if (descriptor) Object.defineProperty(globalThis, 'navigator', descriptor);
    else delete globalThis.navigator;
  });
}

test('plays the sound while the AudioContext is still resuming', () => {
  const setup = createScene({ state: 'suspended' });

  assert.equal(safePlay(setup.scene, 'countdown-3', { volume: 0.8 }), true);
  assert.equal(setup.resumes, 1);
  assert.deepEqual(setup.played, [{ key: 'countdown-3', config: { volume: 0.8 } }]);
});

test('plays immediately when the AudioContext is running', () => {
  const setup = createScene();

  assert.equal(safePlay(setup.scene, 'countdown-2'), true);
  assert.equal(setup.resumes, 0);
  assert.equal(setup.played.length, 1);
});

test('respects the cooldown', () => {
  const setup = createScene();

  safePlay(setup.scene, 'road-edge-hit', { cooldownMs: 1000 });
  safePlay(setup.scene, 'road-edge-hit', { cooldownMs: 1000 });

  assert.equal(setup.played.length, 1);
});

test('falls back to the Phaser lock when userActivation is unavailable', () => {
  const setup = createScene({ state: 'suspended', locked: true });

  assert.equal(safePlay(setup.scene, 'countdown-3'), false);
  assert.equal(setup.played.length, 0);
});

test('uses browser activation when the Phaser lock has not caught up', (context) => {
  setUserActivation(context, true);
  const setup = createScene({ state: 'suspended', locked: true });

  assert.equal(safePlay(setup.scene, 'countdown-3'), true);
  assert.equal(setup.resumes, 1);
  assert.equal(setup.played.length, 1);
});

test('does not queue sounds before browser activation even if Phaser reports unlocked', (context) => {
  setUserActivation(context, false);
  const setup = createScene();

  assert.equal(safePlay(setup.scene, 'countdown-3'), false);
  assert.equal(setup.resumes, 0);
  assert.equal(setup.played.length, 0);
});

test('does not play an audio key that is missing from the cache', () => {
  const setup = createScene();
  setup.scene.cache.audio.exists = () => false;

  assert.equal(safePlay(setup.scene, 'missing'), false);
  assert.equal(setup.played.length, 0);
});

test('handles a rejected resume without an unhandled rejection', async () => {
  const setup = createScene({ state: 'suspended' });
  setup.scene.sound.context.resume = () => Promise.reject(new Error('Audio unavailable'));

  assert.equal(safePlay(setup.scene, 'countdown-3'), true);
  await Promise.resolve();
  assert.equal(setup.played.length, 1);
});

test('does nothing without a sound manager', () => {
  assert.equal(safePlay(null, 'countdown-3'), false);
  assert.equal(safePlay({}, 'countdown-3'), false);
});
