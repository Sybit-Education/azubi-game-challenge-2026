import assert from 'node:assert/strict';
import test from 'node:test';

import {
  getAccessibilityMode,
  setAccessibilityMode,
} from '../../src/accessibility/accessibilityMode.js';

class FakeRegistry {
  constructor(entries = []) {
    this.values = new Map(entries);
  }

  get(key) {
    return this.values.get(key);
  }

  set(key, value) {
    this.values.set(key, value);
  }
}

test('uses the legacy HTML key when the canonical mode is unset', () => {
  const registry = new FakeRegistry([['accessibility enabled', true]]);

  assert.equal(getAccessibilityMode(registry), true);
});

test('treats accessibilityMode as the canonical setting', () => {
  const registry = new FakeRegistry([
    ['accessibilityMode', false],
    ['accessibility enabled', true],
  ]);

  assert.equal(getAccessibilityMode(registry), false);
});

test('keeps the canvas and HTML setting keys synchronized', () => {
  const registry = new FakeRegistry();

  setAccessibilityMode(registry, true);

  assert.equal(registry.get('accessibilityMode'), true);
  assert.equal(registry.get('accessibility enabled'), true);

  setAccessibilityMode(registry, false);

  assert.equal(registry.get('accessibilityMode'), false);
  assert.equal(registry.get('accessibility enabled'), false);
});
