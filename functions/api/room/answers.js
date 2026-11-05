/**
 * GET /api/room/answers?code=...&qid=...&clientId=...
 * Returns this partner's own answer, whether the other partner has answered, and the other
 * partner's answer only after BOTH have answered.
 */
import {
  callerTag,
  getCorsHeaders,
  getRoomAnswers,
  getRoomState,
  isRoomRateLimited,
  isValidClientId,
  isValidRoomCode,
  normalizeQid,
  recordRoomFailure,
} from '../payment/_lib.js';

const json = (body, status, cors) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', ...cors } });

export async function onRequestOptions(context) {
  return new Response(null, { status: 204, headers: getCorsHeaders(context.request, 'GET, OPTIONS') });
}

export async function onRequestGet({ request, env }) {
  const cors = getCorsHeaders(request, 'GET, OPTIONS');
  try {
    if (!env.DB) return json({ error: 'Service unavailable' }, 503, cors);
    const url = new URL(request.url);
    const code = (url.searchParams.get('code') || '').trim();
    const qid = normalizeQid(url.searchParams.get('qid') || '');
    const clientId = url.searchParams.get('clientId') || '';
    if (!isValidRoomCode(code) || !qid || !isValidClientId(clientId)) return json({ error: 'Invalid request' }, 400, cors);

    const tag = await callerTag(request);
    if (await isRoomRateLimited(env.DB, tag)) return json({ error: 'Too many attempts' }, 429, cors);

    const room = await getRoomState(env.DB, code);
    if (!room) {
      await recordRoomFailure(env.DB, tag);
      return json({ error: 'Room not found' }, 404, cors);
    }
    return json(await getRoomAnswers(env.DB, code, qid, clientId), 200, cors);
  } catch {
    return json({ error: 'Internal error' }, 500, cors);
  }
}
