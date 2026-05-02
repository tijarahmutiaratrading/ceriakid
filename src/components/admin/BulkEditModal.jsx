import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Loader2, CheckSquare, Square } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const DIFFICULTIES = ['easy', 'medium', 'hard'];
const TIERS = ['free', 'premium', 'pro'];

export default function BulkEditModal({ games, subjectLabel, onClose, onSaved }) {
  const [selected, setSelected] = useState(new Set(games.map(g => g.id)));
  const [updates, setUpdates] = useState({ difficulty: '', tier: '', isPublished: '' });
  const [targetQuestions, setTargetQuestions] = useState('');
  const [aiExpand, setAiExpand] = useState(false);
  const [saving, setSaving] = useState(false);
  const [progress, setProgress] = useState(null);
  const [error, setError] = useState(null);

  const toggleGame = (id) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === games.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(games.map(g => g.id)));
    }
  };

  const handleSave = async () => {
    if (selected.size === 0) return;
    setSaving(true);
    setError(null);

    const gameIds = Array.from(selected);
    const cleanUpdates = {};
    if (updates.difficulty) cleanUpdates.difficulty = updates.difficulty;
    if (updates.tier) cleanUpdates.tier = updates.tier;
    if (updates.isPublished !== '') cleanUpdates.isPublished = updates.isPublished === 'true';

    try {
      // Step 1: Bulk update metadata
      if (Object.keys(cleanUpdates).length > 0 || targetQuestions) {
        setProgress(`Mengemas kini ${gameIds.length} games...`);
        await base44.functions.invoke('bulkUpdateGamesInDB', {
          gameIds,
          updates: cleanUpdates,
          targetCount: targetQuestions ? parseInt(targetQuestions) : undefined,
        });
      }

      // Step 2: AI expand questions if requested
      if (aiExpand && targetQuestions) {
        const count = parseInt(targetQuestions);
        const selectedGames = games.filter(g => selected.has(g.id));
        for (let i = 0; i < selectedGames.length; i++) {
          const g = selectedGames[i];
          setProgress(`AI menjana soalan... ${i + 1}/${selectedGames.length}`);
          await base44.functions.invoke('syncSubjectGameQuestions', {
            targetCount: count,
            ageGroup: g.ageGroup,
            category: g.category,
            gameId: g.id,
          });
          if (i < selectedGames.length - 1) {
            await new Promise(r => setTimeout(r, 3000));
          }
        }
      }

      onSaved();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
      setProgress(null);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.92, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.92, y: 20 }}
        onClick={e => e.stopPropagation()}
        className="bg-white rounded-3xl w-full max-w-lg max-h-[90vh] flex flex-col shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="font-black text-gray-900 text-lg">⚡ Bulk Edit</h2>
            <p className="text-xs text-gray-400">{subjectLabel} · {selected.size}/{games.length} dipilih</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">
          {/* Update Fields */}
          <div>
            <h3 className="font-black text-gray-700 text-sm mb-3">🔧 Ubah Metadata</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-gray-400 mb-1 block">Difficulty (kosong = tak ubah)</label>
                <select value={updates.difficulty} onChange={e => setUpdates(u => ({ ...u, difficulty: e.target.value }))} className="w-full border-2 border-gray-200 rounded-xl p-2.5 text-sm focus:border-indigo-400 focus:outline-none">
                  <option value="">— tak ubah —</option>
                  {DIFFICULTIES.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 mb-1 block">Tier</label>
                <select value={updates.tier} onChange={e => setUpdates(u => ({ ...u, tier: e.target.value }))} className="w-full border-2 border-gray-200 rounded-xl p-2.5 text-sm focus:border-indigo-400 focus:outline-none">
                  <option value="">— tak ubah —</option>
                  {TIERS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 mb-1 block">Published Status</label>
                <select value={updates.isPublished} onChange={e => setUpdates(u => ({ ...u, isPublished: e.target.value }))} className="w-full border-2 border-gray-200 rounded-xl p-2.5 text-sm focus:border-indigo-400 focus:outline-none">
                  <option value="">— tak ubah —</option>
                  <option value="true">✅ Published</option>
                  <option value="false">⚫ Hidden</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 mb-1 block">Target Soalan</label>
                <input
                  type="number"
                  min="1"
                  value={targetQuestions}
                  onChange={e => setTargetQuestions(e.target.value)}
                  placeholder="e.g. 20"
                  className="w-full border-2 border-gray-200 rounded-xl p-2.5 text-sm font-black text-center focus:border-indigo-400 focus:outline-none"
                />
              </div>
            </div>

            {/* AI Expand option */}
            {targetQuestions && (
              <div className="mt-3 p-3 bg-indigo-50 rounded-2xl border border-indigo-100">
                <label className="flex items-center gap-3 cursor-pointer">
                  <button onClick={() => setAiExpand(!aiExpand)} className="flex-shrink-0">
                    {aiExpand ? <CheckSquare className="w-5 h-5 text-indigo-600" /> : <Square className="w-5 h-5 text-gray-400" />}
                  </button>
                  <div>
                    <p className="text-sm font-bold text-indigo-800">Guna AI jana soalan baru</p>
                    <p className="text-xs text-indigo-500">AI akan jana soalan sehingga {targetQuestions} soalan (3s delay antara games)</p>
                  </div>
                </label>
              </div>
            )}
          </div>

          {/* Game Selection */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-black text-gray-700 text-sm">🎮 Pilih Games</h3>
              <button onClick={toggleAll} className="text-xs font-bold text-indigo-500 hover:text-indigo-700">
                {selected.size === games.length ? 'Nyahpilih Semua' : 'Pilih Semua'}
              </button>
            </div>
            <div className="max-h-52 overflow-y-auto space-y-1.5 border-2 border-gray-100 rounded-2xl p-3">
              {games.map(g => (
                <label key={g.id} className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 rounded-xl px-2 py-1.5 transition-all">
                  <button onClick={() => toggleGame(g.id)} className="flex-shrink-0">
                    {selected.has(g.id)
                      ? <CheckSquare className="w-4 h-4 text-indigo-600" />
                      : <Square className="w-4 h-4 text-gray-300" />}
                  </button>
                  <span className="text-sm font-semibold text-gray-700 flex-1 truncate">{g.title}</span>
                  <span className={`text-xs font-black px-2 py-0.5 rounded-full flex-shrink-0 ${
                    (g.totalQuestions || 0) >= 20 ? 'bg-green-100 text-green-700' :
                    (g.totalQuestions || 0) >= 10 ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-600'
                  }`}>{g.totalQuestions || 0}Q</span>
                </label>
              ))}
            </div>
          </div>

          {progress && (
            <div className="text-center text-sm font-bold text-indigo-600 bg-indigo-50 rounded-xl py-2">{progress}</div>
          )}
          {error && <p className="text-xs text-red-500 font-semibold text-center">{error}</p>}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 border-2 border-gray-200 rounded-xl font-bold text-gray-600 text-sm">Batal</button>
          <button
            onClick={handleSave}
            disabled={saving || selected.size === 0}
            className="flex-1 py-2.5 bg-indigo-500 text-white rounded-xl font-bold text-sm hover:bg-indigo-600 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            {saving ? (progress || 'Menyimpan...') : `⚡ Apply ke ${selected.size} Games`}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}