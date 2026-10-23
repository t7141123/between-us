/**
 * Cloudflare Pages Function: /api/admin/login
 * Validates admin credentials and generates session token.
 */

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

const ADMIN_USER = 'admin';
const ADMIN_PASS = 'Admin+123';
const SECRET_SALT = 'between_us_analytics_salt_2026';

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

    if (username !== ADMIN_USER || password !== ADMIN_PASS) {
      return new Response(JSON.stringify({ error: '帳號或密碼錯誤 (Invalid credentials)' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
      });
    }

    // Generate lightweight signed token (valid for 7 days)
    const expiresAt = Date.now() + 7 * 24 * 3600 * 1000;
    const raw = `${ADMIN_USER}:${expiresAt}:${SECRET_SALT}`;
    const encoder = new TextEncoder();
    const digest = await crypto.subtle.digest('SHA-256', encoder.encode(raw));
    const hashArray = Array.from(new Uint8Array(digest));
    const signature = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');

    const token = `${ADMIN_USER}.${expiresAt}.${signature}`;

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
