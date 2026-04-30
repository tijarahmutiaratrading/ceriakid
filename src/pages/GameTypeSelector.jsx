import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useParams } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import AppHeader from '@/components/AppHeader';
import { playSound } from '@/lib/soundManager';

const gameTypeInfo = {
  memory_game: { emoji: '🧠', name: 'Permainan Ingatan', color: 'from-purple-400 to-pink-400' },
  drag_drop: { emoji: '🎯', name: 'Padankan Huruf', color: 'from-blue-400 to-cyan-400' },
  word_builder: { emoji: '📝', name: 'Bentuk Perkataan', color: 'from-green-400 to-emerald-400' },
  shape_sort: { emoji: '🗂️', name: 'Isih Kategori', color: 'from-orange-400 to-yellow-400' },
  pattern_fill: { emoji: '🎨', name: 'Padankan 3 Sama', color: 'from-pink-400 to-purple-400' },
  reading: { emoji: '📖', name: 'Petualangan Harta Karun', color: 'from-amber-400 to-orange-400' },
  math_puzzle: { emoji: '🎯', name: 'Lontarkan Bola', color: 'from-sky-400 to-blue-400' },
  writing: { emoji: '✏️', name: 'Seni Menulis', color: 'from-violet-400 to-purple-400' },
};

export default function GameTypeSelector() {
  const { type } = useParams();
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);

  const gameInfo = gameTypeInfo[type] || { emoji: '🎮', name: 'Game', color: 'from-purple-400 to-pink-400' };

  useEffect(() => {
    loadGames();
  }, [type]);

  const loadGames = async () => {
    try {
      const data = await base44.entities.Game.filter({ type }, 'order', 100);
      setGames(data || []);
    } catch (error) {
      console.error('Failed to load games:', error);
      setGames([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-amber-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl animate-bounce mb-4">{gameInfo.emoji}</div>
          <div className="w-8 h-8 border-4 border-game-purple border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-amber-50">
      <AppHeader showBack={true} backTo="/games-hub" />
      
      <div className="max-w-4xl mx-auto px-4 py-8 pb-24 pt-20">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="flex items-center gap-3 mb-2">
            <span className="text-4xl">{gameInfo.emoji}</span>
            <h1 className="text-3xl font-black text-gray-800">{gameInfo.name}</h1>
          </div>
          <p className="text-gray-600 text-lg">Pilih satu daripada {games.length} games</p>
        </motion.div>

        {/* Games Grid */}
        {games.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-3xl p-8 text-center shadow-lg"
          >
            <p className="text-lg font-bold text-gray-600">Tiada games tersedia</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {games.map((game, idx) => (
              <motion.div
                key={game.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                whileHover={{ y: -4 }}
              >
                <Link to={`/play-game/${game.id}`} onClick={() => playSound('click')} className="block h-full">
                  <div className={`bg-gradient-to-br ${gameInfo.color} rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all h-full text-white flex flex-col`}>
                    <h3 className="text-lg font-black mb-2">{game.title}</h3>
                    <p className="text-sm font-semibold opacity-90 flex-1">{game.description}</p>
                    <div className="flex justify-between items-center mt-4 pt-4 border-t border-white/30">
                      <span className="text-xs font-black opacity-80">
                        {game.totalQuestions} soalan
                      </span>
                      <span className="text-xl">→</span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}