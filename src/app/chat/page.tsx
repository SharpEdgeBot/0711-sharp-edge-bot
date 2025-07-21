"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import ChatInput from '../../components/chat/ChatInput';
import MessageBubble from '../../components/chat/MessageBubble';
import LiveScoreTicker from '../../components/chat/LiveScoreTicker';

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

  useEffect(() => {
    if (error) {
      console.error('Chat API error:', error);
    }
    console.log('Chat messages:', messages);
  }, [error, messages]);

  return (

    <div className="flex flex-col h-screen w-full bg-[var(--bg-primary)]">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-black/80 border-b border-[var(--border-default)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-purple)] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">🏆</span>
              </div>
              <div>
                <h1 className="text-lg font-semibold text-white">Sports AI Assistant</h1>
                <p className="text-xs text-gray-400 hidden sm:block">Ask me anything about sports analytics</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors">
                <span className="text-gray-300">👤</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Live MLB Score Ticker */}
      <div className="sticky top-16 z-40">
        <LiveScoreTicker />
      </div>

      {/* Main chat container */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 max-w-4xl mx-auto w-full flex flex-col p-4 lg:p-8">
          {/* Welcome message */}
          {messages.length === 0 && (
            <motion.div
              className="mb-6 text-center"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-purple)] rounded-2xl mb-4">
                <span className="text-white text-3xl">🏆</span>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Sports AI Assistant</h2>
              <p className="text-gray-400 max-w-md mx-auto">Get real-time sports analysis, predictions, and insights powered by AI</p>
            </motion.div>
          )}

          {/* Chat messages area */}
          <div className="flex-1 bg-[var(--bg-secondary)]/50 backdrop-blur-sm border border-[var(--border-default)] rounded-2xl flex flex-col overflow-hidden mb-4">
            {/* Chat output with its own scroll */}
            <div className="max-h-[60vh] overflow-y-auto p-6 space-y-4 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
              {messages.map((msg, idx) => (
                <MessageBubble
                  key={idx}
                  message={msg.content}
                  sender={msg.role === 'user' ? 'user' : 'assistant'}
                />
              ))}
              {isLoading && (
                <MessageBubble message="Identifying Sharp Edges ..." sender="assistant" />
              )}
              {error && (
                <MessageBubble message={typeof error === 'string' ? error : 'Error: Unable to get response.'} sender="assistant" />
              )}
            </div>
            {/* Input area */}
            <div className="p-6 border-t border-[var(--border-default)] bg-[var(--bg-secondary)]/30 backdrop-blur-sm">
              <ChatInput
                onSend={val => {
                  handleSend(val);
                }}
              />
              {/* Quick actions */}
              <div className="flex items-center space-x-2 mt-3">
                <span className="text-xs text-gray-500">Quick actions:</span>
                <button className="px-3 py-1 bg-[var(--bg-secondary)]/50 hover:bg-gray-700 rounded-full text-xs text-gray-300 transition-colors">NBA Scores</button>
                <button className="px-3 py-1 bg-[var(--bg-secondary)]/50 hover:bg-gray-700 rounded-full text-xs text-gray-300 transition-colors">NFL Predictions</button>
                <button className="px-3 py-1 bg-[var(--bg-secondary)]/50 hover:bg-gray-700 rounded-full text-xs text-gray-300 transition-colors">Player Stats</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
