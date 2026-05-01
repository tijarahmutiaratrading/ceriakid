import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Loader2, Plus, Minus, X } from 'lucide-react';
import AppHeader from '@/components/AppHeader';

const GAME_FILES = [
  'gameData_prasekolah_bm', 'gameData_prasekolah_en', 'gameData_prasekolah_math', 'gameData_prasekolah_science',
  'gameData_sr_bm', 'gameData_sr_english', 'gameData_sr_math', 'gameData_sr_science',
];

export default function AdminGameManager() {
  const [activeModal, setActiveModal] = useState(null);
  const [selectedFile, setSelectedFile] = useState('');
  const [targetCount, setTargetCount] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleAction = async (action) => {
    if (!selectedFile) {
      setMessage('❌ Sila pilih file');
      return;
    }

    if ((action === 'expandQ' || action === 'reduceQ') && !targetCount) {
      setMessage('❌ Sila masukkan target jumlah soalan');
      return;
    }

    setLoading(true);
    try {
      let functionName = '';
      let payload = { fileName: selectedFile };

      if (action === 'expandQ') {
        functionName = 'expandGameQuestions';
        payload.targetCount = parseInt(targetCount);
      } else if (action === 'reduceQ') {
        functionName = 'reduceGameQuestions';
        payload.targetCount = parseInt(targetCount);
      } else if (action === 'expandG') {
        functionName = 'expandGames';
      } else if (action === 'reduceG') {
        functionName = 'reduceGames';
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
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-4xl font-black text-gray-900 mb-2">🎮 Admin Game Manager</h1>
          <p className="text-gray-600">Manage soalan dan games</p>
        </motion.div>

        {/* File Selector */}
        <div className="mb-6">
          <label className="block text-sm font-bold text-gray-700 mb-2">Pilih File</label>
          <select
            value={selectedFile}
            onChange={(e) => setSelectedFile(e.target.value)}
            className="w-full p-3 border-2 border-gray-300 rounded-xl focus:border-indigo-500 focus:outline-none font-medium"
          >
            <option value="">-- Pilih File --</option>
            {GAME_FILES.map(file => (
              <option key={file} value={file}>{file}</option>
            ))}
          </select>
        </div>

        {/* Message */}
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-xl mb-6 ${message.includes('✅') ? 'bg-green-50 border-l-4 border-green-500 text-green-900' : 'bg-red-50 border-l-4 border-red-500 text-red-900'}`}
          >
            <p className="font-bold">{message}</p>
          </motion.div>
        )}

        {/* Main Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveModal('soalan')}
            className="bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-4 rounded-2xl shadow-lg flex flex-col items-center justify-center gap-2 transition-all"
          >
            <span className="text-3xl">📝</span>
            <span>Edit Soalan</span>
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveModal('games')}
            className="bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-bold py-4 rounded-2xl shadow-lg flex flex-col items-center justify-center gap-2 transition-all"
          >
            <span className="text-3xl">🎮</span>
            <span>Edit Games</span>
          </motion.button>
        </div>
      </div>

      {/* SOALAN MODAL */}
      <AnimatePresence>
        {activeModal === 'soalan' && (
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
                <h2 className="text-2xl font-black text-gray-900">📝 Edit Soalan</h2>
                <button
                  onClick={() => setActiveModal(null)}
                  className="p-1 hover:bg-gray-100 rounded-lg transition-all"
                >
                  <X className="w-6 h-6 text-gray-600" />
                </button>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-bold text-gray-700 mb-2">Target Jumlah (per game)</label>
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

              <div className="grid grid-cols-2 gap-3">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleAction('expandQ')}
                  disabled={loading}
                  className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-xl disabled:opacity-50 flex items-center justify-center gap-2 transition-all"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  Expand
                </motion.button>

                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleAction('reduceQ')}
                  disabled={loading}
                  className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl disabled:opacity-50 flex items-center justify-center gap-2 transition-all"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Minus className="w-4 h-4" />}
                  Reduce
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* GAMES MODAL */}
      <AnimatePresence>
        {activeModal === 'games' && (
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
                <h2 className="text-2xl font-black text-gray-900">🎮 Edit Games</h2>
                <button
                  onClick={() => setActiveModal(null)}
                  className="p-1 hover:bg-gray-100 rounded-lg transition-all"
                >
                  <X className="w-6 h-6 text-gray-600" />
                </button>
              </div>

              <p className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg mb-4">
                ℹ️ Expand: Tambah 5 games (duplicate last)
                <br />
                Reduce: Buang 5 games (delete last)
              </p>

              <div className="grid grid-cols-2 gap-3">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleAction('expandG')}
                  disabled={loading || !selectedFile}
                  className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 rounded-xl disabled:opacity-50 flex items-center justify-center gap-2 transition-all"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  Expand
                </motion.button>

                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleAction('reduceG')}
                  disabled={loading || !selectedFile}
                  className="bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-xl disabled:opacity-50 flex items-center justify-center gap-2 transition-all"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Minus className="w-4 h-4" />}
                  Reduce
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}