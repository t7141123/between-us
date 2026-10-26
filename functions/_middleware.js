/**
 * Cloudflare Pages Middleware: Canonical URL Enforcer
 * Enforces https://between-us.ark-studio.app as the single official entry point.
 * Performs 301 Permanent Redirects for all alternative hostnames (e.g. *.pages.dev)
 * while preserving paths, query parameters, and safely allowing local development and webhooks.
 */
export async function onRequest(context) {
  const { request, next } = context;
  const url = new URL(request.url);
  const hostname = url.hostname.toLowerCase();

  const CANONICAL_HOST = 'between-us.ark-studio.app';

  // Allow local development runtimes
  const isLocal =
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname.endsWith('.localhost');

  // Allow server-to-server webhook callbacks without redirect if directly targeted
  const isPaymentCallback = url.pathname.startsWith('/api/payment/ecpay/callback');

  // Redirect if hostname is not the canonical host (e.g., love-between-us.pages.dev, *.pages.dev)
  if (!isLocal && !isPaymentCallback && hostname !== CANONICAL_HOST) {
    const targetUrl = new URL(request.url);
    targetUrl.protocol = 'https:';
    targetUrl.host = CANONICAL_HOST;
    targetUrl.port = '';
    return Response.redirect(targetUrl.toString(), 301);
  }

  // Enforce HTTPS on production
  if (!isLocal && url.protocol === 'http:') {
    const targetUrl = new URL(request.url);
    targetUrl.protocol = 'https:';
    targetUrl.host = CANONICAL_HOST;
    targetUrl.port = '';
    return Response.redirect(targetUrl.toString(), 301);
  }

  // Proceed to next handler / static asset
  const response = await next();

  // Attach canonical header for SEO and indexing integrity
  const newHeaders = new Headers(response.headers);
  newHeaders.set(
    'Link',
    `<https://${CANONICAL_HOST}${url.pathname}>; rel="canonical"`
  );

  // Attach defense-in-depth HTTP security headers for all endpoints and assets
  newHeaders.set('X-Content-Type-Options', 'nosniff');
  newHeaders.set('X-Frame-Options', 'DENY');
  newHeaders.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  newHeaders.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), usb=()');
  if (!isLocal) {
    newHeaders.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    );
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: newHeaders,
  });
}
