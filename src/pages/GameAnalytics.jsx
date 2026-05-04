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
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #667eea 0%, #f093fb 50%, #f5a623 100%)' }}>
        <div className="text-center">
          <div className="text-6xl animate-bounce mb-4">📊</div>
          <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #667eea 0%, #f093fb 50%, #f5a623 100%)' }}>
        <p className="text-white font-bold">Failed to load analytics</p>
      </div>
    );
  }

  const { subjects, gameHub } = analytics;

  return (
    <div className="min-h-screen pb-32 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #667eea 0%, #f093fb 50%, #f5a623 100%)' }}>
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" />
        <div className="absolute top-1/3 -left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }} />
      </div>
      <AppHeader showBack={true} backTo="/admin-game-manager" />

      <div className="relative max-w-4xl mx-auto px-4 pt-8 pb-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6 p-5 rounded-3xl flex items-center gap-3" style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.4)' }}>
          <div className="text-4xl">📊</div>
          <div>
            <h1 className="text-xl font-black text-white">Game Analytics</h1>
            <p className="text-white/60 text-xs">Tracking soalan & games completion</p>
          </div>
        </motion.div>

        {/* Subject Games Analytics */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-white mb-4">📚 Subject Games</h2>

          {/* Summary Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl p-5 mb-5"
            style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)' }}
          >
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center">
                <p className="text-xs text-white/60 font-semibold mb-1">Total Files</p>
                <p className="text-2xl font-black text-yellow-300">{subjects.summary.totalFiles}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-white/60 font-semibold mb-1">Total Games</p>
                <p className="text-2xl font-black text-blue-200">{subjects.summary.totalGames}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-white/60 font-semibold mb-1">20 Soalan</p>
                <p className="text-2xl font-black text-green-300">{subjects.summary.gamesWithFull20} <span className="text-sm text-white/50">({subjects.summary.percentage}%)</span></p>
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
                className="w-full rounded-2xl p-4 transition-all text-left"
                style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)' }}
                >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-white truncate">{fileData.file}</p>
                    <p className="text-xs text-white/60">
                      {fileData.gamesWithFull20}/{fileData.totalGames} games 20 soalan
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                    <p className="text-xl font-black text-yellow-300">{fileData.percentage}%</p>
                    <ChevronDown
                      className={`w-4 h-4 text-white/60 transition-transform ${
                        expandedFile === fileData.file ? 'rotate-180' : ''
                      }`}
                    />
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-3 w-full h-2 bg-white/20 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${fileData.percentage}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className="h-full bg-gradient-to-r from-purple-300 to-pink-300"
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
                      className="mt-2 space-y-1 rounded-2xl p-3" style={{ background: 'rgba(255,255,255,0.1)' }}
                    >
                      {fileData.games.map((game, gIdx) => (
                        <div key={gIdx} className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-white/10 transition-all">
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-white truncate">{game.title}</p>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                            <span className={`text-xs font-black ${game.isFull ? 'text-green-300' : 'text-orange-300'}`}>
                              {game.questionCount}Q
                            </span>
                            {game.isFull ? (
                              <CheckCircle2 className="w-4 h-4 text-green-400" />
                            ) : (
                              <AlertCircle className="w-4 h-4 text-orange-400" />
                            )}
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
          <h2 className="text-lg font-bold text-white mb-4">🎪 Game Hub Mini-Games</h2>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl p-5"
            style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)' }}
          >
            <div className="grid grid-cols-3 gap-3 mb-5">
              <div className="text-center">
                <p className="text-xs text-white/60 font-semibold mb-1">Total Games</p>
                <p className="text-2xl font-black text-orange-300">{gameHub.totalGames}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-white/60 font-semibold mb-1">Target</p>
                <p className="text-2xl font-black text-white">8</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-white/60 font-semibold mb-1">Completion</p>
                <p className="text-2xl font-black text-yellow-300">{gameHub.percentage}%</p>
              </div>
            </div>

            <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden mb-4">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${gameHub.percentage}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-orange-300 to-yellow-300"
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {gameHub.games.map((game, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`p-3 rounded-xl text-center font-semibold text-xs ${
                    game.isFull
                      ? 'bg-green-500/20 text-green-300 border border-green-400/30'
                      : 'bg-white/10 text-white/60 border border-white/20'
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