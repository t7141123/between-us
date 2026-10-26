/**
 * POST /api/room/join
 * Joins an existing room using the 4-digit room code.
 */
import { getRoomState, getCorsHeaders } from '../payment/_lib.js';

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

    if (!/^\d{4}$/.test(code)) {
      return new Response(JSON.stringify({ error: '請輸入有效的 4 位數房間代號 (Invalid 4-digit room code)' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      });
    }

    const room = await getRoomState(env.DB, code);
    if (!room) {
      return new Response(JSON.stringify({ error: '找不到此房間或連線已過期，請確認代碼' }), {
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
