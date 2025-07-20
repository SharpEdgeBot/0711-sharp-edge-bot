"use client";
import React from 'react';
import MessageBubble from './MessageBubble';


type MessageType = {
  sender: 'user' | 'assistant';
  message: string;
  avatarUrl?: string;
  teamLogoUrl?: string;
  stats?: React.ReactNode;
};

const ChatArea: React.FC<{ messages: MessageType[] }> = ({ messages }) => (
  <section className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-4">
    {messages.map((msg, idx) => (
      <MessageBubble key={idx} {...msg} />
    ))}
  </section>
);

export default ChatArea;
