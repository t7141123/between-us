/**
 * Server-side regression tests (run with: npm test).
 * Uses an in-memory D1 stub; covers the security fixes made for App Store readiness.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { signAuthToken, verifyAuthToken, getAuthSecret } from '../functions/api/payment/_lib.js';
import { verifyIdToken, OAuthNotConfiguredError, OAuthInvalidTokenError } from '../functions/api/auth/_oauth_verify.js';
import { onRequestPost as oauthPost } from '../functions/api/auth/oauth.js';
import { onRequestPost as loginPost } from '../functions/api/auth/login.js';
import { onRequestPost as deletePost } from '../functions/api/auth/delete.js';
import { onRequestPost as iapPost } from '../functions/api/payment/iap/verify.js';
import { onRequestGet as syncGet } from '../functions/api/sync/entitlements.js';

const env = { AUTH_SECRET: 'x'.repeat(32) };
const post = (body, headers = {}) =>
  new Request('https://t.test/x', { method: 'POST', headers: { 'Content-Type': 'application/json', ...headers }, body: JSON.stringify(body) });

/** Minimal D1 stub: records every statement and answers lookups from `users`. */
function fakeDb(users = []) {
  const log = [];
  const run = async () => ({});
  const db = {
    log,
    users,
    batch: async (stmts) => stmts,
    prepare(sql) {
      log.push(sql);
      return {
        bind: (...args) => ({
          first: async () => {
            if (/FROM users WHERE email/.test(sql)) return users.find((u) => u.email === args[0]) || null;
            if (/FROM users WHERE id/.test(sql)) return users.find((u) => u.id === args[0]) || null;
            return null;
          },
          run: async () => { log.push(['RUN', sql, args]); return {}; },
          all: async () => ({ results: [] }),
        }),
        run: () => Promise.resolve({}),
      };
    },
  };
  return db;
}

test('AUTH_SECRET missing -> fails closed (no default secret)', () => {
  assert.throws(() => getAuthSecret({}));
  assert.throws(() => getAuthSecret({ AUTH_SECRET: 'short' }));
});

test('auth token round-trips and rejects tampering', async () => {
  const t = await signAuthToken('u1', 'a@b.c', env);
  assert.equal((await verifyAuthToken(t, env)).uid, 'u1');
  assert.equal(await verifyAuthToken(t + '0', env), null);
  assert.equal(await verifyAuthToken(t, { AUTH_SECRET: 'y'.repeat(32) }), null);
});

test('OAuth: unconfigured provider, malformed and forged tokens are rejected', async () => {
  await assert.rejects(verifyIdToken('apple', 'a.b.c', {}), OAuthNotConfiguredError);
  await assert.rejects(verifyIdToken('apple', 'garbage', { APPLE_CLIENT_IDS: 'x' }), OAuthInvalidTokenError);
  const payload = btoa(JSON.stringify({ sub: '1', email: 'victim@x.com', iss: 'https://appleid.apple.com', aud: 'x', exp: 9e9 })).replace(/=/g, '');
  await assert.rejects(verifyIdToken('apple', `e30.${payload}.AAAA`, { APPLE_CLIENT_IDS: 'x' }), OAuthInvalidTokenError);
  const res = await oauthPost({ request: post({ provider: 'apple', idToken: `e30.${payload}.AAAA`, email: 'victim@x.com' }), env });
  assert.equal(res.status, 501); // never issues a session from client-supplied identity
});

test('login: social (passwordless) account cannot be taken over via register or login', async () => {
  const db = fakeDb([{ id: 'u_social', email: 'v@x.com', password_hash: null, provider: 'apple' }]);
  let res = await loginPost({ request: post({ email: 'v@x.com', password: 'attacker1', mode: 'register' }), env: { ...env, DB: db } });
  assert.equal(res.status, 409);
  res = await loginPost({ request: post({ email: 'v@x.com', password: 'attacker1', mode: 'login' }), env: { ...env, DB: db } });
  assert.equal(res.status, 401);
  assert.equal((await res.json()).code, 'social_account');
  assert.ok(!db.log.some((e) => JSON.stringify(e).includes('SET password_hash')), 'must never set a password on an existing account');
});

test('login: no DB -> 503 (no dev fallback that mints tokens)', async () => {
  const res = await loginPost({ request: post({ email: 'a@b.co', password: 'secret12', mode: 'login' }), env });
  assert.equal(res.status, 503);
});

test('delete account requires a valid Bearer token and ignores body userId', async () => {
  let res = await deletePost({ request: post({ userId: 'victim' }), env });
  assert.equal(res.status, 401);
  const db = fakeDb([{ id: 'me', email: 'me@x.com' }]);
  const token = await signAuthToken('me', 'me@x.com', env);
  res = await deletePost({ request: post({ userId: 'victim' }, { Authorization: `Bearer ${token}` }), env: { ...env, DB: db } });
  assert.equal(res.status, 200);
});

test('IAP verify: requires auth, validates transactionId, unconfigured Apple -> 503', async () => {
  let res = await iapPost({ request: post({ transactionId: '123', itemKey: 'pack_sensual', userId: 'u1' }), env });
  assert.equal(res.status, 401);
  const token = await signAuthToken('u1', 'a@b.c', env);
  const h = { Authorization: `Bearer ${token}` };
  res = await iapPost({ request: post({ transactionId: 'abc' }, h), env: { ...env, DB: {} } });
  assert.equal(res.status, 400);
  res = await iapPost({ request: post({ transactionId: '123' }, h), env: { ...env, DB: {} } });
  assert.equal(res.status, 503);
});

test('sync entitlements requires a Bearer token', async () => {
  const res = await syncGet({ request: new Request('https://t.test/s?userId=u1'), env });
  assert.equal(res.status, 401);
});
