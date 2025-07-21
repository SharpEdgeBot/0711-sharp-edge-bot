import { GameContext, TeamStats, PitcherStats } from '@/types';
import { 
  fetchMLBGame, 
  fetchTeamStats, 
  fetchPitcherStats,
  fetchRecentForm,
  fetchHeadToHead 
} from '@/lib/mlbApi';
import { fetchPinnacleOdds } from '@/lib/pinnacleApi';
import { transformPinnacleOdds } from '@/lib/pinnacleOddsTransform';
import type { NormalizedOdds as _NormalizedOdds } from '@/lib/pinnacleOddsTransform';
import { getCachedGameContext, setCachedGameContext } from '@/lib/redis';

export async function buildGameContext(gameId: string): Promise<GameContext> {
  // Check cache first
  const cached = await getCachedGameContext(gameId);
  if (cached) {
    return JSON.parse(cached as string);
  }

  try {
    // Fetch game data from MLB API
    const gameData = await fetchMLBGame(parseInt(gameId));
    const game = gameData.gameData.game;
    const teams = gameData.gameData.teams;

    // Fetch team stats in parallel
    const [homeStats, awayStats] = await Promise.all([
      fetchTeamStats(teams.home.id),
      fetchTeamStats(teams.away.id),
    ]);

    // Extract starting pitchers
    const homePitcher = gameData.liveData.boxscore.teams.home.pitchers[0];
    const awayPitcher = gameData.liveData.boxscore.teams.away.pitchers[0];

    // Fetch pitcher stats in parallel
    const [homePitcherStats, awayPitcherStats] = await Promise.all([
      fetchPitcherStats(homePitcher),
      fetchPitcherStats(awayPitcher),
    ]);

    // Fetch recent form and head-to-head
    const [homeForm, awayForm, h2h] = await Promise.all([
      fetchRecentForm(teams.home.id),
      fetchRecentForm(teams.away.id),
      fetchHeadToHead(teams.home.id, teams.away.id),
    ]);

    // Fetch Pinnacle odds
    const rawMarkets = await fetchPinnacleOdds();
    const pinnacleMarkets = rawMarkets ? transformPinnacleOdds(rawMarkets) : [];
    // Find odds for this game (NormalizedOdds uses gameId)
    const oddsForGame = pinnacleMarkets.filter(m => m.gameId === gameId);
    // Build the game context using Pinnacle odds only
    const context: GameContext = {
      game_id: gameId,
      game_date: game.datetime,
      start_time: game.datetime,
      venue: gameData.gameData.venue.name,
      home_team: processTeamStats(teams.home, homeStats),
      away_team: processTeamStats(teams.away, awayStats),
      odds: oddsForGame,
      pitcher_matchup: {
        home_pitcher: processPitcherStats(homePitcherStats),
        away_pitcher: processPitcherStats(awayPitcherStats),
        batter_vs_pitcher: {}, // Would process historical matchups
      },
      recent_form: {
        home: homeForm,
        away: awayForm,
      },
      head_to_head: h2h,
    };
    
    // Cache the result
    await setCachedGameContext(gameId, context, 600); // 10 minute TTL
    
    return context;
  } catch (error) {
    console.error('Error building game context:', error);
    throw new Error('Failed to build game context');
  }
}


function processTeamStats(team: unknown, stats: unknown): TeamStats {
  let teamStats: Record<string, unknown> = {};
  if (
    stats && typeof stats === 'object' &&
    'stats' in stats && Array.isArray((stats as { stats?: unknown[] }).stats)
  ) {
    const statsArr = (stats as { stats?: unknown[] }).stats!;
    if (
      statsArr[0] && typeof statsArr[0] === 'object' &&
      'splits' in statsArr[0] &&
      Array.isArray((statsArr[0] as { splits?: unknown[] }).splits)
    ) {
      const splits = (statsArr[0] as { splits?: Array<{ stat?: Record<string, unknown> }> }).splits;
      if (splits && splits[0]?.stat && typeof splits[0].stat === 'object') {
        teamStats = splits[0].stat;
      }
    }
  }
  return {
    name: (team && typeof team === 'object' && 'name' in team && typeof (team as { name?: string }).name === 'string') ? (team as { name: string }).name : '',
    offense: {
      avg: parseFloat((teamStats.avg as string) || '0'),
      obp: parseFloat((teamStats.obp as string) || '0'),
      slg: parseFloat((teamStats.slg as string) || '0'),
      wRC_plus: 100, // Would calculate from advanced stats
    },
    defense: {
      avg: parseFloat((teamStats.era as string) || '0'),
      obp: parseFloat((teamStats.whip as string) || '0'),
      slg: 0,
      wRC_plus: 100,
    },
  };
}


function processPitcherStats(stats: unknown): PitcherStats {
  let pitcherStats: Record<string, unknown> = {};
  let name = 'Unknown';
  let handedness: 'L' | 'R' = 'R';
  if (
    stats && typeof stats === 'object' &&
    'stats' in stats && Array.isArray((stats as { stats?: unknown[] }).stats)
  ) {
    const statsArr = (stats as { stats?: unknown[] }).stats!;
    if (
      statsArr[0] && typeof statsArr[0] === 'object' &&
      'splits' in statsArr[0] &&
      Array.isArray((statsArr[0] as { splits?: unknown[] }).splits)
    ) {
      const splits = (statsArr[0] as { splits?: Array<{ stat?: Record<string, unknown> }> }).splits;
      if (splits && splits[0]?.stat && typeof splits[0].stat === 'object') {
        pitcherStats = splits[0].stat;
      }
    }
  }
  if (
    stats && typeof stats === 'object' &&
    'people' in stats && Array.isArray((stats as { people?: unknown[] }).people) &&
    (stats as { people?: unknown[] }).people![0]
  ) {
    const person = (stats as { people?: Array<{ fullName?: string; pitchHand?: { code?: string } }> }).people![0];
    if (person.fullName && typeof person.fullName === 'string') {
      name = person.fullName;
    }
    if (person.pitchHand && typeof person.pitchHand.code === 'string' && (person.pitchHand.code === 'L' || person.pitchHand.code === 'R')) {
      handedness = person.pitchHand.code;
    }
  }
  return {
    name,
    era: parseFloat((pitcherStats.era as string) || '0'),
    k_rate: parseFloat((pitcherStats.strikeoutsPer9Inn as string) || '0'),
    handedness,
    vs_left: {
      avg: 0.250, // Would get from splits
      obp: 0.320,
      slg: 0.400,
      wRC_plus: 100,
    },
    vs_right: {
      avg: 0.250,
      obp: 0.320,
      slg: 0.400,
      wRC_plus: 100,
    },
  };
}

function _processMoneylineOdds(odds: Array<{ outcomes?: Array<{ team?: string; odds: number }> }>): Record<string, number> {
  const result: Record<string, number> = {};
  
  odds.forEach(market => {
    market.outcomes?.forEach((outcome) => {
      if (outcome.team) {
        result[outcome.team] = outcome.odds;
      }
    });
  });
  
  return result;
}

function _processTotalOdds(totals: Array<{ line?: string; odds: { over: number; under: number } }>): Record<string, number> {
  const result: Record<string, number> = {};
  
  totals.forEach(total => {
    if (total.line) {
      result[`${total.line}_over`] = total.odds.over;
      result[`${total.line}_under`] = total.odds.under;
    }
  });
  
  return result;
}
