import React from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { useGameTheme } from '@/lib/GameThemeContext';

// Butang toggle tema main game — Gelap / Cerah.
// Hanya dipaparkan dalam halaman main game.
export default function GameThemeToggle({ className = '' }) {
  const { isDark, toggleTheme } = useGameTheme();

  return (
    <motion.button
      whileTap={{ scale: 0.92 }}
      onClick={toggleTheme}
      title={isDark ? 'Tukar ke tema cerah' : 'Tukar ke tema gelap'}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-black text-xs transition-all ${
        isDark
          ? 'bg-white/10 text-white ring-1 ring-white/15 hover:bg-white/20'
          : 'bg-white text-slate-700 ring-1 ring-slate-200 shadow-sm hover:bg-slate-50'
      } ${className}`}
    >
      {isDark ? <Sun className="w-3.5 h-3.5 text-amber-300" /> : <Moon className="w-3.5 h-3.5 text-violet-500" />}
      {isDark ? 'Cerah' : 'Gelap'}
    </motion.button>
  );
}