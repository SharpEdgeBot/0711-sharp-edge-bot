"use client";
import React from 'react';


const liveScores = [
  { home: 'NYY', away: 'BOS', homeScore: 5, awayScore: 3 },
  { home: 'LAD', away: 'SFG', homeScore: 2, awayScore: 4 },
];

const HeaderBar: React.FC = () => (
  <header className="w-full h-16 bg-gradient-to-r from-[#1a1a1a] via-[#23272f] to-[#181a20] flex items-center px-6 border-b border-[#23272f] text-white shadow-lg">
    <div className="flex-1 flex items-center gap-6">
      <span className="font-bold text-xl tracking-wide text-[#00d4ff]">Sports Analyst Chat</span>
      <div className="ml-8 flex items-center gap-4 animate-pulse">
        {liveScores.map((score, idx) => (
          <div key={idx} className="flex items-center gap-2 px-2 py-1 rounded-lg bg-[#23272f]">
            <span className="font-bold text-[#00d4ff]">{score.home}</span>
            <span className="font-mono text-lg">{score.homeScore}</span>
            <span className="font-bold text-[#ff6b35]">{score.away}</span>
            <span className="font-mono text-lg">{score.awayScore}</span>
          </div>
        ))}
      </div>
    </div>
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2 px-2 py-1 rounded-lg bg-[#23272f]">
        <img src="/window.svg" alt="User" className="w-7 h-7 rounded-full border border-[#00d4ff]" />
        <span className="font-semibold">User</span>
      </div>
      <button className="text-[#ffd700] hover:text-[#ff6b35] transition-colors" title="Settings">
        <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path d="M12 15.5A3.5 3.5 0 1 0 12 8.5a3.5 3.5 0 0 0 0 7zm7.43-2.9l1.77-1.02a.5.5 0 0 0 .18-.68l-1.68-2.91a.5.5 0 0 0-.65-.22l-1.77 1.02a7.03 7.03 0 0 0-1.51-.88l-.27-1.93A.5.5 0 0 0 14.5 6h-3a.5.5 0 0 0-.5.42l-.27 1.93a7.03 7.03 0 0 0-1.51.88l-1.77-1.02a.5.5 0 0 0-.65.22l-1.68 2.91a.5.5 0 0 0 .18.68l1.77 1.02c-.04.32-.07.65-.07.98s.03.66.07.98l-1.77 1.02a.5.5 0 0 0-.18.68l1.68 2.91a.5.5 0 0 0 .65.22l1.77-1.02c.47.36.98.66 1.51.88l.27 1.93a.5.5 0 0 0 .5.42h3a.5.5 0 0 0 .5-.42l.27-1.93c.53-.22 1.04-.52 1.51-.88l1.77 1.02a.5.5 0 0 0 .65-.22l1.68-2.91a.5.5 0 0 0-.18-.68l-1.77-1.02c.04-.32.07-.65.07-.98s-.03-.66-.07-.98z"/></svg>
      </button>
      <button className="text-[#39ff14] hover:text-[#00d4ff] transition-colors" title="Notifications">
        <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path d="M12 22a2 2 0 0 0 2-2H10a2 2 0 0 0 2 2zm6-6V11c0-3.07-1.63-5.64-4.5-6.32V4a1.5 1.5 0 0 0-3 0v.68C7.63 5.36 6 7.92 6 11v5l-1.29 1.29A1 1 0 0 0 6 19h12a1 1 0 0 0 .71-1.71L18 16z"/></svg>
      </button>
    </div>
  </header>
);

export default HeaderBar;
