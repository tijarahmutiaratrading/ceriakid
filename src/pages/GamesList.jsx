import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useAgeGroup } from '@/lib/AgeGroupContext';
import { useAuth } from '@/lib/AuthContext';
import { base44 } from '@/api/base44Client';
import { getGamesByAgeAndCategory } from '@/lib/gameLibrary';
import GameListCard from '@/components/game/GameListCard';

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
  const { ageGroup } = useAgeGroup();
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState({});

  // Load progress data
  useEffect(() => {
    if (user) {
      setLoading(false);
    }
  }, [user]);

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
    <div className="min-h-screen bg-pattern pb-32">
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

        <motion.div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-4xl">{getCategoryEmoji(category)}</span>
            <h1 className="text-3xl font-black text-gray-900">
              {categoryLabels[category]}
            </h1>
          </div>
          <div className="flex items-center gap-2 ml-13">
            <span className="text-sm font-bold text-game-purple">🎮 {games.length} Permainan</span>
            <span className="text-gray-400">•</span>
            <span className="text-sm text-gray-600">Pilih untuk bermain</span>
          </div>
        </motion.div>

        {/* Games Grid */}
        {games.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="clay rounded-3xl p-8 text-center mt-12"
          >
            <p className="text-5xl mb-4">🚀</p>
            <p className="text-xl font-bold mb-2">Permainan Baru Akan Datang!</p>
            <p className="text-gray-600 mb-6">Kami sedang menyediakan permainan terbaik untuk kategori ini.</p>
            <Link to="/">
              <motion.button
                whileHover={{ scale: 1.05 }}
                className="px-6 py-3 bg-game-purple text-white rounded-full font-bold"
              >
                ← Kembali ke Rumah
              </motion.button>
            </Link>
          </motion.div>
        ) : (
          <div className="space-y-4">
          {games.map((game, i) => {
            const gameKey = `${ageGroup}-${category}-${i}`;
            const gameProgress = progress[gameKey];
            
            return (
              <GameListCard
                key={i}
                game={game}
                gameKey={gameKey}
                gameProgress={gameProgress}
                idx={i}
                category={category}
                badge={
                  i < 2 ? 'new' : 
                  gameProgress && gameProgress.bestStars < 2 ? 'recommended' : 
                  null
                }
              />
            );
          })}
          </div>
        )}
      </div>
    </div>
  );
}