import { handleStats } from '../../../../lib/apiHandlers.js';

export async function GET() {
  const stats = await handleStats();
  return Response.json(stats);
}
