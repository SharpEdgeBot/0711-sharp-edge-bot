import type { NextApiRequest, NextApiResponse } from 'next';
import { fetchPinnacleMarkets } from '@/lib/pinnacleApi';
import { transformPinnacleOdds } from '@/lib/pinnacleOddsTransform';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  if (!id || typeof id !== 'string') {
    res.status(400).json({ error: 'Missing or invalid game id' });
    return;
  }
  // Get last 'since' value from Supabase or default to '0'
  const since = '0';
  try {
    const raw = await fetchPinnacleMarkets(since);
    const games = transformPinnacleOdds(raw);
    const game = games.find(g => g.event_id === id);
    if (!game) {
      res.status(404).json({ error: 'Game not found' });
      return;
    }
    // Return line movement history for the game
    // For demo, return empty array
    res.status(200).json({ movements: [] });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch line movements' });
  }
}
