import { handleDocs } from '../../../../lib/apiHandlers.js';

export async function GET() {
  const docs = handleDocs();
  return Response.json(docs);
}
