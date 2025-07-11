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
    <div className="min-h-screen bg-white p-8">
      <h1 className="text-3xl font-bold text-black mb-4">AI Projections</h1>
      <p className="text-black mb-8">View model-based predictions for MLB games and player performance. All text is black for maximum readability.</p>
      {loading ? (
        <div className="text-black">Loading projections...</div>
      ) : error ? (
        <div className="text-red-600">{error}</div>
      ) : (
        <div className="border rounded-lg p-6 bg-white text-black">
          <div className="font-bold mb-2">Live Projections</div>
          <table className="w-full text-black">
            <thead>
              <tr className="border-b">
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
