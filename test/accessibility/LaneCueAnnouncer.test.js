import assert from 'node:assert/strict';
import test from 'node:test';

import { LaneCueAnnouncer } from '../../src/accessibility/audio/LaneCueAnnouncer.js';

class FakeAudioParam {
  constructor() {
    this.ramps = [];
  }

  setValueAtTime(value, time) {
    this.lastValue = [value, time];
  }

  linearRampToValueAtTime(value, time) {
    this.ramps.push([value, time]);
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

class FakeGainNode extends FakeAudioNode {
  constructor() {
    super();
    this.gain = new FakeAudioParam();
  }
}

class FakeAudioContext {
  constructor() {
    this.currentTime = 5;
  }

  createOscillator() {
    this.oscillator = new FakeOscillatorNode();
    return this.oscillator;
  }

  createGain() {
    this.gain = new FakeGainNode();
    return this.gain;
  }
}

class FakeUtterance {
  constructor(text) {
    this.text = text;
  }
}

test('announces a lane with a left-to-right pitch and English speech', () => {
  const context = new FakeAudioContext();
  const destination = new FakeAudioNode();
  const spoken = [];
  const announcer = new LaneCueAnnouncer({
    audioContext: context,
    destination,
    speechSynthesis: { speak: (utterance) => spoken.push(utterance) },
    Utterance: FakeUtterance,
  });

  announcer.announce(2);

  assert.equal(context.oscillator.type, 'sine');
  assert.deepEqual(context.oscillator.frequency.lastValue, [550, 5]);
  assert.deepEqual(context.gain.gain.lastValue, [0, 5]);
  assert.deepEqual(context.gain.gain.ramps, [
    [0.055, 5.015],
    [0, 5.16],
  ]);
  assert.equal(context.oscillator.destination, context.gain);
  assert.equal(context.gain.destination, destination);
  assert.equal(context.oscillator.startTime, 5);
  assert.equal(context.oscillator.stopTime, 5.16);
  assert.equal(spoken[0].text, 'Lane three');
  assert.equal(spoken[0].lang, 'en-US');

  context.oscillator.finish();

  assert.equal(context.oscillator.disconnected, true);
  assert.equal(context.gain.disconnected, true);
});

test('replaces stale speech and cancels it when silenced', () => {
  const spoken = [];
  const speechSynthesis = {
    cancelCalls: 0,
    cancel() {
      this.cancelCalls += 1;
    },
    speak(utterance) {
      spoken.push(utterance);
    },
  };
  const announcer = new LaneCueAnnouncer({
    audioContext: new FakeAudioContext(),
    destination: new FakeAudioNode(),
    speechSynthesis,
    Utterance: FakeUtterance,
  });

  announcer.announce(0);
  announcer.announce(3);

  assert.equal(speechSynthesis.cancelCalls, 1);
  assert.deepEqual(
    spoken.map(({ text }) => text),
    ['Lane one', 'Lane four'],
  );

  announcer.silence();
  announcer.silence();

  assert.equal(speechSynthesis.cancelCalls, 2);
});
