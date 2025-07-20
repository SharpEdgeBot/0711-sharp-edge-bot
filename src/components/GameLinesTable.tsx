import React, { useState, useEffect } from 'react';
import LineMovementChart from './LineMovementChart';
import { getCachedOdds, setCachedOdds } from '@/utils/oddsCache';

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
  return ((offer.oddsDecimal - fair.oddsDecimal) / Math.abs(fair.oddsDecimal)) * 100;
}

const GameLinesTable: React.FC<Props> = ({ games }) => {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<'ev' | 'odds' | 'line' | 'game' | 'market'>('ev');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [openChartIdx, setOpenChartIdx] = useState<number | null>(null);
  const [cachedRows, setCachedRows] = useState<any[]>([]);

  useEffect(() => {
    let allRows: any[] = [];
    for (const game of games) {
      const cacheKey = game.id;
      let offers = getCachedOdds(cacheKey);
      if (!offers) {
        offers = filterMarkets(game.offers || []);
        setCachedOdds(cacheKey, offers, 6);
      }
      const fair = getPinnacleFairPrice(offers);
      for (const offer of offers) {
        const ev = calculateEV(offer, fair);
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
        if (sortKey === 'ev') {
          return (a.ev ?? 0) - (b.ev ?? 0);
        } else if (sortKey === 'odds') {
          return (a.oddsAmerican ?? 0) - (b.oddsAmerican ?? 0);
        } else if (sortKey === 'line') {
          return (a.line ?? 0) - (b.line ?? 0);
        } else if (sortKey === 'game') {
          return a.start_date.localeCompare(b.start_date);
        } else if (sortKey === 'market') {
          return a.offerType.localeCompare(b.offerType);
        }
        return 0;
      });
    }
    setCachedRows(sortDir === 'asc' ? allRows : allRows.reverse());
  }, [games, search, sortKey, sortDir]);

  return (
    <div className="w-full overflow-x-auto bg-[var(--background)] text-[var(--foreground)] font-sans">
      <div className="mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
        <input
          className="px-4 py-2 rounded-lg bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--accent-blue)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-blue)] transition w-full md:w-72"
          type="text"
          placeholder="Search teams..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div className="flex gap-2">
          <button
            className={`modern-btn ${sortKey === 'ev' ? 'shadow-lg' : ''}`}
            onClick={() => setSortKey('ev')}
          >EV</button>
          <button
            className={`modern-btn ${sortKey === 'odds' ? 'shadow-lg' : ''}`}
            onClick={() => setSortKey('odds')}
          >Odds</button>
          <button
            className={`modern-btn ${sortKey === 'line' ? 'shadow-lg' : ''}`}
            onClick={() => setSortKey('line')}
          >Line</button>
        </div>
      </div>
      <table className="modern-table glass rounded-xl shadow-xl">
        <thead>
          <tr>
            <th>Game</th>
            <th>Market</th>
            <th>Sportsbook</th>
            <th>Odds</th>
            <th>Line</th>
            <th>EV (%)</th>
            <th>Chart</th>
          </tr>
        </thead>
        <tbody>
          {cachedRows.map((row, idx) => (
            <tr
              key={row.id + row.sportsbook + row.offerType + '-' + idx}
              className="hover:bg-[var(--accent-blue)] hover:text-[var(--background)] transition cursor-pointer"
              onClick={() => setOpenChartIdx(openChartIdx === idx ? null : idx)}
            >
              <td className="font-semibold">
                <span className="text-[var(--accent-blue)]">{row.away_display}</span> @ <span className="text-[var(--accent-green)]">{row.home_display}</span>
                <div className="text-xs text-[var(--neutral-gray-3)]">{row.start_date}</div>
              </td>
              <td>{row.offerType}</td>
              <td>{row.sportsbook}</td>
              <td className={row.oddsAmerican > 0 ? 'text-[var(--accent-green)]' : 'text-[var(--accent-red)]'}>{row.oddsAmerican}</td>
              <td>{row.line ?? '-'}</td>
              <td className={row.ev > 0 ? 'text-[var(--accent-green)] font-bold' : 'text-[var(--accent-red)] font-bold'}>
                {row.ev ? row.ev.toFixed(2) : '-'}
              </td>
              <td>
                <button className="modern-btn px-2 py-1 text-xs" onClick={e => { e.stopPropagation(); setOpenChartIdx(openChartIdx === idx ? null : idx); }}>
                  {openChartIdx === idx ? 'Hide' : 'Show'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {openChartIdx !== null && (
        <div className="mt-6 p-6 glass rounded-xl shadow-xl animate-fade-in">
          <LineMovementChart
            data={cachedRows[openChartIdx].lineMovement}
            market={cachedRows[openChartIdx].offerType}
            team={cachedRows[openChartIdx].home_display}
          />
        </div>
      )}
    </div>
  );
};

export default GameLinesTable;
