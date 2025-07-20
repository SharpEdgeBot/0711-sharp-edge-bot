import React, { useState } from 'react';
import { motion } from 'framer-motion';

const ChatInput: React.FC<{ onSend: (msg: string) => void }> = ({ onSend }) => {
  const [value, setValue] = useState('');

  return (
    <motion.div
      className="fixed bottom-0 left-0 right-0 mx-auto max-w-2xl w-full px-4 pb-6 z-20"
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 120 }}
    >
      <div className="glass-morph flex items-center gap-2 px-4 py-3 rounded-2xl shadow-lg border border-[#23272f] bg-[#23272f]/80 backdrop-blur-lg">
        <textarea
          className="flex-1 resize-none bg-transparent text-white text-lg font-inter placeholder-gray-400 outline-none"
          rows={1}
          value={value}
          onChange={e => setValue(e.target.value)}
          placeholder="Type your sports analysis or question..."
          onKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              if (value.trim()) {
                onSend(value.trim());
                setValue('');
              }
            }
          }}
        />
        {/* Quick actions, voice, file upload placeholders */}
        <button className="p-2 rounded-full bg-electric-blue hover:bg-[#00b3cc] transition-colors shadow-md" aria-label="Send" onClick={() => { if (value.trim()) { onSend(value.trim()); setValue(''); } }}>
          <svg width="24" height="24" fill="none" stroke="#1a1a1a" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 12l14-7-7 14-2-5-5-2z" /></svg>
        </button>
      </div>
    </motion.div>
  );
};

export default ChatInput;
