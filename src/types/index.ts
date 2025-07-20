// Core MLB and betting data types

export interface GameContext {
  game_id: string;
  game_date: string;
  start_time: string;
  venue: string;
  home_team: TeamStats;
  away_team: TeamStats;
  odds: Record<string, any>; // Pinnacle odds markets
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
  weather?: any;
  venue_info?: any;
  status?: any;
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

// API Response Types
// ...existing code...
// ...existing code...

// Feature Analysis Types
export interface FeatureImportance {
  feature_name: string;
  category: 'batting' | 'pitching' | 'team' | 'advanced';
  correlation: number;
  importance_score: number;
  markets: string[];
}
