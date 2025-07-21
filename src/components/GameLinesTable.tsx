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
  const [sortDir] = useState<'asc' | 'desc'>('desc');
  const [openChartIdx, setOpenChartIdx] = useState<number | null>(null);
  // Define the type for the table row
  type TableRow = GameLineRow & Offer & {
    fair: Offer | null;
    ev: number | null;
    lineMovement: Array<{ time: string; odds: number; line: number; sportsbook: string }>;
  };
  const [cachedRows, setCachedRows] = useState<TableRow[]>([]);

  useEffect(() => {
    let allRows: TableRow[] = [];
    for (const game of games) {
      const cacheKey = game.id;
      let offers = getCachedOdds(cacheKey);
      if (!Array.isArray(offers)) {
        offers = filterMarkets(game.offers || []);
        setCachedOdds(cacheKey, offers, 6);
      }
      const offersArr = offers as Offer[];
      const fair = getPinnacleFairPrice(offersArr);
      for (const offer of offersArr) {
        const ev = calculateEV(offer, fair);
        allRows.push({
          ...game,
          ...offer,
          fair,
          ev,
          lineMovement: [
            { time: 'Open', odds: offer.oddsAmerican, line: typeof offer.line === 'number' ? offer.line : 0, sportsbook: offer.sportsbook },
            { time: 'Close', odds: offer.oddsAmerican, line: typeof offer.line === 'number' ? offer.line : 0, sportsbook: offer.sportsbook },
          ],
        });
      }
    }
    if (search) {
      allRows = allRows.filter((row) =>
        typeof row === 'object' && row !== null &&
        'away_display' in row && typeof (row as TableRow).away_display === 'string' &&
        'home_display' in row && typeof (row as TableRow).home_display === 'string' &&
        ((row as TableRow).away_display.toLowerCase().includes(search.toLowerCase()) ||
          (row as TableRow).home_display.toLowerCase().includes(search.toLowerCase()))
      );
    }
    if (sortKey) {
      allRows = allRows.sort((a, b) => {
        // Type guard for TableRow
        if (
          typeof a === 'object' && a !== null &&
          typeof b === 'object' && b !== null &&
          'ev' in a && 'ev' in b &&
          'oddsAmerican' in a && 'oddsAmerican' in b &&
          'line' in a && 'line' in b &&
          'start_date' in a && 'start_date' in b &&
          'offerType' in a && 'offerType' in b
        ) {
          const rowA = a as TableRow;
          const rowB = b as TableRow;
          if (sortKey === 'ev') {
            return (rowA.ev ?? 0) - (rowB.ev ?? 0);
          } else if (sortKey === 'odds') {
            return (rowA.oddsAmerican ?? 0) - (rowB.oddsAmerican ?? 0);
          } else if (sortKey === 'line') {
            return (rowA.line ?? 0) - (rowB.line ?? 0);
          } else if (sortKey === 'game') {
            return rowA.start_date.localeCompare(rowB.start_date);
          } else if (sortKey === 'market') {
            return rowA.offerType.localeCompare(rowB.offerType);
          }
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
          {cachedRows.map((row, idx) => {
            // Type guard for TableRow
            if (
              typeof row === 'object' && row !== null &&
              'id' in row && 'sportsbook' in row && 'offerType' in row &&
              'away_display' in row && 'home_display' in row && 'start_date' in row &&
              'oddsAmerican' in row && 'line' in row && 'ev' in row
            ) {
              const r = row as TableRow;
              return (
                <tr
                  key={r.id + r.sportsbook + r.offerType + '-' + idx}
                  className="hover:bg-[var(--accent-blue)] hover:text-[var(--background)] transition cursor-pointer"
                  onClick={() => setOpenChartIdx(openChartIdx === idx ? null : idx)}
                >
                  <td className="font-semibold">
                    <span className="text-[var(--accent-blue)]">{r.away_display}</span> @ <span className="text-[var(--accent-green)]">{r.home_display}</span>
                    <div className="text-xs text-[var(--neutral-gray-3)]">{r.start_date}</div>
                  </td>
                  <td>{r.offerType}</td>
                  <td>{r.sportsbook}</td>
                  <td className={r.oddsAmerican > 0 ? 'text-[var(--accent-green)]' : 'text-[var(--accent-red)]'}>{r.oddsAmerican}</td>
                  <td>{r.line ?? '-'}</td>
                  <td className={r.ev && r.ev > 0 ? 'text-[var(--accent-green)] font-bold' : 'text-[var(--accent-red)] font-bold'}>
                    {r.ev ? r.ev.toFixed(2) : '-'}
                  </td>
                  <td>
                    <button className="modern-btn px-2 py-1 text-xs" onClick={e => { e.stopPropagation(); setOpenChartIdx(openChartIdx === idx ? null : idx); }}>
                      {openChartIdx === idx ? 'Hide' : 'Show'}
                    </button>
                  </td>
                </tr>
              );
            }
            return null;
          })}
        </tbody>
      </table>
      {openChartIdx !== null && (() => {
        const chartRow = cachedRows[openChartIdx];
        if (
          typeof chartRow === 'object' && chartRow !== null &&
          'lineMovement' in chartRow && 'offerType' in chartRow && 'home_display' in chartRow
        ) {
          const r = chartRow as TableRow;
          return (
            <div className="mt-6 p-6 glass rounded-xl shadow-xl animate-fade-in">
              <LineMovementChart
                data={r.lineMovement}
                market={r.offerType}
                team={r.home_display}
              />
            </div>
          );
        }
        return null;
      })()}
    </div>
  );
};

export default GameLinesTable;
