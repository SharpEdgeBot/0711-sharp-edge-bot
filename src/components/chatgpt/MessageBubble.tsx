"use client";
import React from "react";
import clsx from "clsx";
import MarkdownRenderer from "./MarkdownRenderer";

interface MessageBubbleProps {
  sender: "user" | "assistant";
  message: string;
  timestamp?: string;
  isStreaming?: boolean;
  onCopy?: () => void;
  onRegenerate?: () => void;
}

const bubbleStyles = {
  user: "bg-gradient-to-br from-[#00d4ff] to-[#39ff14] text-white self-end justify-end items-end",
  assistant: "bg-white dark:bg-[#23272f] text-[#23272f] dark:text-white self-start justify-start items-start border border-[#e6e6e6] dark:border-[#23272f]",
};

const MessageBubble: React.FC<MessageBubbleProps> = ({ sender, message, timestamp, isStreaming, onCopy, onRegenerate }) => (
  <div className={clsx("rounded-2xl shadow-md p-4 mb-3 max-w-[80%] flex flex-col relative", bubbleStyles[sender])}>
    <div className="whitespace-pre-line font-inter text-base">
      {sender === "assistant" ? <MarkdownRenderer content={message} /> : message}
      {isStreaming && (
        <span className="inline-block ml-2 animate-bounce text-[#00d4ff]" aria-live="polite">...</span>
      )}
    </div>
    <div className="flex items-center justify-between mt-2 text-xs text-gray-400">
      {timestamp && <span>{timestamp}</span>}
      <div className="flex gap-2">
        {onCopy && <button className="hover:text-[#00d4ff]" onClick={onCopy}>Copy</button>}
        {onRegenerate && <button className="hover:text-[#ff6b35]" onClick={onRegenerate}>Regenerate</button>}
      </div>
    </div>
  </div>
);

export default MessageBubble;
