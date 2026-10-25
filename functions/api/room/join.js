/**
 * POST /api/room/join
 * Joins an existing room using the 4-digit room code.
 */
import { getRoomState } from '../payment/_lib.js';

export async function onRequestPost({ request, env }) {
  try {
    const body = await request.json().catch(() => ({}));
    const code = String(body.code || '').trim();

    if (!code || code.length !== 4) {
      return new Response(JSON.stringify({ error: '請輸入有效的 4 位數房間代號' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    const room = await getRoomState(env.DB, code);
    if (!room) {
      return new Response(JSON.stringify({ error: '找不到此房間或連線已過期，請確認代碼' }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

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
