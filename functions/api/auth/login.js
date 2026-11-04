/**
 * Cloudflare Pages Function: POST /api/auth/login
 * Full Cloudflare authentication supporting Email+Password registration/login,
 * PBKDF2 password hashing, and HMAC session token signing.
 */
import {
  ensureOrdersTable,
  getCorsHeaders,
  hashPassword,
  verifyPassword,
  signAuthToken,
} from '../payment/_lib.js';

export async function onRequestOptions(context) {
  return new Response(null, {
    status: 204,
    headers: getCorsHeaders(context.request, 'POST, OPTIONS'),
  });
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function onRequestPost(context) {
  const { request, env } = context;
  const corsHeaders = getCorsHeaders(request, 'POST, OPTIONS');

  try {
    const body = await request.json().catch(() => null);
    if (!body || !body.email || typeof body.email !== 'string') {
      return new Response(
        JSON.stringify({ error: '請輸入有效的電子信箱 (Valid email is required)' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    const email = body.email.trim().toLowerCase();
    if (email.length > 254 || !EMAIL_REGEX.test(email)) {
      return new Response(
        JSON.stringify({ error: '電子信箱格式不正確 (Invalid email format)' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    const mode = body.mode === 'register' ? 'register' : 'login';
    const password = typeof body.password === 'string' ? body.password : '';

    if (!password || password.length < 6) {
      return new Response(
        JSON.stringify({ error: '密碼至少需為 6 個字元 (Password must be at least 6 characters)' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    if (!env.DB) {
      return new Response(
        JSON.stringify({ error: 'Service unavailable' }),
        { status: 503, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    await ensureOrdersTable(env.DB);
    let user = await env.DB.prepare(
      'SELECT id, email, password_hash, provider FROM users WHERE email = ?'
    )
      .bind(email)
      .first();

    if (mode === 'register') {
      if (user) {
        return new Response(
          JSON.stringify({ error: '此電子信箱已註冊，請直接登入 (Email already registered, please log in)' }),
          { status: 409, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        );
      }

      const pHash = await hashPassword(password);

      const newId = `u_${crypto.randomUUID().replace(/-/g, '').slice(0, 20)}`;
      await env.DB.prepare(
        'INSERT INTO users (id, email, password_hash, provider) VALUES (?, ?, ?, ?)'
      )
        .bind(newId, email, pHash, 'email')
        .run();
      user = { id: newId, email, provider: 'email' };
    } else {
      // Login mode
      if (!user) {
        return new Response(
          JSON.stringify({ error: '找不到此帳號，請先切換至「註冊」建立帳號 (Account not found, please register)' }),
          { status: 404, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        );
      }

      if (!user.password_hash) {
        // Social-login account: must not be claimable by setting a password here.
        return new Response(
          JSON.stringify({ error: '此帳號請使用 Apple / Google 登入 (Please sign in with Apple or Google)' }),
          { status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        );
      } else {
        const isMatch = await verifyPassword(password, user.password_hash);
        if (!isMatch) {
          return new Response(
            JSON.stringify({ error: '密碼錯誤，請重新輸入 (Incorrect password)' }),
            { status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
          );
        }
      }
    }

    const token = await signAuthToken(user.id, user.email, env);

    return new Response(
      JSON.stringify({
        user: {
          id: user.id,
          email: user.email,
          provider: user.provider || 'email',
          token,
        },
      }),
      { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: '認證失敗，請稍後重試' }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }
}
