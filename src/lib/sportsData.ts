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
  marketType: 'moneyline' | 'runline' | 'total';
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
  bettingLines: BettingLine[];
  weather?: any;
  venue?: any;
  status?: any;
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
  return (data && typeof data === 'object') ? data as { dates?: any[] } : { dates: [] };
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

// Utility: Fetch betting odds from Optimal-Bet.com
export async function fetchBettingLines(eventId: string, apiKey: string) {
  const url = `https://api.optimal-bet.com/v1/gamelines/MLB?eventId=${eventId}`;
  try {
    const res = await fetch(url, {
      headers: {
        accept: 'application/json',
        'X-API-Key': apiKey,
      },
    });
    if (!res.ok) {
      if (res.status === 400) {
        console.error(`OptimalBet odds 400 for eventId ${eventId}`);
        return {};
      }
      throw new Error(`OptimalBet odds error: ${res.status}`);
    }
    const data = await res.json();
    return (data && typeof data === 'object') ? data : {};
  } catch (err) {
    console.error(`OptimalBet odds fetch error for eventId ${eventId}:`, err);
    return {};
  }
}

// Main: Build standardized game context
export async function buildGameContext({ gamePk, eventId, homeTeamId, awayTeamId, season, apiKey }: {
  gamePk: number;
  eventId: string;
  homeTeamId: number;
  awayTeamId: number;
  season: number;
  apiKey: string;
}): Promise<GameContext> {
  let homeStatsRaw = {};
  let awayStatsRaw = {};
  let homeStatsArr: any[] = [];
  let awayStatsArr: any[] = [];
  let homeTeam: TeamStats = { teamId: homeTeamId, name: '', wOBA: 0, OPS: 0, runsPerGame: 0, runsAllowedPerGame: 0, defensiveEfficiency: 0 };
  let awayTeam: TeamStats = { teamId: awayTeamId, name: '', wOBA: 0, OPS: 0, runsPerGame: 0, runsAllowedPerGame: 0, defensiveEfficiency: 0 };
  try {
    [homeStatsRaw, awayStatsRaw] = await Promise.all([
      fetchTeamStats(homeTeamId, season),
      fetchTeamStats(awayTeamId, season),
    ]);
    homeStatsArr = Array.isArray((homeStatsRaw as any)?.stats) ? (homeStatsRaw as any).stats : [];
    awayStatsArr = Array.isArray((awayStatsRaw as any)?.stats) ? (awayStatsRaw as any).stats : [];
    homeTeam = {
      teamId: homeTeamId,
      name: homeStatsArr[0]?.team?.name ?? '',
      wOBA: homeStatsArr[0]?.splits?.[0]?.stat?.wOBA ?? 0,
      OPS: homeStatsArr[0]?.splits?.[0]?.stat?.ops ?? 0,
      runsPerGame: homeStatsArr[0]?.splits?.[0]?.stat?.runsPerGame ?? 0,
      runsAllowedPerGame: homeStatsArr[0]?.splits?.[0]?.stat?.runsAllowedPerGame ?? 0,
      defensiveEfficiency: homeStatsArr[0]?.splits?.[0]?.stat?.defensiveEfficiency ?? 0,
    };
    awayTeam = {
      teamId: awayTeamId,
      name: awayStatsArr[0]?.team?.name ?? '',
      wOBA: awayStatsArr[0]?.splits?.[0]?.stat?.wOBA ?? 0,
      OPS: awayStatsArr[0]?.splits?.[0]?.stat?.ops ?? 0,
      runsPerGame: awayStatsArr[0]?.splits?.[0]?.stat?.runsPerGame ?? 0,
      runsAllowedPerGame: awayStatsArr[0]?.splits?.[0]?.stat?.runsAllowedPerGame ?? 0,
      defensiveEfficiency: awayStatsArr[0]?.splits?.[0]?.stat?.defensiveEfficiency ?? 0,
    };
  } catch (err) {
    // Log and continue with defaults
    console.error(`Team stats error for gamePk ${gamePk}:`, err);
  }
  let boxscore: any = {};
  let teamsObj: any = { home: { probablePitcher: {} }, away: { probablePitcher: {} } };
  let homePitcher: PlayerStats = { playerId: 0, name: '', ERA: 0, WHIP: 0, FIP: 0, K9: 0 };
  let awayPitcher: PlayerStats = { playerId: 0, name: '', ERA: 0, WHIP: 0, FIP: 0, K9: 0 };
  try {
    boxscore = await fetchProbablePitchers(gamePk);
    teamsObj = (boxscore as any)?.teams ?? { home: { probablePitcher: {} }, away: { probablePitcher: {} } };
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
  let oddsRaw: any = {};
  let oddsArr: any[] = [];
  let bettingLines: BettingLine[] = [];
  try {
    oddsRaw = await fetchBettingLines(eventId, apiKey);
    oddsArr = Array.isArray((oddsRaw as any)?.markets) ? (oddsRaw as any).markets : [];
    bettingLines = oddsArr.map((m: any) => ({
      marketType: m.marketType,
      bookmaker: m.bookmaker,
      lineValue: m.lineValue,
      payout: m.payout,
      lastUpdate: m.lastUpdate,
    }));
  } catch (err) {
    // Log and continue with empty bettingLines
    console.error(`Betting lines error for gamePk ${gamePk}, eventId ${eventId}:`, err);
    bettingLines = [];
  }
  const gameDataObj = (boxscore as any)?.gameData ?? { datetime: { dateTime: '' } };
  return {
    gamePk,
    eventId,
    gameDate: gameDataObj.datetime?.dateTime ?? '',
    homeTeam,
    awayTeam,
    homePitcher,
    awayPitcher,
    bettingLines,
  };
}
