"use client";

import OddsCard from '@/components/OddsCard';
import { useEffect, useState } from 'react';

type OddsRaw = {
  gameId: string;
  teams?: [string, string];
  startTime: string;
  marketType: string;
  oddsValue: number;
};

type OddsGame = {
  eventId: string;
  home: string;
  away: string;
  startTime: string;
  moneyline: { home: number | null; away: number | null };
  spread: { line: number | null; home: number | null; away: number | null };
  total: { line: number | null; over: number | null; under: number | null };
  yrfi: { over: number | null; under: number | null };
};

function transformOdds(rawOdds: OddsRaw[]): OddsGame[] {
  const grouped: Record<string, OddsGame> = {};
  rawOdds.forEach((o: OddsRaw) => {
    const gameId = o.gameId;
    if (!grouped[gameId]) {
      grouped[gameId] = {
        eventId: gameId,
        home: o.teams?.[0] || '',
        away: o.teams?.[1] || '',
        startTime: o.startTime,
        moneyline: { home: null, away: null },
        spread: { line: null, home: null, away: null },
        total: { line: null, over: null, under: null },
        yrfi: { over: null, under: null },
      };
    }
    switch (o.marketType) {
      case 'moneyline_home':
        grouped[gameId].moneyline.home = o.oddsValue;
        break;
      case 'moneyline_away':
        grouped[gameId].moneyline.away = o.oddsValue;
        break;
      case 'spread_home_-1.5':
        grouped[gameId].spread.line = -1.5;
        grouped[gameId].spread.home = o.oddsValue;
        break;
      case 'spread_away_-1.5':
        grouped[gameId].spread.line = -1.5;
        grouped[gameId].spread.away = o.oddsValue;
        break;
      case 'total_over_8.5':
        grouped[gameId].total.line = 8.5;
        grouped[gameId].total.over = o.oddsValue;
        break;
      case 'total_under_8.5':
        grouped[gameId].total.line = 8.5;
        grouped[gameId].total.under = o.oddsValue;
        break;
      case 'yrfi_over':
        grouped[gameId].yrfi.over = o.oddsValue;
        break;
      case 'yrfi_under':
        grouped[gameId].yrfi.under = o.oddsValue;
        break;
      default:
        break;
    }
  });
  return Object.values(grouped);
}

export default function BettingLinesPage() {
  const [games, setGames] = useState<OddsGame[]>([]);

  useEffect(() => {
    fetch('/api/data/mlb/odds')
      .then(res => res.json())
      .then((rawOdds) => setGames(transformOdds(rawOdds)))
      .catch(() => setGames([]));
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-800 py-10 px-2">
      <div className="max-w-5xl mx-auto">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 mb-2 drop-shadow-lg">MLB Betting Lines</h1>
          <p className="text-lg text-gray-300 mb-2">Live Pinnacle mainline odds for today&apos;s MLB games</p>
        </div>
        {games.length === 0 ? (
          <div className="text-gray-400 text-center text-xl py-20 glassmorphic-card">No odds available.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {games.map((game, _idx) => (
              <div key={_idx} className="transition-transform duration-200 hover:scale-105">
                <OddsCard game={game} />
              </div>
            ))}
          </div>
        )}
      </div>
      <style jsx global>{`
        .glassmorphic-card {
          background: rgba(24, 24, 32, 0.7);
          box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
          backdrop-filter: blur(8px) saturate(180%);
          -webkit-backdrop-filter: blur(8px) saturate(180%);
          border-radius: 1.5rem;
          border: 1px solid rgba(255,255,255,0.08);
        }
      `}</style>
    </main>
  );
}
