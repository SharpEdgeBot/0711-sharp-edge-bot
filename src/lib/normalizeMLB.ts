import type { MLBTeam, MLBPitcher, PitcherStats, WeatherInfo, GameOdds } from '@/types/mlb';
import type { MLBGame } from '@/types/mlb';

export function normalizeMLBTeam(raw: unknown): MLBTeam {
  if (!raw || typeof raw !== 'object') {
    return {
      id: 0,
      name: '',
      logo: '',
      record: '',
      probablePitcher: undefined,
    };
  }
  const obj = raw as Record<string, unknown>;
  let id = 0;
  let name = '';
  let logo = '';
  if (obj.team && typeof obj.team === 'object') {
    const t = obj.team as { id?: number; name?: string; logo?: string };
    id = typeof t.id === 'number' ? t.id : 0;
    name = typeof t.name === 'string' ? t.name : '';
    logo = typeof t.logo === 'string' ? t.logo : '';
  } else {
    id = typeof obj.id === 'number' ? obj.id as number : 0;
    name = typeof obj.name === 'string' ? obj.name as string : '';
    logo = typeof obj.logo === 'string' ? obj.logo as string : '';
  }
  return {
    id,
    name,
    logo,
    record: obj.record && typeof (obj.record as { summary?: string }).summary === 'string' ? (obj.record as { summary: string }).summary : '',
    probablePitcher: obj.probablePitcher ? normalizeMLBPitcher(obj.probablePitcher) : undefined,
  };
}

export function normalizeMLBPitcher(raw: unknown): MLBPitcher {
  if (!raw || typeof raw !== 'object') {
    return {
      id: 0,
      name: '',
      stats: undefined,
    };
  }
  const obj = raw as Record<string, unknown>;
  return {
    id: typeof obj.id === 'number' ? obj.id : 0,
    name: typeof obj.fullName === 'string' ? obj.fullName : (typeof obj.name === 'string' ? obj.name : ''),
    stats: obj.stats ? normalizePitcherStats(obj.stats) : undefined,
  };
}

export function normalizePitcherStats(raw: unknown): PitcherStats {
  if (!raw || typeof raw !== 'object') {
    return {
      era: undefined,
      whip: undefined,
      k9: undefined,
    };
  }
  const obj = raw as Record<string, unknown>;
  return {
    era: typeof obj.era === 'number' ? obj.era : undefined,
    whip: typeof obj.whip === 'number' ? obj.whip : undefined,
    k9: typeof obj.k9 === 'number' ? obj.k9 : undefined,
  };
}

export function normalizeWeather(raw: unknown): WeatherInfo {
  if (!raw || typeof raw !== 'object') {
    return {
      condition: undefined,
      temp: undefined,
      wind: undefined,
    };
  }
  const obj = raw as Record<string, unknown>;
  return {
    condition: typeof obj.condition === 'string' ? obj.condition : undefined,
    temp: typeof obj.temp === 'string' ? obj.temp : undefined,
    wind: typeof obj.wind === 'string' ? obj.wind : undefined,
  };
}

export function normalizeGameOdds(raw: unknown): GameOdds {
  if (!raw || typeof raw !== 'object') {
    return {
      marketType: '',
      bookmaker: '',
      line: 0,
      payout: 0,
      lastUpdate: '',
    };
  }
  const obj = raw as Record<string, unknown>;
  return {
    marketType: typeof obj.marketType === 'string' ? obj.marketType : '',
    bookmaker: typeof obj.bookmaker === 'string' ? obj.bookmaker : '',
    line: typeof obj.line === 'number' ? obj.line : 0,
    payout: typeof obj.payout === 'number' ? obj.payout : 0,
    lastUpdate: typeof obj.lastUpdate === 'string' ? new Date(obj.lastUpdate).toISOString() : '',
  };
}

export function normalizeMLBGame(raw: unknown): MLBGame {
  if (!raw || typeof raw !== 'object') {
    return {
      gamePk: 0,
      homeTeam: normalizeMLBTeam(undefined),
      awayTeam: normalizeMLBTeam(undefined),
      venue: '',
      status: '',
    };
  }
  const obj = raw as Record<string, unknown>;
  return {
    gamePk: typeof obj.gamePk === 'number' ? obj.gamePk : 0,
    date: typeof obj.date === 'string' ? obj.date : undefined,
    eventId: typeof obj.eventId === 'string' ? obj.eventId : undefined,
    gameDate: typeof obj.gameDate === 'string' ? obj.gameDate : undefined,
    homeTeam: obj.homeTeam ? normalizeMLBTeam(obj.homeTeam) : normalizeMLBTeam(undefined),
    awayTeam: obj.awayTeam ? normalizeMLBTeam(obj.awayTeam) : normalizeMLBTeam(undefined),
    homePitcher: obj.homePitcher ? normalizeMLBPitcher(obj.homePitcher) : undefined,
    awayPitcher: obj.awayPitcher ? normalizeMLBPitcher(obj.awayPitcher) : undefined,
    venue: typeof obj.venue === 'string' ? obj.venue : '',
    status: typeof obj.status === 'string' ? obj.status : '',
    odds: Array.isArray(obj.odds) ? (obj.odds as unknown[]).map(normalizeGameOdds) : undefined,
    oddsRecord: obj.oddsRecord && typeof obj.oddsRecord === 'object' ? obj.oddsRecord as Record<string, unknown> : undefined,
    inning: typeof obj.inning === 'string' ? obj.inning : undefined,
    homeScore: typeof obj.homeScore === 'number' ? obj.homeScore : undefined,
    awayScore: typeof obj.awayScore === 'number' ? obj.awayScore : undefined,
    weather: obj.weather ? normalizeWeather(obj.weather) : undefined,
    teams: obj.teams && typeof obj.teams === 'object' ? obj.teams as MLBGame['teams'] : undefined,
    teamsLegacy: obj.teamsLegacy && typeof obj.teamsLegacy === 'object' ? obj.teamsLegacy as MLBGame['teamsLegacy'] : undefined,
  };
}
