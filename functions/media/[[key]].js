// Sirve archivos de R2. Las llaves llevan un id aleatorio de 16 caracteres,
// así que no se pueden adivinar; las usa tanto el equipo como el portal del cliente.
export async function onRequestGet({ params, env, request }) {
  const key = (params.key || []).join('/');
  if (!key || key.includes('..')) return new Response('No encontrado', { status: 404 });
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
