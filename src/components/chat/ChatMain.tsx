import React from 'react';
import { motion } from 'framer-motion';

const ChatMain: React.FC<React.PropsWithChildren> = ({ children }) => (
  <main className="flex-1 flex flex-col bg-gradient-to-br from-[#1a1a1a] via-[#23272f] to-[#1a1a1a] relative overflow-hidden">
    {/* Dynamic background particles */}
    <motion.div
      className="absolute inset-0 pointer-events-none z-0"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      {/* Particle system placeholder */}
      <div className="w-full h-full" id="particle-bg" />
    </motion.div>
    {/* Chat messages */}
    <section className="flex-1 flex flex-col justify-end px-4 py-6 space-y-4 z-10">
      {children}
    </section>
  </main>
);

export default ChatMain;
