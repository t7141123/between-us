/**
 * Cloudflare Pages Function: /login
 * Serves the standalone admin login page.
 */

export async function onRequestGet(context) {
  const url = new URL(context.request.url);
  url.pathname = '/login.html';
  return context.env.ASSETS.fetch(url);
}
