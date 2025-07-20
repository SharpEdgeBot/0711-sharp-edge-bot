import type { NextApiRequest, NextApiResponse } from 'next';
import { fetchPinnacleMarkets } from '@/lib/pinnacleApi';
import { transformPinnacleOdds } from '@/lib/pinnacleOddsTransform';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Get last 'since' value from Supabase or default to '0'
  // For demo, use '0'
  const since = '0';
  try {
    const raw = await fetchPinnacleMarkets(since);
    const games = transformPinnacleOdds(raw);
    res.status(200).json({ games });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch MLB games' });
  }
}
