import assert from 'node:assert/strict';
import test from 'node:test';

import { getEngineVoice } from '../../src/accessibility/audio/engineVoice.js';

test('uses a quieter distinct voice for the listener engine', () => {
  assert.deepEqual(getEngineVoice('listener'), {
    frequency: 84,
    targetGain: 0.035,
  });
  assert.deepEqual(getEngineVoice('enemy'), {
    frequency: 72,
    targetGain: 0.08,
  });
  assert.deepEqual(getEngineVoice('opponent'), {
    frequency: 108,
    targetGain: 0.08,
  });
});
