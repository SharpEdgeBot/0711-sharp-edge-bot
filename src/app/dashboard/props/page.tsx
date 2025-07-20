"use client";
import React, { useEffect, useState } from 'react';
import { fetchMLBOdds } from '@/lib/oddsApi';

export default function PropsDashboard() {
  const [props, setProps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMLBOdds()
      .then(data => {
        setProps(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching player props:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch player props');
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-[var(--background)] p-8 text-[var(--foreground)] font-sans">
      <h1 className="text-3xl font-bold gradient-text mb-4">Player Props</h1>
      <p className="text-body mb-8">Analyze MLB player prop bets and projections.</p>
      {loading ? (
        <div className="glass rounded-xl shadow-xl p-8">Loading player props...</div>
      ) : error ? (
        <div className="glass rounded-xl shadow-xl p-8 text-[var(--accent-red)]">{error}</div>
      ) : (
        <div className="modern-card">
          <div className="font-bold mb-2 gradient-text">Live Player Props</div>
          <table className="modern-table">
            <thead>
              <tr>
                <th className="py-2 text-left">Player</th>
                <th className="py-2 text-left">Prop</th>
                <th className="py-2 text-left">Line</th>
                <th className="py-2 text-left">Bookmaker</th>
              </tr>
            </thead>
            <tbody>
              {props.map((game: any, idx: number) =>
                game.gamelines?.offers?.filter((offer: any) => offer.offerType === 'player_prop').map((offer: any, j: number) => (
                  <tr key={`${game.id}-${offer.sportsbook}-${offer.offerType}-${j}`}>
                    <td>{offer.playerName ?? '-'}</td>
                    <td>{offer.propType ?? '-'}</td>
                    <td>{offer.line ?? '-'} ({offer.oddsAmerican})</td>
                    <td>{offer.sportsbook}</td>
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
