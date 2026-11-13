import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import { mock, test } from 'node:test';

mock.module('phaser', { defaultExport: { Scene: class {} } });
mock.module('../../audio/sounds.js', {
  namedExports: {
    preloadMenuSounds() {},
    playMenuClick() {},
    bindMenuFocusSounds() {},
  },
});
for (const name of ['InputManager', 'Car', 'Track', 'Wall', 'StartingBanner', 'StartingLine']) {
  mock.module(`../../src/objects/${name}.js`, { defaultExport: class {} });
}

const { default: StartScene } = await import('../../src/scenes/StartScene.js');

/**
 * Creates a countdown fixture with controllable audio readiness and scene timers.
 *
 * @param {object} [options={}] - Initial state and simulated asset failure.
 * @param {AudioContextState} [options.state='running'] - Initial context state.
 * @param {boolean} [options.locked=false] - Initial Phaser audio lock.
 * @param {string} [options.missingKey] - Audio key to report as absent from the cache.
 * @returns A scene fixture with playback records, audio sources and timer controls.
 */
function createScene({ state = 'running', locked = false, missingKey } = {}) {
  const scene = new StartScene();
  const context = new EventEmitter();
  context.state = state;
  context.addEventListener = context.on.bind(context);
  context.removeEventListener = context.off.bind(context);
  let resolveResume;
  context.resume = () =>
    new Promise((resolve) => {
      resolveResume = resolve;
    });
  scene.sound = new EventEmitter();
  scene.sound.context = context;
  scene.sound.locked = locked;
  scene.sound.play = (key) => {
    scene.played.push(key);
    return true;
  };
  scene.played = [];
  scene.shown = [];
  scene.showNumber = (key) => scene.shown.push(key);
  scene.cache = { audio: { exists: (key) => key !== missingKey } };
  scene.events = new EventEmitter();
  scene.timers = [];
  scene.time = {
    delayedCall: (delay, callback) => {
      const timer = { delay, callback, remove: () => (timer.removed = true) };
      scene.timers.push(timer);
      return timer;
    },
  };
  scene.car = { startAnim() {} };
  scene.number = { destroy() {} };
  /**
   * Completes the pending resume and emits the corresponding context state change.
   *
   * @returns {Promise<void>} Resolves after queued resume handlers can run.
   */
  scene.resumeAudio = async () => {
    context.state = 'running';
    resolveResume?.();
    context.emit('statechange');
    await Promise.resolve();
  };
  /**
   * Finishes active intro sources and runs a snapshot of scene timers in order.
   *
   * @returns {void}
   */
  scene.runTimers = () => {
    const processed = new Set();
    while (true) {
      const timer = scene.timers
        .filter((candidate) => !processed.has(candidate))
        .sort((first, second) => first.delay - second.delay)[0];
      if (!timer) break;
      processed.add(timer);
      if (!timer.removed) timer.callback();
    }
  };
  return scene;
}

test('continues the visual countdown without waiting for audio unlock', () => {
  const scene = createScene({ state: 'suspended', locked: true });

  scene.countdown();

  assert.deepEqual(
    scene.timers.map((timer) => timer.delay),
    [1500],
  );
  assert.deepEqual(scene.played, []);
  assert.deepEqual(scene.shown, []);

  scene.runTimers();

  assert.deepEqual(scene.played, []);
  assert.deepEqual(scene.shown, ['start-count-3', 'start-count-2', 'start-count-1', 'start-go']);
});

test('starts sound and image together when audio is ready', () => {
  const scene = createScene();

  scene.countdown();
  scene.runTimers();

  assert.deepEqual(scene.played, ['countdown-3', 'countdown-2', 'countdown-1', 'countdown-go']);
  assert.deepEqual(scene.shown, ['start-count-3', 'start-count-2', 'start-count-1', 'start-go']);
  assert.deepEqual(
    scene.timers.map((timer) => timer.delay),
    [1500, 900, 1800, 2700, 4000],
  );
  assert.equal(scene.sound.listenerCount('unlocked'), 0);
  assert.equal(scene.sound.context.listenerCount('statechange'), 0);
});

test('does not wait for AudioContext resume before starting the countdown', async () => {
  const scene = createScene({ state: 'suspended' });

  scene.countdown();
  assert.deepEqual(
    scene.timers.map((timer) => timer.delay),
    [1500],
  );
  assert.deepEqual(scene.shown, []);

  scene.runTimers();

  assert.deepEqual(scene.played, ['countdown-3', 'countdown-2', 'countdown-1', 'countdown-go']);
  assert.deepEqual(scene.shown, ['start-count-3', 'start-count-2', 'start-count-1', 'start-go']);
  await scene.resumeAudio();
});

test('shows every countdown number without waiting for Phaser unlock', () => {
  const scene = createScene({ locked: true });

  scene.countdown();
  assert.equal(scene.timers.length, 1);
  scene.runTimers();

  assert.deepEqual(scene.played, []);
  assert.deepEqual(scene.shown, ['start-count-3', 'start-count-2', 'start-count-1', 'start-go']);
});

test('cancels the countdown timer on shutdown', () => {
  const scene = createScene();

  scene.countdown();
  scene.events.emit('shutdown');
  scene.runTimers();

  assert.deepEqual(scene.played, []);
  assert.deepEqual(scene.shown, []);
  assert.equal(scene.sound.listenerCount('unlocked'), 0);
  assert.equal(scene.sound.context.listenerCount('statechange'), 0);
});

test('does not advance the countdown if an audio asset is missing', () => {
  const scene = createScene({ missingKey: 'countdown-3' });
  const warning = mock.method(console, 'warn', () => {});
  try {
    scene.countdown();
    scene.runTimers();

    assert.deepEqual(scene.played, ['countdown-2', 'countdown-1', 'countdown-go']);
    assert.deepEqual(scene.shown, ['start-count-3', 'start-count-2', 'start-count-1', 'start-go']);
    assert.equal(warning.mock.callCount(), 0);
  } finally {
    warning.mock.restore();
  }
});

test('continues the countdown if the first sound cannot play', () => {
  const scene = createScene();
  scene.sound.play = () => false;
  const warning = mock.method(console, 'warn', () => {});
  try {
    scene.countdown();
    scene.runTimers();

    assert.deepEqual(scene.shown, ['start-count-3', 'start-count-2', 'start-count-1', 'start-go']);
    assert.equal(warning.mock.callCount(), 0);
  } finally {
    warning.mock.restore();
  }
});

test('does not restart an intro skipped while audio is pending', async () => {
  const scene = createScene({ state: 'suspended' });
  scene.sound.stopByKey = () => {};
  scene.scene = { start: () => scene.events.emit('shutdown') };

  scene.countdown();
  scene.goToGame();
  await scene.resumeAudio();
  scene.runTimers();

  assert.equal(scene.leaving, true);
  assert.deepEqual(scene.played, []);
  assert.deepEqual(scene.shown, []);
});

test('shows every countdown number when every audio clip is missing', () => {
  const scene = createScene({ missingKey: 'all' });
  scene.cache.audio.exists = () => false;

  scene.countdown();
  scene.runTimers();

  assert.deepEqual(scene.played, []);
  assert.deepEqual(scene.shown, ['start-count-3', 'start-count-2', 'start-count-1', 'start-go']);
});
