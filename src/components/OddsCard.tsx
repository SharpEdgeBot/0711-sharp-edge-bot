import React from 'react';

interface OddsCardProps {
  game: {
    eventId: string;
    home: string;
    away: string;
    startTime: string;
    venue?: string;
    homeRecord?: { wins: number; losses: number; l5: { wins: number; losses: number } };
    awayRecord?: { wins: number; losses: number; l5: { wins: number; losses: number } };
    probablePitchers?: {
      home: { name: string; era: number | null; whip: number | null } | null;
      away: { name: string; era: number | null; whip: number | null } | null;
    };
    weather?: { temp: number | null; wind: string | null; condition: string | null };
    moneyline: { home: number | null; away: number | null };
    spread: { line: number | null; home: number | null; away: number | null };
    total: { line: number | null; over: number | null; under: number | null };
    yrfi: { over: number | null; under: number | null };
  };
}

export default function OddsCard({ game }: OddsCardProps) {
  if (!game || !game.home || !game.away || !game.moneyline || !game.spread || !game.total || !game.yrfi) {
    return (
      <div className="glassmorphic-card mb-4 p-6 rounded-2xl shadow-xl border border-gradient-to-br from-blue-900 via-zinc-900 to-purple-900 text-white">
        <div className="text-lg font-bold tracking-wide gradient-text">Odds unavailable</div>
      </div>
    );
  }
  return (
    <div className="glassmorphic-card mb-4 px-3 py-4 md:p-6 rounded-2xl shadow-xl border border-gradient-to-br from-blue-900 via-zinc-900 to-purple-900 text-white transition-all duration-200 hover:scale-[1.02] hover:shadow-2xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-2 gap-2">
        <div className="text-base md:text-lg font-extrabold tracking-wide bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent drop-shadow-md">
          {game.away} <span className="text-zinc-400 font-normal">@</span> {game.home}
        </div>
        <div className="text-xs md:text-sm text-zinc-400 font-mono whitespace-nowrap">{new Date(game.startTime).toLocaleString()}</div>
      </div>
      {game.venue && <div className="mb-2 text-xs md:text-sm text-zinc-400 font-mono italic">{game.venue}</div>}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs md:text-sm mb-4">
        {game.homeRecord && typeof game.homeRecord === 'object' && typeof game.homeRecord.wins === 'number' && typeof game.homeRecord.losses === 'number' && game.homeRecord.l5 && typeof game.homeRecord.l5.wins === 'number' && typeof game.homeRecord.l5.losses === 'number' ? (
          <div className="rounded-lg bg-gradient-to-br from-blue-950 via-zinc-900 to-blue-900 p-2">
            <div className="font-semibold text-blue-300">Home Record</div>
            <div className="font-mono text-zinc-200">{game.homeRecord.wins}-{game.homeRecord.losses} <span className="text-xs text-zinc-400">(L5: {game.homeRecord.l5.wins}-{game.homeRecord.l5.losses})</span></div>
          </div>
        ) : (
          <div className="rounded-lg bg-gradient-to-br from-blue-950 via-zinc-900 to-blue-900 p-2">
            <div className="font-semibold text-blue-300">Home Record</div>
            <div className="font-mono text-zinc-400">N/A</div>
          </div>
        )}
        {game.awayRecord && typeof game.awayRecord === 'object' && typeof game.awayRecord.wins === 'number' && typeof game.awayRecord.losses === 'number' && game.awayRecord.l5 && typeof game.awayRecord.l5.wins === 'number' && typeof game.awayRecord.l5.losses === 'number' ? (
          <div className="rounded-lg bg-gradient-to-br from-purple-950 via-zinc-900 to-purple-900 p-2">
            <div className="font-semibold text-purple-300">Away Record</div>
            <div className="font-mono text-zinc-200">{game.awayRecord.wins}-{game.awayRecord.losses} <span className="text-xs text-zinc-400">(L5: {game.awayRecord.l5.wins}-{game.awayRecord.l5.losses})</span></div>
          </div>
        ) : (
          <div className="rounded-lg bg-gradient-to-br from-purple-950 via-zinc-900 to-purple-900 p-2">
            <div className="font-semibold text-purple-300">Away Record</div>
            <div className="font-mono text-zinc-400">N/A</div>
          </div>
        )}
        {game.probablePitchers?.home && (
          <div className="rounded-lg bg-gradient-to-br from-blue-950 via-zinc-900 to-blue-900 p-2">
            <div className="font-semibold text-blue-300">Probable Pitcher (Home)</div>
            <div className="font-mono text-zinc-200">{game.probablePitchers.home.name}</div>
            <div className="text-xs text-zinc-400">ERA: {game.probablePitchers.home.era ?? '-'}, WHIP: {game.probablePitchers.home.whip ?? '-'}</div>
          </div>
        )}
        {game.probablePitchers?.away && (
          <div className="rounded-lg bg-gradient-to-br from-purple-950 via-zinc-900 to-purple-900 p-2">
            <div className="font-semibold text-purple-300">Probable Pitcher (Away)</div>
            <div className="font-mono text-zinc-200">{game.probablePitchers.away.name}</div>
            <div className="text-xs text-zinc-400">ERA: {game.probablePitchers.away.era ?? '-'}, WHIP: {game.probablePitchers.away.whip ?? '-'}</div>
          </div>
        )}
        {game.weather && (
          <div className="rounded-lg bg-gradient-to-br from-cyan-950 via-zinc-900 to-cyan-900 p-2">
            <div className="font-semibold text-cyan-300">Weather</div>
            <div className="font-mono text-zinc-200">Temp: {game.weather.temp ?? '-'}°F</div>
            <div className="text-xs text-zinc-400">Wind: {game.weather.wind ?? '-'}</div>
            <div className="text-xs text-zinc-400">Condition: {game.weather.condition ?? '-'}</div>
          </div>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs md:text-sm overflow-x-auto pb-2">
        <div className="bg-zinc-900/80 rounded-lg p-2 md:p-3 border border-blue-900 min-w-[140px]">
          <div className="font-semibold text-blue-300 mb-1">Moneyline</div>
          <div className="flex justify-between gap-2">
            <span className="text-zinc-300">Home:</span> <span className="font-mono text-zinc-100">{game.moneyline.home ?? '-'}</span>
          </div>
          <div className="flex justify-between gap-2">
            <span className="text-zinc-300">Away:</span> <span className="font-mono text-zinc-100">{game.moneyline.away ?? '-'}</span>
          </div>
        </div>
        <div className="bg-zinc-900/80 rounded-lg p-2 md:p-3 border border-purple-900 min-w-[140px]">
          <div className="font-semibold text-purple-300 mb-1">Spread <span className="font-mono">{game.spread.line !== null ? game.spread.line : '-'}</span></div>
          <div className="flex justify-between gap-2">
            <span className="text-zinc-300">Home:</span> <span className="font-mono text-zinc-100">{game.spread.home ?? '-'}</span>
          </div>
          <div className="flex justify-between gap-2">
            <span className="text-zinc-300">Away:</span> <span className="font-mono text-zinc-100">{game.spread.away ?? '-'}</span>
          </div>
        </div>
        <div className="bg-zinc-900/80 rounded-lg p-2 md:p-3 border border-pink-900 min-w-[140px]">
          <div className="font-semibold text-pink-300 mb-1">Total <span className="font-mono">{game.total.line !== null ? game.total.line : '-'}</span></div>
          <div className="flex justify-between gap-2">
            <span className="text-zinc-300">Over:</span> <span className="font-mono text-zinc-100">{game.total.over ?? '-'}</span>
          </div>
          <div className="flex justify-between gap-2">
            <span className="text-zinc-300">Under:</span> <span className="font-mono text-zinc-100">{game.total.under ?? '-'}</span>
          </div>
        </div>
        <div className="bg-zinc-900/80 rounded-lg p-2 md:p-3 border border-cyan-900 min-w-[140px]">
          <div className="font-semibold text-cyan-300 mb-1">YRFI</div>
          <div className="flex justify-between gap-2">
            <span className="text-zinc-300">Over:</span> <span className="font-mono text-zinc-100">{game.yrfi.over ?? '-'}</span>
          </div>
          <div className="flex justify-between gap-2">
            <span className="text-zinc-300">Under:</span> <span className="font-mono text-zinc-100">{game.yrfi.under ?? '-'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
