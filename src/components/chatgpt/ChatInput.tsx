"use client";
import React, { useState } from "react";

const ChatInput: React.FC<{ onSend: (msg: string) => void; loading?: boolean }> = ({ onSend, loading }) => {
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim() || loading) return;
    onSend(input);
    setInput("");
  };

  return (
    <div className="w-full flex items-center gap-2 px-4 py-3 border-t border-[#23272f] bg-[#181a1a] sticky bottom-0">
      <textarea
        aria-label="Chat input"
        className="flex-1 bg-transparent text-white resize-none outline-none font-inter text-lg placeholder:text-[#00d4ff] rounded-xl"
        placeholder="Type your sports analysis..."
        rows={1}
        style={{ minHeight: "2.5rem", maxHeight: "8rem" }}
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={e => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
          }
        }}
        disabled={loading}
      />
      <button
        aria-label="Send message"
        className="text-[#00d4ff] hover:text-[#ff6b35] font-bold px-5 py-2 rounded-xl shadow-lg bg-[#181a1a] border border-[#00d4ff]"
        onClick={handleSend}
        disabled={loading}
      >
        {loading ? <span className="animate-pulse">Sending...</span> : "Send"}
      </button>
    </div>
  );
};

export default ChatInput;
