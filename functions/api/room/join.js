/**
 * POST /api/room/join
 * Joins an existing room using the 4-digit room code.
 */
import {
  callerTag,
  getCorsHeaders,
  getRoomState,
  isRoomRateLimited,
  isValidRoomCode,
  recordRoomFailure,
} from '../payment/_lib.js';

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
    const code = String(body.code || '').trim();

    if (!isValidRoomCode(code)) {
      return new Response(JSON.stringify({ error: 'Invalid 4-digit room code' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      });
    }

    const tag = await callerTag(request);
    if (await isRoomRateLimited(env.DB, tag)) {
      return new Response(JSON.stringify({ error: 'Too many attempts, try again later' }), {
        status: 429,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    const room = await getRoomState(env.DB, code);
    if (!room) {
      await recordRoomFailure(env.DB, tag);
      return new Response(JSON.stringify({ error: 'Room not found or expired' }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      });
    }

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
