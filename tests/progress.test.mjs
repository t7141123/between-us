import test from 'node:test';
import assert from 'node:assert/strict';
import { countSeen, currentStreak, dayKey, EMPTY_STREAK, previousDay, prioritizeUnseen, recordActivity } from '../src/services/progressCore.ts';

const q = (qid, extra = {}) => ({ id: qid.replace(/:/g, '-'), qid, categoryKey: 'vision', categoryLabel: '', text: qid, index: 0, ...extra });
const deck = ['a:1', 'a:2', 'a:3', 'a:4'].map((x) => q(x));

test('dayKey / previousDay handle month and year boundaries', () => {
  assert.equal(dayKey(new Date(2026, 10, 4)), '2026-11-04');
  assert.equal(previousDay('2026-11-01'), '2026-10-31');
  assert.equal(previousDay('2026-01-01'), '2025-12-31');
  assert.equal(previousDay('2028-03-01'), '2028-02-29');
});

test('streak: counts consecutive days, idempotent per day, resets after a gap', () => {
  let s = recordActivity(EMPTY_STREAK, '2026-11-01');
  assert.deepEqual(s, { lastDay: '2026-11-01', count: 1, best: 1 });
  assert.equal(recordActivity(s, '2026-11-01'), s);
  s = recordActivity(s, '2026-11-02');
  s = recordActivity(s, '2026-11-03');
  assert.deepEqual(s, { lastDay: '2026-11-03', count: 3, best: 3 });
  s = recordActivity(s, '2026-11-06'); // missed two days
  assert.deepEqual(s, { lastDay: '2026-11-06', count: 1, best: 3 });
});

test('streak display is 0 once a full day was missed, still shown the day after', () => {
  const s = { lastDay: '2026-11-03', count: 4, best: 4 };
  assert.equal(currentStreak(s, '2026-11-03'), 4);
  assert.equal(currentStreak(s, '2026-11-04'), 4);
  assert.equal(currentStreak(s, '2026-11-05'), 0);
  assert.equal(currentStreak(EMPTY_STREAK, '2026-11-05'), 0);
});

test('prioritizeUnseen: unseen first, stable order, nothing lost', () => {
  const out = prioritizeUnseen(deck, new Set(['a:1', 'a:3']));
  assert.deepEqual(out.map((x) => x.qid), ['a:2', 'a:4', 'a:1', 'a:3']);
});

test('prioritizeUnseen: lock cards stay last, pinned first card stays first', () => {
  const lock = q('lock:sensual', { id: 'sensual-lock' });
  const withLock = [...deck, lock];
  const out = prioritizeUnseen(withLock, new Set(['a:1', 'a:2']), true);
  assert.deepEqual(out.map((x) => x.qid), ['a:1', 'a:3', 'a:4', 'a:2', 'lock:sensual']);
});

test('countSeen ignores lock cards', () => {
  const lock = q('lock:sensual', { id: 'sensual-lock' });
  assert.deepEqual(countSeen([...deck, lock], new Set(['a:1', 'lock:sensual', 'zzz'])), { seen: 1, total: 4 });
});
