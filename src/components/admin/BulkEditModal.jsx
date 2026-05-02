import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Layers } from 'lucide-react';

const DIFFICULTIES = ['easy', 'medium', 'hard'];
const TIERS = ['free', 'premium', 'pro'];

export default function BulkEditModal({ data, onSave, onClose }) {
  const { label, ageGroup, subject, games } = data;
  const [totalQuestions, setTotalQuestions] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [tier, setTier] = useState('');

  const canSave = totalQuestions || difficulty || tier;

  const handleSave = () => {
    onSave({ ageGroup, subject, totalQuestions, difficulty, tier });
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
            <Layers className="w-5 h-5 text-indigo-500" />
            <h3 className="font-black text-gray-900">Bulk Edit</h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <p className="text-sm text-gray-500 mb-1">{label}</p>
        <p className="text-xs text-indigo-600 font-bold mb-5 bg-indigo-50 px-3 py-1.5 rounded-xl">
          Akan kemas kini {games.length} games sekaligus
        </p>

        <div className="space-y-4 mb-5">
          {/* Total Questions */}
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1.5">📝 Set Bilangan Soalan (per game)</label>
            <input
              type="number"
              min="1"
              autoFocus
              value={totalQuestions}
              onChange={e => setTotalQuestions(e.target.value)}
              placeholder="Kosong = tidak ubah"
              className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none text-center font-bold"
            />
          </div>

          {/* Difficulty */}
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1.5">⚡ Set Difficulty</label>
            <div className="flex gap-2">
              <button
                onClick={() => setDifficulty('')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold border-2 transition-all ${!difficulty ? 'border-gray-400 bg-gray-100 text-gray-700' : 'border-gray-200 text-gray-400'}`}
              >Tidak Ubah</button>
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
            <label className="block text-xs font-bold text-gray-600 mb-1.5">💎 Set Tier</label>
            <div className="flex gap-2">
              <button
                onClick={() => setTier('')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold border-2 transition-all ${!tier ? 'border-gray-400 bg-gray-100 text-gray-700' : 'border-gray-200 text-gray-400'}`}
              >Tidak Ubah</button>
              {TIERS.map(t => (
                <button
                  key={t}
                  onClick={() => setTier(t)}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold border-2 capitalize transition-all ${tier === t ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-gray-200 text-gray-500'}`}
                >{t}</button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border-2 border-gray-200 text-gray-600 font-bold text-sm">Batal</button>
          <button
            onClick={handleSave}
            disabled={!canSave}
            className="flex-1 py-2.5 rounded-xl bg-indigo-500 text-white font-bold text-sm disabled:opacity-40"
          >
            Apply ke {games.length} Games
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}