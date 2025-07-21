import React from 'react';

interface OddsCardProps {
  game: {
    eventId: string;
    home: string;
    away: string;
    startTime: string;
    moneyline: { home: number | null; away: number | null };
    spread: { line: number | null; home: number | null; away: number | null };
    total: { line: number | null; over: number | null; under: number | null };
    yrfi: { over: number | null; under: number | null };
  };
}

export default function OddsCard({ game }: OddsCardProps) {
  return (
    <div className="glassmorphic-card mb-4 p-6 rounded-2xl shadow-xl border border-zinc-800 text-white">
      <div className="flex items-center justify-between mb-2">
        <div className="text-lg font-bold tracking-wide gradient-text">{game.away} <span className="text-zinc-400 font-normal">@</span> {game.home}</div>
        <div className="text-xs text-zinc-400 font-mono">{new Date(game.startTime).toLocaleString()}</div>
      </div>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="bg-zinc-900/60 rounded-lg p-3">
          <div className="font-semibold text-blue-300 mb-1">Moneyline</div>
          <div className="flex justify-between">
            <span className="text-zinc-300">Home:</span> <span>{game.moneyline.home ?? '-'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-300">Away:</span> <span>{game.moneyline.away ?? '-'}</span>
          </div>
        </div>
        <div className="bg-zinc-900/60 rounded-lg p-3">
          <div className="font-semibold text-purple-300 mb-1">Spread {game.spread.line !== null ? game.spread.line : '-'}</div>
          <div className="flex justify-between">
            <span className="text-zinc-300">Home:</span> <span>{game.spread.home ?? '-'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-300">Away:</span> <span>{game.spread.away ?? '-'}</span>
          </div>
        </div>
        <div className="bg-zinc-900/60 rounded-lg p-3">
          <div className="font-semibold text-pink-300 mb-1">Total {game.total.line !== null ? game.total.line : '-'}</div>
          <div className="flex justify-between">
            <span className="text-zinc-300">Over:</span> <span>{game.total.over ?? '-'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-300">Under:</span> <span>{game.total.under ?? '-'}</span>
          </div>
        </div>
        <div className="bg-zinc-900/60 rounded-lg p-3">
          <div className="font-semibold text-cyan-300 mb-1">YRFI</div>
          <div className="flex justify-between">
            <span className="text-zinc-300">Over:</span> <span>{game.yrfi.over ?? '-'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-300">Under:</span> <span>{game.yrfi.under ?? '-'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
