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
// import HeaderBar from './HeaderBar';

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

    // Example: auto-inject chart if recentForm data is present in ai.gameContext
    let chart = null;
    if (ai.gameContext && ai.gameContext.recentForm) {
      const { type, title, labels, values, color } = ai.gameContext.recentForm;
      // type: 'bar' | 'line', labels: string[], values: number[]
      const ChatDataViz = require('./ChatDataViz').default;
      chart = <ChatDataViz type={type} title={title} labels={labels} values={values} color={color} />;
    }

    setMessages(prev => [
      ...prev,
      {
        sender: 'assistant',
        message: ai.response,
        stats: ai.gameContext ? (
          <div className="bg-[#23272f] rounded-xl p-3 flex flex-col gap-2">
            {/* ...existing context rendering... */}
            {chart}
            {/* ...existing code... */}
          </div>
        ) : undefined,
      },
    ]);
  };
  return (
    <ThemeProvider>
  <div className="min-h-screen bg-[#0d1117] flex flex-col">
        <div className="flex flex-1 overflow-hidden">
          <div className="fixed left-0 top-0 h-screen w-64 z-40 bg-[#161b22] border-r border-[#21262d] shadow-2xl">
            <Sidebar />
          </div>
          <main className="flex-1 flex flex-col relative" style={{ marginLeft: '16rem', marginRight: '20rem' }}>
            <div className="w-full flex justify-end p-4">
              <a href="/dashboard" className="px-4 py-2 rounded-lg bg-[#21262d] text-[#c9d1d9] font-semibold shadow hover:bg-[#161b22] transition">← Back to Dashboard</a>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-8" style={{ marginBottom: 80 }}>
              <div className="rounded-2xl shadow-xl border border-[#21262d] bg-[#161b22] p-6 text-[#c9d1d9]">
                <ChatArea messages={messages} />
              </div>
            </div>
            <div className="fixed bottom-0 left-64 right-80 z-50">
              <div className="w-full px-6 py-4 rounded-xl shadow-xl border border-[#21262d] bg-[#161b22]">
                <FloatingInput onSend={handleSend} />
              </div>
            </div>
          </main>
          <div className="fixed right-0 top-0 h-screen w-80 z-40 bg-[#161b22] border-l border-[#21262d] shadow-2xl">
            <RightPanel />
          </div>
        </div>
      </div>
    </ThemeProvider>
  );
};

export default ChatLayout;
