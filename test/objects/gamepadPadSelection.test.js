import assert from 'node:assert/strict';
import test from 'node:test';
import { getPlayerPads } from '../../src/objects/gamepadPadSelection.js';

function pad(index, id, connected = true) {
  return { index, id, connected, axes: [0, 0], buttons: [] };
}

test('assigns a Joy-Con at pad 1 to Player 1 and preserves the other pad for Player 2', () => {
  const { player1, player2 } = getPlayerPads([
    pad(0, 'Jabra Link 390'),
    pad(1, 'Joy-Con (R) (STANDARD GAMEPAD)'),
  ]);
  assert.equal(player1.joyCon, true);
  assert.equal(player2.joyCon, false);
});

test('keeps the existing pad order when no Joy-Con is detected', () => {
  const { player1, player2 } = getPlayerPads([pad(0, 'Controller 0'), pad(1, 'Controller 1')]);
  assert.ok(player1);
  assert.ok(player2);
  assert.equal(player1.joyCon, false);
  assert.equal(player2.joyCon, false);
});

test('ignores a disconnected Joy-Con', () => {
  const { player1, player2 } = getPlayerPads([
    pad(0, 'Controller 0'),
    pad(1, 'Joy-Con (L)', false),
  ]);
  assert.equal(player1.joyCon, false);
  assert.equal(player2, null);
});
