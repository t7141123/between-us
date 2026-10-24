/**
 * Cloudflare Pages Function: /api/admin/login
 * Validates admin credentials via constant-time comparison and salted SHA-256 hash.
 * Includes brute-force delay throttling and token signing.
 * Supports environment variable overrides for salt and credentials.
 */

const DEFAULT_SECRET_SALT = 'between_us_analytics_salt_2026';

// Salted SHA-256 hashes of default authorized credentials (no plaintext in source)
const DEFAULT_EXPECTED_USER_HASH = 'b6b45709bc147dbf9e35ee77e4b8d6bab39436b35a18ebb71f1ff5d51ac606be';
const DEFAULT_EXPECTED_PASS_HASH = 'e0e8733b5bf9322d36dcba159c4184d6e11c29a6fc48134e90e26a1be62bfff6';

function getCorsHeaders(request) {
  const origin = request ? request.headers.get('Origin') : null;
  return {
    'Access-Control-Allow-Origin': origin || '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Vary': 'Origin',
  };
}

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

export async function onRequestOptions(context) {
  return new Response(null, {
    status: 204,
    headers: getCorsHeaders(context.request),
  });
}

export async function onRequestPost(context) {
  const { request, env } = context;
  const corsHeaders = getCorsHeaders(request);

  const salt = env?.SECRET_SALT || DEFAULT_SECRET_SALT;
  const expectedUserHash = env?.ADMIN_USER_HASH || DEFAULT_EXPECTED_USER_HASH;
  const expectedPassHash = env?.ADMIN_PASS_HASH || DEFAULT_EXPECTED_PASS_HASH;

  try {
    const { username, password } = await request.json().catch(() => ({}));

    if (!username || !password || typeof username !== 'string' || typeof password !== 'string') {
      return new Response(JSON.stringify({ error: '帳號與密碼欄位必填' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Compute input salted hashes
    const inputUserHash = await sha256Hex(`${username.trim()}:${salt}`);
    const inputPassHash = await sha256Hex(`${password.trim()}:${salt}`);

    const isUserValid = constantTimeEqual(inputUserHash, expectedUserHash);
    const isPassValid = constantTimeEqual(inputPassHash, expectedPassHash);

    if (!isUserValid || !isPassValid) {
      // Security: introduce 800ms throttle delay to defeat brute-force dictionary attacks
      await new Promise((resolve) => setTimeout(resolve, 800));
      return new Response(JSON.stringify({ error: '帳號或密碼錯誤 (Invalid credentials)' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Generate signed session token (valid for 7 days)
    const expiresAt = Date.now() + 7 * 24 * 3600 * 1000;
    const adminUser = env?.ADMIN_USER || 'admin';
    const raw = `${adminUser}:${expiresAt}:${salt}`;
    const signature = await sha256Hex(raw);
    const token = `${adminUser}.${expiresAt}.${signature}`;

    return new Response(
      JSON.stringify({
        success: true,
        token,
        expiresAt,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
}
