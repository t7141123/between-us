import test from 'node:test';
import assert from 'node:assert/strict';
import { dailyQid, hashString, sanitizeReminder, upcomingTriggerDates } from '../src/services/dailyCore.ts';

const pool = Array.from({ length: 350 }, (_, i) => `vision:${i}`);

test('dailyQid is deterministic, in range and varies across days', () => {
  assert.equal(dailyQid('2026-11-05', pool), dailyQid('2026-11-05', pool));
  const picks = new Set();
  for (let d = 1; d <= 28; d++) picks.add(dailyQid(`2026-11-${String(d).padStart(2, '0')}`, pool));
  assert.ok(picks.size >= 24, `expected variety, got ${picks.size}`);
  assert.ok(pool.includes(dailyQid('2030-01-01', pool)));
  assert.equal(dailyQid('2026-11-05', []), null);
  assert.equal(hashString('a') >= 0, true);
});

test('upcomingTriggerDates skips a slot that already passed today', () => {
  const now = new Date(2026, 10, 5, 21, 30);
  const d = upcomingTriggerDates(now, 21, 0, 3);
  assert.equal(d.length, 3);
  assert.equal(d[0].getDate(), 6);
  const early = upcomingTriggerDates(new Date(2026, 10, 5, 8, 0), 21, 0, 3);
  assert.equal(early[0].getDate(), 5);
  assert.ok(d.every((x) => x.getHours() === 21 && x.getMinutes() === 0));
});

test('sanitizeReminder repairs bad stored data', () => {
  assert.deepEqual(sanitizeReminder(null), { enabled: false, hour: 21, minute: 0 });
  assert.deepEqual(sanitizeReminder({ enabled: true, hour: 99, minute: -1 }), { enabled: true, hour: 21, minute: 0 });
  assert.deepEqual(sanitizeReminder({ enabled: 'yes', hour: 20, minute: 30 }), { enabled: false, hour: 20, minute: 30 });
});
