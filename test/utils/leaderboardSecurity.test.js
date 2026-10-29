import assert from 'node:assert/strict';
import test from 'node:test';
import * as security from '../../src/utils/leaderboardSecurity.js';

test.beforeEach(() => {
  const values = new Map();
  globalThis.localStorage = {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: (key) => values.delete(key),
  };
});

test('signs the complete leaderboard, including an empty list', async () => {
  assert.equal(typeof security.signLeaderboard, 'function');
  assert.equal(typeof security.verifyLeaderboard, 'function');
  for (const entries of [
    [],
    [{ name: 'Test', distance: 10, score: 50, token: 'tab', sig: 'entry' }],
  ]) {
    const board = await security.signLeaderboard(entries);
    assert.equal(board.version, 1);
    assert.deepEqual(board.entries, entries);
    assert.equal((await security.verifyLeaderboard(board)).valid, true);
  }
});

test('detects changed, removed, added and reordered entries and changed versions', async () => {
  assert.equal(typeof security.signLeaderboard, 'function');
  const board = await security.signLeaderboard([
    { name: 'One', distance: 10, score: 100, token: 'tab', sig: 'one' },
    { name: 'Two', distance: 5, score: 50, token: 'tab', sig: 'two' },
  ]);
  const mutations = [
    { ...board, version: 2 },
    { ...board, entries: [] },
    { ...board, entries: board.entries.slice(1) },
    { ...board, entries: [...board.entries].reverse() },
    { ...board, entries: [...board.entries, board.entries[0]] },
    ...['name', 'distance', 'score', 'token', 'sig'].map((field) => ({
      ...board,
      entries: [{ ...board.entries[0], [field]: 'changed' }, board.entries[1]],
    })),
    { ...board, sig: '' },
    { ...board, sig: undefined },
  ];
  for (const changed of mutations) {
    assert.equal((await security.verifyLeaderboard(changed)).valid, false);
  }
});

test('preserves entry verification and rejects unsigned entries', async () => {
  const entry = await security.signEntry({ name: 'Test', distance: 10, score: 50, token: 'tab' });
  assert.equal((await security.verifyEntry(entry)).valid, true);
  assert.equal((await security.verifyEntry({ ...entry, sig: undefined })).valid, false);
  assert.equal((await security.verifyEntry({ ...entry, score: 100 })).valid, false);
});

test('stores a signed envelope using the sybitkart prefix and only persistent entry fields', async () => {
  assert.equal(typeof security.saveLeaderboard, 'function');
  const entry = await security.signEntry({ name: 'Test', distance: 10, score: 50, token: 'tab' });
  await security.saveLeaderboard([{ ...entry, isTampered: false }]);
  const stored = JSON.parse(localStorage.getItem('sybitkart:leaderboard'));
  assert.equal(localStorage.getItem('leaderboard'), null);
  assert.deepEqual(stored.entries, [entry]);
  assert.equal((await security.verifyLeaderboard(stored)).valid, true);
  const loaded = await security.loadLeaderboard();
  assert.equal(loaded.isTampered, false);
  assert.equal(loaded.entries[0].isTampered, false);
});

test('migrates legacy storage without signing invalid entries as trusted', async () => {
  assert.equal(typeof security.loadLeaderboard, 'function');
  const valid = await security.signEntry({ name: 'Valid', distance: 10, score: 50, token: 'tab' });
  localStorage.setItem('leaderboard', JSON.stringify([valid, { name: 'Unsigned', distance: 20 }]));
  const loaded = await security.loadLeaderboard();
  assert.equal(localStorage.getItem('leaderboard'), null);
  const migrated = JSON.parse(localStorage.getItem('sybitkart:leaderboard'));
  assert.equal((await security.verifyLeaderboard(migrated)).valid, true);
  assert.equal(loaded.entries.find(({ name }) => name === 'Valid').isTampered, false);
  assert.equal(loaded.entries.find(({ name }) => name === 'Unsigned').isTampered, true);
  assert.equal(migrated.entries.find(({ name }) => name === 'Valid').sig, valid.sig);
});

test('does not fall back to legacy storage when the new envelope is invalid', async () => {
  assert.equal(typeof security.loadLeaderboard, 'function');
  localStorage.setItem('sybitkart:leaderboard', '{broken');
  localStorage.setItem('leaderboard', JSON.stringify([{ name: 'Fallback', distance: 100 }]));
  const loaded = await security.loadLeaderboard();
  assert.equal(loaded.isTampered, true);
  assert.deepEqual(loaded.entries, []);
});

test('preserves whole-board tampering after subsequent saves, even for an empty list', async () => {
  assert.equal(typeof security.saveLeaderboard, 'function');
  const entry = await security.signEntry({ name: 'Test', distance: 10, score: 50, token: 'tab' });
  await security.saveLeaderboard([entry]);
  const changed = JSON.parse(localStorage.getItem('sybitkart:leaderboard'));
  changed.entries = [];
  localStorage.setItem('sybitkart:leaderboard', JSON.stringify(changed));
  const loaded = await security.loadLeaderboard();
  assert.equal(loaded.isTampered, true);
  assert.deepEqual(loaded.entries, []);
  await security.saveLeaderboard([entry], { isTampered: loaded.isTampered });
  assert.equal((await security.loadLeaderboard()).isTampered, true);
});

test('marks malformed envelopes as tampered but treats a fresh browser as empty', async () => {
  assert.equal(typeof security.loadLeaderboard, 'function');
  assert.deepEqual(await security.loadLeaderboard(), { entries: [], isTampered: false });
  for (const raw of ['null', '[]', '{}', '{broken', '{"version":1,"entries":[],"sig":""}']) {
    localStorage.setItem('sybitkart:leaderboard', raw);
    assert.equal((await security.loadLeaderboard()).isTampered, true);
  }
});

test('chooses the best score at equal distance and retains per-entry tamper flags', async () => {
  assert.equal(typeof security.saveLeaderboard, 'function');
  const low = await security.signEntry({ name: 'Test', distance: 10, score: 50, token: 'tab' });
  const high = await security.signEntry({ ...low, name: 'test', score: 100 });
  await security.saveLeaderboard([low, high, { name: 'Unsigned', distance: 20 }]);
  const loaded = await security.loadLeaderboard();
  assert.equal(loaded.entries.length, 2);
  assert.equal(loaded.entries[0].isTampered, true);
  assert.equal(loaded.entries[1].score, 100);
});

test('reports unavailable storage without aborting leaderboard creation', async () => {
  localStorage.getItem = () => {
    throw new Error('Storage access denied');
  };
  assert.deepEqual(await security.loadLeaderboard(), { entries: [], isTampered: true });
});

test('keeps readable legacy entries if migration cannot persist the new envelope', async () => {
  const entry = await security.signEntry({ name: 'Test', distance: 10, score: 50, token: 'tab' });
  const legacy = JSON.stringify([entry]);
  localStorage.setItem('leaderboard', legacy);
  localStorage.setItem = () => {
    throw new Error('Storage quota exceeded');
  };
  const loaded = await security.loadLeaderboard();
  assert.equal(loaded.entries[0].name, 'Test');
  assert.equal(loaded.entries[0].isTampered, false);
  assert.equal(loaded.isTampered, false);
  assert.equal(localStorage.getItem('leaderboard'), legacy);
  assert.equal(localStorage.getItem('sybitkart:leaderboard'), null);
});

test('keeps the migrated envelope if removing the legacy key is denied', async () => {
  localStorage.setItem('leaderboard', '[]');
  localStorage.removeItem = () => {
    throw new Error('Storage removal denied');
  };
  assert.deepEqual(await security.loadLeaderboard(), { entries: [], isTampered: false });
  assert.equal(
    (await security.verifyLeaderboard(JSON.parse(localStorage.getItem('sybitkart:leaderboard'))))
      .valid,
    true,
  );
});
