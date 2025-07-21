// src/lib/pinnacleOddsSnapshot.ts
import { fetchPinnacleOdds } from './pinnacleApi';
import { transformPinnacleOdds } from './pinnacleOddsTransform';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export async function snapshotPinnacleOddsAndLimits() {
  const rawOdds = await fetchPinnacleOdds(0);
  if (!rawOdds) throw new Error('Failed to fetch Pinnacle odds');
  const oddsList = transformPinnacleOdds(rawOdds);
  const now = new Date().toISOString();
  // Insert each odds record with timestamp
  for (const odds of oddsList) {
    // You may want to include bet limits if available in odds or rawOdds
    await supabase.from('pinnacle_odds_snapshots').insert({
      ...odds,
      snapshot_time: now,
      // bet_limit: odds.betLimit, // Add this if you extract bet limits below
    });
  }
}

// To schedule: use a cron job or serverless scheduler to call snapshotPinnacleOddsAndLimits every 5-10 minutes.
