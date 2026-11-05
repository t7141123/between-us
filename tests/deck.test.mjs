/** Unit tests for the pure deck logic and the room validators (run with: npm test). */
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildDeckCore,
  categoryOfQid,
  findQidIndex,
  isLockCard,
  migrateFavoriteKeys,
  packIdOfCategory,
  QID_PATTERN,
} from '../src/services/deckCore.ts';
import { normalizeQid, normalizeRoomCategory } from '../functions/api/payment/_lib.js';

const entry = (qid, extra = {}) => ({ id: qid.replace(/:/g, '-'), qid, categoryKey: 'vision', categoryLabel: 'L', text: `T ${qid}`, index: 0, ...extra });
const base = (n) => Array.from({ length: n }, (_, i) => entry(`vision:${i}`));
const pack = (id, n = 6) => Array.from({ length: n }, (_, i) => entry(`pack:${id}:${i + 1}`, { index: i + 1 }));
const identity = (a) => [...a];
const input = (over = {}) => ({
  category: 'vision',
  unlockedPacks: [],
  shuffle: identity,
  baseQuestions: () => base(5),
  packQuestions: (id) => pack(id),
  makeLockCard: (id, shared) => entry(`lock:${id}`, { id: `${id}-lock`, text: shared ? 'shared' : 'trial' }),
  ...over,
});

test('qid helpers', () => {
  assert.ok(QID_PATTERN.test('vision:12') && QID_PATTERN.test('pack:sensual:5'));
  assert.ok(!QID_PATTERN.test('hello') && !QID_PATTERN.test('pack:other:1') && !QID_PATTERN.test('vision:12345'));
  assert.equal(categoryOfQid('pack:sensual:5'), 'pack_sensual');
  assert.equal(categoryOfQid('faith:3'), 'faith');
  assert.equal(categoryOfQid('junk'), null);
  assert.equal(packIdOfCategory('pack_marriage'), 'marriage');
  assert.equal(packIdOfCategory('vision'), null);
  assert.equal(packIdOfCategory('pack_nope'), null);
  assert.equal(findQidIndex(base(3), 'vision:2'), 2);
  assert.equal(findQidIndex(base(3), ''), -1);
});

test('base category: shared target goes first, everything else still present', () => {
  const r = buildDeckCore(input({ initialTarget: { category: 'vision', q: 3 } }));
  assert.equal(r.deck[0].qid, 'vision:2');
  assert.equal(r.deck.length, 5);
  assert.equal(new Set(r.deck.map((q) => q.qid)).size, 5);
});

test('base category: target for another category is ignored', () => {
  const r = buildDeckCore(input({ initialTarget: { category: 'soul', q: 3 } }));
  assert.equal(r.deck[0].qid, 'vision:0');
});

test('unlocked pack: full deck, shared target first', () => {
  const r = buildDeckCore(input({ category: 'pack_sensual', unlockedPacks: ['sensual'], initialTarget: { pack: 'sensual', q: 4 } }));
  assert.equal(r.deck.length, 6);
  assert.equal(r.deck[0].qid, 'pack:sensual:4');
  assert.equal(r.pendingPaid, null);
});

test('locked pack: 3 trial cards then a lock card', () => {
  const r = buildDeckCore(input({ category: 'pack_sensual' }));
  assert.deepEqual(r.deck.map((q) => q.qid), ['pack:sensual:1', 'pack:sensual:2', 'pack:sensual:3', 'lock:sensual']);
  assert.ok(isLockCard(r.deck[3]) && !isLockCard(r.deck[0]));
  assert.equal(r.startIndex, 0);
});

test('locked pack: shared PAID question is remembered and opens after unlocking', () => {
  const locked = buildDeckCore(input({ category: 'pack_sensual', initialTarget: { pack: 'sensual', q: 5 } }));
  assert.equal(locked.deck.at(-1).text, 'shared');
  assert.equal(locked.startIndex, 3); // lands on the lock card
  assert.deepEqual(locked.pendingPaid, { pack: 'sensual', q: 5 });

  const unlocked = buildDeckCore(input({ category: 'pack_sensual', unlockedPacks: ['sensual'], pendingPaid: locked.pendingPaid }));
  assert.equal(unlocked.deck[0].qid, 'pack:sensual:5');
  assert.equal(unlocked.pendingPaid, null);
});

test('locked pack: shared TRIAL question is shown first', () => {
  const r = buildDeckCore(input({ category: 'pack_parenting', initialTarget: { pack: 'parenting', q: 2 } }));
  assert.equal(r.deck[0].qid, 'pack:parenting:2');
  assert.equal(r.deck.length, 4);
});

test('favorites migration: text keys become qids in any language, qids untouched, unknown kept', () => {
  const zh = new Map([['你好嗎', 'vision:1']]);
  const en = new Map([['How are you?', 'vision:1'], ['Other', 'soul:4']]);
  const r = migrateFavoriteKeys({ '你好嗎': true, 'Other': true, 'soul:9': true, 'custom text': true, 'dropped': false }, [zh, en]);
  assert.deepEqual(r.favorites, { 'vision:1': true, 'soul:4': true, 'soul:9': true, 'custom text': true });
  assert.equal(r.changed, true);
  const same = migrateFavoriteKeys({ 'vision:1': true }, [zh, en]);
  assert.equal(same.changed, false);
});

test('room validators accept only known categories and qids', () => {
  assert.equal(normalizeRoomCategory('pack_sensual'), 'pack_sensual');
  assert.equal(normalizeRoomCategory('FINANCE'), 'finance');
  assert.equal(normalizeRoomCategory('sensual'), 'sensual'); // legacy clients
  assert.equal(normalizeRoomCategory('<script>'), null);
  assert.equal(normalizeRoomCategory(5), null);
  assert.equal(normalizeQid('pack:sensual:5'), 'pack:sensual:5');
  assert.equal(normalizeQid('vision:12'), 'vision:12');
  assert.equal(normalizeQid('vision:12; DROP TABLE'), '');
  assert.equal(normalizeQid('anything else'), '');
});

test('session categories keep their order (no shuffle)', () => {
  const ordered = Array.from({ length: 4 }, (_, i) => entry(`soul:${i}`));
  const r = buildDeckCore(input({ category: 'session_warmup', baseQuestions: () => ordered, shuffle: (a) => [...a].reverse() }));
  assert.deepEqual(r.deck.map((q) => q.qid), ['soul:0', 'soul:1', 'soul:2', 'soul:3']);
});

test('rooms accept session categories only in the expected format', () => {
  assert.equal(normalizeRoomCategory('session_warmup'), 'session_warmup');
  assert.equal(normalizeRoomCategory('session_'), null);
  assert.equal(normalizeRoomCategory('session_a b'), null);
});
