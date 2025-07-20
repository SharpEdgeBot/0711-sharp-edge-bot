"use client";
import React, { useState, useRef, useEffect } from "react";
import ChatContainer from "./ChatContainer";
import MessageBubble from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";
import ChatInput from "./ChatInput";
import Timestamp from "./Timestamp";
import SportsSelector from "./SportsSelector";
import TeamPlayerSearch from "./TeamPlayerSearch";
import QuickActions from "./QuickActions";
import StatsDashboard from "./StatsDashboard";
import GameTimeline from "./GameTimeline";

interface Message {
  sender: "user" | "assistant";
  message: string;
  timestamp: string;
  isStreaming?: boolean;
}

const getTimestamp = () => new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

const ChatMain: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [streamingMsg, setStreamingMsg] = useState<string>("");
  const [sport, setSport] = useState("MLB");
  const [selectedTeamPlayer, setSelectedTeamPlayer] = useState("");
  const [statsOpen, setStatsOpen] = useState(false);
  const [stats] = useState({ OPS: 0.9, AVG: 0.3, OBP: 0.35, SLG: 0.5 });
  const [injectedContext, setInjectedContext] = useState<any>(null);
  const [showContext, setShowContext] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingMsg]);

  const handleSend = async (msg: string) => {
    setMessages(prev => [
      ...prev,
      { sender: "user", message: msg, timestamp: getTimestamp() },
    ]);
    setLoading(true);
    setStreamingMsg("");
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg, gameId: selectedTeamPlayer || undefined }),
      });
      if (!res.ok) {
        setMessages(prev => [
          ...prev,
          { sender: "assistant", message: "Error: Unable to contact assistant.", timestamp: getTimestamp() },
        ]);
        setLoading(false);
        return;
      }
      const data = await res.json();
      let aiMsg = data.response || "No response.";
      setInjectedContext(data.gameContext || null);
      setShowContext(!!data.gameContext);
      setStreamingMsg("");
      for (let i = 0; i < aiMsg.length; i++) {
        setStreamingMsg(aiMsg.slice(0, i + 1));
        await new Promise(res => setTimeout(res, 10));
      }
      setMessages(prev => [
        ...prev,
        { sender: "assistant", message: aiMsg, timestamp: getTimestamp() },
      ]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        { sender: "assistant", message: "Error: Unable to contact assistant.", timestamp: getTimestamp() },
      ]);
    }
    setStreamingMsg("");
    setLoading(false);
  };

  return (
    <ChatContainer>
      <div className="flex flex-col gap-2 px-6 py-6 overflow-y-auto max-h-[70vh]">
        {messages.map((msg, idx) => (
          <MessageBubble
            key={idx}
            sender={msg.sender}
            message={msg.message}
            timestamp={msg.timestamp}
            isStreaming={false}
          />
        ))}
        {loading && <MessageBubble sender="assistant" message={streamingMsg} isStreaming={true} />}
        <div ref={chatEndRef} />
      </div>
      <div className="w-full flex flex-col gap-4 items-center py-4">
        <div className="flex gap-2 items-center">
          <SportsSelector value={sport} onChange={setSport} />
          <TeamPlayerSearch onSelect={setSelectedTeamPlayer} />
          <button className="px-4 py-2 rounded-xl bg-[#00d4ff] text-white font-bold" onClick={() => setStatsOpen(true)}>Show Stats</button>
        </div>
        <QuickActions onAction={action => {/* handle quick action */}} />
        <GameTimeline />
        {statsOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
            <div className="bg-[#23272f] rounded-2xl shadow-2xl p-8 w-full max-w-lg">
              <h2 className="text-xl font-bold text-[#00d4ff] mb-4">Statistics Dashboard</h2>
              <StatsDashboard stats={stats} />
              <button className="mt-6 px-4 py-2 rounded-xl bg-[#00d4ff] text-white font-bold" onClick={() => setStatsOpen(false)}>Close</button>
            </div>
          </div>
        )}
      </div>
      {showContext && injectedContext && (
        <div className="fixed top-0 right-0 h-full w-96 bg-white dark:bg-[#23272f] border-l border-[#00d4ff] shadow-xl z-50 flex flex-col py-8 px-6 animate-slidein overflow-y-auto">
          <button className="self-end mb-4 text-gray-400 hover:text-white" onClick={() => setShowContext(false)} aria-label="Close context sidebar">✕</button>
          <div className="font-bold text-xl mb-6 text-[#00d4ff]">Injected Context</div>
          {Array.isArray(injectedContext) ? (
            injectedContext.map((ctx, idx) => (
              <div key={idx} className="mb-6 p-4 rounded-xl border border-[#00d4ff] bg-[#f5f7fa] dark:bg-[#23272f]">
                {Object.entries(ctx).map(([key, value]) => (
                  <div key={key} className="mb-2">
                    <span className="font-semibold text-[#00d4ff]">{key}:</span> {typeof value === "object" ? JSON.stringify(value, null, 2) : String(value)}
                  </div>
                ))}
              </div>
            ))
          ) : (
            <div className="mb-6 p-4 rounded-xl border border-[#00d4ff] bg-[#f5f7fa] dark:bg-[#23272f]">
              {Object.entries(injectedContext).map(([key, value]) => (
                <div key={key} className="mb-2">
                  <span className="font-semibold text-[#00d4ff]">{key}:</span> {typeof value === "object" ? JSON.stringify(value, null, 2) : String(value)}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      <ChatInput onSend={handleSend} loading={loading} />
    </ChatContainer>
  );
};

export default ChatMain;
