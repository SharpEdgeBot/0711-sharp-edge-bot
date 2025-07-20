"use client";
import React, { useEffect, useState } from 'react';
import { fetchMLBOdds } from '@/lib/oddsApi';

export default function ProjectionsDashboard() {
  const [odds, setOdds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMLBOdds()
      .then(data => {
        setOdds(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching projections:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch projections');
        setLoading(false);
      });
  }, []);

  // Example: Calculate win probability from odds
  const getWinProb = (price: number) => {
    if (price > 0) return 100 / (price + 100);
    return Math.abs(price) / (Math.abs(price) + 100);
  };

  return (
    <div className="min-h-screen bg-[var(--background)] p-8 text-[var(--foreground)] font-sans">
      <h1 className="text-3xl font-bold gradient-text mb-4">AI Projections</h1>
      <p className="text-body mb-8">View model-based predictions for MLB games and player performance.</p>
      {loading ? (
        <div className="glass rounded-xl shadow-xl p-8">Loading projections...</div>
      ) : error ? (
        <div className="glass rounded-xl shadow-xl p-8 text-[var(--accent-red)]">{error}</div>
      ) : (
        <div className="modern-card">
          <div className="font-bold mb-2 gradient-text">Live Projections</div>
          <table className="modern-table">
            <thead>
              <tr>
                <th className="py-2 text-left">Game</th>
                <th className="py-2 text-left">Win Probability</th>
                <th className="py-2 text-left">Projected Runs (O/U)</th>
              </tr>
            </thead>
            <tbody>
              {odds.map((game: any, idx: number) =>
                game.gamelines?.offers?.map((offer: any, j: number) => (
                  <tr key={`${game.id}-${offer.sportsbook}-${offer.offerType}-${j}`}> 
                    <td>{game.away_display} vs {game.home_display}</td>
                    <td>
                      {offer.offerType === 'moneyline'
                        ? `${offer.isHomeTeam ? game.home_display : game.away_display}: ${(getWinProb(offer.oddsAmerican) * 100).toFixed(1)}%`
                        : '-'}
                    </td>
                    <td>
                      {offer.offerType === 'over' || offer.offerType === 'under'
                        ? `${offer.offerType}: ${offer.line}`
                        : '-'}
                    </td>
                  </tr>
                )) ?? null
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
