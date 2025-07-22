import type { MLBGame, MLBTeam, MLBPitcher, PitcherStats, WeatherInfo, GameOdds } from '@/types/mlb';

export function normalizeMLBTeam(raw: any): MLBTeam {
  return {
    id: raw.team?.id || raw.id,
    name: raw.team?.name || raw.name || '',
    logo: raw.team?.logo || raw.logo || '',
    record: raw.record?.summary || '',
    probablePitcher: raw.probablePitcher ? normalizeMLBPitcher(raw.probablePitcher) : undefined,
  };
}

export function normalizeMLBPitcher(raw: any): MLBPitcher {
  return {
    id: raw.id,
    name: raw.fullName || raw.name || '',
    stats: raw.stats ? normalizePitcherStats(raw.stats) : undefined,
  };
}

export function normalizePitcherStats(raw: any): PitcherStats {
  return {
    era: raw.era,
    whip: raw.whip,
    k9: raw.k9,
    // Add more as needed
  };
}

export function normalizeWeather(raw: any): WeatherInfo {
  return {
    condition: raw.condition,
    temp: raw.temp,
    wind: raw.wind,
  };
}

export function normalizeGameOdds(raw: any): GameOdds {
  return {
    marketType: raw.marketType,
    bookmaker: raw.bookmaker,
    line: raw.line,
    payout: raw.payout,
    lastUpdate: new Date(raw.lastUpdate).toISOString(),
  };
}
