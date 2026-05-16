import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Lock, Play, Star, Sparkles } from 'lucide-react';
import GameBadge from './GameBadge';
import UpgradeLockModal from './UpgradeLockModal';

const difficultyConfig = {
  easy: {
    label: 'Mudah',
    gradient: 'from-emerald-400 via-green-500 to-teal-500',
    glow: 'shadow-emerald-500/40',
    pill: 'bg-emerald-400/90 text-emerald-950',
    dot: 'bg-emerald-300',
  },
  medium: {
    label: 'Sederhana',
    gradient: 'from-amber-400 via-orange-500 to-yellow-500',
    glow: 'shadow-orange-500/40',
    pill: 'bg-amber-300/95 text-amber-950',
    dot: 'bg-amber-300',
  },
  hard: {
    label: 'Sukar',
    gradient: 'from-rose-500 via-pink-500 to-red-500',
    glow: 'shadow-rose-500/40',
    pill: 'bg-rose-400/95 text-rose-950',
    dot: 'bg-rose-300',
  },
};

export default function GameListCard({ game, gameKey, gameProgress, idx, category, badge, locked }) {
  const difficulty = difficultyConfig[game.difficulty || 'easy'];
  const [showUpgrade, setShowUpgrade] = useState(false);

  // -------- LOCKED CARD --------
  if (locked) {
    return (
      <>
        <button
          type="button"
          onClick={() => setShowUpgrade(true)}
          aria-label={`${game.title} — Permainan premium, klik untuk upgrade`}
          className="block text-left w-full h-full"
        >
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: Math.min(idx * 0.03, 0.5), type: 'spring', damping: 20 }}
            whileTap={{ scale: 0.96 }}
            whileHover={{ y: -3 }}
            className="relative isolate overflow-hidden h-full min-h-[180px] rounded-3xl shadow-xl shadow-purple-900/40 cursor-pointer"
          >
            {/* Locked dimmed gradient */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-purple-700/60 via-purple-900/70 to-slate-900/80" />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent" />
            <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-yellow-300/15 blur-2xl" />

            <div className="relative z-10 p-3 h-full flex flex-col">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="h-12 w-12 rounded-2xl bg-white/15 ring-1 ring-white/20 flex items-center justify-center text-2xl grayscale opacity-70">
                  {game.emoji || '🎮'}
                </div>
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-300 shadow-lg ring-2 ring-yellow-200/50">
                  <Lock className="h-3.5 w-3.5 text-purple-900" strokeWidth={3} />
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-black text-sm leading-tight line-clamp-2 text-white/90" style={{ textShadow: '0 1px 4px rgba(0,0,0,0.3)' }}>
                  {game.title}
                </h3>
              </div>

              <div className="mt-2 inline-flex items-center gap-1.5 self-start rounded-full bg-yellow-300/90 px-2.5 py-1 shadow-md">
                <Sparkles className="h-3 w-3 text-yellow-900" strokeWidth={3} />
                <span className="text-[10px] font-black text-yellow-950 uppercase tracking-wider">Premium</span>
              </div>
            </div>
          </motion.div>
        </button>
        <UpgradeLockModal open={showUpgrade} onClose={() => setShowUpgrade(false)} gameTitle={game.title} />
      </>
    );
  }

  // -------- UNLOCKED CARD --------
  const stars = gameProgress?.bestStars || 0;
  const timesPlayed = gameProgress?.timesPlayed || 0;
  const hasProgress = !!gameProgress;

  return (
    <Link to={`/play/${category}/${idx}`} className="block h-full">
      <motion.div
        initial={{ opacity: 0, y: 12, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: Math.min(idx * 0.03, 0.5), type: 'spring', damping: 20 }}
        whileHover={{ scale: 1.03, y: -4 }}
        whileTap={{ scale: 0.96 }}
        className={`relative isolate overflow-hidden h-full min-h-[180px] rounded-3xl shadow-xl ${difficulty.glow} cursor-pointer group`}
      >
        {/* Gradient background */}
        <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${difficulty.gradient}`} />

        {/* Glass overlay */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/25 via-white/5 to-transparent" />

        {/* Decorative orbs */}
        <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-white/25 blur-2xl transition-all group-hover:bg-white/40 group-hover:scale-110" />
        <div className="pointer-events-none absolute -left-6 -bottom-6 h-20 w-20 rounded-full bg-white/15 blur-2xl" />

        {/* Badge floating */}
        {badge && badge !== 'locked' && (
          <div className="absolute top-2 right-2 z-20">
            <GameBadge type={badge} />
          </div>
        )}

        {/* Content */}
        <div className="relative z-10 p-3 h-full flex flex-col">
          {/* Emoji icon */}
          <motion.div
            whileHover={{ rotate: [-5, 5, -5, 0], scale: 1.1 }}
            transition={{ duration: 0.5 }}
            className="h-12 w-12 rounded-2xl bg-white/30 ring-2 ring-white/40 backdrop-blur-sm flex items-center justify-center text-2xl shadow-lg mb-2 self-start"
          >
            {game.emoji || '🎮'}
          </motion.div>

          {/* Title */}
          <div className="flex-1 min-w-0">
            <h3
              className="font-black text-sm leading-tight line-clamp-2 text-white"
              style={{ textShadow: '0 2px 6px rgba(0,0,0,0.35)' }}
            >
              {game.title}
            </h3>

            {/* Progress stars or difficulty */}
            <div className="mt-1.5">
              {hasProgress ? (
                <div className="flex items-center gap-1" aria-label={`${stars} bintang daripada 3`}>
                  {[1, 2, 3].map((s) => (
                    <Star
                      key={s}
                      className={`h-3.5 w-3.5 ${s <= stars ? 'fill-yellow-300 text-yellow-300' : 'fill-white/20 text-white/30'}`}
                      strokeWidth={2.5}
                    />
                  ))}
                  {timesPlayed > 0 && (
                    <span className="ml-1 text-[10px] font-black text-white/90">
                      {timesPlayed}×
                    </span>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <span className={`inline-block h-1.5 w-1.5 rounded-full ${difficulty.dot} animate-pulse`} />
                  <span className="text-[10px] font-black text-white/95 uppercase tracking-wide">
                    Belum dimainkan
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Footer: difficulty pill + play button */}
          <div className="flex items-end justify-between gap-2 mt-2">
            <span className={`inline-flex items-center text-[10px] font-black px-2 py-1 rounded-full ${difficulty.pill} shadow-md`}>
              {difficulty.label}
            </span>
            <motion.div
              whileHover={{ scale: 1.15, rotate: 5 }}
              className="h-9 w-9 rounded-full bg-white text-purple-700 flex items-center justify-center shadow-xl ring-2 ring-white/50 group-hover:translate-x-1 transition-transform"
            >
              <Play className="h-4 w-4 fill-current" strokeWidth={2.5} />
            </motion.div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}