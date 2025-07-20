// src/lib/pinnacleApi.ts
import { transformPinnacleOdds } from './pinnacleOddsTransform';

import { supabase } from './supabase';

export interface PinnacleMarket {
  event_id: string;
  home_team: string;
  away_team: string;
  start_time: string;
  league: string;
  status: string;
  periods: Record<string, any>;
  markets: Record<string, any>;
}

export async function fetchPinnacleMarkets(since: string) {
  const url = `https://pinnacle-odds.p.rapidapi.com/kit/v1/markets?event_type=prematch&sport_id=9&since=${since}&is_have_odds=true`;
  const options = {
    method: 'GET',
    headers: {
      'x-rapidapi-key': process.env.RAPIDAPI_KEY!,
      'x-rapidapi-host': 'pinnacle-odds.p.rapidapi.com',
      accept: 'application/json'
    }
  };
  try {
    const res = await fetch(url, options);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    // Log API usage in Supabase
    await supabase.from('api_usage').upsert({
      date: new Date().toISOString().slice(0, 10),
      calls_made: 1
    });
    return await res.json();
  } catch (error) {
    // Fallback to cached odds if quota exceeded or error
    console.error('API request failed:', error);
    // ...fetch from Supabase or static JSON fallback
    throw error;
  }
}
