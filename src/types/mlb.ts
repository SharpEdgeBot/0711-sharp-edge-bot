// src/types/mlb.ts
export interface MLBGame {
  /**
   * For legacy compatibility with GameContext
   */
  teamsLegacy?: {
    home: {
      team: { id: number; name?: string };
      probablePitcher?: { fullName?: string; id?: number };
    };
    away: {
      team: { id: number; name?: string };
      probablePitcher?: { fullName?: string; id?: number };
    };
  };
  gamePk: number;
  date?: string; // UTC ISO
  eventId?: string;
  gameDate?: string;
  homeTeam: MLBTeam;
  awayTeam: MLBTeam;
  homePitcher?: MLBPitcher;
  awayPitcher?: MLBPitcher;
  venue: string;
  status: string;
  odds?: GameOdds[];
  oddsRecord?: Record<string, unknown>; // For legacy compatibility
  inning?: string;
  homeScore?: number;
  awayScore?: number;
  weather?: WeatherInfo;
  /**
   * For legacy compatibility, teams can be either normalized MLBTeam objects or legacy objects
   */
  teams?: {
    home: MLBTeam | { team: { id: number; name?: string }; probablePitcher?: { fullName?: string; id?: number } };
    away: MLBTeam | { team: { id: number; name?: string }; probablePitcher?: { fullName?: string; id?: number } };
  };
}

export interface MLBTeam {
  id: number;
  name: string;
  logo: string;
  record?: string;
  probablePitcher?: MLBPitcher;
}

export interface MLBPitcher {
  id: number;
  name: string;
  stats?: PitcherStats;
}

export interface PitcherStats {
  era?: number;
  whip?: number;
  k9?: number;
  // Add more as needed
}

export interface WeatherInfo {
  condition?: string | null;
  temp?: string | null;
  wind?: string | null;
}

export interface GameOdds {
  marketType: string;
  bookmaker: string;
  line: number;
  payout: number;
  lastUpdate: string; // UTC ISO
}
