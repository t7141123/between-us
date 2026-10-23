/**
 * Cloudflare Pages Function: /api/track
 * Securely handles anonymous telemetry events from Web, iOS, and Android clients.
 * Enforces payload limits, event whitelisting, and parametrized SQL binding.
 */

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

const ALLOWED_EVENTS = new Set([
  'pageview',
  'flip_card',
  'next_question',
  'toggle_favorite',
  'change_category',
  'change_language',
  'start_timer',
]);

const ALLOWED_CATEGORIES = new Set([
  'all',
  'vision',
  'soul',
  'finance',
  'intimacy',
  'fun',
  'growth',
  'faith',
]);

const ALLOWED_LOCALES = new Set(['zh-TW', 'zh-CN', 'en']);

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}

export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    // Security check: Content-Length must not exceed 2KB to prevent memory exhaustion attacks
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

    // Sanitize and validate inputs
    const rawSession = typeof payload.sessionId === 'string' ? payload.sessionId : 'anonymous';
    const sessionId = rawSession.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 48) || 'anonymous';

    let category = null;
    if (typeof payload.category === 'string' && ALLOWED_CATEGORIES.has(payload.category.toLowerCase())) {
      category = payload.category.toLowerCase();
    }

    let language = null;
    if (typeof payload.language === 'string' && ALLOWED_LOCALES.has(payload.language)) {
      language = payload.language;
    }

    let platform = typeof payload.platform === 'string' ? payload.platform.slice(0, 32) : 'web';

    // Extract geo info from Cloudflare Request metadata
    const country = typeof request.cf?.country === 'string' ? request.cf.country.slice(0, 4) : 'Unknown';
    const city = typeof request.cf?.city === 'string' ? request.cf.city.slice(0, 64) : 'Unknown';

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
