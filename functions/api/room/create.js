/**
 * POST /api/room/create
 * Creates a new couple sync room and returns the 4-digit room code.
 */
import { createRoom, generateRoomCode, getCorsHeaders } from '../payment/_lib.js';

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
    const rawCategory = typeof body.category === 'string' ? body.category.trim().toLowerCase() : 'all';
    const category = ALLOWED_CATEGORIES.has(rawCategory) ? rawCategory : 'all';
    const questionText = typeof body.questionText === 'string' ? body.questionText.slice(0, 500) : '';

    const code = generateRoomCode();
    const room = await createRoom(env.DB, code, category, questionText);

    return new Response(JSON.stringify({ success: true, room }), {
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
