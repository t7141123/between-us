import test from 'node:test';
import assert from 'node:assert/strict';
import { signAuthToken } from '../functions/api/payment/_lib.js';
import { onRequestGet, onRequestPut } from '../functions/api/sync/data.js';
import { validateDataPayload } from '../functions/api/sync/_data_validate.js';

const env0 = { AUTH_SECRET: 'x'.repeat(32) };

/** In-memory D1 stand-in for user_entitlements + user_data. */
function fakeDb({ plusUsers = [] } = {}) {
  const data = new Map(); // `${user}|${kind}` -> {payload, updated_at}
  const prep = (sql) => ({
    bind: (...a) => ({
      first: async () => {
        if (/FROM user_entitlements/.test(sql)) return plusUsers.includes(a[0]) && a[1] === 'plus' ? { ok: 1 } : null;
        if (/SELECT updated_at FROM user_data/.test(sql)) { const r = data.get(`${a[0]}|${a[1]}`); return r ? { updated_at: r.updated_at } : null; }
        return null;
      },
      all: async () => ({ results: [...data.entries()].filter(([k]) => k.startsWith(`${a[0]}|`)).map(([k, v]) => ({ kind: k.split('|')[1], ...v })) }),
      run: async () => {
        if (/^INSERT INTO user_data/.test(sql)) {
          const key = `${a[0]}|${a[1]}`;
          if (data.has(key)) return { meta: { changes: 0 } };
          data.set(key, { payload: a[2], updated_at: a[3] });
          return { meta: { changes: 1 } };
        }
        if (/^UPDATE user_data/.test(sql)) {
          const key = `${a[2]}|${a[3]}`; const cur = data.get(key);
          if (!cur || cur.updated_at !== a[4]) return { meta: { changes: 0 } };
          data.set(key, { payload: a[0], updated_at: a[1] });
          return { meta: { changes: 1 } };
        }
        return { meta: { changes: 0 } };
      },
    }),
    run: async () => ({}),
  });
  return { prepare: prep, batch: async () => [], data };
}

const req = (method, body, token) =>
  new Request('https://t.test/api/sync/data', {
    method,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });

test('data sync: needs a session and Plus', async () => {
  const db = fakeDb({ plusUsers: ['plus1'] });
  const env = { ...env0, DB: db };
  assert.equal((await onRequestGet({ request: req('GET'), env })).status, 401);
  const free = await signAuthToken('free1', 'f@x.com', env0);
  const r = await onRequestGet({ request: req('GET', null, free), env });
  assert.equal(r.status, 403);
  assert.equal((await r.json()).code, 'plus_required');
  assert.equal((await onRequestPut({ request: req('PUT', { kind: 'seen', payload: [] }, free), env })).status, 403);
});

test('data sync: store, read back, optimistic locking', async () => {
  const db = fakeDb({ plusUsers: ['plus1'] });
  const env = { ...env0, DB: db };
  const tok = await signAuthToken('plus1', 'p@x.com', env0);
  let r = await onRequestPut({ request: req('PUT', { kind: 'favorites', payload: { 'vision:1': true }, baseUpdatedAt: 0 }, tok), env });
  assert.equal(r.status, 200);
  const t1 = (await r.json()).updatedAt;

  r = await onRequestGet({ request: req('GET', null, tok), env });
  const got = await r.json();
  assert.deepEqual(got.kinds.favorites, { payload: { 'vision:1': true }, updatedAt: t1 });

  // a second device that still thinks nothing exists must not overwrite
  r = await onRequestPut({ request: req('PUT', { kind: 'favorites', payload: { 'soul:2': true }, baseUpdatedAt: 0 }, tok), env });
  assert.equal(r.status, 409);
  assert.equal((await r.json()).updatedAt, t1);

  // up-to-date base succeeds; stale base fails
  r = await onRequestPut({ request: req('PUT', { kind: 'favorites', payload: { 'soul:2': true }, baseUpdatedAt: t1 }, tok), env });
  assert.equal(r.status, 200);
  r = await onRequestPut({ request: req('PUT', { kind: 'favorites', payload: {}, baseUpdatedAt: t1 }, tok), env });
  assert.equal(r.status, 409);
});

test('data sync: users cannot see each other and bad input is rejected', async () => {
  const db = fakeDb({ plusUsers: ['a', 'b'] });
  const env = { ...env0, DB: db };
  const ta = await signAuthToken('a', 'a@x.com', env0);
  const tb = await signAuthToken('b', 'b@x.com', env0);
  await onRequestPut({ request: req('PUT', { kind: 'seen', payload: ['vision:1'], baseUpdatedAt: 0 }, ta), env });
  const rb = await (await onRequestGet({ request: req('GET', null, tb), env })).json();
  assert.deepEqual(rb.kinds, {});
  assert.equal((await onRequestPut({ request: req('PUT', { kind: 'nope', payload: [] }, ta), env })).status, 400);
  assert.equal((await onRequestPut({ request: req('PUT', { kind: 'seen', payload: 'x' }, ta), env })).status, 400);
  assert.equal((await onRequestPut({ request: req('PUT', { kind: 'seen', payload: Array(6000).fill('a') }, ta), env })).status, 400);
});

test('payload validation', () => {
  assert.deepEqual(validateDataPayload('favorites', { 'a:1': 'yes' }), { 'a:1': true });
  assert.deepEqual(validateDataPayload('seen', ['a', 'a', 'b']), ['a', 'b']);
  assert.equal(validateDataPayload('notes', { 'a:1': { text: 'x' } }), null);
  assert.deepEqual(validateDataPayload('notes', { 'a:1': { text: 'x'.repeat(900), updatedAt: 5 } })['a:1'].text.length, 500);
  assert.equal(validateDataPayload('custom', [{ id: '', text: 't', createdAt: 1 }]), null);
  assert.equal(validateDataPayload('custom', [{ id: 'c1', text: 't', createdAt: 1 }]).length, 1);
  assert.equal(validateDataPayload('other', {}), null);
});
