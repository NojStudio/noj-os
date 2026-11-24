-- Datos iniciales: espacio de No'j Studio y el cliente Garda.
-- Los correos del equipo se usan para el login (Cloudflare Access).
-- Cámbialos aquí o desde la app antes de desplegar si alguno es distinto.

INSERT INTO workspaces (id, name, slug, plan) VALUES ('ws_noj', 'No''j Studio', 'noj', 'agencia');

INSERT INTO members (id, workspace_id, email, name, initials, role, color) VALUES
 ('m_luis',   'ws_noj', 'nojstudiomx@gmail.com',      'Luis Rodríguez', 'LR', 'admin',  '#8fd0bf'),
 ('m_carlos', 'ws_noj', 'carlosguionbajo@gmail.com',  'Carlos',         'CA', 'editor', '#e3c48d'),
 ('m_monse',  'ws_noj', 'fotografiamonts@gmail.com',  'Monse',          'MT', 'editor', '#cdb9dc');

INSERT INTO clients (id, workspace_id, name, handle, services, bio, location, approver_name, approver_email, owner_member, brand_tone) VALUES
 ('c_garda', 'ws_noj', 'Garda Gastrobar', 'gardagastrobar', 'Contenido · Web · Pauta',
  'Gastronomía – café – coctelería.\nDel desayuno a la última copa.\nMedellín 176, Roma Norte, CDMX',
  'Medellín 176, Roma Norte', 'Alex', '', 'm_carlos',
  'Cercano y sobrio, con humor fino. Habla de tú. Usa: de la casa, temporada, barra, mesa, sobremesa. Evita: barato, promo, oferta increíble. Cierra con 📍 Medellín 176 o invitación a reservar en el link de la bio. Emojis con moderación (1–2).');

INSERT INTO highlights (id, client_id, label, position) VALUES
 ('h1','c_garda','Reservar',1), ('h2','c_garda','Sobremesa',2), ('h3','c_garda','Horarios',3);

INSERT INTO posts (id, client_id, number, title, kind, publish_on, status, copy, location, owner_member, notes) VALUES
 ('p01','c_garda',1,'Reel del puente','reel','2026-11-14','pub','El puente sigue en Garda. 🍷\nDe 8 a. m. a 10 p. m.\nReserva en el link de la bio. 👆','Garda Gastrobar','m_luis',''),
 ('p02','c_garda',2,'Carrusel del lugar','carr','2026-11-17','pub','Pausa. Voltea. Aquí estamos. 👀\n📍 Medellín 176, Roma Norte, CDMX.\nReserva en el link de la bio.','Medellín 176, Roma Norte','m_monse',''),
 ('p03','c_garda',3,'Sobremesa','foto','2026-11-19','pub','¿Otro rato? 🍷\nQue la sobremesa se extienda.\nReserva para este fin de semana en el link de la bio. 👆','Garda Gastrobar','m_carlos',''),
 ('p04','c_garda',4,'Video de platillos','reel','2026-11-21','pub','Se vale elegir con los ojos. 👀🍽️\n¿Cuál vas a pedir?\nReserva en el link de la bio.','Garda Gastrobar','m_luis',''),
 ('p05','c_garda',5,'Ensalada Garda','carr','2026-11-24','pub','Preocupación 1: Acompañar mi ensalada del mejor vino 😌. Preocupación 2: ¿qué es preocuparse?\nReserva en el link de la bio.','Garda Gastrobar','m_monse',''),
 ('p06','c_garda',6,'La carta','foto','2026-11-27','pub','¿Desayuno, comida o cena? Nosotros decimos focaccia. 🥪\nDe 8 a. m. a 10 p. m.\nReserva en el link de la bio. 👆','Garda Gastrobar','m_carlos',''),
 ('p07','c_garda',7,'Apertura de mes','carr','2026-12-01','lista','Bajar el ritmo cuando cae la noche en la Roma. Diciembre empieza aquí.\n📍 Medellín 176.','Medellín 176, Roma Norte','m_carlos',''),
 ('p08','c_garda',8,'Ritual de mañana','carr','2026-12-03','borrador','Pasa por tu Caffè Borbone to go desde las 8:00 am en la Roma. ☕️\n📍 Medellín 176.','Garda Gastrobar','m_carlos','Formato: placas + foto o solo fotos · Monse agrega 1 foto'),
 ('p09','c_garda',9,'Comida de sábado','foto','2026-12-05','lista','Hay sábados que no necesitan más plan que un buen sándwich, una mesa tranquila y cero prisas.\nPasa a comer a Garda. 🥪🍷\n📍 Medellín 176.','Garda Gastrobar','m_monse','Foto: GA 8-1-2'),
 ('p10','c_garda',10,'Detrás de la barra','reel','2026-12-07','prod','Cae la tarde en la Roma y empezamos a tomar ritmo.\nEl plan perfecto para cortar el lunes. 🍸\n📍 Medellín 176.','Garda Gastrobar','m_luis','3 versiones del reel: Velada, Ritmo, Recorrido'),
 ('p11','c_garda',11,'Aperol Spritz 2x1','reel','2026-12-09','prod','Una buena copa no necesita pretexto, solo el lugar indicado.\n📍 Medellín 176.','Garda Gastrobar','m_luis','Reel corto de Aperol 2x1'),
 ('p12','c_garda',12,'L''arte di restare','carr','2026-12-11','lista','El arte de hacer sobremesa en la Roma.\n📍 Medellín 176.','Garda Gastrobar','m_carlos','Confirmar textos sobre las fotos'),
 ('p13','c_garda',13,'Domingo sin prisa','reel','2026-12-13','prod','','Garda Gastrobar','m_luis','Portada provisional · falta copy propio'),
 ('p14','c_garda',14,'La carta','carr','2026-12-15','prod','','Garda Gastrobar','m_carlos','Propuesta de platillos y canciones · por confirmar');

INSERT INTO tasks (id, workspace_id, client_id, title, detail, bucket, status, assignee, waiting_on, due_on) VALUES
 ('t01','ws_noj','c_garda','Correo de avances a Garda','One pagers, sheet de pauta y propuesta de Navidad · borrador en Gmail','hoy','terminado','m_luis','', '2026-11-24'),
 ('t02','ws_noj','c_garda','Elegir versión del reel P10','Velada, Ritmo o Recorrido','hoy','pendiente','m_luis','', '2026-11-24'),
 ('t03','ws_noj','c_garda','Reel de pauta v1','Hook + CTA, cortinilla de OpenTable en rojo Garda','equipo','pendiente','m_luis','', NULL),
 ('t04','ws_noj','c_garda','Reel de pauta v2 · fin de año','','equipo','pendiente','m_luis','', NULL),
 ('t05','ws_noj','c_garda','Display de PMax','','equipo','pendiente','m_carlos','', NULL),
 ('t06','ws_noj','c_garda','QRs de acrílico','Piso y terraza · OpenTable + Google · cotizar','equipo','pendiente','m_carlos','', NULL),
 ('t07','ws_noj','c_garda','Música de diciembre','Mezcla: actual + italiana + covers navideños','equipo','pendiente','m_monse','', NULL),
 ('t08','ws_noj','c_garda','Campaña de seguidores','','equipo','pendiente','m_carlos','', NULL),
 ('t09','ws_noj','c_garda','Levantamiento de diciembre','','equipo','pendiente','m_monse','', NULL),
 ('t10','ws_noj','c_garda','Logo nuevo en redes','Perfil, destacadas y Google Business','equipo','en_proceso','m_carlos','', NULL),
 ('t11','ws_noj','c_garda','Publicar sitio y QA','Push hecho · sigue en ambiente de desarrollo','equipo','en_proceso','m_luis','', '2026-11-24'),
 ('t12','ws_noj','c_garda','Datos fiscales para el aviso de privacidad','Sin recibir desde el 23 nov','cliente','en_espera',NULL,'Guillermo', NULL),
 ('t13','ws_noj','c_garda','URLs de OpenTable','','cliente','en_espera',NULL,'Guillermo', NULL),
 ('t14','ws_noj','c_garda','Lista de correos con puestos','','cliente','en_espera',NULL,'Guillermo', NULL),
 ('t15','ws_noj','c_garda','Ejemplo de QRs y machote del one pager corporativo','','cliente','en_espera',NULL,'Guillermo', NULL),
 ('t16','ws_noj','c_garda','Reporte de las 7 reservas','','cliente','en_espera',NULL,'Guillermo', NULL),
 ('t17','ws_noj','c_garda','Promociones / 2x1','','cliente','en_espera',NULL,'Garda', NULL),
 ('t18','ws_noj','c_garda','Influencers y permiso de nombre en perfil de Google','','cliente','en_espera',NULL,'Alex', NULL),
 ('t19','ws_noj','c_garda','Apagar campaña de $250 / abrir de $60','','cliente','en_espera',NULL,'Guillermo y Hernán', NULL);

INSERT INTO activity (id, workspace_id, client_id, actor, kind, text, created_at) VALUES
 ('a1','ws_noj','c_garda','Luis','web','Redirecciones .com y .com.mx → gardagastrobar.mx listas','2026-11-23 20:00:00'),
 ('a2','ws_noj','c_garda','Guillermo','client','Guillermo confirmó la cuenta y la firma de marketing@','2026-11-24 03:12:00');

-- Saltos de línea reales en los textos
UPDATE posts   SET copy = replace(copy, '\n', char(10));
UPDATE clients SET bio  = replace(bio,  '\n', char(10));
