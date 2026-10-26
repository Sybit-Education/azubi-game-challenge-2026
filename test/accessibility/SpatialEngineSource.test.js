import assert from 'node:assert/strict';
import test from 'node:test';

import { SpatialEngineSource } from '../../src/accessibility/audio/SpatialEngineSource.js';

class FakeAudioParam {
  setValueAtTime(value, time) {
    this.lastValue = [value, time];
  }

  setTargetAtTime(value, time, timeConstant) {
    this.lastTarget = [value, time, timeConstant];
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
    this.stopCalls = 0;
  }

  start() {
    this.started = true;
  }

  stop() {
    this.stopped = true;
    this.stopCalls += 1;
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
    this.currentTime = 5;
    this.oscillator = new FakeOscillatorNode();
    this.filter = new FakeFilterNode();
    this.gain = new FakeGainNode();
    this.panner = new FakePannerNode();
  }

  createOscillator() {
    return this.oscillator;
  }

  createBiquadFilter() {
    return this.filter;
  }

  createGain() {
    return this.gain;
  }

  createPanner() {
    return this.panner;
  }
}

test('creates, positions, and disposes a spatial engine graph', () => {
  const context = new FakeAudioContext();
  const destination = new FakeAudioNode();
  const source = new SpatialEngineSource(context, destination, 72);

  assert.equal(context.oscillator.type, 'sawtooth');
  assert.deepEqual(context.oscillator.frequency.lastValue, [72, 5]);
  assert.equal(context.oscillator.destination, context.filter);
  assert.equal(context.filter.destination, context.gain);
  assert.equal(context.gain.destination, context.panner);
  assert.equal(context.panner.destination, destination);
  assert.equal(context.panner.panningModel, 'HRTF');
  assert.equal(context.oscillator.started, true);

  source.setPosition({ x: 2, y: 0, z: -12 });

  assert.deepEqual(context.panner.positionX.lastTarget, [2, 5, 0.04]);
  assert.deepEqual(context.panner.positionY.lastTarget, [0, 5, 0.04]);
  assert.deepEqual(context.panner.positionZ.lastTarget, [-12, 5, 0.04]);
  assert.deepEqual(context.gain.gain.lastTarget, [0.08, 5, 0.04]);

  source.destroy();
  source.destroy();

  assert.equal(context.oscillator.stopped, true);
  assert.equal(context.oscillator.stopCalls, 1);
  assert.equal(context.oscillator.disconnected, true);
  assert.equal(context.filter.disconnected, true);
  assert.equal(context.gain.disconnected, true);
  assert.equal(context.panner.disconnected, true);
});
