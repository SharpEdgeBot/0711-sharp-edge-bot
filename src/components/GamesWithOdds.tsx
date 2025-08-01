import React, { useEffect, useState } from 'react';
import GameCard from './GameCard';
import type { GameLineRow } from './GameLinesTable';
import GameLinesTable from './GameLinesTable';

interface Game {
  id: string;
  homeTeam: string;
  homeLogo: string;
  homeRecord?: string;
  homeProbablePitcher?: string;
  homeProbablePitcherStats?: string;
  awayTeam: string;
  awayLogo: string;
  awayRecord?: string;
  awayProbablePitcher?: string;
  awayProbablePitcherStats?: string;
  startTime: string;
  stadium: string;
  weather?: { condition?: string; temp?: string; wind?: string };
  status: string;
  inning?: string;
  homeScore?: number;
  awayScore?: number;
}

interface OddsOffer {
  marketType: string;
  bookmaker: string;
  line: number;
  payout: number;
  lastUpdate: string;
}
interface OddsGameLineRow {
  id: string;
  away: string;
  home: string;
  away_display: string;
  home_display: string;
  start_date: string;
  offers: OddsOffer[];
}

const GamesWithOdds: React.FC = () => {
  const [games, setGames] = useState<Game[]>([]);
  const [odds, setOdds] = useState<OddsGameLineRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function fetchData() {
      setLoading(true);
      try {
        // Only retrieve stats from cache endpoint
        const cacheRes = await fetch('/api/cache/games');
        if (!cacheRes.ok) throw new Error('Failed to fetch cached games');
        const cacheData = await cacheRes.json();
        const gamesList: Game[] = Array.isArray(cacheData) ? cacheData : [];
        if (isMounted) {
          setGames(gamesList);
          // Odds must be hydrated from cache or manually, not fetched here
          setOdds([]);
        }
      } catch (_err) {
        if (isMounted) {
          setGames([]);
          setOdds([]);
        }
        // Optionally log error
        // console.error(err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchData();
    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) return <div className="text-center py-8 text-lg text-gray-400">Loading games and odds...</div>;

  // Map OddsGameLineRow[] to GameLineRow[] and OddsOffer[] to Offer[]
  function mapOddsToGameLineRow(oddsRows: OddsGameLineRow[]): GameLineRow[] {
    return oddsRows.map(row => ({
      id: row.id,
      away: row.away,
      home: row.home,
      away_display: row.away_display,
      home_display: row.home_display,
      start_date: row.start_date,
      offers: row.offers.map(o => ({
        sportsbook: o.bookmaker ?? '',
        oddsAmerican: typeof o.line === 'number' ? o.line : 0,
        oddsDecimal: typeof o.payout === 'number' ? o.payout : 0,
        line: typeof o.line === 'number' ? o.line : null,
        isHomeTeam: false, // Set appropriately if info available
        offerType: o.marketType === 'moneyline' ? 'moneyline' : o.marketType === 'spread' ? 'spread' : 'total',
        lastUpdated: o.lastUpdate ?? '',
      })),
    }));
  }

  const mappedOdds = mapOddsToGameLineRow(odds);

  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {games.map(game => (
          <GameCard key={game.id} {...game} />
        ))}
      </div>
      <div className="mt-8">
        <GameLinesTable games={mappedOdds} />
      </div>
    </div>
  );
};

export default GamesWithOdds;
