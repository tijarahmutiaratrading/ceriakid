import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, TrendingDown, Zap, BookOpen } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { base44 } from '@/api/base44Client';

const categoryLabels = {
  bahasa_melayu: 'Bahasa Melayu',
  english: 'English',
  mathematics: 'Matematik',
  science: 'Sains',
};

export default function ParentDashboard() {
  const { user } = useAuth();
  const [childrenData, setChildrenData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadChildrenProgress();
    }
  }, [user]);

  const loadChildrenProgress = async () => {
    try {
      const progressData = await base44.entities.ChildGameProgress.filter({
        userEmail: user.email,
      });

      const grouped = {};
      progressData.forEach(progress => {
        if (!grouped[progress.childName]) {
          grouped[progress.childName] = [];
        }
        grouped[progress.childName].push(progress);
      });

      setChildrenData(grouped);
    } catch (error) {
      console.error('Failed to load progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const analyzeWeakSubjects = (games) => {
    const subjectStats = {};
    
    games.forEach(game => {
      if (!subjectStats[game.category]) {
        subjectStats[game.category] = {
          totalStars: 0,
          totalPlayed: 0,
          averageStars: 0,
        };
      }
      subjectStats[game.category].totalStars += game.bestStars || 0;
      subjectStats[game.category].totalPlayed += 1;
    });

    // Calculate average stars per subject
    Object.keys(subjectStats).forEach(category => {
      const stats = subjectStats[category];
      stats.averageStars = stats.totalStars / stats.totalPlayed;
    });

    // Sort by weakest (lowest average stars)
    return Object.entries(subjectStats)
      .map(([category, stats]) => ({
        category,
        ...stats,
      }))
      .sort((a, b) => a.averageStars - b.averageStars);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-pattern flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl animate-bounce mb-4">📊</div>
          <div className="w-8 h-8 border-4 border-game-purple border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  const totalChildren = Object.keys(childrenData).length;

  return (
    <div className="min-h-screen bg-pattern">
      <div className="max-w-lg mx-auto px-4 py-6 pb-24">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-black mb-1">📊 Prestasi Anak</h1>
          <p className="text-sm text-gray-600 mb-6">{totalChildren} anak terdaftar</p>
        </div>

        {/* Children Summary */}
        {totalChildren === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="clay rounded-3xl p-6 text-center"
          >
            <p className="text-lg font-bold mb-2">Belum ada data</p>
            <p className="text-sm text-gray-600">
              Biarkan anak bermain permainan untuk melihat prestasi mereka di sini
            </p>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {Object.entries(childrenData).map(([childName, games], idx) => {
              const weakSubjects = analyzeWeakSubjects(games);
              const totalGames = games.length;
              const totalStars = games.reduce((sum, g) => sum + (g.bestStars || 0), 0);
              const avgStars = (totalStars / totalGames).toFixed(1);

              return (
                <motion.div
                  key={childName}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="clay rounded-3xl p-6 space-y-4"
                >
                  {/* Child Header */}
                  <div className="border-b pb-4">
                    <h2 className="text-2xl font-black text-game-purple mb-1">
                      👧 {childName}
                    </h2>
                    <div className="flex gap-4 text-sm font-bold">
                      <span>🎮 {totalGames} permainan</span>
                      <span>⭐ {avgStars} bintang rata-rata</span>
                    </div>
                  </div>

                  {/* Progress Bars */}
                  <div className="space-y-3">
                    <h3 className="font-bold text-sm text-gray-700 flex items-center gap-2">
                      <BookOpen className="w-4 h-4" />
                      Prestasi Per Subjek
                    </h3>
                    {weakSubjects.map((subject) => {
                      const percentage = (subject.averageStars / 3) * 100;
                      return (
                        <div key={subject.category}>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm font-semibold">
                              {categoryLabels[subject.category] || subject.category}
                            </span>
                            <span className="text-xs font-bold text-gray-600">
                              {subject.totalPlayed} games
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${percentage}%` }}
                              transition={{ duration: 0.8, delay: 0.2 }}
                              className={`h-3 rounded-full ${
                                percentage >= 66
                                  ? 'bg-green-400'
                                  : percentage >= 33
                                  ? 'bg-yellow-400'
                                  : 'bg-red-400'
                              }`}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Weak Subjects Alert */}
                  {weakSubjects[0]?.averageStars < 2 && (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="bg-orange-100 rounded-2xl p-4 flex gap-3"
                    >
                      <TrendingDown className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                      <div className="text-sm">
                        <p className="font-bold text-orange-900">Subjek yang perlu ditingkatkan</p>
                        <p className="text-orange-800">
                          {categoryLabels[weakSubjects[0].category]} memerlukan latihan lebih
                        </p>
                      </div>
                    </motion.div>
                  )}

                  {/* Motivation */}
                  {avgStars >= 2.5 && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-green-100 rounded-2xl p-4 flex gap-3"
                    >
                      <Zap className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <div className="text-sm">
                        <p className="font-bold text-green-900">Cemerlang! 🌟</p>
                        <p className="text-green-800">
                          {childName} menunjukkan prestasi yang sangat baik. Teruskan!
                        </p>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}


      </div>
    </div>
  );
}