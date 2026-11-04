/**
 * App Store Server API client (Web Crypto only, no dependencies).
 * Looks a transaction up directly at Apple (authenticated with our own API key), so the
 * result can be trusted without separately validating the JWS certificate chain.
 *
 * Required environment variables (App Store Connect → Users and Access → Integrations → In-App Purchase):
 *   APPLE_IAP_ISSUER_ID     Issuer ID (UUID)
 *   APPLE_IAP_KEY_ID        Key ID of the .p8 key
 *   APPLE_IAP_PRIVATE_KEY   Contents of the .p8 file (PEM; "\n" escapes allowed)
 *   APPLE_BUNDLE_ID         optional, defaults to com.lovebetweenus.app
 */

import { signEs256Jwt } from '../_es256.js';

const PROD = 'https://api.storekit.itunes.apple.com';
const SANDBOX = 'https://api.storekit-sandbox.itunes.apple.com';

export class AppleNotConfiguredError extends Error {}
export class AppleTransactionError extends Error {}

export function getBundleId(env) {
  return env?.APPLE_BUNDLE_ID || 'com.lovebetweenus.app';
}

async function createApiToken(env) {
  const issuer = env?.APPLE_IAP_ISSUER_ID;
  const keyId = env?.APPLE_IAP_KEY_ID;
  const pem = env?.APPLE_IAP_PRIVATE_KEY;
  if (!issuer || !keyId || !pem) throw new AppleNotConfiguredError('Apple IAP is not configured');
  const now = Math.floor(Date.now() / 1000);
  return signEs256Jwt({
    keyId,
    privateKeyPem: pem,
    claims: { iss: issuer, iat: now, exp: now + 300, aud: 'appstoreconnect-v1', bid: getBundleId(env) },
  });
}

function decodeJwsPayload(jws) {
  const seg = String(jws).split('.')[1];
  if (!seg) throw new AppleTransactionError('Malformed transaction');
  const b64 = seg.replace(/-/g, '+').replace(/_/g, '/');
  const bin = atob(b64 + '='.repeat((4 - (b64.length % 4)) % 4));
  return JSON.parse(new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0))));
}

/**
 * Fetch and sanity-check a transaction. Returns Apple's decoded transaction info.
 * Tries production first, then sandbox (TestFlight / App Review use sandbox).
 */
export async function fetchTransaction(transactionId, env) {
  const token = await createApiToken(env);
  const id = encodeURIComponent(String(transactionId));

  for (const base of [PROD, SANDBOX]) {
    const res = await fetch(`${base}/inApps/v1/transactions/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.status === 404) continue; // not found in this environment, try the next
    if (res.status === 401) throw new AppleNotConfiguredError('Apple IAP credentials rejected');
    if (!res.ok) throw new Error(`App Store Server API error ${res.status}`);

    const data = await res.json();
    const info = decodeJwsPayload(data.signedTransactionInfo);

    if (info.bundleId !== getBundleId(env)) throw new AppleTransactionError('Bundle ID mismatch');
    if (String(info.transactionId) !== String(transactionId)) throw new AppleTransactionError('Transaction mismatch');
    if (info.revocationDate) throw new AppleTransactionError('Transaction was refunded or revoked');
    return info;
  }
  throw new AppleTransactionError('Transaction not found');
}
