import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import GameBadge from './GameBadge';

const difficultyConfig = {
  easy: { label: 'Mudah', icon: '🟢', badge: 'from-green-400 to-green-500' },
  medium: { label: 'Sederhana', icon: '🟡', badge: 'from-yellow-400 to-yellow-500' },
  hard: { label: 'Sukar', icon: '🔴', badge: 'from-red-400 to-red-500' },
};

const categoryColors = {
  bahasa_melayu: 'from-amber-200 to-yellow-300',
  english: 'from-sky-200 to-blue-300',
  mathematics: 'from-pink-200 to-rose-300',
  science: 'from-emerald-200 to-green-300',
  jawi: 'from-purple-200 to-indigo-300',
  worksheet: 'from-orange-200 to-amber-300',
};

export default function GameListCard({ game, gameKey, gameProgress, idx, category, badge }) {
  const difficulty = difficultyConfig[game.difficulty || 'easy'];
  const gradientColor = categoryColors[category] || 'from-gray-100 to-gray-200';

  return (
    <Link to={`/play/${category}/${idx}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: idx * 0.05 }}
        whileHover={{ scale: 1.04, y: -4 }}
        whileTap={{ scale: 0.95 }}
        className="clay rounded-2xl overflow-hidden cursor-pointer group relative"
      >
        {/* Card Top - Coloured */}
        <div className={`bg-gradient-to-br ${gradientColor} p-4 flex flex-col items-center justify-center min-h-[100px]`}>
          <div className="text-4xl mb-1 group-hover:scale-110 transition-transform">
            {game.emoji}
          </div>
          {badge && (
            <div className="absolute top-2 right-2">
              <GameBadge type={badge} />
            </div>
          )}
        </div>

        {/* Card Bottom - Info */}
        <div className="p-3 bg-white">
          <h3 className="font-black text-sm leading-tight text-gray-800 mb-2 line-clamp-2 group-hover:text-game-purple transition-colors">
            {game.title}
          </h3>

          <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full text-white bg-gradient-to-r ${difficulty.badge}`}>
            {difficulty.icon} {difficulty.label}
          </span>

          {/* Stars if played */}
          {gameProgress ? (
            <div className="mt-2 flex items-center justify-between">
              <span className="text-xs font-black text-game-purple">
                {'⭐'.repeat(gameProgress.bestStars)}{'☆'.repeat(3 - gameProgress.bestStars)}
              </span>
              <span className="text-xs text-gray-400">{gameProgress.timesPlayed}x</span>
            </div>
          ) : (
            <div className="mt-2">
              <span className="text-xs text-gray-400 font-semibold">Belum dimainkan</span>
            </div>
          )}
        </div>
      </motion.div>
    </Link>
  );
}