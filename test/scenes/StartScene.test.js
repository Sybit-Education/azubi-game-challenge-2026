import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import { mock, test } from 'node:test';

mock.module('phaser', { defaultExport: { Scene: class {} } });
mock.module('../../audio/sounds.js', {
  namedExports: {
    preloadMenuSounds() {},
    preloadCountdownSounds() {},
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
  context.sampleRate = 48000;
  context.createBuffer = (channels, length, sampleRate) => ({ channels, length, sampleRate });
  scene.audioSources = [];
  context.createBufferSource = () => {
    const source = {
      connect() {},
      disconnect() {
        source.disconnected = true;
      },
      start() {
        source.started = true;
      },
      stop() {
        source.stopped = true;
        source.onended?.();
      },
    };
    scene.audioSources.push(source);
    return source;
  };
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
    for (const source of scene.audioSources) {
      if (!source.stopped) source.onended?.();
    }
    for (const timer of [...scene.timers].sort((first, second) => first.delay - second.delay)) {
      if (!timer.removed) timer.callback();
    }
  };
  return scene;
}

test('renders a silent intro before starting sound and image together', () => {
  const scene = createScene();

  scene.countdown();

  assert.deepEqual(scene.played, []);
  assert.deepEqual(scene.shown, []);
  assert.equal(scene.audioSources.length, 1);
  const [intro] = scene.audioSources;
  assert.equal(intro.started, true);
  assert.equal(intro.buffer.length / intro.buffer.sampleRate, 1.5);
  intro.onended();

  assert.deepEqual(scene.played, ['countdown-3']);
  assert.deepEqual(scene.shown, ['start-count-3']);
  assert.deepEqual(
    scene.timers.map((timer) => timer.delay),
    [900, 1800, 2700, 4000],
  );
  assert.equal(scene.sound.listenerCount('unlocked'), 0);
  assert.equal(scene.sound.context.listenerCount('statechange'), 0);
  assert.equal(intro.disconnected, true);
});

test('waits for resume before starting the entire countdown', async () => {
  const scene = createScene({ state: 'suspended' });

  scene.countdown();
  assert.equal(scene.timers.length, 0);
  assert.deepEqual(scene.shown, []);

  await scene.resumeAudio();
  scene.runTimers();

  assert.deepEqual(scene.played, ['countdown-3', 'countdown-2', 'countdown-1', 'countdown-go']);
  assert.deepEqual(scene.shown, ['start-count-3', 'start-count-2', 'start-count-1', 'start-go']);
});

test('waits for Phaser unlock and starts only once', async () => {
  const scene = createScene({ locked: true });

  scene.countdown();
  assert.equal(scene.timers.length, 0);

  scene.sound.locked = false;
  scene.sound.emit('unlocked');
  await scene.resumeAudio();
  scene.runTimers();

  assert.equal(scene.played.filter((key) => key === 'countdown-3').length, 1);
});

test('does not start after shutdown while audio is pending', async () => {
  const scene = createScene({ state: 'suspended' });

  scene.countdown();
  scene.events.emit('shutdown');
  await scene.resumeAudio();
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

    assert.deepEqual(scene.played, []);
    assert.deepEqual(scene.shown, []);
    assert.equal(warning.mock.callCount(), 1);
  } finally {
    warning.mock.restore();
  }
});

test('does not show the first number if playback fails', () => {
  const scene = createScene();
  scene.sound.play = () => false;
  const warning = mock.method(console, 'warn', () => {});
  try {
    scene.countdown();
    scene.runTimers();

    assert.deepEqual(scene.shown, []);
    assert.equal(scene.timers.length, 0);
    assert.equal(warning.mock.callCount(), 1);
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

test('stops the silent intro on shutdown without starting the countdown', () => {
  const scene = createScene();

  scene.countdown();
  assert.equal(scene.audioSources.length, 1);
  scene.events.emit('shutdown');
  scene.runTimers();

  assert.equal(scene.audioSources[0].stopped, true);
  assert.equal(scene.audioSources[0].disconnected, true);
  assert.deepEqual(scene.played, []);
  assert.deepEqual(scene.shown, []);
});
