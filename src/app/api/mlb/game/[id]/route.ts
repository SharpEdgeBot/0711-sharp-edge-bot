
import { NextRequest } from 'next/server';
import { fetchPinnacleOdds } from '@/lib/pinnacleApi';
import { transformPinnacleOdds } from '@/lib/pinnacleOddsTransform';

export const GET = async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id || typeof id !== 'string') {
    return new Response(JSON.stringify({ error: 'Missing or invalid game id' }), { status: 400 });
  }
  const since = '0';
  try {
    const raw = await fetchPinnacleOdds(Number(since));
    if (!raw) {
      return new Response(JSON.stringify({ error: 'Failed to fetch Pinnacle odds' }), { status: 500 });
    }
    const games = transformPinnacleOdds(raw);
    const game = games.find(g => g.gameId === id);
    if (!game) {
      return new Response(JSON.stringify({ error: 'Game not found' }), { status: 404 });
    }
    return new Response(JSON.stringify({ game }), { status: 200 });
  } catch (_error) {
    return new Response(JSON.stringify({ error: 'Failed to fetch MLB game' }), { status: 500 });
  }
};
