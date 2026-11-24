// API del equipo · todo lo que está detrás del login (Cloudflare Access).
import { json, fail, id, token, now, body, mediaUrl, STATUS, STATUS_LABEL, KINDS, logActivity, dayLabel, sendMail, esc } from '../../../lib/util.js';
import { currentMember } from '../../../lib/auth.js';
import { AGENTS, agentById, runModel } from '../../../lib/agents.js';

export async function onRequest(ctx) {
  const { request, env, params } = ctx;
  const auth = await currentMember(request, env);
  if (!auth) return fail(401, 'Inicia sesión para continuar.');
  if (!auth.member) return fail(403, `El correo ${auth.email} no pertenece a ningún espacio de No'j OS.`);
  const seg = params.path || [];
  const method = request.method;
  const W = auth.workspace.id;
  const me = auth.member;
  try {
    const literal = ['activity'].includes(seg[0]);
    const route = `${method} /${seg.map((s, i) => (i % 2 === 1 && !literal ? ':' : s)).join('/')}`;
    const p1 = seg[1];
    switch (route) {
      case 'GET /me': return me_(env, auth);
      case 'GET /clients/:': return getClient(env, W, p1);
      case 'PATCH /clients/:': return patchClient(env, W, p1, await body(request));
      case 'POST /clients/:/avatar': return uploadAvatar(env, W, p1, request);
      case 'GET /clients/:/posts': return listPosts(env, W, p1);
      case 'POST /clients/:/posts': return createPost(env, W, me, p1, await body(request));
      case 'GET /clients/:/requests': return listRequests(env, W, p1, request);
      case 'POST /clients/:/requests': return createRequest(env, W, me, p1, await body(request), request);
      case 'GET /posts/:': return getPost(env, W, p1);
      case 'PATCH /posts/:': return patchPost(env, W, me, p1, await body(request));
      case 'POST /posts/:/comments': return addComment(env, W, me, p1, await body(request));
      case 'POST /posts/:/media': return uploadMedia(env, W, p1, request);
      case 'DELETE /media/:': return deleteMedia(env, W, p1);
      case 'POST /highlights/:/image': return uploadHighlight(env, W, p1, request);
      case 'GET /tasks': return listTasks(env, W);
      case 'POST /tasks': return createTask(env, W, me, await body(request));
      case 'PATCH /tasks/:': return patchTask(env, W, me, p1, await body(request));
      case 'GET /activity': return listActivity(env, W, me);
      case 'POST /activity/read': return markRead(env, me);
      case 'GET /agents': return listAgents(env, W);
      case 'PATCH /agents/:': return toggleAgent(env, W, me, p1, await body(request));
      case 'POST /agents/:/run': return runAgent(env, W, me, p1, await body(request));
      default: return fail(404, 'Ruta no encontrada');
    }
  } catch (e) {
    return fail(500, 'Error interno: ' + (e && e.message ? e.message : String(e)));
  }
}

// ---------- helpers de pertenencia (todo se valida contra el workspace) ----------
const clientOf = (env, W, cid) => env.DB.prepare('SELECT * FROM clients WHERE id=? AND workspace_id=?').bind(cid, W).first();
const postOf = (env, W, pid) => env.DB.prepare(
  'SELECT p.*, c.workspace_id, c.name AS client_name FROM posts p JOIN clients c ON c.id=p.client_id WHERE p.id=? AND c.workspace_id=?'
).bind(pid, W).first();

async function me_(env, auth) {
  const W = auth.workspace.id;
  const clients = (await env.DB.prepare(
    `SELECT c.id, c.name, c.handle, c.avatar_key,
            (SELECT status FROM approval_requests r WHERE r.client_id=c.id ORDER BY created_at DESC LIMIT 1) AS last_request
       FROM clients c WHERE c.workspace_id=? ORDER BY c.name`
  ).bind(W).all()).results.map((c) => ({ ...c, avatar: mediaUrl(c.avatar_key) }));
  const members = (await env.DB.prepare('SELECT id, name, initials, color, role FROM members WHERE workspace_id=? ORDER BY name').bind(W).all()).results;
  const seen = await env.DB.prepare('SELECT last_seen FROM reads WHERE member_id=?').bind(auth.member.id).first();
  const unread = await env.DB.prepare('SELECT count(*) AS n FROM activity WHERE workspace_id=? AND created_at > ?')
    .bind(W, seen ? seen.last_seen : '1970-01-01').first();
  return json({ member: auth.member, workspace: auth.workspace, workspaces: auth.workspaces, clients, members, unread: unread.n });
}

async function getClient(env, W, cid) {
  const c = await clientOf(env, W, cid);
  if (!c) return fail(404, 'Cliente no encontrado');
  const hl = (await env.DB.prepare('SELECT id, label, image_key FROM highlights WHERE client_id=? ORDER BY position').bind(cid).all()).results
    .map((h) => ({ id: h.id, label: h.label, image: mediaUrl(h.image_key) }));
  return json({ ...c, avatar: mediaUrl(c.avatar_key), highlights: hl });
}

async function patchClient(env, W, cid, b) {
  const c = await clientOf(env, W, cid);
  if (!c) return fail(404, 'Cliente no encontrado');
  const fields = ['name', 'handle', 'services', 'bio', 'location', 'approver_name', 'approver_email', 'brand_tone', 'owner_member'];
  const sets = [], vals = [];
  for (const f of fields) if (f in b) { sets.push(f + '=?'); vals.push(String(b[f] ?? '')); }
  if (!sets.length) return json({ ok: true });
  await env.DB.prepare(`UPDATE clients SET ${sets.join(', ')} WHERE id=?`).bind(...vals, cid).run();
  return getClient(env, W, cid);
}

async function putFile(env, file, folder) {
  if (!file || typeof file === 'string') throw new Error('Falta el archivo');
  if (file.size > 95 * 1024 * 1024) throw new Error('El archivo pasa de 95 MB');
  const ext = (file.name.split('.').pop() || 'bin').toLowerCase().replace(/[^a-z0-9]/g, '');
  const key = `${folder}/${id()}.${ext}`;
  await env.MEDIA.put(key, file.stream(), { httpMetadata: { contentType: file.type || 'application/octet-stream' } });
  return { key, mime: file.type || 'application/octet-stream' };
}

async function uploadAvatar(env, W, cid, request) {
  const c = await clientOf(env, W, cid);
  if (!c) return fail(404, 'Cliente no encontrado');
  const form = await request.formData();
  const { key } = await putFile(env, form.get('file'), `${W}/${cid}/perfil`);
  await env.DB.prepare('UPDATE clients SET avatar_key=? WHERE id=?').bind(key, cid).run();
  return json({ avatar: mediaUrl(key) });
}

async function uploadHighlight(env, W, hid, request) {
  const h = await env.DB.prepare('SELECT h.*, c.workspace_id FROM highlights h JOIN clients c ON c.id=h.client_id WHERE h.id=? AND c.workspace_id=?').bind(hid, W).first();
  if (!h) return fail(404, 'Destacada no encontrada');
  const form = await request.formData();
  const { key } = await putFile(env, form.get('file'), `${W}/${h.client_id}/perfil`);
  await env.DB.prepare('UPDATE highlights SET image_key=? WHERE id=?').bind(key, hid).run();
  return json({ image: mediaUrl(key) });
}

function shapePost(p, media, ncomments = 0) {
  const m = media.filter((x) => x.post_id === p.id).sort((a, b) => b.is_cover - a.is_cover || a.position - b.position);
  return {
    id: p.id, number: p.number, title: p.title, kind: p.kind, publish_on: p.publish_on, date: dayLabel(p.publish_on),
    status: p.status, status_label: STATUS_LABEL[p.status], copy: p.copy, location: p.location, owner: p.owner_member,
    notes: p.notes, updated_at: p.updated_at, comments: ncomments,
    media: m.map((x) => ({ id: x.id, url: mediaUrl(x.r2_key), mime: x.mime, video: x.mime.startsWith('video/') })),
  };
}

async function listPosts(env, W, cid) {
  const c = await clientOf(env, W, cid);
  if (!c) return fail(404, 'Cliente no encontrado');
  const posts = (await env.DB.prepare('SELECT * FROM posts WHERE client_id=? ORDER BY number DESC').bind(cid).all()).results;
  const media = (await env.DB.prepare('SELECT pm.* FROM post_media pm JOIN posts p ON p.id=pm.post_id WHERE p.client_id=?').bind(cid).all()).results;
  const counts = (await env.DB.prepare('SELECT post_id, count(*) n FROM comments WHERE post_id IN (SELECT id FROM posts WHERE client_id=?) GROUP BY post_id').bind(cid).all()).results;
  const cm = Object.fromEntries(counts.map((r) => [r.post_id, r.n]));
  return json(posts.map((p) => shapePost(p, media, cm[p.id] || 0)));
}

async function createPost(env, W, me, cid, b) {
  const c = await clientOf(env, W, cid);
  if (!c) return fail(404, 'Cliente no encontrado');
  const max = await env.DB.prepare('SELECT coalesce(max(number),0) n FROM posts WHERE client_id=?').bind(cid).first();
  const pid = id('p_');
  const kind = KINDS.includes(b.kind) ? b.kind : 'foto';
  await env.DB.prepare(
    'INSERT INTO posts (id, client_id, number, title, kind, publish_on, status, copy, location, owner_member) VALUES (?,?,?,?,?,?,?,?,?,?)'
  ).bind(pid, cid, max.n + 1, String(b.title || 'Nueva publicación'), kind, b.publish_on || null, 'borrador', '', c.location || '', me.id).run();
  await logActivity(env, { workspace_id: W, client_id: cid, post_id: pid, actor: me.name, kind: 'post.new', text: `${me.name} creó P${max.n + 1} · ${b.title || 'Nueva publicación'}` });
  return getPost(env, W, pid);
}

async function getPost(env, W, pid) {
  const p = await postOf(env, W, pid);
  if (!p) return fail(404, 'Publicación no encontrada');
  const media = (await env.DB.prepare('SELECT * FROM post_media WHERE post_id=?').bind(pid).all()).results;
  const comments = (await env.DB.prepare('SELECT id, author_type, author_id, author_name, body, to_client, created_at FROM comments WHERE post_id=? ORDER BY created_at').bind(pid).all()).results;
  const history = (await env.DB.prepare('SELECT actor, text, created_at FROM activity WHERE post_id=? ORDER BY created_at DESC LIMIT 30').bind(pid).all()).results;
  return json({ ...shapePost(p, media, comments.length), comments, history });
}

async function patchPost(env, W, me, pid, b) {
  const p = await postOf(env, W, pid);
  if (!p) return fail(404, 'Publicación no encontrada');
  const sets = [], vals = [];
  for (const f of ['title', 'copy', 'location', 'notes']) if (f in b) { sets.push(f + '=?'); vals.push(String(b[f] ?? '')); }
  if ('kind' in b && KINDS.includes(b.kind)) { sets.push('kind=?'); vals.push(b.kind); }
  if ('publish_on' in b) { sets.push('publish_on=?'); vals.push(b.publish_on || null); }
  if ('owner' in b) { sets.push('owner_member=?'); vals.push(b.owner || null); }
  if ('status' in b && STATUS.includes(b.status) && b.status !== p.status) { sets.push('status=?'); vals.push(b.status); }
  if (!sets.length) return getPost(env, W, pid);
  sets.push("updated_at=datetime('now')");
  await env.DB.prepare(`UPDATE posts SET ${sets.join(', ')} WHERE id=?`).bind(...vals, pid).run();
  if ('status' in b && b.status !== p.status && STATUS.includes(b.status)) {
    await logActivity(env, { workspace_id: W, client_id: p.client_id, post_id: pid, actor: me.name, kind: 'post.status', text: `${me.name} cambió P${p.number} a «${STATUS_LABEL[b.status]}»` });
  }
  return getPost(env, W, pid);
}

async function addComment(env, W, me, pid, b) {
  const p = await postOf(env, W, pid);
  if (!p) return fail(404, 'Publicación no encontrada');
  const text = String(b.body || '').trim();
  if (!text) return fail(400, 'El comentario está vacío');
  const toClient = b.to_client ? 1 : 0;
  await env.DB.prepare('INSERT INTO comments (id, post_id, author_type, author_id, author_name, body, to_client) VALUES (?,?,?,?,?,?,?)')
    .bind(id('k_'), pid, 'member', me.id, me.name, text.slice(0, 4000), toClient).run();
  await logActivity(env, { workspace_id: W, client_id: p.client_id, post_id: pid, actor: me.name, kind: 'comment', text: `${me.name} ${toClient ? 'le respondió al cliente' : 'comentó'} en P${p.number}: «${text.slice(0, 80)}»` });
  return getPost(env, W, pid);
}

async function uploadMedia(env, W, pid, request) {
  const p = await postOf(env, W, pid);
  if (!p) return fail(404, 'Publicación no encontrada');
  const form = await request.formData();
  const files = form.getAll('file');
  const pos = await env.DB.prepare('SELECT coalesce(max(position),0) n FROM post_media WHERE post_id=?').bind(pid).first();
  let n = pos.n;
  for (const f of files) {
    const { key, mime } = await putFile(env, f, `${W}/${p.client_id}/${pid}`);
    n += 1;
    await env.DB.prepare('INSERT INTO post_media (id, post_id, r2_key, mime, position) VALUES (?,?,?,?,?)').bind(id('mf_'), pid, key, mime, n).run();
  }
  await env.DB.prepare("UPDATE posts SET updated_at=datetime('now') WHERE id=?").bind(pid).run();
  return getPost(env, W, pid);
}

async function deleteMedia(env, W, mid) {
  const m = await env.DB.prepare(
    'SELECT pm.*, p.id AS pid FROM post_media pm JOIN posts p ON p.id=pm.post_id JOIN clients c ON c.id=p.client_id WHERE pm.id=? AND c.workspace_id=?'
  ).bind(mid, W).first();
  if (!m) return fail(404, 'Archivo no encontrado');
  await env.MEDIA.delete(m.r2_key);
  await env.DB.prepare('DELETE FROM post_media WHERE id=?').bind(mid).run();
  return getPost(env, W, m.pid);
}

// ---------- envíos a aprobación ----------
async function listRequests(env, W, cid, request) {
  const c = await clientOf(env, W, cid);
  if (!c) return fail(404, 'Cliente no encontrado');
  const origin = new URL(request.url).origin;
  const rows = (await env.DB.prepare(
    `SELECT r.*, (SELECT count(*) FROM approval_items i WHERE i.request_id=r.id) total,
            (SELECT count(*) FROM approval_items i WHERE i.request_id=r.id AND i.decision='ok') ok,
            (SELECT count(*) FROM approval_items i WHERE i.request_id=r.id AND i.decision='cambio') cambio
       FROM approval_requests r WHERE r.client_id=? ORDER BY r.created_at DESC LIMIT 20`
  ).bind(cid).all()).results;
  return json(rows.map((r) => ({ ...r, link: `${origin}/a/${r.token}` })));
}

async function createRequest(env, W, me, cid, b, request) {
  const c = await clientOf(env, W, cid);
  if (!c) return fail(404, 'Cliente no encontrado');
  const type = ['semana', 'quincena', 'mes'].includes(b.period_type) ? b.period_type : 'quincena';
  const start = String(b.period_start || ''), end = String(b.period_end || '');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(start) || !/^\d{4}-\d{2}-\d{2}$/.test(end)) return fail(400, 'Periodo inválido');
  const ready = (await env.DB.prepare(
    "SELECT id, number FROM posts WHERE client_id=? AND publish_on BETWEEN ? AND ? AND status IN ('lista','cambio')"
  ).bind(cid, start, end).all()).results;
  if (!ready.length) return fail(400, 'No hay publicaciones listas en ese periodo.');
  const rid = id('r_'), tk = token();
  const sentTo = String(b.sent_to || c.approver_email || '').trim();
  const stmts = [
    env.DB.prepare('INSERT INTO approval_requests (id, client_id, period_type, period_start, period_end, token, due_at, sent_by, sent_to) VALUES (?,?,?,?,?,?,?,?,?)')
      .bind(rid, cid, type, start, end, tk, b.due_at || null, me.id, sentTo),
  ];
  for (const p of ready) {
    stmts.push(env.DB.prepare('INSERT INTO approval_items (request_id, post_id) VALUES (?,?)').bind(rid, p.id));
    stmts.push(env.DB.prepare("UPDATE posts SET status='aprob', updated_at=datetime('now') WHERE id=?").bind(p.id));
  }
  await env.DB.batch(stmts);
  if (sentTo && sentTo !== c.approver_email) await env.DB.prepare('UPDATE clients SET approver_email=? WHERE id=?').bind(sentTo, cid).run();
  const link = `${new URL(request.url).origin}/a/${tk}`;
  const label = `${dayLabel(start)} – ${dayLabel(end)}`;
  const mail = await sendMail(env, {
    to: sentTo,
    subject: `${c.name} · Parrilla ${label} para aprobación`,
    html: `<div style="font-family:Arial,sans-serif;font-size:15px;line-height:1.6;color:#111">
      <p>Hola ${esc(c.approver_name || '')},</p>
      <p>Ya está lista la parrilla de <b>${esc(label)}</b> (${ready.length} publicaciones). Puedes verla como se verá en Instagram y aprobar o comentar cada publicación desde aquí:</p>
      <p><a href="${link}" style="display:inline-block;background:#111;color:#fff;padding:12px 20px;text-decoration:none">Revisar parrilla</a></p>
      ${b.due_at ? `<p>Te pedimos tus comentarios antes del ${esc(b.due_at)}.</p>` : ''}
      ${b.message ? `<p>${esc(b.message)}</p>` : ''}
      <p>Saludos,<br>${esc(me.name)} · No'j Studio</p></div>`,
  });
  await logActivity(env, { workspace_id: W, client_id: cid, actor: me.name, kind: 'request.sent',
    text: `${me.name} envió la parrilla ${label} a ${c.approver_name || sentTo || 'el cliente'} (${ready.length} publicaciones)` });
  return json({ id: rid, link, items: ready.length, mail });
}

// ---------- pendientes ----------
async function listTasks(env, W) {
  const rows = (await env.DB.prepare(
    `SELECT t.*, c.name AS client_name FROM tasks t LEFT JOIN clients c ON c.id=t.client_id
      WHERE t.workspace_id=? ORDER BY CASE t.status WHEN 'cerrado' THEN 1 ELSE 0 END, t.due_on IS NULL, t.due_on, t.created_at`
  ).bind(W).all()).results;
  return json(rows);
}

async function createTask(env, W, me, b) {
  const title = String(b.title || '').trim();
  if (!title) return fail(400, 'Falta el título');
  if (b.client_id && !(await clientOf(env, W, b.client_id))) return fail(404, 'Cliente no encontrado');
  const tid = id('t_');
  await env.DB.prepare('INSERT INTO tasks (id, workspace_id, client_id, title, detail, bucket, status, assignee, waiting_on, due_on) VALUES (?,?,?,?,?,?,?,?,?,?)')
    .bind(tid, W, b.client_id || null, title, String(b.detail || ''), ['hoy', 'equipo', 'cliente'].includes(b.bucket) ? b.bucket : 'equipo',
      'pendiente', b.assignee || null, String(b.waiting_on || ''), b.due_on || null).run();
  await logActivity(env, { workspace_id: W, client_id: b.client_id || null, actor: me.name, kind: 'task', text: `${me.name} agregó el pendiente «${title}»` });
  return json(await env.DB.prepare('SELECT * FROM tasks WHERE id=?').bind(tid).first());
}

async function patchTask(env, W, me, tid, b) {
  const t = await env.DB.prepare('SELECT * FROM tasks WHERE id=? AND workspace_id=?').bind(tid, W).first();
  if (!t) return fail(404, 'Pendiente no encontrado');
  const sets = [], vals = [];
  for (const f of ['title', 'detail', 'waiting_on']) if (f in b) { sets.push(f + '=?'); vals.push(String(b[f] ?? '')); }
  for (const f of ['assignee', 'due_on']) if (f in b) { sets.push(f + '=?'); vals.push(b[f] || null); }
  if ('bucket' in b && ['hoy', 'equipo', 'cliente'].includes(b.bucket)) { sets.push('bucket=?'); vals.push(b.bucket); }
  const ST = ['pendiente', 'en_proceso', 'en_espera', 'terminado', 'cerrado'];
  if ('status' in b && ST.includes(b.status)) {
    sets.push('status=?'); vals.push(b.status);
    sets.push('closed_at=?'); vals.push(b.status === 'cerrado' ? now() : null);
  }
  if (sets.length) await env.DB.prepare(`UPDATE tasks SET ${sets.join(', ')} WHERE id=?`).bind(...vals, tid).run();
  if (b.status === 'cerrado' && t.status !== 'cerrado') {
    await logActivity(env, { workspace_id: W, client_id: t.client_id, actor: me.name, kind: 'task', text: `${me.name} cerró «${t.title}»` });
  }
  return json(await env.DB.prepare('SELECT * FROM tasks WHERE id=?').bind(tid).first());
}

// ---------- actividad / notificaciones ----------
async function listActivity(env, W, me) {
  const rows = (await env.DB.prepare('SELECT * FROM activity WHERE workspace_id=? ORDER BY created_at DESC LIMIT 40').bind(W).all()).results;
  const seen = await env.DB.prepare('SELECT last_seen FROM reads WHERE member_id=?').bind(me.id).first();
  return json({ items: rows, last_seen: seen ? seen.last_seen : null });
}

async function markRead(env, me) {
  await env.DB.prepare('INSERT INTO reads (member_id, last_seen) VALUES (?, ?) ON CONFLICT(member_id) DO UPDATE SET last_seen=excluded.last_seen')
    .bind(me.id, now()).run();
  return json({ ok: true });
}

// ---------- agentes (plugins) ----------
async function agentState(env, W) {
  const rows = (await env.DB.prepare('SELECT agent_id, enabled FROM workspace_agents WHERE workspace_id=?').bind(W).all()).results;
  return Object.fromEntries(rows.map((r) => [r.agent_id, !!r.enabled]));
}

async function listAgents(env, W) {
  const state = await agentState(env, W);
  const usage = (await env.DB.prepare(
    "SELECT agent_id, count(*) runs, sum(input_tokens) tin, sum(output_tokens) tout FROM agent_runs WHERE workspace_id=? AND created_at >= date('now','start of month') GROUP BY agent_id"
  ).bind(W).all()).results;
  const u = Object.fromEntries(usage.map((r) => [r.agent_id, r]));
  return json({
    configured: !!env.ANTHROPIC_API_KEY || env.AI_MOCK === '1',
    agents: AGENTS.map(({ build, mock, ...a }) => ({ ...a, enabled: a.status === 'disponible' && !!state[a.id], runs_month: u[a.id] ? u[a.id].runs : 0 })),
  });
}

async function toggleAgent(env, W, me, aid, b) {
  const a = agentById(aid);
  if (!a) return fail(404, 'Agente no encontrado');
  if (me.role !== 'admin') return fail(403, 'Solo un admin puede prender o apagar agentes.');
  if (a.status !== 'disponible') return fail(409, 'Este agente todavía no está disponible.');
  const on = b.enabled ? 1 : 0;
  await env.DB.prepare(
    "INSERT INTO workspace_agents (workspace_id, agent_id, enabled, updated_by, updated_at) VALUES (?,?,?,?,datetime('now')) ON CONFLICT(workspace_id, agent_id) DO UPDATE SET enabled=excluded.enabled, updated_by=excluded.updated_by, updated_at=excluded.updated_at"
  ).bind(W, aid, on, me.id).run();
  await logActivity(env, { workspace_id: W, actor: me.name, kind: 'agent', text: `${me.name} ${on ? 'prendió' : 'apagó'} el agente «${a.name}»` });
  return listAgents(env, W);
}

async function runAgent(env, W, me, aid, b) {
  const a = agentById(aid);
  if (!a || a.status !== 'disponible') return fail(404, 'Agente no disponible');
  const state = await agentState(env, W);
  if (!state[aid]) return fail(403, `El agente «${a.name}» está apagado en este espacio.`);
  const ctx = { input: { instruction: String(b.instruction || '').slice(0, 500) } };
  if (a.needs === 'post') {
    ctx.post = await postOf(env, W, b.post_id);
    if (!ctx.post) return fail(404, 'Publicación no encontrada');
    ctx.client = await clientOf(env, W, ctx.post.client_id);
    ctx.comments = (await env.DB.prepare('SELECT author_type, author_name, body FROM comments WHERE post_id=? ORDER BY created_at DESC LIMIT 12').bind(ctx.post.id).all()).results.reverse();
  } else {
    ctx.client = await clientOf(env, W, b.client_id);
    if (!ctx.client) return fail(404, 'Cliente no encontrado');
    ctx.tasks = (await env.DB.prepare("SELECT title, detail FROM tasks WHERE client_id=? AND bucket='cliente' AND status NOT IN ('cerrado','terminado')").bind(ctx.client.id).all()).results;
    ctx.pending = (await env.DB.prepare("SELECT number, title, publish_on FROM posts WHERE client_id=? AND status='aprob' ORDER BY publish_on").bind(ctx.client.id).all()).results;
  }
  const { prompt, max_tokens } = await a.build(ctx);
  const runId = id('run_');
  try {
    const { output, usage } = await runModel(env, a, prompt, max_tokens);
    await env.DB.prepare('INSERT INTO agent_runs (id, workspace_id, agent_id, member_id, client_id, post_id, status, input_tokens, output_tokens) VALUES (?,?,?,?,?,?,?,?,?)')
      .bind(runId, W, aid, me.id, ctx.client.id, ctx.post ? ctx.post.id : null, 'ok', usage.input_tokens || 0, usage.output_tokens || 0).run();
    return json({ run: runId, agent: aid, ...output });
  } catch (e) {
    await env.DB.prepare('INSERT INTO agent_runs (id, workspace_id, agent_id, member_id, client_id, status) VALUES (?,?,?,?,?,?)').bind(runId, W, aid, me.id, ctx.client.id, 'error').run();
    return fail(e.status || 500, e.message);
  }
}
