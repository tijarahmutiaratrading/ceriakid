import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { RotateCcw } from 'lucide-react';

const difficultyConfig = {
  easy: { label: 'Mudah', color: 'bg-green-400', icon: '🟢', badge: 'from-green-400 to-green-500' },
  medium: { label: 'Sederhana', color: 'bg-yellow-400', icon: '🟡', badge: 'from-yellow-400 to-yellow-500' },
  hard: { label: 'Sukar', color: 'bg-red-400', icon: '🔴', badge: 'from-red-400 to-red-500' },
};

export default function GameListCard({ game, gameKey, gameProgress, idx, category }) {
  const difficulty = difficultyConfig[game.difficulty || 'easy'];
  
  return (
    <div className="relative">
      <Link to={`/play/${category}/${idx}`}>
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: idx * 0.04 }}
          whileHover={{ scale: 1.02, x: 6 }}
          whileTap={{ scale: 0.97 }}
          className="clay rounded-2xl p-4 cursor-pointer flex items-center gap-4 group hover:shadow-lg transition-all"
        >
          {/* Game Emoji */}
          <div className="text-4xl group-hover:scale-110 transition-transform">{game.emoji}</div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Title */}
            <h3 className="font-bold text-base truncate group-hover:text-game-purple transition-colors">
              {game.title}
            </h3>

            {/* Metadata Row */}
            <div className="flex items-center gap-2 mt-1">
              {/* Difficulty Badge */}
              <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full text-white bg-gradient-to-r ${difficulty.badge}`}>
                {difficulty.icon}
                {difficulty.label}
              </span>

              {/* Game Type */}
              <span className="text-xs text-gray-500 font-semibold capitalize truncate">
                {game.type.replace(/_/g, ' ')}
              </span>
            </div>

            {/* Progress Info */}
            {gameProgress && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-2 pt-2 border-t border-gray-100"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-black text-game-purple">
                      ⭐ {gameProgress.bestStars}/3
                    </span>
                    <span className="text-xs text-gray-500">
                      ({gameProgress.timesPlayed}x)
                    </span>
                  </div>
                  
                  {/* Mini Progress Bar */}
                  <div className="flex-1 max-w-[60px] h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(gameProgress.bestStars / 3) * 100}%` }}
                      transition={{ duration: 0.5 }}
                      className="h-full bg-gradient-to-r from-game-yellow to-game-pink"
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* CTA Arrow */}
          <motion.div
            animate={{ x: gameProgress ? [0, 0] : [0, 2, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-xl opacity-50 group-hover:opacity-100 flex-shrink-0"
          >
            →
          </motion.div>
        </motion.div>
      </Link>

      {/* Repeat Play Button - Bottom Right */}
      {gameProgress && (
        <Link to={`/play/${category}/${idx}`}>
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: idx * 0.04 + 0.2 }}
            whileHover={{ scale: 1.15, rotate: -10 }}
            whileTap={{ scale: 0.9 }}
            className="absolute bottom-2 right-2 bg-gradient-to-r from-game-purple to-game-pink text-white p-2 rounded-full shadow-lg hover:shadow-xl transition-all"
            title="Main lagi"
          >
            <RotateCcw className="w-4 h-4" />
          </motion.button>
        </Link>
      )}
    </div>
  );
}