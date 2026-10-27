import assert from 'node:assert/strict';
import test from 'node:test';

import { LaneCueAnnouncer } from '../../audio/LaneCueAnnouncer.js';
import LaneAnnouncements from '../../audio/LaneAnnouncements.js';

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

test('selects an installed US English voice instead of the browser default', () => {
  const spoken = [];
  const germanVoice = { lang: 'de-DE', name: 'Deutsch' };
  const englishVoice = { lang: 'en-US', name: 'English US' };
  const announcer = new LaneCueAnnouncer({
    audioContext: new FakeAudioContext(),
    destination: new FakeAudioNode(),
    speechSynthesis: {
      getVoices: () => [germanVoice, englishVoice],
      speak: (utterance) => spoken.push(utterance),
    },
    Utterance: FakeUtterance,
  });

  announcer.announce(0);

  assert.equal(spoken[0].voice, englishVoice);
  assert.equal(spoken[0].lang, 'en-US');
});

test('uses an English voice that becomes available after construction', () => {
  const spoken = [];
  const listeners = new Map();
  const germanVoice = { lang: 'de-DE', name: 'Deutsch' };
  const englishVoice = { lang: 'en-GB', name: 'English UK' };
  let voices = [germanVoice];
  const announcer = new LaneCueAnnouncer({
    audioContext: new FakeAudioContext(),
    destination: new FakeAudioNode(),
    speechSynthesis: {
      addEventListener: (eventName, listener) => listeners.set(eventName, listener),
      getVoices: () => voices,
      speak: (utterance) => spoken.push(utterance),
    },
    Utterance: FakeUtterance,
  });

  voices = [germanVoice, englishVoice];
  const handleVoicesChanged = listeners.get('voiceschanged');
  assert.equal(typeof handleVoicesChanged, 'function');
  handleVoicesChanged();
  announcer.announce(1);

  assert.equal(spoken[0].voice, englishVoice);
  assert.equal(spoken[0].lang, 'en-GB');
});

test('stops listening for browser voice changes when destroyed', () => {
  const listeners = new Map();
  const speechSynthesis = {
    addEventListener: (eventName, listener) => listeners.set(eventName, listener),
    getVoices: () => [],
    removeEventListener: (eventName, listener) => {
      if (listeners.get(eventName) === listener) listeners.delete(eventName);
    },
  };
  const announcer = new LaneCueAnnouncer({
    audioContext: new FakeAudioContext(),
    destination: new FakeAudioNode(),
    speechSynthesis,
    Utterance: FakeUtterance,
  });

  announcer.destroy();

  assert.equal(listeners.has('voiceschanged'), false);
});

test('announces a lane with a left-to-right pitch and English speech', () => {
  const context = new FakeAudioContext();
  const destination = new FakeAudioNode();
  const spoken = [];
  const announcer = new LaneCueAnnouncer({
    audioContext: context,
    destination,
    speechSynthesis: {
      getVoices: () => [{ lang: 'en-US', name: 'English US' }],
      speak: (utterance) => spoken.push(utterance),
    },
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
    getVoices() {
      return [{ lang: 'en-US', name: 'English US' }];
    },
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

function createScene() {
  const listeners = new Map();
  const context = new FakeAudioContext();
  context.state = 'running';
  const scene = {
    enabled: true,
    lane: 0,
    car: { dead: false },
    sound: { context, destination: new FakeAudioNode(), locked: false },
    registry: { get: () => scene.enabled },
    getPlayerLane: () => scene.lane,
    events: {
      on: (event, listener) => listeners.set(event, listener),
      once: (event, listener) => listeners.set(event, listener),
      off: (event, listener) => {
        if (listeners.get(event) === listener) listeners.delete(event);
      },
    },
  };
  return { scene, listeners, context };
}

test('scene integration announces the initial lane and each change only once', () => {
  const { scene, context } = createScene();
  const announcements = new LaneAnnouncements(scene);
  announcements.update();
  const firstCue = context.oscillator;
  assert.deepEqual(firstCue.frequency.lastValue, [330, 5]);

  announcements.update();
  assert.equal(context.oscillator, firstCue);

  scene.lane = 3;
  announcements.update();
  assert.notEqual(context.oscillator, firstCue);
  assert.deepEqual(context.oscillator.frequency.lastValue, [660, 5]);
});

test('disabled, dead and audio-locked scenes stay silent', () => {
  const { scene, context } = createScene();
  const announcements = new LaneAnnouncements(scene);
  scene.enabled = false;
  announcements.update();
  assert.equal(context.oscillator, undefined);

  scene.enabled = true;
  scene.car.dead = true;
  announcements.update();
  assert.equal(context.oscillator, undefined);

  scene.car.dead = false;
  scene.sound.locked = true;
  announcements.update();
  assert.equal(context.oscillator, undefined);
});

test('pause and shutdown stop cues and remove scene listeners', () => {
  const { scene, context, listeners } = createScene();
  const announcements = new LaneAnnouncements(scene);
  announcements.update();
  listeners.get('pause')();
  assert.equal(context.oscillator.disconnected, true);

  announcements.update();
  listeners.get('shutdown')();
  assert.equal(context.oscillator.disconnected, true);
  assert.equal(listeners.has('pause'), false);
  assert.equal(listeners.has('sleep'), false);
});

test('without Web Audio the announcer can still use browser speech', () => {
  const { scene } = createScene();
  scene.sound = { locked: false };
  const spoken = [];
  scene.speech = {
    speak: (text) => spoken.push(text),
    cancel() {},
  };
  const announcements = new LaneAnnouncements(scene);
  assert.doesNotThrow(() => announcements.update());
  assert.deepEqual(spoken, ['Lane one']);
});
