/**
 * Verifies Apple / Google OpenID Connect ID tokens (RS256) using the providers' public JWKS.
 * Zero external dependencies; uses Web Crypto only.
 *
 * Required environment variables (until set, the provider is reported as "not configured"):
 *   APPLE_CLIENT_IDS   comma-separated allowed audiences (iOS bundle id, and/or Services ID for web)
 *   GOOGLE_CLIENT_IDS  comma-separated allowed OAuth client IDs (iOS / Android / Web)
 */

const PROVIDERS = {
  apple: {
    issuers: ['https://appleid.apple.com'],
    jwksUrl: 'https://appleid.apple.com/auth/keys',
    audEnv: 'APPLE_CLIENT_IDS',
  },
  google: {
    issuers: ['https://accounts.google.com', 'accounts.google.com'],
    jwksUrl: 'https://www.googleapis.com/oauth2/v3/certs',
    audEnv: 'GOOGLE_CLIENT_IDS',
  },
};

export class OAuthNotConfiguredError extends Error {}
export class OAuthInvalidTokenError extends Error {}

function b64urlToBytes(str) {
  const b64 = str.replace(/-/g, '+').replace(/_/g, '/');
  const bin = atob(b64 + '='.repeat((4 - (b64.length % 4)) % 4));
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
}

function decodeJson(segment) {
  return JSON.parse(new TextDecoder().decode(b64urlToBytes(segment)));
}

// Per-isolate cache so we do not hit the JWKS endpoint on every login.
const jwksCache = new Map();

async function getJwks(url, forceRefresh = false) {
  const cached = jwksCache.get(url);
  if (!forceRefresh && cached && Date.now() - cached.at < 3600 * 1000) return cached.keys;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Unable to fetch provider signing keys');
  const { keys } = await res.json();
  jwksCache.set(url, { keys, at: Date.now() });
  return keys;
}

/**
 * @returns {Promise<{sub: string, email: string|null, emailVerified: boolean}>}
 */
export async function verifyIdToken(provider, idToken, env) {
  const cfg = PROVIDERS[provider];
  if (!cfg) throw new OAuthInvalidTokenError('Unsupported provider');

  const audiences = String(env?.[cfg.audEnv] || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  if (audiences.length === 0) {
    throw new OAuthNotConfiguredError(`${provider} sign-in is not configured`);
  }

  const parts = typeof idToken === 'string' ? idToken.split('.') : [];
  if (parts.length !== 3) throw new OAuthInvalidTokenError('Malformed token');

  let header;
  let payload;
  try {
    header = decodeJson(parts[0]);
    payload = decodeJson(parts[1]);
  } catch {
    throw new OAuthInvalidTokenError('Malformed token');
  }
  if (header.alg !== 'RS256' || !header.kid) throw new OAuthInvalidTokenError('Unsupported token');

  let keys = await getJwks(cfg.jwksUrl);
  let jwk = keys.find((k) => k.kid === header.kid);
  if (!jwk) {
    keys = await getJwks(cfg.jwksUrl, true); // key rotation
    jwk = keys.find((k) => k.kid === header.kid);
  }
  if (!jwk) throw new OAuthInvalidTokenError('Unknown signing key');

  const key = await crypto.subtle.importKey(
    'jwk',
    { kty: jwk.kty, n: jwk.n, e: jwk.e, alg: 'RS256', ext: true },
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['verify']
  );
  const ok = await crypto.subtle.verify(
    'RSASSA-PKCS1-v1_5',
    key,
    b64urlToBytes(parts[2]),
    new TextEncoder().encode(`${parts[0]}.${parts[1]}`)
  );
  if (!ok) throw new OAuthInvalidTokenError('Bad signature');

  const now = Math.floor(Date.now() / 1000);
  if (!cfg.issuers.includes(payload.iss)) throw new OAuthInvalidTokenError('Bad issuer');
  const aud = Array.isArray(payload.aud) ? payload.aud : [payload.aud];
  if (!aud.some((a) => audiences.includes(a))) throw new OAuthInvalidTokenError('Bad audience');
  if (!payload.exp || payload.exp < now) throw new OAuthInvalidTokenError('Token expired');
  if (!payload.sub) throw new OAuthInvalidTokenError('Missing subject');

  return {
    sub: String(payload.sub),
    email: typeof payload.email === 'string' ? payload.email.toLowerCase() : null,
    // Apple sends email_verified as the string "true"
    emailVerified: payload.email_verified === true || payload.email_verified === 'true',
  };
}
