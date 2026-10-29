import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';
import GameSpeech from '../../audio/GameSpeech.js';
import { getPickupWarningSeconds } from '../../src/accessibility/warningTiming.js';

// Substitute only the Phaser-backed Item class so these checks can run without a browser.
class Item {}
const source = fs
  .readFileSync(new URL('../../src/accessibility/ItemAnnouncements.js', import.meta.url), 'utf8')
  .replace(/^import .*;\n/gm, '')
  .replace('export default class', 'class');
const ItemAnnouncements = vm.runInNewContext(`${source}\nItemAnnouncements`, {
  Item,
  getPickupWarningSeconds,
});

function createScenario() {
  const spoken = [];
  const speech = new GameSpeech({
    Utterance: class {
      constructor(text) {
        this.text = text;
      }
    },
    speechSynthesis: {
      getVoices: () => [],
      speak: (message) => spoken.push(message),
      cancel() {},
    },
  });
  const scene = {
    registry: { get: () => true },
    car: { dead: false, body: { top: 700, velocity: { y: 0 } } },
    scale: { height: 1200 },
    roadObjects: [],
    sound: { locked: false },
    speech,
    iceWarning: { isPlaying: false },
    currentLaneDanger: null,
  };
  const box = (lane, bottom) =>
    Object.assign(new Item(), {
      lane,
      active: true,
      speed: 700,
      body: { enable: true, bottom },
    });
  return { scene, spoken, box, announcer: new ItemAnnouncements(scene) };
}

test('an announced box does not block another box farther ahead', () => {
  const { scene, spoken, box, announcer } = createScenario();
  scene.roadObjects = [box(1, 200), box(3, 0)];
  announcer.update();
  spoken[0].onend();
  announcer.update();
  spoken[1].onend();
  announcer.update();
  assert.deepEqual(
    spoken.map(({ text }) => text),
    ['Mystery box, lane 2', 'Mystery box, lane 4'],
  );
});

for (const expired of ['collected', 'passed', 'removed']) {
  test(`a ${expired} box cannot resume after an interrupting lane announcement`, () => {
    const { scene, spoken, box, announcer } = createScenario();
    const target = box(1, 200);
    scene.roadObjects = [target];
    announcer.update();
    scene.speech.speak('Lane two', { key: 'lane', interrupt: true });
    if (expired === 'collected') {
      target.active = false;
      target.body = null;
    } else if (expired === 'passed') {
      target.body.bottom = 701;
    } else {
      scene.roadObjects = [];
    }
    // Check the speech callback before another frame can clean up the target.
    spoken[1].onend();
    assert.equal(spoken.length, 2);
    announcer.update();
    assert.equal(announcer.currentBox, null);
  });
}

test('passing a box cancels its running announcement without cancelling the next lane', () => {
  const { scene, spoken, box, announcer } = createScenario();
  const target = box(1, 200);
  scene.roadObjects = [target];
  announcer.update();
  target.body.bottom = 701;
  announcer.update();
  assert.equal(scene.speech.current, null);
  scene.speech.speak('Lane three', { key: 'lane', interrupt: true });
  spoken[0].onend();
  assert.equal(scene.speech.current.key, 'lane');
});

for (const reason of ['disabled', 'dead']) {
  test(`${reason} gameplay discards pending item speech`, () => {
    const { scene, spoken, box, announcer } = createScenario();
    scene.roadObjects = [box(1, 200)];
    announcer.update();
    scene.speech.speak('Lane two', { key: 'lane', interrupt: true });
    if (reason === 'disabled') scene.registry.get = () => false;
    else scene.car.dead = true;
    spoken[1].onend();
    assert.equal(spoken.length, 2);
    announcer.update();
    assert.equal(
      scene.speech.pending.some((message) => message.key === 'item'),
      false,
    );
  });
}
