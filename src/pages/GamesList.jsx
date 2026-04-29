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

const getCategoryEmoji = (category) => {
  const emojis = {
    bahasa_melayu: '🇲🇾',
    english: '🇬🇧',
    mathematics: '🔢',
    science: '🧪',
  };
  return emojis[category] || '📚';
};

export default function GamesList() {
  const { category } = useParams();
  const { user } = useAuth();
  const [userSubscription, setUserSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState({});

  // Load user subscription to get locked age group
  useEffect(() => {
    if (user) {
      loadUserSubscription();
    }
  }, [user]);

  const loadUserSubscription = async () => {
    try {
      const subData = await base44.entities.UserSubscription.filter({
        email: user.email,
      });
      if (subData.length > 0) {
        setUserSubscription(subData[0]);
      }
    } catch (error) {
      console.error('Failed to load subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const ageGroup = userSubscription?.selectedAgeGroup || 'prasekolah';
  const games = getGamesByAgeAndCategory(ageGroup, category);

  useEffect(() => {
    if (user && userSubscription) {
      loadProgress();
    }
  }, [user, category, userSubscription]);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-pattern flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl animate-bounce mb-4">🎓</div>
          <div className="w-8 h-8 border-4 border-game-purple border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-pattern">
      <div className="max-w-lg mx-auto px-4 py-6 pb-24">
        {/* Header */}
        <Link to="/">
          <motion.button
            whileTap={{ scale: 0.9 }}
            className="clay-button rounded-full w-12 h-12 flex items-center justify-center mb-6"
          >
            <ArrowLeft className="w-6 h-6" />
          </motion.button>
        </Link>

        <motion.div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-4xl">{getCategoryEmoji(category)}</span>
            <h1 className="text-3xl font-black bg-gradient-to-r from-game-purple to-game-pink bg-clip-text text-transparent">
              {categoryLabels[category]}
            </h1>
          </div>
          <p className="text-gray-600 ml-13 font-semibold">{games.length} Permainan • Seru & Edukatif</p>
        </motion.div>

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