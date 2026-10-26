/**
 * POST /api/room/sync
 * Syncs the latest card action (next question, flip, category change) across partners.
 */
import { updateRoomState, getCorsHeaders } from '../payment/_lib.js';

export async function onRequestOptions(context) {
  return new Response(null, {
    status: 204,
    headers: getCorsHeaders(context.request, 'POST, OPTIONS'),
  });
}

const ALLOWED_CATEGORIES = new Set([
  'all',
  'vision',
  'growth',
  'intimacy',
  'soul',
  'sensual',
  'marriage',
  'parenting',
]);

export async function onRequestPost({ request, env }) {
  const corsHeaders = getCorsHeaders(request, 'POST, OPTIONS');

  try {
    const body = await request.json().catch(() => ({}));
    const code = String(body.code || '').trim();

    if (!/^\d{4}$/.test(code)) {
      return new Response(JSON.stringify({ error: 'Missing or invalid 4-digit room code' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      });
    }

    const updates = {};
    if (typeof body.category === 'string') {
      const cat = body.category.trim().toLowerCase().slice(0, 32);
      if (ALLOWED_CATEGORIES.has(cat)) {
        updates.category = cat;
      }
    }

    if (typeof body.questionText === 'string') {
      updates.questionText = body.questionText.slice(0, 500);
    }

    if (body.isFlipped !== undefined) {
      updates.isFlipped = Boolean(body.isFlipped);
    }

    const updated = await updateRoomState(env.DB, code, updates);

    if (!updated) {
      return new Response(JSON.stringify({ error: 'Room not found' }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      });
    }

    return new Response(JSON.stringify({ success: true, room: updated }), {
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : 'Internal error' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });
  }
}
