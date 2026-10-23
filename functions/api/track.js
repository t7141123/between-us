/**
 * Cloudflare Pages Function: /api/track
 * Securely logs visitor sessions, device platforms, and active usage duration.
 * Does not track individual card flips or user private dialogues.
 */

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

const ALLOWED_EVENTS = new Set(['session_start', 'session_ping', 'pageview']);

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}

export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const contentLength = Number(request.headers.get('content-length') || '0');
    if (contentLength > 2048) {
      return new Response(JSON.stringify({ error: 'Payload too large' }), {
        status: 413,
        headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
      });
    }

    const payload = await request.json().catch(() => null);
    if (!payload || !payload.eventName || typeof payload.eventName !== 'string') {
      return new Response(JSON.stringify({ error: 'Invalid payload' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
      });
    }

    const eventName = payload.eventName.trim().toLowerCase();
    if (!ALLOWED_EVENTS.has(eventName)) {
      return new Response(JSON.stringify({ error: 'Unknown event type' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
      });
    }

    const rawSession = typeof payload.sessionId === 'string' ? payload.sessionId : 'anonymous';
    const sessionId = rawSession.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 48) || 'anonymous';

    const rawUser = typeof payload.userId === 'string' ? payload.userId : 'u_' + sessionId.slice(2, 10);
    const userId = rawUser.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 48);

    const duration = Math.min(86400, Math.max(0, parseInt(payload.duration, 10) || 0));

    let platform = typeof payload.platform === 'string' ? payload.platform.slice(0, 32) : 'web';
    const userAgent = request.headers.get('user-agent') || '';
    if (platform === 'web') {
      if (/iPhone|iPad|iPod/i.test(userAgent)) platform = 'iOS (Web)';
      else if (/Android/i.test(userAgent)) platform = 'Android (Web)';
      else if (/Macintosh/i.test(userAgent)) platform = 'macOS';
      else if (/Windows/i.test(userAgent)) platform = 'Windows';
      else if (/Linux/i.test(userAgent)) platform = 'Linux';
    }

    const country = typeof request.cf?.country === 'string' ? request.cf.country.slice(0, 4) : 'Unknown';
    const city = typeof request.cf?.city === 'string' ? request.cf.city.slice(0, 64) : 'Unknown';

    if (env.DB) {
      await env.DB.prepare(
        `INSERT INTO visitor_sessions (session_id, user_id, platform, country, city, duration_seconds)
         VALUES (?, ?, ?, ?, ?, ?)
         ON CONFLICT(session_id) DO UPDATE SET
           duration_seconds = MAX(visitor_sessions.duration_seconds, excluded.duration_seconds),
           last_seen = CURRENT_TIMESTAMP`
      )
        .bind(sessionId, userId, platform, country, city, duration)
        .run();
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message || 'Internal error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
    });
  }
}
