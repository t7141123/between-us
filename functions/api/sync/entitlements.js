/**
 * Cloudflare Pages Function: /api/sync/entitlements
 * Allows client to fetch and claim unlocked expansion packs and supporter perks across platforms.
 */
import { STORE_ITEMS, ensureOrdersTable, grantEntitlement } from '../payment/_lib.js';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}

/** GET /api/sync/entitlements?userId=... */
export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const userId = url.searchParams.get('userId');

  if (!userId) {
    return new Response(
      JSON.stringify({ error: 'Missing userId' }),
      { status: 400, headers: { 'Content-Type': 'application/json', ...CORS_HEADERS } }
    );
  }

  try {
    if (!env.DB) {
      return new Response(
        JSON.stringify({ entitlements: [], unlockedPacks: [], isSupporter: false }),
        { status: 200, headers: { 'Content-Type': 'application/json', ...CORS_HEADERS } }
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
      { status: 200, headers: { 'Content-Type': 'application/json', ...CORS_HEADERS } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'Sync failed' }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...CORS_HEADERS } }
    );
  }
}

/** POST /api/sync/entitlements — Claim a past anonymous order with an authenticated userId */
export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const body = await request.json().catch(() => null);
    if (!body || !body.userId || !body.orderId) {
      return new Response(
        JSON.stringify({ error: 'Missing userId or orderId' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...CORS_HEADERS } }
      );
    }

    const { userId, orderId } = body;

    if (!env.DB) {
      return new Response(
        JSON.stringify({ success: false, error: 'Database unavailable' }),
        { status: 500, headers: { 'Content-Type': 'application/json', ...CORS_HEADERS } }
      );
    }

    await ensureOrdersTable(env.DB);
    const order = await env.DB.prepare('SELECT * FROM orders WHERE id = ?')
      .bind(orderId)
      .first();

    if (!order) {
      return new Response(
        JSON.stringify({ success: false, error: 'Order not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json', ...CORS_HEADERS } }
      );
    }

    if (order.status !== 'paid') {
      return new Response(
        JSON.stringify({ success: false, error: 'Order is not paid' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...CORS_HEADERS } }
      );
    }

    // Grant entitlement and update order user_id
    await grantEntitlement(env.DB, userId, order.item_key, 'ecpay', order.id);
    await env.DB.prepare('UPDATE orders SET user_id = ? WHERE id = ?')
      .bind(userId, order.id)
      .run();

    return new Response(
      JSON.stringify({ success: true, itemKey: order.item_key }),
      { status: 200, headers: { 'Content-Type': 'application/json', ...CORS_HEADERS } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'Claim failed' }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...CORS_HEADERS } }
    );
  }
}
