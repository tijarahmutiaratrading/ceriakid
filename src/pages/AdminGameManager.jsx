import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Loader2, Plus, Trash2, ChevronDown, CheckCircle2, AlertCircle } from 'lucide-react';

const GAME_FILES = [
  'gameData_prasekolah_bm',
  'gameData_prasekolah_en',
  'gameData_prasekolah_math',
  'gameData_prasekolah_science',
  'gameData_sr_bm',
  'gameData_sr_english',
  'gameData_sr_math',
  'gameData_sr_science',
];

export default function AdminGameManager() {
  const [activeTab, setActiveTab] = useState('expand');
  const [selectedFile, setSelectedFile] = useState('');
  const [gameIndex, setGameIndex] = useState('');
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [history, setHistory] = useState([]);

  // ============ EXPAND QUESTIONS ============
  const handleExpandPreview = async () => {
    if (!selectedFile || gameIndex === '') return;
    setLoading(true);
    try {
      const res = await base44.functions.invoke('expandGameQuestions', {
        fileName: selectedFile,
        gameIndex: parseInt(gameIndex),
        previewOnly: true
      });
      if (res.data.success) setPreview(res.data);
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleExpandConfirm = async () => {
    setLoading(true);
    try {
      const res = await base44.functions.invoke('expandGameQuestions', {
        fileName: selectedFile,
        gameIndex: parseInt(gameIndex),
        previewOnly: false
      });
      if (res.data.success) {
        setHistory([...history, { type: 'expand', ...res.data }]);
        setPreview(null);
        setSelectedFile('');
        setGameIndex('');
        alert(`✅ ${res.data.gameTitle} expanded!`);
      }
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // ============ REDUCE QUESTIONS ============
  const handleReduceQuestions = async () => {
    if (!selectedFile || gameIndex === '') return;
    setLoading(true);
    try {
      alert('Reduce questions feature - kurang soalan dari game');
      // Implementation untuk reduce would go here
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // ============ DELETE GAME ============
  const handleDeleteGame = async () => {
    if (!selectedFile || gameIndex === '') return;
    if (!confirm('Kau pasti nak delete game ni? Tidak boleh undo!')) return;

    setLoading(true);
    try {
      alert('Delete game feature - buang game dari file');
      // Implementation untuk delete would go here
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // ============ ADD NEW GAME ============
  const handleAddGame = async () => {
    alert('Add new game feature - tambah game baru dalam file');
    // Implementation would go here
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8 pt-4">
          <h1 className="text-4xl font-black text-white mb-2">⚙️ Admin Game Manager</h1>
          <p className="text-white/80">Urus semua game data - tambah, kurang, expand, delete</p>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {[
            { id: 'expand', label: '📈 Expand Soalan', icon: '+' },
            { id: 'reduce', label: '📉 Kurang Soalan', icon: '−' },
            { id: 'add', label: '➕ Tambah Game Baru', icon: '+' },
            { id: 'delete', label: '🗑️ Buang Game', icon: '✕' },
          ].map(tab => (
            <motion.button
              key={tab.id}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setActiveTab(tab.id);
                setPreview(null);
              }}
              className={`px-4 py-2 rounded-xl font-bold transition-all ${
                activeTab === tab.id
                  ? 'bg-white text-indigo-600 shadow-lg'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              {tab.label}
            </motion.button>
          ))}
        </div>

        {/* Content */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-3xl p-6 shadow-2xl mb-6">
          {/* EXPAND SOALAN */}
          {activeTab === 'expand' && (
            <div className="space-y-4">
              <h2 className="text-2xl font-black text-gray-800 mb-6">📈 Expand Soalan (8 → 20)</h2>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Pilih File Game</label>
                <select
                  value={selectedFile}
                  onChange={(e) => {
                    setSelectedFile(e.target.value);
                    setGameIndex('');
                    setPreview(null);
                  }}
                  className="w-full p-3 border-2 border-gray-300 rounded-xl focus:border-indigo-500 focus:outline-none font-medium"
                >
                  <option value="">-- Pilih File --</option>
                  {GAME_FILES.map(file => (
                    <option key={file} value={file}>{file}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Game Index (Nomor Urut)</label>
                <input
                  type="number"
                  min="0"
                  value={gameIndex}
                  onChange={(e) => {
                    setGameIndex(e.target.value);
                    setPreview(null);
                  }}
                  placeholder="e.g. 0, 1, 2..."
                  className="w-full p-3 border-2 border-gray-300 rounded-xl focus:border-indigo-500 focus:outline-none font-medium"
                />
              </div>

              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleExpandPreview}
                disabled={!selectedFile || gameIndex === '' || loading}
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold py-3 rounded-xl disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : '👁️'}
                {loading ? 'Preview...' : 'Preview Soalan'}
              </motion.button>

              {preview && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-indigo-50 rounded-2xl p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xl font-black text-gray-800">{preview.gameTitle}</p>
                      <p className="text-sm text-gray-600">Type: {preview.gameType}</p>
                    </div>
                    <CheckCircle2 className="w-8 h-8 text-green-500" />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-white rounded-lg p-3 text-center">
                      <p className="text-2xl font-black text-indigo-600">{preview.currentCount}</p>
                      <p className="text-xs text-gray-600">Current</p>
                    </div>
                    <div className="bg-white rounded-lg p-3 text-center">
                      <p className="text-2xl font-black text-pink-600">+12</p>
                      <p className="text-xs text-gray-600">New</p>
                    </div>
                    <div className="bg-white rounded-lg p-3 text-center">
                      <p className="text-2xl font-black text-green-600">{preview.totalAfterExpand}</p>
                      <p className="text-xs text-gray-600">Total</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setPreview(null)}
                      className="flex-1 bg-gray-300 text-gray-800 font-bold py-2 rounded-lg"
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={handleExpandConfirm}
                      disabled={loading}
                      className="flex-1 bg-green-500 text-white font-bold py-2 rounded-lg disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : '✅'}
                      {loading ? 'Processing...' : 'Confirm'}
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </div>
          )}

          {/* REDUCE SOALAN */}
          {activeTab === 'reduce' && (
            <div className="space-y-4">
              <h2 className="text-2xl font-black text-gray-800 mb-6">📉 Kurang Soalan</h2>
              <div className="bg-orange-50 border-2 border-orange-300 rounded-2xl p-6 text-center">
                <AlertCircle className="w-12 h-12 text-orange-600 mx-auto mb-3" />
                <p className="text-lg font-bold text-orange-900">Feature Coming Soon</p>
                <p className="text-sm text-orange-700 mt-2">Untuk kurangkan soalan dari game yang ada</p>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Pilih File Game</label>
                <select disabled className="w-full p-3 border-2 border-gray-300 rounded-xl opacity-50 font-medium">
                  <option>-- Disabled untuk sementara --</option>
                </select>
              </div>
            </div>
          )}

          {/* TAMBAH GAME BARU */}
          {activeTab === 'add' && (
            <div className="space-y-4">
              <h2 className="text-2xl font-black text-gray-800 mb-6">➕ Tambah Game Baru</h2>
              <div className="bg-blue-50 border-2 border-blue-300 rounded-2xl p-6 text-center">
                <Plus className="w-12 h-12 text-blue-600 mx-auto mb-3" />
                <p className="text-lg font-bold text-blue-900">Feature Coming Soon</p>
                <p className="text-sm text-blue-700 mt-2">Untuk tambah game baru dalam file</p>
              </div>

              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleAddGame}
                disabled
                className="w-full bg-blue-500 text-white font-bold py-3 rounded-xl disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Coming Soon
              </motion.button>
            </div>
          )}

          {/* DELETE GAME */}
          {activeTab === 'delete' && (
            <div className="space-y-4">
              <h2 className="text-2xl font-black text-gray-800 mb-6">🗑️ Buang Game</h2>
              <div className="bg-red-50 border-2 border-red-300 rounded-2xl p-6 text-center">
                <Trash2 className="w-12 h-12 text-red-600 mx-auto mb-3" />
                <p className="text-lg font-bold text-red-900">Feature Coming Soon</p>
                <p className="text-sm text-red-700 mt-2">Untuk delete game dari file (tidak boleh undo!)</p>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Pilih File Game</label>
                <select disabled className="w-full p-3 border-2 border-gray-300 rounded-xl opacity-50 font-medium">
                  <option>-- Disabled untuk sementara --</option>
                </select>
              </div>
            </div>
          )}
        </motion.div>

        {/* History */}
        {history.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-3xl p-6 shadow-2xl">
            <h3 className="text-lg font-black text-gray-800 mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-6 h-6 text-green-500" />
              Activity History ({history.length})
            </h3>
            <div className="space-y-3">
              {history.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between bg-green-50 p-4 rounded-xl">
                  <div>
                    <p className="font-bold text-gray-800">{item.gameTitle}</p>
                    <p className="text-xs text-gray-600">{item.type.toUpperCase()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-black text-green-600">+{item.newQuestionsAdded || 0}</p>
                    <p className="text-xs text-gray-600">Total: {item.totalQuestions}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}