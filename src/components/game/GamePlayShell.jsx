import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import AppHeader from '@/components/AppHeader';
import GameThemeBackground from '@/components/game/GameThemeBackground';
import GameThemeToggle from '@/components/game/GameThemeToggle';
import { useGameTheme } from '@/lib/GameThemeContext';

// Shell berkongsi untuk semua game player — sediakan tema gelap/cerah,
// background sinematik, butang toggle, dan header. Standardize gaya terkini.
export default function GamePlayShell({ backTo = '/games-hub', backLabel = 'Kembali', children, rightSlot = null }) {
  const { isDark } = useGameTheme();

  return (
    <div data-game-theme={isDark ? 'dark' : 'light'} className={`min-h-screen w-full overflow-x-hidden relative font-nunito ${isDark ? 'bg-slate-950' : 'bg-slate-50'}`}>
      <GameThemeBackground />

      <AppHeader showBack={true} backTo={backTo} />

      <div className="relative max-w-lg mx-auto px-4 md:px-6 pb-16 pt-24 md:pt-32">
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between gap-2 mb-5">
          <Link
            to={backTo}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full font-black text-sm text-white bg-white/10 ring-1 ring-white/15 shadow-sm transition-all hover:scale-[1.02] hover:bg-white/20"
          >
            <ArrowLeft className="w-4 h-4" /> {backLabel}
          </Link>
          <div className="flex items-center gap-2">
            {rightSlot}
            <GameThemeToggle />
          </div>
        </motion.div>

        {children}
      </div>
    </div>
  );
}