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
        JSON.stringify({ error: 'Valid email is required', code: 'invalid_email' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    const email = body.email.trim().toLowerCase();
    if (email.length > 254 || !EMAIL_REGEX.test(email)) {
      return new Response(
        JSON.stringify({ error: 'Invalid email format', code: 'invalid_email' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    const mode = body.mode === 'register' ? 'register' : 'login';
    const password = typeof body.password === 'string' ? body.password : '';

    if (!password || password.length < 6) {
      return new Response(
        JSON.stringify({ error: 'Password must be at least 6 characters', code: 'weak_password' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    if (!env.DB) {
      return new Response(
        JSON.stringify({ error: 'Service unavailable', code: 'unavailable' }),
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
          JSON.stringify({ error: 'Email already registered', code: 'email_exists' }),
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
          JSON.stringify({ error: 'Account not found', code: 'account_not_found' }),
          { status: 404, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        );
      }

      if (!user.password_hash) {
        // Social-login account: must not be claimable by setting a password here.
        return new Response(
          JSON.stringify({ error: 'Use Apple or Google sign-in for this account', code: 'social_account' }),
          { status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        );
      } else {
        const isMatch = await verifyPassword(password, user.password_hash);
        if (!isMatch) {
          return new Response(
            JSON.stringify({ error: 'Incorrect password', code: 'wrong_password' }),
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
      JSON.stringify({ error: 'Authentication failed' }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }
}
