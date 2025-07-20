"use client";

import { useRef, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Global left sidebar navigation (matches app-wide)
function GlobalSidebar() {
  return (
    <aside className="w-64 shrink-0 bg-gray-950 border-r border-gray-800 flex flex-col py-8 px-6">
      <div className="font-bold text-2xl mb-10 tracking-tight">SharpEdge</div>
      <nav className="flex flex-col gap-5">
        <a href="/dashboard" className="nav-link">Dashboard</a>
        <a href="/dashboard/games" className="nav-link">Games</a>
        <a href="/dashboard/lines" className="nav-link">Lines</a>
        <a href="/dashboard/projections" className="nav-link">Projections</a>
        <a href="/dashboard/props" className="nav-link">Props</a>
        <a href="/dashboard/chat" className="nav-link font-semibold text-blue-400">Chat</a>
      </nav>
    </aside>
  );

}
// Popup right sidebar for injected context
function ContextSidebar({ context, onClose }: { context: any, onClose: () => void }) {
  if (!context) return null;
  return (
    <div className="fixed top-0 right-0 h-full w-96 bg-gray-950 border-l border-gray-800 shadow-xl z-50 flex flex-col py-8 px-6 animate-slidein">
      <button className="self-end mb-4 text-gray-400 hover:text-white" onClick={onClose} aria-label="Close context sidebar">✕</button>
      <div className="font-bold text-xl mb-6">Injected Context</div>
      <div className="text-sm text-gray-300 space-y-3">
        {/* Example context, replace with actual injected context as needed */}
        {context.userTier && <div>User Tier: <span className="font-semibold text-blue-400">{context.userTier}</span></div>}
        {context.currentGame && <div>Current Game: <span className="font-semibold">{context.currentGame}</span></div>}
        {context.model && <div>Model: <span className="font-semibold">{context.model}</span></div>}
        {context.lastPrediction && <div>Last Prediction: <span className="font-semibold text-green-400">{context.lastPrediction}</span></div>}
        {context.aiStatus && <div>AI Assistant: <span className="font-semibold text-purple-400">{context.aiStatus}</span></div>}
      </div>

    </div>
  );
}

interface Message {
  id: string;
  text: string;
  sender: "user" | "ai";
  timestamp: string;
  status?: "sending" | "sent" | "error";
}


export default function ChatDashboard() {
  const [messages, setMessages] = useState([
    { id: "1", text: "Welcome to SharpEdge Chat!", sender: "ai", timestamp: "09:00" },
    { id: "2", text: "How can I help you today?", sender: "ai", timestamp: "09:01" },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showContext, setShowContext] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Example injected context (replace with real context as needed)
  const injectedContext = showContext
    ? {
        userTier: "Pro",
        currentGame: "Yankees vs Red Sox",
        model: "SharpEdge v2.1",
        lastPrediction: "Over 8.5 Runs",
        aiStatus: "Online",
      }
    : null;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const newMsg = {
      id: Date.now().toString(),
      text: input,
      sender: "user",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setMessages((msgs) => [...msgs, newMsg]);
    setInput("");
    setIsTyping(true);
    setTimeout(() => {
      setMessages((msgs) => [
        ...msgs,
        {
          id: Date.now().toString() + "-ai",
          text: `AI: ${newMsg.text}`,
          sender: "ai",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
      setIsTyping(false);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 to-gray-900 flex text-white">
      {/* Sidebar */}
      <GlobalSidebar />
      {/* Chat Area */}
      <main className="flex-1 flex items-center justify-center relative">
        {/* Chat Card - Centered */}
        <div className="modern-card flex flex-col justify-center items-center mx-auto w-full max-w-2xl" style={{ minHeight: 500 }}>
          <div className="flex-1 chat-messages overflow-y-auto" style={{ maxHeight: 400 }}>
            <AnimatePresence initial={false}>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={`chat-message ${msg.sender}`}
                >
                  <div className={`chat-bubble ${msg.sender}`}>{msg.text}
                    <div className="chat-timestamp">{msg.timestamp}</div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {isTyping && (
              <div className="chat-message ai">
                <div className="chat-bubble ai">
                  <div className="typing-indicator">
                    <span className="typing-dot" />
                    <span className="typing-dot" />
                    <span className="typing-dot" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          {/* Input Area */}
          <form
            className="chat-input"
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage();
            }}
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              maxLength={300}
              aria-label="Chat message input"
            />
            <button type="submit" className="modern-btn">Send</button>
          </form>
        </div>
      </main>
      {/* Popup right sidebar for injected context */}
      {showContext && <ContextSidebar context={injectedContext} onClose={() => setShowContext(false)} />}
    </div>
  );
}