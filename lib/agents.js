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
export async function runModel(env, agent, prompt, max_tokens) {
  if (env.AI_MOCK === '1') return { output: agent.mock(), usage: { input_tokens: 0, output_tokens: 0 } };
  if (!env.ANTHROPIC_API_KEY) { const e = new Error('Los agentes todavía no están configurados (falta ANTHROPIC_API_KEY).'); e.status = 501; throw e; }
  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'x-api-key': env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
    body: JSON.stringify({ model: env.AI_MODEL || 'claude-sonnet-4-5', max_tokens, messages: [{ role: 'user', content: prompt }] }),
  });
  if (!r.ok) { const e = new Error('El agente no respondió: ' + (await r.text()).slice(0, 200)); e.status = 502; throw e; }
  const data = await r.json();
  const text = (data.content || []).map((x) => x.text || '').join('');
  let output;
  try { output = JSON.parse(text.slice(text.indexOf('{'), text.lastIndexOf('}') + 1)); } catch { output = { options: [text.trim()], message: text.trim() }; }
  return { output, usage: data.usage || {} };
}
