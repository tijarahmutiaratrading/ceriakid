import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Lock, Play } from 'lucide-react';
import GameBadge from './GameBadge';
import UpgradeLockModal from './UpgradeLockModal';

const difficultyConfig = {
  easy:   { label: 'Mudah',     color: 'bg-green-500',   icon: '🟢' },
  medium: { label: 'Sederhana', color: 'bg-yellow-500',  icon: '🟡' },
  hard:   { label: 'Sukar',     color: 'bg-red-500',     icon: '🔴' },
};

export default function GameListCard({ game, gameKey, gameProgress, idx, category, badge, locked }) {
  const difficulty = difficultyConfig[game.difficulty || 'easy'];
  const [showUpgrade, setShowUpgrade] = useState(false);

  const cardStyle = {
    background: locked ? 'rgba(88,28,135,0.35)' : 'rgba(120,40,160,0.40)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255,255,255,0.35)',
  };

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
            className="h-full rounded-3xl p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 cursor-pointer shadow-xl min-h-[88px]"
            style={cardStyle}
          >
            <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center text-3xl grayscale flex-shrink-0">
              {game.emoji}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-black text-sm sm:text-base leading-tight line-clamp-2 text-white">{game.title}</h3>
              <span className={`inline-flex items-center gap-1 text-xs font-black px-2.5 py-1 rounded-full text-white ${difficulty.color} mt-1.5`}>
                {difficulty.icon} {difficulty.label}
              </span>
            </div>
            <div className="flex flex-col items-center gap-1 flex-shrink-0">
              <div className="w-11 h-11 rounded-full bg-yellow-300 flex items-center justify-center shadow-lg">
                <Lock className="w-5 h-5 text-purple-900" />
              </div>
              <span className="text-xs text-yellow-200 font-black">Premium</span>
            </div>
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
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        className="h-full rounded-3xl p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 cursor-pointer group shadow-xl hover:bg-white/10 transition-all min-h-[88px]"
        style={cardStyle}
      >
        {/* Emoji */}
        <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center text-3xl flex-shrink-0 shadow-inner group-hover:scale-110 transition-transform">
          {game.emoji}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-black text-sm sm:text-base leading-tight line-clamp-2 text-white">{game.title}</h3>
            {badge && badge !== 'locked' && <GameBadge type={badge} />}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className={`inline-flex items-center gap-1 text-xs font-black px-2.5 py-1 rounded-full text-white ${difficulty.color}`}>
              {difficulty.icon} {difficulty.label}
            </span>
            <span className="text-white/90 text-xs font-bold capitalize truncate">
              {game.type?.replace(/_/g, ' ')}
            </span>
          </div>

          {/* Progress */}
          {gameProgress && (
            <div className="flex items-center gap-2 mt-2">
              <div className="flex gap-0.5" aria-label={`${gameProgress.bestStars} bintang daripada 3`}>
                {[1,2,3].map(s => (
                  <span key={s} className={`text-sm ${s <= gameProgress.bestStars ? 'text-yellow-300' : 'text-white/50'}`}>★</span>
                ))}
              </div>
              <span className="text-white/90 text-xs font-bold">{gameProgress.timesPlayed}x dimainkan</span>
            </div>
          )}
        </div>

        {/* Play button */}
        <div className="w-12 h-12 rounded-2xl bg-white text-purple-700 flex items-center justify-center shadow-lg flex-shrink-0 self-end sm:self-auto group-hover:scale-105 transition-all">
          <Play className="w-5 h-5 fill-current" />
        </div>
      </motion.div>
    </Link>
  );
}