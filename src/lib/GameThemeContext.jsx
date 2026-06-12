import React, { createContext, useContext, useState, useCallback } from 'react';

const STORAGE_KEY = 'ceriakid_game_theme';

const GameThemeContext = createContext(null);

export function GameThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) || 'dark';
    } catch {
      return 'dark';
    }
  });

  const setTheme = useCallback((next) => {
    setThemeState(next);
    try { localStorage.setItem(STORAGE_KEY, next); } catch {}
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      try { localStorage.setItem(STORAGE_KEY, next); } catch {}
      return next;
    });
  }, []);

  return (
    <GameThemeContext.Provider value={{ theme, setTheme, toggleTheme, isDark: theme === 'dark' }}>
      {children}
    </GameThemeContext.Provider>
  );
}

export function useGameTheme() {
  const ctx = useContext(GameThemeContext);
  // Fallback bila digunakan luar provider — default gelap
  return ctx || { theme: 'dark', setTheme: () => {}, toggleTheme: () => {}, isDark: true };
}