import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Lock, Play, ChevronRight } from 'lucide-react';
import GameBadge from './GameBadge';
import UpgradeLockModal from './UpgradeLockModal';

// Apple-style soft accent tints — rotate per card for subtle variety
const CARD_THEMES = [
  { tint: 'bg-orange-50',  iconBg: 'bg-orange-100',  iconText: 'text-orange-600',  accent: '#F97316' },
  { tint: 'bg-pink-50',    iconBg: 'bg-pink-100',    iconText: 'text-pink-600',    accent: '#EC4899' },
  { tint: 'bg-blue-50',    iconBg: 'bg-blue-100',    iconText: 'text-blue-600',    accent: '#3B82F6' },
  { tint: 'bg-emerald-50', iconBg: 'bg-emerald-100', iconText: 'text-emerald-600', accent: '#10B981' },
  { tint: 'bg-violet-50',  iconBg: 'bg-violet-100',  iconText: 'text-violet-600',  accent: '#8B5CF6' },
  { tint: 'bg-amber-50',   iconBg: 'bg-amber-100',   iconText: 'text-amber-600',   accent: '#F59E0B' },
];

const difficultyConfig = {
  easy:   { label: 'Mudah',     dot: 'bg-emerald-500', text: 'text-emerald-700' },
  medium: { label: 'Sederhana', dot: 'bg-orange-500',  text: 'text-orange-700' },
  hard:   { label: 'Sukar',     dot: 'bg-red-500',     text: 'text-red-700' },
};

export default function GameListCard({ game, gameKey, gameProgress, idx, category, badge, locked }) {
  const difficulty = difficultyConfig[game.difficulty || 'easy'];
  const theme = useMemo(() => CARD_THEMES[idx % CARD_THEMES.length], [idx]);
  const [showUpgrade, setShowUpgrade] = useState(false);

  const stars = gameProgress?.bestStars || 0;
  const playCount = gameProgress?.timesPlayed || 0;

  const cardInner = (
    <div
      className="relative h-full rounded-3xl overflow-hidden ring-1 ring-white/60"
      style={{
        background: 'linear-gradient(135deg, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.65) 100%)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06), 0 12px 32px rgba(15,23,42,0.08), inset 0 1px 0 rgba(255,255,255,0.9)',
      }}
    >
      {/* Glass shine overlay */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.4) 0%, transparent 60%)' }} aria-hidden="true" />
      {/* Soft tinted accent strip on left */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${theme.iconBg} opacity-80`} aria-hidden="true" />

      <div className="relative p-4 sm:p-5 flex items-center gap-3 sm:gap-4 min-h-[100px] sm:min-h-[120px]">
        {/* Emoji bubble — soft tinted circle */}
        <div className="flex-shrink-0">
          <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl ${theme.iconBg} flex items-center justify-center text-3xl sm:text-4xl`}>
            <span className={locked ? 'grayscale opacity-60' : ''}>{game.emoji}</span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2 flex-wrap">
            <h3 className="font-bold text-base sm:text-lg leading-tight text-slate-900 line-clamp-2 tracking-tight">
              {game.title}
            </h3>
            {badge && badge !== 'locked' && <GameBadge type={badge} />}
          </div>

          {/* Meta row — difficulty dot + game type */}
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <div className="inline-flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${difficulty.dot}`} />
              <span className={`font-semibold text-[11px] sm:text-xs ${difficulty.text}`}>{difficulty.label}</span>
            </div>
            {game.type && (
              <>
                <span className="text-slate-300 text-xs">·</span>
                <p className="text-slate-500 text-[11px] sm:text-xs font-medium capitalize truncate">
                  {game.type.replace(/_/g, ' ')}
                </p>
              </>
            )}
          </div>

          {/* Stars + plays */}
          {gameProgress && (
            <div className="flex items-center gap-2.5 mt-2">
              <div className="flex gap-0.5" aria-label={`${stars} bintang daripada 3`}>
                {[1,2,3].map(s => (
                  <span
                    key={s}
                    className="text-sm sm:text-base leading-none"
                    style={{ color: s <= stars ? '#FACC15' : '#E2E8F0' }}
                  >
                    ★
                  </span>
                ))}
              </div>
              <span className="text-slate-400 text-[10px] sm:text-xs font-semibold">
                {playCount}× main
              </span>
            </div>
          )}
        </div>

        {/* Trailing action — minimal chevron / lock */}
        <div className="flex-shrink-0 self-center">
          {locked ? (
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-amber-50 ring-1 ring-amber-200 flex items-center justify-center">
              <Lock className="w-4 h-4 text-amber-600" strokeWidth={2.25} />
            </div>
          ) : (
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-orange-500 flex items-center justify-center shadow-sm">
              <Play className="w-3.5 h-3.5 text-white fill-white ml-0.5" strokeWidth={2} />
            </div>
          )}
        </div>
      </div>

      {/* Premium label */}
      {locked && (
        <div className="absolute top-3 right-3">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold text-amber-700 bg-amber-50 rounded-full ring-1 ring-amber-200 uppercase tracking-wide">
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
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(idx * 0.03, 0.5) }}
            whileTap={{ scale: 0.985 }}
            whileHover={{ y: -1 }}
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
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: Math.min(idx * 0.03, 0.5) }}
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.985 }}
        className="h-full cursor-pointer"
      >
        {cardInner}
      </motion.div>
    </Link>
  );
}