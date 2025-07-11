import React, { useMemo } from 'react';
import { OptimalBetEvent } from '@/lib/oddsApi';
import { useState } from 'react';
import LineMovementChart from './LineMovementChart';

interface Offer {
  sportsbook: string;
  oddsAmerican: number;
  oddsDecimal: number;
  line: number | null;
  isHomeTeam: boolean;
  offerType: 'moneyline' | 'spread' | 'total';
  lastUpdated?: string;
}

interface GameLineRow {
  id: string;
  away: string;
  home: string;
  away_display: string;
  home_display: string;
  start_date: string;
  offers: Offer[];
}

interface Props {
  games: GameLineRow[];
}

function filterMarkets(offers: Offer[]) {
  return offers.filter(
    (o) => o.offerType === 'moneyline' || o.offerType === 'spread' || o.offerType === 'total'
  );
}

function getPinnacleFairPrice(offers: Offer[]) {
  const pinnacle = offers.find((o) => o.sportsbook === 'pinnacle');
  return pinnacle || null;
}

function calculateEV(offer: Offer, fair: Offer | null) {
  if (!fair) return null;
  // EV = (offered odds - fair odds) / abs(fair odds)
  return ((offer.oddsDecimal - fair.oddsDecimal) / Math.abs(fair.oddsDecimal)) * 100;
}

export default function GameLinesTable({ games }: Props) {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<'ev' | 'odds' | 'line' | 'game' | 'market'>('ev');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [openChartIdx, setOpenChartIdx] = useState<number | null>(null);

  const rows = useMemo(() => {
    let allRows: any[] = [];
    for (const game of games) {
      const offers = filterMarkets(game.offers || []);
      const fair = getPinnacleFairPrice(offers);
      for (const offer of offers) {
        const ev = calculateEV(offer, fair);
        // Only current odds available, so use as both open and close
        allRows.push({
          ...game,
          ...offer,
          fair,
          ev,
          lineMovement: [
            { time: 'Open', odds: offer.oddsAmerican, line: offer.line, sportsbook: offer.sportsbook },
            { time: 'Close', odds: offer.oddsAmerican, line: offer.line, sportsbook: offer.sportsbook },
          ],
        });
      }
    }
    if (search) {
      allRows = allRows.filter(
        (row) =>
          row.away_display.toLowerCase().includes(search.toLowerCase()) ||
          row.home_display.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (sortKey) {
      allRows = allRows.sort((a, b) => {
        let vA = a[sortKey] ?? 0;
        let vB = b[sortKey] ?? 0;
        if (typeof vA === 'string') vA = vA.toLowerCase();
        if (typeof vB === 'string') vB = vB.toLowerCase();
        if (sortDir === 'asc') return vA > vB ? 1 : vA < vB ? -1 : 0;
        return vA < vB ? 1 : vA > vB ? -1 : 0;
      });
    }
    return allRows;
  }, [games, search, sortKey, sortDir]);

  return (
    <div className="w-full">
      <div className="flex gap-4 mb-4 items-center">
        <input
          className="border rounded px-3 py-2 text-black bg-white w-64"
          placeholder="Search team..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="border rounded px-2 py-2 text-black bg-white"
          value={sortKey}
          onChange={(e) => setSortKey(e.target.value as any)}
        >
          <option value="ev">+EV</option>
          <option value="odds">Odds</option>
          <option value="line">Line</option>
          <option value="game">Game</option>
          <option value="market">Market</option>
        </select>
        <button
          className="border rounded px-2 py-2 text-black bg-white"
          onClick={() => setSortDir(sortDir === 'asc' ? 'desc' : 'asc')}
        >
          {sortDir === 'asc' ? 'Asc' : 'Desc'}
        </button>
      </div>
      <div className="overflow-x-auto rounded-lg shadow">
        <table className="min-w-full bg-white text-black">
          <thead>
            <tr className="border-b">
              <th className="py-2 px-2 text-left">Game</th>
              <th className="py-2 px-2 text-left">Market</th>
              <th className="py-2 px-2 text-left">Line</th>
              <th className="py-2 px-2 text-left">Odds</th>
              <th className="py-2 px-2 text-left">Bookmaker</th>
              <th className="py-2 px-2 text-left">Fair Price (Pinnacle)</th>
              <th className="py-2 px-2 text-left">+EV (%)</th>
              <th className="py-2 px-2 text-left">Line Movement</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <React.Fragment key={row.id + row.sportsbook + row.offerType + idx}>
                <tr className="border-b hover:bg-gray-100">
                  <td>{row.away_display} vs {row.home_display}</td>
                  <td>{row.offerType}</td>
                  <td>{row.line ?? '-'}</td>
                  <td>{row.oddsAmerican} ({row.oddsDecimal.toFixed(2)})</td>
                  <td>{row.sportsbook}</td>
                  <td>
                    {row.fair ? `${row.fair.oddsAmerican} (${row.fair.oddsDecimal.toFixed(2)})` : 'N/A'}
                  </td>
                  <td className={row.ev > 0 ? 'text-green-600 font-bold' : row.ev < 0 ? 'text-red-600' : ''}>
                    {row.ev !== null ? row.ev.toFixed(2) : 'N/A'}
                  </td>
                  <td>
                    <button
                      className="border rounded px-2 py-1 text-xs bg-blue-100 text-blue-800 hover:bg-blue-200"
                      onClick={() => setOpenChartIdx(openChartIdx === idx ? null : idx)}
                    >
                      {openChartIdx === idx ? 'Hide Chart' : 'Show Chart'}
                    </button>
                  </td>
                </tr>
                {openChartIdx === idx && (
                  <tr>
                    <td colSpan={8}>
                      <div className="py-4">
                        {/* Chart for line movement (open/close odds) */}
                        <LineMovementChart
                          data={row.lineMovement}
                          market={row.offerType}
                          team={row.isHomeTeam ? row.home_display : row.away_display}
                        />
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
