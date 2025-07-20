"use client";
import React from "react";
import Sidebar from "./Sidebar";
// import HeaderBar from "./HeaderBar";
import ChatMain from "./ChatMain";
import { ThemeProvider } from "./ThemeContext";
import ThemeToggle from "./ThemeToggle";

const ChatGPTLayout: React.FC = () => (
  <ThemeProvider>
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#181a1a] to-[#23272f]">
  {/* HeaderBar removed as requested */}
      <div className="absolute top-4 right-8 z-50">
        <ThemeToggle />
      </div>
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 flex flex-col items-center justify-center">
          <ChatMain />
        </main>
      </div>
    </div>
  </ThemeProvider>
);

export default ChatGPTLayout;
