// Subscription tiers for Clerk RBAC
export type SubscriptionTier = 'free' | 'pro' | 'vip';

// Team and Pitcher stats interfaces
export interface TeamStats {
  name: string;
  offense: {
    avg: number;
    obp: number;
    slg: number;
    wRC_plus: number;
  };
  defense: {
    avg: number;
    obp: number;
    slg: number;
    wRC_plus: number;
  };
}

export interface PitcherStats {
  name?: string;
  era?: number;
  whip?: number;
  k9?: number;
  k_rate?: number;
  handedness?: string;
  vs_left?: {
    avg: number;
    obp: number;
    slg: number;
    wRC_plus: number;
  };
  vs_right?: {
    avg: number;
    obp: number;
    slg: number;
    wRC_plus: number;
  };
}
// Core MLB and betting data types

// Utility types for flexible API responses
export type ApiResponse<T = unknown> = {
  [key: string]: T;
};

export type FlexibleRecord = Record<string, unknown>;

export interface GameContext {
  game_id: string;
  game_date: string;
  start_time?: string;
  venue?: string;
  home_team?: TeamStats;
  away_team?: TeamStats;
  odds?: unknown[];
  pitcher_matchup?: {
    home_pitcher?: PitcherStats;
    away_pitcher?: PitcherStats;
    batter_vs_pitcher?: Record<string, unknown>;
  };
  recent_form?: {
    home?: unknown;
    away?: unknown;
  };
  head_to_head?: unknown;
  last_10_games?: {
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

// Removed invalid/duplicate index signatures and value/type confusion

// Removed deprecated OptimalBet interfaces - using Pinnacle only

// Feature Analysis Types
export interface FeatureImportance {
  feature_name: string;
  category: 'batting' | 'pitching' | 'team' | 'advanced';
  correlation: number;
  importance_score: number;
  markets: string[];
}
