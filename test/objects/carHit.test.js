import assert from 'node:assert/strict';
import test from 'node:test';

import * as carHit from '../../src/objects/carHit.js';

const { resolveCarHit } = carHit;

test('ignores collisions that cannot damage the car', () => {
  const protectedStates = [
    { dead: true, invulnerable: false, shieldActive: false, extraLifeActive: false },
    { dead: false, invulnerable: true, shieldActive: false, extraLifeActive: false },
    { dead: false, invulnerable: false, shieldActive: true, extraLifeActive: false },
  ];

  for (const state of protectedStates) {
    assert.equal(resolveCarHit(state), 'ignored');
  }
});

test('distinguishes an extra-life hit from a fatal hit', () => {
  assert.equal(
    resolveCarHit({
      dead: false,
      invulnerable: false,
      shieldActive: false,
      extraLifeActive: true,
    }),
    'extra-life',
  );
  assert.equal(
    resolveCarHit({
      dead: false,
      invulnerable: false,
      shieldActive: false,
      extraLifeActive: false,
    }),
    'fatal',
  );
});

test('announces an effective hit before applying its outcome', () => {
  const events = [];
  const car = { dead: false };
  const runHit = (extraLifeActive) =>
    carHit.handleCarHit({
      car,
      extraLifeActive,
      gameOver: () => events.push('game-over'),
      invulnerable: false,
      onEffectiveHit: () => events.push('effective-hit'),
      shieldActive: false,
      useExtraLife: () => events.push('extra-life'),
    });

  runHit(true);
  runHit(false);

  assert.deepEqual(events, ['effective-hit', 'extra-life', 'effective-hit', 'game-over']);
});

test('does not announce a protected hit', () => {
  const events = [];
  const outcome = carHit.handleCarHit({
    car: { dead: false },
    extraLifeActive: false,
    gameOver: () => events.push('game-over'),
    invulnerable: false,
    onEffectiveHit: () => events.push('effective-hit'),
    shieldActive: true,
    useExtraLife: () => events.push('extra-life'),
  });

  assert.equal(outcome, 'ignored');
  assert.deepEqual(events, []);
});
