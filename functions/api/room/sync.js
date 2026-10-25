/**
 * POST /api/room/sync
 * Syncs the latest card action (next question, flip, category change) across partners.
 */
import { updateRoomState } from '../payment/_lib.js';

export async function onRequestPost({ request, env }) {
  try {
    const body = await request.json().catch(() => ({}));
    const code = String(body.code || '').trim();

    if (!code) {
      return new Response(JSON.stringify({ error: 'Missing room code' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    const updated = await updateRoomState(env.DB, code, {
      category: body.category,
      questionText: body.questionText,
      isFlipped: body.isFlipped,
    });

    if (!updated) {
      return new Response(JSON.stringify({ error: 'Room not found' }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    return new Response(JSON.stringify({ success: true, room: updated }), {
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
