import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAgeGroup } from '@/lib/AgeGroupContext';
import { getGamesByAge } from '@/lib/gameLibrary';

const categoryIcons = {
  bahasa_melayu: { emoji: '🇲🇾', label: 'Bahasa Melayu', color: 'from-amber-200 to-yellow-300' },
  english: { emoji: '🇬🇧', label: 'English', color: 'from-sky-200 to-blue-300' },
  mathematics: { emoji: '🔢', label: 'Matematik', color: 'from-pink-200 to-rose-300' },
  science: { emoji: '🔬', label: 'Sains', color: 'from-emerald-200 to-green-300' },
};

export default function CategoryGrid() {
  const { ageGroup } = useAgeGroup();
  const games = getGamesByAge(ageGroup);
  const categories = Object.keys(games);

  return (
    <div className="grid grid-cols-2 gap-4">
      {categories.map((category, i) => {
        const icon = categoryIcons[category];
        const gameCount = games[category].length;

        return (
          <Link key={category} to={`/games/${category}`}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ scale: 1.03, y: -4 }}
              whileTap={{ scale: 0.97 }}
              className={`clay rounded-2xl p-6 bg-gradient-to-br ${icon.color} cursor-pointer h-full`}
            >
              <div className="text-4xl mb-2">{icon.emoji}</div>
              <h3 className="font-bold text-lg mb-1">{icon.label}</h3>
              <p className="text-sm font-semibold opacity-70">{gameCount} Permainan</p>
            </motion.div>
          </Link>
        );
      })}
    </div>
  );
}