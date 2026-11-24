// API pública del portal de aprobación. El cliente entra con el link /a/<token>,
// sin cuenta. Todo se valida contra ese token.
import { json, fail, id, now, body, mediaUrl, logActivity, dayLabel, sendMail, esc } from '../../../lib/util.js';

export async function onRequest({ request, env, params }) {
  const seg = params.path || [];
  if (seg[0] !== 'r' || !seg[1]) return fail(404, 'Ruta no encontrada');
  const req = await env.DB.prepare(
    `SELECT r.*, c.workspace_id, c.name AS client_name, c.handle, c.bio, c.location, c.avatar_key, c.approver_name, c.owner_member, w.name AS ws_name
       FROM approval_requests r JOIN clients c ON c.id=r.client_id JOIN workspaces w ON w.id=c.workspace_id
      WHERE r.token=?`
  ).bind(String(seg[1])).first();
  if (!req) return fail(404, 'Este link no existe o ya no está activo.');
  try {
    if (request.method === 'GET' && seg.length === 2) return view(env, req);
    if (request.method === 'POST' && seg[2] === 'decide') return decide(env, req, await body(request));
    if (request.method === 'POST' && seg[2] === 'finish') return finish(env, req, request);
    return fail(404, 'Ruta no encontrada');
  } catch (e) {
    return fail(500, 'Error interno');
  }
}

async function view(env, req) {
  const items = (await env.DB.prepare('SELECT post_id, decision, note FROM approval_items WHERE request_id=?').bind(req.id).all()).results;
  const byPost = Object.fromEntries(items.map((i) => [i.post_id, i]));
  // Perfil como se verá: lo publicado + lo del periodo (hasta el fin del periodo)
  const posts = (await env.DB.prepare(
    "SELECT * FROM posts WHERE client_id=? AND (status='pub' OR (publish_on IS NOT NULL AND publish_on <= ?)) ORDER BY number DESC"
  ).bind(req.client_id, req.period_end).all()).results;
  const ids = posts.map((p) => p.id);
  const media = ids.length
    ? (await env.DB.prepare(`SELECT * FROM post_media WHERE post_id IN (${ids.map(() => '?').join(',')}) ORDER BY position`).bind(...ids).all()).results
    : [];
  const thread = ids.length
    ? (await env.DB.prepare(`SELECT post_id, author_type, author_name, body, created_at FROM comments WHERE post_id IN (${ids.map(() => '?').join(',')}) AND (author_type='client' OR to_client=1) ORDER BY created_at`).bind(...ids).all()).results
    : [];
  const hl = (await env.DB.prepare('SELECT label, image_key FROM highlights WHERE client_id=? ORDER BY position').bind(req.client_id).all()).results;
  const inPeriod = (p) => p.publish_on && p.publish_on >= req.period_start && p.publish_on <= req.period_end;
  return json({
    client: { name: req.client_name, handle: req.handle, bio: req.bio, location: req.location, avatar: mediaUrl(req.avatar_key), approver: req.approver_name,
      highlights: hl.map((h) => ({ label: h.label, image: mediaUrl(h.image_key) })) },
    agency: req.ws_name,
    request: { period_type: req.period_type, label: `${dayLabel(req.period_start)} – ${dayLabel(req.period_end)}`, due_at: req.due_at, status: req.status },
    posts: posts.map((p) => {
      const it = byPost[p.id];
      const state = it ? (it.decision || 'pendiente') : (p.status === 'pub' || !inPeriod(p) ? 'publicada' : 'produccion');
      return {
        id: p.id, number: p.number, title: p.title, kind: p.kind, date: dayLabel(p.publish_on),
        copy: state === 'produccion' ? '' : p.copy, location: p.location, state, note: it ? it.note : '',
        thread: thread.filter((k) => k.post_id === p.id).map((k) => ({ who: k.author_type === 'client' ? 'client' : 'team', name: k.author_name, body: k.body, at: k.created_at })),
        media: media.filter((m) => m.post_id === p.id).map((m) => ({ url: mediaUrl(m.r2_key), video: m.mime.startsWith('video/') })),
      };
    }),
  });
}

async function decide(env, req, b) {
  if (req.status === 'cerrada') return fail(409, 'Esta parrilla ya se cerró.');
  const it = await env.DB.prepare('SELECT * FROM approval_items WHERE request_id=? AND post_id=?').bind(req.id, String(b.post_id || '')).first();
  if (!it) return fail(404, 'Esa publicación no está en esta parrilla.');
  const decision = b.decision === 'ok' ? 'ok' : b.decision === 'cambio' ? 'cambio' : null;
  if (!decision) return fail(400, 'Decisión inválida');
  const note = String(b.note || '').trim().slice(0, 2000);
  const post = await env.DB.prepare('SELECT number, title FROM posts WHERE id=?').bind(it.post_id).first();
  const who = req.approver_name || 'El cliente';
  const stmts = [
    env.DB.prepare('UPDATE approval_items SET decision=?, note=?, decided_at=? WHERE request_id=? AND post_id=?').bind(decision, note, now(), req.id, it.post_id),
    env.DB.prepare("UPDATE posts SET status=?, updated_at=datetime('now') WHERE id=?").bind(decision, it.post_id),
  ];
  if (note) stmts.push(env.DB.prepare('INSERT INTO comments (id, post_id, author_type, author_name, body) VALUES (?,?,?,?,?)').bind(id('k_'), it.post_id, 'client', who, note));
  await env.DB.batch(stmts);
  await logActivity(env, { workspace_id: req.workspace_id, client_id: req.client_id, post_id: it.post_id, actor: who, kind: 'request.answered',
    text: decision === 'ok' ? `${who} aprobó P${post.number} · ${post.title}` : `${who} pidió un cambio en P${post.number}${note ? ': «' + note.slice(0, 90) + '»' : ''}` });
  return view(env, { ...req });
}

async function finish(env, req, request) {
  const r = await env.DB.prepare(
    "SELECT count(*) total, sum(decision='ok') ok, sum(decision='cambio') cambio FROM approval_items WHERE request_id=?"
  ).bind(req.id).first();
  await env.DB.prepare("UPDATE approval_requests SET status='respondida', responded_at=? WHERE id=?").bind(now(), req.id).run();
  const who = req.approver_name || 'El cliente';
  const text = `${who} respondió la parrilla ${dayLabel(req.period_start)} – ${dayLabel(req.period_end)}: ${r.ok || 0} aprobadas, ${r.cambio || 0} con cambio`;
  await logActivity(env, { workspace_id: req.workspace_id, client_id: req.client_id, actor: who, kind: 'request.done', text });
  // Aviso por correo a quien envió la parrilla y al responsable del cliente
  const to = (await env.DB.prepare('SELECT email FROM members WHERE id IN (?, ?)').bind(req.sent_by || '', req.owner_member || '').all()).results.map((m) => m.email);
  const origin = new URL(request.url).origin;
  for (const email of [...new Set(to)]) {
    await sendMail(env, { to: email, subject: `${req.client_name} respondió la parrilla`,
      html: `<p style="font-family:Arial,sans-serif;font-size:15px">${esc(text)}.</p><p><a href="${origin}/app/#/c/${req.client_id}">Abrir en No'j OS</a></p>` });
  }
  return json({ ok: r.ok || 0, cambio: r.cambio || 0, total: r.total });
}
