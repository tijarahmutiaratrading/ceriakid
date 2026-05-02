import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Edit3 } from 'lucide-react';

const DIFFICULTIES = ['easy', 'medium', 'hard'];
const TIERS = ['free', 'premium', 'pro'];

export default function SingleGameEditModal({ game, onSave, onClose }) {
  const [title, setTitle] = useState(game.title || '');
  const [totalQuestions, setTotalQuestions] = useState(String(game.totalQuestions || ''));
  const [difficulty, setDifficulty] = useState(game.difficulty || 'easy');
  const [tier, setTier] = useState(game.tier || 'free');
  const [isPublished, setIsPublished] = useState(game.isPublished !== false);

  const handleSave = () => {
    const updates = {
      title: title.trim() || game.title,
      totalQuestions: parseInt(totalQuestions) || game.totalQuestions,
      difficulty,
      tier,
      isPublished,
    };
    onSave(game.id, updates);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={e => e.stopPropagation()}
        className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl"
      >
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <Edit3 className="w-5 h-5 text-indigo-500" />
            <h3 className="font-black text-gray-900">Edit Game</h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <p className="text-xs text-gray-400 mb-5">{game.category} · {game.ageGroup}</p>

        <div className="space-y-4 mb-5">
          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1.5">📌 Tajuk Game</label>
            <input
              type="text"
              autoFocus
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none text-sm font-semibold"
            />
          </div>

          {/* Total Questions */}
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1.5">📝 Bilangan Soalan</label>
            <input
              type="number"
              min="1"
              value={totalQuestions}
              onChange={e => setTotalQuestions(e.target.value)}
              className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none text-center font-bold"
            />
          </div>

          {/* Difficulty */}
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1.5">⚡ Difficulty</label>
            <div className="flex gap-2">
              {DIFFICULTIES.map(d => (
                <button
                  key={d}
                  onClick={() => setDifficulty(d)}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold border-2 capitalize transition-all ${difficulty === d ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-gray-200 text-gray-500'}`}
                >{d}</button>
              ))}
            </div>
          </div>

          {/* Tier */}
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1.5">💎 Tier</label>
            <div className="flex gap-2">
              {TIERS.map(t => (
                <button
                  key={t}
                  onClick={() => setTier(t)}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold border-2 capitalize transition-all ${tier === t ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-gray-200 text-gray-500'}`}
                >{t}</button>
              ))}
            </div>
          </div>

          {/* Published toggle */}
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-gray-600">🟢 Published</span>
            <button
              onClick={() => setIsPublished(!isPublished)}
              className={`w-12 h-6 rounded-full transition-all relative ${isPublished ? 'bg-green-500' : 'bg-gray-300'}`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${isPublished ? 'left-7' : 'left-1'}`} />
            </button>
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border-2 border-gray-200 text-gray-600 font-bold text-sm">Batal</button>
          <button onClick={handleSave} className="flex-1 py-2.5 rounded-xl bg-indigo-500 text-white font-bold text-sm">
            Simpan
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}