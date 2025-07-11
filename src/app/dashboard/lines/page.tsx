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
    <div className="min-h-screen bg-white p-8">
      <h1 className="text-3xl font-bold text-black mb-4">Betting Lines</h1>
      <p className="text-black mb-8">View current MLB moneyline, runline, and game total odds. All text is black for maximum readability.</p>
      {loading ? (
        <div className="text-black">Loading odds...</div>
      ) : error ? (
        <div className="text-red-600">{error}</div>
      ) : (
        <div className="border rounded-lg p-6 bg-white text-black">
          <div className="font-bold mb-2">Live Odds</div>
          <GameLinesTable games={odds.map((game: any) => ({
            ...game,
            offers: (game.odds?.filter?.((o: any) => ['moneyline', 'spread', 'total'].includes(o.offerType)) ?? [])
          }))} />
        </div>
      )}
    </div>
  );
}
