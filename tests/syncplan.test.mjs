import test from 'node:test';
import assert from 'node:assert/strict';
import { contentHash, mergeCustom, mergeFavorites, mergeNotes, mergeSeen, planSync, stableStringify } from '../src/services/syncCore.ts';

test('hash is order independent for objects but not for arrays', () => {
  assert.equal(contentHash({ a: 1, b: 2 }), contentHash({ b: 2, a: 1 }));
  assert.notEqual(contentHash(['a', 'b']), contentHash(['b', 'a']));
  assert.equal(stableStringify({ z: [1, { y: 2, x: 3 }] }), '{"z":[1,{"x":3,"y":2}]}');
});

const base = { localHash: 'h1', syncedHash: 'h1', syncedAt: 10, remoteUpdatedAt: 10, localEmpty: false };

test('plan: nothing changed', () => assert.equal(planSync(base), 'noop'));
test('plan: only local changed -> upload', () => assert.equal(planSync({ ...base, localHash: 'h2' }), 'upload'));
test('plan: only remote changed -> adopt', () => assert.equal(planSync({ ...base, remoteUpdatedAt: 20 }), 'adopt'));
test('plan: both changed -> merge', () => assert.equal(planSync({ ...base, localHash: 'h2', remoteUpdatedAt: 20 }), 'merge'));
test('plan: first sync with data and empty server uploads', () =>
  assert.equal(planSync({ localHash: 'h', syncedHash: undefined, syncedAt: undefined, remoteUpdatedAt: null, localEmpty: false }), 'upload'));
test('plan: first sync on a new empty device adopts the server copy', () =>
  assert.equal(planSync({ localHash: 'h', syncedHash: undefined, syncedAt: undefined, remoteUpdatedAt: 5, localEmpty: true }), 'adopt'));
test('plan: first sync with data on both sides merges', () =>
  assert.equal(planSync({ localHash: 'h', syncedHash: undefined, syncedAt: undefined, remoteUpdatedAt: 5, localEmpty: false }), 'merge'));
test('plan: nothing anywhere stays quiet', () =>
  assert.equal(planSync({ localHash: 'h', syncedHash: undefined, syncedAt: undefined, remoteUpdatedAt: null, localEmpty: true }), 'noop'));

test('merges', () => {
  assert.deepEqual(mergeFavorites({ a: true }, { b: true }), { a: true, b: true });
  assert.deepEqual(mergeSeen(['b', 'a'], ['c', 'a']), ['a', 'b', 'c']);
  assert.deepEqual(
    mergeNotes({ q1: { text: 'old', updatedAt: 1 }, q2: { text: 'only a', updatedAt: 1 } }, { q1: { text: 'new', updatedAt: 2 }, q3: { text: 'only b', updatedAt: 1 } }),
    { q1: { text: 'new', updatedAt: 2 }, q2: { text: 'only a', updatedAt: 1 }, q3: { text: 'only b', updatedAt: 1 } }
  );
  assert.deepEqual(
    mergeCustom([{ id: 'x', text: 'a', createdAt: 5 }], [{ id: 'x', text: 'a2', createdAt: 9 }, { id: 'y', text: 'b', createdAt: 1 }]).map((q) => `${q.id}:${q.text}`),
    ['y:b', 'x:a2']
  );
});
