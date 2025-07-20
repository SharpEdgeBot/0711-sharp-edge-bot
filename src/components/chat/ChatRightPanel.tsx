import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { fetchMLBSchedule } from '../../lib/mlbApi';

const ChatRightPanel: React.FC = () => {
  const [standings, setStandings] = useState<Array<{ team: string; wins: number; losses: number; pct: number }>>([]);
  const [odds, setOdds] = useState<Array<{ home: string; away: string; market: string; value: string }>>([]);

  useEffect(() => {
    async function loadPanelData() {
      const today = new Date().toISOString().split('T')[0];
      // Fetch schedule for today
      const schedule = await fetchMLBSchedule(today, today);
      // Standings (from today's games)
      const teams: Record<string, { wins: number; losses: number; pct: number }> = {};
      (schedule.dates || []).forEach((dateObj: any) => {
        (dateObj.games || []).forEach((g: any) => {
          const home = g.teams?.home?.team;
          const away = g.teams?.away?.team;
          if (home) teams[home.name] = { wins: home.wins, losses: home.losses, pct: home.winningPercentage };
          if (away) teams[away.name] = { wins: away.wins, losses: away.losses, pct: away.winningPercentage };
        });
      });
      setStandings(Object.entries(teams).map(([team, stats]) => ({ team, ...stats })));
      // Odds (from today's games)
      const oddsList: Array<{ home: string; away: string; market: string; value: string }> = [];
      (schedule.dates || []).forEach((dateObj: any) => {
        (dateObj.games || []).forEach((g: any) => {
          if (g.odds && Array.isArray(g.odds)) {
            g.odds.forEach((o: any) => {
              oddsList.push({
                home: g.teams?.home?.team?.name || '',
                away: g.teams?.away?.team?.name || '',
                market: o.market || '',
                value: o.value || '',
              });
            });
          }
        });
      });
      setOdds(oddsList);
    }
    loadPanelData();
  }, []);

  return (
    <aside className="hidden lg:flex flex-col w-80 h-full bg-gradient-to-b from-[#23272f] to-[#1a1a1a] glass-morph px-4 py-6 shadow-xl border-l border-[#23272f] z-20">
      {/* Standings */}
      <div className="mb-8">
        <h3 className="text-lg font-bold text-electric-blue mb-4">Today's Standings</h3>
        <div className="space-y-2">
          {standings.length === 0 ? (
            <span className="text-gray-400 text-sm">No standings available.</span>
          ) : (
            standings.map((s, idx) => (
              <div key={idx} className="flex justify-between items-center px-2 py-1 rounded bg-[#23272f] text-white font-mono">
                <span className="font-bold text-electric-blue">{s.team}</span>
                <span className="text-neon-green">{s.wins}W</span>
                <span className="text-orange-500">{s.losses}L</span>
                <span className="text-golden-yellow">{(s.pct * 100).toFixed(1)}%</span>
              </div>
            ))
          )}
        </div>
      </div>
      {/* Odds */}
      <div>
        <h3 className="text-lg font-bold text-orange-500 mb-4">Today's Odds</h3>
        <div className="space-y-2">
          {odds.length === 0 ? (
            <span className="text-gray-400 text-sm">No odds available.</span>
          ) : (
            odds.map((o, idx) => (
              <motion.div
                key={idx}
                className="flex items-center justify-between px-3 py-2 rounded-xl glass-morph shadow-md border border-[#23272f]"
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ type: 'spring', stiffness: 120, delay: idx * 0.05 }}
              >
                <span className="font-mono text-sm text-electric-blue font-bold">{o.home} vs {o.away}</span>
                <span className="font-mono text-xs text-golden-yellow ml-2">{o.market}: {o.value}</span>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </aside>
  );
};

export default ChatRightPanel;
