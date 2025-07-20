"use client";
import React, { createContext, useContext, useEffect, useState } from 'react';

// Theme context for dynamic team colors and dark mode
const ThemeContext = createContext({
  teamColor: '#00d4ff', // Default electric blue
  setTeamColor: (color: string) => {},
  darkMode: true,
  setDarkMode: (val: boolean) => {},
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [teamColor, setTeamColor] = useState('#00d4ff');
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    document.documentElement.style.setProperty('--team-color', teamColor);
  }, [teamColor, darkMode]);

  return (
    <ThemeContext.Provider value={{ teamColor, setTeamColor, darkMode, setDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};
