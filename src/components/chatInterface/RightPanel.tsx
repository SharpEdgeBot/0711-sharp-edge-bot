

"use client";
import React, { useEffect, useState } from 'react';

const quickActions = ['Standings', 'Schedules', 'Player Stats'];

interface TeamStat {
  label: string;
  value: number | string;
  color: string;
}

const statColors: Record<string, string> = {
  'OPS+': '#39ff14',
  'wOBA': '#00d4ff',
  'FIP': '#ff6b35',
  'ERA': '#ffd700',
  'WHIP': '#00d4ff',
};

const TEAM_ID = 147; // Example: NY Yankees
const SEASON = 2025;

const RightPanel: React.FC = () => {
  const [stats, setStats] = useState<TeamStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTeamStats() {
      setLoading(true);
      try {
        const res = await fetch(`https://statsapi.mlb.com/api/v1/teams/${TEAM_ID}/stats?stats=season&group=hitting&season=${SEASON}`);
        const data = await res.json();
        const statObj = data.stats?.[0]?.splits?.[0]?.stat || {};
        const statList: TeamStat[] = [
          { label: 'OPS+', value: statObj.ops, color: statColors['OPS+'] },
          { label: 'wOBA', value: statObj.woba || '-', color: statColors['wOBA'] },
          { label: 'FIP', value: statObj.fip || '-', color: statColors['FIP'] },
          { label: 'ERA', value: statObj.era || '-', color: statColors['ERA'] },
          { label: 'WHIP', value: statObj.whip || '-', color: statColors['WHIP'] },
        ];
        setStats(statList);
      } catch (e) {
        setStats([]);
      }
      setLoading(false);
    }
    fetchTeamStats();
  }, []);

  return (
    <aside className="w-80 bg-[#181a20] bg-opacity-80 backdrop-blur-lg border-l border-[#23272f] flex flex-col p-4 text-white">
      <div className="font-bold text-lg mb-4 flex items-center justify-between">
        Sports Data
        <button className="text-[#00d4ff] hover:text-[#ff6b35] transition-colors text-sm">Collapse</button>
      </div>
      <div className="flex-1 overflow-y-auto mb-4">
        <div className="grid grid-cols-1 gap-4">
          {loading ? (
            <div className="text-center text-[#ffd700] animate-pulse">Loading team stats...</div>
          ) : (
            stats.map((card, idx) => (
              <div key={idx} className="rounded-xl p-4 bg-[#23272f] shadow-lg flex flex-col gap-1 border-l-4" style={{ borderColor: card.color }}>
                <span className="font-bold text-base" style={{ color: card.color }}>{card.label}</span>
                <span className="font-mono text-xl">{card.value}</span>
              </div>
            ))
          )}
        </div>
        <div className="mt-6">
          <div className="font-bold text-md mb-2">Quick Actions</div>
          <div className="flex gap-2 flex-wrap">
            {quickActions.map((action) => (
              <button key={action} className="px-3 py-1 rounded-lg bg-[#00d4ff] text-[#181a20] hover:bg-[#ff6b35] hover:text-white transition-colors font-bold text-xs">
                {action}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-6">
          <div className="font-bold text-md mb-2">Stat Visualization</div>
          <div className="bg-[#23272f] rounded-xl p-4 flex flex-col gap-2">
            {/* Example: Inline chart (placeholder) */}
            <div className="h-24 w-full bg-gradient-to-r from-[#00d4ff] via-[#39ff14] to-[#ff6b35] rounded-lg animate-pulse"></div>
            <span className="text-xs text-[#ffd700]">OPS+ trend (last 10 games)</span>
          </div>
        </div>
      </div>
    </aside>
  );
};


export default RightPanel;
