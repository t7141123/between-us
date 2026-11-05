/**
 * Cloud backup of user data (favorites, notes, seen questions, custom questions). Plus members only.
 *
 *   GET /api/sync/data                  -> { kinds: { <kind>: { payload, updatedAt } } }
 *   PUT /api/sync/data                  body { kind, payload, baseUpdatedAt }
 *        200 { updatedAt }              stored
 *        409 { updatedAt }              someone else wrote since `baseUpdatedAt`: refetch, merge, retry
 *
 * Authorization: Bearer <session token>. The user comes from the token only.
 */
import {
  STORE_ITEMS,
  ensureOrdersTable,
  getCorsHeaders,
  verifyAuthToken,
} from '../payment/_lib.js';
import { DATA_KINDS, MAX_PAYLOAD_BYTES, validateDataPayload } from './_data_validate.js';

function json(body, status, corsHeaders) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders },
  });
}

/** Resolves the caller; returns a Response on failure. */
async function authorize(request, env, corsHeaders) {
  const authHeader = request.headers.get('Authorization') || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  const session = await verifyAuthToken(token, env);
  if (!session?.uid) return { response: json({ error: 'Unauthorized' }, 401, corsHeaders) };
  if (!env.DB) return { response: json({ error: 'Service unavailable', code: 'unavailable' }, 503, corsHeaders) };

  await ensureOrdersTable(env.DB);
  const userId = String(session.uid);
  const plus = await env.DB.prepare(
    'SELECT 1 AS ok FROM user_entitlements WHERE user_id = ? AND item_key = ? LIMIT 1'
  )
    .bind(userId, 'plus')
    .first();
  if (!plus || !STORE_ITEMS.plus) {
    return { response: json({ error: 'Plus required', code: 'plus_required' }, 403, corsHeaders) };
  }
  return { userId };
}

export async function onRequestOptions(context) {
  return new Response(null, {
    status: 204,
    headers: getCorsHeaders(context.request, 'GET, PUT, OPTIONS'),
  });
}

export async function onRequestGet({ request, env }) {
  const corsHeaders = getCorsHeaders(request, 'GET, PUT, OPTIONS');
  try {
    const auth = await authorize(request, env, corsHeaders);
    if (auth.response) return auth.response;

    const rows = await env.DB.prepare('SELECT kind, payload, updated_at FROM user_data WHERE user_id = ?')
      .bind(auth.userId)
      .all();
    const kinds = {};
    for (const row of rows.results || []) {
      if (!DATA_KINDS.includes(row.kind)) continue;
      try {
        kinds[row.kind] = { payload: JSON.parse(row.payload), updatedAt: row.updated_at };
      } catch {
        // skip a corrupt row rather than failing the whole backup
      }
    }
    return json({ kinds }, 200, corsHeaders);
  } catch {
    return json({ error: 'Sync failed' }, 500, corsHeaders);
  }
}

export async function onRequestPut({ request, env }) {
  const corsHeaders = getCorsHeaders(request, 'GET, PUT, OPTIONS');
  try {
    const auth = await authorize(request, env, corsHeaders);
    if (auth.response) return auth.response;

    const raw = await request.text();
    if (raw.length > MAX_PAYLOAD_BYTES * 1.2) return json({ error: 'Payload too large' }, 413, corsHeaders);
    let body = null;
    try {
      body = JSON.parse(raw);
    } catch {
      body = null;
    }
    if (!body || !DATA_KINDS.includes(body.kind)) return json({ error: 'Invalid kind' }, 400, corsHeaders);

    const payload = validateDataPayload(body.kind, body.payload);
    if (payload === null) return json({ error: 'Invalid payload' }, 400, corsHeaders);
    const serialized = JSON.stringify(payload);
    if (serialized.length > MAX_PAYLOAD_BYTES) return json({ error: 'Payload too large' }, 413, corsHeaders);

    const base = Number.isFinite(body.baseUpdatedAt) ? Number(body.baseUpdatedAt) : 0;
    const now = Math.max(Date.now(), base + 1);

    let changes = 0;
    if (base === 0) {
      const res = await env.DB.prepare(
        'INSERT INTO user_data (user_id, kind, payload, updated_at) VALUES (?, ?, ?, ?) ON CONFLICT(user_id, kind) DO NOTHING'
      )
        .bind(auth.userId, body.kind, serialized, now)
        .run();
      changes = res?.meta?.changes ?? 0;
    } else {
      const res = await env.DB.prepare(
        'UPDATE user_data SET payload = ?, updated_at = ? WHERE user_id = ? AND kind = ? AND updated_at = ?'
      )
        .bind(serialized, now, auth.userId, body.kind, base)
        .run();
      changes = res?.meta?.changes ?? 0;
    }

    if (changes === 0) {
      const current = await env.DB.prepare('SELECT updated_at FROM user_data WHERE user_id = ? AND kind = ?')
        .bind(auth.userId, body.kind)
        .first();
      return json({ error: 'Conflict', updatedAt: current?.updated_at ?? 0 }, 409, corsHeaders);
    }
    return json({ updatedAt: now }, 200, corsHeaders);
  } catch {
    return json({ error: 'Sync failed' }, 500, corsHeaders);
  }
}
