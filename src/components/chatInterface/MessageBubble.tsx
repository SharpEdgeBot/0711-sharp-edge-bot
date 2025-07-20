"use client";
import React from 'react';
import { motion } from 'framer-motion';

interface MessageBubbleProps {
  sender: 'user' | 'assistant';
  message: string;
  avatarUrl?: string;
  teamLogoUrl?: string;
  stats?: React.ReactNode;
}

const bubbleColors = {
  user: 'bg-[#23272f] text-[#00d4ff]',
  assistant: 'bg-[#181a20] text-white',
};

const MessageBubble: React.FC<MessageBubbleProps> = ({ sender, message, avatarUrl, teamLogoUrl, stats }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    className={`flex items-start gap-3 rounded-2xl shadow-lg p-4 ${bubbleColors[sender]} backdrop-blur-lg border border-[#23272f]`}
    style={{ alignSelf: sender === 'user' ? 'flex-end' : 'flex-start', maxWidth: '70%' }}
  >
    {teamLogoUrl && (
      <img src={teamLogoUrl} alt="Team Logo" className="w-8 h-8 rounded-full border border-[#00d4ff]" />
    )}
    {avatarUrl && (
      <img src={avatarUrl} alt="Avatar" className="w-8 h-8 rounded-full border border-[#ff6b35]" />
    )}
    <div className="flex-1">
      <div className="font-mono text-base whitespace-pre-line">
        {message}
      </div>
      {stats && <div className="mt-2">{stats}</div>}
    </div>
  </motion.div>
);

export default MessageBubble;
