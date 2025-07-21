import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

interface MessageBubbleProps {
  message: string;
  sender: 'user' | 'assistant';
  avatarUrl?: string;
  teamLogoUrl?: string;
  stats?: React.ReactNode;
}



const MessageBubble: React.FC<MessageBubbleProps> = ({ message, sender, avatarUrl, teamLogoUrl, stats }) => (
  <motion.div
    className={`flex items-end gap-3 ${sender === 'user' ? 'justify-end' : 'justify-start'} w-full`}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ type: 'spring', stiffness: 120 }}
  >
    {sender === 'assistant' && (
      <Image src={teamLogoUrl || avatarUrl || '/window.svg'} alt="Assistant" width={32} height={32} className="w-8 h-8 rounded-full shadow-md border border-electric-blue" />
    )}
    <motion.div
      className={`max-w-xl px-5 py-4 rounded-2xl shadow-lg glass-morph ${sender === 'user' ? 'bg-electric-blue text-[#1a1a1a]' : 'bg-[#23272f]/80 text-white'} relative`}
      initial={{ scale: 0.98 }}
      animate={{ scale: 1 }}
      whileHover={{ scale: 1.02, boxShadow: '0 0 24px #00d4ff' }}
      transition={{ type: 'spring', stiffness: 160 }}
    >
      <div className="font-mono text-base whitespace-pre-line">
        {message}
      </div>
      {/* Example embedded stat card for demonstration */}
      {stats && <div className="mt-2">{stats}</div>}
      {/* Example: <StatCard stat="OPS" value="0.892" team="Yankees" logo="/team/yankees.svg" /> */}
    </motion.div>
    {sender === 'user' && (
      <Image src={avatarUrl || '/window.svg'} alt="User" width={32} height={32} className="w-8 h-8 rounded-full shadow-md border border-orange-500" />
    )}
  </motion.div>
);

export default MessageBubble;
