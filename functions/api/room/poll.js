/**
 * GET /api/room/poll?code=1234&version=1
 * Polls the room for remote partner's state updates.
 */
import { getRoomState, getCorsHeaders } from '../payment/_lib.js';

export async function onRequestOptions(context) {
  return new Response(null, {
    status: 204,
    headers: getCorsHeaders(context.request, 'GET, OPTIONS'),
  });
}

export async function onRequestGet({ request, env }) {
  const corsHeaders = getCorsHeaders(request, 'GET, OPTIONS');

  try {
    const url = new URL(request.url);
    const code = String(url.searchParams.get('code') || '').trim();
    const rawVersion = parseInt(url.searchParams.get('version') || '0', 10);
    const clientVersion = Math.max(0, Math.min(1000000, isNaN(rawVersion) ? 0 : rawVersion));

    if (!/^\d{4}$/.test(code)) {
      return new Response(JSON.stringify({ error: 'Missing or invalid 4-digit room code' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      });
    }

    const room = await getRoomState(env.DB, code);
    if (!room) {
      return new Response(JSON.stringify({ active: false, error: 'Room expired' }), {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      });
    }

    if (room.version > clientVersion) {
      return new Response(JSON.stringify({ updated: true, room }), {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      });
    }

    return new Response(JSON.stringify({ updated: false, version: room.version }), {
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
