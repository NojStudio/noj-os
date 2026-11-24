-- Capa de agentes: cada espacio prende o apaga agentes (como plugins).
-- El catálogo vive en el código (lib/agents.js); aquí solo el estado por espacio y el consumo.
CREATE TABLE IF NOT EXISTS workspace_agents (
  workspace_id TEXT NOT NULL REFERENCES workspaces(id),
  agent_id     TEXT NOT NULL,
  enabled      INTEGER NOT NULL DEFAULT 1,
  config       TEXT NOT NULL DEFAULT '{}',
  updated_by   TEXT,
  updated_at   TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (workspace_id, agent_id)
);

-- Cada ejecución queda registrada: sirve para historial y para cobrar por uso más adelante.
CREATE TABLE IF NOT EXISTS agent_runs (
  id            TEXT PRIMARY KEY,
  workspace_id  TEXT NOT NULL REFERENCES workspaces(id),
  agent_id      TEXT NOT NULL,
  member_id     TEXT,
  client_id     TEXT,
  post_id       TEXT,
  status        TEXT NOT NULL DEFAULT 'ok',      -- ok | error
  input_tokens  INTEGER NOT NULL DEFAULT 0,
  output_tokens INTEGER NOT NULL DEFAULT 0,
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_runs_ws ON agent_runs (workspace_id, created_at);

-- Comentarios del equipo que sí ve el cliente en su link (respuestas a sus cambios).
ALTER TABLE comments ADD COLUMN to_client INTEGER NOT NULL DEFAULT 0;

INSERT OR IGNORE INTO workspace_agents (workspace_id, agent_id, enabled) VALUES
  ('ws_noj', 'copy', 1), ('ws_noj', 'respuestas', 1), ('ws_noj', 'seguimiento', 1);
