import React from 'react';
// import GameCard from './GameCard';
import OddsCard from './OddsCard';

import type { TeamStats, PitcherStats } from '@/types';

interface UnifiedGameCardProps {
  game: {
    homeTeam: string;
    awayTeam: string;
    date?: string;
    startTime?: string;
    stadium?: string;
    homeRecord?: { wins: number; losses: number; l5?: { wins: number; losses: number } };
    awayRecord?: { wins: number; losses: number; l5?: { wins: number; losses: number } };
    homeProbablePitcher?: string;
    homeProbablePitcherEra?: number | null;
    homeProbablePitcherWhip?: number | null;
    awayProbablePitcher?: string;
    awayProbablePitcherEra?: number | null;
    awayProbablePitcherWhip?: number | null;
    weather?: { temp?: number | null; wind?: string | null; condition?: string | null };
  };
  odds: {
    eventId?: string;
    moneyline?: { home: number | null; away: number | null };
    spread?: { line: number | null; home: number | null; away: number | null };
    total?: { line: number | null; over: number | null; under: number | null };
    yrfi?: { over: number | null; under: number | null };
  };
}

// Unified card combines GameCard and OddsCard into one styled card
const UnifiedGameCard: React.FC<UnifiedGameCardProps> = ({ game, odds }) => {
  // Merge all context into a single game object for OddsCard
  const ensureL5 = (rec: { wins: number; losses: number; l5?: { wins: number; losses: number } }) => {
    return {
      ...rec,
      l5: rec.l5 ?? { wins: 0, losses: 0 },
    };
  };
  const unifiedGame = {
    eventId: odds?.eventId ?? '',
    home: game.homeTeam,
    away: game.awayTeam,
    startTime: typeof game.startTime === 'string' ? game.startTime : (game.date ?? ''),
    venue: game.stadium,
    homeRecord: game.homeRecord ? ensureL5(game.homeRecord) : undefined,
    awayRecord: game.awayRecord ? ensureL5(game.awayRecord) : undefined,
    probablePitchers: {
      home: game.homeProbablePitcher ? {
        name: game.homeProbablePitcher,
        era: game.homeProbablePitcherEra ?? null,
        whip: game.homeProbablePitcherWhip ?? null,
      } : null,
      away: game.awayProbablePitcher ? {
        name: game.awayProbablePitcher,
        era: game.awayProbablePitcherEra ?? null,
        whip: game.awayProbablePitcherWhip ?? null,
      } : null,
    },
    weather: typeof game.weather === 'object' && game.weather !== null ? {
      temp: (game.weather as any).temp ?? null,
      wind: (game.weather as any).wind ?? null,
      condition: (game.weather as any).condition ?? null,
    } : { temp: null, wind: null, condition: null },
    moneyline: odds?.moneyline ?? { home: null, away: null },
    spread: odds?.spread ?? { line: null, home: null, away: null },
    total: odds?.total ?? { line: null, over: null, under: null },
    yrfi: odds?.yrfi ?? { over: null, under: null },
  };
  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl shadow-lg border border-gray-700 p-6 mb-6 flex flex-col transition hover:scale-[1.01] hover:shadow-xl">
      <OddsCard game={unifiedGame} />
    </div>
  );
};

export default UnifiedGameCard;
