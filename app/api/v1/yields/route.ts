import { handleYields } from '../../../../lib/apiHandlers.js';

export async function GET() {
  const data = await handleYields();
  return Response.json(data);
}
