import { handleRegisterBot } from '../../../../lib/apiHandlers.js';

export async function POST(req: Request) {
  let body = {};
  try {
    body = await req.json();
  } catch (e) {}
  const res = await handleRegisterBot(body);
  if (res.error) {
    return Response.json({ error: res.error, bot_id: res.bot_id }, { status: res.status || 400 });
  }
  return Response.json(res.data, { status: 201 });
}
