"use client";
import React from "react";

const TypingIndicator: React.FC = () => (
  <div className="flex items-center gap-1 py-2 px-4" aria-live="polite">
    <span className="w-2 h-2 bg-[#00d4ff] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
    <span className="w-2 h-2 bg-[#39ff14] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
    <span className="w-2 h-2 bg-[#ff6b35] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
    <span className="ml-2 text-xs text-gray-400">AI is typing...</span>
  </div>
);

export default TypingIndicator;
