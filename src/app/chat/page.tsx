"use client";
import { useState, useEffect } from 'react';
import ChatMain from '../../components/chat/ChatMain';
import ChatInput from '../../components/chat/ChatInput';
import ChatSidebar from '../../components/chat/ChatSidebar';
import ChatRightPanel from '../../components/chat/ChatRightPanel';
import LiveScoreTicker from '../../components/chat/LiveScoreTicker';
import MessageBubble from '../../components/chat/MessageBubble';

const initialHistory = [
  { id: '1', title: 'Yankees vs Red Sox', date: '2025-07-19' },
];
const initialFavorites = [
  { id: 'fav1', name: 'Yankees', logoUrl: '/team/yankees.svg' },
];

export default function ChatPage() {
  const [history] = useState(initialHistory);
  const [favorites] = useState(initialFavorites);
  const [gameId, setGameId] = useState<string | null>(null);
  const [messages, setMessages] = useState<{ content: string; role: string }[]>([]);
  const [input, setInput] = useState('');
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
        body: JSON.stringify({ message: val, gameId }),
      });
      if (!res.ok) {
        throw new Error('API error: ' + res.status);
      }
      const data = await res.json();
      // If using streamText, response will be { content: string }
      setMessages(prev => [...prev, { content: data.content || JSON.stringify(data), role: 'assistant' }]);
    } catch (err: any) {
      setError(err.message || 'Error: Unable to get response.');
      setMessages(prev => [...prev, { content: 'Error: Unable to get response.', role: 'assistant' }]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (error) {
      // eslint-disable-next-line no-console
      console.error('Chat API error:', error);
    }
    // eslint-disable-next-line no-console
    console.log('Chat messages:', messages);
  }, [error, messages]);

  return (
    <div className="flex flex-col h-screen w-full bg-gradient-to-br from-[#1a1a1a] via-[#23272f] to-[#1a1a1a]">
      <LiveScoreTicker />
      <div className="flex flex-1 w-full overflow-hidden">
        {/* Sidebar */}
        <div className="flex-shrink-0 h-full">
          <ChatSidebar
            history={history}
            favorites={favorites}
            onSelectHistory={() => {}}
            onSelectFavorite={() => {}}
          />
        </div>
        {/* Main Chat Area */}
        <div className="flex flex-col flex-1 h-full relative bg-[#181a20]">
          <div className="flex-1 overflow-y-auto px-6 py-6 scrollbar-thin scrollbar-thumb-[#23272f] scrollbar-track-[#181a20]">
            <ChatMain>
              <div className="flex flex-col gap-4">
                {messages.map((msg, idx) => (
                  <MessageBubble
                    key={idx}
                    message={msg.content}
                    sender={msg.role === 'user' ? 'user' : 'assistant'}
                  />
                ))}
                {isLoading && (
                  <MessageBubble message="Thinking..." sender="assistant" />
                )}
                {error && (
                  <MessageBubble message={typeof error === 'string' ? error : 'Error: Unable to get response.'} sender="assistant" />
                )}
              </div>
            </ChatMain>
          </div>
          <div className="w-full flex justify-center items-center px-6 pb-6 bg-[#181a20] border-t border-[#23272f]">
            <form
              onSubmit={e => {
                e.preventDefault();
                if (input.trim()) {
                  handleSend(input.trim());
                  setInput('');
                }
              }}
              className="w-full flex justify-center"
            >
              <div className="w-full max-w-2xl mx-auto">
                <ChatInput
                  onSend={val => {
                    handleSend(val);
                    setInput('');
                  }}
                />
              </div>
            </form>
          </div>
        </div>
        {/* Right Panel */}
        <div className="flex-shrink-0 h-full">
          <ChatRightPanel />
        </div>
      </div>
    </div>
  );
}
