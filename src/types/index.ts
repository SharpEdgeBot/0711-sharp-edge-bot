// Core MLB and betting data types

// Utility types for flexible API responses
export type ApiResponse<T = unknown> = {
  [key: string]: T;
};

export type FlexibleRecord = Record<string, unknown>;

export interface GameContext {
  game_id: string;
  game_date: string;
  start_time: string;
  venue: string;
  home_team: TeamStats;
  away_team: TeamStats;
  odds: import('@/lib/pinnacleOddsTransform').NormalizedOdds[];
  pitcher_matchup: {
    home_pitcher: PitcherStats;
    away_pitcher: PitcherStats;
    batter_vs_pitcher: Record<string, BatterStats[]>;
  };
  recent_form: {
    home: FormStats;
    away: FormStats;
  };
  head_to_head: H2HStats;
  weather?: Record<string, string>; // Updated weather type
  venue_info?: Record<string, string>; // Updated venue_info type
  status?: string; // Updated status type
}

export interface TeamStats {
  name: string;
  offense: Statline;
  defense: Statline;
}

export interface PitcherStats {
  name: string;
  era: number;
  k_rate: number;
  handedness: "L" | "R";
  vs_left: Statline;
  vs_right: Statline;
}

export interface BatterStats {
  name: string;
  avg: number;
  obp: number;
  slg: number;
  wRC_plus: number;
}

export interface Statline {
  avg: number;
  obp: number;
  slg: number;
  wRC_plus: number;
}

export interface FormStats {
  last_5_games: {
    wins: number;
    losses: number;
    runs_scored: number;
    runs_allowed: number;
  };
  last_10_games: {
    wins: number;
    losses: number;
    runs_scored: number;
    runs_allowed: number;
  };
}

export interface H2HStats {
  games_played: number;
  home_wins: number;
  away_wins: number;
  avg_total_runs: number;
  last_meeting: {
    date: string;
    score: string;
    winner: string;
  };
}

// Betting Market Types
export interface MoneylineOdds {
  home: number;
  away: number;
  sportsbook: string;
  timestamp: string;
}

export interface TotalOdds {
  line: number;
  over: number;
  under: number;
  sportsbook: string;
  timestamp: string;
}

export interface F5Odds {
  home: number;
  away: number;
  draw: number;
  sportsbook: string;
  timestamp: string;
}

export interface YRFIOdds {
  yes: number;
  no: number;
  sportsbook: string;
  timestamp: string;
}

export interface PlayerProp {
  player_id: string;
  player_name: string;
  prop_type: string;
  line: number;
  over_odds: number;
  under_odds: number;
  sportsbook: string;
  timestamp: string;
}

export interface PinnacleMarket {
  market_id: string;
  market_type: string;
  odds: number;
  line?: number;
  sportsbook: string;
  [key: string]: string | number | boolean | undefined;
}

// User & Subscription Types
export type SubscriptionTier = 'free' | 'pro' | 'vip';

export interface UserUsage {
  user_id: string;
  usage_date: string;
  message_count: number;
  subscription_tier: SubscriptionTier;
}

export interface ChatMessage {
  id: string;
  user_id: string;
  content: string;
  response: string;
  timestamp: string;
  game_context?: GameContext;
}


// OptimalBet API Types
export interface OptimalBetEvent {
  event_id: string;
  league: string;
  season: string;
  date: string;
  home_team: string;
  away_team: string;
  venue?: string;
  status?: string;
  [key: string]: string | number | boolean | undefined; // Updated flexible type
}

export interface OptimalBetMarket {
  market_id: string;
  event_id: string;
  market_type: string;
  sportsbook: string;
  line: number;
  odds: number;
  is_mainline?: boolean;
  altLine?: boolean;
  [key: string]: string | number | boolean | undefined; // Updated flexible type
}

export interface OptimalBetOffer {
  offer_id: string;
  is_mainline: boolean;
  altLine?: boolean;
  odds: number;
  sportsbook: string;
  [key: string]: string | number | boolean | undefined;
}

export interface OptimalBetGameline {
  line_id: string;
  is_mainline: boolean;
  altLine?: boolean;
  market_type: string;
  odds: number;
  sportsbook: string;
  [key: string]: string | number | boolean | undefined;
}

export interface OptimalBetProp {
  prop_id: string;
  player_id: string;
  player_name: string;
  prop_type: string;
  line: number;
  over_odds: number;
  under_odds: number;
  sportsbook: string;
  [key: string]: string | number | boolean | undefined;
}

export interface OptimalBetSportsbook {
  sportsbook_id: string;
  name: string;
  url: string;
  [key: string]: string | number | boolean | undefined;
}

// Feature Analysis Types
export interface FeatureImportance {
  feature_name: string;
  category: 'batting' | 'pitching' | 'team' | 'advanced';
  correlation: number;
  importance_score: number;
  markets: string[];
}
