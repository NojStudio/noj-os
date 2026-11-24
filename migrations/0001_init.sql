-- No'j OS · esquema inicial (multi-agencia desde el día 1)
-- Cada agencia es un "workspace". Todo cuelga de workspace_id.

CREATE TABLE workspaces (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  plan        TEXT NOT NULL DEFAULT 'agencia',
  brand_color TEXT NOT NULL DEFAULT '#6fbdaa',
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE members (
  id           TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL REFERENCES workspaces(id),
  email        TEXT NOT NULL,
  name         TEXT NOT NULL,
  initials     TEXT NOT NULL,
  role         TEXT NOT NULL DEFAULT 'editor',   -- admin | editor
  color        TEXT NOT NULL DEFAULT '#8fd0bf',
  created_at   TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (workspace_id, email)
);
CREATE INDEX idx_members_email ON members(email);

CREATE TABLE clients (
  id            TEXT PRIMARY KEY,
  workspace_id  TEXT NOT NULL REFERENCES workspaces(id),
  name          TEXT NOT NULL,
  handle        TEXT NOT NULL DEFAULT '',          -- usuario de Instagram
  services      TEXT NOT NULL DEFAULT '',
  bio           TEXT NOT NULL DEFAULT '',
  location      TEXT NOT NULL DEFAULT '',
  avatar_key    TEXT,                              -- llave en R2
  approver_name TEXT NOT NULL DEFAULT '',
  approver_email TEXT NOT NULL DEFAULT '',
  owner_member  TEXT REFERENCES members(id),
  brand_tone    TEXT NOT NULL DEFAULT '',          -- guía para la IA
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_clients_ws ON clients(workspace_id);

-- Destacadas del perfil (para que la vista previa se vea como el perfil real)
CREATE TABLE highlights (
  id        TEXT PRIMARY KEY,
  client_id TEXT NOT NULL REFERENCES clients(id),
  label     TEXT NOT NULL,
  image_key TEXT,
  position  INTEGER NOT NULL DEFAULT 0
);

-- Publicaciones. status: borrador | prod | lista | aprob | ok | cambio | pub
CREATE TABLE posts (
  id          TEXT PRIMARY KEY,
  client_id   TEXT NOT NULL REFERENCES clients(id),
  number      INTEGER NOT NULL,                 -- P1, P2…
  title       TEXT NOT NULL DEFAULT '',
  kind        TEXT NOT NULL DEFAULT 'foto',     -- foto | carr | reel
  publish_on  TEXT,                             -- YYYY-MM-DD
  status      TEXT NOT NULL DEFAULT 'borrador',
  copy        TEXT NOT NULL DEFAULT '',
  location    TEXT NOT NULL DEFAULT '',
  owner_member TEXT REFERENCES members(id),
  notes       TEXT NOT NULL DEFAULT '',
  updated_at  TEXT NOT NULL DEFAULT (datetime('now')),
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (client_id, number)
);
CREATE INDEX idx_posts_client_date ON posts(client_id, publish_on);

CREATE TABLE post_media (
  id         TEXT PRIMARY KEY,
  post_id    TEXT NOT NULL REFERENCES posts(id),
  r2_key     TEXT NOT NULL,
  mime       TEXT NOT NULL,
  position   INTEGER NOT NULL DEFAULT 0,
  is_cover   INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_media_post ON post_media(post_id, position);

-- Comentarios internos y del cliente sobre una publicación
CREATE TABLE comments (
  id          TEXT PRIMARY KEY,
  post_id     TEXT NOT NULL REFERENCES posts(id),
  author_type TEXT NOT NULL,          -- member | client
  author_id   TEXT,                   -- members.id cuando es del equipo
  author_name TEXT NOT NULL,
  body        TEXT NOT NULL,
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_comments_post ON comments(post_id, created_at);

-- Un envío a aprobación = un periodo de un cliente + un link sin cuenta
CREATE TABLE approval_requests (
  id           TEXT PRIMARY KEY,
  client_id    TEXT NOT NULL REFERENCES clients(id),
  period_type  TEXT NOT NULL,         -- semana | quincena | mes
  period_start TEXT NOT NULL,
  period_end   TEXT NOT NULL,
  token        TEXT NOT NULL UNIQUE,  -- va en el link /a/<token>
  due_at       TEXT,
  sent_by      TEXT REFERENCES members(id),
  sent_to      TEXT NOT NULL DEFAULT '',
  status       TEXT NOT NULL DEFAULT 'abierta',  -- abierta | respondida | cerrada
  responded_at TEXT,
  created_at   TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_req_client ON approval_requests(client_id, created_at);

CREATE TABLE approval_items (
  request_id TEXT NOT NULL REFERENCES approval_requests(id),
  post_id    TEXT NOT NULL REFERENCES posts(id),
  decision   TEXT,                     -- ok | cambio | NULL (pendiente)
  note       TEXT NOT NULL DEFAULT '',
  decided_at TEXT,
  PRIMARY KEY (request_id, post_id)
);

-- Pendientes (lo que antes vivía en la hoja "Pendientes Garda")
CREATE TABLE tasks (
  id           TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL REFERENCES workspaces(id),
  client_id    TEXT REFERENCES clients(id),
  title        TEXT NOT NULL,
  detail       TEXT NOT NULL DEFAULT '',
  bucket       TEXT NOT NULL DEFAULT 'equipo',   -- hoy | equipo | cliente
  status       TEXT NOT NULL DEFAULT 'pendiente',-- pendiente | en_proceso | en_espera | terminado | cerrado
  assignee     TEXT,                              -- members.id, o NULL si espera al cliente
  waiting_on   TEXT NOT NULL DEFAULT '',          -- nombre de quien se espera
  due_on       TEXT,
  created_at   TEXT NOT NULL DEFAULT (datetime('now')),
  closed_at    TEXT
);
CREATE INDEX idx_tasks_ws ON tasks(workspace_id, status);

-- Bitácora y notificaciones
CREATE TABLE activity (
  id           TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL REFERENCES workspaces(id),
  client_id    TEXT,
  post_id      TEXT,
  actor        TEXT NOT NULL,       -- nombre visible
  kind         TEXT NOT NULL,       -- post.status | request.sent | request.answered | comment | task …
  text         TEXT NOT NULL,
  created_at   TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_activity_ws ON activity(workspace_id, created_at);

CREATE TABLE reads (
  member_id TEXT PRIMARY KEY REFERENCES members(id),
  last_seen TEXT NOT NULL
);
