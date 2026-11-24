// /a/<token> → sirve el portal de aprobación (el token lo lee approve.js de la URL).
export async function onRequestGet({ request, env }) {
  const res = await env.ASSETS.fetch(new URL('/portal/', request.url));
  return new Response(res.body, { status: 200, headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-cache', 'x-robots-tag': 'noindex', 'referrer-policy': 'no-referrer' } });
}
