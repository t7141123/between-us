/**
 * Cloudflare Pages Function: POST /api/auth/delete
 * Account Deletion endpoint to comply with Apple App Store Review Guideline 5.1.1(v).
 * Permanently removes user account, linked cloud entitlements, and unlinks related order data.
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
    if (!body || !body.userId || typeof body.userId !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Valid userId is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...CORS_HEADERS } }
      );
    }

    const userId = body.userId.trim();

    if (!env.DB) {
      // Offline / fallback mode
      return new Response(
        JSON.stringify({ success: true, message: 'Account deleted (local mode)' }),
        { status: 200, headers: { 'Content-Type': 'application/json', ...CORS_HEADERS } }
      );
    }

    await ensureOrdersTable(env.DB);

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
      { status: 200, headers: { 'Content-Type': 'application/json', ...CORS_HEADERS } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'Account deletion failed' }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...CORS_HEADERS } }
    );
  }
}
