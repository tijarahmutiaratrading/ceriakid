import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Lock, ArrowRight } from 'lucide-react';
import GameBadge from './GameBadge';
import UpgradeLockModal from './UpgradeLockModal';

// Sticker Pop 3D — solid bright blocks, rotate per card
const CARD_THEMES = [
  { bg: '#FF6B6B', tilt: -2 },   // coral
  { bg: '#FFD93D', tilt: 1.5 },  // yellow
  { bg: '#4ECDC4', tilt: -1.5 }, // mint
  { bg: '#A78BFA', tilt: 2 },    // lavender
  { bg: '#FB923C', tilt: -2.5 }, // orange
  { bg: '#60A5FA', tilt: 1 },    // sky blue
];

const difficultyConfig = {
  easy:   { label: 'Mudah' },
  medium: { label: 'Sederhana' },
  hard:   { label: 'Sukar' },
};

// Chunky white text with black outline — Sticker Pop signature
const stickerTextStyle = {
  color: '#FFFFFF',
  WebkitTextStroke: '1.5px #0F172A',
  textShadow: '2px 2px 0 rgba(15,23,42,0.25)',
  fontFamily: 'var(--font-nunito), sans-serif',
  fontWeight: 900,
  letterSpacing: '-0.01em',
};

export default function GameListCard({ game, gameKey, gameProgress, idx, category, badge, locked }) {
  const difficulty = difficultyConfig[game.difficulty || 'easy'];
  const theme = useMemo(() => CARD_THEMES[idx % CARD_THEMES.length], [idx]);
  const [showUpgrade, setShowUpgrade] = useState(false);

  const stars = gameProgress?.bestStars || 0;
  const playCount = gameProgress?.timesPlayed || 0;

  const cardInner = (
    <div
      className="relative rounded-[28px] p-2"
      style={{
        background: '#FFFFFF',
        boxShadow: '0 18px 28px -10px rgba(15,23,42,0.35), 0 8px 14px -6px rgba(15,23,42,0.25)',
        transform: `rotate(${theme.tilt}deg)`,
      }}
    >
      {/* Inner solid color block */}
      <div
        className="relative rounded-[22px] overflow-hidden"
        style={{ background: theme.bg }}
      >
        {/* Lock icon top-right (for locked cards) */}
        {locked && (
          <div className="absolute top-2.5 right-2.5 z-10 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white flex items-center justify-center shadow-[2px_3px_0_rgba(15,23,42,0.2)]">
            <Lock className="w-4 h-4 sm:w-[18px] sm:h-[18px] text-slate-900" strokeWidth={3} />
          </div>
        )}

        <div className="relative p-3 sm:p-5 flex items-start gap-3 sm:gap-4 min-h-[120px] sm:min-h-[150px]">
          {/* Emoji — tilted, off-center, no border ring (just emoji) */}
          <div className="flex-shrink-0 pt-1">
            <div
              className="text-[52px] sm:text-[72px] leading-none select-none"
              style={{
                transform: 'rotate(-6deg)',
                filter: locked ? 'grayscale(0.7) opacity(0.8)' : 'drop-shadow(2px 3px 0 rgba(15,23,42,0.2))',
              }}
            >
              {game.emoji}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 pt-0.5">
            <h3
              className="text-base sm:text-2xl leading-[1.05] line-clamp-2"
              style={stickerTextStyle}
            >
              {game.title}
            </h3>
            {badge && badge !== 'locked' && (
              <div className="mt-1.5"><GameBadge type={badge} /></div>
            )}

            {/* Difficulty — white rounded pill with sticker text */}
            <div className="inline-flex items-center mt-2 px-3 py-1 sm:py-1.5 rounded-full bg-white shadow-[2px_2px_0_rgba(15,23,42,0.15)]">
              <span
                className="text-[11px] sm:text-sm"
                style={{ ...stickerTextStyle, WebkitTextStroke: '1px #0F172A', textShadow: 'none' }}
              >
                {difficulty.label}
              </span>
            </div>

            {/* Game type */}
            {game.type && (
              <p
                className="mt-1.5 sm:mt-2 text-xs sm:text-base capitalize"
                style={stickerTextStyle}
              >
                {game.type.replace(/_/g, ' ')}
              </p>
            )}
          </div>
        </div>

        {/* Bottom row: stars left, play count + arrow right */}
        <div className="relative px-3 sm:px-5 pb-3 sm:pb-5 flex items-end justify-between gap-2">
          {/* Stars cluster bottom-left */}
          {gameProgress ? (
            <div className="flex flex-wrap items-end gap-0.5 max-w-[55%]" aria-label={`${stars} bintang daripada 3`}>
              {[1, 2, 3].map((s) => (
                <span
                  key={s}
                  className="text-2xl sm:text-3xl leading-none"
                  style={{
                    color: s <= stars ? '#FCD34D' : 'rgba(255,255,255,0.85)',
                    WebkitTextStroke: '1.5px #0F172A',
                    filter: s <= stars ? 'drop-shadow(1px 2px 0 rgba(15,23,42,0.3))' : 'none',
                  }}
                >
                  ★
                </span>
              ))}
            </div>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            {gameProgress && (
              <span
                className="text-sm sm:text-lg leading-none"
                style={stickerTextStyle}
              >
                {playCount}x main
              </span>
            )}
            {/* Play / Lock CTA — white circle with thick black icon */}
            <div
              className="w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-white flex items-center justify-center"
              style={{ boxShadow: '2px 4px 0 rgba(15,23,42,0.2)' }}
            >
              {locked ? (
                <Lock className="w-5 h-5 sm:w-6 sm:h-6 text-slate-900" strokeWidth={3} />
              ) : (
                <ArrowRight className="w-5 h-5 sm:w-7 sm:h-7 text-slate-900" strokeWidth={3.5} />
              )}
            </div>
          </div>
        </div>
      </div>
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
            whileTap={{ scale: 0.96 }}
            whileHover={{ scale: 1.02, y: -2 }}
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
        whileHover={{ scale: 1.03, y: -3 }}
        whileTap={{ scale: 0.96 }}
        className="h-full cursor-pointer"
      >
        {cardInner}
      </motion.div>
    </Link>
  );
}