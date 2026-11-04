/**
 * Cloudflare Pages Function: /api/auth/oauth
 * Exchanges a native Apple / Google ID token for an app session token.
 * The ID token signature, issuer, audience and expiry are verified server-side;
 * client-supplied email / sub values are never trusted.
 */
import { ensureOrdersTable, getCorsHeaders, signAuthToken } from '../payment/_lib.js';
import { verifyIdToken, OAuthNotConfiguredError, OAuthInvalidTokenError } from './_oauth_verify.js';

function json(body, status, corsHeaders) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders },
  });
}

export async function onRequestOptions(context) {
  return new Response(null, {
    status: 204,
    headers: getCorsHeaders(context.request, 'POST, OPTIONS'),
  });
}

export async function onRequestPost(context) {
  const { request, env } = context;
  const corsHeaders = getCorsHeaders(request, 'POST, OPTIONS');

  try {
    const body = await request.json().catch(() => null);
    if (!body || (body.provider !== 'apple' && body.provider !== 'google') || typeof body.idToken !== 'string') {
      return json({ error: 'Missing provider or idToken' }, 400, corsHeaders);
    }
    const provider = body.provider;

    let identity;
    try {
      identity = await verifyIdToken(provider, body.idToken, env);
    } catch (e) {
      if (e instanceof OAuthNotConfiguredError) {
        return json({ error: 'Sign-in provider is not available yet', notConfigured: true }, 501, corsHeaders);
      }
      if (e instanceof OAuthInvalidTokenError) {
        return json({ error: 'Invalid sign-in token' }, 401, corsHeaders);
      }
      throw e;
    }

    if (!env.DB) return json({ error: 'Service unavailable' }, 503, corsHeaders);
    await ensureOrdersTable(env.DB);

    const subColumn = provider === 'apple' ? 'apple_sub' : 'google_sub';

    // 1) Match by provider subject (stable identifier; Apple may hide / change the email).
    let user = await env.DB.prepare(`SELECT id, email, provider FROM users WHERE ${subColumn} = ?`)
      .bind(identity.sub)
      .first();

    // 2) Otherwise link to an existing account only when the provider verified the email.
    if (!user && identity.email && identity.emailVerified) {
      user = await env.DB.prepare('SELECT id, email, provider FROM users WHERE email = ?')
        .bind(identity.email)
        .first();
      if (user) {
        await env.DB.prepare(`UPDATE users SET ${subColumn} = ? WHERE id = ?`)
          .bind(identity.sub, user.id)
          .run();
      }
    }

    // 3) Otherwise create a new account.
    if (!user) {
      // Apple "Hide My Email" relay addresses are still valid, unique emails.
      const email = identity.email || `${provider}_${identity.sub}@users.invalid`;
      const newId = `u_${crypto.randomUUID().replace(/-/g, '').slice(0, 20)}`;
      await env.DB.prepare(
        'INSERT INTO users (id, email, provider, google_sub, apple_sub) VALUES (?, ?, ?, ?, ?)'
      )
        .bind(
          newId,
          email,
          provider,
          provider === 'google' ? identity.sub : null,
          provider === 'apple' ? identity.sub : null
        )
        .run();
      user = { id: newId, email, provider };
    }

    const token = await signAuthToken(user.id, user.email, env);
    return json(
      { user: { id: user.id, email: user.email, provider: user.provider || provider, token } },
      200,
      corsHeaders
    );
  } catch {
    return json({ error: 'Sign-in failed' }, 500, corsHeaders);
  }
}
