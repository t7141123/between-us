/**
 * Cloudflare Pages Function: /api/admin/stats
 * Queries analytical metrics from Cloudflare D1 database.
 */

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

const ADMIN_USER = 'admin';
const SECRET_SALT = 'between_us_analytics_salt_2026';

function constantTimeEqual(aStr, bStr) {
  if (aStr.length !== bStr.length) return false;
  const a = new TextEncoder().encode(aStr);
  const b = new TextEncoder().encode(bStr);
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a[i] ^ b[i];
  }
  return diff === 0;
}

async function verifyToken(authHeader) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) return false;
  const token = authHeader.slice(7).trim();
  const parts = token.split('.');
  if (parts.length !== 3) return false;

  const [username, expiresAtStr, signature] = parts;
  if (username !== ADMIN_USER) return false;

  const expiresAt = Number(expiresAtStr);
  if (isNaN(expiresAt) || Date.now() > expiresAt) return false;

  const raw = `${ADMIN_USER}:${expiresAt}:${SECRET_SALT}`;
  const encoder = new TextEncoder();
  const digest = await crypto.subtle.digest('SHA-256', encoder.encode(raw));
  const hashArray = Array.from(new Uint8Array(digest));
  const expectedSig = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');

  return constantTimeEqual(signature, expectedSig);
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}

export async function onRequestGet(context) {
  const { request, env } = context;

  const auth = request.headers.get('Authorization');
  const isValid = await verifyToken(auth);

  if (!isValid) {
    return new Response(JSON.stringify({ error: '未授權或登入已過期 (Unauthorized)' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
    });
  }

  if (!env.DB) {
    return new Response(JSON.stringify({ error: 'D1 Database not bound' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
    });
  }

  try {
    // 1. Overview counts
    const totalEventsRes = await env.DB.prepare('SELECT COUNT(*) as cnt FROM events').first();
    const totalSessionsRes = await env.DB.prepare('SELECT COUNT(DISTINCT session_id) as cnt FROM events').first();
    
    // Today
    const todaySessionsRes = await env.DB.prepare(
      "SELECT COUNT(DISTINCT session_id) as cnt FROM events WHERE created_at >= date('now', 'start of day')"
    ).first();
    const todayFlipsRes = await env.DB.prepare(
      "SELECT COUNT(*) as cnt FROM events WHERE event_name = 'flip_card' AND created_at >= date('now', 'start of day')"
    ).first();

    // 2. Countries Top 10
    const countriesRes = await env.DB.prepare(
      `SELECT country, COUNT(*) as count, COUNT(DISTINCT session_id) as users 
       FROM events 
       WHERE country IS NOT NULL 
       GROUP BY country 
       ORDER BY users DESC, count DESC 
       LIMIT 10`
    ).all();

    // 3. Platforms
    const platformsRes = await env.DB.prepare(
      `SELECT platform, COUNT(*) as count, COUNT(DISTINCT session_id) as users 
       FROM events 
       GROUP BY platform 
       ORDER BY count DESC`
    ).all();

    // 4. Categories ranking
    const categoriesRes = await env.DB.prepare(
      `SELECT category, COUNT(*) as count 
       FROM events 
       WHERE category IS NOT NULL AND category != 'all'
       GROUP BY category 
       ORDER BY count DESC 
       LIMIT 10`
    ).all();

    // 5. Daily Trend (Last 14 days)
    const dailyRes = await env.DB.prepare(
      `SELECT strftime('%Y-%m-%d', created_at) as date,
              COUNT(DISTINCT session_id) as users,
              COUNT(*) as total_events,
              SUM(CASE WHEN event_name = 'flip_card' THEN 1 ELSE 0 END) as card_flips
       FROM events 
       WHERE created_at >= date('now', '-14 days')
       GROUP BY date 
       ORDER BY date ASC`
    ).all();

    // 6. Recent 20 Events
    const recentRes = await env.DB.prepare(
      `SELECT id, session_id, event_name, category, language, country, city, platform, created_at 
       FROM events 
       ORDER BY id DESC 
       LIMIT 25`
    ).all();

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          overview: {
            totalEvents: totalEventsRes?.cnt || 0,
            totalSessions: totalSessionsRes?.cnt || 0,
            todaySessions: todaySessionsRes?.cnt || 0,
            todayFlips: todayFlipsRes?.cnt || 0,
          },
          countries: countriesRes.results || [],
          platforms: platformsRes.results || [],
          categories: categoriesRes.results || [],
          dailyTrends: dailyRes.results || [],
          recentEvents: recentRes.results || [],
        },
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
      }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
    });
  }
}
