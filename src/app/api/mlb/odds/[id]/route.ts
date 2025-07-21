import { fetchPinnacleOdds } from '@/lib/pinnacleApi';
import { transformPinnacleOdds } from '@/lib/pinnacleOddsTransform';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  if (!id) {
    return new Response(JSON.stringify({ error: 'Missing or invalid game id' }), { status: 400 });
  }
  // TODO: Get last 'since' value from Supabase or default to 0
  const since = 0;
  const rawOdds = await fetchPinnacleOdds(since);
  if (!rawOdds) {
    return new Response(JSON.stringify({ error: 'Failed to fetch MLB odds' }), { status: 500 });
  }
  const oddsList = transformPinnacleOdds(rawOdds);
  const gameOdds = oddsList.find(g => g.gameId === id);
  if (!gameOdds) {
    return new Response(JSON.stringify({ error: 'Game not found' }), { status: 404 });
  }
  return new Response(JSON.stringify({ odds: gameOdds }), { status: 200 });
}
