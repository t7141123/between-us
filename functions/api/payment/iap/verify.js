/**
 * Cloudflare Pages Function: POST /api/payment/iap/verify
 * Verifies an iOS StoreKit transaction with Apple's App Store Server API and grants the
 * matching entitlement. The product comes from Apple's response (productId), never from the client.
 *
 * Convention: App Store Connect product IDs equal the STORE_ITEMS keys (e.g. "pack_sensual").
 */
import {
  STORE_ITEMS,
  ensureOrdersTable,
  grantEntitlement,
  getCorsHeaders,
  verifyAuthToken,
} from '../_lib.js';
import { fetchTransaction, AppleNotConfiguredError, AppleTransactionError } from './_apple.js';

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
    const userId = String(session.uid);

    const body = await request.json().catch(() => null);
    const transactionId = body && body.transactionId ? String(body.transactionId).trim() : '';
    if (!/^\d{1,32}$/.test(transactionId)) {
      return json({ error: 'Missing or invalid transactionId' }, 400, corsHeaders);
    }

    if (!env.DB) return json({ error: 'Service unavailable' }, 503, corsHeaders);

    let info;
    try {
      info = await fetchTransaction(transactionId, env);
    } catch (e) {
      if (e instanceof AppleNotConfiguredError) {
        return json({ error: 'Purchases are not available yet' }, 503, corsHeaders);
      }
      if (e instanceof AppleTransactionError) {
        return json({ error: e.message }, 400, corsHeaders);
      }
      throw e;
    }

    const itemKey = String(info.productId || '');
    if (!STORE_ITEMS[itemKey]) return json({ error: 'Unknown product' }, 400, corsHeaders);

    await ensureOrdersTable(env.DB);

    // A transaction may only ever benefit one account (prevents replaying someone else's receipt).
    const existing = await env.DB.prepare(
      "SELECT user_id FROM user_entitlements WHERE source = 'apple_iap' AND order_id = ? LIMIT 1"
    )
      .bind(transactionId)
      .first();
    if (existing && existing.user_id !== userId) {
      return json({ error: 'Transaction already claimed' }, 409, corsHeaders);
    }

    await grantEntitlement(env.DB, userId, itemKey, 'apple_iap', transactionId);
    if (itemKey === 'bundle_skins') {
      for (const k of ['skin_noir_gold', 'skin_rose_wine', 'skin_forest_sage']) {
        await grantEntitlement(env.DB, userId, k, 'apple_iap', transactionId);
      }
    }

    return json({ success: true, itemKey, synced: true }, 200, corsHeaders);
  } catch {
    return json({ error: 'IAP verification failed' }, 500, corsHeaders);
  }
}
