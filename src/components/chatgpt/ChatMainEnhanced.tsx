"use client";
import React, { useState, useRef, useEffect } from "react";
import ChatContainer from "./ChatContainer";
import MessageBubble from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";
import ChatInput from "./ChatInput";
import Timestamp from "./Timestamp";
import MarkdownRenderer from "./MarkdownRenderer";
import SportSelector from "./SportSelector";
import TeamPlayerSearch from "./TeamPlayerSearch";
import StatsDashboard from "./StatsDashboard";
import QuickActions from "./QuickActions";
import GameTimeline from "./GameTimeline";

interface Message {
  sender: "user" | "assistant";
  message: string;
  timestamp: string;
  isStreaming?: boolean;
  markdown?: boolean;
  stats?: Record<string, number>;
  timeline?: Array<{ time: string; desc: string }>;
}

const getTimestamp = () => new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

const ChatMainEnhanced: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [streamingMsg, setStreamingMsg] = useState<string>("");
  const [sport, setSport] = useState("MLB");
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
    // Simulate streaming response with markdown, stats, timeline
    let aiMsg = "**Analysis:**\n\n- Team A has a strong offense.\n- Team B’s pitcher is struggling.\n\n**Prediction:** Team A wins.";
    for (let i = 0; i < aiMsg.length; i++) {
      setStreamingMsg(aiMsg.slice(0, i + 1));
      await new Promise(res => setTimeout(res, 15));
    }
    setMessages(prev => [
      ...prev,
      {
        sender: "assistant",
        message: aiMsg,
        timestamp: getTimestamp(),
        markdown: true,
        stats: { "OPS": 0.820, "ERA": 4.12, "WHIP": 1.23, "wOBA": 0.340 },
        timeline: [
          { time: "1st Inning", desc: "Home run by Judge" },
          { time: "3rd Inning", desc: "Double by Ohtani" },
        ],
      },
    ]);
    setStreamingMsg("");
    setLoading(false);
  };

  const handleQuickAction = (action: string) => {
    handleSend(action);
  };

  const handleTeamPlayerSelect = (type: "team" | "player", name: string) => {
    handleSend(`Analyze ${type}: ${name}`);
  };

  return (
    <ChatContainer>
      <div className="flex flex-col gap-2 px-6 py-6 overflow-y-auto max-h-[70vh]">
        <SportSelector value={sport} onChange={setSport} />
        <TeamPlayerSearch onSelect={handleTeamPlayerSelect} />
        <QuickActions onAction={handleQuickAction} />
        {messages.map((msg, idx) => (
          <div key={idx}>
            <MessageBubble
              sender={msg.sender}
              message={msg.message}
              timestamp={msg.timestamp}
              isStreaming={false}
            />
            {msg.markdown && <MarkdownRenderer content={msg.message} />}
            {msg.stats && <StatsDashboard stats={msg.stats} />}
            {msg.timeline && <GameTimeline events={msg.timeline} />}
          </div>
        ))}
        {loading && <MessageBubble sender="assistant" message={streamingMsg} isStreaming={true} />}
        <div ref={chatEndRef} />
      </div>
      <ChatInput onSend={handleSend} loading={loading} />
    </ChatContainer>
  );
};

export default ChatMainEnhanced;
