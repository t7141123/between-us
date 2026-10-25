/**
 * GET /api/room/poll?code=1234&version=1
 * Polls the room for remote partner's state updates.
 */
import { getRoomState } from '../payment/_lib.js';

export async function onRequestGet({ request, env }) {
  try {
    const url = new URL(request.url);
    const code = url.searchParams.get('code');
    const clientVersion = parseInt(url.searchParams.get('version') || '0', 10);

    if (!code) {
      return new Response(JSON.stringify({ error: 'Missing room code' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    const room = await getRoomState(env.DB, code);
    if (!room) {
      return new Response(JSON.stringify({ active: false, error: 'Room expired' }), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    if (room.version > clientVersion) {
      return new Response(JSON.stringify({ updated: true, room }), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    return new Response(JSON.stringify({ updated: false, version: room.version }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
}
