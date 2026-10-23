/**
 * Cloudflare Pages Function: /api/admin/login
 * Validates admin credentials via constant-time comparison and salted SHA-256 hash.
 * Includes brute-force delay throttling and token signing.
 */

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

const SECRET_SALT = 'between_us_analytics_salt_2026';

// Salted SHA-256 hashes of authorized credentials (no plaintext in source)
const EXPECTED_USER_HASH = 'b6b45709bc147dbf9e35ee77e4b8d6bab39436b35a18ebb71f1ff5d51ac606be';
const EXPECTED_PASS_HASH = 'e0e8733b5bf9322d36dcba159c4184d6e11c29a6fc48134e90e26a1be62bfff6';

async function sha256Hex(str) {
  const encoder = new TextEncoder();
  const digest = await crypto.subtle.digest('SHA-256', encoder.encode(str));
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Constant-time byte array comparison against timing-attacks
 */
function constantTimeEqual(aStr, bStr) {
  if (aStr.length !== bStr.length) return false;
  const a = new TextEncoder().encode(aStr);
  const b = new TextEncoder().encode(bStr);
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a[i] ^ b[i];
  }
  return diff === 0;
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}

export async function onRequestPost(context) {
  const { request } = context;

  try {
    const { username, password } = await request.json().catch(() => ({}));

    if (!username || !password || typeof username !== 'string' || typeof password !== 'string') {
      return new Response(JSON.stringify({ error: '帳號與密碼欄位必填' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
      });
    }

    // Compute input salted hashes
    const inputUserHash = await sha256Hex(`${username.trim()}:${SECRET_SALT}`);
    const inputPassHash = await sha256Hex(`${password.trim()}:${SECRET_SALT}`);

    const isUserValid = constantTimeEqual(inputUserHash, EXPECTED_USER_HASH);
    const isPassValid = constantTimeEqual(inputPassHash, EXPECTED_PASS_HASH);

    if (!isUserValid || !isPassValid) {
      // Security: introduce 800ms throttle delay to defeat brute-force dictionary attacks
      await new Promise((resolve) => setTimeout(resolve, 800));
      return new Response(JSON.stringify({ error: '帳號或密碼錯誤 (Invalid credentials)' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
      });
    }

    // Generate signed session token (valid for 7 days)
    const expiresAt = Date.now() + 7 * 24 * 3600 * 1000;
    const raw = `admin:${expiresAt}:${SECRET_SALT}`;
    const signature = await sha256Hex(raw);
    const token = `admin.${expiresAt}.${signature}`;

    return new Response(
      JSON.stringify({
        success: true,
        token,
        expiresAt,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
      }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
    });
  }
}
