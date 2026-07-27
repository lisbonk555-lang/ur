import { handleReferrals } from '../../../../../lib/apiHandlers.js';

export async function GET(req: Request, { params }: { params: { bot_id: string } }) {
  const data = await handleReferrals(params.bot_id);
  return Response.json(data);
}
