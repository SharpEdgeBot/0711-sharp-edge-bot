import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { fetchMLBSchedule, fetchTeamStats } from '../../lib/mlbApi';

const ChatRightPanel: React.FC = () => {
  const [standings, setStandings] = useState<Array<{ team: string; teamId: number; wins: number; losses: number; pct: number }>>([]);
  const [odds, setOdds] = useState<Array<{ home: string; away: string; market: string; value: string }>>([]);

  useEffect(() => {
    async function loadPanelData() {
      const today = new Date().toISOString().split('T')[0];
      try {
        const schedule = await fetchMLBSchedule(today, today);
        const teamObjs: any[] = [];
        (schedule.dates || []).forEach((dateObj: any) => {
          (dateObj.games || []).forEach((g: any) => {
            [g.teams?.home?.team, g.teams?.away?.team].forEach((teamObj: any) => {
              if (teamObj && teamObj.id) {
                teamObjs.push(teamObj);
              }
            });
          });
        });
        // Remove duplicates
        const uniqueTeams = Array.from(new Map(teamObjs.map(t => [t.id, t])).values());
        const standingsArr = await Promise.all(uniqueTeams.map(async (teamObj: any) => {
          try {
            const statsData = await fetchTeamStats(teamObj.id);
            const stats = statsData.stats?.[0]?.splits?.[0]?.stat || {};
            return {
              team: teamObj.name,
              teamId: teamObj.id,
              wins: typeof stats.wins === 'number' ? stats.wins : 0,
              losses: typeof stats.losses === 'number' ? stats.losses : 0,
              pct: typeof stats.pct === 'number' ? stats.pct : 0,
            };
          } catch (err) {
            return {
              team: teamObj.name,
              teamId: teamObj.id,
              wins: 0,
              losses: 0,
              pct: 0,
            };
          }
        }));
        setStandings(standingsArr);
        // Odds logic unchanged
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
      } catch (err) {
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
        <h3 className="text-lg font-bold text-electric-blue mb-4">Today's Standings</h3>
        <div className="space-y-2">
          {standings.length === 0 ? (
            <span className="text-gray-400 text-sm">No standings available.</span>
          ) : (
            standings.map((s, idx) => (
              <div key={idx} className="flex justify-between items-center px-2 py-1 rounded bg-[#23272f] text-white font-mono">
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
