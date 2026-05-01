import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Loader2, Plus, Minus } from 'lucide-react';
import AppHeader from '@/components/AppHeader';

const GAME_FILES = [
  'gameData_prasekolah_bm', 'gameData_prasekolah_en', 'gameData_prasekolah_math', 'gameData_prasekolah_science',
  'gameData_sr_bm', 'gameData_sr_english', 'gameData_sr_math', 'gameData_sr_science',
];

export default function AdminGameManager() {
  const [activeTab, setActiveTab] = useState('expand-questions');
  const [selectedFile, setSelectedFile] = useState('');
  const [gameIndex, setGameIndex] = useState('');
  const [targetCount, setTargetCount] = useState('');
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [message, setMessage] = useState('');

  const handleExpandQuestions = async () => {
    if (!selectedFile || gameIndex === '' || !targetCount) {
      setMessage('❌ Sila isi semua field');
      return;
    }

    setLoading(true);
    try {
      const res = await base44.functions.invoke('expandGameQuestions', {
        fileName: selectedFile,
        gameIndex: parseInt(gameIndex),
        targetCount: parseInt(targetCount),
      });
      setMessage(`✅ Berhasil! Game "${res.data.gameTitle}" sekarang ada ${res.data.totalQuestions} soalan`);
      setPreview(res.data);
      setGameIndex('');
      setTargetCount('');
    } catch (err) {
      setMessage(`❌ Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleReduceQuestions = async () => {
    if (!selectedFile || gameIndex === '' || !targetCount) {
      setMessage('❌ Sila isi semua field');
      return;
    }

    setLoading(true);
    try {
      const res = await base44.functions.invoke('reduceGameQuestions', {
        fileName: selectedFile,
        gameIndex: parseInt(gameIndex),
        targetCount: parseInt(targetCount),
      });
      setMessage(`✅ Berhasil! Game dikurang kepada ${res.data.totalQuestions} soalan`);
      setPreview(res.data);
      setGameIndex('');
      setTargetCount('');
    } catch (err) {
      setMessage(`❌ Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleExpandGames = async () => {
    if (!selectedFile) {
      setMessage('❌ Sila pilih file');
      return;
    }

    setLoading(true);
    try {
      const res = await base44.functions.invoke('expandGames', {
        fileName: selectedFile,
      });
      setMessage(`✅ Berhasil! File sekarang ada ${res.data.totalGames} games`);
      setPreview(res.data);
    } catch (err) {
      setMessage(`❌ Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleReduceGames = async () => {
    if (!selectedFile) {
      setMessage('❌ Sila pilih file');
      return;
    }

    setLoading(true);
    try {
      const res = await base44.functions.invoke('reduceGames', {
        fileName: selectedFile,
      });
      setMessage(`✅ Berhasil! File sekarang ada ${res.data.totalGames} games`);
      setPreview(res.data);
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
          <p className="text-gray-600">Expand atau reduce soalan & games</p>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-3 mb-8 flex-wrap">
          {[
            { id: 'expand-questions', label: '📈 Expand Soalan', icon: '➕' },
            { id: 'reduce-questions', label: '📉 Reduce Soalan', icon: '➖' },
            { id: 'expand-games', label: '📚 Expand Games', icon: '➕' },
            { id: 'reduce-games', label: '🗑️ Reduce Games', icon: '➖' },
          ].map(tab => (
            <motion.button
              key={tab.id}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setActiveTab(tab.id);
                setMessage('');
                setPreview(null);
              }}
              className={`px-4 py-2.5 rounded-xl font-bold transition-all ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : 'bg-white text-gray-800 border-2 border-gray-200 hover:border-indigo-300'
              }`}
            >
              {tab.icon} {tab.label}
            </motion.button>
          ))}
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

        {/* EXPAND SOALAN */}
        {activeTab === 'expand-questions' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-2xl p-6 space-y-4">
            <h2 className="text-2xl font-black text-gray-900">📈 Expand Soalan</h2>
            
            <div>
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

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Game Index <span className="text-xs text-gray-500">(Nomor urutan: 0, 1, 2...)</span>
              </label>
              <input
                type="number"
                min="0"
                value={gameIndex}
                onChange={(e) => setGameIndex(e.target.value)}
                placeholder="e.g. 0"
                className="w-full p-3 border-2 border-gray-300 rounded-xl focus:border-indigo-500 focus:outline-none"
              />
              <p className="text-xs text-gray-500 mt-1">💡 0 = game pertama, 1 = game kedua, dst</p>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Target Jumlah Soalan</label>
              <input
                type="number"
                min="8"
                max="100"
                value={targetCount}
                onChange={(e) => setTargetCount(e.target.value)}
                placeholder="e.g. 20"
                className="w-full p-3 border-2 border-gray-300 rounded-xl focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleExpandQuestions}
              disabled={loading}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-xl disabled:opacity-50 flex items-center justify-center gap-2 transition-all"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
              {loading ? 'Processing...' : 'Expand Soalan'}
            </motion.button>
          </motion.div>
        )}

        {/* REDUCE SOALAN */}
        {activeTab === 'reduce-questions' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-2xl p-6 space-y-4">
            <h2 className="text-2xl font-black text-gray-900">📉 Reduce Soalan</h2>
            
            <div>
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

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Game Index <span className="text-xs text-gray-500">(Nomor urutan: 0, 1, 2...)</span>
              </label>
              <input
                type="number"
                min="0"
                value={gameIndex}
                onChange={(e) => setGameIndex(e.target.value)}
                placeholder="e.g. 0"
                className="w-full p-3 border-2 border-gray-300 rounded-xl focus:border-indigo-500 focus:outline-none"
              />
              <p className="text-xs text-gray-500 mt-1">💡 0 = game pertama, 1 = game kedua, dst</p>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Target Jumlah Soalan</label>
              <input
                type="number"
                min="4"
                value={targetCount}
                onChange={(e) => setTargetCount(e.target.value)}
                placeholder="e.g. 8"
                className="w-full p-3 border-2 border-gray-300 rounded-xl focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleReduceQuestions}
              disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl disabled:opacity-50 flex items-center justify-center gap-2 transition-all"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Minus className="w-5 h-5" />}
              {loading ? 'Processing...' : 'Reduce Soalan'}
            </motion.button>
          </motion.div>
        )}

        {/* EXPAND GAMES */}
        {activeTab === 'expand-games' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-2xl p-6 space-y-4">
            <h2 className="text-2xl font-black text-gray-900">📚 Expand Games (Add More)</h2>
            
            <div>
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

            <p className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
              ℹ️ Ini akan duplicate game terakhir dalam file 5 kali
            </p>

            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleExpandGames}
              disabled={loading || !selectedFile}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 rounded-xl disabled:opacity-50 flex items-center justify-center gap-2 transition-all"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
              {loading ? 'Adding Games...' : 'Add 5 More Games'}
            </motion.button>
          </motion.div>
        )}

        {/* REDUCE GAMES */}
        {activeTab === 'reduce-games' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-2xl p-6 space-y-4">
            <h2 className="text-2xl font-black text-gray-900">🗑️ Reduce Games (Delete)</h2>
            
            <div>
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

            <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg font-bold">
              ⚠️ Ini akan DELETE 5 games terakhir dari file! TIDAK boleh undo!
            </p>

            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleReduceGames}
              disabled={loading || !selectedFile}
              className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-xl disabled:opacity-50 flex items-center justify-center gap-2 transition-all"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Minus className="w-5 h-5" />}
              {loading ? 'Deleting Games...' : 'Delete 5 Games'}
            </motion.button>
          </motion.div>
        )}

        {/* Preview */}
        {preview && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-6 bg-indigo-50 rounded-2xl p-4 border-l-4 border-indigo-500">
            <p className="font-black text-indigo-900">{preview.gameTitle || preview.fileName}</p>
            <p className="text-sm text-indigo-700 mt-1">Total: {preview.totalQuestions || preview.totalGames} {preview.gameTitle ? 'soalan' : 'games'}</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}