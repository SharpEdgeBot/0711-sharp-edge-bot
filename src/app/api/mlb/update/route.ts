
import { fetchPinnacleOdds } from '@/lib/pinnacleApi';
import { transformPinnacleOdds } from '@/lib/pinnacleOddsTransform';
import { supabase } from '@/lib/supabase';

export async function POST() {
  // Get last 'since' value from Supabase or default to '0'
  let since = 0;
  const { data: usageData } = await supabase
    .from('api_usage')
    .select('last_since')
    .order('date', { ascending: false })
    .limit(1);
  if (usageData && usageData.length > 0 && usageData[0].last_since) {
    since = Number(usageData[0].last_since);
  }
  try {
    const raw = await fetchPinnacleOdds(since);
    console.log('[MLB Update] Raw Pinnacle odds:', JSON.stringify(raw, null, 2));
    if (!raw) {
      throw new Error('Failed to fetch Pinnacle odds');
    }
    const oddsList = transformPinnacleOdds(raw);
    console.log('[MLB Update] Transformed odds:', JSON.stringify(oddsList, null, 2));

    // Upsert games
    const gameRows = oddsList.map(g => ({
      event_id: g.gameId,
      home_team: g.teams[0],
      away_team: g.teams[1],
      start_time: g.startTime,
      league: g.league
    }));
    console.log('[MLB Update] Upserting games:', JSON.stringify(gameRows, null, 2));
    await supabase.from('games').upsert(gameRows, { onConflict: 'event_id' });

    // Upsert odds and line movements
  const oddsRows: unknown[] = [];
  const movementRows: unknown[] = [];
    for (const g of oddsList) {
      // Fetch previous odds for line movement detection
      const { data: prevOdds } = await supabase
        .from('odds_current')
        .select('odds_value, updated_at')
        .eq('game_id', g.gameId)
        .eq('market_type', g.marketType)
        .eq('period', g.period)
        .order('updated_at', { ascending: false })
        .limit(1);
      const updated_at = g.lastUpdated || new Date().toISOString();
      oddsRows.push({
        game_id: g.gameId,
        market_type: g.marketType,
        period: g.period,
        odds_value: g.oddsValue,
        updated_at
      });
      if (
        prevOdds &&
        prevOdds.length > 0 &&
        JSON.stringify(prevOdds[0].odds_value) !== JSON.stringify(g.oddsValue)
      ) {
        movementRows.push({
          game_id: g.gameId,
          market_type: g.marketType,
          old_value: prevOdds[0].odds_value,
          new_value: g.oddsValue,
          movement_time: updated_at
        });
      }
    }
    console.log('[MLB Update] Upserting odds:', JSON.stringify(oddsRows, null, 2));
    if (oddsRows.length > 0) {
      await supabase.from('odds_current').upsert(oddsRows, { onConflict: 'game_id,market_type,period' });
    }
    console.log('[MLB Update] Inserting line movements:', JSON.stringify(movementRows, null, 2));
    if (movementRows.length > 0) {
      await supabase.from('line_movements').insert(movementRows);
    }

    // Update last_since value in api_usage
    const newSince = raw.since || since;
    await supabase.from('api_usage').upsert({
      date: new Date().toISOString().slice(0, 10),
      last_since: newSince
    }, { onConflict: 'date' });

  return new Response(JSON.stringify({ updated: oddsList.length, odds: oddsRows.length, movements: movementRows.length }), { status: 200 });
    } catch (_error) {
    return new Response(JSON.stringify({ error: 'Failed to update MLB odds' }), { status: 500 });
  }
}
