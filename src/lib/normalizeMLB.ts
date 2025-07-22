import type { MLBTeam, MLBPitcher, PitcherStats, WeatherInfo, GameOdds } from '@/types/mlb';

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
  return {
    id: typeof obj.team === 'object' && obj.team && typeof (obj.team as any).id === 'number' ? (obj.team as any).id : (typeof obj.id === 'number' ? obj.id : 0),
    name: typeof obj.team === 'object' && obj.team && typeof (obj.team as any).name === 'string' ? (obj.team as any).name : (typeof obj.name === 'string' ? obj.name : ''),
    logo: typeof obj.team === 'object' && obj.team && typeof (obj.team as any).logo === 'string' ? (obj.team as any).logo : (typeof obj.logo === 'string' ? obj.logo : ''),
    record: typeof obj.record === 'object' && obj.record && typeof (obj.record as any).summary === 'string' ? (obj.record as any).summary : '',
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
