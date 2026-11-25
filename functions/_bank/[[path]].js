// Las vistas previas del banco de media no son públicas: solo se sirven por /api/team/bank/file (con login).
export const onRequest = () => new Response('No encontrado', { status: 404 });
