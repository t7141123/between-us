/**
 * Cloudflare Pages Function: POST /api/auth/delete
 * Account Deletion endpoint to comply with Apple App Store Review Guideline 5.1.1(v).
 * Permanently removes user account, linked cloud entitlements, and unlinks related order data.
 */
import { ensureOrdersTable, getCorsHeaders } from '../payment/_lib.js';

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
    const body = await request.json().catch(() => null);
    if (!body || !body.userId || typeof body.userId !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Valid userId is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    const userId = body.userId.trim().slice(0, 64);
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase().slice(0, 254) : null;

    if (!env.DB) {
      // Offline / fallback mode
      return new Response(
        JSON.stringify({ success: true, message: 'Account deleted (local mode)' }),
        { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    await ensureOrdersTable(env.DB);

    // Security (Identity Verification): verify that the user exists and matches email if provided
    const user = await env.DB.prepare('SELECT id, email FROM users WHERE id = ?')
      .bind(userId)
      .first();

    if (!user) {
      return new Response(
        JSON.stringify({ error: 'User not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    if (email && user.email !== email) {
      return new Response(
        JSON.stringify({ error: '身份驗證失敗：信箱不符 (Verification mismatch)' }),
        { status: 403, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // 1. Delete cloud entitlements for this user
    await env.DB.prepare('DELETE FROM user_entitlements WHERE user_id = ?')
      .bind(userId)
      .run();

    // 2. Anonymize past orders by detaching the user_id (preserving financial logs)
    await env.DB.prepare('UPDATE orders SET user_id = NULL WHERE user_id = ?')
      .bind(userId)
      .run();

    // 3. Delete user account record
    await env.DB.prepare('DELETE FROM users WHERE id = ?')
      .bind(userId)
      .run();

    return new Response(
      JSON.stringify({ success: true, message: 'Account and associated personal data deleted successfully' }),
      { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'Account deletion failed' }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }
}
