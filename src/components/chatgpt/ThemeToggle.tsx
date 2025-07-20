"use client";
import React from "react";
import { FiSun, FiMoon } from "react-icons/fi";
import { useTheme } from "./ThemeContext";

const ThemeToggle: React.FC = () => {
  const { theme, setTheme } = useTheme();
  return (
    <button
      aria-label="Toggle theme"
      className="ml-2 p-2 rounded-full border border-[#00d4ff] bg-[#23272f] hover:bg-[#181a1a] text-[#00d4ff]"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
    >
      {theme === "dark" ? <FiSun /> : <FiMoon />}
    </button>
  );
};

export default ThemeToggle;
