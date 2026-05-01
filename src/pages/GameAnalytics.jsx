import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Loader2, CheckCircle2, AlertCircle, ChevronDown } from 'lucide-react';
import AppHeader from '@/components/AppHeader';

export default function GameAnalytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedFile, setExpandedFile] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await base44.functions.invoke('getGameAnalytics', {});
        setAnalytics(res.data);
      } catch (err) {
        console.error('Analytics fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-game-purple mx-auto mb-4" />
          <p className="text-gray-600 font-semibold">Loading Analytics...</p>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <p className="text-gray-600">Failed to load analytics</p>
      </div>
    );
  }

  const { subjects, gameHub } = analytics;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 pb-32">
      <AppHeader showBack={true} backTo="/admin-game-manager" />

      <div className="max-w-4xl mx-auto px-4 pt-24">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-4xl font-black text-gray-900 mb-2">📊 Game Analytics</h1>
          <p className="text-gray-600">Tracking soalan & games completion</p>
        </motion.div>

        {/* Subject Games Analytics */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">📚 Subject Games</h2>

          {/* Summary Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-6 shadow-lg mb-6 border-l-4 border-game-purple"
          >
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600 font-semibold mb-1">Total Files</p>
                <p className="text-3xl font-black text-game-purple">{subjects.summary.totalFiles}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-semibold mb-1">Total Games</p>
                <p className="text-3xl font-black text-blue-600">{subjects.summary.totalGames}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-semibold mb-1">With 20 Questions</p>
                <div className="flex items-center gap-2">
                  <p className="text-3xl font-black text-green-600">{subjects.summary.gamesWithFull20}</p>
                  <p className="text-xl font-bold text-gray-500">({subjects.summary.percentage}%)</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* File Breakdown */}
          <div className="space-y-3">
            {subjects.total.map((fileData, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <button
                  onClick={() => setExpandedFile(expandedFile === fileData.file ? null : fileData.file)}
                  className="w-full bg-white rounded-2xl p-4 shadow-md hover:shadow-lg transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="flex-1 text-left">
                        <p className="font-bold text-gray-800">{fileData.file}</p>
                        <p className="text-sm text-gray-600">
                          {fileData.gamesWithFull20}/{fileData.totalGames} games with 20 questions
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-2xl font-black text-game-purple">{fileData.percentage}%</p>
                      </div>
                      <ChevronDown
                        className={`w-5 h-5 text-gray-600 transition-transform ${
                          expandedFile === fileData.file ? 'rotate-180' : ''
                        }`}
                      />
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-3 w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${fileData.percentage}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                      className="h-full bg-gradient-to-r from-game-purple to-game-pink"
                    />
                  </div>
                </button>

                {/* Expanded Games List */}
                <AnimatePresence>
                  {expandedFile === fileData.file && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-2 space-y-2 bg-gray-50 rounded-2xl p-4"
                    >
                      {fileData.games.map((game, gIdx) => (
                        <div key={gIdx} className="flex items-center justify-between p-3 bg-white rounded-lg">
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-gray-800">{game.title}</p>
                            <p className="text-xs text-gray-500">{game.questionCount} questions</p>
                          </div>
                          <div className="flex items-center gap-2">
                            {game.isFull ? (
                              <CheckCircle2 className="w-5 h-5 text-green-600" />
                            ) : (
                              <AlertCircle className="w-5 h-5 text-orange-500" />
                            )}
                            <span className={`text-sm font-bold ${game.isFull ? 'text-green-600' : 'text-orange-600'}`}>
                              {game.questionCount < 20 ? `${20 - game.questionCount} short` : '✓'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Game Hub Analytics */}
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">🎪 Game Hub Mini-Games</h2>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-2xl p-6 shadow-lg border-l-4 border-orange-500"
          >
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div>
                <p className="text-sm text-gray-600 font-semibold mb-1">Total Games</p>
                <p className="text-3xl font-black text-orange-600">{gameHub.totalGames}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-semibold mb-1">Target</p>
                <p className="text-3xl font-black text-gray-700">8</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-semibold mb-1">Completion</p>
                <p className="text-3xl font-black text-orange-600">{gameHub.percentage}%</p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden mb-4">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${gameHub.percentage}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-orange-500 to-yellow-500"
              />
            </div>

            {/* Games Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {gameHub.games.map((game, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`p-3 rounded-lg text-center font-semibold text-sm ${
                    game.isFull
                      ? 'bg-green-100 text-green-700 border-2 border-green-500'
                      : 'bg-white text-gray-700 border-2 border-gray-200'
                  }`}
                >
                  {game.title}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}