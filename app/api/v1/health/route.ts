import { handleHealth } from '../../../../lib/apiHandlers.js';

export async function GET() {
  const data = await handleHealth();
  return Response.json(data);
}
