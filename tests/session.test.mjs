import test from 'node:test';
import assert from 'node:assert/strict';
import { pickSessionQids, sessionIdOfCategory } from '../src/services/sessionCore.ts';
import { SESSIONS } from '../src/constants/sessions.ts';

const cats = ['vision', 'soul', 'finance', 'intimacy', 'fun', 'growth', 'faith'];
const pool = Object.fromEntries(cats.map((c) => [c, Array.from({ length: 50 }, (_, i) => `${c}:${i}`)]));

test('session picks are deterministic per day, differ across days, and follow the category order', () => {
  for (const def of SESSIONS) {
    const a = pickSessionQids(def, pool, '2026-11-05');
    assert.deepEqual(a, pickSessionQids(def, pool, '2026-11-05'));
    assert.equal(a.length, 10);
    assert.deepEqual(a.map((q) => q.split(':')[0]), def.steps);
    assert.equal(new Set(a).size, 10, 'no repeated question');
    assert.notDeepEqual(a, pickSessionQids(def, pool, '2026-11-06'));
  }
});

test('different sessions on the same day do not share their picks by accident', () => {
  const [w, d] = [SESSIONS[0], SESSIONS[1]].map((def) => pickSessionQids(def, pool, '2026-11-05'));
  assert.notDeepEqual(w, d);
});

test('tiny pools never repeat and never loop forever', () => {
  const tiny = { fun: ['fun:0', 'fun:1'] };
  const out = pickSessionQids({ id: 't', free: true, steps: ['fun', 'fun', 'fun'] }, tiny, 'd');
  assert.equal(out.length, 2);
  assert.equal(new Set(out).size, 2);
  assert.deepEqual(pickSessionQids({ id: 't', free: true, steps: ['nope'] }, tiny, 'd'), []);
});

test('exactly one session is free', () => {
  assert.equal(SESSIONS.filter((s) => s.free).length, 1);
  assert.equal(sessionIdOfCategory('session_warmup'), 'warmup');
  assert.equal(sessionIdOfCategory('vision'), null);
});
