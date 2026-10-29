import assert from 'node:assert/strict';
import test from 'node:test';
import GameSpeech from '../../audio/GameSpeech.js';

class Utterance {
  constructor(text) {
    this.text = text;
  }
}

function createSpeech(voices = []) {
  const spoken = [];
  let cancellations = 0;
  const speech = new GameSpeech({
    Utterance,
    speechSynthesis: {
      getVoices: () => voices,
      speak: (message) => spoken.push(message),
      cancel: () => cancellations++,
    },
  });
  return { speech, spoken, cancellations: () => cancellations };
}

test('speech stays English even when only a German voice is installed', () => {
  const { speech, spoken } = createSpeech([{ lang: 'de-DE' }]);
  speech.speak('Lane one', { key: 'lane' });
  assert.equal(spoken[0].lang, 'en-US');
  assert.equal(spoken[0].text, 'Lane one');
  assert.equal(spoken[0].voice, null);
});

test('lane changes interrupt coins and resume the latest balance afterwards', () => {
  const { speech, spoken, cancellations } = createSpeech();
  speech.speak('10 coins', { key: 'coins' });
  const interrupted = spoken[0];
  speech.speak('Lane two', { key: 'lane', interrupt: true });
  speech.speak('20 coins', { key: 'coins' });
  assert.equal(cancellations(), 1);
  interrupted.onend();
  assert.equal(spoken.length, 2);
  spoken[1].onend();
  assert.equal(spoken[2].text, '20 coins');
});

test('rapid lane changes discard stale lanes but keep a pending balance', () => {
  const { speech, spoken } = createSpeech();
  speech.speak('Lane one', { key: 'lane', interrupt: true });
  speech.speak('10 coins', { key: 'coins' });
  speech.speak('Lane three', { key: 'lane', interrupt: true });
  spoken[1].onend();
  assert.deepEqual(
    spoken.map(({ text }) => text),
    ['Lane one', 'Lane three', '10 coins'],
  );
});

test('silence clears queued balances and ignores delayed completion callbacks', () => {
  const { speech, spoken, cancellations } = createSpeech();
  speech.speak('Lane one', { key: 'lane', interrupt: true });
  speech.speak('10 coins', { key: 'coins' });
  speech.silence();
  spoken[0].onend();
  speech.silence();
  assert.equal(cancellations(), 1);
  assert.equal(spoken.length, 1);
});

test('missing browser speech support does not break gameplay', () => {
  const speech = new GameSpeech({ speechSynthesis: null, Utterance: null });
  assert.equal(speech.available, false);
  assert.doesNotThrow(() => speech.speak('Lane one', { key: 'lane', interrupt: true }));
  assert.doesNotThrow(() => speech.destroy());
});

test('discards an interrupted item that expires before the lane announcement ends', () => {
  const { speech, spoken } = createSpeech();
  let ahead = true;
  speech.speak('Mystery box, lane 2', { key: 'item', isValid: () => ahead });
  speech.speak('Lane two', { key: 'lane', interrupt: true });
  speech.speak('5 coins', { key: 'coins' });
  ahead = false;
  spoken[1].onend();
  assert.deepEqual(
    spoken.map(({ text }) => text),
    ['Mystery box, lane 2', 'Lane two', '5 coins'],
  );
});

test('resumes an interrupted item while its target is still valid', () => {
  const { speech, spoken } = createSpeech();
  speech.speak('Mystery box, lane 2', { key: 'item', isValid: () => true });
  speech.speak('Lane two', { key: 'lane', interrupt: true });
  spoken[1].onend();
  assert.equal(spoken[2].text, 'Mystery box, lane 2');
});
