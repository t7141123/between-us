/**
 * Cloudflare Pages Function: /api/track
 * Handles anonymous telemetry events from Web, iOS, and Android clients.
 */

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}

export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const payload = await request.json().catch(() => null);
    if (!payload || !payload.eventName) {
      return new Response(JSON.stringify({ error: 'Invalid payload' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
      });
    }

    const sessionId = String(payload.sessionId || 'anonymous').slice(0, 64);
    const eventName = String(payload.eventName).slice(0, 32);
    const category = payload.category ? String(payload.category).slice(0, 32) : null;
    const language = payload.language ? String(payload.language).slice(0, 16) : null;
    let platform = payload.platform ? String(payload.platform).slice(0, 32) : 'web';

    // Extract geo info from Cloudflare Request metadata
    const country = request.cf?.country || 'Unknown';
    const city = request.cf?.city || 'Unknown';

    // Parse user-agent if platform wasn't explicitly native
    const userAgent = request.headers.get('user-agent') || '';
    if (platform === 'web') {
      if (/iPhone|iPad|iPod/i.test(userAgent)) platform = 'iOS (Web)';
      else if (/Android/i.test(userAgent)) platform = 'Android (Web)';
      else if (/Macintosh/i.test(userAgent)) platform = 'macOS';
      else if (/Windows/i.test(userAgent)) platform = 'Windows';
      else if (/Linux/i.test(userAgent)) platform = 'Linux';
    }

    if (env.DB) {
      await env.DB.prepare(
        `INSERT INTO events (session_id, event_name, category, language, country, city, platform)
         VALUES (?, ?, ?, ?, ?, ?, ?)`
      )
        .bind(sessionId, eventName, category, language, country, city, platform)
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
