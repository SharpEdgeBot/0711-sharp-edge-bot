"use client";
import React from "react";
import { FiUser } from "react-icons/fi";
import ThemeToggle from "./ThemeToggle";

const HeaderBar: React.FC = () => (
  <header className="w-full flex items-center justify-between px-8 py-5 bg-white dark:bg-[#23272f] border-b border-[#00d4ff] shadow-md" aria-label="App header">
  <span className="font-bold text-2xl text-[#00d4ff] tracking-tight">MLB Betting Assistant</span>
    <div className="flex items-center gap-4" aria-label="User menu">
      <ThemeToggle />
      <FiUser className="text-[#23272f] dark:text-white text-2xl" />
      <span className="text-[#23272f] dark:text-white font-medium">User</span>
    </div>
  </header>
);

export default HeaderBar;
