/**
 * POST /api/room/create
 * Creates a new couple sync room and returns the 4-digit room code.
 */
import { createRoom, generateRoomCode, getCorsHeaders, getRoomState, normalizeRoomCategory, normalizeQid } from '../payment/_lib.js';

export async function onRequestOptions(context) {
  return new Response(null, {
    status: 204,
    headers: getCorsHeaders(context.request, 'POST, OPTIONS'),
  });
}

export async function onRequestPost({ request, env }) {
  const corsHeaders = getCorsHeaders(request, 'POST, OPTIONS');

  try {
    const body = await request.json().catch(() => ({}));
    const category = normalizeRoomCategory(body.category) || 'all';
    const qid = normalizeQid(body.qid);
    const questionText = typeof body.questionText === 'string' ? body.questionText.replace(/[\u0000-\u001F\u007F]/g, ' ').slice(0, 500) : '';

    // Pick a code that is not currently in use so we never overwrite another couple's room.
    let code = generateRoomCode();
    for (let i = 0; i < 20 && (await getRoomState(env.DB, code)); i++) {
      code = generateRoomCode();
    }
    if (await getRoomState(env.DB, code)) {
      return new Response(JSON.stringify({ error: 'Service busy, please try again' }), {
        status: 503,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }
    const room = await createRoom(env.DB, code, category, questionText, qid);

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
