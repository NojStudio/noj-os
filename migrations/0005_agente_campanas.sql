-- Planeador de campañas: queda apagado hasta que un admin lo prenda en Agentes.
INSERT OR IGNORE INTO workspace_agents (workspace_id, agent_id, enabled) VALUES ('ws_noj', 'campana', 0);
