import assert from 'node:assert/strict';
import test from 'node:test';

import { keepAudioOutputAwake } from '../../audio/keepAudioOutputAwake.js';

/**
 * Creates a minimal audio context that records its constant sources.
 *
 * @returns A fixture containing the fake context and its created sources.
 */
function createContext() {
  const sources = [];
  const context = {
    destination: {},
    createConstantSource() {
      const source = {
        offset: { value: 1 },
        connectedTo: null,
        started: false,
        connect(node) {
          this.connectedTo = node;
        },
        start() {
          this.started = true;
        },
      };
      sources.push(source);
      return source;
    },
  };
  return { context, sources };
}

test('starts one quiet, non-silent source on the destination', () => {
  const { context, sources } = createContext();

  const source = keepAudioOutputAwake({ context });
  assert.equal(keepAudioOutputAwake({ context }), source);

  assert.equal(sources.length, 1);
  assert.equal(source, sources[0]);
  assert.equal(source.started, true);
  assert.equal(source.connectedTo, context.destination);
  assert.ok(source.offset.value > 0 && source.offset.value <= 0.001);
});

test('does nothing without Web Audio or ConstantSource support', () => {
  assert.equal(keepAudioOutputAwake({}), null);
  assert.equal(keepAudioOutputAwake(undefined), null);
  assert.equal(keepAudioOutputAwake({ context: {} }), null);
});

test('creates an independent source for each audio context', () => {
  const first = createContext();
  const second = createContext();

  const firstSource = keepAudioOutputAwake({ context: first.context });
  const secondSource = keepAudioOutputAwake({ context: second.context });

  assert.notEqual(firstSource, secondSource);
  assert.equal(first.sources.length, 1);
  assert.equal(second.sources.length, 1);
});
