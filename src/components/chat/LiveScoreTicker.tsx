import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { fetchMLBSchedule } from '../../lib/mlbApi';

const LiveScoreTicker: React.FC = () => {
  const [games, setGames] = useState<Array<{ home: string; away: string; score: string; status: string }>>([]);

  useEffect(() => {
    async function loadScores() {
      const today = new Date().toISOString().split('T')[0];
      const schedule = await fetchMLBSchedule(today, today);
      const gameList: Array<{ home: string; away: string; score: string; status: string }> = [];
      (schedule.dates || []).forEach((dateObj: any) => {
        (dateObj.games || []).forEach((g: any) => {
          gameList.push({
            home: g.teams?.home?.team?.name || '',
            away: g.teams?.away?.team?.name || '',
            score: `${g.teams?.home?.score ?? 0}-${g.teams?.away?.score ?? 0}`,
            status: g.status?.detailedState || '',
          });
        });
      });
      setGames(gameList);
    }
    loadScores();
  }, []);

  return (
    <motion.div
      className="w-full bg-gradient-to-r from-[#23272f] via-[#1a1a1a] to-[#23272f] py-2 px-4 flex items-center gap-6 overflow-x-auto whitespace-nowrap shadow-md border-b border-[#23272f]"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 120 }}
      aria-label="Live Score Ticker"
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
