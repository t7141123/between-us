/**
 * Cloudflare Pages Function: /admin
 * Serves the admin analytics dashboard SPA.
 */

export async function onRequestGet(context) {
  const url = new URL(context.request.url);
  url.pathname = '/admin.html';
  return context.env.ASSETS.fetch(url);
}
