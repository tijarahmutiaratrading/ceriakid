import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Lock, Play } from 'lucide-react';
import GameBadge from './GameBadge';
import UpgradeLockModal from './UpgradeLockModal';

const difficultyConfig = {
  easy:   { label: 'Mudah',     stroke: '#16a34a' },
  medium: { label: 'Sederhana', stroke: '#15803d' },
  hard:   { label: 'Sukar',     stroke: '#dc2626' },
};

// Subtle horizontal lined-paper background (CSS gradient — keeps it lightweight + crisp)
const paperStyle = {
  backgroundColor: '#fbf7ec',
  backgroundImage:
    'repeating-linear-gradient(to bottom, transparent 0, transparent 31px, rgba(59,130,246,0.18) 31px, rgba(59,130,246,0.18) 32px)',
};

// Hand-drawn ellipse SVG used to "circle" the difficulty word
const CircleStamp = ({ stroke }) => (
  <svg
    viewBox="0 0 120 60"
    className="absolute inset-0 w-full h-full pointer-events-none"
    preserveAspectRatio="none"
  >
    <ellipse
      cx="60" cy="30" rx="54" ry="22"
      fill="none"
      stroke={stroke}
      strokeWidth="3"
      strokeLinecap="round"
      strokeDasharray="180 12"
      strokeDashoffset="6"
      transform="rotate(-3 60 30)"
      opacity="0.9"
    />
  </svg>
);

export default function GameListCard({ game, gameKey, gameProgress, idx, category, badge, locked }) {
  const difficulty = difficultyConfig[game.difficulty || 'easy'];
  const [showUpgrade, setShowUpgrade] = useState(false);

  // Slight random rotation per card so they feel like scattered paper notes — stable per card
  const rotation = useMemo(() => {
    const variants = [-2.2, -1.2, -0.6, 0.4, 1.1, 1.8, 2.4];
    return variants[idx % variants.length];
  }, [idx]);

  const stars = gameProgress?.bestStars || 0;
  const playCount = gameProgress?.timesPlayed || 0;

  const cardInner = (
    <div
      className="relative h-full rounded-[14px] overflow-hidden shadow-[6px_8px_18px_rgba(15,23,42,0.18),0_1px_0_rgba(0,0,0,0.04)] ring-1 ring-amber-900/10"
      style={paperStyle}
    >
      {/* Red margin line on the left — classic notebook */}
      <div className="absolute top-0 bottom-0 left-9 w-px bg-red-400/70" aria-hidden="true" />

      {/* Torn edge feel — subtle dotted top edge */}
      <div
        className="absolute top-0 left-0 right-0 h-1.5 opacity-40"
        style={{
          backgroundImage: 'radial-gradient(circle at 4px 0, transparent 2px, #fbf7ec 2.5px)',
          backgroundSize: '8px 6px',
          backgroundRepeat: 'repeat-x',
        }}
        aria-hidden="true"
      />

      <div className="relative p-4 sm:p-5 pl-12 sm:pl-14 flex items-start gap-3 sm:gap-4 min-h-[120px]">
        {/* Emoji "sticker" — looks like a doodle stuck on the paper */}
        <div className="flex-shrink-0 -mt-2">
          <div
            className="w-16 h-16 sm:w-[72px] sm:h-[72px] rounded-full bg-white flex items-center justify-center text-3xl sm:text-4xl shadow-[3px_4px_8px_rgba(15,23,42,0.18)] ring-[2.5px] ring-slate-900/85"
            style={{ transform: `rotate(${-rotation * 1.5}deg)` }}
          >
            <span className={locked ? 'grayscale opacity-70' : ''}>{game.emoji}</span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 pt-0.5">
          {/* Title — bold navy, slightly handwritten feel via tracking */}
          <div className="flex items-start gap-2 flex-wrap">
            <h3
              className="font-black text-base sm:text-lg leading-tight text-[#1e3a8a] uppercase tracking-tight line-clamp-2"
              style={{ textShadow: '0 1px 0 rgba(255,255,255,0.6)' }}
            >
              {game.title}
            </h3>
            {badge && badge !== 'locked' && <GameBadge type={badge} />}
          </div>

          {/* Difficulty — hand-circled stamp */}
          <div className="inline-block relative mt-2 px-4 py-1">
            <CircleStamp stroke={difficulty.stroke} />
            <span
              className="relative font-black text-sm"
              style={{ color: difficulty.stroke, fontFamily: '"Nunito", cursive' }}
            >
              {difficulty.label}
            </span>
          </div>

          {/* Game type — handwritten style */}
          {game.type && (
            <p className="mt-2 text-slate-700 text-sm font-bold capitalize" style={{ fontFamily: '"Nunito", cursive' }}>
              {game.type.replace(/_/g, ' ')}
            </p>
          )}

          {/* Stars + plays */}
          {gameProgress && (
            <div className="flex items-center gap-3 mt-2">
              <div className="flex gap-0.5" aria-label={`${stars} bintang daripada 3`}>
                {[1,2,3].map(s => (
                  <span
                    key={s}
                    className="text-base leading-none"
                    style={{
                      color: s <= stars ? '#facc15' : '#cbd5e1',
                      textShadow: s <= stars ? '0 1px 0 #b45309' : 'none',
                    }}
                  >
                    ★
                  </span>
                ))}
              </div>
              <span className="text-slate-700 text-xs font-bold" style={{ fontFamily: '"Nunito", cursive' }}>
                Dimainkan {playCount} kali
              </span>
            </div>
          )}
        </div>

        {/* Play / Lock — rubber stamp circle */}
        <div className="flex-shrink-0 self-center">
          {locked ? (
            <div
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-amber-400 flex items-center justify-center shadow-[2px_3px_6px_rgba(15,23,42,0.25)] ring-[2.5px] ring-amber-900"
              style={{ transform: `rotate(${rotation * 2}deg)` }}
            >
              <Lock className="w-5 h-5 sm:w-6 sm:h-6 text-amber-900" strokeWidth={3} />
            </div>
          ) : (
            <div
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-red-500 flex items-center justify-center shadow-[2px_3px_6px_rgba(15,23,42,0.25)] ring-[2.5px] ring-red-800"
              style={{ transform: `rotate(${rotation * 2}deg)` }}
            >
              <Play className="w-5 h-5 sm:w-6 sm:h-6 text-white fill-white ml-0.5" strokeWidth={2.5} />
            </div>
          )}
        </div>
      </div>

      {/* Premium label for locked cards */}
      {locked && (
        <div className="absolute top-2 right-3">
          <span
            className="inline-block px-2 py-0.5 text-[10px] font-black text-amber-900 bg-amber-300 rounded shadow-sm uppercase tracking-wider"
            style={{ transform: 'rotate(8deg)', fontFamily: '"Nunito", cursive' }}
          >
            Premium
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
            animate={{ opacity: 1, y: 0, rotate: rotation }}
            transition={{ delay: Math.min(idx * 0.03, 0.5) }}
            whileTap={{ scale: 0.97, rotate: 0 }}
            whileHover={{ rotate: 0, scale: 1.02 }}
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
        animate={{ opacity: 1, y: 0, rotate: rotation }}
        transition={{ delay: Math.min(idx * 0.03, 0.5) }}
        whileHover={{ scale: 1.03, rotate: 0 }}
        whileTap={{ scale: 0.97, rotate: 0 }}
        className="h-full cursor-pointer"
      >
        {cardInner}
      </motion.div>
    </Link>
  );
}