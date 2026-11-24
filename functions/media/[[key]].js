// Sirve archivos de R2. Las llaves llevan un id aleatorio de 16 caracteres,
// así que no se pueden adivinar; las usa tanto el equipo como el portal del cliente.
export async function onRequestGet({ params, env, request }) {
  const key = (params.key || []).join('/');
  if (!key || key.includes('..')) return new Response('No encontrado', { status: 404 });
  // Material inicial que vive en el sitio (public/_seed) y no en R2.
  if (key.startsWith('seed/')) {
    const res = await env.ASSETS.fetch(new URL('/_seed/' + key.slice(5), request.url));
    if (!res.ok) return new Response('No encontrado', { status: 404 });
    const h = new Headers({ 'content-type': res.headers.get('content-type') || 'application/octet-stream', 'cache-control': 'public, max-age=86400', 'accept-ranges': 'bytes' });
    const range = request.headers.get('range');
    if (!range) return new Response(res.body, { headers: h });
    // Los videos necesitan respuestas parciales (206) para reproducirse en iPhone.
    const buf = await res.arrayBuffer(), size = buf.byteLength;
    const m = /bytes=(\d*)-(\d*)/.exec(range) || [];
    let start = m[1] ? Number(m[1]) : size - Number(m[2] || 0), end = m[1] && m[2] ? Number(m[2]) : size - 1;
    start = Math.max(0, start); end = Math.min(size - 1, end);
    h.set('content-range', `bytes ${start}-${end}/${size}`);
    return new Response(buf.slice(start, end + 1), { status: 206, headers: h });
  }
  const range = request.headers.get('range');
  const obj = await env.MEDIA.get(key, range ? { range: parseRange(range) } : undefined);
  if (!obj) return new Response('No encontrado', { status: 404 });
  const headers = new Headers();
  obj.writeHttpMetadata(headers);
  headers.set('etag', obj.httpEtag);
  headers.set('cache-control', 'private, max-age=86400');
  headers.set('accept-ranges', 'bytes');
  if (range && obj.range) {
    const { offset = 0, length } = obj.range;
    headers.set('content-range', `bytes ${offset}-${offset + length - 1}/${obj.size}`);
    headers.set('content-length', String(length));
    return new Response(obj.body, { status: 206, headers });
  }
  return new Response(obj.body, { headers });
}

function parseRange(h) {
  const m = /bytes=(\d*)-(\d*)/.exec(h);
  if (!m) return undefined;
  const start = m[1] ? Number(m[1]) : undefined, end = m[2] ? Number(m[2]) : undefined;
  if (start === undefined) return { suffix: end };
  return end === undefined ? { offset: start } : { offset: start, length: end - start + 1 };
}
