import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import GameBadge from './GameBadge';

const difficultyConfig = {
  easy: { label: 'Mudah', icon: '🟢', color: 'text-green-600 bg-green-100' },
  medium: { label: 'Sederhana', icon: '🟡', color: 'text-yellow-600 bg-yellow-100' },
  hard: { label: 'Sukar', icon: '🔴', color: 'text-red-600 bg-red-100' },
};

const categoryColors = {
  bahasa_melayu: 'bg-amber-100 border-amber-300',
  english: 'bg-sky-100 border-sky-300',
  mathematics: 'bg-pink-100 border-pink-300',
  science: 'bg-emerald-100 border-emerald-300',
  jawi: 'bg-purple-100 border-purple-300',
  worksheet: 'bg-orange-100 border-orange-300',
};

const categoryAccent = {
  bahasa_melayu: 'from-amber-300 to-yellow-400',
  english: 'from-sky-300 to-blue-400',
  mathematics: 'from-pink-300 to-rose-400',
  science: 'from-emerald-300 to-green-400',
  jawi: 'from-purple-300 to-indigo-400',
  worksheet: 'from-orange-300 to-amber-400',
};

export default function GameListCard({ game, gameKey, gameProgress, idx, category, badge }) {
  const difficulty = difficultyConfig[game.difficulty || 'easy'];
  const cardBg = categoryColors[category] || 'bg-gray-100 border-gray-300';
  const accent = categoryAccent[category] || 'from-gray-300 to-gray-400';

  const stars = gameProgress?.bestStars ?? null;

  return (
    <Link to={`/play/${category}/${idx}`}>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: idx * 0.04 }}
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.97 }}
        className={`relative flex items-center gap-4 rounded-2xl border-2 p-4 cursor-pointer group shadow-sm hover:shadow-md transition-all ${cardBg}`}
      >
        {/* Left accent bar */}
        <div className={`absolute left-0 top-3 bottom-3 w-1 rounded-full bg-gradient-to-b ${accent}`} />

        {/* Emoji */}
        <div className="text-4xl pl-2 group-hover:scale-110 transition-transform flex-shrink-0">
          {game.emoji}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-black text-gray-800 text-base leading-tight truncate group-hover:text-game-purple transition-colors">
              {game.title}
            </h3>
            {badge && <GameBadge type={badge} />}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${difficulty.color}`}>
              {difficulty.icon} {difficulty.label}
            </span>

            {stars !== null ? (
              <span className="text-xs font-bold text-gray-500">
                {'⭐'.repeat(stars)}{'☆'.repeat(3 - stars)}
                <span className="ml-1 text-gray-400">({gameProgress.timesPlayed}x main)</span>
              </span>
            ) : (
              <span className="text-xs text-gray-400">Belum dimainkan</span>
            )}
          </div>

          {/* Progress bar if played */}
          {stars !== null && (
            <div className="mt-2 h-1.5 bg-white/70 rounded-full overflow-hidden w-full">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(stars / 3) * 100}%` }}
                transition={{ duration: 0.6, delay: idx * 0.04 + 0.2 }}
                className={`h-full rounded-full bg-gradient-to-r ${accent}`}
              />
            </div>
          )}
        </div>

        {/* Arrow */}
        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-game-purple group-hover:translate-x-1 transition-all flex-shrink-0" />
      </motion.div>
    </Link>
  );
}