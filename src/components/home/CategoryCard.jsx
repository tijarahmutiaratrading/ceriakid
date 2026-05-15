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
        whileHover={{ scale: 1.03, y: -4 }}
        className="rounded-[1.5rem] sm:rounded-[2rem] overflow-hidden cursor-pointer h-full min-h-[170px] sm:min-h-[210px] group relative border border-white/25 shadow-2xl shadow-black/25 transform-gpu [clip-path:inset(0_round_1.5rem)] sm:[clip-path:inset(0_round_2rem)]"
      >
        <div className={`absolute inset-0 bg-gradient-to-br ${config.color} opacity-90`} />
        <div className="absolute inset-0 bg-gradient-to-br from-white/25 via-white/8 to-transparent backdrop-blur-[1px]" />
        <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-white/25 blur-2xl transition-all group-hover:bg-white/40 group-hover:scale-110" />
        <div className="absolute -left-8 -bottom-8 h-24 w-24 rounded-full bg-white/15 blur-2xl transition-all group-hover:bg-white/25" />

        {/* Shimmer sweep */}
        <motion.div
          aria-hidden
          initial={{ x: '-150%' }}
          animate={{ x: '200%' }}
          transition={{ duration: 2.8, repeat: Infinity, repeatDelay: 5 + idx * 0.6, ease: 'easeInOut' }}
          className="pointer-events-none absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12"
        />

        {/* Content */}
        <div className="relative z-10 p-4 sm:p-6 md:p-7 h-full flex flex-col justify-between">
          <div>
            <motion.div
              whileHover={{ rotate: [0, -8, 8, -4, 0], scale: 1.08 }}
              transition={{ duration: 0.5 }}
              className="text-4xl sm:text-5xl md:text-6xl mb-2 sm:mb-3 drop-shadow-lg inline-block"
            >
              {config.emoji}
            </motion.div>
            <h3 className="font-black text-lg sm:text-xl md:text-2xl text-white drop-shadow-md leading-tight break-words">{config.label}</h3>
          </div>

          <div className="flex items-end justify-between gap-2">
            <div className="flex items-center gap-1.5 bg-slate-950/60 backdrop-blur-xl rounded-full pl-2 pr-3 py-1 ring-1 ring-white/40 shadow-lg">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-yellow-400 text-[10px] font-black text-slate-900">🎮</span>
              <p className="text-xs sm:text-sm font-black text-white whitespace-nowrap">{gameCount}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-purple-700 shadow-xl ring-2 ring-white/60 font-black text-lg transition-all group-hover:translate-x-1 group-hover:rotate-12">→</div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}