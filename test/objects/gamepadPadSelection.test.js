import assert from 'node:assert/strict';
import test from 'node:test';
import { getPlayerPadIndexes } from '../../src/objects/gamepadPadSelection.js';

function pad(index, id, connected = true) {
  return { index, id, connected };
}

test('assigns a Joy-Con at pad 1 to Player 1 and preserves the other pad for Player 2', () => {
  assert.deepEqual(
    getPlayerPadIndexes([pad(0, 'Jabra Link 390'), pad(1, 'Joy-Con L+R (STANDARD GAMEPAD)')]),
    { player1: 1, player2: 0 },
  );
});

test('keeps the existing pad order when no Joy-Con is detected', () => {
  assert.deepEqual(getPlayerPadIndexes([pad(0, 'Controller 0'), pad(1, 'Controller 1')]), {
    player1: 0,
    player2: 1,
  });
});

test('ignores a disconnected Joy-Con', () => {
  assert.deepEqual(getPlayerPadIndexes([pad(0, 'Controller 0'), pad(1, 'Joy-Con L', false)]), {
    player1: 0,
    player2: 1,
  });
});
