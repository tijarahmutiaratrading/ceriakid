import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Lock, Play } from 'lucide-react';
import GameBadge from './GameBadge';

const difficultyConfig = {
  easy:   { label: 'Mudah',     color: 'bg-green-400/80',  icon: '🟢' },
  medium: { label: 'Sederhana', color: 'bg-yellow-400/80', icon: '🟡' },
  hard:   { label: 'Sukar',     color: 'bg-red-400/80',    icon: '🔴' },
};

export default function GameListCard({ game, gameKey, gameProgress, idx, category, badge, locked }) {
  const difficulty = difficultyConfig[game.difficulty || 'easy'];

  const cardStyle = {
    background: locked ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.12)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255,255,255,0.2)',
  };

  if (locked) {
    return (
      <Link to="/">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: Math.min(idx * 0.03, 0.5) }}
          className="rounded-3xl p-4 flex items-center gap-4 opacity-60 cursor-pointer shadow-xl"
          style={cardStyle}
        >
          <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-2xl grayscale flex-shrink-0">
            {game.emoji}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-sm truncate text-white/60">{game.title}</h3>
            <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full text-white/70 ${difficulty.color} mt-1`}>
              {difficulty.icon} {difficulty.label}
            </span>
          </div>
          <div className="flex flex-col items-center gap-1 flex-shrink-0">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <Lock className="w-4 h-4 text-white/60" />
            </div>
            <span className="text-xs text-white/50 font-bold">Premium</span>
          </div>
        </motion.div>
      </Link>
    );
  }

  return (
    <Link to={`/play/${category}/${idx}`}>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: Math.min(idx * 0.03, 0.5) }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        className="rounded-3xl p-4 flex items-center gap-4 cursor-pointer group shadow-xl hover:bg-white/10 transition-all"
        style={cardStyle}
      >
        {/* Emoji */}
        <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center text-3xl flex-shrink-0 shadow-inner group-hover:scale-110 transition-transform">
          {game.emoji}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-black text-base text-white truncate">{game.title}</h3>
            {badge && badge !== 'locked' && <GameBadge type={badge} />}
          </div>

          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full text-white ${difficulty.color}`}>
              {difficulty.icon} {difficulty.label}
            </span>
            <span className="text-white/50 text-xs font-semibold capitalize truncate">
              {game.type?.replace(/_/g, ' ')}
            </span>
          </div>

          {/* Progress */}
          {gameProgress && (
            <div className="flex items-center gap-2 mt-2">
              <div className="flex gap-0.5">
                {[1,2,3].map(s => (
                  <span key={s} className={`text-xs ${s <= gameProgress.bestStars ? 'text-yellow-300' : 'text-white/25'}`}>★</span>
                ))}
              </div>
              <span className="text-white/50 text-xs">{gameProgress.timesPlayed}x dimainkan</span>
            </div>
          )}
        </div>

        {/* Play button */}
        <div className="w-11 h-11 rounded-2xl bg-white text-purple-700 flex items-center justify-center shadow-lg flex-shrink-0 group-hover:scale-105 transition-all">
          <Play className="w-5 h-5 fill-current" />
        </div>
      </motion.div>
    </Link>
  );
}