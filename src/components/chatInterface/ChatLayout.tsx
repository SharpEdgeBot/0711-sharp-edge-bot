"use client";
import React, { useState } from 'react';
import { fetchPlayerStats } from '@/lib/mlbApi';
import { fetchPlayerProps } from '@/lib/optimalApi';
import { buildGameContext } from '@/utils/buildGameContext';

async function fetchAssistantResponse(message: string, gameId?: string) {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, gameId }),
  });
  if (!res.ok) {
    return { response: 'Error contacting assistant.', gameContext: null };
  }
  return res.json();
}
import { ThemeProvider } from './ThemeProvider';
import Sidebar from './Sidebar';
import ChatArea from './ChatArea';
import RightPanel from './RightPanel';
import FloatingInput from './FloatingInput';
import HeaderBar from './HeaderBar';

const initialMessages: Array<{
  sender: 'user' | 'assistant';
  message: string;
  avatarUrl?: string;
  teamLogoUrl?: string;
  stats?: React.ReactNode;
}> = [
  {
    sender: 'assistant',
    message: 'Welcome to the Sports Analyst Chat! ⚾\nToday: Yankees vs. Red Sox',
    teamLogoUrl: '/window.svg',
    stats: (
      <div className="flex gap-2 items-center">
        <span className="font-bold text-[#00d4ff]">NYY</span>
        <span className="font-mono text-lg">5</span>
        <span className="font-bold text-[#ff6b35]">BOS</span>
        <span className="font-mono text-lg">3</span>
      </div>
    ),
  },
];

const ChatLayout: React.FC = () => {
  const [messages, setMessages] = useState(initialMessages);
  const handleSend = async (msg: string) => {
    setMessages(prev => [
      ...prev,
      {
        sender: 'user',
        message: msg,
        avatarUrl: '/window.svg',
      },
    ]);

    // Extract gamePk if present
    const gamePkMatch = msg.match(/gamePk\s*:?\s*(\d{6,})/i);
    const gameId = gamePkMatch ? gamePkMatch[1] : undefined;
    const ai = await fetchAssistantResponse(msg, gameId);
    setMessages(prev => [
      ...prev,
      {
        sender: 'assistant',
        message: ai.response,
        stats: ai.gameContext ? (
          <div className="bg-[#23272f] rounded-xl p-3 flex flex-col gap-2">
            {Array.isArray(ai.gameContext)
              ? ai.gameContext
                  .filter((ctx: any) => ctx.home_team?.name && ctx.away_team?.name && ctx.pitcher_matchup?.home_pitcher?.name && ctx.pitcher_matchup?.away_pitcher?.name)
                  .map((ctx: any, i: number) => (
                    <div key={i} className="mb-2">
                      <div className="font-bold text-[#00d4ff]">{ctx.home_team?.name} vs {ctx.away_team?.name}</div>
                      <div className="text-xs text-[#ff6b35]">Venue: {typeof ctx.venue === 'object' ? ctx.venue?.name ?? JSON.stringify(ctx.venue) : ctx.venue}</div>
                      <div className="text-xs text-[#39ff14]">Weather: {ctx.weather ? (ctx.weather.condition ?? 'N/A') : 'N/A'}</div>
                      <div className="font-mono text-sm">Odds: {JSON.stringify(ctx.odds)}</div>
                      <div className="font-mono text-sm">Home Pitcher: {ctx.pitcher_matchup?.home_pitcher?.name} (ERA: {ctx.pitcher_matchup?.home_pitcher?.era})</div>
                      <div className="font-mono text-sm">Away Pitcher: {ctx.pitcher_matchup?.away_pitcher?.name} (ERA: {ctx.pitcher_matchup?.away_pitcher?.era})</div>
                    </div>
                  ))
              : (
                  <>
                    {ai.gameContext.home_team?.name && ai.gameContext.away_team?.name && ai.gameContext.pitcher_matchup?.home_pitcher?.name && ai.gameContext.pitcher_matchup?.away_pitcher?.name ? (
                      <>
                        <div className="font-bold text-[#00d4ff]">{ai.gameContext.home_team?.name} vs {ai.gameContext.away_team?.name}</div>
                        <div className="text-xs text-[#ff6b35]">Venue: {typeof ai.gameContext.venue === 'object' ? ai.gameContext.venue?.name ?? JSON.stringify(ai.gameContext.venue) : ai.gameContext.venue}</div>
                        <div className="text-xs text-[#39ff14]">Weather: {ai.gameContext.weather ? (ai.gameContext.weather.condition ?? 'N/A') : 'N/A'}</div>
                        <div className="font-mono text-sm">Odds: {JSON.stringify(ai.gameContext.odds)}</div>
                        <div className="font-mono text-sm">Home Pitcher: {ai.gameContext.pitcher_matchup?.home_pitcher?.name} (ERA: {ai.gameContext.pitcher_matchup?.home_pitcher?.era})</div>
                        <div className="font-mono text-sm">Away Pitcher: {ai.gameContext.pitcher_matchup?.away_pitcher?.name} (ERA: {ai.gameContext.pitcher_matchup?.away_pitcher?.era})</div>
                      </>
                    ) : (
                      <div className="text-xs text-[#ff6b35]">No data available for this game.</div>
                    )}
                  </>
                )}
          </div>
        ) : undefined,
      },
    ]);
  };
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gradient-to-br from-[#1a1a1a] to-[#23272f] dark flex flex-col">
        <HeaderBar />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          <main className="flex-1 flex flex-col justify-between relative">
            <ChatArea messages={messages} />
            <FloatingInput onSend={handleSend} />
          </main>
          <RightPanel />
        </div>
      </div>
    </ThemeProvider>
  );
};

export default ChatLayout;
