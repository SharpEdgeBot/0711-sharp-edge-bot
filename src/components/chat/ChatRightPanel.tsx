import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';


const ChatRightPanel: React.FC = () => {
  const [standings, setStandings] = useState<Array<{ team: string; teamId: number; wins: number; losses: number; pct: number }>>([]);
  const [odds, setOdds] = useState<Array<{ home: string; away: string; market: string; value: string }>>([]);

  useEffect(() => {
    async function loadPanelData() {
      try {
        // Fetch live games and odds from Pinnacle API via Next.js route
        const res = await fetch('/api/mlb/games');
        const data = await res.json();
        const games = data.games || [];

        // Odds extraction from Pinnacle normalized data
        const oddsList: Array<{ home: string; away: string; market: string; value: string }> = [];
        games.forEach((g: Record<string, unknown>) => {
          if (g.marketType && g.oddsValue !== undefined) {
            oddsList.push({
              home: (g.teams as string[] | undefined)?.[0] || '',
              away: (g.teams as string[] | undefined)?.[1] || '',
              market: String(g.marketType),
              value: String(g.oddsValue),
            });
          }
        });
        setOdds(oddsList);

        // Standings logic (optional, can be improved with live data)
        // If you want to keep standings, fetch from MLB API as before
        setStandings([]); // Or keep previous logic if needed
      } catch (_err) {
        setStandings([]);
        setOdds([]);
      }
    }
    loadPanelData();
  }, []);

  return (
    <aside className="hidden lg:flex flex-col w-80 h-full bg-gradient-to-b from-[#23272f] to-[#1a1a1a] glass-morph px-4 py-6 shadow-xl border-l border-[#23272f] z-20">
      {/* Standings */}
      <div className="mb-8">
        <h3 className="text-lg font-bold text-electric-blue mb-4">Today&apos;s Standings</h3>
        <div className="space-y-2">
          {standings.length === 0 ? (
            <span className="text-gray-400 text-sm">No standings available.</span>
          ) : (
            standings.map((s, idx) => (
              <div key={idx} className="flex justify-between items-center px-2 py-1 rounded bg-[#23272f] text-white font-mono">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`https://www.mlbstatic.com/team-logos/${s.teamId}.svg`}
                  alt={s.team}
                  className="w-6 h-6 mr-2 rounded-full border border-electric-blue bg-white"
                />
                <span className="font-bold text-electric-blue">{s.team}</span>
                <span className="text-neon-green">{typeof s.wins === 'number' ? s.wins : 0}W</span>
                <span className="text-orange-500">{typeof s.losses === 'number' ? s.losses : 0}L</span>
                <span className="text-golden-yellow">{typeof s.pct === 'number' && s.pct > 0 ? (s.pct * 100).toFixed(1) + '%' : '--'}</span>
              </div>
            ))
          )}
        </div>
      </div>
      {/* Odds */}
      <div>
        <h3 className="text-lg font-bold text-orange-500 mb-4">Today&apos;s Odds</h3>
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
