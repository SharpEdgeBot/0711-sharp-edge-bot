// src/types/odds.ts
export interface GameOdds {
  marketType: string;
  bookmaker: string;
  line: number;
  payout: number;
  lastUpdate: string; // UTC ISO
}
