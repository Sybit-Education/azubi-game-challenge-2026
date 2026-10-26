import assert from 'node:assert/strict';
import test from 'node:test';

import {
  mapCarToAudioPosition,
  mapSpeedToListenerFrequency,
  resolveRoadLane,
  selectAudibleCars,
} from '../../src/accessibility/audio/carSpatialMath.js';

test('maps a centered car ahead of the listener to negative z', () => {
  const position = mapCarToAudioPosition({ x: 500, y: 200 }, { x: 500, y: 800 }, 800, 1000);

  assert.deepEqual(position, {
    x: 0,
    y: 0,
    z: -18,
    forwardDistance: 600,
  });
});

test('maps one lane to the right onto positive x', () => {
  const position = mapCarToAudioPosition({ x: 700, y: 800 }, { x: 500, y: 800 }, 800, 1000);

  assert.equal(position.x, 2);
});

test('keeps only the three nearest active cars inside the audible window', () => {
  const listener = { x: 500, y: 800 };
  const candidates = [
    { target: { x: 500, y: 700, active: true }, kind: 'enemy' },
    { target: { x: 500, y: 600, active: true }, kind: 'enemy' },
    { target: { x: 500, y: 500, active: true }, kind: 'enemy' },
    { target: { x: 500, y: 400, active: true }, kind: 'enemy' },
    { target: { x: 500, y: 750, active: false }, kind: 'enemy' },
    { target: { x: 500, y: -500, active: true }, kind: 'enemy' },
  ];

  const selected = selectAudibleCars(candidates, listener, 1000, 3);

  assert.deepEqual(
    selected.map(({ target }) => target.y),
    [700, 600, 500],
  );
});

test('raises the listener engine pitch with game speed and clamps both ends', () => {
  assert.equal(mapSpeedToListenerFrequency(500), 84);
  assert.equal(mapSpeedToListenerFrequency(700), 84);
  assert.equal(mapSpeedToListenerFrequency(1150), 108);
  assert.equal(mapSpeedToListenerFrequency(1600), 132);
  assert.equal(mapSpeedToListenerFrequency(2000), 132);
});

test('changes lanes only after crossing a boundary with hysteresis', () => {
  assert.equal(resolveRoadLane(150, 100, 800), 0);
  assert.equal(resolveRoadLane(310, 100, 800, 0), 0);
  assert.equal(resolveRoadLane(321, 100, 800, 0), 1);
  assert.equal(resolveRoadLane(290, 100, 800, 1), 1);
  assert.equal(resolveRoadLane(279, 100, 800, 1), 0);
  assert.equal(resolveRoadLane(900, 100, 800), 3);
});
