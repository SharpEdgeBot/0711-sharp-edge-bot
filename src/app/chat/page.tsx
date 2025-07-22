"use client";

import { useState } from 'react';
import ChatInput from '../../components/chat/ChatInput';
import MessageBubble from '../../components/chat/MessageBubble';
import LiveScoreTicker from '../../components/chat/LiveScoreTicker';
import GamesWithOdds from '../../components/GamesWithOdds';
import ChatSidebar from '../../components/chat/ChatSidebar';


export default function ChatPage() {
  const [messages, setMessages] = useState<{ content: string; role: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSend = async (val: string) => {
    setIsLoading(true);
    setError(null);
    setMessages(prev => [...prev, { content: val, role: 'user' }]);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: val }),
      });
      if (!res.ok) {
        throw new Error('API error: ' + res.status);
      }
      const data = await res.json();
      setMessages(prev => [...prev, { content: data.content || JSON.stringify(data), role: 'assistant' }]);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error: Unable to get response.';
      setError(errorMessage);
      setMessages(prev => [...prev, { content: errorMessage, role: 'assistant' }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Layout: Sidebar | Main (Games+Odds) | Chat
  return (
    <div className="flex h-screen w-full bg-gradient-to-br from-[#181c24] via-[#23272f] to-[#181c24] text-white">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-20 bg-[#181c24] border-r border-[#23272f] p-4 items-center gap-4">
        <ChatSidebar
          history={[]} // TODO: Replace with actual chat history array
          favorites={[]} // TODO: Replace with actual favorites array
          onSelectHistory={() => {}} // TODO: Replace with actual handler
          onSelectFavorite={() => {}} // TODO: Replace with actual handler
        />
      </aside>

      {/* Main content: Games and Odds */}
      <main className="flex-1 flex flex-col overflow-y-auto">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-[#181c24]/90 border-b border-[#23272f] px-6 py-3 flex items-center gap-4">
          <span className="w-10 h-10 bg-gradient-to-r from-[#3b82f6] to-[#a855f7] rounded-lg flex items-center justify-center text-2xl">🏆</span>
          <div>
            <h1 className="text-lg font-semibold">MLB Sharp Edge</h1>
            <p className="text-xs text-gray-400">Today’s Games & Odds</p>
          </div>
        </header>
        {/* Live Score Ticker */}
        <div className="sticky top-[56px] z-40 bg-[#181c24]/80">
          <LiveScoreTicker />
        </div>
        {/* Games and Odds */}
        <section className="flex-1 px-4 py-6 md:px-8 md:py-10 overflow-y-auto">
          <GamesWithOdds />
        </section>
      </main>

      {/* Chat panel */}
      <aside className="w-full md:w-[400px] max-w-[100vw] flex flex-col border-l border-[#23272f] bg-[#181c24] h-full">
        <div className="flex-1 flex flex-col">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-gray-400 py-8">
                <span className="text-3xl">💬</span>
                <div className="mt-2 text-lg font-semibold">Chat about today’s games, odds, and more!</div>
              </div>
            )}
            {messages.map((msg, idx) => (
              <MessageBubble
                key={idx}
                message={msg.content}
                sender={msg.role === 'user' ? 'user' : 'assistant'}
              />
            ))}
            {isLoading && (
              <MessageBubble message="Thinking ..." sender="assistant" />
            )}
            {error && (
              <MessageBubble message={typeof error === 'string' ? error : 'Error: Unable to get response.'} sender="assistant" />
            )}
          </div>
          <div className="p-4 border-t border-[#23272f] bg-[#181c24]">
            <ChatInput onSend={handleSend} />
          </div>
        </div>
      </aside>
    </div>
  );
}
