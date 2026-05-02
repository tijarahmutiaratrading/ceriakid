import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Loader2, Plus, Minus, X, BarChart3, MessageSquare } from 'lucide-react';
import AppHeader from '@/components/AppHeader';
import GameManagerAI from '@/components/admin/GameManagerAI';

const GAME_FILES = [
  'gameData_prasekolah_bm', 'gameData_prasekolah_en', 'gameData_prasekolah_math', 'gameData_prasekolah_science',
  'gameData_sr_bm', 'gameData_sr_english', 'gameData_sr_math', 'gameData_sr_science',
];

export default function AdminGameManager() {
  const [activeModal, setActiveModal] = useState(null);
  const [showAI, setShowAI] = useState(false);
  const [targetCount, setTargetCount] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleAction = async (action) => {
    if (!targetCount) {
      setMessage('❌ Sila masukkan target jumlah');
      return;
    }

    setLoading(true);
    try {
      let functionName = '';
      let payload = { targetCount: parseInt(targetCount) };

      if (action === 'subject_soalan') {
        functionName = 'syncSubjectGameQuestions';
      } else if (action === 'subject_games') {
        functionName = 'syncSubjectGames';
      } else if (action === 'hub_games') {
        functionName = 'syncGameHubGames';
      }

      const res = await base44.functions.invoke(functionName, payload);
      setMessage(`✅ Berhasil! ${res.data.message}`);
      setTargetCount('');
    } catch (err) {
      setMessage(`❌ Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 pb-32">
      <AppHeader showBack={true} backTo="/admin-dashboard" />

      <div className="max-w-2xl mx-auto px-4 pt-24">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-black text-gray-900 mb-2">🎮 Admin Game Manager</h1>
            <p className="text-gray-600">Auto apply ke semua files</p>
          </div>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAI(!showAI)}
            className="bg-gradient-to-br from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-bold p-3 rounded-full shadow-lg flex items-center justify-center transition-all"
            title="AI Game Manager Assistant"
          >
            <MessageSquare className="w-6 h-6" />
          </motion.button>
        </motion.div>

        {/* Message */}
        {/* Quick Links */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8 grid grid-cols-2 gap-3">
          <Link to="/game-database">
            <button className="w-full bg-gradient-to-br from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-bold py-3 rounded-2xl shadow-lg flex items-center justify-center gap-2 transition-all">
              <span>🗄️ Game Database</span>
            </button>
          </Link>
          <Link to="/game-analytics">
            <button className="w-full bg-gradient-to-br from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white font-bold py-3 rounded-2xl shadow-lg flex items-center justify-center gap-2 transition-all">
              <BarChart3 className="w-5 h-5" />
              <span>📊 Analytics</span>
            </button>
          </Link>
        </motion.div>

        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-xl mb-6 ${message.includes('✅') ? 'bg-green-50 border-l-4 border-green-500 text-green-900' : 'bg-red-50 border-l-4 border-red-500 text-red-900'}`}
          >
            <p className="font-bold">{message}</p>
          </motion.div>
        )}

        {/* Subject Games Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">📚 Subjek Games</h2>
          <div className="grid grid-cols-2 gap-4">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveModal('subject_soalan')}
              className="bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-4 rounded-2xl shadow-lg flex flex-col items-center justify-center gap-2 transition-all"
            >
              <span className="text-3xl">📝</span>
              <span>Edit Soalan</span>
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveModal('subject_games')}
              className="bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-bold py-4 rounded-2xl shadow-lg flex flex-col items-center justify-center gap-2 transition-all"
            >
              <span className="text-3xl">🎮</span>
              <span>Edit Games</span>
            </motion.button>
          </div>
        </div>

        {/* Game Hub Section */}
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">🎪 Game Hub</h2>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveModal('hub_games')}
            className="w-full bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-4 rounded-2xl shadow-lg flex flex-col items-center justify-center gap-2 transition-all"
          >
            <span className="text-3xl">🎯</span>
            <span>Edit Game Hub</span>
          </motion.button>
        </div>
      </div>

      {/* SUBJECT SOALAN MODAL */}
      <AnimatePresence>
        {activeModal === 'subject_soalan' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveModal(null)}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-black text-gray-900">📝 Set Soalan</h2>
                <button
                  onClick={() => setActiveModal(null)}
                  className="p-1 hover:bg-gray-100 rounded-lg transition-all"
                >
                  <X className="w-6 h-6 text-gray-600" />
                </button>
              </div>

              <p className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg mb-4">
                ℹ️ Subjek: BM, English, Math, Science (semua jajaran)
              </p>

              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-700 mb-2">Target Soalan (per game)</label>
                <input
                  type="number"
                  min="4"
                  max="100"
                  value={targetCount}
                  onChange={(e) => setTargetCount(e.target.value)}
                  placeholder="e.g. 20"
                  className="w-full p-3 border-2 border-gray-300 rounded-xl focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => handleAction('subject_soalan')}
                disabled={loading || !targetCount}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-3 rounded-xl disabled:opacity-50 flex items-center justify-center gap-2 transition-all"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>✓</span>}
                {loading ? 'Processing...' : 'Apply'}
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SUBJECT GAMES MODAL */}
      <AnimatePresence>
        {activeModal === 'subject_games' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveModal(null)}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-black text-gray-900">🎮 Set Games</h2>
                <button
                  onClick={() => setActiveModal(null)}
                  className="p-1 hover:bg-gray-100 rounded-lg transition-all"
                >
                  <X className="w-6 h-6 text-gray-600" />
                </button>
              </div>

              <p className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg mb-4">
                ℹ️ Subjek: BM, English, Math, Science (semua jajaran)
              </p>

              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-700 mb-2">Target Jumlah Games</label>
                <input
                  type="number"
                  min="1"
                  value={targetCount}
                  onChange={(e) => setTargetCount(e.target.value)}
                  placeholder="e.g. 25"
                  className="w-full p-3 border-2 border-gray-300 rounded-xl focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => handleAction('subject_games')}
                disabled={loading || !targetCount}
                className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-bold py-3 rounded-xl disabled:opacity-50 flex items-center justify-center gap-2 transition-all"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>✓</span>}
                {loading ? 'Processing...' : 'Apply'}
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* GAME HUB GAMES MODAL */}
      <AnimatePresence>
        {activeModal === 'hub_games' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveModal(null)}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-black text-gray-900">🎯 Set Game Hub</h2>
                <button
                  onClick={() => setActiveModal(null)}
                  className="p-1 hover:bg-gray-100 rounded-lg transition-all"
                >
                  <X className="w-6 h-6 text-gray-600" />
                </button>
              </div>

              <p className="text-sm text-gray-600 bg-orange-50 p-3 rounded-lg mb-4">
                ℹ️ Mini-games: Memory, DragDrop, WordBuilder, Sorting, TileMatch, Story, Physics, Tracing
              </p>

              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-700 mb-2">Target Jumlah Games</label>
                <input
                  type="number"
                  min="1"
                  value={targetCount}
                  onChange={(e) => setTargetCount(e.target.value)}
                  placeholder="e.g. 8"
                  className="w-full p-3 border-2 border-gray-300 rounded-xl focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => handleAction('hub_games')}
                disabled={loading || !targetCount}
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-3 rounded-xl disabled:opacity-50 flex items-center justify-center gap-2 transition-all"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>✓</span>}
                {loading ? 'Processing...' : 'Apply'}
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI Assistant */}
      <AnimatePresence>
        {showAI && <GameManagerAI onClose={() => setShowAI(false)} />}
      </AnimatePresence>
    </div>
  );
}