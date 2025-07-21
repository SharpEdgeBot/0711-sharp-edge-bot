import { fetchPinnacleOdds } from '@/lib/pinnacleApi';
import { transformPinnacleOdds } from '@/lib/pinnacleOddsTransform';

export async function GET() {
  // TODO: Get last 'since' value from Supabase or default to 0
  const since = 0;
  const rawOdds = await fetchPinnacleOdds(since);
  if (!rawOdds) {
    return new Response(JSON.stringify({ error: 'Failed to fetch MLB games' }), { status: 500 });
  }
  const games = transformPinnacleOdds(rawOdds);
  return new Response(JSON.stringify({ games }), { status: 200 });
}
