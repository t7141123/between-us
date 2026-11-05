import test from 'node:test';
import assert from 'node:assert/strict';
import { addCustom, CUSTOM_MAX_COUNT, CUSTOM_MAX_LENGTH, customEntries, makeCustomQuestion, removeCustom, sanitizeCustom } from '../src/services/customCore.ts';
import { categoryOfQid, QID_PATTERN } from '../src/services/deckCore.ts';
import { normalizeQid } from '../functions/api/payment/_lib.js';

test('makeCustomQuestion trims, collapses whitespace, caps length, rejects empty', () => {
  const q = makeCustomQuestion('  What  do we\nwant   next? ', 1_700_000_000_000, () => 0.5);
  assert.equal(q.text, 'What do we want next?');
  assert.match(q.id, /^[a-z0-9]{1,12}$/);
  assert.equal(makeCustomQuestion('   ', 1), null);
  assert.equal(makeCustomQuestion('x'.repeat(500), 1, () => 0).text.length, CUSTOM_MAX_LENGTH);
});

test('custom qids fit the shared qid pattern and map to the custom category', () => {
  const q = makeCustomQuestion('hi', 1_700_000_000_000);
  assert.ok(QID_PATTERN.test(`custom:${q.id}`));
  assert.equal(categoryOfQid(`custom:${q.id}`), 'custom');
  assert.ok(!QID_PATTERN.test('custom:UPPER'));
  assert.equal(normalizeQid(`custom:${q.id}`), ''); // rooms do not carry custom questions
});

test('add / remove / sanitize / entries', () => {
  const a = makeCustomQuestion('a', 1000, () => 0.1);
  const b = makeCustomQuestion('b', 2000, () => 0.2);
  let list = addCustom(addCustom([], a), b);
  assert.equal(list.length, 2);
  assert.equal(addCustom(list, a).length, 2, 'no duplicates');
  assert.deepEqual(removeCustom(list, a.id).map((x) => x.text), ['b']);
  const full = Array.from({ length: CUSTOM_MAX_COUNT }, (_, i) => ({ id: `i${i}`, text: 't', createdAt: i }));
  assert.equal(addCustom(full, a).length, CUSTOM_MAX_COUNT);
  assert.equal(sanitizeCustom([{ id: 'ok1', text: 'fine', createdAt: 1 }, { id: 'BAD!', text: 'x', createdAt: 1 }, { id: 'e', text: ' ', createdAt: 1 }, 'junk']).length, 1);
  assert.equal(sanitizeCustom(null).length, 0);
  const e = customEntries(list, 'Ours');
  assert.deepEqual(e.map((x) => x.qid), [`custom:${a.id}`, `custom:${b.id}`]);
  assert.equal(e[0].categoryLabel, 'Ours');
});
