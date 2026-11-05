/**
 * POST /api/room/answer   { code, qid, clientId, text }
 * Stores this partner's answer for the current question of a room in "answer together" mode.
 */
import {
  callerTag,
  getCorsHeaders,
  getRoomState,
  isRoomRateLimited,
  isValidClientId,
  isValidRoomCode,
  normalizeQid,
  recordRoomFailure,
  submitRoomAnswer,
} from '../payment/_lib.js';

const json = (body, status, cors) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', ...cors } });

export async function onRequestOptions(context) {
  return new Response(null, { status: 204, headers: getCorsHeaders(context.request, 'POST, OPTIONS') });
}

export async function onRequestPost({ request, env }) {
  const cors = getCorsHeaders(request, 'POST, OPTIONS');
  try {
    if (!env.DB) return json({ error: 'Service unavailable' }, 503, cors);
    const body = await request.json().catch(() => ({}));
    const code = String(body.code || '').trim();
    const qid = normalizeQid(body.qid);
    if (!isValidRoomCode(code) || !qid || !isValidClientId(body.clientId) || typeof body.text !== 'string') {
      return json({ error: 'Invalid request' }, 400, cors);
    }

    const tag = await callerTag(request);
    if (await isRoomRateLimited(env.DB, tag)) return json({ error: 'Too many attempts' }, 429, cors);

    const room = await getRoomState(env.DB, code);
    if (!room) {
      await recordRoomFailure(env.DB, tag);
      return json({ error: 'Room not found' }, 404, cors);
    }
    if (room.mode !== 'reveal') return json({ error: 'Answer mode is off', code: 'not_reveal_mode' }, 409, cors);

    const result = await submitRoomAnswer(env.DB, code, qid, body.clientId, body.text);
    if (!result.ok) return json({ error: result.error, code: result.error }, result.error === 'room_full' ? 409 : 400, cors);
    return json({ success: true }, 200, cors);
  } catch {
    return json({ error: 'Internal error' }, 500, cors);
  }
}
