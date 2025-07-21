import { promises as fs } from 'fs';
import path from 'path';
import { fetchPinnacleOdds } from '@/lib/pinnacleApi';
import { transformPinnacleOdds } from '@/lib/pinnacleOddsTransform';

export const POST = async () => {
  try {
    // 1. Fetch Pinnacle odds
    const rawOdds = await fetchPinnacleOdds();
    if (!rawOdds) {
      return new Response(JSON.stringify({ status: 'error', message: 'No Pinnacle odds found.' }), { status: 500 });
    }
    // 2. Transform odds to mainline format
    const normalizedOdds = transformPinnacleOdds(rawOdds);
    // 3. Write to public/data/mlb-odds-mainlines.json
    const oddsFilePath = path.join(process.cwd(), 'public', 'data', 'mlb-odds-mainlines.json');
    await fs.writeFile(oddsFilePath, JSON.stringify(normalizedOdds, null, 2), 'utf-8');
    return new Response(JSON.stringify({ status: 'ok', count: normalizedOdds.length }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ status: 'error', message: (err as Error)?.message || 'Unknown error' }), { status: 500 });
  }
};
