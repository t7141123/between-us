/**
 * Cloudflare Pages Function: POST /api/auth/login
 * Progressive lightweight authentication supporting Google, Apple, and Email.
 */
import { ensureOrdersTable, getCorsHeaders } from '../payment/_lib.js';

export async function onRequestOptions(context) {
  return new Response(null, {
    status: 204,
    headers: getCorsHeaders(context.request, 'POST, OPTIONS'),
  });
}

const ALLOWED_PROVIDERS = new Set(['apple', 'google', 'email']);
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function onRequestPost(context) {
  const { request, env } = context;
  const corsHeaders = getCorsHeaders(request, 'POST, OPTIONS');

  try {
    const body = await request.json().catch(() => null);
    if (!body || !body.email || typeof body.email !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Valid email is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    const email = body.email.trim().toLowerCase();
    if (email.length > 254 || !EMAIL_REGEX.test(email)) {
      return new Response(
        JSON.stringify({ error: 'Invalid email format or length exceeds maximum' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    const rawProvider = typeof body.provider === 'string' ? body.provider.trim().toLowerCase() : 'email';
    const provider = ALLOWED_PROVIDERS.has(rawProvider) ? rawProvider : 'email';

    if (!env.DB) {
      // Offline fallback
      return new Response(
        JSON.stringify({
          user: {
            id: `usr_${Math.random().toString(36).slice(2, 10)}`,
            email,
            provider,
          },
        }),
        { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    await ensureOrdersTable(env.DB);
    let user = await env.DB.prepare('SELECT id, email, provider FROM users WHERE email = ?')
      .bind(email)
      .first();

    if (!user) {
      const newId = `u_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
      await env.DB.prepare(
        'INSERT INTO users (id, email, provider) VALUES (?, ?, ?)'
      )
        .bind(newId, email, provider)
        .run();

      user = { id: newId, email, provider };
    }

    return new Response(
      JSON.stringify({ user }),
      { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'Auth failed' }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }
}
