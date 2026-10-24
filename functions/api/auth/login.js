/**
 * Cloudflare Pages Function: POST /api/auth/login
 * Progressive lightweight authentication supporting Google, Apple, and Email.
 */
import { ensureOrdersTable } from '../payment/_lib.js';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}

export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const body = await request.json().catch(() => null);
    if (!body || !body.email || typeof body.email !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Valid email is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...CORS_HEADERS } }
      );
    }

    const email = body.email.trim().toLowerCase();
    const provider = body.provider || 'email'; // 'apple' | 'google' | 'email'

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
        { status: 200, headers: { 'Content-Type': 'application/json', ...CORS_HEADERS } }
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
      { status: 200, headers: { 'Content-Type': 'application/json', ...CORS_HEADERS } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'Auth failed' }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...CORS_HEADERS } }
    );
  }
}
