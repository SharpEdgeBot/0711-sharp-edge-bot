"use client";
import { useState } from 'react';
import { GamesProcessedChart, StatusBarChart } from './dataViz';
import { PinnacleOddsChart } from './OddsViz';

type GameResult = {
  gamePk: number;
  status: string;
  error?: string;
  context?: {
    odds?: {
      marketType: string;
      oddsValue: number;
      gameId: string | number;
      period: string;
    }[];
    [key: string]: unknown;
  };
};

export default function AdminPage() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<GameResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [oddsStatus, setOddsStatus] = useState<string | null>(null);

  async function handleRefresh() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/refreshPregame', { method: 'POST' });
      const json = await res.json();
      if (json.status === 'ok') {
        setResults(json.results);
      } else {
        setError('API error');
      }
    } catch (err) {
      setError((err as Error)?.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdateOddsFile() {
    setOddsStatus('Updating odds file...');
    try {
      const res = await fetch('/api/admin/updateOddsFile', { method: 'POST' });
      const json = await res.json();
      if (json.status === 'ok') {
        setOddsStatus(`Odds file updated (${json.count} odds)`);
      } else {
        setOddsStatus('Error updating odds file');
      }
    } catch (err) {
      setOddsStatus((err as Error)?.message || 'Unknown error');
    }
  }

  // Example: Visualize number of games processed
  const chartData = results.map((r, idx) => ({
    gamePk: r.gamePk,
    status: r.status,
    idx,
  }));

  // Collect all Pinnacle odds from cached contexts
  const allOdds = results
    .filter(r => r.context && Array.isArray(r.context.odds))
    .flatMap(r => (r.context?.odds ?? []));

  return (
    <div className="max-w-3xl mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      <div className="flex gap-4 mb-4">
        <button
          className="px-6 py-3 bg-blue-600 text-white rounded shadow hover:bg-blue-700 disabled:opacity-50"
          onClick={handleRefresh}
          disabled={loading}
        >
          {loading ? 'Refreshing...' : 'Refresh Pregame Cache'}
        </button>
        <button
          className="px-6 py-3 bg-green-600 text-white rounded shadow hover:bg-green-700 disabled:opacity-50"
          onClick={handleUpdateOddsFile}
        >
          Update Odds File
        </button>
      </div>
      {oddsStatus && <div className="mb-4 text-green-700">{oddsStatus}</div>}
      {error && <div className="mt-4 text-red-600">Error: {error}</div>}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-2">Games Processed</h2>
        <GamesProcessedChart data={chartData} />
        <h2 className="text-xl font-semibold mt-8 mb-2">Status Overview</h2>
        <StatusBarChart data={results} />
        <h2 className="text-xl font-semibold mt-8 mb-2">Pinnacle Odds Visualization</h2>
        <PinnacleOddsChart odds={allOdds} />
        <h2 className="text-xl font-semibold mt-8 mb-2">Cached Game Contexts</h2>
        <ul className="mt-4">
          {results.map((r, i) => (
            <li key={i} className="mb-2">
              <span className="font-mono">GamePk: {r.gamePk}</span> - <span>Status: {r.status}</span>
              {r.error && <span className="text-red-600 ml-2">Error: {r.error}</span>}
              {r.context && (
                <details className="ml-4">
                  <summary className="cursor-pointer text-blue-600">View Context</summary>
                  <pre className="bg-gray-100 p-2 rounded text-xs overflow-x-auto max-h-96">{JSON.stringify(r.context, null, 2)}</pre>
                </details>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
