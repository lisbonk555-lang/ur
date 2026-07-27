import { handleLeaderboard } from '../../../../lib/apiHandlers.js';

export async function GET() {
  const list = await handleLeaderboard();
  return Response.json(list);
}
