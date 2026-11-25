// Autenticación del equipo con Cloudflare Access.
// Access pone delante de /app y /api/team un login (Google o código por correo)
// y manda un JWT firmado en el header Cf-Access-Jwt-Assertion.
// Aquí verificamos esa firma y buscamos al miembro por su correo.
// En desarrollo local se puede usar DEV_USER_EMAIL (en .dev.vars).

let certsCache = { at: 0, keys: [] };

const b64url = (s) => Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((s.length + 3) % 4)), (c) => c.charCodeAt(0));

async function getKeys(teamDomain) {
  if (Date.now() - certsCache.at < 10 * 60 * 1000 && certsCache.keys.length) return certsCache.keys;
  const r = await fetch(`https://${teamDomain}/cdn-cgi/access/certs`);
  const { keys } = await r.json();
  certsCache = { at: Date.now(), keys };
  return keys;
}

async function verifyAccessJwt(jwt, env) {
  const [h, p, s] = jwt.split('.');
  if (!h || !p || !s) return null;
  const header = JSON.parse(new TextDecoder().decode(b64url(h)));
  const payload = JSON.parse(new TextDecoder().decode(b64url(p)));
  const keys = await getKeys(env.ACCESS_TEAM_DOMAIN);
  const jwk = keys.find((k) => k.kid === header.kid);
  if (!jwk) return null;
  const key = await crypto.subtle.importKey('jwk', jwk, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['verify']);
  const ok = await crypto.subtle.verify('RSASSA-PKCS1-v1_5', key, b64url(s), new TextEncoder().encode(h + '.' + p));
  if (!ok) return null;
  const aud = Array.isArray(payload.aud) ? payload.aud : [payload.aud];
  if (env.ACCESS_AUD && !aud.includes(env.ACCESS_AUD)) return null;
  if (payload.exp && payload.exp * 1000 < Date.now()) return null;
  return payload.email ? String(payload.email).toLowerCase() : null;
}

export async function currentEmail(request, env) {
  if (env.DEV_USER_EMAIL) return env.DEV_USER_EMAIL.toLowerCase();
  const jwt = request.headers.get('cf-access-jwt-assertion');
  if (!jwt || !env.ACCESS_TEAM_DOMAIN) return null;
  try { return await verifyAccessJwt(jwt, env); } catch { return null; }
}

// En Gmail los puntos no cuentan (fotografia.monts = fotografiamonts), así que se comparan sin puntos.
// Devuelve { member, workspace } o null. Si alguien pertenece a varios espacios,
// el header x-workspace elige cuál (base para venderlo a otras agencias).
export async function currentMember(request, env) {
  const email = await currentEmail(request, env);
  if (!email) return null;
  const wanted = request.headers.get('x-workspace');
  const rows = (await env.DB.prepare(
    `SELECT m.*, w.name AS ws_name, w.slug AS ws_slug, w.plan AS ws_plan
       FROM members m JOIN workspaces w ON w.id = m.workspace_id
      WHERE lower(m.email) = ?1
         OR (?1 LIKE '%@gmail.com' AND replace(lower(m.email), '.', '') = replace(?1, '.', ''))`
  ).bind(email).all()).results;
  if (!rows.length) return { email, member: null };
  const m = rows.find((r) => r.workspace_id === wanted) || rows[0];
  return {
    email,
    member: { id: m.id, name: m.name, initials: m.initials, role: m.role, color: m.color, email: m.email },
    workspace: { id: m.workspace_id, name: m.ws_name, slug: m.ws_slug, plan: m.ws_plan },
    workspaces: rows.map((r) => ({ id: r.workspace_id, name: r.ws_name })),
  };
}
