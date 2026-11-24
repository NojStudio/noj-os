// No'j OS · portal de aprobación. El cliente entra con /a/<token>, sin cuenta.
const $ = (s, r = document) => r.querySelector(s);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const tokenId = location.pathname.split('/').filter(Boolean)[1] || '';
const API = '/api/public/r/' + encodeURIComponent(tokenId);
const REEL = '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 3h16a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zm6 6v7l6-3.5z"/></svg>';
const CARR = '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 3h12a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zM3 7h2v12h12v2H4a1 1 0 0 1-1-1z"/></svg>';
const I = {
  x: '<path d="M18 6L6 18M6 6l12 12"/>', grid: '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>',
  heart: '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21l7.8-7.5 1-1.1a5.5 5.5 0 0 0 0-7.8z"/>',
  chat: '<path d="M21 11.5a8.4 8.4 0 0 1-12.6 7.3L3 21l2.2-5.4A8.4 8.4 0 1 1 21 11.5z"/>', send: '<path d="M22 2L11 13M22 2l-7 20-4-9-9-4z"/>',
  save: '<path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>', check: '<path d="M20 6L9 17l-5-5"/>', more: '<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>',
};
const ic = (n, s = '') => `<svg class="i" viewBox="0 0 24 24" aria-hidden="true" style="${s}">${I[n]}</svg>`;
const LABEL = { pendiente: 'Por aprobar', ok: 'Aprobada', cambio: 'Cambio pedido', produccion: 'En producción', publicada: '', proxima: 'Próxima' };
const COLOR = { pendiente: 'var(--ac)', ok: 'var(--ok)', cambio: 'var(--cambio)', produccion: 'var(--prod)', publicada: 'var(--dim)', proxima: 'var(--dim)' };
const MES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
const fecha = (s) => { if (!s) return ''; const [, m, d] = s.slice(0, 10).split('-').map(Number); return `${d} ${MES[m - 1]}`; };

let D = null, open = null, changing = false, busy = false, full = false;
const inReview = (p) => ['pendiente', 'ok', 'cambio'].includes(p.state);

const toast = (m) => { const t = $('#toast'); t.textContent = m; t.classList.add('on'); clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove('on'), 2200); };
async function call(path = '', body) {
  const r = await fetch(API + path, body ? { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) } : {});
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data.error || 'No se pudo conectar. Intenta de nuevo.');
  return data;
}

const review = () => D.posts.filter((p) => ['pendiente', 'ok', 'cambio'].includes(p.state));
const pending = () => D.posts.filter((p) => p.state === 'pendiente');

async function load() {
  try { D = await call(); }
  catch (e) { $('#root').innerHTML = `<div class="wrap"><div class="done"><h1>Link no disponible</h1><p>${esc(e.message)}</p></div></div>`; return; }
  document.title = `${D.client.name} · Parrilla para revisar`;
  render();
}

function render() {
  const c = D.client, all = review(), done = all.length - pending().length, pct = all.length ? Math.round((done / all.length) * 100) : 0;
  const answered = D.request.status !== 'abierta';
  $('#root').innerHTML = `<div class="wrap">
    <header class="brief"><div class="ring" style="--p:${pct}" aria-label="${done} de ${all.length} revisadas"><span>${done}/${all.length}</span></div>
      <div class="t"><b>Parrilla ${esc(D.request.period_type)} · ${esc(D.request.label)}</b><span>${answered ? 'Ya enviaste tu respuesta. Puedes seguir comentando.' : `${all.length} publicaciones para aprobar${D.request.due_at ? ' · antes del ' + fecha(D.request.due_at) : ''}`}</span></div></header>
    <div class="igbar"><span>${esc(c.handle || c.name)}</span>${ic('more')}</div>
    <div class="prof">${c.avatar ? `<img class="av" src="${esc(c.avatar)}" alt="">` : '<span class="av"></span>'}
      <div class="stats"><span><b>${D.posts.filter((p) => p.state !== 'proxima').length}</b>publicaciones</span><span><b>${pending().length}</b>por aprobar</span><span><b>${D.posts.filter((p) => p.state === 'ok').length}</b>aprobadas</span></div></div>
    <div class="bio"><b>${esc(c.name)}</b>${c.bio ? '\n' + esc(c.bio) : ''}</div>
    ${c.highlights.length ? `<div class="hl">${c.highlights.map((h) => `<span>${h.image ? `<img src="${esc(h.image)}" alt="">` : '<i></i>'}${esc(h.label)}</span>`).join('')}</div>` : ''}
    <div class="gtabs"><span>${ic('grid')}</span></div>
    ${grid()}
    <div class="foot">Parrilla preparada por <b>${esc(D.agency)}</b> · Compartida con No'j OS</div>
  </div>
  <div class="dock"><div class="in"><span>${pending().length ? `Te faltan <b>${pending().length}</b> por revisar` : 'Revisaste todo. ¡Gracias!'}</span>
    <button class="btn pri" data-act="finish" ${done ? '' : 'disabled'}>${answered ? 'Reenviar respuesta' : 'Enviar respuesta'}</button></div></div>`;
  if (open) renderSheet();
}

function grid() {
  const cells = [...Array((3 - (D.posts.length % 3)) % 3).fill(null), ...D.posts];
  const rows = []; for (let i = 0; i < cells.length; i += 3) rows.push(cells.slice(i, i + 3));
  const rr = rows.map((r, i) => (r.some((p) => p && inReview(p)) ? i : -1)).filter((i) => i >= 0);
  let a = 0, b = rows.length - 1;
  if (rr.length && !full) { a = Math.max(0, rr[0] - 1); b = Math.min(rows.length - 1, rr[rr.length - 1] + 1); }
  const hidden = rows.length - (b - a + 1);
  return `${a > 0 ? `<button class="more" data-act="full">Ver ${a * 3} publicaciones más arriba</button>` : ''}
    <div class="grid">${rows.slice(a, b + 1).map((r) => r.map((p) => (p ? tile(p) : '<span class="tile ph"><span>Próxima</span></span>')).join('')).join('')}</div>
    ${hidden ? `<button class="more" data-act="full">${b < rows.length - 1 ? `Ver el perfil completo · ${(rows.length - 1 - b) * 3} publicaciones anteriores` : 'Ver el perfil completo'}</button>` : full && rr.length ? '<button class="more" data-act="focus">Mostrar solo lo que hay que aprobar</button>' : ''}`;
}

function tile(p) {
  const m = p.media[0], clickable = !['produccion', 'proxima'].includes(p.state);
  return `<button class="tile ${p.state} ${inReview(p) ? 'rev' : 'muted'}" ${clickable ? `data-act="open" data-id="${p.id}"` : 'disabled'} aria-label="${esc(p.title)}${LABEL[p.state] ? ' · ' + LABEL[p.state] : ''}">
    ${m ? (m.video ? `<video src="${esc(m.url)}#t=0.5" muted playsinline preload="metadata"></video>` : `<img src="${esc(m.url)}" alt="" loading="lazy">`) : `<span class="noimg">${esc(p.title)}</span>`}
    ${p.kind === 'reel' ? REEL : p.kind === 'carr' || p.media.length > 1 ? CARR : ''}
    ${LABEL[p.state] ? `<span class="badge"><i></i>${p.state === 'ok' ? '✓ ' : ''}${LABEL[p.state]}</span>` : ''}${inReview(p) ? `<span class="when">${esc(p.date)}</span>` : ''}</button>`;
}

function renderSheet() {
  const p = D.posts.find((x) => x.id === open), c = D.client;
  if (!p) { close(); return; }
  const list = review(), i = list.findIndex((x) => x.id === p.id);
  const canDecide = ['pendiente', 'ok', 'cambio'].includes(p.state);
  let el = $('#sheet');
  if (!el) { el = document.createElement('div'); el.id = 'sheet'; el.className = 'sheet'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-modal', 'true'); document.body.appendChild(el); document.body.style.overflow = 'hidden'; }
  el.innerHTML = `<article class="post">
    <header class="phead">${c.avatar ? `<img src="${esc(c.avatar)}" alt="">` : '<img alt="">'}<div class="who"><b>${esc(c.handle || c.name)}</b><span>${esc(p.location || c.location || '')}</span></div>
      <button class="x" data-act="close" aria-label="Cerrar">${ic('x')}</button></header>
    <div class="car"><div class="slides" id="slides">${p.media.length ? p.media.map((m) => m.video ? `<video src="${esc(m.url)}" controls playsinline preload="metadata"></video>` : `<img src="${esc(m.url)}" alt="">`).join('') : `<div class="empty">El material de esta publicación se sube pronto.</div>`}</div>
      ${p.media.length > 1 ? `<span class="count" id="cnt">1/${p.media.length}</span><div class="dots" id="dots">${p.media.map((_, k) => `<i class="${k ? '' : 'on'}"></i>`).join('')}</div>` : ''}</div>
    <div class="side">
      <div class="acts">${ic('heart')}${ic('chat')}${ic('send')}<span style="flex:1"></span>${ic('save')}</div>
      <div class="cap"><b>${esc(c.handle || c.name)}</b>${esc(p.copy) || '<span style="color:var(--dim)">Copy en proceso</span>'}</div>
      <div class="when">Se publica el ${esc(p.date)}</div>
      ${canDecide ? `<section class="review" aria-label="Tu revisión">
        <div class="state"><i style="background:${COLOR[p.state]}"></i>${p.state === 'pendiente' ? '¿Aprobamos esta publicación?' : p.state === 'ok' ? 'Aprobada. Gracias.' : 'Pediste un cambio. Te avisamos cuando quede.'}</div>
        ${p.thread.length ? `<div class="thread">${p.thread.map((k) => `<div class="msg ${k.who}"><small>${esc(k.who === 'client' ? 'Tú' : k.name)}</small>${esc(k.body)}</div>`).join('')}</div>` : ''}
        ${changing ? `<textarea id="note" rows="3" placeholder="Cuéntanos qué cambiarías: copy, foto, fecha…" aria-label="Cambio que pides"></textarea>
          <div class="row"><button class="btn pri" data-act="send-change">Enviar cambio</button><button class="btn" data-act="cancel">Cancelar</button></div>`
        : `<div class="acts2"><button class="btn ok" data-act="ok" ${p.state === 'ok' ? 'disabled' : ''}>${ic('check', 'width:18px;height:18px')}${p.state === 'ok' ? 'Aprobada' : 'Aprobar'}</button><button class="btn link" data-act="change">${p.state === 'cambio' ? 'Agregar otro comentario' : 'Pedir un cambio'}</button></div>`}
        <div class="navp"><button data-act="nav" data-v="-1" ${i <= 0 ? 'style="visibility:hidden"' : ''}>‹ Anterior</button><span>${i + 1} de ${list.length}</span><button data-act="nav" data-v="1" ${i >= list.length - 1 ? 'style="visibility:hidden"' : ''}>Siguiente ›</button></div>
      </section>` : ''}
    </div></article>`;
  const sl = $('#slides');
  if (sl && p.media.length > 1) sl.onscroll = () => { const k = Math.round(sl.scrollLeft / sl.clientWidth); $('#cnt').textContent = `${k + 1}/${p.media.length}`; [...$('#dots').children].forEach((d, j) => d.classList.toggle('on', j === k)); };
  if (changing) $('#note').focus();
}

function close() { open = null; changing = false; const el = $('#sheet'); if (el) el.remove(); document.body.style.overflow = ''; }

async function decide(decision, note) {
  if (busy) return; busy = true;
  try {
    const cur = open;
    D = await call('/decide', { post_id: cur, decision, note });
    changing = false;
    toast(decision === 'ok' ? 'Aprobada' : 'Cambio enviado al equipo');
    const next = pending()[0];
    open = decision === 'ok' && next ? next.id : cur;
    render();
    if (!pending().length && decision === 'ok') { close(); render(); }
  } catch (e) { toast(e.message); }
  busy = false;
}

async function finish() {
  if (pending().length && !confirm(`Te faltan ${pending().length} por revisar. ¿Enviar tu respuesta así?`)) return;
  try {
    const r = await call('/finish', {});
    D.request.status = 'respondida'; close();
    $('#root').innerHTML = `<div class="wrap"><div class="done"><div class="ring" style="--p:100;width:64px;height:64px"><span style="width:54px;height:54px">${ic('check')}</span></div>
      <h1>¡Gracias, ${esc(D.client.approver || 'listo')}!</h1><p>Le avisamos al equipo de ${esc(D.agency)}: ${r.ok} aprobadas${r.cambio ? ` y ${r.cambio} con cambio` : ''}. Si cambias de opinión, puedes volver a este link.</p>
      <button class="btn" data-act="back">Volver a la parrilla</button></div><div class="foot">Compartida con No'j OS</div></div>`;
  } catch (e) { toast(e.message); }
}

document.addEventListener('click', (e) => {
  const t = e.target.closest('[data-act]');
  if (!t) { if (e.target.id === 'sheet') close(); return; }
  const a = t.dataset.act;
  if (a === 'open') { open = t.dataset.id; changing = false; renderSheet(); }
  else if (a === 'close') close();
  else if (a === 'ok') decide('ok', '');
  else if (a === 'change') { changing = true; renderSheet(); }
  else if (a === 'cancel') { changing = false; renderSheet(); }
  else if (a === 'send-change') { const n = $('#note').value.trim(); if (!n) { toast('Escribe qué cambiarías'); return; } decide('cambio', n); }
  else if (a === 'nav') { const l = review(), i = l.findIndex((x) => x.id === open) + +t.dataset.v; if (l[i]) { open = l[i].id; changing = false; renderSheet(); } }
  else if (a === 'finish') finish();
  else if (a === 'full') { full = true; render(); }
  else if (a === 'focus') { full = false; render(); }
  else if (a === 'back') render();
});
document.addEventListener('keydown', (e) => {
  if (!open || changing) return;
  if (e.key === 'Escape') close();
  if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { const l = review(), i = l.findIndex((x) => x.id === open) + (e.key === 'ArrowRight' ? 1 : -1); if (l[i]) { open = l[i].id; renderSheet(); } }
});

load();
