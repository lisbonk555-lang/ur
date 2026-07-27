import { handleGetBots } from '../../../../lib/apiHandlers.js';

export async function GET() {
  const list = await handleGetBots();
  return Response.json(list);
}
