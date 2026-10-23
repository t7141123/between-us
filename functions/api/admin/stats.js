/**
 * Cloudflare Pages Function: /api/admin/stats
 * Queries analytical metrics from Cloudflare D1 database:
 * distinct visitors, devices/platforms, and individual usage duration.
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
    // 1. Overview counts from visitor_sessions
    const totalVisitorsRes = await env.DB.prepare(
      'SELECT COUNT(DISTINCT user_id) as cnt FROM visitor_sessions'
    ).first();
    const totalSessionsRes = await env.DB.prepare(
      'SELECT COUNT(*) as cnt FROM visitor_sessions'
    ).first();
    const todayVisitorsRes = await env.DB.prepare(
      "SELECT COUNT(DISTINCT user_id) as cnt FROM visitor_sessions WHERE last_seen >= date('now', 'start of day')"
    ).first();
    const avgDurationRes = await env.DB.prepare(
      'SELECT ROUND(AVG(duration_seconds)) as avg_sec FROM visitor_sessions'
    ).first();

    // 2. Platforms breakdown
    const platformsRes = await env.DB.prepare(
      `SELECT platform, COUNT(*) as count, COUNT(DISTINCT user_id) as users 
       FROM visitor_sessions 
       GROUP BY platform 
       ORDER BY count DESC`
    ).all();

    // 3. Countries breakdown
    const countriesRes = await env.DB.prepare(
      `SELECT country, COUNT(*) as count, COUNT(DISTINCT user_id) as users 
       FROM visitor_sessions 
       WHERE country IS NOT NULL 
       GROUP BY country 
       ORDER BY users DESC, count DESC 
       LIMIT 10`
    ).all();

    // 4. Daily Trends (Last 14 days)
    const dailyRes = await env.DB.prepare(
      `SELECT strftime('%Y-%m-%d', first_seen) as date,
              COUNT(DISTINCT user_id) as users,
              COUNT(*) as sessions,
              ROUND(SUM(duration_seconds) / 60.0, 1) as total_minutes
       FROM visitor_sessions 
       WHERE first_seen >= date('now', '-14 days')
       GROUP BY date 
       ORDER BY date ASC`
    ).all();

    // 5. Recent individual visitor sessions (last 50)
    const recentRes = await env.DB.prepare(
      `SELECT id, session_id, user_id, platform, country, city, duration_seconds, first_seen, last_seen
       FROM visitor_sessions
       ORDER BY id DESC 
       LIMIT 50`
    ).all();

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          overview: {
            totalVisitors: totalVisitorsRes?.cnt || 0,
            todayVisitors: todayVisitorsRes?.cnt || 0,
            totalSessions: totalSessionsRes?.cnt || 0,
            avgDurationSeconds: avgDurationRes?.avg_sec || 0,
          },
          platforms: platformsRes.results || [],
          countries: countriesRes.results || [],
          dailyTrends: dailyRes.results || [],
          sessions: recentRes.results || [],
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
