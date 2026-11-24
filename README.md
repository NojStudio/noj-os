# No'j OS

Sistema operativo de No'j Studio: parrilla de contenido, pendientes, aprobación del cliente por link y agentes que se prenden como plugins.

- **Equipo** (`/app`): Luis, Carlos y Monse entran con su correo. Ven Hoy, Pendientes, Agentes y cada cliente (Parrilla · Pendientes · Envíos · Ficha de marca).
- **Cliente** (`/a/<link>`): sin cuenta. Ve su perfil de Instagram como va a quedar, aprueba o pide cambios por publicación y manda su respuesta. Al equipo le llega la notificación.
- **Multi-espacio desde el día uno**: todo cuelga de `workspace_id`, así que otras agencias pueden tener su propio espacio cuando se venda como SaaS.

## Stack

Cloudflare Pages + Functions (API) · D1 (base de datos) · R2 (fotos y videos) · Cloudflare Access (login del equipo). Sin framework ni build: lo que está en `public/` es lo que se publica.

```
functions/api/team/   API del equipo (detrás de Access)
functions/api/public/ API del portal del cliente (por token)
functions/a/          sirve el portal en /a/<token>
functions/media/      sirve archivos de R2
lib/                  auth, utilidades y catálogo de agentes
migrations/           esquema, datos de Garda y capa de agentes
public/app/           app del equipo
public/portal/        portal de aprobación
```

## Puesta en marcha (una sola vez)

Todo con la cuenta de Cloudflare de No'j (la misma donde está `garda-web`).

1. **Subir este folder al repo** `noj-os` en GitHub (ver abajo).
2. **Crear la base y el bucket** (en la terminal, dentro del folder):
   ```
   npm install
   npx wrangler login
   npx wrangler d1 create noj-os
   npx wrangler r2 bucket create noj-os-media
   npx wrangler pages project create noj-os --production-branch main
   ```
   El primer comando imprime un `database_id`. Pégalo en `wrangler.toml` en lugar de `REEMPLAZAR_CON_ID_DE_D1` y haz commit.
3. **Secretos del repo** (GitHub → Settings → Secrets and variables → Actions): `CLOUDFLARE_API_TOKEN` y `CLOUDFLARE_ACCOUNT_ID`, los mismos que ya usa el repo de Garda. El token necesita permisos de *Pages: Edit* y *D1: Edit*.
4. **Primer deploy**: haz push a `main`. La acción aplica las migraciones y publica en `https://noj-os.pages.dev`.
5. **Login del equipo** (Cloudflare → Zero Trust → Access → Applications → *Add self-hosted*):
   - Dominio `noj-os.pages.dev`, rutas `/app` y `/api/team`.
   - Política *Allow* con los correos de Luis, Carlos y Monse (login por código al correo o Google).
   - Copia el **AUD** de la aplicación y tu dominio de equipo (`<algo>.cloudflareaccess.com`) a `ACCESS_AUD` y `ACCESS_TEAM_DOMAIN` en `wrangler.toml`, commit y push.
   - El portal `/a/...` y `/media/...` quedan **fuera** de Access a propósito: el cliente entra sin cuenta.
6. **Opcional** (Cloudflare → Pages → noj-os → Settings → Variables, tipo *Secret*):
   - `ANTHROPIC_API_KEY`: prende las respuestas reales de los agentes.
   - `RESEND_API_KEY`: manda el link al cliente y los avisos al equipo por correo. Sin esto, el link se copia y se manda por WhatsApp.

Las llaves solo van en los secretos de Cloudflare o GitHub, nunca en el código.

## Subir a GitHub

```
cd noj-os
git init -b main
git add .
git commit -m "No'j OS · fase 1"
git remote add origin https://github.com/<usuario>/noj-os.git
git push -u origin main
```
Si el repo ya tiene un README, usa `git pull origin main --allow-unrelated-histories` antes del push.

## Probar en tu compu

```
cp .dev.vars.example .dev.vars
npm run db:local
npm run dev
```
Abre `http://localhost:8788/app/`. Entras como el correo de `DEV_USER_EMAIL` y los agentes contestan en modo de prueba (`AI_MOCK=1`).

## Flujo de aprobación

1. En la parrilla eliges **Semana, Quincena o Mes** y navegas entre periodos.
2. Lo que está en **Lista** (o **Cambio pedido**) entra al envío; lo demás le aparece al cliente como *En producción*.
3. **Enviar a aprobación** genera el link (y el correo si Resend está configurado). Esas publicaciones pasan a *En aprobación*.
4. El cliente aprueba o pide cambio en cada una. Cada decisión cambia el estatus en la app y aparece en notificaciones.
5. Al responder un cambio, marca **Visible para el cliente** y lo verá en su link.

## Agentes (plugins)

Los agentes viven en `lib/agents.js`. Cada uno es una ficha con categoría, precio, dónde aparece en la app y cómo arma su contexto. Por espacio se prenden o apagan (`workspace_agents`) y cada uso queda en `agent_runs` con tokens, que sirve para cobrar por uso más adelante.

| Agente | Estado | Dónde vive |
|---|---|---|
| Redactor de copys | Disponible | Publicación · Contenido |
| Respuestas al cliente | Disponible | Publicación · Comentarios |
| Seguimiento de pendientes | Disponible | Cliente · Pendientes |
| Fechas clave | Pronto | Parrilla |
| Reporte mensual | Pronto (requiere Meta) | Cliente |
| Canal de WhatsApp | Pronto (WhatsApp Business API) | Envíos |
| Publicador | Pronto (requiere Meta) | Parrilla |
| Propuestas comerciales | Pronto | Ventas |
| No'j Motor · Stock | Pronto | Material |

Para agregar uno: un objeto nuevo en `AGENTS` con `build()` (arma el prompt) y `mock()` (respuesta de prueba), y un botón en la vista donde vive.
