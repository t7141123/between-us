import test from 'node:test';
import assert from 'node:assert/strict';
import { afterCompletion, allowedDuration } from '../src/services/timerCore.ts';

test('free users are limited to 5 minutes, Plus can pick known lengths only', () => {
  assert.equal(allowedDuration(900, false), 300);
  assert.equal(allowedDuration(900, true), 900);
  assert.equal(allowedDuration(180, true), 180);
  assert.equal(allowedDuration(77, true), 300);
});

test('turn-taking: speaker 1, then speaker 2, then done', () => {
  assert.deepEqual(afterCompletion(false, 1), { nextTurn: 1, sessionDone: true });
  assert.deepEqual(afterCompletion(true, 1), { nextTurn: 2, sessionDone: false });
  assert.deepEqual(afterCompletion(true, 2), { nextTurn: 1, sessionDone: true });
});
