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
}

// Utility: Fetch MLB schedule for today
export async function fetchMLBSchedule(date: string) {
  const url = `https://statsapi.mlb.com/api/v1/schedule?gameDate=${date}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`MLB schedule error: ${res.status}`);
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
  const res = await fetch(url);
  if (!res.ok) throw new Error(`MLB boxscore error: ${res.status}`);
  const data = await res.json();
  return (data && typeof data === 'object') ? data : {};
}

// Utility: Fetch betting odds from Optimal-Bet.com
export async function fetchBettingLines(eventId: string, apiKey: string) {
  const url = `https://api.optimal-bet.com/v1/gamelines/MLB?eventId=${eventId}`;
  const res = await fetch(url, {
    headers: {
      accept: 'application/json',
      'X-API-Key': apiKey,
    },
  });
  if (!res.ok) throw new Error(`OptimalBet odds error: ${res.status}`);
  const data = await res.json();
  return (data && typeof data === 'object') ? data : {};
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
  // Fetch team stats
  const [homeStatsRaw, awayStatsRaw] = await Promise.all([
    fetchTeamStats(homeTeamId, season),
    fetchTeamStats(awayTeamId, season),
  ]);
  // Defensive: fallback to empty arrays if missing
  const homeStatsArr = Array.isArray((homeStatsRaw as any)?.stats) ? (homeStatsRaw as any).stats : [];
  const awayStatsArr = Array.isArray((awayStatsRaw as any)?.stats) ? (awayStatsRaw as any).stats : [];
  const homeTeam: TeamStats = {
    teamId: homeTeamId,
    name: homeStatsArr[0]?.team?.name ?? '',
    wOBA: homeStatsArr[0]?.splits?.[0]?.stat?.wOBA ?? 0,
    OPS: homeStatsArr[0]?.splits?.[0]?.stat?.ops ?? 0,
    runsPerGame: homeStatsArr[0]?.splits?.[0]?.stat?.runsPerGame ?? 0,
    runsAllowedPerGame: homeStatsArr[0]?.splits?.[0]?.stat?.runsAllowedPerGame ?? 0,
    defensiveEfficiency: homeStatsArr[0]?.splits?.[0]?.stat?.defensiveEfficiency ?? 0,
  };
  const awayTeam: TeamStats = {
    teamId: awayTeamId,
    name: awayStatsArr[0]?.team?.name ?? '',
    wOBA: awayStatsArr[0]?.splits?.[0]?.stat?.wOBA ?? 0,
    OPS: awayStatsArr[0]?.splits?.[0]?.stat?.ops ?? 0,
    runsPerGame: awayStatsArr[0]?.splits?.[0]?.stat?.runsPerGame ?? 0,
    runsAllowedPerGame: awayStatsArr[0]?.splits?.[0]?.stat?.runsAllowedPerGame ?? 0,
    defensiveEfficiency: awayStatsArr[0]?.splits?.[0]?.stat?.defensiveEfficiency ?? 0,
  };
  // Fetch probable pitchers
  const boxscore = await fetchProbablePitchers(gamePk);
  const teamsObj = (boxscore as any)?.teams ?? { home: { probablePitcher: {} }, away: { probablePitcher: {} } };
  const homePitcher: PlayerStats = {
    playerId: teamsObj.home?.probablePitcher?.id ?? 0,
    name: teamsObj.home?.probablePitcher?.fullName ?? '',
    ERA: teamsObj.home?.probablePitcher?.era ?? 0,
    WHIP: teamsObj.home?.probablePitcher?.whip ?? 0,
    FIP: teamsObj.home?.probablePitcher?.fip ?? 0,
    K9: teamsObj.home?.probablePitcher?.k9 ?? 0,
  };
  const awayPitcher: PlayerStats = {
    playerId: teamsObj.away?.probablePitcher?.id ?? 0,
    name: teamsObj.away?.probablePitcher?.fullName ?? '',
    ERA: teamsObj.away?.probablePitcher?.era ?? 0,
    WHIP: teamsObj.away?.probablePitcher?.whip ?? 0,
    FIP: teamsObj.away?.probablePitcher?.fip ?? 0,
    K9: teamsObj.away?.probablePitcher?.k9 ?? 0,
  };
  // Fetch betting lines
  const oddsRaw = await fetchBettingLines(eventId, apiKey);
  const oddsArr = Array.isArray((oddsRaw as any)?.markets) ? (oddsRaw as any).markets : [];
  const bettingLines: BettingLine[] = oddsArr.map((m: any) => ({
    marketType: m.marketType,
    bookmaker: m.bookmaker,
    lineValue: m.lineValue,
    payout: m.payout,
    lastUpdate: m.lastUpdate,
  }));
  // Build context
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
