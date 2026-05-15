import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const categoryConfigs = {
  bahasa_melayu: { emoji: '🇲🇾', label: 'Bahasa Melayu', color: 'from-amber-300 to-yellow-400', accentBg: 'bg-amber-100/30' },
  english: { emoji: '🇬🇧', label: 'English', color: 'from-sky-300 to-blue-400', accentBg: 'bg-sky-100/30' },
  mathematics: { emoji: '🔢', label: 'Matematik', color: 'from-pink-300 to-rose-400', accentBg: 'bg-pink-100/30' },
  science: { emoji: '🔬', label: 'Sains', color: 'from-emerald-300 to-green-400', accentBg: 'bg-emerald-100/30' },
  jawi: { emoji: '🕌', label: 'Aksara Jawi', color: 'from-purple-300 to-indigo-400', accentBg: 'bg-purple-100/30' },
  worksheet: { emoji: '✏️', label: 'Worksheet', color: 'from-orange-300 to-amber-400', accentBg: 'bg-orange-100/30' },
  bahasa_tamil: { emoji: '🇮🇳', label: 'Bahasa Tamil', color: 'from-orange-300 to-red-400', accentBg: 'bg-orange-100/30' },
  bahasa_mandarin: { emoji: '🇨🇳', label: 'Bahasa Mandarin', color: 'from-red-300 to-pink-400', accentBg: 'bg-red-100/30' },
};

export default function CategoryCard({ category, gameCount, idx }) {
  const config = categoryConfigs[category];
  
  return (
    <Link to={`/games/${category}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: idx * 0.08 }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.96 }}
        className="rounded-[1.5rem] sm:rounded-[2rem] overflow-hidden cursor-pointer h-full min-h-[160px] sm:min-h-[200px] group relative border border-white/20 shadow-2xl shadow-black/15 transform-gpu [clip-path:inset(0_round_1.5rem)] sm:[clip-path:inset(0_round_2rem)]"
        >
        <div className={`absolute inset-0 bg-gradient-to-br ${config.color} opacity-90`} />
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-white/5 to-transparent backdrop-blur-[1px]" />
        <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/20 blur-2xl transition-all group-hover:bg-white/30" />

        

         {/* Content */}
        <div className="relative z-10 p-4 sm:p-6 md:p-8 h-full flex flex-col justify-between">
          <div>
            <div className="text-4xl sm:text-5xl md:text-6xl mb-2 sm:mb-4">{config.emoji}</div>
            <h3 className="font-black text-lg sm:text-xl md:text-2xl text-white drop-shadow-sm leading-tight break-words">{config.label}</h3>
          </div>

          <div className="flex items-end justify-between gap-2">
            <div className="bg-slate-950/55 backdrop-blur-xl rounded-full px-3 py-1 ring-1 ring-white/40 shadow-md">
              <p className="text-xs sm:text-sm font-black text-white whitespace-nowrap">{gameCount} Permainan</p>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/25 text-white shadow-lg ring-1 ring-white/20 transition-transform group-hover:translate-x-1">→</div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}