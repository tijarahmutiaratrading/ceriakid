import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, Zap, Trophy } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { base44 } from '@/api/base44Client';
import { getGamesByAgeAndCategory } from '@/lib/gameLibrary';
import { useAgeGroup } from '@/lib/AgeGroupContext';

const categoryLabels = {
  bahasa_melayu: '🇲🇾 Bahasa Melayu',
  english: '🇬🇧 English',
  mathematics: '🔢 Matematik',
  science: '🔬 Sains',
};

export default function Challenges() {
  const { user, isAuthenticated, navigateToLogin } = useAuth();
  const { ageGroup } = useAgeGroup();
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigateToLogin();
      return;
    }
    loadChallenges();
  }, [user, isAuthenticated]);

  const loadChallenges = async () => {
    try {
      const myChallenges = await base44.entities.FriendChallenge.filter({
        createdBy: user.email,
      }) || [];
      const opponentChallenges = await base44.entities.FriendChallenge.filter({
        opponent: user.email,
      }) || [];
      setChallenges([...myChallenges, ...opponentChallenges]);
    } catch (error) {
      console.error('Failed to load challenges:', error);
    } finally {
      setLoading(false);
    }
  };

  const createChallenge = async (friendEmail, gameCategory) => {
    try {
      const challengeId = Math.random().toString(36).substring(7);
      await base44.entities.FriendChallenge.create({
        challengeId,
        createdBy: user.email,
        opponent: friendEmail,
        gameCategory,
        status: 'pending',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      });
      loadChallenges();
    } catch (error) {
      console.error('Failed to create challenge:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-pattern flex items-center justify-center">
        <div className="text-6xl animate-bounce">⚡</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-amber-50">
      <div className="max-w-lg mx-auto px-4 py-6 pb-24">
        <Link to="/">
          <motion.button whileTap={{ scale: 0.9 }} className="clay-button rounded-full w-12 h-12 flex items-center justify-center mb-6">
            <ArrowLeft className="w-6 h-6" />
          </motion.button>
        </Link>

        <h1 className="text-3xl font-black text-gray-800 mb-8">⚡ Cabar Kawan</h1>

        {/* Create Challenge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-game-orange to-orange-400 text-white rounded-3xl p-6 mb-6 shadow-lg"
        >
          <p className="font-bold mb-4">Pilih Subjek untuk Cabar Kawan</p>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(categoryLabels).map(([cat, label]) => (
              <motion.button
                key={cat}
                whileTap={{ scale: 0.95 }}
                onClick={() => createChallenge('friend@example.com', cat)}
                className="bg-white text-game-orange rounded-xl py-2 font-bold text-sm"
              >
                {label}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Active Challenges */}
        {challenges.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl p-6 text-center border-2 border-amber-200 shadow-lg"
          >
            <p className="text-lg font-bold mb-2">Belum ada cabaran</p>
            <p className="text-sm text-gray-600">Cabar kawan anda untuk bermain bersama!</p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {challenges.map((challenge, idx) => (
              <motion.div
                key={challenge.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white rounded-2xl p-4 border-2 border-amber-200 shadow-md"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-bold text-gray-800">{categoryLabels[challenge.gameCategory]}</p>
                    <p className="text-xs text-gray-600">{challenge.createdBy === user.email ? `Cabar kepada ${challenge.opponent}` : `Cabaran dari ${challenge.createdBy}`}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    challenge.status === 'completed' ? 'bg-green-100 text-green-700' :
                    challenge.status === 'active' ? 'bg-orange-100 text-orange-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {challenge.status === 'pending' ? '⏳ Menunggu' : challenge.status === 'active' ? '🎮 Aktif' : '✅ Selesai'}
                  </span>
                </div>
                
                {challenge.status === 'completed' && (
                  <div className="flex items-center gap-4 text-sm font-bold">
                    <div className="flex-1">
                      <p className="text-gray-600">Anda</p>
                      <p className="text-lg text-game-purple">{challenge.creatorScore} pts</p>
                    </div>
                    <Zap className="w-5 h-5 text-orange-500" />
                    <div className="flex-1 text-right">
                      <p className="text-gray-600">Lawan</p>
                      <p className="text-lg text-game-blue">{challenge.opponentScore} pts</p>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}