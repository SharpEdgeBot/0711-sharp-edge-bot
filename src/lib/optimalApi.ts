import { OptimalBetEvent, OptimalBetMarket } from '@/types';

const OPTIMAL_BET_BASE = process.env.OPTIMAL_BETS_API_BASE_URL || 'https://api.optimal-bet.com/v1';
const API_KEY = process.env.OPTIMAL_BET_API_KEY || process.env.NEXT_PUBLIC_OPTIMAL_BET_API_KEY;

class OptimalBetApiError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = 'OptimalBetApiError';
  }
}

async function fetchWithAuth(
  url: string, 
  maxRetries = 5,
  delay = 2000
): Promise<Response> {
  if (!API_KEY) {
    throw new OptimalBetApiError('OptimalBet API key not configured');
  }
  
  let lastError: Error;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, {
        headers: {
          'X-API-Key': API_KEY,
          'accept': 'application/json',
        },
      });
      
      if (response.status === 401) {
        throw new OptimalBetApiError('Invalid API key', 401);
      }
      
      if (response.status === 429) {
        // Rate limited - exponential backoff (60 req/min limit)
        const waitTime = Math.min(delay * Math.pow(2, i), 32000);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        continue;
      }
      
      if (!response.ok) {
        throw new OptimalBetApiError(
          `HTTP ${response.status}: ${response.statusText}`,
          response.status
        );
      }
      
      return response;
    } catch (error) {
      lastError = error as Error;
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError!;
}

export async function fetchOptimalBetEvents(
  league = 'mlb',
  season = '2025',
  date?: string
): Promise<OptimalBetEvent[]> {
  const params = new URLSearchParams({
    league,
    season,
  });
  
  if (date) {
    params.append('date', date);
  }
  
  const url = `${OPTIMAL_BET_BASE}/events?${params}`;
  const response = await fetchWithAuth(url);
  const data = await response.json();
  return data.events || [];
}

export async function fetchGameOdds(eventId: string) {
  // Use the documented gamelines endpoint for MLB odds
  const url = `${OPTIMAL_BET_BASE}/gamelines/MLB?eventId=${eventId}`;
  const response = await fetchWithAuth(url);
  const data = await response.json();
  return data.offers || [];
}

export async function fetchGamelines(eventId: string, marketType = 'totals') {
  const params = new URLSearchParams({
    league: 'mlb',
    season: '2025',
    event_id: eventId,
    market_type: marketType,
  });
  
  const url = `${OPTIMAL_BET_BASE}/gamelines?${params}`;
  const response = await fetchWithAuth(url);
  const data = await response.json();
  return data.gamelines || [];
}

export async function fetchPlayerProps(eventId: string, playerId?: string) {
  const params = new URLSearchParams({
    league: 'mlb',
    season: '2025',
    event_id: eventId,
  });
  
  if (playerId) {
    params.append('player_id', playerId);
  }
  
  const url = `${OPTIMAL_BET_BASE}/player-props/values?${params}`;
  const response = await fetchWithAuth(url);
  const data = await response.json();
  return data.props || [];
}

export async function fetchSportsbooks() {
  const params = new URLSearchParams({
    league: 'mlb',
    season: '2025',
  });
  
  const url = `${OPTIMAL_BET_BASE}/sportsbooks?${params}`;
  const response = await fetchWithAuth(url);
  const data = await response.json();
  return data.sportsbooks || [];
}
