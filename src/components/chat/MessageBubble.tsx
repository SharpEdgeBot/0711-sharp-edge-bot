import React from 'react';
import { motion } from 'framer-motion';

interface MessageBubbleProps {
  message: string;
  sender: 'user' | 'assistant';
  avatarUrl?: string;
  teamLogoUrl?: string;
  stats?: React.ReactNode;
}


const StatCard: React.FC<{ stat: string; value: string; team?: string; logo?: string }> = ({ stat, value, team, logo }) => (
  <motion.div
    className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#23272f]/90 shadow-glass border border-electric-blue"
    initial={{ scale: 0.95, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    whileHover={{ scale: 1.05, boxShadow: '0 0 16px #00d4ff' }}
    transition={{ type: 'spring', stiffness: 180 }}
  >
    {logo && <img src={logo} alt={team} className="w-6 h-6 rounded-full mr-2" />}
    <span className="font-mono text-sm text-electric-blue font-bold">{stat}</span>
    <span className="font-mono text-lg text-neon-green font-extrabold ml-2">{value}</span>
    {team && <span className="italic text-xs ml-2 text-orange-500">{team}</span>}
  </motion.div>
);

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, sender, avatarUrl, teamLogoUrl, stats }) => (
  <motion.div
    className={`flex items-end gap-3 ${sender === 'user' ? 'justify-end' : 'justify-start'} w-full`}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ type: 'spring', stiffness: 120 }}
  >
    {sender === 'assistant' && (
      <img src={teamLogoUrl || avatarUrl || '/window.svg'} alt="Assistant" className="w-8 h-8 rounded-full shadow-md border border-electric-blue" />
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
      <img src={avatarUrl || '/window.svg'} alt="User" className="w-8 h-8 rounded-full shadow-md border border-orange-500" />
    )}
  </motion.div>
);

export default MessageBubble;
