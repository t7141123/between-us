/**
 * Cloudflare Pages Function: /api/sync/entitlements
 * Allows client to fetch and claim unlocked expansion packs and supporter perks across platforms.
 */
import { STORE_ITEMS, ensureOrdersTable, grantEntitlement, getCorsHeaders } from '../payment/_lib.js';

export async function onRequestOptions(context) {
  return new Response(null, {
    status: 204,
    headers: getCorsHeaders(context.request, 'GET, POST, OPTIONS'),
  });
}

/** GET /api/sync/entitlements?userId=... */
export async function onRequestGet(context) {
  const { request, env } = context;
  const corsHeaders = getCorsHeaders(request, 'GET, POST, OPTIONS');
  const url = new URL(request.url);
  const rawUserId = url.searchParams.get('userId');

  if (!rawUserId || typeof rawUserId !== 'string') {
    return new Response(
      JSON.stringify({ error: 'Missing userId' }),
      { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }

  const userId = rawUserId.trim().slice(0, 64);

  try {
    if (!env.DB) {
      return new Response(
        JSON.stringify({ entitlements: [], unlockedPacks: [], isSupporter: false }),
        { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    await ensureOrdersTable(env.DB);
    const rows = await env.DB.prepare(
      'SELECT item_key, source, created_at FROM user_entitlements WHERE user_id = ?'
    )
      .bind(userId)
      .all();

    const entitlements = (rows.results || []).map((r) => r.item_key);
    const unlockedPacks = [];
    let isSupporter = false;

    for (const key of entitlements) {
      const meta = STORE_ITEMS[key];
      if (meta?.type === 'pack' && meta.target) {
        if (!unlockedPacks.includes(meta.target)) {
          unlockedPacks.push(meta.target);
        }
      } else if (meta?.type === 'supporter' || key.includes('tip_') || key === 'supporter') {
        isSupporter = true;
      }
    }

    return new Response(
      JSON.stringify({
        userId,
        entitlements,
        unlockedPacks,
        isSupporter,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'Sync failed' }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }
}

/** POST /api/sync/entitlements — Claim a past anonymous order with an authenticated userId */
export async function onRequestPost(context) {
  const { request, env } = context;
  const corsHeaders = getCorsHeaders(request, 'GET, POST, OPTIONS');

  try {
    const body = await request.json().catch(() => null);
    if (!body || !body.userId || !body.orderId) {
      return new Response(
        JSON.stringify({ error: 'Missing userId or orderId' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    const userId = String(body.userId).trim().slice(0, 64);
    const orderId = String(body.orderId).trim().slice(0, 32);

    if (!env.DB) {
      return new Response(
        JSON.stringify({ success: false, error: 'Database unavailable' }),
        { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    await ensureOrdersTable(env.DB);
    const order = await env.DB.prepare('SELECT * FROM orders WHERE id = ?')
      .bind(orderId)
      .first();

    if (!order) {
      return new Response(
        JSON.stringify({ success: false, error: 'Order not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    if (order.status !== 'paid') {
      return new Response(
        JSON.stringify({ success: false, error: 'Order is not paid' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Security (IDOR Prevention): If order is already claimed by another user, reject
    if (order.user_id && order.user_id !== userId) {
      return new Response(
        JSON.stringify({ success: false, error: '此訂單已被其他帳號綁定 (Order already claimed)' }),
        { status: 403, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Grant entitlement and update order user_id
    await grantEntitlement(env.DB, userId, order.item_key, 'ecpay', order.id);
    await env.DB.prepare('UPDATE orders SET user_id = ? WHERE id = ?')
      .bind(userId, order.id)
      .run();

    return new Response(
      JSON.stringify({ success: true, itemKey: order.item_key }),
      { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'Claim failed' }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }
}
