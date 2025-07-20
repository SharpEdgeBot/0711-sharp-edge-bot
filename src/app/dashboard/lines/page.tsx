"use client";
import React, { useEffect, useState } from 'react';
import GameLinesTable from '@/components/GameLinesTable';
import { fetchMLBOdds } from '@/lib/oddsApi';

export default function LinesDashboard() {
  const [odds, setOdds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMLBOdds()
      .then((data) => {
        setOdds(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching odds:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch odds');
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-[var(--background)] p-8 text-[var(--foreground)] font-sans">
      <h1 className="text-3xl font-bold gradient-text mb-4">Betting Lines</h1>
      <p className="text-body mb-8">View current MLB moneyline, runline, and game total odds.</p>
      {loading ? (
        <div className="glass rounded-xl shadow-xl p-8">Loading odds...</div>
      ) : error ? (
        <div className="glass rounded-xl shadow-xl p-8 text-[var(--accent-red)]">{error}</div>
      ) : (
        <div className="modern-card">
          <div className="font-bold mb-2 gradient-text">Live Odds</div>
          <GameLinesTable games={odds.map((game: any) => ({
            ...game,
            offers: (game.odds?.filter?.((o: any) => ['moneyline', 'spread', 'total'].includes(o.offerType)) ?? [])
          }))} />
        </div>
      )}
    </div>
  );
}
