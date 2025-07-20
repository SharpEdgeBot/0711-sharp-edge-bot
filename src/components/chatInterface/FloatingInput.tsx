"use client";
import React from 'react';


const quickActions = [
  { label: 'Standings', color: '#00d4ff' },
  { label: 'Schedules', color: '#ff6b35' },
  { label: 'Player Stats', color: '#39ff14' },
];


import { useState } from 'react';

const FloatingInput: React.FC<{ onSend?: (msg: string) => void }> = ({ onSend }) => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;
    setLoading(true);
    if (onSend) await onSend(input);
    setInput('');
    setLoading(false);
  };

  return (
    <div className="absolute bottom-6 left-0 right-0 flex justify-center pointer-events-none">
      <div className="pointer-events-auto w-full max-w-2xl bg-gradient-to-br from-[#23272f] to-[#1a1a1a] bg-opacity-90 backdrop-blur-2xl rounded-3xl shadow-2xl flex items-center px-6 py-4 gap-3 border border-[#00d4ff] animate-fade-in">
        <textarea
          className="flex-1 bg-transparent text-white resize-none outline-none font-inter text-lg placeholder:text-[#00d4ff] transition-all duration-200 focus:ring-2 focus:ring-[#00d4ff] rounded-xl"
          placeholder="Type your sports analysis..."
          rows={1}
          style={{ minHeight: '2.5rem', maxHeight: '8rem' }}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
        />
        <div className="flex gap-1">
          {quickActions.map((action) => (
            <button key={action.label} className="px-3 py-2 rounded-xl font-bold text-xs shadow-md" style={{ background: action.color, color: '#181a20' }}>
              {action.label}
            </button>
          ))}
        </div>
        <button
          className={`text-[#00d4ff] hover:text-[#ff6b35] transition-colors font-bold px-5 py-2 rounded-xl shadow-lg bg-[#181a1a] border border-[#00d4ff] ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          onClick={handleSend}
          disabled={loading}
        >
          {loading ? (
            <span className="animate-pulse">Sending...</span>
          ) : (
            'Send'
          )}
        </button>
        <button className="ml-2 text-[#ffd700] hover:text-[#ff6b35] transition-colors" title="Voice Input">
          <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3a4 4 0 0 1 4 4v6a4 4 0 0 1-8 0V7a4 4 0 0 1 4-4zm-1 17.93V21h2v-.07A8.001 8.001 0 0 0 20 13h-2a6 6 0 0 1-12 0H4a8.001 8.001 0 0 0 7 7.93z"/></svg>
        </button>
        <label className="ml-2 cursor-pointer text-[#39ff14] hover:text-[#00d4ff] transition-colors" title="Upload File">
          <input type="file" className="hidden" />
          <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path d="M16.59 8.59L12 13.17l-4.59-4.58L6 10l6 6 6-6z"/></svg>
        </label>
      </div>
    </div>
  );
};

export default FloatingInput;
