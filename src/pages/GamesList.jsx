import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useAgeGroup } from '@/lib/AgeGroupContext';
import { getGamesByAgeAndCategory } from '@/lib/gameLibrary';

const categoryLabels = {
  bahasa_melayu: 'Bahasa Melayu',
  english: 'English',
  mathematics: 'Matematik',
  science: 'Sains',
};

export default function GamesList() {
  const { category } = useParams();
  const { ageGroup } = useAgeGroup();
  const games = getGamesByAgeAndCategory(ageGroup, category);

  return (
    <div className="min-h-screen bg-pattern">
      <div className="max-w-lg mx-auto px-4 py-6">
        {/* Header */}
        <Link to="/">
          <motion.button
            whileTap={{ scale: 0.9 }}
            className="clay-button rounded-full w-12 h-12 flex items-center justify-center mb-6"
          >
            <ArrowLeft className="w-6 h-6" />
          </motion.button>
        </Link>

        <h1 className="text-3xl font-black mb-2">{categoryLabels[category]}</h1>
        <p className="text-gray-600 mb-6">{games.length} Permainan Tersedia</p>

        {/* Games Grid */}
        <div className="space-y-3">
          {games.map((game, i) => (
            <Link key={i} to={`/play/${category}/${i}`}>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ scale: 1.02, x: 4 }}
                whileTap={{ scale: 0.98 }}
                className="clay rounded-2xl p-4 cursor-pointer flex items-center gap-4"
              >
                <span className="text-3xl">{game.emoji}</span>
                <div className="flex-1">
                  <h3 className="font-bold">{game.title}</h3>
                  <p className="text-xs text-gray-600 capitalize">
                    {game.type.replace(/_/g, ' ')} • {game.difficulty}
                  </p>
                </div>
                <span className="text-xl">→</span>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}