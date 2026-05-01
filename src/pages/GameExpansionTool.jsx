import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

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

export default function GameExpansionTool() {
  const [selectedFile, setSelectedFile] = useState('');
  const [gameIndex, setGameIndex] = useState('');
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [expandedGames, setExpandedGames] = useState([]);

  const handlePreview = async () => {
    if (!selectedFile || gameIndex === '') return;

    setLoading(true);
    try {
      const res = await base44.functions.invoke('expandGameQuestions', {
        fileName: selectedFile,
        gameIndex: parseInt(gameIndex),
        previewOnly: true
      });

      if (res.data.success) {
        setPreview(res.data);
      }
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleExpand = async () => {
    if (!selectedFile || gameIndex === '' || !preview) return;

    setLoading(true);
    try {
      const res = await base44.functions.invoke('expandGameQuestions', {
        fileName: selectedFile,
        gameIndex: parseInt(gameIndex),
        previewOnly: false
      });

      if (res.data.success) {
        setExpandedGames([...expandedGames, res.data]);
        setPreview(null);
        setSelectedFile('');
        setGameIndex('');
        alert(`✅ ${res.data.gameTitle} updated dengan ${res.data.newQuestionsAdded} soalan baru!`);
      }
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8 pt-4"
        >
          <h1 className="text-4xl font-black text-white mb-2">🎮 Game Expansion Tool</h1>
          <p className="text-white/80">Auto-expand soalan dari 8 → 20 menggunakan AI</p>
        </motion.div>

        {/* Input Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-6 mb-6 shadow-2xl space-y-4"
        >
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Pilih File Game</label>
            <select
              value={selectedFile}
              onChange={(e) => {
                setSelectedFile(e.target.value);
                setGameIndex('');
                setPreview(null);
              }}
              className="w-full p-3 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:outline-none font-medium"
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
              className="w-full p-3 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:outline-none font-medium"
            />
          </div>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handlePreview}
            disabled={!selectedFile || gameIndex === '' || loading}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Preview...
              </>
            ) : (
              '👁️ Preview Soalan Baru'
            )}
          </motion.button>
        </motion.div>

        {/* Preview Section */}
        {preview && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl p-6 mb-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-black text-gray-800">{preview.gameTitle}</h2>
                <p className="text-sm text-gray-600 mt-1">Type: {preview.gameType}</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="bg-purple-50 rounded-xl p-4 text-center">
                <p className="text-3xl font-black text-purple-600">{preview.currentCount}</p>
                <p className="text-xs text-gray-600 mt-1">Soalan Sedia Ada</p>
              </div>
              <div className="bg-pink-50 rounded-xl p-4 text-center">
                <p className="text-3xl font-black text-pink-600">+12</p>
                <p className="text-xs text-gray-600 mt-1">Soalan Baru</p>
              </div>
              <div className="bg-orange-50 rounded-xl p-4 text-center">
                <p className="text-3xl font-black text-orange-600">{preview.totalAfterExpand}</p>
                <p className="text-xs text-gray-600 mt-1">Total Nanti</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 max-h-48 overflow-y-auto">
              <p className="text-xs font-bold text-gray-700 mb-3">📋 Preview 3 soalan pertama:</p>
              <pre className="text-xs text-gray-600 whitespace-pre-wrap font-mono">
                {JSON.stringify(preview.preview, null, 2)}
              </pre>
            </div>

            <div className="flex gap-3">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setPreview(null)}
                className="flex-1 bg-gray-300 text-gray-800 font-bold py-3 rounded-xl"
              >
                ❌ Batal
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleExpand}
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold py-3 rounded-xl disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  '✅ Confirm & Expand'
                )}
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* Success Log */}
        {expandedGames.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl p-6 shadow-2xl"
          >
            <h3 className="text-lg font-black text-gray-800 mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-6 h-6 text-green-500" />
              Games Yang Sudah Diupdate ({expandedGames.length})
            </h3>
            <div className="space-y-3">
              {expandedGames.map((game, idx) => (
                <div key={idx} className="flex items-center justify-between bg-green-50 p-4 rounded-xl">
                  <div>
                    <p className="font-bold text-gray-800">{game.gameTitle}</p>
                    <p className="text-xs text-gray-600">File: {game.fileName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-black text-green-600">+{game.newQuestionsAdded}</p>
                    <p className="text-xs text-gray-600">soalan baru</p>
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