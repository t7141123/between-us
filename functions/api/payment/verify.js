/**
 * Cloudflare Pages Function: GET /api/payment/verify
 * Allows the client to securely confirm payment status and unlock features.
 */
import { STORE_ITEMS, ensureOrdersTable } from './_lib.js';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}

export async function onRequestGet(context) {
  const { request, env } = context;

  const url = new URL(request.url);
  const orderId = url.searchParams.get('orderId');

  if (!orderId) {
    return new Response(
      JSON.stringify({ error: 'Missing orderId' }),
      { status: 400, headers: { 'Content-Type': 'application/json', ...CORS_HEADERS } }
    );
  }

  try {
    if (!env.DB) {
      // In development or when DB is not linked, fallback gracefully
      return new Response(
        JSON.stringify({ paid: false, error: 'Database not available' }),
        { status: 200, headers: { 'Content-Type': 'application/json', ...CORS_HEADERS } }
      );
    }

    await ensureOrdersTable(env.DB);
    const order = await env.DB.prepare('SELECT * FROM orders WHERE id = ?')
      .bind(orderId)
      .first();

    if (!order) {
      return new Response(
        JSON.stringify({ paid: false, error: 'Order not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json', ...CORS_HEADERS } }
      );
    }

    const itemMeta = STORE_ITEMS[order.item_key] || null;

    return new Response(
      JSON.stringify({
        orderId: order.id,
        paid: order.status === 'paid',
        status: order.status,
        itemKey: order.item_key,
        amount: order.amount,
        target: itemMeta?.target || null,
        type: itemMeta?.type || null,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json', ...CORS_HEADERS } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'Verification failed' }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...CORS_HEADERS } }
    );
  }
}
