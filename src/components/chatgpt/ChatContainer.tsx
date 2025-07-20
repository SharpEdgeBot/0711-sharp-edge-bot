"use client";
import React from "react";

const ChatContainer: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-950 to-gray-900 px-4 py-8">
    <div className="w-full max-w-3xl rounded-2xl shadow-2xl bg-white dark:bg-[#23272f] border border-[#00d4ff] p-0 flex flex-col relative transition-colors duration-300">
      {children}
    </div>
  </div>
);

export default ChatContainer;
