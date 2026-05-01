import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Loader2, Edit2, Trash2, Copy, Eye, Lock, Unlock, ArrowUp, ArrowDown } from 'lucide-react';

const GAME_FILES = [
  'gameData_prasekolah_bm', 'gameData_prasekolah_en', 'gameData_prasekolah_math', 'gameData_prasekolah_science',
  'gameData_sr_bm', 'gameData_sr_english', 'gameData_sr_math', 'gameData_sr_science',
];

export default function GamesListView() {
  const [selectedFile, setSelectedFile] = useState('gameData_prasekolah_bm');
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState('index');

  useEffect(() => {
    loadGames();
  }, [selectedFile]);

  const loadGames = async () => {
    setLoading(true);
    try {
      const res = await base44.functions.invoke('gameAdminList', { fileName: selectedFile });
      setGames(res.data.games || []);
    } catch (err) {
      alert('Error loading games: ' + err.message);
      setGames([]);
    } finally {
      setLoading(false);
    }
  };

  const sortedGames = [...games].sort((a, b) => {
    if (sortBy === 'title') return a.title.localeCompare(b.title);
    if (sortBy === 'difficulty') {
      const order = { easy: 0, medium: 1, hard: 2 };
      return (order[a.difficulty] || 0) - (order[b.difficulty] || 0);
    }
    if (sortBy === 'questions') return b.totalQuestions - a.totalQuestions;
    return a.index - b.index;
  });

  return (
    <div className="space-y-4">
      <div className="flex gap-3 items-center flex-wrap">
        <div className="flex-1 min-w-48">
          <label className="block text-xs font-black text-gray-700 mb-1 uppercase">File</label>
          <select
            value={selectedFile}
            onChange={(e) => setSelectedFile(e.target.value)}
            className="w-full p-2.5 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none text-sm font-medium"
          >
            {GAME_FILES.map(file => (
              <option key={file} value={file}>{file}</option>
            ))}
          </select>
        </div>

        <div className="flex-1 min-w-48">
          <label className="block text-xs font-black text-gray-700 mb-1 uppercase">Sort By</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full p-2.5 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none text-sm font-medium"
          >
            <option value="index">Index (Default)</option>
            <option value="title">Title (A-Z)</option>
            <option value="difficulty">Difficulty</option>
            <option value="questions">Question Count</option>
          </select>
        </div>

        <div className="pt-6">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={loadGames}
            disabled={loading}
            className="px-4 py-2.5 bg-indigo-500 text-white rounded-lg font-bold text-sm disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin inline" /> : '🔄'} Refresh
          </motion.button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-indigo-500" />
        </div>
      ) : games.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600 font-bold">No games found</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {sortedGames.map((game, idx) => (
            <motion.div
              key={`${game.index}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-white border border-gray-200 rounded-lg p-3 flex items-center justify-between hover:shadow-md transition-all"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{game.emoji}</span>
                  <div>
                    <p className="font-black text-gray-800 text-sm">{game.title}</p>
                    <p className="text-xs text-gray-500">Index: {game.index} • {game.type} • {game.totalQuestions}Qs</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 ml-2">
                <span className={`text-xs font-bold px-2 py-1 rounded ${
                  game.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                  game.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {game.difficulty}
                </span>

                <span className={`text-xs font-bold px-2 py-1 rounded ${
                  game.isPublished ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                }`}>
                  {game.isPublished ? '📤 Published' : '📋 Draft'}
                </span>

                <div className="flex gap-1">
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    className="p-1.5 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition-all"
                    title="Edit"
                  >
                    <Edit2 className="w-4 h-4" />
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    className="p-1.5 bg-purple-100 text-purple-600 rounded hover:bg-purple-200 transition-all"
                    title="Clone"
                  >
                    <Copy className="w-4 h-4" />
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    className="p-1.5 bg-red-100 text-red-600 rounded hover:bg-red-200 transition-all"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <p className="text-xs text-gray-600 font-semibold">Total: {games.length} games</p>
    </div>
  );
}