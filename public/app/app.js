// No'j OS · app del equipo (sin framework, sin build)
const $ = (s, r = document) => r.querySelector(s);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const ICON = {
  home: '<path d="M3 12l9-8 9 8M5 10v10h14V10"/>', inbox: '<path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.5 5.1L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.5-6.9A2 2 0 0 0 16.8 4H7.2a2 2 0 0 0-1.7 1.1z"/>',
  check: '<path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>', grid: '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>',
  bell: '<path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/>', search: '<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>',
  send: '<path d="M21 3L10 14M21 3l-7 18-4-7-7-4z"/>', eye: '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>', plus: '<path d="M12 5v14M5 12h14"/>',
  spark: '<path d="M12 3l1.9 5.8L20 11l-6.1 2.2L12 19l-1.9-5.8L4 11l6.1-2.2z"/>', x: '<path d="M18 6L6 18M6 6l12 12"/>', link: '<path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7"/><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7"/>',
  pen: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  moon: '<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>',
  bolt: '<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.8-3.6 3.4-5.5 6.5-5.5s5.7 1.9 6.5 5.5M16 4.6a3.5 3.5 0 0 1 0 6.8M18 14.8c2 .7 3.2 2.5 3.5 5.2"/>',
  list: '<path d="M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01"/>',
  play: '<path d="M7 4.5v15l12-7.5z"/>',
  pano: '<rect x="2" y="6" width="20" height="12" rx="2"/><path d="M9 6v12M15 6v12"/>',
  left: '<path d="M15 18l-6-6 6-6"/>', right: '<path d="M9 18l6-6-6-6"/>',
  heart: '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21l7.8-7.5 1-1.1a5.5 5.5 0 0 0 0-7.8z"/>',
  chat: '<path d="M21 11.5a8.4 8.4 0 0 1-12.6 7.3L3 21l2.2-5.4A8.4 8.4 0 1 1 21 11.5z"/>',
  save: '<path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  bot: '<rect x="4" y="8" width="16" height="12" rx="1"/><path d="M12 4v4M9 13v2M15 13v2M2 14h2M20 14h2"/>',
  up: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/>', trash: '<path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14"/>',
};
const ic = (n) => `<svg class="i" viewBox="0 0 24 24" aria-hidden="true">${ICON[n]}</svg>`;
const REEL = '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 3h16a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zm6 6v7l6-3.5z"/></svg>';
const CARR = '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 3h12a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zM3 7h2v12h12v2H4a1 1 0 0 1-1-1z"/></svg>';
const ST = { borrador: 'Borrador', prod: 'En producción', lista: 'Lista', aprob: 'En aprobación', ok: 'Aprobada', cambio: 'Cambio pedido', pub: 'Publicada' };
const KIND = { foto: 'Foto', carr: 'Carrusel', reel: 'Reel' };
const TASK_ST = { pendiente: 'Pendiente', en_proceso: 'En proceso', en_espera: 'En espera', terminado: 'Terminado · sin enviar', cerrado: 'Cerrado' };
const stc = (s) => `var(--${s})`;

// ---------- fechas ----------
const MES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
const MESL = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
const WD = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const D = (s) => { const [y, m, d] = s.split('-').map(Number); return new Date(Date.UTC(y, m - 1, d)); };
const S = (d) => d.toISOString().slice(0, 10);
const add = (s, n) => { const d = D(s); d.setUTCDate(d.getUTCDate() + n); return S(d); };
const lastDay = (s) => { const d = D(s); return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)).getUTCDate(); };
const today = () => new Date(Date.now() - 6 * 3600e3).toISOString().slice(0, 10); // CDMX
const label = (s) => { const d = D(s); return d.getUTCDate() + ' ' + MES[d.getUTCMonth()]; };
function period(type, anchor) {
  const d = D(anchor), y = d.getUTCFullYear(), m = d.getUTCMonth(), day = d.getUTCDate();
  const pad = (n) => String(n).padStart(2, '0'), ym = `${y}-${pad(m + 1)}`;
  if (type === 'semana') { const dow = (d.getUTCDay() + 6) % 7; const start = add(anchor, -dow); return { start, end: add(start, 6) }; }
  if (type === 'mes') return { start: `${ym}-01`, end: `${ym}-${pad(lastDay(anchor))}` };
  return day <= 15 ? { start: `${ym}-01`, end: `${ym}-15` } : { start: `${ym}-16`, end: `${ym}-${pad(lastDay(anchor))}` };
}
const periodLabel = (type, p) => type === 'mes' ? MESL[D(p.start).getUTCMonth()] + ' ' + D(p.start).getUTCFullYear() : `${label(p.start)} – ${label(p.end)}`;

// ---------- api ----------
async function api(path, opts = {}) {
  const o = { ...opts, headers: { ...(opts.headers || {}) } };
  if (o.body && !(o.body instanceof FormData)) { o.headers['content-type'] = 'application/json'; o.body = JSON.stringify(o.body); }
  const r = await fetch('/api/team' + path, o);
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data.error || 'Error ' + r.status);
  return data;
}
function askConfirm({ title, text, ok = 'Sí, borrar' }) {
  return new Promise((res) => {
    const el = document.createElement('div'); el.className = 'cscrim';
    el.innerHTML = `<div class="confirm" role="alertdialog" aria-modal="true" aria-labelledby="cft"><span class="ci" style="background:color-mix(in srgb,var(--cambio) 14%,transparent);color:var(--cambio)">${ic('trash')}</span><h3 id="cft">${esc(title)}</h3><p>${esc(text)}</p><div class="row"><button class="btn" data-c="0">Cancelar</button><button class="btn red" data-c="1">${esc(ok)}</button></div></div>`;
    const done = (v) => { el.remove(); document.removeEventListener('keydown', key, true); res(v); };
    const key = (e) => { if (e.key === 'Escape') { e.stopPropagation(); done(false); } };
    el.addEventListener('click', (e) => { const b = e.target.closest('[data-c]'); if (b) done(b.dataset.c === '1'); else if (e.target === el) done(false); });
    document.addEventListener('keydown', key, true);
    document.body.appendChild(el); el.querySelector('[data-c="0"]').focus();
  });
}
const toast = (m) => { const t = $('#toast'); t.textContent = m; t.classList.add('on'); clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove('on'), 2200); };
const avatar = (m, size = 28) => m ? `<span class="avs" title="${esc(m.name)}" style="width:${size}px;height:${size}px;background:color-mix(in srgb, ${m.color} 28%, var(--panel));color:color-mix(in srgb, ${m.color} 45%, var(--ink))">${esc(m.initials)}</span>` : '';

// ---------- estado ----------
const app = { me: null, view: null, client: null, posts: [], sel: null, detail: null, per: { type: 'quincena', anchor: null }, clean: false, ptab: 'contenido', ctab: 'parrilla', tasks: [], requests: [], ai: null, reply: null, nudge: null, agents: [], agentsOn: {} };
const setTheme = (t) => { document.documentElement.dataset.theme = t; try { localStorage.setItem('nojos_theme', t); } catch {} };
const member = (id) => app.me.members.find((m) => m.id === id);
const agentOn = (id) => !!app.agentsOn[id];
async function loadAgents() { try { const r = await api('/agents'); app.agents = r.agents; app.agentsConfigured = r.configured; app.agentsOn = Object.fromEntries(r.agents.map((a) => [a.id, a.enabled])); } catch { app.agents = []; } }

async function boot() {
  try { app.me = await api('/me'); await loadAgents(); }
  catch (e) { $('#root').innerHTML = `<div class="loading">${esc(e.message)}</div>`; return; }
  try { app.clean = localStorage.getItem('nojos_clean') === '1'; const p = localStorage.getItem('nojos_per'); if (p) app.per.type = p; } catch {}
  window.addEventListener('hashchange', route);
  route();
}

function shell(inner, crumbs) {
  const ws = app.me.workspace;
  return `<div class="shell">
  <aside class="side">
    <a class="ws" href="#/hoy"><span class="lg"><img src="/logo-mark.svg" alt=""></span><span style="flex:1;min-width:0"><span class="wm">No'j <em>OS</em></span><small>${esc(ws.name)} · ${app.me.members.length} personas</small></span></a>
    <nav class="navg" aria-label="Secciones">
      <h6>Estudio</h6>
      <a class="nv ${app.view === 'hoy' ? 'on' : ''}" href="#/hoy">${ic('home')}Hoy</a>
      <a class="nv ${app.view === 'tareas' ? 'on' : ''}" href="#/pendientes">${ic('check')}Pendientes</a>
      <a class="nv ${app.view === 'agentes' ? 'on' : ''}" href="#/agentes">${ic('bot')}Agentes<span class="ct">${app.agents.filter((a) => a.enabled).length}</span></a>
      <h6>Clientes</h6>
      ${app.me.clients.map((c) => `<a class="nv ${app.client && app.client.id === c.id ? 'on' : ''}" href="#/c/${c.id}">${c.avatar ? `<img class="av" src="${esc(c.avatar)}" alt="">` : `<span class="avs" style="width:18px;height:18px;font-size:9px;background:var(--sunk)">${esc(c.name[0])}</span>`}<span>${esc(c.name)}</span>${c.last_request === 'abierta' ? '<span class="dot" style="background:var(--aprob)"></span>' : ''}</a>`).join('')}
    </nav>
    <div class="me">${avatar(app.me.member, 30)}<span class="nm"><span>${esc(app.me.member.name)}</span><small>${app.me.member.role === 'admin' ? 'Admin' : 'Editor'}</small></span><button class="theme" data-act="theme" aria-label="Cambiar a modo ${document.documentElement.dataset.theme === 'dark' ? 'claro' : 'oscuro'}">${ic(document.documentElement.dataset.theme === 'dark' ? 'sun' : 'moon')}</button></div>
  </aside>
  <div class="main">
    <header class="top">
      <button class="iconbtn menubtn" data-act="menu" aria-label="Abrir menú">${ic('menu')}</button>
      <nav class="crumbs" aria-label="Ruta">${crumbs}</nav>
      <div class="row" style="gap:12px">
        <div class="team">${app.me.members.map((m) => avatar(m, 24)).join('')}</div>
        <button class="iconbtn" data-act="bell" aria-label="Notificaciones">${ic('bell')}${app.me.unread ? `<span class="badge">${app.me.unread}</span>` : ''}</button>
      </div>
    </header>
    ${inner}
  </div>
  <div class="navscrim" data-act="menu"></div>
  <nav class="tabbar" aria-label="Navegación">
    <a href="#/hoy" class="${app.view === 'hoy' ? 'on' : ''}">${ic('home')}<span>Hoy</span></a>
    <a href="#/pendientes" class="${app.view === 'tareas' ? 'on' : ''}">${ic('check')}<span>Pendientes</span></a>
    ${app.me.clients[0] ? `<a href="#/c/${(app.client || app.me.clients[0]).id}" class="${app.view === 'cliente' ? 'on' : ''}">${ic('grid')}<span>Parrilla</span></a>` : ''}
    <a href="#/agentes" class="${app.view === 'agentes' ? 'on' : ''}">${ic('bot')}<span>Agentes</span></a>
  </nav></div>
  <aside class="drawer" id="drawer" aria-label="Notificaciones"></aside>`;
}

async function route() {
  const h = location.hash.replace(/^#/, '') || '/hoy';
  const m = h.match(/^\/c\/([^/]+)(?:\/(\w+))?/);
  if (m) {
    app.view = 'cliente';
    if (!app.client || app.client.id !== m[1]) { app.client = null; app.sel = null; app.detail = null; app.per.anchor = null; app.nudge = null; }
    app.ctab = m[2] || 'parrilla';
    return loadClient(m[1]);
  }
  app.client = null;
  if (h.startsWith('/pendientes')) { app.view = 'tareas'; return loadTasks(); }
  if (h.startsWith('/agentes')) { app.view = 'agentes'; return loadAgentsPage(); }
  app.view = 'hoy'; return loadHoy();
}

// ================= HOY =================
async function loadHoy() {
  $('#root').innerHTML = shell('<div class="loading">Cargando…</div>', '<b>Hoy</b>');
  const [tasks, act] = await Promise.all([api('/tasks'), api('/activity')]);
  app.tasks = tasks;
  const open = tasks.filter((t) => !['cerrado', 'terminado'].includes(t.status));
  const mine = open.filter((t) => t.assignee === app.me.member.id);
  const waiting = open.filter((t) => t.bucket === 'cliente');
  const late = open.filter((t) => t.due_on && t.due_on < today());
  const d = D(today());
  const hello = new Date().getHours() < 12 ? 'Buenos días' : new Date().getHours() < 19 ? 'Buenas tardes' : 'Buenas noches';
  const hoyT = open.filter((t) => t.bucket === 'hoy'), rest = open.filter((t) => t.bucket !== 'hoy');
  const inner = `<div class="page">
    <div class="hello"><h1 class="h1">${hello}, ${esc(app.me.member.name.split(' ')[0])} <span aria-hidden="true">👋</span></h1><p class="lede">${WD[d.getUTCDay()]} ${d.getUTCDate()} de ${MESL[d.getUTCMonth()].toLowerCase()} · ${mine.length ? `tienes ${mine.length} pendiente${mine.length === 1 ? '' : 's'} a tu nombre` : 'no tienes pendientes a tu nombre'}${waiting.length ? ` y ${waiting.length} esperando a clientes` : ''}.</p></div>
    <div class="dash"><div>
      <section class="card">${cardH('bolt', 'Acciones rápidas')}
        <div class="qa">
          <button data-act="qa" data-go="post"><span class="ci" style="background:var(--i1)">${ic('plus')}</span>Nueva publicación</button>
          <button data-act="qa" data-go="send"><span class="ci" style="background:var(--i2)">${ic('send')}</span>Enviar a aprobación</button>
          <button data-act="qa" data-go="task"><span class="ci" style="background:var(--i3)">${ic('check')}</span>Nuevo pendiente</button>
          <button data-act="qa" data-go="agents"><span class="ci" style="background:var(--i4)">${ic('pen')}</span>Pedir a un agente</button>
        </div></section>
      <section class="card">${cardH('grid', 'Resumen', '<a class="vbtn" href="#/pendientes">Ver todo</a>')}
        <div class="stats">
          ${stat(mine.length, 'Tus pendientes abiertos', 'check')}
          ${stat(waiting.length, 'Esperando al cliente', 'clock')}
          ${stat(late.length, 'Atrasados', 'bell')}
          ${stat(app.me.clients.length, app.me.clients.length === 1 ? 'Cliente activo' : 'Clientes activos', 'users')}
        </div></section>
      <section class="card">${cardH('list', 'Pendientes del estudio', `<span class="count">${rest.length}</span>`)}${taskGroups(rest, true)}</section>
    </div><div>
      <section class="card">${cardH('check', 'Para hoy', hoyT.length ? `<span class="count">${hoyT.length}</span>` : '')}${hoyT.length ? `<div class="list">${hoyT.map((x) => taskRow(x, true)).join('')}</div>` : calm()}</section>
      <section class="card">${cardH('inbox', 'Actividad', '<button class="vbtn" data-act="bell">Ver todo</button>')}<div class="list feed" style="padding-bottom:10px">${act.items.slice(0, 8).map(feedItem).join('') || '<div class="empty">Sin actividad todavía</div>'}</div></section>
    </div></div></div>`;
  $('#root').innerHTML = shell(inner, '<b>Hoy</b>');
}
const cardH = (icon, title, right = '') => `<div class="card-h"><span class="t"><span class="hbox">${ic(icon)}</span>${title}</span>${right}</div>`;
const stat = (v, l, icon) => `<div class="stat"><div><b>${v}</b><span>${esc(l)}</span></div><span class="ci">${ic(icon)}</span></div>`;
const calm = () => `<div class="calm"><svg viewBox="0 0 200 120" aria-hidden="true"><ellipse cx="100" cy="108" rx="80" ry="6" fill="var(--sunk)"/><path d="M40 30h86a6 6 0 0 1 6 6v52H34V36a6 6 0 0 1 6-6z" fill="var(--card-2)" stroke="var(--ink)" stroke-width="2"/><path d="M24 88h120l-8 12H32z" fill="var(--brand)" stroke="var(--ink)" stroke-width="2"/><path d="M68 58l10 10 20-22" fill="none" stroke="var(--accent)" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/><path d="M152 66h22v24a8 8 0 0 1-8 8h-6a8 8 0 0 1-8-8z" fill="var(--card)" stroke="var(--ink)" stroke-width="2"/><path d="M174 72h4a6 6 0 0 1 0 12h-4" fill="none" stroke="var(--ink)" stroke-width="2"/><path d="M158 56c0-4 4-4 4-8M166 56c0-4 4-4 4-8" stroke="var(--dim)" stroke-width="2" fill="none" stroke-linecap="round"/></svg><b>¡Eso es todo por hoy!</b><span>Te ganaste un café.</span></div>`;
const kpi = (l, v, sub, c) => `<div class="kpi"><span class="k"><span class="dot" style="background:${c}"></span>${l}</span><b>${v}</b><span class="s">${esc(sub)}</span></div>`;
const feedItem = (a) => `<div class="it"><span class="dot" style="background:${a.kind.startsWith('request') ? 'var(--aprob)' : a.kind === 'post.status' ? 'var(--lista)' : a.kind === 'request.answered' ? 'var(--cambio)' : 'var(--dim)'}"></span><div class="grow"><span>${esc(a.text)}</span><span class="dim">${esc(ago(a.created_at))}</span></div></div>`;
function ago(s) { const t = new Date(s.replace(' ', 'T') + 'Z').getTime(), m = Math.round((Date.now() - t) / 60000); if (m < 1) return 'ahora'; if (m < 60) return `hace ${m} min`; const h = Math.round(m / 60); if (h < 24) return `hace ${h} h`; const d = Math.round(h / 24); return d === 1 ? 'ayer' : `hace ${d} días`; }

function taskGroups(list, withClient) {
  const G = [['hoy', 'Para hoy', 'var(--lista)'], ['equipo', "Por hacer · No'j", 'var(--prod)'], ['cliente', 'Esperando al cliente', 'var(--aprob)']];
  return G.map(([k, t, c]) => { const items = list.filter((x) => x.bucket === k); if (!items.length) return '';
    return `<div class="group-h"><span class="t"><span class="dot" style="background:${c}"></span>${t}</span><span class="ct">${items.length}</span></div><div class="list">${items.map((x) => taskRow(x, withClient)).join('')}</div>`; }).join('') || '<div class="empty">Nada pendiente. Buen trabajo.</div>';
}
function taskRow(t, withClient) {
  const done = ['cerrado', 'terminado'].includes(t.status), m = member(t.assignee), late = t.due_on && t.due_on < today() && !done;
  return `<div class="it ${done ? 'done' : ''}">
    <button class="chk ${done ? 'on' : ''}" data-act="task-toggle" data-id="${t.id}" aria-label="${done ? 'Reabrir' : 'Cerrar'}: ${esc(t.title)}">${done ? '✓' : ''}</button>
    <div class="grow"><b>${esc(t.title)}</b><span class="dim">${esc([withClient && t.client_name, t.waiting_on && 'Espera a ' + t.waiting_on, t.detail].filter(Boolean).join(' · '))}</span></div>
    <select class="st" data-act="task-status" data-id="${t.id}" aria-label="Estatus">${Object.entries(TASK_ST).map(([k, v]) => `<option value="${k}" ${k === t.status ? 'selected' : ''}>${v}</option>`).join('')}</select>
    <span class="due ${late ? 'late' : ''}">${t.due_on ? label(t.due_on) : ''}</span>
    ${m ? avatar(m, 24) : `<span class="avs" style="width:24px;height:24px;font-size:9px;background:color-mix(in srgb,var(--aprob) 16%,var(--panel));color:var(--aprob)" title="${esc(t.waiting_on)}">${esc((t.waiting_on || 'C')[0])}</span>`}
  </div>`;
}

// ================= PENDIENTES (todos) =================
async function loadTasks() {
  $('#root').innerHTML = shell('<div class="loading">Cargando…</div>', '<b>Pendientes</b>');
  app.tasks = await api('/tasks');
  $('#root').innerHTML = shell(`<div class="page"><div class="hello"><span class="eyebrow">Todo el estudio</span><h1 class="h1">Pendientes</h1></div>${taskForm(null)}<section class="card">${taskGroups(app.tasks.filter((t) => t.status !== 'cerrado'), true)}</section></div>`, '<b>Pendientes</b>');
}
const taskForm = (cid) => `<form class="newtask" data-form="task" data-client="${cid || ''}">
  <input name="title" placeholder="Escribe un pendiente nuevo…" required>
  <select name="bucket"><option value="equipo">Por hacer · No'j</option><option value="hoy">Para hoy</option><option value="cliente">Espera al cliente</option></select>
  <select name="assignee"><option value="">Sin asignar</option>${app.me.members.map((m) => `<option value="${m.id}">${esc(m.name)}</option>`).join('')}</select>
  ${cid ? '' : `<select name="client_id"><option value="">Sin cliente</option>${app.me.clients.map((c) => `<option value="${c.id}">${esc(c.name)}</option>`).join('')}</select>`}
  <input name="due_on" type="date" aria-label="Fecha">
  <button class="btn pri" type="submit">${ic('plus')}Agregar</button></form>`;

// ================= AGENTES =================
async function loadAgentsPage(cached) {
  if (!cached) { $('#root').innerHTML = shell('<div class="loading">Cargando…</div>', '<b>Agentes</b>'); await loadAgents(); }
  const admin = app.me.member.role === 'admin';
  const on = app.agents.filter((a) => a.status === 'disponible'), soon = app.agents.filter((a) => a.status !== 'disponible');
  const card = (a) => `<article class="card agent ${a.enabled ? 'on' : ''} ${a.status !== 'disponible' ? 'soon' : ''}">
    <div class="between"><span class="mono-mark">${mark(a)}</span>${a.status === 'disponible'
      ? `<button class="switch ${a.enabled ? 'on' : ''}" data-act="agent-toggle" data-id="${a.id}" data-on="${a.enabled ? 1 : 0}" ${admin ? '' : 'disabled title="Solo un admin puede cambiarlo"'} aria-label="${a.enabled ? 'Apagar' : 'Prender'} ${esc(a.name)}">${a.enabled ? 'Prendido' : 'Apagado'}<i></i></button>`
      : '<span class="tag">Pronto</span>'}</div>
    <div style="display:flex;flex-direction:column;gap:6px"><span class="eyebrow">${esc(a.category)}</span><h3>${esc(a.name)}</h3></div>
    <p class="mu" style="font-size:13.5px;flex:1">${esc(a.tagline)}</p>
    <div class="agmeta"><span>${esc(a.surface)}</span><span>${esc(a.price)}</span>${a.requires ? `<span>Requiere ${esc(a.requires)}</span>` : ''}${a.status === 'disponible' ? `<span>${a.runs_month} ${a.runs_month === 1 ? "uso" : "usos"} este mes</span>` : ''}</div></article>`;
  const inner = `<div class="page">
    <div class="hello"><span class="eyebrow">Plataforma</span><h1 class="h1">Agentes</h1><p class="lede">Especialistas que se prenden por espacio y trabajan dentro de la parrilla, los comentarios y los pendientes.${app.agentsConfigured ? '' : ' <span style="color:var(--prod)">Falta conectar la llave de IA para que respondan.</span>'}</p></div>
    <span class="lbl">Disponibles</span><div class="agrid">${on.map(card).join('')}</div>
    <span class="lbl">En camino</span><div class="agrid">${soon.map(card).join('')}</div></div>`;
  $('#root').innerHTML = shell(inner, '<b>Agentes</b>');
}

const MARKS = { campana: 'Ca', copy: 'Co', respuestas: 'Re', seguimiento: 'Se', fechas: 'Fe', reporte: 'Rm', whatsapp: 'Wa', publicador: 'Pu', propuestas: 'Pr', stock: 'St' };
const mark = (a) => esc(MARKS[a.id] || a.name.slice(0, 2));

// ================= CLIENTE =================
async function loadClient(cid) {
  if (!app.client) $('#root').innerHTML = shell('<div class="loading">Cargando…</div>', '<a href="#/hoy">Clientes</a>');
  const [client, posts] = await Promise.all([api('/clients/' + cid), api('/clients/' + cid + '/posts')]);
  app.client = client; app.posts = posts;
  if (!app.per.anchor) {
    const next = posts.filter((p) => p.status !== 'pub' && p.publish_on).map((p) => p.publish_on).sort()[0];
    app.per.anchor = next || today();
  }
  if (app.ctab === 'pendientes') app.tasks = await api('/tasks');
  if (app.ctab === 'envios') app.requests = await api('/clients/' + cid + '/requests');
  if (!app.sel) { const p = period(app.per.type, app.per.anchor); const first = posts.filter((x) => x.publish_on >= p.start && x.publish_on <= p.end).sort((a, b) => a.number - b.number)[0]; app.sel = first ? first.id : posts[0] && posts[0].id; }
  if (app.sel && app.ctab === 'parrilla') app.detail = await api('/posts/' + app.sel);
  renderClient();
  if (app.pending && app.ctab === 'parrilla') { const act = app.pending; app.pending = null; const b = document.querySelector(`[data-act="${act}"]`); b && b.click(); }
}

function renderClient() {
  const c = app.client, owner = member(c.owner_member);
  const tabs = [['parrilla', 'Parrilla'], ['pendientes', 'Pendientes'], ['envios', 'Envíos'], ['ficha', 'Ficha de marca']];
  const head = `<div class="chead">
    <div class="between"><div class="who">${c.avatar ? `<img src="${esc(c.avatar)}" alt="">` : '<span class="ph"></span>'}<div><h1 class="h1">${esc(c.name)}</h1><div class="meta">${esc([c.handle && '@' + c.handle, c.services, owner && 'Responsable: ' + owner.name].filter(Boolean).join('  ·  '))}</div></div></div>
    ${app.ctab === 'parrilla' ? `<div class="row">${agentOn('campana') ? `<button class="btn" data-act="campaign">${ic('grid')}Planear campaña</button>` : ''}<button class="btn" data-act="new-post">${ic('plus')}Publicación</button><button class="btn pri" data-act="open-send">${ic('send')}Enviar a aprobación</button></div>` : ''}</div>
    <nav class="tabs">${tabs.map(([k, l]) => `<a href="#/c/${c.id}/${k}" class="${app.ctab === k ? 'on' : ''}">${l}</a>`).join('')}</nav></div>`;
  let body = '';
  if (app.ctab === 'parrilla') body = parrilla();
  if (app.ctab === 'pendientes') body = `<div class="page">${agentOn('seguimiento') ? `<section class="card"><div class="agent-inline between"><span class="row" style="gap:14px;flex-wrap:nowrap"><span class="mono-mark">Se</span><span><b style="font-weight:500">Seguimiento de pendientes</b><br><span class="mu" style="font-size:13px">Redacta el recordatorio para ${esc(c.approver_name || 'el cliente')} con todo lo que espera su respuesta.</span></span></span><button class="btn sm agentb" data-act="nudge">${ic('pen')}Redactar recordatorio</button></div>${app.nudge ? `<div style="padding:0 18px 18px;display:flex;flex-direction:column;gap:10px"><textarea id="nudge" rows="6" class="copy">${esc(app.nudge)}</textarea><div class="row"><button class="btn sm pri" data-act="copy-nudge">${ic('link')}Copiar mensaje</button><span class="dim">Pégalo en WhatsApp o correo</span></div></div>` : ''}</section>` : ''}${taskForm(c.id)}<section class="card">${taskGroups(app.tasks.filter((t) => t.client_id === c.id && t.status !== 'cerrado'), false)}</section></div>`;
  if (app.ctab === 'envios') body = envios();
  if (app.ctab === 'ficha') body = ficha();
  $('#root').innerHTML = shell(head + body, `<a href="#/hoy">Clientes</a><span class="sep">/</span><b>${esc(c.name)}</b>`);
  wireUpload();
  const cal = $('.cal'), on = $('.day.on');
  if (cal && on) cal.scrollLeft = on.offsetLeft - cal.clientWidth / 2 + on.clientWidth / 2;
}

function parrilla() {
  const p = period(app.per.type, app.per.anchor);
  const inP = app.posts.filter((x) => x.publish_on && x.publish_on >= p.start && x.publish_on <= p.end);
  const cnt = (s) => inP.filter((x) => x.status === s).length;
  const order = ['ok', 'aprob', 'lista', 'cambio', 'prod', 'borrador'];
  const bar = order.map((s) => cnt(s) ? `<span style="flex:${cnt(s)};background:${stc(s)}"></span>` : '').join('');
  const ready = cnt('lista') + cnt('cambio');
  // calendario
  const days = []; for (let d = p.start; d <= p.end; d = add(d, 1)) days.push(d);
  const cls = app.per.type === 'semana' ? 'wk' : app.per.type === 'mes' ? 'mo' : '';
  const cal = days.map((d) => { const post = app.posts.find((x) => x.publish_on === d); const dd = D(d);
    return `<button class="day ${cls} ${post ? 'has' : ''} ${post && post.id === app.sel ? 'on' : ''}" data-act="${post ? 'pick' : 'new-post'}" data-id="${post ? post.id : ''}" data-date="${d}" aria-label="${label(d)}${post ? ' · P' + post.number + ' ' + esc(post.title) : ' · agregar publicación'}">
      <span class="hd"><span class="wd">${WD[dd.getUTCDay()]}</span><span class="n">${dd.getUTCDate()}</span></span>
      ${post ? `<span class="chip">${post.media[0] && !post.media[0].video ? `<img src="${esc(post.media[0].url)}" alt="" loading="lazy">` : `<span class="noimg">${esc(post.title)}</span>`}<span class="lb"><i style="background:${stc(post.status)}"></i>P${post.number}<span class="k"> · ${KIND[post.kind]}</span></span></span>` : '<span class="add">+</span>'}</button>`; }).join('');
  // grid del perfil: lo publicado + lo programado hasta el fin del periodo
  const fd = feed(p), grid = fd.list;
  const c = app.client;
  const phone = `<div class="phone ${app.clean ? 'clean' : ''}"><div class="notch"><i></i></div><div class="scroll">
    <div class="igbar">${esc(c.handle || c.name)}<svg class="i" viewBox="0 0 24 24" style="width:20px;height:20px">${ICON.bell}</svg></div>
    <div class="igprof">${c.avatar ? `<img class="av" src="${esc(c.avatar)}" alt="">` : '<span class="av" style="display:block"></span>'}<div class="igstats"><span><b>${grid.filter((x) => !x._next).length}</b>publicaciones</span><span><b>—</b>seguidores</span><span><b>—</b>seguidos</span></div></div>
    <div class="igbio"><b>${esc(c.name)}</b>${c.bio ? '<br>' + esc(c.bio) : ''}</div>
    ${c.highlights.length ? `<div class="ighl">${c.highlights.map((h) => `<span>${h.image ? `<img src="${esc(h.image)}" alt="">` : '<i></i>'}${esc(h.label)}</span>`).join('')}</div>` : ''}
    <div class="iggrid">${phTiles(fd.ph)}${grid.map(tile).join('')}</div></div></div>`;
  return `<div class="page">
    <div class="toolbar">
      <div class="row">
        <div class="seg" role="group" aria-label="Periodo">${['semana', 'quincena', 'mes'].map((t) => `<button class="${app.per.type === t ? 'on' : ''}" data-act="per-type" data-v="${t}">${t[0].toUpperCase() + t.slice(1)}</button>`).join('')}</div>
        <div class="range"><button data-act="per-shift" data-v="-1" aria-label="Periodo anterior">‹</button><span>${periodLabel(app.per.type, p)}</span><button data-act="per-shift" data-v="1" aria-label="Periodo siguiente">›</button></div>
      </div>
      <div class="row" style="gap:16px"><button class="btn sm" data-act="present">${ic('play')}Presentar</button><div class="progress"><span><b>${ready}</b> de ${inP.length} listas para enviar</span><span class="bar" title="${order.filter(cnt).map((s) => cnt(s) + ' ' + ST[s].toLowerCase()).join(' · ')}">${bar}</span></div></div>
    </div>
    <section class="cal" aria-label="Calendario del periodo">${cal}</section>
    <div class="mswitch seg" role="group" aria-label="Vista"><button class="${app.mview !== 'prev' ? 'on' : ''}" data-act="mview" data-v="edit">Publicación</button><button class="${app.mview === 'prev' ? 'on' : ''}" data-act="mview" data-v="prev">Vista previa</button></div>
    <div class="work ${app.mview === 'prev' ? 'mprev' : 'medit'}">
      <section class="prev" aria-label="Vista previa en Instagram"><div class="between"><span class="eyebrow">Así se verá en Instagram</span><button class="switch ${app.clean ? 'on' : ''}" data-act="clean">Vista limpia<i></i></button></div>${phone}</section>
      <section class="insp card" aria-label="Publicación seleccionada">${inspector()}</section>
    </div></div>`;
}

// Feed con filas completas: si faltan, se completan con las siguientes publicaciones.
function feed(p) {
  const base = app.posts.filter((x) => x.status === 'pub' || (x.publish_on && x.publish_on <= p.end));
  const need = (3 - (base.length % 3)) % 3;
  const next = app.posts.filter((x) => x.status !== 'pub' && x.publish_on && x.publish_on > p.end).sort((a, b) => a.publish_on.localeCompare(b.publish_on)).slice(0, need).reverse().map((x) => ({ ...x, _next: true }));
  return { list: [...next, ...base], ph: need - next.length };
}
const phTiles = (n) => '<span class="tile ph"><span class="noimg">Próxima</span></span>'.repeat(Math.max(0, n));

function tile(x) {
  const m = x.media[0];
  return `<button class="tile ${x.status === 'pub' ? 'pub' : ''} ${x._next ? 'next' : ''} ${x.id === app.sel ? 'sel' : ''}" data-act="pick" data-id="${x.id}" aria-label="P${x.number} · ${esc(x.title)} · ${ST[x.status]}">
    ${m ? (m.video ? `<video src="${esc(m.url)}#t=0.5" muted playsinline preload="metadata"></video>` : `<img src="${esc(m.url)}" alt="" loading="lazy">`) : `<span class="noimg">P${x.number}<br>${esc(x.title)}</span>`}
    ${x.kind === 'reel' ? REEL : x.kind === 'carr' ? CARR : ''}
    <span class="pn">P${x.number}</span><span class="st" style="color:${stc(x.status)}"><i></i>${ST[x.status]}</span></button>`;
}

function inspector() {
  const d = app.detail;
  if (!d) return '<div class="empty">Elige una publicación del calendario o del perfil.</div>';
  const flow = ['borrador', 'prod', 'lista', 'aprob', 'ok', 'pub'];
  const ci = d.status === 'cambio' ? flow.indexOf('aprob') : flow.indexOf(d.status);
  const tabs = [['contenido', 'Contenido'], ['comentarios', 'Comentarios' + (d.comments.length ? `<span class="ct">${d.comments.length}</span>` : '')], ['historial', 'Historial']];
  let body = '';
  if (app.ptab === 'contenido') body = `<div class="ibody">
    <div class="between mtools"><span class="lbl">Material${d.media.length ? `<span class="dim" style="font-weight:500;margin-left:8px">${d.media.length} archivo${d.media.length === 1 ? '' : 's'}</span>` : ''}</span><div class="row"><label class="btn sm" for="file">${ic('up')}Subir</label><button class="btn sm" data-act="pano">${ic('pano')}Panorámica a carrusel</button></div></div>
    <div class="media" id="drop">${d.media.map((m, i) => `<div class="m">${m.video ? `<video src="${esc(m.url)}" controls muted playsinline preload="metadata"></video>` : `<img src="${esc(m.url)}" alt="">`}<span class="pos">${i + 1}</span><button data-act="del-media" data-id="${m.id}" aria-label="Quitar archivo">${ic('x')}</button>${d.media.length > 1 ? `<span class="mv">${i ? `<button data-act="mv-media" data-id="${m.id}" data-dir="-1" aria-label="Mover a la izquierda">${ic('left')}</button>` : ''}${i < d.media.length - 1 ? `<button data-act="mv-media" data-id="${m.id}" data-dir="1" aria-label="Mover a la derecha">${ic('right')}</button>` : ''}</span>` : ''}</div>`).join('')}
      <label class="up" for="file">${ic('up')}<span>Subir material</span><span class="dim" style="font-size:11px">Foto o video · arrastra aquí</span></label><input id="file" type="file" accept="image/*,video/*" multiple class="sr"></div>
    <div class="fields">
      <label>Publica<input type="date" data-field="publish_on" value="${d.publish_on || ''}"></label>
      <label>Formato<select data-field="kind">${Object.entries(KIND).map(([k, v]) => `<option value="${k}" ${k === d.kind ? 'selected' : ''}>${v}</option>`).join('')}</select></label>
      <label>Responsable<select data-field="owner"><option value="">—</option>${app.me.members.map((m) => `<option value="${m.id}" ${m.id === d.owner ? 'selected' : ''}>${esc(m.name)}</option>`).join('')}</select></label>
      <label>Ubicación<input data-field="location" value="${esc(d.location)}"></label>
    </div>
    <div style="display:flex;flex-direction:column;gap:8px">
      <div class="lbl"><label for="copy">Copy</label><span class="dim"><span id="cl">${d.copy.length}</span> / 2,200</span></div>
      <textarea id="copy" class="copy" data-field="copy" rows="5" placeholder="Escribe el texto de la publicación…">${esc(d.copy)}</textarea>
      ${agentOn('copy') ? `<div class="row"><button class="btn sm agentb" data-act="ai">${ic('pen')}Proponer copys</button><span class="dim" style="font-size:12px">Redactor de copys · usa el tono de la ficha de marca</span></div>` : ''}
      ${app.ai ? `<div class="ai">${app.ai.map((o, i) => `<button data-act="ai-use" data-i="${i}">${esc(o)}</button>`).join('')}</div>` : ''}
    </div>
    <label style="display:flex;flex-direction:column;gap:8px"><span class="lbl">Notas internas</span><textarea data-field="notes" rows="2" placeholder="Solo las ve el equipo">${esc(d.notes)}</textarea></label>
  </div>`;
  if (app.ptab === 'comentarios') body = `<div class="ibody"><div class="thread">${d.comments.map((k) => { const m = member(k.author_id); return `<div class="cmt ${k.author_type === 'client' ? 'client' : ''}">${m ? avatar(m) : `<span class="avs" style="background:color-mix(in srgb,var(--aprob) 16%,var(--panel));color:var(--aprob)">${esc(k.author_name.slice(0, 2).toUpperCase())}</span>`}<div class="b"><span class="who"><b>${esc(k.author_name)}</b>${k.author_type === 'client' ? ' · cliente' : k.to_client ? ' · <span style="color:var(--aprob)">visible al cliente</span>' : ''} · ${esc(ago(k.created_at))}</span><span class="tx">${esc(k.body)}</span></div></div>`; }).join('') || '<div class="empty" style="padding:20px 0">Sin comentarios todavía.</div>'}</div>
    ${app.reply ? `<div class="ai">${app.reply.options.map((o, i) => `<button data-act="reply-use" data-i="${i}">${esc(o)}</button>`).join('')}${app.reply.fix ? `<div class="note"><b style="font-weight:500">Sugerencia para el equipo:</b> ${esc(app.reply.fix)}</div>` : ''}</div>` : ''}
    <form data-form="comment" style="display:flex;flex-direction:column;gap:8px"><textarea name="body" id="cbody" rows="2" placeholder="Comenta para el equipo…" required></textarea>
      <div class="between"><label class="row mu" style="font-size:12px;gap:6px;cursor:pointer"><input type="checkbox" name="to_client" id="tocl" style="width:auto"> Visible para el cliente en su link</label>
      <div class="row">${agentOn('respuestas') && d.comments.some((k) => k.author_type === 'client') ? `<button type="button" class="btn sm agentb" data-act="reply-ai">${ic('pen')}Proponer respuesta</button>` : ''}<button class="btn sm" type="submit">Comentar</button></div></div></form></div>`;
  if (app.ptab === 'historial') body = `<div class="ibody hist">${d.history.map((h) => `<div><span>${esc(ago(h.created_at))}</span><span style="color:var(--ink-2)">${esc(h.text)}</span></div>`).join('') || '<span class="mu">Sin movimientos.</span>'}</div>`;
  const fl = flow.map((s, i) => `<button class="${i < ci ? 'done' : ''} ${i === ci ? 'cur' : ''}" style="--c:${stc(d.status === 'cambio' && i === ci ? 'cambio' : s)}" data-act="status" data-v="${s}" aria-pressed="${i === ci}"><span class="o"></span>${d.status === 'cambio' && i === ci ? 'Cambio pedido' : ST[s]}</button>`).join('');
  return `<div class="ihead">
      <div class="meta"><span class="l"><span class="tag">P${String(d.number).padStart(2, '0')}</span>${KIND[d.kind]}${d.date ? ' · ' + d.date : ''}</span><span class="pill" style="color:${stc(d.status)}"><span class="dot"></span>${ST[d.status]}</span></div>
      <input class="title" data-field="title" value="${esc(d.title)}" aria-label="Título">
      <div class="flow" role="group" aria-label="Estatus">${fl}</div>
      ${d.status === 'cambio' ? `<div class="alert">El cliente pidió un cambio. Revisa los comentarios y, cuando quede, márcala como lista para reenviarla.</div>` : ''}
    </div>
    <div class="tabs" style="margin:18px 26px 0">${tabs.map(([k, l]) => `<button class="${app.ptab === k ? 'on' : ''}" data-act="ptab" data-v="${k}">${l}</button>`).join('')}</div>
    ${body}
    <div class="ifoot"><span class="row" style="gap:12px">${d.status !== 'pub' ? `<button class="btn sm ghost danger" data-act="del-post">${ic('trash')}Borrar</button>` : ''}<span id="saved">${d.updated_at ? 'Guardado · ' + ago(d.updated_at) : ''}</span></span><div class="row">${d.status !== 'cambio' && d.status !== 'pub' ? `<button class="btn sm ghost" data-act="status" data-v="cambio">Marcar cambio pedido</button>` : ''}${!['lista', 'aprob', 'ok', 'pub'].includes(d.status) ? `<button class="btn sm pri" data-act="status" data-v="lista">Marcar como lista</button>` : ''}</div></div>`;
}

function envios() {
  return `<div class="page"><section class="card">${cardH('send', 'Envíos a aprobación', `<span class="count">${app.requests.length}</span>`)}<div class="list">${app.requests.map((r) => `<div class="it">
    <span class="dot" style="background:${r.status === 'abierta' ? 'var(--aprob)' : 'var(--ok)'}"></span>
    <div class="grow"><b>${r.period_type[0].toUpperCase() + r.period_type.slice(1)} · ${label(r.period_start)} – ${label(r.period_end)}</b><span class="dim">${r.status === 'abierta' ? 'Esperando respuesta' : 'Respondida'} · ${r.ok}/${r.total} aprobadas${r.cambio ? ' · ' + r.cambio + ' con cambio' : ''} · enviada ${esc(ago(r.created_at))}${r.sent_to ? ' a ' + esc(r.sent_to) : ''}</span></div>
    <button class="btn sm" data-act="copy-link" data-link="${esc(r.link)}">${ic('link')}Copiar link</button><a class="btn sm" href="${esc(r.link)}" target="_blank" rel="noopener">${ic('eye')}Abrir</a></div>`).join('') || '<div class="empty">Todavía no se ha enviado ninguna parrilla.</div>'}</div></section></div>`;
}

function ficha() {
  const c = app.client;
  return `<div class="page"><form class="card form" data-form="client" style="padding:22px">
    <label>Nombre<input name="name" value="${esc(c.name)}"></label>
    <label>Usuario de Instagram<input name="handle" value="${esc(c.handle)}"></label>
    <label>Servicios<input name="services" value="${esc(c.services)}"></label>
    <label>Responsable en No'j<select name="owner_member"><option value="">—</option>${app.me.members.map((m) => `<option value="${m.id}" ${m.id === c.owner_member ? 'selected' : ''}>${esc(m.name)}</option>`).join('')}</select></label>
    <label>Quién aprueba<input name="approver_name" value="${esc(c.approver_name)}"></label>
    <label>Correo de quien aprueba<input name="approver_email" type="email" value="${esc(c.approver_email)}"></label>
    <label class="full">Bio del perfil<textarea name="bio" rows="4">${esc(c.bio)}</textarea></label>
    <label class="full">Tono de marca (guía para la IA)<textarea name="brand_tone" rows="4">${esc(c.brand_tone)}</textarea></label>
    <div class="full row"><button class="btn pri" type="submit">Guardar ficha</button></div></form>
    <section class="card" style="padding:20px;display:flex;flex-direction:column;gap:16px"><span class="lbl">Imágenes del perfil · para que la vista previa sea igual a Instagram</span>
      <div class="row" style="gap:18px;align-items:flex-start">
        <label class="up-img" style="display:flex;flex-direction:column;align-items:center;gap:6px;cursor:pointer">${c.avatar ? `<img src="${esc(c.avatar)}" alt="" style="width:72px;height:72px;border-radius:50%;object-fit:cover">` : '<span style="width:72px;height:72px;border-radius:50%;background:var(--sunk);display:block"></span>'}<span class="mu">Foto de perfil</span><input type="file" accept="image/*" class="sr" data-upload="avatar"></label>
        ${c.highlights.map((h) => `<label style="display:flex;flex-direction:column;align-items:center;gap:6px;cursor:pointer">${h.image ? `<img src="${esc(h.image)}" alt="" style="width:60px;height:60px;border-radius:50%;object-fit:cover">` : '<span style="width:60px;height:60px;border-radius:50%;background:var(--sunk);display:block"></span>'}<span class="mu">${esc(h.label)}</span><input type="file" accept="image/*" class="sr" data-upload="hl" data-id="${h.id}"></label>`).join('')}
      </div></section></div>`;
}

// ---------- envío ----------
function openSend() {
  const p = period(app.per.type, app.per.anchor), c = app.client;
  const inP = app.posts.filter((x) => x.publish_on && x.publish_on >= p.start && x.publish_on <= p.end).sort((a, b) => a.number - b.number);
  const due = add(p.start, -4);
  const el = document.createElement('div'); el.className = 'scrim'; el.id = 'modal';
  el.innerHTML = `<form class="modal" data-form="send" role="dialog" aria-label="Enviar a aprobación">
    <div class="mh"><div style="display:flex;flex-direction:column;gap:8px"><span class="eyebrow">Enviar a aprobación · ${app.per.type}</span><div class="h2">${esc(c.name)}<br><em style="font-style:italic">${periodLabel(app.per.type, p)}</em></div></div><button type="button" class="iconbtn" data-act="close-modal" aria-label="Cerrar">${ic('x')}</button></div>
    <div class="mb">
      <div class="sendlist">${inP.map((x) => { const ok = ['lista', 'cambio'].includes(x.status); return `<div class="r ${ok ? '' : 'off'}"><span class="chk ${ok ? 'on' : ''}">${ok ? '✓' : ''}</span>${x.media[0] && !x.media[0].video ? `<img src="${esc(x.media[0].url)}" alt="">` : '<span class="ph"></span>'}<span style="flex:1;min-width:0">P${x.number} · ${esc(x.title)}</span><span class="s" style="color:${ok ? 'var(--lista)' : stc(x.status)}">${ok ? 'Se envía' : ST[x.status]}</span></div>`; }).join('') || '<div class="empty">No hay publicaciones en este periodo.</div>'}</div>
      <span class="mu">Lo que no está listo le aparece al cliente como «En producción» y se envía después.</span>
      <div class="form"><label>Correo de quien aprueba<input name="sent_to" type="email" value="${esc(c.approver_email)}" placeholder="correo@cliente.com"></label><label>Responder antes de<input name="due_at" type="date" value="${due}"></label>
      <label class="full">Mensaje (opcional)<textarea name="message" rows="2" placeholder="Ej. Esta quincena incluye el reel de la barra."></textarea></label></div>
    </div>
    <div class="mf"><span class="dim">El link no requiere cuenta</span><div class="row"><button type="button" class="btn" data-act="close-modal">Cancelar</button><button class="btn pri" type="submit" ${inP.some((x) => ['lista', 'cambio'].includes(x.status)) ? '' : 'disabled'}>${ic('send')}Enviar link</button></div></div></form>`;
  document.body.appendChild(el);
}

// ---------- notificaciones ----------
async function openBell() {
  const dr = $('#drawer'); const act = await api('/activity');
  dr.innerHTML = `<div class="dh"><span class="h2" style="font-size:26px">Notificaciones</span><button class="iconbtn" data-act="close-drawer" aria-label="Cerrar">${ic('x')}</button></div>
    <div class="list feed" style="overflow-y:auto">${act.items.map((a) => feedItem(a).replace('class="it"', `class="it ${!act.last_seen || a.created_at > act.last_seen ? 'unread' : ''}"`)).join('') || '<div class="empty">Nada nuevo por aquí.</div>'}</div>`;
  dr.classList.add('open');
  await api('/activity/read', { method: 'POST' }); app.me.unread = 0;
  const b = document.querySelector('.iconbtn .badge'); if (b) b.remove();
}

// ---------- guardado ----------
let saveT = null;
function queueSave(field, value) {
  clearTimeout(saveT); $('#saved') && ($('#saved').textContent = 'Guardando…');
  saveT = setTimeout(() => savePost({ [field]: value }), 600);
}
async function savePost(patch, rerender = false) {
  try {
    const d = await api('/posts/' + app.sel, { method: 'PATCH', body: patch });
    app.detail = d;
    const i = app.posts.findIndex((x) => x.id === d.id); if (i >= 0) app.posts[i] = { ...app.posts[i], ...d };
    if (rerender) renderClient(); else $('#saved') && ($('#saved').textContent = 'Guardado · ahora');
  } catch (e) { toast(e.message); }
}

function wireUpload() {
  const f = $('#file'), drop = $('#drop');
  const send = async (files) => { if (!files.length) return; const fd = new FormData(); [...files].forEach((x) => fd.append('file', x)); toast('Subiendo ' + files.length + ' archivo(s)…');
    try { app.detail = await api('/posts/' + app.sel + '/media', { method: 'POST', body: fd }); app.posts = await api('/clients/' + app.client.id + '/posts'); renderClient(); toast('Material subido'); } catch (e) { toast(e.message); } };
  if (f) f.onchange = () => send(f.files);
  if (drop) { drop.ondragover = (e) => { e.preventDefault(); drop.querySelector('.up').classList.add('drag'); }; drop.ondragleave = () => drop.querySelector('.up').classList.remove('drag'); drop.ondrop = (e) => { e.preventDefault(); send(e.dataTransfer.files); }; }
  document.querySelectorAll('[data-upload]').forEach((inp) => inp.onchange = async () => {
    const fd = new FormData(); fd.append('file', inp.files[0]);
    try { await api(inp.dataset.upload === 'avatar' ? '/clients/' + app.client.id + '/avatar' : '/highlights/' + inp.dataset.id + '/image', { method: 'POST', body: fd }); app.client = await api('/clients/' + app.client.id); renderClient(); toast('Imagen actualizada'); } catch (e) { toast(e.message); }
  });
}

// ---------- eventos ----------
document.addEventListener('click', async (e) => {
  const t = e.target.closest('[data-act]'); if (!t) return;
  const a = t.dataset.act;
  try {
    if (a === 'pick') { if (t.classList.contains('tile') && matchMedia('(max-width:900px)').matches) app.mview = 'edit'; app.sel = t.dataset.id; app.ai = null; app.reply = null; app.detail = await api('/posts/' + app.sel); renderClient(); }
    else if (a === 'qa') { const go = t.dataset.go, c0 = app.me.clients[0];
      if (go === 'agents') location.hash = '#/agentes';
      else if (go === 'task') { location.hash = '#/pendientes'; setTimeout(() => $('.newtask input') && $('.newtask input').focus(), 600); }
      else if (c0) { app.pending = go === 'post' ? 'new-post' : 'open-send'; location.hash = '#/c/' + c0.id; } }
    else if (a === 'theme') { setTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'); route(); }
    else if (a === 'menu') { $('.shell').classList.toggle('navopen'); }
    else if (a === 'mview') { app.mview = t.dataset.v; renderClient(); }
    else if (a === 'per-type') { app.per.type = t.dataset.v; try { localStorage.setItem('nojos_per', app.per.type); } catch {} renderClient(); }
    else if (a === 'per-shift') { const p = period(app.per.type, app.per.anchor); app.per.anchor = +t.dataset.v > 0 ? add(p.end, 1) : add(p.start, -1); renderClient(); }
    else if (a === 'clean') { app.clean = !app.clean; try { localStorage.setItem('nojos_clean', app.clean ? '1' : '0'); } catch {} renderClient(); }
    else if (a === 'ptab') { app.ptab = t.dataset.v; renderClient(); }
    else if (a === 'status') { await savePost({ status: t.dataset.v }, true); }
    else if (a === 'new-post') { const date = t.dataset.date || null; const d = await api('/clients/' + app.client.id + '/posts', { method: 'POST', body: { title: 'Nueva publicación', publish_on: date } }); app.posts = await api('/clients/' + app.client.id + '/posts'); app.sel = d.id; app.detail = d; app.ptab = 'contenido'; renderClient(); $('.ihead input.title') && $('.ihead input.title').select(); }
    else if (a === 'present') openPresent();
    else if (a === 'pano') openPano();
    else if (a === 'campaign') openCampaign();
    else if (a === 'mv-media') { const ids = app.detail.media.map((m) => m.id), i = ids.indexOf(t.dataset.id), j = i + +t.dataset.dir; [ids[i], ids[j]] = [ids[j], ids[i]]; app.detail = await api('/posts/' + app.sel + '/order', { method: 'POST', body: { ids } }); app.posts = await api('/clients/' + app.client.id + '/posts'); renderClient(); }
    else if (a === 'del-post') { const d = app.detail; if (await askConfirm({ title: `¿Borrar P${d.number} · ${d.title}?`, text: 'Se borran también su material, comentarios y lo que el cliente haya respondido sobre ella. Esto no se puede deshacer.' })) { await api('/posts/' + d.id, { method: 'DELETE' }); app.posts = await api('/clients/' + app.client.id + '/posts'); app.sel = null; app.detail = null; const p = period(app.per.type, app.per.anchor); const first = app.posts.filter((x) => x.publish_on >= p.start && x.publish_on <= p.end).sort((x, y) => x.number - y.number)[0] || app.posts[0]; if (first) { app.sel = first.id; app.detail = await api('/posts/' + first.id); } renderClient(); toast('Publicación borrada'); } }
    else if (a === 'del-media') { if (await askConfirm({ title: '¿Quitar este archivo?', text: 'Se quita de la publicación y ya no lo verá el cliente.', ok: 'Sí, quitar' })) { app.detail = await api('/media/' + t.dataset.id, { method: 'DELETE' }); app.posts = await api('/clients/' + app.client.id + '/posts'); renderClient(); } }
    else if (a === 'ai') { t.disabled = true; t.textContent = 'Pensando…'; const r = await api('/agents/copy/run', { method: 'POST', body: { post_id: app.sel } }); app.ai = r.options; renderClient(); }
    else if (a === 'ai-use') { const v = app.ai[+t.dataset.i]; app.ai = null; await savePost({ copy: v }, true); }
    else if (a === 'reply-ai') { t.disabled = true; t.textContent = 'Pensando…'; app.reply = await api('/agents/respuestas/run', { method: 'POST', body: { post_id: app.sel } }); renderClient(); }
    else if (a === 'reply-use') { const v = app.reply.options[+t.dataset.i]; $('#cbody').value = v; $('#tocl').checked = true; $('#cbody').focus(); }
    else if (a === 'nudge') { t.disabled = true; t.textContent = 'Redactando…'; const r = await api('/agents/seguimiento/run', { method: 'POST', body: { client_id: app.client.id } }); app.nudge = r.message; renderClient(); }
    else if (a === 'copy-nudge') { await navigator.clipboard.writeText($('#nudge').value); toast('Mensaje copiado'); }
    else if (a === 'agent-toggle') { const r = await api('/agents/' + t.dataset.id, { method: 'PATCH', body: { enabled: t.dataset.on !== '1' } }); app.agents = r.agents; app.agentsOn = Object.fromEntries(r.agents.map((x) => [x.id, x.enabled])); loadAgentsPage(true); }
    else if (a === 'open-send') openSend();
    else if (a === 'close-modal') $('#modal') && $('#modal').remove();
    else if (a === 'copy-link') { await navigator.clipboard.writeText(t.dataset.link); toast('Link copiado'); }
    else if (a === 'bell') openBell();
    else if (a === 'close-drawer') $('#drawer').classList.remove('open');
    else if (a === 'task-toggle') { const tk = app.tasks.find((x) => x.id === t.dataset.id); const done = ['cerrado', 'terminado'].includes(tk.status); await api('/tasks/' + tk.id, { method: 'PATCH', body: { status: done ? 'pendiente' : 'cerrado' } }); route(); }
  } catch (err) { toast(err.message); if (['ai', 'reply-ai', 'nudge'].includes(a)) renderClient(); }
});
document.addEventListener('change', async (e) => {
  const t = e.target;
  if (t.dataset.act === 'task-status') { try { await api('/tasks/' + t.dataset.id, { method: 'PATCH', body: { status: t.value } }); toast('Estatus actualizado'); } catch (err) { toast(err.message); } return; }
  if (t.dataset.field && (t.tagName === 'SELECT' || t.type === 'date')) savePost({ [t.dataset.field]: t.value }, true);
});
document.addEventListener('input', (e) => {
  const t = e.target;
  if (t.dataset.field && (t.tagName === 'TEXTAREA' || (t.tagName === 'INPUT' && t.type !== 'date'))) { queueSave(t.dataset.field, t.value); if (t.id === 'copy') $('#cl').textContent = t.value.length; }
});
document.addEventListener('submit', async (e) => {
  const f = e.target; if (!f.dataset.form) return; e.preventDefault();
  const data = Object.fromEntries(new FormData(f).entries());
  try {
    if (f.dataset.form === 'task') { if (f.dataset.client) data.client_id = f.dataset.client; await api('/tasks', { method: 'POST', body: data }); toast('Pendiente agregado'); route(); }
    if (f.dataset.form === 'comment') { app.detail = await api('/posts/' + app.sel + '/comments', { method: 'POST', body: { body: data.body, to_client: !!data.to_client } }); app.reply = null; renderClient(); }
    if (f.dataset.form === 'client') { app.client = await api('/clients/' + app.client.id, { method: 'PATCH', body: data }); toast('Ficha guardada'); renderClient(); }
    if (f.dataset.form === 'send') {
      const p = period(app.per.type, app.per.anchor);
      const r = await api('/clients/' + app.client.id + '/requests', { method: 'POST', body: { ...data, period_type: app.per.type, period_start: p.start, period_end: p.end } });
      $('#modal .mb').innerHTML = `<div style="display:flex;flex-direction:column;gap:12px"><b class="h2">Parrilla <em>enviada.</em></b><span>${r.items} publicaciones pasaron a «En aprobación».</span>
        <span class="mu">${r.mail.sent ? 'Le llegó un correo a ' + esc(data.sent_to) + ' con el link.' : 'El correo automático todavía no está configurado: copia el link y mándalo por WhatsApp o correo.'}</span>
        <div class="row" style="flex-wrap:nowrap"><input value="${esc(r.link)}" readonly><button type="button" class="btn" data-act="copy-link" data-link="${esc(r.link)}">${ic('link')}Copiar</button></div></div>`;
      $('#modal .mf').innerHTML = `<span></span><button type="button" class="btn pri" data-act="close-modal">Listo</button>`;
      app.posts = await api('/clients/' + app.client.id + '/posts'); app.detail = await api('/posts/' + app.sel);
      const keep = $('#modal'); renderClient(); document.body.appendChild(keep);
    }
  } catch (err) { toast(err.message); }
});
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { $('#modal') && $('#modal').remove(); $('#drawer') && $('#drawer').classList.remove('open'); } });

// ================= MODO PRESENTACIÓN =================
function openPresent() {
  const c = app.client, p = period(app.per.type, app.per.anchor);
  const fd = feed(p), grid = fd.list;
  let cur = null;
  const el = document.createElement('div'); el.className = 'present';
  const handle = esc(c.handle || c.name);
  const profile = () => `<div class="igbar">${handle}${ic('bell')}</div>
    <div class="igprof">${c.avatar ? `<img class="av" src="${esc(c.avatar)}" alt="">` : '<span class="av"></span>'}<div class="igstats"><span><b>${grid.filter((x) => !x._next).length}</b>publicaciones</span><span><b>—</b>seguidores</span><span><b>—</b>seguidos</span></div></div>
    <div class="igbio"><b>${esc(c.name)}</b>${c.bio ? '<br>' + esc(c.bio) : ''}</div>
    ${c.highlights.length ? `<div class="ighl">${c.highlights.map((h) => `<span>${h.image ? `<img src="${esc(h.image)}" alt="">` : '<i></i>'}${esc(h.label)}</span>`).join('')}</div>` : ''}
    <div class="iggrid">${phTiles(fd.ph)}${grid.map((x) => { const m = x.media[0]; return `<button class="tile" data-p="open" data-id="${x.id}" aria-label="${esc(x.title)}">${m ? (m.video ? `<video src="${esc(m.url)}#t=0.5" muted playsinline preload="metadata"></video>` : `<img src="${esc(m.url)}" alt="">`) : `<span class="noimg">${esc(x.title)}</span>`}${x.kind === 'reel' ? REEL : x.kind === 'carr' || x.media.length > 1 ? CARR : ''}</button>`; }).join('')}</div>`;
  const post = (x) => `<div class="pv-top"><button data-p="back" aria-label="Volver al perfil">${ic('left')}</button><span>Publicaciones</span><i></i></div>
    <div class="pv-h">${c.avatar ? `<img src="${esc(c.avatar)}" alt="">` : '<span></span>'}<div><b>${handle}</b><small>${esc(x.location || '')}</small></div></div>
    <div class="pv-car"><div class="pv-slides">${x.media.length ? x.media.map((m) => m.video ? `<video src="${esc(m.url)}" controls playsinline autoplay muted loop></video>` : `<img src="${esc(m.url)}" alt="">`).join('') : '<div class="pv-empty">Material en producción</div>'}</div>${x.media.length > 1 ? `<span class="pv-cnt">1/${x.media.length}</span><div class="pv-dots">${x.media.map((_, i) => `<i class="${i ? '' : 'on'}"></i>`).join('')}</div>` : ''}</div>
    <div class="pv-acts">${ic('heart')}${ic('chat')}${ic('send')}<span style="flex:1"></span>${ic('save')}</div>
    <div class="pv-cap"><b>${handle}</b> ${esc(x.copy) || '<span style="opacity:.5">Copy en proceso</span>'}</div>
    <div class="pv-date">${x.date ? esc(x.date) : ''}</div>`;
  const draw = () => {
    const sc = el.querySelector('.scroll');
    sc.innerHTML = cur ? post(grid.find((x) => x.id === cur)) : profile(); sc.scrollTop = 0;
    const sl = el.querySelector('.pv-slides');
    if (sl) sl.onscroll = () => { const k = Math.round(sl.scrollLeft / sl.clientWidth); const cn = el.querySelector('.pv-cnt'); if (cn) cn.textContent = `${k + 1}/${sl.children.length}`; el.querySelectorAll('.pv-dots i').forEach((d, j) => d.classList.toggle('on', j === k)); };
    el.querySelector('.pnav.l').style.visibility = cur && grid.findIndex((x) => x.id === cur) > 0 ? 'visible' : 'hidden';
    el.querySelector('.pnav.r').style.visibility = cur && grid.findIndex((x) => x.id === cur) < grid.length - 1 ? 'visible' : 'hidden';
  };
  el.innerHTML = `<div class="pbar"><div><b>${esc(c.name)}</b><span>Parrilla · ${periodLabel(app.per.type, p)}</span></div><button class="btn sm" data-p="exit">${ic('x')}Salir</button></div>
    <div class="pstage"><button class="pnav l" data-p="prev" aria-label="Anterior">${ic('left')}</button><div class="phone pphone"><div class="notch"><i></i></div><div class="scroll"></div></div><button class="pnav r" data-p="next" aria-label="Siguiente">${ic('right')}</button></div>`;
  const step = (d) => { const i = grid.findIndex((x) => x.id === cur) + d; if (grid[i]) { cur = grid[i].id; draw(); } };
  const close = () => { el.remove(); document.removeEventListener('keydown', key, true); if (document.fullscreenElement) document.exitFullscreen().catch(() => {}); };
  const key = (e) => { if (e.key === 'Escape') { e.stopPropagation(); cur ? (cur = null, draw()) : close(); } else if (cur && e.key === 'ArrowRight') step(1); else if (cur && e.key === 'ArrowLeft') step(-1); };
  el.addEventListener('click', (e) => { const b = e.target.closest('[data-p]'); if (!b) return; const v = b.dataset.p;
    if (v === 'exit') close(); else if (v === 'back') { cur = null; draw(); } else if (v === 'open') { cur = b.dataset.id; draw(); } else if (v === 'prev') step(-1); else if (v === 'next') step(1); });
  document.addEventListener('keydown', key, true);
  document.body.appendChild(el); draw();
  if (el.requestFullscreen && matchMedia('(min-width:900px)').matches) el.requestFullscreen().catch(() => {});
}

// ================= PANORÁMICA A CARRUSEL =================
function openPano() {
  const d = app.detail; if (!d) return;
  const S = { img: null, n: 3, r: [4, 5], zoom: 1, ox: 0, oy: 0, replace: false };
  const el = document.createElement('div'); el.className = 'scrim'; el.id = 'pano';
  const imgs = d.media.filter((m) => !m.video);
  el.innerHTML = `<div class="modal wide" role="dialog" aria-label="Panorámica a carrusel">
    <div class="mh"><div style="display:flex;flex-direction:column;gap:6px"><span class="eyebrow">P${d.number} · ${esc(d.title)}</span><div class="h2">Panorámica a carrusel</div></div><button class="iconbtn" data-x="close" aria-label="Cerrar">${ic('x')}</button></div>
    <div class="mb">
      <div class="row pano-src"><label class="btn sm">${ic('up')}Subir foto<input type="file" accept="image/*" class="sr" id="panofile"></label>${imgs.map((m) => `<button class="pthumb" data-x="use" data-url="${esc(m.url)}"><img src="${esc(m.url)}" alt=""></button>`).join('')}<span class="dim" style="font-size:12.5px">${imgs.length ? 'o usa una de esta publicación' : ''}</span></div>
      <div class="pano-stage" id="pstage"><canvas id="pcv"></canvas><div class="pano-hint">Sube o elige una foto horizontal</div></div>
      <div class="pano-ctrl">
        <label>Fotos<div class="seg" id="pn">${[2, 3, 4, 5, 6].map((n) => `<button data-n="${n}" class="${n === 3 ? 'on' : ''}">${n}</button>`).join('')}</div></label>
        <label>Formato<div class="seg" id="pr"><button data-r="4,5" class="on">4:5 vertical</button><button data-r="1,1">1:1 cuadrada</button></div></label>
        <label style="flex:1;min-width:180px">Zoom<input type="range" id="pz" min="1" max="3" step="0.01" value="1"></label>
      </div>
      <label class="row mu" style="gap:8px;cursor:pointer;font-size:13.5px"><input type="checkbox" id="prep" style="width:auto"> Reemplazar el material actual de la publicación</label>
      <span class="dim" style="font-size:12.5px">Arrastra la foto para acomodar el encuadre. Las líneas marcan dónde se corta cada foto del carrusel (1080 px de ancho cada una).</span>
    </div>
    <div class="mf"><span class="dim" id="pinfo"></span><div class="row"><button class="btn" data-x="close">Cancelar</button><button class="btn pri" data-x="make" disabled>Crear fotos</button></div></div></div>`;
  document.body.appendChild(el);
  const cv = el.querySelector('#pcv'), ctx = cv.getContext('2d'), stage = el.querySelector('#pstage');
  const dims = () => { const W = stage.clientWidth, H = W * S.r[1] / (S.r[0] * S.n); return { W, H: Math.min(H, 520) }; };
  const cover = (W, H) => Math.max(W / S.img.width, H / S.img.height);
  const clamp = (W, H) => { const sc = cover(W, H) * S.zoom, iw = S.img.width * sc, ih = S.img.height * sc; S.ox = Math.min(0, Math.max(W - iw, S.ox)); S.oy = Math.min(0, Math.max(H - ih, S.oy)); return sc; };
  const draw = () => {
    if (!S.img) return; let { W, H } = dims(); const w0 = H * S.r[0] * S.n / S.r[1]; if (w0 < W) W = w0;
    cv.width = W * 2; cv.height = H * 2; cv.style.width = W + 'px'; cv.style.height = H + 'px';
    const sc = clamp(W, H); ctx.setTransform(2, 0, 0, 2, 0, 0); ctx.clearRect(0, 0, W, H);
    ctx.drawImage(S.img, S.ox, S.oy, S.img.width * sc, S.img.height * sc);
    ctx.strokeStyle = 'rgba(255,255,255,.9)'; ctx.lineWidth = 1.5; ctx.setLineDash([6, 5]);
    for (let i = 1; i < S.n; i++) { const x = W * i / S.n; ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
    ctx.setLineDash([]); ctx.font = '600 12px Inter, sans-serif';
    for (let i = 0; i < S.n; i++) { const x = W * i / S.n + 8; ctx.fillStyle = 'rgba(0,0,0,.55)'; ctx.beginPath(); ctx.roundRect(x, 8, 34, 20, 10); ctx.fill(); ctx.fillStyle = '#fff'; ctx.fillText(`${i + 1}/${S.n}`, x + 7, 22); }
    S.view = { W, H, sc };
    el.querySelector('#pinfo').textContent = `${S.n} fotos de 1080 × ${Math.round(1080 * S.r[1] / S.r[0])} px`;
    el.querySelector('[data-x="make"]').textContent = `Crear ${S.n} fotos`;
  };
  const load = (src) => { const im = new Image(); im.crossOrigin = 'anonymous'; im.onload = () => { S.img = im; S.zoom = 1; el.querySelector('#pz').value = 1; S.ox = -1e9; S.oy = -1e9; const { W, H } = dims(); const sc = cover(W, H); S.ox = (W - im.width * sc) / 2; S.oy = (H - im.height * sc) / 2; stage.classList.add('on'); el.querySelector('[data-x="make"]').disabled = false; draw(); }; im.src = src; };
  el.querySelector('#panofile').onchange = (e) => { const f = e.target.files[0]; if (f) load(URL.createObjectURL(f)); };
  let drag = null;
  cv.onpointerdown = (e) => { if (!S.img) return; drag = { x: e.clientX, y: e.clientY, ox: S.ox, oy: S.oy }; cv.setPointerCapture(e.pointerId); };
  cv.onpointermove = (e) => { if (!drag) return; S.ox = drag.ox + e.clientX - drag.x; S.oy = drag.oy + e.clientY - drag.y; draw(); };
  cv.onpointerup = () => { drag = null; };
  el.querySelector('#pz').oninput = (e) => { if (!S.img) return; const { W, H } = S.view; const cx = W / 2 - S.ox, cy = H / 2 - S.oy, before = S.view.sc; S.zoom = +e.target.value; const after = cover(W, H) * S.zoom; S.ox = W / 2 - cx * after / before; S.oy = H / 2 - cy * after / before; draw(); };
  const close = () => { el.remove(); window.removeEventListener('resize', draw); };
  window.addEventListener('resize', draw);
  el.addEventListener('click', async (e) => {
    const b = e.target.closest('[data-x],[data-n],[data-r]'); if (!b) { if (e.target === el) close(); return; }
    if (b.dataset.n) { S.n = +b.dataset.n; el.querySelectorAll('#pn button').forEach((x) => x.classList.toggle('on', x === b)); draw(); }
    else if (b.dataset.r) { S.r = b.dataset.r.split(',').map(Number); el.querySelectorAll('#pr button').forEach((x) => x.classList.toggle('on', x === b)); draw(); }
    else if (b.dataset.x === 'use') load(b.dataset.url);
    else if (b.dataset.x === 'close') close();
    else if (b.dataset.x === 'make') {
      b.disabled = true; b.textContent = 'Creando…';
      const { W, sc } = S.view, ow = 1080, oh = Math.round(1080 * S.r[1] / S.r[0]), f = ow * S.n / W, files = [];
      for (let i = 0; i < S.n; i++) {
        const c2 = document.createElement('canvas'); c2.width = ow; c2.height = oh; const x2 = c2.getContext('2d');
        x2.imageSmoothingQuality = 'high'; x2.setTransform(f, 0, 0, f, -i * ow, 0); x2.drawImage(S.img, S.ox, S.oy, S.img.width * sc, S.img.height * sc);
        const blob = await new Promise((r) => c2.toBlob(r, 'image/jpeg', 0.92));
        files.push(new File([blob], `panoramica_${i + 1}.jpg`, { type: 'image/jpeg' }));
      }
      try {
        if (el.querySelector('#prep').checked) for (const m of app.detail.media) await api('/media/' + m.id, { method: 'DELETE' });
        const fd = new FormData(); files.forEach((x) => fd.append('file', x));
        app.detail = await api('/posts/' + app.sel + '/media', { method: 'POST', body: fd });
        app.posts = await api('/clients/' + app.client.id + '/posts'); close(); renderClient(); toast(`${S.n} fotos agregadas al carrusel`);
      } catch (err) { toast(err.message); b.disabled = false; b.textContent = `Crear ${S.n} fotos`; }
    }
  });
}

// ================= PLANEADOR DE CAMPAÑAS =================
function openCampaign() {
  const c = app.client, p = period(app.per.type, app.per.anchor);
  const WDL = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const freq = [0, 0, 0, 0, 0, 0, 0]; app.posts.forEach((x) => x.publish_on && freq[D(x.publish_on).getUTCDay()]++);
  const top = Math.max(...freq); const days = new Set(freq.map((n, i) => (top && n >= top / 2 ? i : -1)).filter((i) => i >= 0));
  const S = { res: null };
  const el = document.createElement('div'); el.className = 'scrim'; el.id = 'camp';
  const countDates = () => { const f = el.querySelector('[name=start]').value, t = el.querySelector('[name=end]').value; let n = 0; if (f && t) for (let d = f; d <= t; d = add(d, 1)) if ([...el.querySelectorAll('[name=day]:checked')].some((x) => +x.value === D(d).getUTCDay())) n++; return n; };
  const form = () => `<div class="mb"><div class="form">
      <label class="full">Nombre de la campaña<input name="name" placeholder="Ej. Navidad en Garda" required></label>
      <label class="full">Objetivo y contexto<textarea name="goal" rows="3" placeholder="Qué queremos lograr, promociones, fechas importantes, qué hay de nuevo en el lugar…"></textarea></label>
      <label>Desde<input type="date" name="start" value="${p.start}"></label><label>Hasta<input type="date" name="end" value="${p.end}"></label>
      <label class="full">Días de publicación<div class="daypick">${[1, 2, 3, 4, 5, 6, 0].map((i) => `<label><input type="checkbox" name="day" value="${i}" ${days.has(i) ? 'checked' : ''}><span>${WDL[i]}</span></label>`).join('')}</div></label>
      <label>Publicaciones<input type="number" name="count" min="1" max="30" value="6"></label>
      <label>Formatos<select name="mix"><option value="equilibrada entre foto, carrusel y reel">Equilibrado</option><option value="más reels que fotos">Más reels</option><option value="más carruseles">Más carruseles</option><option value="solo fotos">Solo fotos</option></select></label>
      <label class="full">Indicaciones para el agente (opcional)<textarea name="notes" rows="2" placeholder="Ej. incluir la cena del 24, cerrar con año nuevo, no usar la palabra 'mágico'."></textarea></label>
    </div><span class="dim" style="font-size:12.5px" id="cinfo"></span></div>
    <div class="mf"><span class="dim">Las propuestas se crean como borrador; nada se envía al cliente.</span><div class="row"><button class="btn" data-x="close">Cancelar</button><button class="btn pri" data-x="run">${ic('pen')}Proponer bloque</button></div></div>`;
  const results = () => { const r = S.res; return `<div class="mb"><div class="csum"><b>${esc(S.name)}</b><span>${esc(r.summary || '')}</span></div>
    <div class="clist">${r.posts.map((x, i) => { const taken = app.posts.find((y) => y.publish_on === x.date); return `<article class="cpost">
      <label class="cchk"><input type="checkbox" data-i="${i}" checked></label>
      <div class="cbody"><div class="row" style="gap:8px;flex-wrap:wrap"><input type="date" data-k="date" data-i="${i}" value="${esc(x.date)}" style="width:auto"><select data-k="kind" data-i="${i}" style="width:auto">${Object.entries(KIND).map(([k, v]) => `<option value="${k}" ${k === x.kind ? 'selected' : ''}>${v}</option>`).join('')}</select>${taken ? `<span class="warn">Ese día ya está P${taken.number}</span>` : ''}</div>
      <input data-k="title" data-i="${i}" value="${esc(x.title)}" class="ctitle">
      <p class="mu">${esc(x.idea || '')}</p>
      <textarea data-k="copy" data-i="${i}" rows="3">${esc(x.copy || '')}</textarea>
      ${x.shots ? `<p class="shots"><b>Material:</b> ${esc(x.shots)}</p>` : ''}</div></article>`; }).join('')}</div></div>
    <div class="mf"><button class="btn ghost" data-x="back">${ic('left')}Ajustar y volver a proponer</button><div class="row"><button class="btn" data-x="close">Cancelar</button><button class="btn pri" data-x="make">Crear <span id="cn">${r.posts.length}</span> en borrador</button></div></div>`; };
  const frame = (inner) => `<div class="modal wide" role="dialog" aria-label="Planear campaña"><div class="mh"><div style="display:flex;flex-direction:column;gap:6px"><span class="eyebrow">${esc(c.name)} · Agente Planeador de campañas</span><div class="h2">Planear campaña</div></div><button class="iconbtn" data-x="close" aria-label="Cerrar">${ic('x')}</button></div>${inner}</div>`;
  let saved = null;
  const showForm = () => { el.innerHTML = frame(form()); if (saved) Object.entries(saved).forEach(([k, v]) => { const f = el.querySelector(`[name=${k}]`); if (f && k !== 'day') f.value = v; }); const upd = () => { el.querySelector('#cinfo').textContent = `Hay ${countDates()} fechas disponibles en ese rango con los días elegidos.`; }; el.querySelectorAll('[name=start],[name=end],[name=day]').forEach((f) => f.onchange = upd); upd(); };
  document.body.appendChild(el); showForm();
  const close = () => el.remove();
  el.addEventListener('change', (e) => { const t = e.target; if (!S.res) return; if (t.matches('.cchk input')) { el.querySelector('#cn').textContent = el.querySelectorAll('.cchk input:checked').length; } else if (t.dataset.k) S.res.posts[+t.dataset.i][t.dataset.k] = t.value; });
  el.addEventListener('input', (e) => { const t = e.target; if (S.res && t.dataset.k) S.res.posts[+t.dataset.i][t.dataset.k] = t.value; });
  el.addEventListener('click', async (e) => {
    const b = e.target.closest('[data-x]'); if (!b) { if (e.target === el) close(); return; }
    const x = b.dataset.x;
    if (x === 'close') close();
    else if (x === 'back') { S.res = null; showForm(); }
    else if (x === 'run') {
      const v = (n) => el.querySelector(`[name=${n}]`).value;
      saved = { name: v('name'), goal: v('goal'), start: v('start'), end: v('end'), count: v('count'), mix: v('mix'), notes: v('notes') };
      if (!saved.name.trim()) { toast('Ponle nombre a la campaña'); return; }
      const dsel = [...el.querySelectorAll('[name=day]:checked')].map((i) => +i.value);
      b.disabled = true; b.innerHTML = 'El agente está planeando…';
      try {
        const r = await api('/agents/campana/run', { method: 'POST', body: { client_id: c.id, campaign: { ...saved, days: dsel } } });
        if (!r.posts || !r.posts.length) throw new Error('El agente no regresó propuestas. Intenta de nuevo.');
        S.res = r; S.name = saved.name; el.innerHTML = frame(results());
      } catch (err) { toast(err.message); b.disabled = false; b.innerHTML = `${ic('pen')}Proponer bloque`; }
    } else if (x === 'make') {
      const sel = [...el.querySelectorAll('.cchk input:checked')].map((i) => S.res.posts[+i.dataset.i]).sort((a, z) => a.date.localeCompare(z.date));
      if (!sel.length) { toast('Elige al menos una publicación'); return; }
      b.disabled = true; let n = 0;
      try {
        for (const q of sel) { b.textContent = `Creando ${++n} de ${sel.length}…`; await api('/clients/' + c.id + '/posts', { method: 'POST', body: { title: q.title, publish_on: q.date, kind: q.kind, copy: q.copy, notes: `Campaña: ${S.name}\nIdea: ${q.idea || ''}${q.shots ? '\nMaterial: ' + q.shots : ''}` } }); }
        app.posts = await api('/clients/' + c.id + '/posts'); close(); renderClient(); toast(`${sel.length} publicaciones creadas en borrador`);
      } catch (err) { toast(err.message); b.disabled = false; b.textContent = 'Reintentar'; }
    }
  });
}

boot();
