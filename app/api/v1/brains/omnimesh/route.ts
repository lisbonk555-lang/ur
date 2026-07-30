import { handleOmniMeshOpportunities, handleOmniMeshExecute } from '../../../../../lib/apiHandlers.js';

export async function GET() {
  const data = await handleOmniMeshOpportunities();
  return Response.json(data);
}

export async function POST(req: Request) {
  let body = {};
  try {
    body = await req.json();
  } catch (e) {}
  const res = await handleOmniMeshExecute(body);
  if (res.error) {
    return Response.json({ error: res.error }, { status: res.status || 400 });
  }
  return Response.json(res.data);
}
