// Catálogo de agentes de No'j OS.
// Cada agente es un "plugin": tiene ficha (para la tienda), dónde aparece en la app (surface),
// y si está disponible, cómo arma su contexto y qué devuelve.
// Agregar un agente = agregar un objeto aquí. El estado (prendido/apagado) vive por espacio en D1.

import { dayLabel } from './util.js';

const kindName = (k) => (k === 'reel' ? 'reel' : k === 'carr' ? 'carrusel' : 'foto');

export const AGENTS = [
  {
    id: 'copy', name: 'Redactor de copys', category: 'Contenido', status: 'disponible', price: 'Incluido',
    tagline: 'Propone tres copys para cada publicación con el tono de la marca.',
    surface: 'Publicación · Contenido',
    needs: 'post',
    async build({ post, client, input }) {
      return {
        max_tokens: 700,
        prompt: `Eres community manager de ${client.name} (${client.location || 'CDMX'}). Tono de marca: ${client.brand_tone || 'cercano y claro'}.
Escribe 3 opciones de copy para Instagram, en español de México, para esta publicación:
- Título interno: ${post.title}
- Formato: ${kindName(post.kind)}
- Fecha: ${dayLabel(post.publish_on)}
- Notas del equipo: ${post.notes || '—'}
- Copy actual: ${post.copy || '—'}
${input.instruction ? '- Indicación extra: ' + input.instruction : ''}
Cada opción máximo 3 líneas cortas, sin hashtags de relleno. Responde SOLO con JSON: {"options":["...","...","..."]}`,
      };
    },
    mock: () => ({ options: ['Opción de prueba 1: la noche empieza en la barra.', 'Opción de prueba 2: sobremesa larga, sin prisa.', 'Opción de prueba 3: reserva tu mesa para el fin.'] }),
  },
  {
    id: 'respuestas', name: 'Respuestas al cliente', category: 'Atención', status: 'disponible', price: 'Incluido',
    tagline: 'Cuando el cliente pide un cambio, redacta la respuesta y sugiere cómo resolverlo.',
    surface: 'Publicación · Comentarios',
    needs: 'post',
    async build({ post, client, comments, input }) {
      const thread = comments.map((c) => `${c.author_type === 'client' ? 'Cliente' : 'Equipo'} (${c.author_name}): ${c.body}`).join('\n') || '—';
      return {
        max_tokens: 700,
        prompt: `Trabajas en una agencia de contenido y le respondes a ${client.approver_name || 'el cliente'} de ${client.name}.
Publicación P${post.number} · ${post.title} (${kindName(post.kind)}, ${dayLabel(post.publish_on)}).
Copy actual: ${post.copy || '—'}
Conversación:
${thread}
${input.instruction ? 'Indicación del equipo: ' + input.instruction : ''}
Redacta 2 respuestas breves (máximo 3 líneas), amables y profesionales, en español de México, que confirmen el cambio y digan qué se va a ajustar.
Además da una sugerencia interna concreta para el equipo de cómo resolver el cambio.
Responde SOLO con JSON: {"options":["...","..."],"fix":"..."}`,
      };
    },
    mock: () => ({ options: ['¡Claro! Ajustamos el copy como comentas y te lo compartimos hoy mismo.', 'Gracias por el comentario. Hacemos el cambio y te mandamos la nueva versión para que la revises.'], fix: 'Acortar el copy y cambiar la foto de portada por una con más luz.' }),
  },
  {
    id: 'seguimiento', name: 'Seguimiento de pendientes', category: 'Atención', status: 'disponible', price: 'Incluido',
    tagline: 'Redacta el recordatorio para el cliente con todo lo que está esperando su respuesta.',
    surface: 'Cliente · Pendientes',
    needs: 'client',
    async build({ client, tasks, pending, input }) {
      const t = tasks.map((x) => `- ${x.title}${x.detail ? ' (' + x.detail + ')' : ''}`).join('\n') || '—';
      const p = pending.map((x) => `- P${x.number} · ${x.title} (${dayLabel(x.publish_on)})`).join('\n') || '—';
      return {
        max_tokens: 600,
        prompt: `Eres de la agencia que lleva las redes de ${client.name}. Escribe un mensaje de WhatsApp para ${client.approver_name || 'el cliente'}, en español de México,
amable, breve y fácil de contestar, recordando lo que esperamos de su parte.
Pendientes que esperan al cliente:
${t}
Publicaciones esperando su aprobación:
${p}
${input.instruction ? 'Indicación extra: ' + input.instruction : ''}
Sin saludo exagerado ni emojis de más. Máximo 8 líneas. Responde SOLO con JSON: {"message":"..."}`,
      };
    },
    mock: () => ({ message: 'Hola, Alex. Para avanzar con la quincena nos falta:\n- Confirmar horarios de diciembre\n- Aprobar P8 y P9 en el link\n¡Gracias!' }),
  },
  {
    id: 'campana', name: 'Planeador de campañas', category: 'Planeación', status: 'disponible', price: 'Incluido',
    tagline: 'Propone un bloque completo de publicaciones para una campaña: fechas, formatos, ideas, copys y lista de tomas.',
    surface: 'Cliente · Parrilla',
    needs: 'client',
    async build({ client, input, recent }) {
      const c = input.campaign;
      const DN = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
      const dates = [];
      for (let d = new Date(c.start + 'T12:00:00Z'); d <= new Date(c.end + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + 1)) {
        if (!c.days.length || c.days.includes(d.getUTCDay())) dates.push(d.toISOString().slice(0, 10) + ' (' + DN[d.getUTCDay()] + ')');
      }
      const prev = recent.map((p) => `- P${p.number} ${p.title} (${kindName(p.kind)})`).join('\n') || '—';
      return {
        max_tokens: 4000,
        prompt: `Eres estratega de contenido de una agencia en CDMX y planeas una campaña de Instagram para ${client.name} (${client.location || 'CDMX'}).
Tono de marca: ${client.brand_tone || 'cercano y claro'}.
Campaña: ${c.name || 'sin nombre'}
Objetivo y contexto: ${c.goal || '—'}
Fechas disponibles para publicar (usa solo estas): ${dates.join(', ') || c.start + ' a ' + c.end}
Número de publicaciones: ${c.count}
Mezcla de formatos deseada: ${c.mix || 'equilibrada entre foto, carrusel y reel'}
Indicaciones del equipo: ${c.notes || '—'}
Publicaciones recientes (no repitas ideas):
${prev}
Fechas que ya tienen publicación programada (evítalas salvo que las indicaciones digan lo contrario): ${recent.filter((p) => p.publish_on && p.publish_on >= c.start && p.publish_on <= c.end).map((p) => p.publish_on).join(', ') || 'ninguna'}

Diseña un bloque coherente: que tenga arranque, desarrollo y cierre, con variedad de formatos y una narrativa que se vea bien en el feed (filas de 3).
Para cada publicación da: fecha (de la lista), formato (foto, carr o reel), título interno corto, idea (2 líneas, qué se ve), copy listo en español de México (máximo 4 líneas, sin hashtags de relleno) y lista de tomas o material necesario.
Responde SOLO con JSON: {"summary":"...","posts":[{"date":"YYYY-MM-DD","kind":"foto|carr|reel","title":"...","idea":"...","copy":"...","shots":"..."}]}`,
      };
    },
    mock: () => ({ summary: 'Campaña de prueba en tres actos: anuncio, experiencia y cierre.', posts: [
      { date: '2026-12-01', kind: 'reel', title: 'Llega la Navidad a Garda', idea: 'Montaje de la decoración en la terraza, de día a noche.', copy: 'Diciembre ya se sienta a la mesa.\nReserva en el link de la bio.', shots: 'Time-lapse de decoración, detalles de luces, mesa puesta' },
      { date: '2026-12-03', kind: 'carr', title: 'Menú de temporada', idea: 'Cuatro platillos navideños en fondo cálido.', copy: 'Cuatro razones para quedarte a la sobremesa.', shots: '4 fotos cenitales de platillos, 1 de barra' },
      { date: '2026-12-05', kind: 'foto', title: 'Brindis de sábado', idea: 'Copas chocando con luces bokeh.', copy: 'Brindemos por lo que sí salió este año.', shots: 'Foto de copas con luces al fondo' },
    ] }),
  },
  {
    id: 'slides', name: 'Diseñador de carruseles', category: 'Contenido', status: 'disponible', price: 'Incluido',
    tagline: 'Arma los slides de diseño de un carrusel con el kit de marca: portada, textos, foto con texto y cierre.',
    surface: 'Publicación · Diseñar slides',
    needs: 'post',
    async build({ post, client, input }) {
      return {
        max_tokens: 1500,
        prompt: `Eres diseñador editorial y community manager de ${client.name} (${client.location || 'CDMX'}). Tono de marca: ${client.brand_tone || 'cercano y claro'}.
Propón el texto de un carrusel de Instagram de ${input.n} slides para esta publicación:
- Título interno: ${post.title}
- Copy: ${post.copy || '—'}
- Notas del equipo: ${post.notes || '—'}
${input.instruction ? '- Indicación extra: ' + input.instruction : ''}
Plantillas disponibles: "portada" (foto de fondo con título grande), "texto" (fondo de color con título y texto), "foto" (foto arriba con texto abajo), "cierre" (llamado a la acción).
El primer slide es "portada" y el último "cierre". Títulos de máximo 6 palabras, textos de máximo 22 palabras, en español de México, sin hashtags. "kicker" es una etiqueta corta opcional (2 o 3 palabras).
Responde SOLO con JSON: {"slides":[{"tpl":"portada|texto|foto|cierre","kicker":"...","title":"...","body":"..."}]}`,
      };
    },
    mock: () => ({ slides: [
      { tpl: 'portada', kicker: 'De la casa', title: 'Café para llevar', body: 'Todos los días desde las 8:00' },
      { tpl: 'foto', kicker: 'Espresso', title: 'Grano de temporada', body: 'Tostado medio, notas de cacao y panela.' },
      { tpl: 'texto', kicker: 'Para el camino', title: 'Pide en barra', body: 'Listo en cinco minutos, con la misma calma de la mesa.' },
      { tpl: 'cierre', kicker: '', title: 'Te esperamos', body: 'Medellín 176, Roma Norte' },
    ] }),
  },
  {
    id: 'etiquetas', name: 'Etiquetador de media', category: 'Material', status: 'disponible', price: 'Por uso',
    tagline: 'Mira cada toma del banco de media y le pone etiquetas, descripción, momento del día y si salen personas.',
    surface: 'Banco de media',
    needs: 'bank',
    build({ rows, images }) {
      const content = [];
      rows.forEach((r, i) => {
        content.push({ type: 'text', text: `Toma ${i + 1}: ${r.file_name} · cliente ${r.client_name || '—'} · ${r.shoot} · ${r.orientation || ''}${r.duration ? ' · ' + Math.round(r.duration) + ' s' : ''}` });
        if (images[i]) content.push({ type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: images[i] } });
      });
      content.push({ type: 'text', text: `Cada imagen es una hoja de contacto con 4 cuadros de la misma toma de video (con LUT aplicado), en orden de tiempo.
Para cada toma da, en español:
- tags: 8 a 12 etiquetas cortas en minúsculas (qué se ve, platillo o bebida, lugar del local, tipo de plano: detalle/medio/abierto, movimiento de cámara: fijo/paneo/travelling/tilt, luz, colores, sirve para: reel/historia/portada)
- description: una línea clara de qué pasa en la toma
- moment: día, tarde o noche
- people: 0 si no salen personas, 1 si salen de fondo o sin rostro, 2 si una persona es protagonista
Responde SOLO con JSON: {"items":[{"n":1,"tags":["..."],"description":"...","moment":"...","people":0}]}` });
      return { prompt: content, max_tokens: 400 + rows.length * 220 };
    },
    mock: () => ({ items: [1, 2, 3, 4, 5, 6].map((n) => ({ n, tags: ['prueba', 'barra', 'detalle', 'fijo'], description: 'Toma de prueba del etiquetador.', moment: 'día', people: 0 })) }),
  },
  // Próximos: aparecen en la tienda para medir interés y definir precio.
  { id: 'fechas', name: 'Fechas clave', category: 'Planeación', status: 'pronto', price: 'Por definir', tagline: 'Sugiere ideas de contenido según efemérides, temporadas y eventos de la ciudad.', surface: 'Parrilla' },
  { id: 'reporte', name: 'Reporte mensual', category: 'Resultados', status: 'pronto', price: 'Por definir', tagline: 'Arma el reporte de alcance y engagement de Instagram para el cliente.', surface: 'Cliente · Reportes', requires: 'Conectar Meta' },
  { id: 'whatsapp', name: 'Canal de WhatsApp', category: 'Atención', status: 'pronto', price: 'Por uso', tagline: 'Manda la parrilla y los recordatorios por WhatsApp y recibe respuestas en la app.', surface: 'Envíos', requires: 'WhatsApp Business API' },
  { id: 'publicador', name: 'Publicador', category: 'Operación', status: 'pronto', price: 'Por definir', tagline: 'Programa en Instagram lo aprobado, a la hora acordada.', surface: 'Parrilla', requires: 'Conectar Meta' },
  { id: 'propuestas', name: 'Propuestas comerciales', category: 'Ventas', status: 'pronto', price: 'Por definir', tagline: 'Genera la propuesta y cotización para un prospecto a partir de una plantilla.', surface: 'Ventas' },
  { id: 'stock', name: "No'j Motor · Stock", category: 'Operación', status: 'pronto', price: 'Por definir', tagline: 'Escanea material, escribe metadatos y sube clips a bancos de stock.', surface: 'Material' },
];

export const agentById = (id) => AGENTS.find((a) => a.id === id);

// Ejecuta un agente contra Claude y regresa { output, usage }.
export async function runModel(env, agent, prompt, max_tokens, model) {
  if (env.AI_MOCK === '1') return { output: agent.mock(), usage: { input_tokens: 0, output_tokens: 0 } };
  if (!env.ANTHROPIC_API_KEY) { const e = new Error('Los agentes todavía no están configurados (falta ANTHROPIC_API_KEY).'); e.status = 501; throw e; }
  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'x-api-key': env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
    body: JSON.stringify({ model: model || env.AI_MODEL || 'claude-sonnet-4-5', max_tokens, messages: [{ role: 'user', content: prompt }] }),
  });
  if (!r.ok) { const e = new Error('El agente no respondió: ' + (await r.text()).slice(0, 200)); e.status = 502; throw e; }
  const data = await r.json();
  const text = (data.content || []).map((x) => x.text || '').join('');
  let output;
  try { output = JSON.parse(text.slice(text.indexOf('{'), text.lastIndexOf('}') + 1)); } catch { output = { options: [text.trim()], message: text.trim() }; }
  return { output, usage: data.usage || {} };
}
