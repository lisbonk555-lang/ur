import { handleWellKnown } from '../../../lib/apiHandlers.js';

export async function GET() {
  const data = await handleWellKnown();
  return Response.json(data);
}
