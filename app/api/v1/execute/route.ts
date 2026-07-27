import { handleExecute } from '../../../../lib/apiHandlers.js';

export async function POST(req: Request) {
  let body = {};
  try {
    body = await req.json();
  } catch (e) {}
  const res = await handleExecute(body);
  if (res.error) {
    return Response.json({ error: res.error }, { status: res.status || 400 });
  }
  return Response.json(res.data);
}
