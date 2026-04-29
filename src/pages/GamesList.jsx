import React, { useState, useEffect, useCallback } from 'react';
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
  jawi: 'Aksara Jawi',
  worksheet: 'Worksheet & Tracing',
};

const getCategoryEmoji = (category) => {
  const emojis = {
    bahasa_melayu: '🇲🇾',
    english: '🇬🇧',
    mathematics: '🔢',
    science: '🧪',
    jawi: '🕌',
    worksheet: '✏️',
  };
  return emojis[category] || '📚';
};

const DARJAH_LABELS = {
  1: 'Darjah 1',
  2: 'Darjah 2',
  3: 'Darjah 3',
  4: 'Darjah 4',
  5: 'Darjah 5',
  6: 'Darjah 6',
};

export default function GamesList() {
  const { category } = useParams();
  const { user, isAuthenticated } = useAuth();
  const { ageGroup } = useAgeGroup();
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState({});
  const [selectedDarjah, setSelectedDarjah] = useState(null);
  const [userTier, setUserTier] = useState('free');

  useEffect(() => {
    if (user) {
      loadUserTier();
    }
    setLoading(false);
  }, [user]);

  const loadUserTier = async () => {
    try {
      const subs = await base44.entities.UserSubscription.filter({ email: user.email });
      if (subs.length > 0 && subs[0].status === 'active') {
        setUserTier(subs[0].tier || 'free');
      }
    } catch (e) {
      // default free
    }
  };

  // Determine if a game index is accessible based on tier
  const isGameLocked = useCallback((globalIdx) => {
    if (!isAuthenticated) return globalIdx >= 5; // guests: first 5 only
    if (userTier === 'pro') return false; // pro: semua
    if (userTier === 'premium') return globalIdx >= 100; // premium: 100+
    if (userTier === 'starter') return globalIdx >= 50; // starter: 50+
    return globalIdx >= 5; // free: first 5
  }, [isAuthenticated, userTier]);

  const allGames = getGamesByAgeAndCategory(ageGroup, category);

  // Check if games have darjah field (sekolah rendah)
  const hasDarjah = ageGroup === 'sekolah_rendah' && allGames.some(g => g.darjah);

  // Get available darjah levels
  const availableDarjah = hasDarjah
    ? [...new Set(allGames.map(g => g.darjah).filter(Boolean))].sort()
    : [];

  // Set default darjah on first load
  useEffect(() => {
    if (hasDarjah && availableDarjah.length > 0 && selectedDarjah === null) {
      setSelectedDarjah(availableDarjah[0]);
    } else if (!hasDarjah) {
      setSelectedDarjah(null);
    }
  }, [hasDarjah, ageGroup, category]);

  // Filter games by darjah
  const games = hasDarjah && selectedDarjah !== null
    ? allGames.filter(g => g.darjah === selectedDarjah)
    : allGames;

  useEffect(() => {
    if (user && category) {
      loadProgress();
    }
  }, [user, category]);

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

        <motion.div className="mb-4">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-4xl">{getCategoryEmoji(category)}</span>
            <h1 className="text-3xl font-black text-gray-900">
              {categoryLabels[category]}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-game-purple">🎮 {allGames.length} Permainan</span>
            <span className="text-gray-400">•</span>
            <span className="text-sm text-gray-600">Pilih untuk bermain</span>
          </div>
        </motion.div>

        {/* Darjah Tabs - Only for Sekolah Rendah */}
        {hasDarjah && (
          <div className="mb-5">
            <p className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">Pilih Darjah:</p>
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {availableDarjah.map(d => (
                <motion.button
                  key={d}
                  whileTap={{ scale: 0.92 }}
                  onClick={() => setSelectedDarjah(d)}
                  className={`flex-shrink-0 px-4 py-2 rounded-2xl font-bold text-sm transition-all border-2 ${
                    selectedDarjah === d
                      ? 'bg-game-purple text-white border-game-purple shadow-lg'
                      : 'bg-white text-gray-700 border-amber-200 hover:border-game-purple'
                  }`}
                >
                  {DARJAH_LABELS[d] || `Darjah ${d}`}
                  <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${
                    selectedDarjah === d ? 'bg-white/30 text-white' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {allGames.filter(g => g.darjah === d).length}
                  </span>
                </motion.button>
              ))}
            </div>
          </div>
        )}

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
              // For darjah-filtered games, calculate global index for routing
              const globalIdx = allGames.findIndex((g, idx) => g === game);
              const gameKey = `${ageGroup}-${category}-${globalIdx}`;
              const gameProgress = progress[gameKey];

              const locked = isGameLocked(globalIdx);
              return (
                <GameListCard
                  key={`game-${globalIdx}`}
                  game={game}
                  gameKey={gameKey}
                  gameProgress={gameProgress}
                  idx={globalIdx}
                  category={category}
                  locked={locked}
                  badge={
                    locked ? 'locked' :
                    globalIdx < 2 ? 'new' :
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