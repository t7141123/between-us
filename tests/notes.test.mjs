import test from 'node:test';
import assert from 'node:assert/strict';
import { listNotes, NOTE_MAX_LENGTH, sanitizeNotes, saveNote, visibleNotes } from '../src/services/notesCore.ts';

test('saveNote trims, caps length, updates and deletes on empty', () => {
  let n = saveNote({}, 'vision:1', '  hello  ', 100);
  assert.deepEqual(n, { 'vision:1': { text: 'hello', updatedAt: 100 } });
  n = saveNote(n, 'vision:1', 'x'.repeat(NOTE_MAX_LENGTH + 50), 200);
  assert.equal(n['vision:1'].text.length, NOTE_MAX_LENGTH);
  assert.equal(n['vision:1'].updatedAt, 200);
  const before = n;
  n = saveNote(n, 'vision:1', '   ', 300);
  assert.deepEqual(n, {});
  assert.ok(before['vision:1'], 'original map is not mutated');
});

test('listNotes is newest first', () => {
  const n = { 'a:1': { text: 'a', updatedAt: 1 }, 'b:2': { text: 'b', updatedAt: 3 }, 'c:3': { text: 'c', updatedAt: 2 } };
  assert.deepEqual(listNotes(n).map((x) => x.qid), ['b:2', 'c:3', 'a:1']);
});

test('visibleNotes: free window hides older notes but never drops them', () => {
  const list = Array.from({ length: 13 }, (_, i) => ({ qid: `a:${i}`, text: 't', updatedAt: 100 - i }));
  const free = visibleNotes(list, false, 10);
  assert.equal(free.visible.length, 10);
  assert.equal(free.hiddenCount, 3);
  assert.equal(free.visible[0].qid, 'a:0');
  const plus = visibleNotes(list, true, 10);
  assert.equal(plus.visible.length, 13);
  assert.equal(plus.hiddenCount, 0);
  assert.equal(visibleNotes(list.slice(0, 4), false, 10).hiddenCount, 0);
});

test('sanitizeNotes drops malformed entries', () => {
  const out = sanitizeNotes({ 'a:1': { text: 'ok', updatedAt: 5 }, 'b:2': { text: '', updatedAt: 5 }, 'c:3': { text: 'x' }, 'd:4': 'bad' });
  assert.deepEqual(Object.keys(out), ['a:1']);
  assert.deepEqual(sanitizeNotes(null), {});
  assert.deepEqual(sanitizeNotes([1, 2]), {});
});

import { filterNotes, formatNotesExport } from '../src/services/notesCore.ts';

test('search matches note text or question text, case-insensitively', () => {
  const list = [
    { qid: 'a:1', text: 'Dinner was lovely', updatedAt: 3 },
    { qid: 'b:2', text: 'short', updatedAt: 2 },
  ];
  const textOf = (qid) => ({ 'a:1': 'Where shall we travel?', 'b:2': 'What is TRUST?' })[qid];
  assert.deepEqual(filterNotes(list, 'dinner', textOf).map((n) => n.qid), ['a:1']);
  assert.deepEqual(filterNotes(list, 'trust', textOf).map((n) => n.qid), ['b:2']);
  assert.equal(filterNotes(list, '  ', textOf).length, 2);
  assert.equal(filterNotes(list, 'zzz', textOf).length, 0);
});

test('export formats newest first with question and note', () => {
  const d = new Date(2026, 10, 5, 12).getTime();
  const out = formatNotesExport([{ qid: 'a:1', text: 'my note', updatedAt: d }], () => 'The question?', 'Notes');
  assert.equal(out, 'Notes\n\n2026-11-05\nQ: The question?\nmy note\n');
});
