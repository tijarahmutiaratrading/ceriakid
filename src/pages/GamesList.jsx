import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import { useAgeGroup } from '@/lib/AgeGroupContext';
import { useAuth } from '@/lib/AuthContext';
import { base44 } from '@/api/base44Client';
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
  const { user } = useAuth();
  const games = getGamesByAgeAndCategory(ageGroup, category);
  const [progress, setProgress] = useState({});

  useEffect(() => {
    if (user) {
      loadProgress();
    }
  }, [user, category, ageGroup]);

  const loadProgress = async () => {
    try {
      const progressData = await base44.entities.ChildGameProgress.filter({
        userEmail: user.email,
        childName: user.full_name || 'Default',
      });
      const progressMap = {};
      progressData.forEach(p => {
        progressMap[p.gameType] = p;
      });
      setProgress(progressMap);
    } catch (error) {
      console.error('Failed to load progress:', error);
    }
  };

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
          {games.map((game, i) => {
            const gameKey = `${ageGroup}-${category}-${i}`;
            const gameProgress = progress[gameKey];
            
            return (
              <div key={i} className="relative">
                <Link to={`/play/${category}/${i}`}>
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
                      {gameProgress && (
                        <p className="text-xs text-game-purple font-semibold mt-1">
                          ⭐ {gameProgress.bestStars}/3 • {gameProgress.timesPlayed}x dimainkan
                        </p>
                      )}
                    </div>
                    <span className="text-xl">→</span>
                  </motion.div>
                </Link>
                
                {gameProgress && (
                  <Link to={`/play/${category}/${i}`}>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      className="absolute top-2 right-2 bg-game-purple text-white p-1.5 rounded-full shadow-lg"
                      title="Main lagi"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </motion.button>
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}