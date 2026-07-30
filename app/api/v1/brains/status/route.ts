import { handleBrainsStatus } from '../../../../../lib/apiHandlers.js';

export async function GET() {
  const data = await handleBrainsStatus();
  return Response.json(data);
}
