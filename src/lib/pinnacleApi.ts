// src/lib/pinnacleApi.ts
import { createClient } from '@supabase/supabase-js';

const PINNACLE_API_BASE_URL = process.env.PINNACLE_API_BASE_URL!;
const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY!;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Use a flexible type for PinnacleMarket to avoid empty interface lint warning
export type PinnacleMarket = Record<string, unknown>;

export interface PinnacleOddsResponse {
  events: PinnacleMarket[];
  last?: number;
  last_call?: number;
  sport_id?: number;
  sport_name?: string;
  since?: number;
}

export async function fetchPinnacleOdds(since?: number): Promise<PinnacleOddsResponse | null> {
  const url = `${PINNACLE_API_BASE_URL}/kit/v1/markets?event_type=prematch&sport_id=9&is_have_odds=true${since ? `&since=${since}` : ''}`;
  const options = {
    method: 'GET',
    headers: {
      'x-rapidapi-key': RAPIDAPI_KEY,
      'x-rapidapi-host': 'pinnacle-odds.p.rapidapi.com',
      'accept': 'application/json'
    }
  };

  let retries = 0;
  const MAX_RETRIES = 3;
  while (retries < MAX_RETRIES) {
    try {
      console.log('[Pinnacle API] Request URL:', url);
      const response = await fetch(url, options);
      if (!response.ok) {
        let errorBody = '';
        try {
          errorBody = await response.text();
        } catch (_e) {
          errorBody = '[Failed to read error body]';
        }
        console.error('[Pinnacle API] Error response:', {
          status: response.status,
          statusText: response.statusText,
          body: errorBody,
          url,
          options
        });
        if (response.status === 429) {
          const sleepTime = Math.pow(2, retries) * 1000;
          await new Promise(res => setTimeout(res, sleepTime));
          retries++;
          continue;
        }
        // Return a structured error object for non-OK responses
        return {
          events: [],
          last: undefined,
          sport_id: undefined,
          sport_name: undefined,
          since: undefined,
          // Attach error info for debugging
          error: true,
          status: response.status,
          statusText: response.statusText,
          body: errorBody,
          url
        } as PinnacleOddsResponse & {
          error: true;
          status: number;
          statusText: string;
          body: string;
          url: string;
        };
      }
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error('Pinnacle API did not return JSON. Content-Type:', contentType);
        return null;
      }
      await supabase.from('api_usage').insert({ date: new Date().toISOString(), calls_made: 1 });
      return await response.json() as PinnacleOddsResponse;
    } catch (error) {
      console.error('Pinnacle API fetch failed:', error, 'URL:', url);
      retries++;
      await new Promise(res => setTimeout(res, Math.pow(2, retries) * 1000));
    }
  }
  return null;
}
