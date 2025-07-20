"use client";
import React, { useState } from "react";
import { FiMenu, FiPlus, FiSettings, FiStar } from "react-icons/fi";

const mockHistory = [
  { id: 1, preview: "Astros vs Mariners analysis" },
  { id: 2, preview: "Compare Judge and Ohtani" },
  { id: 3, preview: "NBA Finals predictions" },
];

const Sidebar: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  return (
    <aside className={`h-screen bg-white dark:bg-[#181a1a] border-r border-[#00d4ff] flex flex-col transition-all duration-200 ${collapsed ? 'w-16' : 'w-72'} shadow-lg`} aria-label="Sidebar navigation">
      <div className="flex items-center justify-between px-4 py-4 border-b border-[#00d4ff]">
        <button onClick={() => setCollapsed(!collapsed)} className="text-[#00d4ff] text-2xl"><FiMenu /></button>
  {!collapsed && <span className="font-bold text-xl text-[#00d4ff]">MLB Betting Assistant</span>}
      </div>
      <div className="flex-1 overflow-y-auto">
        <button className="w-full flex items-center gap-2 px-4 py-3 text-[#39ff14] hover:bg-[#e6f9f0] dark:hover:bg-[#23272f] border-b border-[#00d4ff] font-semibold" aria-label="Start new chat">
          <FiPlus /> {!collapsed && "New Chat"}
        </button>
        <div className="px-4 py-2">
          <input
            className="w-full px-3 py-2 rounded-xl border border-[#00d4ff] bg-[#f5f7fa] dark:bg-[#23272f] text-black dark:text-white"
            placeholder="Search conversations..."
            aria-label="Search conversations"
          />
        </div>
        <div className="mt-4">
          <div className="font-bold text-[#ffd700] px-4 py-2">Starred</div>
          <div className="flex items-center gap-2 px-4 py-2 text-[#23272f] dark:text-white hover:bg-[#fffbe6] dark:hover:bg-[#23272f] cursor-pointer border-b border-[#00d4ff]">
            <FiStar className="text-[#ffd700]" />
            {!collapsed && <span>MLB Power Rankings</span>}
          </div>
          {mockHistory.map(chat => (
            <div key={chat.id} className="flex items-center gap-2 px-4 py-2 text-[#23272f] dark:text-white hover:bg-[#e6f9f0] dark:hover:bg-[#23272f] cursor-pointer border-b border-[#00d4ff]">
              <FiStar className="text-[#ffd700]" />
              {!collapsed && <span>{chat.preview}</span>}
            </div>
          ))}
        </div>
      </div>
      <div className="px-4 py-4 border-t border-[#00d4ff] flex items-center gap-2">
        <FiSettings className="text-[#00d4ff] cursor-pointer" aria-label="Open settings" onClick={() => setSettingsOpen(true)} />
        {!collapsed && <span className="text-[#23272f] dark:text-white cursor-pointer" onClick={() => setSettingsOpen(true)}>Settings</span>}
      </div>
      {/* SettingsModal can be added here if needed */}
    </aside>
  );
};

export default Sidebar;
