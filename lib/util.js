// Utilidades compartidas por las Functions de No'j OS.

export const json = (data, status = 200, headers = {}) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', ...headers },
  });

export const fail = (status, message) => json({ error: message }, status);

export const id = (prefix = '') => prefix + crypto.randomUUID().replace(/-/g, '').slice(0, 16);

export const token = () => {
  const b = crypto.getRandomValues(new Uint8Array(24));
  return btoa(String.fromCharCode(...b)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

export const now = () => new Date().toISOString().replace('T', ' ').slice(0, 19);

export async function body(request) {
  try { return await request.json(); } catch { return {}; }
}

export const mediaUrl = (key) => (key ? '/media/' + key : null);

export const STATUS = ['borrador', 'prod', 'lista', 'aprob', 'ok', 'cambio', 'pub'];
export const STATUS_LABEL = {
  borrador: 'Borrador', prod: 'En producción', lista: 'Lista', aprob: 'En aprobación',
  ok: 'Aprobada', cambio: 'Cambio pedido', pub: 'Publicada',
};
export const KINDS = ['foto', 'carr', 'reel', 'historia'];

export async function logActivity(env, { workspace_id, client_id = null, post_id = null, actor, kind, text }) {
  await env.DB.prepare(
    'INSERT INTO activity (id, workspace_id, client_id, post_id, actor, kind, text) VALUES (?,?,?,?,?,?,?)'
  ).bind(id('a_'), workspace_id, client_id, post_id, actor, kind, text).run();
}

// Fechas "YYYY-MM-DD" → etiqueta corta en español
const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
export const dayLabel = (d) => {
  if (!d) return '';
  const [, m, day] = d.split('-').map(Number);
  return day + ' ' + MESES[m - 1];
};

// Envío de correo con Resend (opcional). Si no hay llave, no hace nada.
export async function sendMail(env, { to, subject, html }) {
  if (!env.RESEND_API_KEY || !to) return { sent: false, reason: 'sin_configurar' };
  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { authorization: 'Bearer ' + env.RESEND_API_KEY, 'content-type': 'application/json' },
    body: JSON.stringify({ from: env.MAIL_FROM, to: [to], subject, html }),
  });
  return { sent: r.ok, reason: r.ok ? null : await r.text() };
}

export const esc = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
