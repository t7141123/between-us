/**
 * Cloudflare Pages Function: POST /api/auth/delete
 * Account deletion (Apple App Store Review Guideline 5.1.1(v)).
 * The account to delete is identified ONLY by the verified Bearer token, never by request body.
 */
import { ensureOrdersTable, getCorsHeaders, verifyAuthToken } from '../payment/_lib.js';

function json(body, status, corsHeaders) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders },
  });
}

export async function onRequestOptions(context) {
  return new Response(null, {
    status: 204,
    headers: getCorsHeaders(context.request, 'POST, OPTIONS'),
  });
}

export async function onRequestPost(context) {
  const { request, env } = context;
  const corsHeaders = getCorsHeaders(request, 'POST, OPTIONS');

  try {
    const authHeader = request.headers.get('Authorization') || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    const session = await verifyAuthToken(token, env);
    if (!session?.uid) return json({ error: 'Unauthorized' }, 401, corsHeaders);

    if (!env.DB) return json({ error: 'Service unavailable' }, 503, corsHeaders);
    await ensureOrdersTable(env.DB);

    const userId = String(session.uid);
    const user = await env.DB.prepare('SELECT id FROM users WHERE id = ?').bind(userId).first();
    if (!user) return json({ error: 'User not found' }, 404, corsHeaders);

    await env.DB.batch([
      env.DB.prepare('DELETE FROM user_entitlements WHERE user_id = ?').bind(userId),
      // Keep financial records but detach them from the person.
      env.DB.prepare('UPDATE orders SET user_id = NULL WHERE user_id = ?').bind(userId),
      env.DB.prepare('DELETE FROM users WHERE id = ?').bind(userId),
    ]);

    return json({ success: true }, 200, corsHeaders);
  } catch {
    return json({ error: 'Account deletion failed' }, 500, corsHeaders);
  }
}
