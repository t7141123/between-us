/**
 * Sign in with Apple server-to-server calls: exchange the authorization code for a refresh token
 * (stored so it can be revoked), and revoke it when the account is deleted (App Store guideline 5.1.1(v)).
 *
 * Optional environment variables (the feature is skipped when unset, sign-in itself still works):
 *   APPLE_TEAM_ID              Apple Developer Team ID
 *   APPLE_SIGNIN_KEY_ID        Key ID of a "Sign in with Apple" key
 *   APPLE_SIGNIN_PRIVATE_KEY   Contents of that key's .p8 file
 *   APPLE_BUNDLE_ID            optional, defaults to com.lovebetweenus.app (the client_id for native sign-in)
 */
import { signEs256Jwt } from '../payment/_es256.js';

const TOKEN_URL = 'https://appleid.apple.com/auth/token';
const REVOKE_URL = 'https://appleid.apple.com/auth/revoke';

export function getAppleClientId(env) {
  return env?.APPLE_BUNDLE_ID || 'com.lovebetweenus.app';
}

export function isAppleRevocationConfigured(env) {
  return Boolean(env?.APPLE_TEAM_ID && env?.APPLE_SIGNIN_KEY_ID && env?.APPLE_SIGNIN_PRIVATE_KEY);
}

async function clientSecret(env) {
  const now = Math.floor(Date.now() / 1000);
  return signEs256Jwt({
    keyId: env.APPLE_SIGNIN_KEY_ID,
    privateKeyPem: env.APPLE_SIGNIN_PRIVATE_KEY,
    claims: {
      iss: env.APPLE_TEAM_ID,
      iat: now,
      exp: now + 600,
      aud: 'https://appleid.apple.com',
      sub: getAppleClientId(env),
    },
  });
}

async function postForm(url, params) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(params).toString(),
  });
  return res;
}

/** Returns a refresh token, or null when not configured / exchange failed. Never throws. */
export async function exchangeAuthorizationCode(code, env) {
  if (!code || !isAppleRevocationConfigured(env)) return null;
  try {
    const res = await postForm(TOKEN_URL, {
      client_id: getAppleClientId(env),
      client_secret: await clientSecret(env),
      code,
      grant_type: 'authorization_code',
    });
    if (!res.ok) return null;
    const data = await res.json();
    return typeof data.refresh_token === 'string' ? data.refresh_token : null;
  } catch {
    return null;
  }
}

/** Best-effort revocation; returns true when Apple confirmed (or nothing needed revoking). */
export async function revokeRefreshToken(refreshToken, env) {
  if (!refreshToken) return true;
  if (!isAppleRevocationConfigured(env)) return false;
  try {
    const res = await postForm(REVOKE_URL, {
      client_id: getAppleClientId(env),
      client_secret: await clientSecret(env),
      token: refreshToken,
      token_type_hint: 'refresh_token',
    });
    return res.ok;
  } catch {
    return false;
  }
}
