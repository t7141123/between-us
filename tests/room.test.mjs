import test from 'node:test';
import assert from 'node:assert/strict';
import { generateRoomCode, isValidRoomCode, MAX_ROOM_FAILURES, signAuthToken } from '../functions/api/payment/_lib.js';
import { onRequestPost as createPost } from '../functions/api/room/create.js';
import { onRequestPost as joinPost } from '../functions/api/room/join.js';
import { onRequestPost as syncPost } from '../functions/api/room/sync.js';
import { onRequestPost as answerPost } from '../functions/api/room/answer.js';
import { onRequestGet as answersGet } from '../functions/api/room/answers.js';

const secret = { AUTH_SECRET: 'x'.repeat(32) };

function fakeDb({ plusUsers = [] } = {}) {
  const rooms = new Map();
  const answers = []; // {code,qid,client_id,answer}
  const attempts = new Map();
  const stmt = (rawSql) => { const sql = rawSql.trim().replace(/\s+/g, ' '); return {
    bind: (...a) => ({
      first: async () => {
        if (/FROM sync_rooms WHERE code/.test(sql)) return rooms.get(a[0]) ?? null;
        if (/FROM room_attempts/.test(sql)) { const r = attempts.get(`${a[0]}|${a[1]}`); return r ? { fails: r } : null; }
        if (/FROM user_entitlements/.test(sql)) return plusUsers.includes(a[0]) ? { ok: 1 } : null;
        return null;
      },
      all: async () => {
        if (/SELECT DISTINCT client_id/.test(sql)) return { results: [...new Set(answers.filter((r) => r.code === a[0]).map((r) => r.client_id))].map((client_id) => ({ client_id })) };
        if (/SELECT client_id, answer/.test(sql)) return { results: answers.filter((r) => r.code === a[0] && r.qid === a[1]) };
        return { results: [] };
      },
      run: async () => {
        if (/^INSERT INTO sync_rooms/.test(sql)) {
          rooms.set(a[0], { code: a[0], category: a[1], question_text: a[2], qid: a[3], mode: 'sync', is_flipped: 0, version: 1, updated_at: a[4] });
        } else if (/^UPDATE sync_rooms/.test(sql)) {
          const r = rooms.get(a[7]); Object.assign(r, { category: a[0], question_text: a[1], qid: a[2], mode: a[3], is_flipped: a[4], version: a[5], updated_at: a[6] });
        } else if (/^INSERT INTO room_answers/.test(sql)) {
          const ex = answers.find((r) => r.code === a[0] && r.qid === a[1] && r.client_id === a[2]);
          if (ex) ex.answer = a[3]; else answers.push({ code: a[0], qid: a[1], client_id: a[2], answer: a[3] });
        } else if (/^INSERT INTO room_attempts/.test(sql)) {
          const k = `${a[0]}|${a[1]}`; attempts.set(k, (attempts.get(k) ?? 0) + 1);
        }
        return { meta: { changes: 1 } };
      },
    }),
    run: async () => ({}),
  }; };
  return { prepare: stmt, batch: async () => [], rooms, answers, attempts };
}

const post = (body, headers = {}) => new Request('https://t.test/x', { method: 'POST', headers: { 'Content-Type': 'application/json', 'CF-Connecting-IP': '1.2.3.4', ...headers }, body: JSON.stringify(body) });
const get = (qs) => new Request(`https://t.test/x?${qs}`, { headers: { 'CF-Connecting-IP': '1.2.3.4' } });

test('room codes are 6 digits; 4-digit codes from older apps remain valid', () => {
  for (let i = 0; i < 50; i++) assert.match(generateRoomCode(), /^[1-9]\d{5}$/);
  assert.ok(isValidRoomCode('1234') && isValidRoomCode('123456'));
  assert.ok(!isValidRoomCode('12345') && !isValidRoomCode('12a456') && !isValidRoomCode(123456));
});

test('guessing room codes is rate limited', async () => {
  const db = fakeDb();
  const env = { ...secret, DB: db };
  let last;
  for (let i = 0; i < MAX_ROOM_FAILURES; i++) last = await joinPost({ request: post({ code: '999999' }), env });
  assert.equal(last.status, 404);
  assert.equal((await joinPost({ request: post({ code: '999999' }), env })).status, 429);
});

test('answer together: Plus gate, hidden until both answered, two participants only', async () => {
  const db = fakeDb({ plusUsers: ['plus1'] });
  const env = { ...secret, DB: db };
  const created = await (await createPost({ request: post({ category: 'all', qid: 'vision:1', questionText: 'q' }), env })).json();
  const code = created.room.code;
  assert.match(code, /^\d{6}$/);

  // answering is refused while the room is in plain sync mode
  assert.equal((await answerPost({ request: post({ code, qid: 'vision:1', clientId: 'clientAAAA1', text: 'hi' }), env })).status, 409);

  // free / anonymous users cannot switch the mode on
  assert.equal((await syncPost({ request: post({ code, mode: 'reveal' }), env })).status, 403);
  const freeTok = await signAuthToken('free1', 'f@x.com', secret);
  assert.equal((await syncPost({ request: post({ code, mode: 'reveal' }, { Authorization: `Bearer ${freeTok}` }), env })).status, 403);
  // a Plus member can
  const plusTok = await signAuthToken('plus1', 'p@x.com', secret);
  const on = await syncPost({ request: post({ code, mode: 'reveal' }, { Authorization: `Bearer ${plusTok}` }), env });
  assert.equal(on.status, 200);
  assert.equal((await on.json()).room.mode, 'reveal');

  const A = 'clientAAAA1', B = 'clientBBBB2', C = 'clientCCCC3';
  const q = (id) => `code=${code}&qid=vision:1&clientId=${id}`;
  assert.equal((await answerPost({ request: post({ code, qid: 'vision:1', clientId: A, text: 'my answer A' }), env })).status, 200);

  // B has not answered: B must not see A's text, and A must not see B's (nothing yet)
  let b = await (await answersGet({ request: get(q(B)), env })).json();
  assert.deepEqual(b, { mine: null, partnerSubmitted: true, partner: null });
  let a = await (await answersGet({ request: get(q(A)), env })).json();
  assert.deepEqual(a, { mine: 'my answer A', partnerSubmitted: false, partner: null });

  assert.equal((await answerPost({ request: post({ code, qid: 'vision:1', clientId: B, text: 'answer B' }), env })).status, 200);
  a = await (await answersGet({ request: get(q(A)), env })).json();
  b = await (await answersGet({ request: get(q(B)), env })).json();
  assert.equal(a.partner, 'answer B');
  assert.equal(b.partner, 'my answer A');

  // a third device cannot join the answering session
  const c = await answerPost({ request: post({ code, qid: 'vision:1', clientId: C, text: 'sneaky' }), env });
  assert.equal(c.status, 409);
  assert.equal((await c.json()).code, 'room_full');
  // and sees nothing of the others' answers
  const cs = await (await answersGet({ request: get(q(C)), env })).json();
  assert.equal(cs.partner, null);

  // switching back to plain sync needs no Plus
  assert.equal((await (await syncPost({ request: post({ code, mode: 'sync' }), env })).json()).room.mode, 'sync');
});

test('answer input validation', async () => {
  const db = fakeDb();
  const env = { ...secret, DB: db };
  const code = (await (await createPost({ request: post({}), env })).json()).room.code;
  for (const bad of [
    { code, qid: 'custom:abc', clientId: 'clientAAAA1', text: 'x' },
    { code, qid: 'vision:1', clientId: 'short', text: 'x' },
    { code: '12', qid: 'vision:1', clientId: 'clientAAAA1', text: 'x' },
    { code, qid: 'vision:1', clientId: 'clientAAAA1' },
  ]) assert.equal((await answerPost({ request: post(bad), env })).status, 400);
  assert.equal((await answersGet({ request: get(`code=${code}&qid=bad&clientId=clientAAAA1`), env })).status, 400);
});
