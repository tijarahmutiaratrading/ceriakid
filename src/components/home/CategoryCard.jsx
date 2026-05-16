import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const categoryConfigs = {
  bahasa_melayu: {
    emoji: '🇲🇾',
    label: 'Bahasa Melayu',
    sub: 'Baca • Eja • Faham',
    gradient: 'from-amber-400 via-orange-500 to-rose-500',
    glow: 'shadow-orange-500/40',
    accent: '🌟',
  },
  english: {
    emoji: '🇬🇧',
    label: 'English',
    sub: 'Read • Speak • Play',
    gradient: 'from-sky-400 via-blue-500 to-indigo-600',
    glow: 'shadow-blue-500/40',
    accent: '⭐',
  },
  mathematics: {
    emoji: '🔢',
    label: 'Matematik',
    sub: 'Kira • Selesaikan',
    gradient: 'from-pink-400 via-fuchsia-500 to-purple-600',
    glow: 'shadow-fuchsia-500/40',
    accent: '✨',
  },
  science: {
    emoji: '🔬',
    label: 'Sains',
    sub: 'Eksperimen • Terokai',
    gradient: 'from-emerald-400 via-teal-500 to-cyan-600',
    glow: 'shadow-emerald-500/40',
    accent: '🌱',
  },
  jawi: {
    emoji: '🕌',
    label: 'Aksara Jawi',
    sub: 'Kenal • Sebut • Tulis',
    gradient: 'from-violet-400 via-purple-500 to-indigo-600',
    glow: 'shadow-violet-500/40',
    accent: '☪️',
  },
  bahasa_tamil: {
    emoji: '🌺',
    label: 'Bahasa Tamil',
    sub: 'அ • சொல் • வாசி',
    gradient: 'from-orange-400 via-red-500 to-pink-600',
    glow: 'shadow-red-500/40',
    accent: '🪔',
  },
  bahasa_mandarin: {
    emoji: '🏮',
    label: 'Bahasa Mandarin',
    sub: '听 • 说 • 认字',
    gradient: 'from-red-400 via-rose-500 to-orange-500',
    glow: 'shadow-rose-500/40',
    accent: '🎋',
  },
  worksheet: {
    emoji: '✏️',
    label: 'Worksheet',
    sub: 'Latihan bertulis',
    gradient: 'from-amber-400 via-yellow-500 to-orange-500',
    glow: 'shadow-amber-500/40',
    accent: '📝',
  },
};

export default function CategoryCard({ category, gameCount, idx }) {
  const config = categoryConfigs[category];
  if (!config) return null;

  return (
    <Link to={`/games/${category}`} className="block">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: idx * 0.06, type: 'spring', damping: 20 }}
        whileHover={{ scale: 1.03, y: -4 }}
        whileTap={{ scale: 0.96 }}
        className={`relative isolate overflow-hidden cursor-pointer h-full min-h-[170px] sm:min-h-[200px] group rounded-3xl shadow-xl ${config.glow}`}
      >
        {/* Gradient background */}
        <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${config.gradient}`} />

        {/* Glass overlay */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/25 via-white/5 to-transparent" />

        {/* Decorative orbs */}
        <div className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-white/25 blur-3xl transition-all group-hover:bg-white/40 group-hover:scale-110" />
        <div className="pointer-events-none absolute -left-8 -bottom-8 h-28 w-28 rounded-full bg-white/15 blur-2xl" />

        {/* Floating accent emoji */}
        <motion.div
          animate={{ y: [0, -6, 0], rotate: [0, 8, -8, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-3 right-3 text-2xl opacity-80 drop-shadow-lg"
        >
          {config.accent}
        </motion.div>

        {/* Content */}
        <div className="relative z-10 p-4 sm:p-5 h-full flex flex-col justify-between">
          <div>
            <motion.div
              whileHover={{ scale: 1.15, rotate: -5 }}
              transition={{ type: 'spring', damping: 12 }}
              className="inline-flex items-center justify-center h-14 w-14 sm:h-16 sm:w-16 rounded-2xl bg-white/30 ring-2 ring-white/40 backdrop-blur-sm text-3xl sm:text-4xl mb-3 shadow-lg"
            >
              {config.emoji}
            </motion.div>
            <h3
              className="font-black text-base sm:text-lg text-white leading-tight"
              style={{ textShadow: '0 2px 8px rgba(0,0,0,0.35)' }}
            >
              {config.label}
            </h3>
            <p className="text-[11px] sm:text-xs font-bold text-white/90 mt-0.5 leading-tight">
              {config.sub}
            </p>
          </div>

          <div className="flex items-end justify-between gap-2 mt-3">
            <div className="bg-white/25 backdrop-blur-xl rounded-full px-2.5 py-1 ring-1 ring-white/40 shadow-md">
              <p className="text-[10px] sm:text-xs font-black text-white whitespace-nowrap">
                🎮 {gameCount}
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-purple-700 shadow-lg ring-2 ring-white/50 transition-transform group-hover:translate-x-1">
              <ArrowRight className="h-4 w-4 stroke-[3]" />
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}