import React, { useRef, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  id: string;
  text: string;
  sender: "user" | "ai";
  timestamp: string;
  status?: "sending" | "sent" | "error";
}

export default function ChatOverlay() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const newMsg: Message = {
      id: Date.now().toString(),
      text: input,
      sender: "user",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      status: "sending",
    };
    setMessages((msgs) => [...msgs, newMsg]);
    setInput("");
    setIsTyping(true);
    // Simulate AI response
    setTimeout(() => {
      setMessages((msgs) =>
        msgs.map((m) => (m.id === newMsg.id ? { ...m, status: "sent" } : m))
      );
      setTimeout(() => {
        setMessages((msgs) => [
          ...msgs,
          {
            id: Date.now().toString() + "-ai",
            text: `AI: ${newMsg.text}`,
            sender: "ai",
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            status: "sent",
          },
        ]);
        setIsTyping(false);
      }, 1200);
    }, 600);
  };

  return (
    <div className="chat-overlay glass bg-[var(--background)] text-[var(--foreground)] font-sans">
  <div className="chat-header gradient-text">MLB Betting Assistant</div>
      <div className="chat-messages">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`chat-message ${msg.sender}`}
            >
              <div className={`chat-bubble ${msg.sender}`}>{msg.text}</div>
              <div className="chat-timestamp">{msg.timestamp}</div>
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
          className="bg-[var(--card)] text-[var(--card-foreground)] border border-[var(--accent-blue)] rounded-md px-3 py-2 font-mono"
        />
        <button type="submit" className="modern-btn">
          Send
        </button>
      </form>
    </div>
  );
}
