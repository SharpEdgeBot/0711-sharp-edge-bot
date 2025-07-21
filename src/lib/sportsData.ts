// src/lib/sportsData.ts
// Use global fetch (no import needed)

export interface TeamStats {
  teamId: number;
  name: string;
  wOBA?: number;
  OPS?: number;
  runsPerGame?: number;
  runsAllowedPerGame?: number;
  defensiveEfficiency?: number;
}

export interface PlayerStats {
  playerId: number;
  name: string;
  ERA?: number;
  WHIP?: number;
  FIP?: number;
  K9?: number;
}

export interface BettingLine {
  marketType: string;
  bookmaker: string;
  lineValue: number;
  payout: number;
  lastUpdate: string;
}

export interface GameContext {
  gamePk: number;
  eventId: string;
  gameDate: string;
  homeTeam: TeamStats;
  awayTeam: TeamStats;
  homePitcher: PlayerStats;
  awayPitcher: PlayerStats;
  odds: Record<string, unknown>; // Pinnacle odds markets
  weather?: unknown;
  venue?: unknown;
  status?: unknown;
}

// Utility: Fetch MLB schedule for today
export async function fetchMLBSchedule(date: string) {
  const url = `https://statsapi.mlb.com/api/v1/schedule?gameDate=${date}`;
  const res = await fetch(url);
  if (!res.ok) {
    console.error(`MLB schedule error: ${res.status} for date ${date}`);
    return { dates: [] };
  }
  const data = await res.json();
  return (data && typeof data === 'object') ? data as { dates?: unknown[] } : { dates: [] };
}

// Utility: Fetch team stats
export async function fetchTeamStats(teamId: number, season: number) {
  const url = `https://statsapi.mlb.com/api/v1/teams/${teamId}/stats?stats=season&group=hitting&season=${season}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`MLB team stats error: ${res.status}`);
  const data = await res.json();
  return (data && typeof data === 'object') ? data : {};
}

// Utility: Fetch probable pitchers (from schedule)
export async function fetchProbablePitchers(gamePk: number) {
  const url = `https://statsapi.mlb.com/api/v1.1/game/${gamePk}/boxscore`;
  try {
    const res = await fetch(url);
    if (!res.ok) {
      if (res.status === 404) {
        console.error(`MLB boxscore 404 for gamePk ${gamePk}`);
        return {};
      }
      throw new Error(`MLB boxscore error: ${res.status}`);
    }
    const data = await res.json();
    return (data && typeof data === 'object') ? data : {};
  } catch (err) {
    console.error(`MLB boxscore fetch error for gamePk ${gamePk}:`, err);
    return {};
  }
}


// Utility: Fetch Pinnacle odds (already implemented in /lib/pinnacleApi and /lib/pinnacleOddsTransform)
// Odds should be fetched via fetchPinnacleOdds and transformPinnacleOdds only.

// Main: Build standardized game context
export async function buildGameContext({ gamePk, eventId, homeTeamId, awayTeamId, season, apiKey }: {
  gamePk: number;
  eventId: string;
  homeTeamId: number;
  awayTeamId: number;
  season: number;
  apiKey: string;
}): Promise<GameContext> {
  let homeStatsRaw: unknown = {};
  let awayStatsRaw: unknown = {};
  let homeStatsArr: unknown[] = [];
  let awayStatsArr: unknown[] = [];
  let homeTeam: TeamStats = { teamId: homeTeamId, name: '', wOBA: 0, OPS: 0, runsPerGame: 0, runsAllowedPerGame: 0, defensiveEfficiency: 0 };
  let awayTeam: TeamStats = { teamId: awayTeamId, name: '', wOBA: 0, OPS: 0, runsPerGame: 0, runsAllowedPerGame: 0, defensiveEfficiency: 0 };
  try {
    [homeStatsRaw, awayStatsRaw] = await Promise.all([
      fetchTeamStats(homeTeamId, season),
      fetchTeamStats(awayTeamId, season),
    ]);
    homeStatsArr = Array.isArray((homeStatsRaw as { stats?: unknown[] })?.stats)
      ? ((homeStatsRaw as { stats?: unknown[] }).stats ?? [])
      : [];
    awayStatsArr = Array.isArray((awayStatsRaw as { stats?: unknown[] })?.stats)
      ? ((awayStatsRaw as { stats?: unknown[] }).stats ?? [])
      : [];
    const getTeamName = (arr: unknown[]): string =>
      arr[0] && typeof arr[0] === 'object' && 'team' in arr[0] && typeof (arr[0] as { team?: { name?: string } }).team?.name === 'string'
        ? (arr[0] as { team?: { name?: string } }).team!.name!
        : '';
    type StatSplit = { stat?: Record<string, unknown> };
    const getStat = (arr: unknown[], key: string): number => {
      if (
        arr[0] && typeof arr[0] === 'object' &&
        'splits' in arr[0] &&
        Array.isArray((arr[0] as { splits?: StatSplit[] }).splits) &&
        (arr[0] as { splits?: StatSplit[] }).splits![0]?.stat &&
        typeof (arr[0] as { splits?: StatSplit[] }).splits![0].stat === 'object' &&
        key in (arr[0] as { splits?: StatSplit[] }).splits![0].stat!
      ) {
        return Number((arr[0] as { splits?: StatSplit[] }).splits![0].stat![key]);
      }
      return 0;
    };
    homeTeam = {
      teamId: homeTeamId,
      name: getTeamName(homeStatsArr),
      wOBA: getStat(homeStatsArr, 'wOBA'),
      OPS: getStat(homeStatsArr, 'ops'),
      runsPerGame: getStat(homeStatsArr, 'runsPerGame'),
      runsAllowedPerGame: getStat(homeStatsArr, 'runsAllowedPerGame'),
      defensiveEfficiency: getStat(homeStatsArr, 'defensiveEfficiency'),
    };
    awayTeam = {
      teamId: awayTeamId,
      name: getTeamName(awayStatsArr),
      wOBA: getStat(awayStatsArr, 'wOBA'),
      OPS: getStat(awayStatsArr, 'ops'),
      runsPerGame: getStat(awayStatsArr, 'runsPerGame'),
      runsAllowedPerGame: getStat(awayStatsArr, 'runsAllowedPerGame'),
      defensiveEfficiency: getStat(awayStatsArr, 'defensiveEfficiency'),
    };
  } catch (err) {
    // Log and continue with defaults
    console.error(`Team stats error for gamePk ${gamePk}:`, err);
  }
let boxscore: unknown = {};
interface ProbablePitcher {
  id?: number;
  fullName?: string;
  era?: number;
  whip?: number;
  fip?: number;
  k9?: number;
}
interface TeamsObj {
  home?: { probablePitcher?: ProbablePitcher };
  away?: { probablePitcher?: ProbablePitcher };
}
let teamsObj: TeamsObj = { home: { probablePitcher: {} }, away: { probablePitcher: {} } };
  let homePitcher: PlayerStats = { playerId: 0, name: '', ERA: 0, WHIP: 0, FIP: 0, K9: 0 };
  let awayPitcher: PlayerStats = { playerId: 0, name: '', ERA: 0, WHIP: 0, FIP: 0, K9: 0 };
  try {
    boxscore = await fetchProbablePitchers(gamePk);
    teamsObj = (boxscore as { teams?: TeamsObj })?.teams ?? { home: { probablePitcher: {} }, away: { probablePitcher: {} } };
    homePitcher = {
      playerId: teamsObj.home?.probablePitcher?.id ?? 0,
      name: teamsObj.home?.probablePitcher?.fullName ?? '',
      ERA: teamsObj.home?.probablePitcher?.era ?? 0,
      WHIP: teamsObj.home?.probablePitcher?.whip ?? 0,
      FIP: teamsObj.home?.probablePitcher?.fip ?? 0,
      K9: teamsObj.home?.probablePitcher?.k9 ?? 0,
    };
    awayPitcher = {
      playerId: teamsObj.away?.probablePitcher?.id ?? 0,
      name: teamsObj.away?.probablePitcher?.fullName ?? '',
      ERA: teamsObj.away?.probablePitcher?.era ?? 0,
      WHIP: teamsObj.away?.probablePitcher?.whip ?? 0,
      FIP: teamsObj.away?.probablePitcher?.fip ?? 0,
      K9: teamsObj.away?.probablePitcher?.k9 ?? 0,
    };
  } catch (err) {
    // Log and continue with defaults
    console.error(`Boxscore error for gamePk ${gamePk}:`, err);
  }
let oddsRaw: unknown = {};
let oddsArr: unknown[] = [];
let _bettingLines: BettingLine[] = [];
  // Odds logic should use Pinnacle odds only. Remove OptimalBet logic.
  const gameDataObj = (boxscore as { gameData?: { datetime?: { dateTime?: string } } })?.gameData ?? { datetime: { dateTime: '' } };
  return {
    gamePk,
    eventId,
    gameDate: gameDataObj.datetime?.dateTime ?? '',
    homeTeam,
    awayTeam,
    homePitcher,
    awayPitcher,
    odds: { pinnacle: _bettingLines },
  };
}
