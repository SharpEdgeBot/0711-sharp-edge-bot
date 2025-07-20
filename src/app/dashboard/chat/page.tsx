"use client";

import { useRef, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Global left sidebar navigation (matches app-wide)
function GlobalSidebar() {
  return (
    <aside className="w-64 shrink-0 bg-gray-950 border-r border-gray-800 flex flex-col py-8 px-6">
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
    { id: "1", text: "Welcome to the MLB Betting Assistant!", sender: "ai", timestamp: "09:00" },
    { id: "2", text: "How can I help you today?", sender: "ai", timestamp: "09:01" },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showContext, setShowContext] = useState(false);
  const [injectedContext, setInjectedContext] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });
      if (!res.ok) {
        setMessages((msgs) => [
          ...msgs,
          {
            id: Date.now().toString() + "-ai",
            text: "Error: Unable to contact assistant.",
            sender: "ai",
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
        ]);
        setIsTyping(false);
        return;
      }
      const data = await res.json();
      setMessages((msgs) => [
        ...msgs,
        {
          id: Date.now().toString() + "-ai",
          text: data.response || "No response.",
          sender: "ai",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
      if (data.gameContext) {
        setInjectedContext(data.gameContext);
        setShowContext(true);
      } else {
        setInjectedContext(null);
        setShowContext(false);
      }
    } catch (err) {
      setMessages((msgs) => [
        ...msgs,
        {
          id: Date.now().toString() + "-ai",
          text: "Error: Unable to contact assistant.",
          sender: "ai",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    }
    setIsTyping(false);
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-950 to-gray-900 text-white">
      {/* Left Sidebar (fixed) */}
      <div className="w-64 h-full flex-shrink-0 fixed left-0 top-0 z-40">
        <GlobalSidebar />
      </div>
      {/* Main Chat Area (center, margin for sidebars) */}
      <div className="flex-1 flex flex-col relative" style={{ marginLeft: 256, marginRight: showContext ? 384 : 0 }}>
        {/* Chat Messages (scrollable) */}
        <div className="flex-1 overflow-y-auto px-4 py-6" style={{ marginBottom: 80 }}>
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
        {/* Chat Input (fixed at bottom, center) */}
        <form
          className="chat-input w-full px-4 pb-6 fixed bottom-0 left-0 right-0 bg-gradient-to-t from-gray-950 to-transparent z-30"
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage();
          }}
          style={{ height: 80, marginLeft: 256, marginRight: showContext ? 384 : 0 }}
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            maxLength={300}
            aria-label="Chat message input"
            className="w-full px-4 py-3 rounded-lg bg-gray-800 text-white focus:outline-none"
          />
          <button type="submit" className="modern-btn mt-2 w-full">Send</button>
        </form>
      </div>
      {/* Right Context Sidebar (fixed) */}
      {showContext && (
        <div className="h-full w-96 fixed right-0 top-0 z-50">
          <ContextSidebar context={injectedContext} onClose={() => setShowContext(false)} />
        </div>
      )}
    </div>
  );
}