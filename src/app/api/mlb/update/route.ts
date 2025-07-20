import type { NextApiRequest, NextApiResponse } from 'next';
import { fetchPinnacleMarkets } from '@/lib/pinnacleApi';
import { transformPinnacleOdds } from '@/lib/pinnacleOddsTransform';
import { supabase } from '@/lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // This endpoint is intended for scheduled odds updates (cron/webhook)
  // Get last 'since' value from Supabase or default to '0'
  let since = '0';
  const { data: usageData } = await supabase
    .from('api_usage')
    .select('last_since')
    .order('date', { ascending: false })
    .limit(1);
  if (usageData && usageData.length > 0 && usageData[0].last_since) {
    since = usageData[0].last_since;
  }
  try {
    const raw = await fetchPinnacleMarkets(since);
    const games = transformPinnacleOdds(raw);

    // Upsert games
    const gameRows = games.map(g => ({
      event_id: g.event_id,
      home_team: g.home_team,
      away_team: g.away_team,
      start_time: g.start_time,
      league: g.league,
      status: g.status
    }));
  await supabase.from('games').upsert(gameRows, { onConflict: 'event_id' });

    // Upsert odds and line movements
    let oddsRows: any[] = [];
    let movementRows: any[] = [];
    for (const g of games) {
      for (const [market_type, market] of Object.entries(g.markets || {})) {
        for (const [period, odds_value] of Object.entries(market)) {
          // Fetch previous odds for line movement detection
          const { data: prevOdds } = await supabase
            .from('odds_current')
            .select('odds_value, updated_at')
            .eq('game_id', g.event_id)
            .eq('market_type', market_type)
            .eq('period', period)
            .order('updated_at', { ascending: false })
            .limit(1);
          const updated_at = new Date().toISOString();
          oddsRows.push({
            game_id: g.event_id,
            market_type,
            period,
            odds_value,
            updated_at
          });
          if (
            prevOdds &&
            prevOdds.length > 0 &&
            JSON.stringify(prevOdds[0].odds_value) !== JSON.stringify(odds_value)
          ) {
            movementRows.push({
              game_id: g.event_id,
              market_type,
              old_value: prevOdds[0].odds_value,
              new_value: odds_value,
              movement_time: updated_at
            });
          }
        }
      }
    }
    if (oddsRows.length > 0) {
  await supabase.from('odds_current').upsert(oddsRows, { onConflict: 'game_id,market_type,period' });
    }
    if (movementRows.length > 0) {
      await supabase.from('line_movements').insert(movementRows);
    }

    // Update last_since value in api_usage
    const newSince = raw.since || since;
    await supabase.from('api_usage').upsert({
      date: new Date().toISOString().slice(0, 10),
      last_since: newSince
    }, { onConflict: 'date' });

    res.status(200).json({ updated: games.length, odds: oddsRows.length, movements: movementRows.length });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update MLB odds' });
  }
}
