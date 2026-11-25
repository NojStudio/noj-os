-- Historias: tipo propio de publicación con datos de producción en "extra" y meta semanal por cliente.
ALTER TABLE posts ADD COLUMN extra TEXT;
ALTER TABLE clients ADD COLUMN story_goal INTEGER NOT NULL DEFAULT 2;

-- Las 5 propuestas de historia de la semana del 25 nov para Garda (en borrador).
INSERT OR IGNORE INTO posts (id, client_id, number, title, kind, publish_on, status, copy, location, owner_member, notes, extra)
  SELECT 'p_hist_01','c_garda', coalesce(max(number),0)+1, 'Café para llevar', 'historia', '2026-11-26', 'borrador',
  'Tu café, para llevar. · Desde las 8 am · Medellín 176', 'Medellín 176, Roma Norte', 'm_luis', 'Propuesta 1 · recomendada',
  '{"type":"diseno","bank":"C3383","ig":"Música de Instagram y sticker de ubicación","highlight":"Cafecito to go"}' FROM posts WHERE client_id='c_garda';
INSERT OR IGNORE INTO posts (id, client_id, number, title, kind, publish_on, status, copy, location, owner_member, notes, extra)
  SELECT 'p_hist_02','c_garda', coalesce(max(number),0)+1, 'Espresso en barra', 'historia', NULL, 'borrador',
  '', 'Medellín 176, Roma Norte', 'm_luis', 'Propuesta 2 · alternativa',
  '{"type":"material","bank":"C3397","ig":"Música de Instagram","highlight":"Cafecito to go"}' FROM posts WHERE client_id='c_garda';
INSERT OR IGNORE INTO posts (id, client_id, number, title, kind, publish_on, status, copy, location, owner_member, notes, extra)
  SELECT 'p_hist_03','c_garda', coalesce(max(number),0)+1, 'Spritz', 'historia', NULL, 'borrador',
  '', 'Medellín 176, Roma Norte', 'm_luis', 'Propuesta 3 · alternativa',
  '{"type":"material","bank":"C3344","ig":"Música de Instagram y sticker de ubicación","highlight":""}' FROM posts WHERE client_id='c_garda';
INSERT OR IGNORE INTO posts (id, client_id, number, title, kind, publish_on, status, copy, location, owner_member, notes, extra)
  SELECT 'p_hist_04','c_garda', coalesce(max(number),0)+1, 'La barra, tres tragos', 'historia', '2026-11-27', 'borrador',
  '', 'Medellín 176, Roma Norte', 'm_luis', 'Propuesta 4 · recomendada',
  '{"type":"material","bank":"C3415, C3352, C3338","ig":"Música de Instagram y sticker de ubicación","highlight":""}' FROM posts WHERE client_id='c_garda';
INSERT OR IGNORE INTO posts (id, client_id, number, title, kind, publish_on, status, copy, location, owner_member, notes, extra)
  SELECT 'p_hist_05','c_garda', coalesce(max(number),0)+1, 'Del café a la última copa', 'historia', NULL, 'borrador',
  'Del café a la última copa. · Mar a sáb 8 am – 11 pm', 'Medellín 176, Roma Norte', 'm_luis', 'Propuesta 5 · alternativa',
  '{"type":"diseno","bank":"C3338","ig":"Música de Instagram","highlight":"Horarios"}' FROM posts WHERE client_id='c_garda';
INSERT OR IGNORE INTO post_media (id, post_id, r2_key, mime, position) VALUES
  ('sm_hist_01','p_hist_01','seed/garda/historias/h1_cafe.mp4','video/mp4',1),
  ('sm_hist_02','p_hist_02','seed/garda/historias/h2_espresso.mp4','video/mp4',1),
  ('sm_hist_03','p_hist_03','seed/garda/historias/h3_spritz.mp4','video/mp4',1),
  ('sm_hist_04','p_hist_04','seed/garda/historias/h4_barra.mp4','video/mp4',1),
  ('sm_hist_05','p_hist_05','seed/garda/historias/h5_copa.mp4','video/mp4',1);
