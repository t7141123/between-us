/**
 * POST /api/room/create
 * Creates a new couple sync room and returns the 4-digit room code.
 */
import { createRoom, generateRoomCode } from '../payment/_lib.js';

export async function onRequestPost({ request, env }) {
  try {
    const body = await request.json().catch(() => ({}));
    const category = body.category || 'all';
    const questionText = body.questionText || '';

    let code = generateRoomCode();
    const room = await createRoom(env.DB, code, category, questionText);

    return new Response(JSON.stringify({ success: true, room }), {
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
