/** Shared ES256 JWT signer (Web Crypto) for Apple's server APIs (App Store Server API, Sign in with Apple). */

function b64url(bytes) {
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

const b64urlJson = (obj) => b64url(new TextEncoder().encode(JSON.stringify(obj)));

export function pemToDer(pem) {
  const body = String(pem)
    .replace(/\\n/g, '\n')
    .replace(/-----BEGIN [A-Z ]+-----/, '')
    .replace(/-----END [A-Z ]+-----/, '')
    .replace(/\s+/g, '');
  return Uint8Array.from(atob(body), (c) => c.charCodeAt(0));
}

/** Signs `claims` with a PKCS#8 P-256 private key (.p8 contents). */
export async function signEs256Jwt({ keyId, privateKeyPem, claims, extraHeader = {} }) {
  const key = await crypto.subtle.importKey(
    'pkcs8',
    pemToDer(privateKeyPem),
    { name: 'ECDSA', namedCurve: 'P-256' },
    false,
    ['sign']
  );
  const header = { alg: 'ES256', kid: keyId, typ: 'JWT', ...extraHeader };
  const signingInput = `${b64urlJson(header)}.${b64urlJson(claims)}`;
  // WebCrypto ECDSA output is raw r||s, which is exactly the JWS ES256 format.
  const sig = await crypto.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, key, new TextEncoder().encode(signingInput));
  return `${signingInput}.${b64url(new Uint8Array(sig))}`;
}
