import { GameContext, TeamStats, PitcherStats, FormStats, H2HStats } from '@/types';
import { 
  fetchMLBGame, 
  fetchTeamStats, 
  fetchPitcherStats,
  fetchRecentForm,
  fetchHeadToHead 
} from '@/lib/mlbApi';
import { fetchPinnacleMarkets } from '@/lib/pinnacleApi';
import { transformPinnacleOdds } from '@/lib/pinnacleOddsTransform';
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
    const since = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const rawMarkets = await fetchPinnacleMarkets(since);
    const pinnacleMarkets = transformPinnacleOdds(rawMarkets);

    // Find odds for this game
    const oddsForGame = pinnacleMarkets.find(m => m.event_id === gameId);

    // Build the game context using Pinnacle odds only
    const context: GameContext = {
      game_id: gameId,
      game_date: game.datetime,
      start_time: game.datetime,
      venue: gameData.gameData.venue.name,
      home_team: processTeamStats(teams.home, homeStats),
      away_team: processTeamStats(teams.away, awayStats),
      odds: oddsForGame ? oddsForGame.markets : {},
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

function processTeamStats(team: any, stats: any): TeamStats {
  const teamStats = stats.stats?.[0]?.splits?.[0]?.stat || {};
  
  return {
    name: team.name,
    offense: {
      avg: parseFloat(teamStats.avg || '0'),
      obp: parseFloat(teamStats.obp || '0'),
      slg: parseFloat(teamStats.slg || '0'),
      wRC_plus: 100, // Would calculate from advanced stats
    },
    defense: {
      avg: parseFloat(teamStats.era || '0'),
      obp: parseFloat(teamStats.whip || '0'),
      slg: 0,
      wRC_plus: 100,
    },
  };
}

function processPitcherStats(stats: any): PitcherStats {
  const pitcherStats = stats.stats?.[0]?.splits?.[0]?.stat || {};
  
  return {
    name: stats.people?.[0]?.fullName || 'Unknown',
    era: parseFloat(pitcherStats.era || '0'),
    k_rate: parseFloat(pitcherStats.strikeoutsPer9Inn || '0'),
    handedness: stats.people?.[0]?.pitchHand?.code || 'R',
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

function processMoneylineOdds(odds: any[]): Record<string, number> {
  const result: Record<string, number> = {};
  
  odds.forEach(market => {
    market.outcomes?.forEach((outcome: any) => {
      if (outcome.team) {
        result[outcome.team] = outcome.odds;
      }
    });
  });
  
  return result;
}

function processTotalOdds(totals: any[]): Record<string, number> {
  const result: Record<string, number> = {};
  
  totals.forEach(total => {
    if (total.line) {
      result[`${total.line}_over`] = total.odds.over;
      result[`${total.line}_under`] = total.odds.under;
    }
  });
  
  return result;
}
