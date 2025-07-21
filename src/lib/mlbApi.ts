

const MLB_API_BASE = process.env.MLB_API_BASE_URL || 'https://statsapi.mlb.com/api/v1';

class MLBApiError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = 'MLBApiError';
  }
}

async function fetchWithRetry(
  url: string, 
  maxRetries = 5, 
  delay = 200
): Promise<Response> {
  let lastError: Error;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url);
      
      if (response.status === 429) {
        // Rate limited - exponential backoff
        const waitTime = Math.min(delay * Math.pow(2, i), 32000);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        continue;
      }
      
      if (!response.ok) {
        throw new MLBApiError(
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

export async function fetchMLBSchedule(
  startDate: string,
  endDate: string,
  teamId?: number
): Promise<unknown> {
  const params = new URLSearchParams({
    sportId: '1',
    startDate,
    endDate,
    gameType: 'R', // Regular season
    season: '2025',
  });
  
  if (teamId) {
    params.append('teamId', teamId.toString());
  }
  
  const url = `${MLB_API_BASE}/schedule?${params}`;
  const response = await fetchWithRetry(url);
  return response.json();
}

export async function fetchMLBGame(gamePk: number) {
  const url = `${MLB_API_BASE}/game/${gamePk}/feed/live`;
  const response = await fetchWithRetry(url);
  return response.json();
}

export async function fetchTeamStats(teamId: number, season = 2025) {
  const url = `${MLB_API_BASE}/teams/${teamId}/stats?season=${season}&stats=season`;
  const response = await fetchWithRetry(url);
  return response.json();
}

export async function fetchPlayerStats(
  personId: number, 
  season = 2025, 
  statGroup = 'hitting'
) {
  const url = `${MLB_API_BASE}/people/${personId}/stats?season=${season}&stats=season&group=${statGroup}&sportId=1`;
  const response = await fetchWithRetry(url);
  return response.json();
}

export async function fetchPitcherStats(personId: number, season = 2025) {
  return fetchPlayerStats(personId, season, 'pitching');
}

export async function fetchBatterVsPitcher(gamePk: number) {
  // This would be a more complex query combining multiple API calls
  // to get batter vs pitcher historical data
  const _game = await fetchMLBGame(gamePk);
  // Implementation would involve looking up historical matchups
  return {};
}

export async function fetchRecentForm(teamId: number, games = 10) {
  const endDate = new Date().toISOString().split('T')[0];
  const startDate = new Date(Date.now() - (games * 24 * 60 * 60 * 1000))
    .toISOString().split('T')[0];
  
  const _schedule = await fetchMLBSchedule(startDate, endDate, teamId);
  
  // Process recent games to calculate form stats
  return {
    last_5_games: {
      wins: 0,
      losses: 0,
      runs_scored: 0,
      runs_allowed: 0,
    },
    last_10_games: {
      wins: 0,
      losses: 0,
      runs_scored: 0,
      runs_allowed: 0,
    },
  };
}

export async function fetchHeadToHead(_homeTeamId: number, _awayTeamId: number) {
  // Implementation would involve historical matchup analysis
  return {
    games_played: 0,
    home_wins: 0,
    away_wins: 0,
    avg_total_runs: 0,
    last_meeting: {
      date: '',
      score: '',
      winner: '',
    },
  };
}
