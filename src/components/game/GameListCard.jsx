import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Lock, Play } from 'lucide-react';
import GameBadge from './GameBadge';
import UpgradeLockModal from './UpgradeLockModal';

// Playful cartoon palette — rotate per card for variety
const CARD_THEMES = [
  { bg: 'from-yellow-300 to-orange-400', accent: '#EA580C', ring: 'ring-orange-600' },
  { bg: 'from-pink-300 to-rose-400',     accent: '#BE185D', ring: 'ring-pink-600' },
  { bg: 'from-sky-300 to-blue-400',      accent: '#1D4ED8', ring: 'ring-blue-600' },
  { bg: 'from-green-300 to-emerald-400', accent: '#047857', ring: 'ring-emerald-600' },
  { bg: 'from-purple-300 to-violet-400', accent: '#6D28D9', ring: 'ring-violet-600' },
  { bg: 'from-amber-300 to-yellow-400',  accent: '#A16207', ring: 'ring-amber-600' },
];

const difficultyConfig = {
  easy:   { label: 'Mudah',     bg: 'bg-green-400',  text: 'text-green-900' },
  medium: { label: 'Sederhana', bg: 'bg-orange-400', text: 'text-orange-950' },
  hard:   { label: 'Sukar',     bg: 'bg-red-400',    text: 'text-red-950' },
};

export default function GameListCard({ game, gameKey, gameProgress, idx, category, badge, locked }) {
  const difficulty = difficultyConfig[game.difficulty || 'easy'];
  const theme = useMemo(() => CARD_THEMES[idx % CARD_THEMES.length], [idx]);
  const [showUpgrade, setShowUpgrade] = useState(false);

  const stars = gameProgress?.bestStars || 0;
  const playCount = gameProgress?.timesPlayed || 0;

  const cardInner = (
    <div className={`relative h-full rounded-[28px] overflow-hidden bg-gradient-to-br ${theme.bg} border-[4px] border-slate-900 shadow-[6px_8px_0px_rgba(15,23,42,1)]`}>
      {/* Playful dotted pattern overlay */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.8) 1.5px, transparent 2px)',
          backgroundSize: '16px 16px',
        }}
        aria-hidden="true"
      />

      {/* Sparkle accents */}
      <span className="absolute top-2 right-3 text-xl opacity-80 pointer-events-none">✨</span>
      <span className="absolute bottom-3 left-3 text-base opacity-60 pointer-events-none">⭐</span>

      <div className="relative p-3 sm:p-5 flex items-start gap-2.5 sm:gap-4 min-h-[100px] sm:min-h-[124px]">
        {/* Emoji bubble — chunky cartoon sticker */}
        <div className="flex-shrink-0">
          <div className={`w-14 h-14 sm:w-[78px] sm:h-[78px] rounded-full bg-white flex items-center justify-center text-3xl sm:text-[44px] border-[4px] border-slate-900 shadow-[3px_4px_0px_rgba(15,23,42,1)]`}>
            <span className={locked ? 'grayscale opacity-70' : ''}>{game.emoji}</span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 pt-0.5">
          <div className="flex items-start gap-2 flex-wrap">
            <h3
              className="font-black text-sm sm:text-lg leading-tight text-slate-900 line-clamp-2"
              style={{ textShadow: '1px 1px 0 rgba(255,255,255,0.5)' }}
            >
              {game.title}
            </h3>
            {badge && badge !== 'locked' && <GameBadge type={badge} />}
          </div>

          {/* Difficulty — chunky pill */}
          <div className={`inline-flex items-center gap-1 mt-2 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full ${difficulty.bg} ${difficulty.text} border-[2.5px] border-slate-900 shadow-[2px_2px_0px_rgba(15,23,42,1)]`}>
            <span className="font-black text-[11px] sm:text-xs">{difficulty.label}</span>
          </div>

          {/* Game type */}
          {game.type && (
            <p className="mt-1.5 sm:mt-2 text-slate-800 text-xs sm:text-sm font-bold capitalize">
              {game.type.replace(/_/g, ' ')}
            </p>
          )}

          {/* Stars + plays */}
          {gameProgress && (
            <div className="flex items-center gap-2 sm:gap-3 mt-1.5 sm:mt-2">
              <div className="flex gap-0.5" aria-label={`${stars} bintang daripada 3`}>
                {[1,2,3].map(s => (
                  <span
                    key={s}
                    className="text-base sm:text-lg leading-none"
                    style={{
                      color: s <= stars ? '#facc15' : 'rgba(255,255,255,0.6)',
                      textShadow: s <= stars ? '1px 1px 0 #78350f' : 'none',
                    }}
                  >
                    ★
                  </span>
                ))}
              </div>
              <span className="text-slate-800 text-[10px] sm:text-xs font-black">
                {playCount}x main
              </span>
            </div>
          )}
        </div>

        {/* Play / Lock — chunky cartoon button */}
        <div className="flex-shrink-0 self-center">
          {locked ? (
            <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-amber-400 flex items-center justify-center border-[3px] sm:border-[4px] border-slate-900 shadow-[3px_4px_0px_rgba(15,23,42,1)]">
              <Lock className="w-4 h-4 sm:w-6 sm:h-6 text-slate-900" strokeWidth={3} />
            </div>
          ) : (
            <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-white flex items-center justify-center border-[3px] sm:border-[4px] border-slate-900 shadow-[3px_4px_0px_rgba(15,23,42,1)]">
              <Play className="w-4 h-4 sm:w-6 sm:h-6 text-slate-900 fill-slate-900 ml-0.5" strokeWidth={2.5} />
            </div>
          )}
        </div>
      </div>

      {/* Premium label */}
      {locked && (
        <div className="absolute top-2 left-3">
          <span className="inline-block px-2 py-0.5 text-[10px] font-black text-amber-950 bg-amber-300 rounded-full border-[2px] border-slate-900 shadow-[1.5px_1.5px_0px_rgba(15,23,42,1)] uppercase tracking-wide">
            ⭐ Premium
          </span>
        </div>
      )}
    </div>
  );

  if (locked) {
    return (
      <>
        <button
          type="button"
          onClick={() => setShowUpgrade(true)}
          aria-label={`${game.title} — Permainan premium, klik untuk upgrade`}
          className="block text-left w-full"
        >
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(idx * 0.03, 0.5) }}
            whileTap={{ scale: 0.97, y: 2 }}
            whileHover={{ y: -2 }}
            className="h-full cursor-pointer"
          >
            {cardInner}
          </motion.div>
        </button>
        <UpgradeLockModal open={showUpgrade} onClose={() => setShowUpgrade(false)} gameTitle={game.title} />
      </>
    );
  }

  return (
    <Link to={`/play/${category}/${idx}`} className="block">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: Math.min(idx * 0.03, 0.5) }}
        whileHover={{ y: -3, scale: 1.02 }}
        whileTap={{ scale: 0.97, y: 2 }}
        className="h-full cursor-pointer"
      >
        {cardInner}
      </motion.div>
    </Link>
  );
}