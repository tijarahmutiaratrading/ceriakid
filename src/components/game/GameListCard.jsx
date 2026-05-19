import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Lock, Play } from 'lucide-react';
import GameBadge from './GameBadge';
import UpgradeLockModal from './UpgradeLockModal';

// Forest Treehouse — wooden plank sign hanging from ropes
const WOOD_TEXTURE = 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/b8bd4907d_generated_image.png';
const BRANCH_WITH_ROPES = 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/d2019a9eb_generated_image.png';

const difficultyConfig = {
  easy:   { label: 'Mudah' },
  medium: { label: 'Sederhana' },
  hard:   { label: 'Sukar' },
};

// Burnt-into-wood text style
const carvedTextStyle = {
  color: '#4A2C0C',
  fontFamily: '"Berkshire Swash", "Patrick Hand", cursive',
  fontWeight: 700,
  textShadow: '0 1px 0 rgba(255,230,180,0.45), 0 -1px 1px rgba(60,30,10,0.35)',
  letterSpacing: '0.01em',
};

// Acorn star icon
const Acorn = ({ filled }) => (
  <svg viewBox="0 0 24 24" className="w-6 h-6 sm:w-7 sm:h-7" style={{ filter: filled ? 'drop-shadow(0 2px 3px rgba(180,120,0,0.55))' : 'none' }}>
    <ellipse cx="12" cy="15" rx="6" ry="7" fill={filled ? '#F5C842' : '#8B6B3D'} stroke="#4A2C0C" strokeWidth="1.2" />
    <ellipse cx="10" cy="13" rx="1.6" ry="2.2" fill={filled ? '#FFE89C' : '#A08456'} opacity="0.8" />
    <path d="M5 9 Q12 5 19 9 Q19 11 12 11 Q5 11 5 9 Z" fill="#6B3F1C" stroke="#3A1F0A" strokeWidth="1" />
    <path d="M5.5 9.2 Q12 7 18.5 9.2" stroke="#4A2C0C" strokeWidth="0.8" fill="none" opacity="0.5" />
    <path d="M12 5 L12 3" stroke="#3A1F0A" strokeWidth="1.2" strokeLinecap="round" />
  </svg>
);

export default function GameListCard({ game, gameKey, gameProgress, idx, category, badge, locked }) {
  const difficulty = difficultyConfig[game.difficulty || 'easy'];
  const [showUpgrade, setShowUpgrade] = useState(false);

  const stars = gameProgress?.bestStars || 0;
  const playCount = gameProgress?.timesPlayed || 0;

  const cardInner = (
    <div className="relative pt-6">
      {/* Branch with hanging ropes — sits above the sign */}
      <div
        className="absolute -top-2 left-0 right-0 h-14 sm:h-16 z-10 pointer-events-none"
        style={{
          backgroundImage: `url(${BRANCH_WITH_ROPES})`,
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center top',
        }}
      />

      {/* Wooden sign (the card) */}
      <div
        className="relative mt-8 sm:mt-10 rounded-[28px] overflow-hidden"
        style={{
          backgroundImage: `url(${WOOD_TEXTURE})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          boxShadow: `
            inset 0 0 0 6px #8B5A2B,
            inset 0 0 0 8px #6B3F1C,
            inset 0 3px 10px rgba(255,220,160,0.35),
            inset 0 -3px 8px rgba(60,30,10,0.4),
            0 12px 20px -6px rgba(60,30,10,0.45),
            0 6px 10px -4px rgba(60,30,10,0.35)
          `,
        }}
      >
        {/* Carved notches at corners */}
        <div className="absolute top-1 left-1 w-3 h-3 rounded-full bg-[#6B3F1C] shadow-inner" />
        <div className="absolute top-1 right-1 w-3 h-3 rounded-full bg-[#6B3F1C] shadow-inner" />
        <div className="absolute bottom-1 left-1 w-3 h-3 rounded-full bg-[#6B3F1C] shadow-inner" />
        <div className="absolute bottom-1 right-1 w-3 h-3 rounded-full bg-[#6B3F1C] shadow-inner" />

        {/* Tiny butterfly top-right */}
        <span className="absolute top-2 right-3 text-lg sm:text-xl select-none" style={{ filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.3))' }}>🦋</span>
        {/* Tiny mushroom bottom-left */}
        <span className="absolute bottom-1.5 left-2 text-lg sm:text-xl select-none" style={{ filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.3))' }}>🍄</span>

        <div className="relative p-4 sm:p-5 pl-5 sm:pl-6 pr-5 sm:pr-6 min-h-[160px] sm:min-h-[190px]">
          <div className="flex items-start gap-3 sm:gap-4">
            {/* Emoji in carved wooden circle frame */}
            <div className="flex-shrink-0 mt-1">
              <div
                className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center"
                style={{
                  background: 'radial-gradient(circle at 35% 30%, #B07D4A 0%, #7A4A1F 70%, #4A2C0C 100%)',
                  boxShadow: `
                    inset 0 4px 8px rgba(0,0,0,0.45),
                    inset 0 -2px 4px rgba(255,220,160,0.25),
                    0 2px 3px rgba(255,230,180,0.3)
                  `,
                }}
              >
                <span
                  className="text-3xl sm:text-4xl select-none"
                  style={{
                    filter: locked ? 'grayscale(0.6) opacity(0.7) drop-shadow(0 2px 3px rgba(0,0,0,0.4))' : 'drop-shadow(0 2px 3px rgba(0,0,0,0.4))',
                  }}
                >
                  {game.emoji}
                </span>
              </div>
            </div>

            {/* Content right side */}
            <div className="flex-1 min-w-0 pt-0.5">
              <h3
                className="text-base sm:text-xl leading-[1.1] line-clamp-2"
                style={carvedTextStyle}
              >
                {game.title}
              </h3>
              {badge && badge !== 'locked' && (
                <div className="mt-1.5"><GameBadge type={badge} /></div>
              )}

              {/* Leaf-shaped difficulty tag */}
              <div
                className="inline-flex items-center mt-2 px-3 py-1 sm:py-1.5"
                style={{
                  background: 'linear-gradient(135deg, #9B7142 0%, #7A5530 100%)',
                  borderRadius: '50% 12px 50% 12px / 12px 50% 12px 50%',
                  boxShadow: 'inset 0 1px 2px rgba(255,220,160,0.3), inset 0 -1px 2px rgba(0,0,0,0.3), 0 1px 2px rgba(0,0,0,0.2)',
                }}
              >
                <span
                  className="text-[11px] sm:text-sm whitespace-nowrap"
                  style={{ ...carvedTextStyle, fontSize: undefined }}
                >
                  {difficulty.label}
                </span>
              </div>

              {/* Game type */}
              {game.type && (
                <p
                  className="mt-2 text-xs sm:text-sm capitalize"
                  style={{ ...carvedTextStyle, fontFamily: '"Patrick Hand", cursive' }}
                >
                  {game.type.replace(/_/g, ' ')}
                </p>
              )}
            </div>
          </div>

          {/* Bottom row: acorns left, play count + buttons right */}
          <div className="mt-3 flex items-end justify-between gap-2">
            {/* Acorn stars */}
            <div className="flex flex-col gap-1 max-w-[55%]">
              {gameProgress ? (
                <>
                  <div className="flex items-center gap-0.5" aria-label={`${stars} acorn daripada 3`}>
                    {[1, 2, 3].map((s) => (
                      <Acorn key={s} filled={s <= stars} />
                    ))}
                  </div>
                  <span
                    className="text-xs sm:text-sm leading-none"
                    style={{ ...carvedTextStyle, fontFamily: '"Patrick Hand", cursive' }}
                  >
                    {playCount}x main
                  </span>
                </>
              ) : (
                <div className="flex items-center gap-0.5 opacity-50">
                  {[1, 2, 3].map((s) => (
                    <Acorn key={s} filled={false} />
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              {/* Play button — wooden round with leaf accents */}
              <div className="relative">
                {/* Leaf accents around play button */}
                <span className="absolute -left-3 top-1 text-base sm:text-lg select-none" style={{ filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.3))', transform: 'rotate(-25deg)' }}>🌿</span>
                <span className="absolute -right-2 -bottom-1 text-sm sm:text-base select-none" style={{ filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.3))', transform: 'rotate(35deg)' }}>🌿</span>
                <div
                  className="relative w-11 h-11 sm:w-13 sm:h-13 rounded-full flex items-center justify-center"
                  style={{
                    width: '2.75rem',
                    height: '2.75rem',
                    background: 'radial-gradient(circle at 35% 30%, #C4956C 0%, #8B5A2B 70%, #6B3F1C 100%)',
                    boxShadow: `
                      inset 0 2px 4px rgba(255,220,160,0.4),
                      inset 0 -2px 4px rgba(60,30,10,0.5),
                      0 2px 4px rgba(60,30,10,0.4)
                    `,
                  }}
                >
                  <Play className="w-5 h-5 sm:w-6 sm:h-6 text-[#4A2C0C] fill-[#4A2C0C] ml-0.5" />
                </div>
              </div>

              {/* Arrow indicator (always shown) */}
              <span className="text-xl sm:text-2xl select-none" style={carvedTextStyle}>›</span>

              {/* Lock badge (only if locked) */}
              {locked && (
                <div
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{
                    background: 'radial-gradient(circle at 35% 30%, #B07D4A 0%, #7A4A1F 80%, #4A2C0C 100%)',
                    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.4), inset 0 -1px 2px rgba(255,220,160,0.25), 0 2px 3px rgba(60,30,10,0.4)',
                  }}
                >
                  <Lock className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: '#F5C842' }} strokeWidth={3} />
                </div>
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
            whileTap={{ scale: 0.97 }}
            whileHover={{ scale: 1.015, y: -2 }}
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
        whileHover={{ scale: 1.02, y: -3 }}
        whileTap={{ scale: 0.97 }}
        className="h-full cursor-pointer"
      >
        {cardInner}
      </motion.div>
    </Link>
  );
}