import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { fetchMLBSchedule } from '../../lib/mlbApi';

const LiveScoreTicker: React.FC = () => {
  const [games, setGames] = useState<Array<{ home: string; away: string; score: string; status: string }>>([]);
  const tickerRef = React.useRef<HTMLDivElement>(null);
  const [scrollWidth, setScrollWidth] = useState(0);

  useEffect(() => {
    async function loadScores() {
      const today = new Date().toISOString().split('T')[0];
      const schedule = await fetchMLBSchedule(today, today);
      const gameList: Array<{ home: string; away: string; score: string; status: string }> = [];
      if (schedule && typeof schedule === 'object' && 'dates' in schedule && Array.isArray((schedule as { dates?: unknown[] }).dates)) {
        ((schedule as { dates?: unknown[] }).dates || []).forEach((dateObj: unknown) => {
        if (!dateObj || typeof dateObj !== 'object' || !('games' in dateObj)) return;
        const games = (dateObj as { games?: unknown[] }).games || [];
        games.forEach((g: unknown) => {
          if (
            typeof g === 'object' && g !== null &&
            'teams' in g && typeof (g as { teams?: unknown }).teams === 'object' &&
            'status' in g && typeof (g as { status?: unknown }).status === 'object'
          ) {
            const teamsObj = (g as { teams: unknown }).teams;
            const statusObj = (g as { status: unknown }).status;
            // Type guard for teams
            if (
              typeof teamsObj === 'object' && teamsObj !== null &&
              'home' in teamsObj && 'away' in teamsObj
            ) {
              const teams = teamsObj as { home?: { team?: { name?: string }, score?: number }, away?: { team?: { name?: string }, score?: number } };
              const status = statusObj as { detailedState?: string };
              gameList.push({
                home: teams.home?.team?.name || '',
                away: teams.away?.team?.name || '',
                score: `${teams.home?.score ?? 0}-${teams.away?.score ?? 0}`,
                status: status.detailedState || '',
              });
            }
          }
        });
      });
      }
      setGames(gameList);
    }
    loadScores();
  }, []);

  useEffect(() => {
    if (tickerRef.current) {
      setScrollWidth(tickerRef.current.scrollWidth);
    }
  }, [games]);

  // Auto-scroll effect
  useEffect(() => {
    if (!tickerRef.current || games.length === 0) return;
    let frame: number;
    let pos = 0;
    const speed = 1; // px per frame
    const scroll = () => {
      if (!tickerRef.current) return;
      pos += speed;
      if (pos > scrollWidth) pos = 0;
      tickerRef.current.scrollLeft = pos;
      frame = requestAnimationFrame(scroll);
    };
    frame = requestAnimationFrame(scroll);
    return () => cancelAnimationFrame(frame);
  }, [scrollWidth, games]);

  return (
    <motion.div
      ref={tickerRef}
      className="w-full bg-gradient-to-r from-[#23272f] via-[#1a1a1a] to-[#23272f] py-2 px-4 flex items-center gap-6 overflow-x-auto whitespace-nowrap shadow-md border-b border-[#23272f]"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 120 }}
      aria-label="Live Score Ticker"
      style={{ scrollBehavior: 'auto' }}
    >
      {games.length === 0 ? (
        <span className="text-gray-400 text-sm">No MLB games today.</span>
      ) : (
        games.map((game, idx) => (
          <div key={idx} className="flex items-center gap-2 text-sm font-mono text-electric-blue">
            <span className="font-bold text-white">{game.home}</span>
            <span className="text-gray-400">vs</span>
            <span className="font-bold text-white">{game.away}</span>
            <span className="bg-[#23272f] rounded px-2 py-1 ml-2 text-neon-green font-semibold">{game.score}</span>
            <span className="ml-2 text-golden-yellow italic">{game.status}</span>
          </div>
        ))
      )}
    </motion.div>
  );
};

export default LiveScoreTicker;
