import assert from 'node:assert/strict';
import test from 'node:test';

import { CrashSoundPlayer } from '../../src/accessibility/audio/CrashSoundPlayer.js';

class FakeAudioParam {
  constructor() {
    this.linearRamps = [];
    this.exponentialRamps = [];
  }

  setValueAtTime(value, time) {
    this.lastValue = [value, time];
  }

  linearRampToValueAtTime(value, time) {
    this.linearRamps.push([value, time]);
  }

  exponentialRampToValueAtTime(value, time) {
    this.exponentialRamps.push([value, time]);
  }
}

class FakeAudioNode {
  connect(destination) {
    this.destination = destination;
    return destination;
  }

  disconnect() {
    this.disconnected = true;
  }
}

class FakeOscillatorNode extends FakeAudioNode {
  constructor() {
    super();
    this.frequency = new FakeAudioParam();
  }

  start(time) {
    this.startTime = time;
  }

  stop(time) {
    this.stopTime = time;
  }

  finish() {
    this.onended?.();
  }
}

class FakeFilterNode extends FakeAudioNode {
  constructor() {
    super();
    this.frequency = new FakeAudioParam();
  }
}

class FakeGainNode extends FakeAudioNode {
  constructor() {
    super();
    this.gain = new FakeAudioParam();
  }
}

class FakePannerNode extends FakeAudioNode {
  constructor() {
    super();
    this.positionX = new FakeAudioParam();
    this.positionY = new FakeAudioParam();
    this.positionZ = new FakeAudioParam();
  }
}

class FakeAudioContext {
  constructor() {
    this.currentTime = 4;
    this.oscillators = [];
  }

  createOscillator() {
    const oscillator = new FakeOscillatorNode();
    this.oscillators.push(oscillator);
    return oscillator;
  }

  createBiquadFilter() {
    this.filter = new FakeFilterNode();
    return this.filter;
  }

  createGain() {
    this.gain = new FakeGainNode();
    return this.gain;
  }

  createPanner() {
    this.panner = new FakePannerNode();
    return this.panner;
  }
}

test('plays a short spatial impact and disconnects it after it ends', () => {
  const context = new FakeAudioContext();
  const destination = new FakeAudioNode();
  const player = new CrashSoundPlayer(context, destination);

  player.play({ x: 2, y: 0, z: -6 });

  const [oscillator] = context.oscillators;
  assert.equal(oscillator.type, 'sawtooth');
  assert.deepEqual(oscillator.frequency.lastValue, [140, 4]);
  assert.deepEqual(oscillator.frequency.exponentialRamps, [[45, 4.28]]);
  assert.equal(context.filter.type, 'lowpass');
  assert.deepEqual(context.filter.frequency.lastValue, [500, 4]);
  assert.deepEqual(context.gain.gain.lastValue, [0, 4]);
  assert.deepEqual(context.gain.gain.linearRamps, [
    [0.18, 4.008],
    [0, 4.28],
  ]);
  assert.equal(context.panner.panningModel, 'HRTF');
  assert.deepEqual(context.panner.positionX.lastValue, [2, 4]);
  assert.deepEqual(context.panner.positionY.lastValue, [0, 4]);
  assert.deepEqual(context.panner.positionZ.lastValue, [-6, 4]);
  assert.equal(oscillator.destination, context.filter);
  assert.equal(context.filter.destination, context.gain);
  assert.equal(context.gain.destination, context.panner);
  assert.equal(context.panner.destination, destination);
  assert.equal(oscillator.startTime, 4);
  assert.equal(oscillator.stopTime, 4.28);

  oscillator.finish();

  assert.equal(oscillator.disconnected, true);
  assert.equal(context.filter.disconnected, true);
  assert.equal(context.gain.disconnected, true);
  assert.equal(context.panner.disconnected, true);
});

test('lets an active impact finish but rejects new impacts after destruction', () => {
  const context = new FakeAudioContext();
  const player = new CrashSoundPlayer(context, new FakeAudioNode());

  player.play({ x: 0, y: 0, z: 0 });
  const [activeOscillator] = context.oscillators;
  player.destroy();
  player.play({ x: 1, y: 0, z: 0 });

  assert.equal(context.oscillators.length, 1);
  assert.notEqual(activeOscillator.disconnected, true);

  activeOscillator.finish();

  assert.equal(activeOscillator.disconnected, true);
});
