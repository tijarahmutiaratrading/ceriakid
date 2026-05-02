import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Trash2, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const GAME_TYPES = ['multiple_choice', 'letter_match', 'number_match', 'picture_quiz', 'drag_drop', 'counting', 'word_builder', 'math_puzzle', 'science_quiz', 'spelling', 'reading', 'phonics'];
const DIFFICULTIES = ['easy', 'medium', 'hard'];
const TIERS = ['free', 'premium', 'pro'];

export default function EditGameModal({ game, onClose, onSaved }) {
  const [form, setForm] = useState({
    title: game.title || '',
    type: game.type || 'multiple_choice',
    difficulty: game.difficulty || 'easy',
    tier: game.tier || 'free',
    emoji: game.emoji || '🎮',
    isPublished: game.isPublished !== false,
  });
  const [questions, setQuestions] = useState(game.gameData?.questions || []);
  const [expandedQ, setExpandedQ] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      await base44.functions.invoke('updateGameInDB', {
        gameId: game.id,
        updates: {
          ...form,
          totalQuestions: questions.length,
          gameData: { ...game.gameData, questions },
        },
      });
      onSaved();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const updateQuestion = (idx, field, value) => {
    setQuestions(prev => prev.map((q, i) => i === idx ? { ...q, [field]: value } : q));
  };

  const updateOption = (qIdx, optIdx, value) => {
    setQuestions(prev => prev.map((q, i) => {
      if (i !== qIdx) return q;
      const opts = [...(q.options || [])];
      opts[optIdx] = value;
      return { ...q, options: opts };
    }));
  };

  const addQuestion = () => {
    setQuestions(prev => [...prev, { problem: '', options: ['', '', '', ''], answer: 0 }]);
    setExpandedQ(questions.length);
  };

  const deleteQuestion = (idx) => {
    setQuestions(prev => prev.filter((_, i) => i !== idx));
    if (expandedQ === idx) setExpandedQ(null);
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
        className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="font-black text-gray-900 text-lg">✏️ Edit Game</h2>
            <p className="text-xs text-gray-400">{game.title}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-all">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="text-xs font-bold text-gray-500 mb-1 block">Tajuk Game</label>
              <input
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                className="w-full border-2 border-gray-200 rounded-xl p-2.5 text-sm font-semibold focus:border-indigo-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 mb-1 block">Emoji</label>
              <input
                value={form.emoji}
                onChange={e => setForm(f => ({ ...f, emoji: e.target.value }))}
                className="w-full border-2 border-gray-200 rounded-xl p-2.5 text-sm text-center text-2xl focus:border-indigo-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 mb-1 block">Published</label>
              <button
                onClick={() => setForm(f => ({ ...f, isPublished: !f.isPublished }))}
                className={`w-full border-2 rounded-xl p-2.5 text-sm font-bold transition-all ${form.isPublished ? 'border-green-400 bg-green-50 text-green-700' : 'border-gray-200 bg-gray-50 text-gray-500'}`}
              >
                {form.isPublished ? '✅ Published' : '⚫ Hidden'}
              </button>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 mb-1 block">Jenis</label>
              <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} className="w-full border-2 border-gray-200 rounded-xl p-2.5 text-sm focus:border-indigo-400 focus:outline-none">
                {GAME_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 mb-1 block">Difficulty</label>
              <select value={form.difficulty} onChange={e => setForm(f => ({ ...f, difficulty: e.target.value }))} className="w-full border-2 border-gray-200 rounded-xl p-2.5 text-sm focus:border-indigo-400 focus:outline-none">
                {DIFFICULTIES.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 mb-1 block">Tier</label>
              <select value={form.tier} onChange={e => setForm(f => ({ ...f, tier: e.target.value }))} className="w-full border-2 border-gray-200 rounded-xl p-2.5 text-sm focus:border-indigo-400 focus:outline-none">
                {TIERS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          {/* Questions */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-black text-gray-800 text-sm">📝 Soalan ({questions.length})</h3>
              <button
                onClick={addQuestion}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500 text-white rounded-xl text-xs font-bold hover:bg-indigo-600 transition-all"
              >
                <Plus className="w-3.5 h-3.5" /> Tambah Soalan
              </button>
            </div>

            <div className="space-y-2">
              {questions.map((q, idx) => (
                <div key={idx} className="border-2 border-gray-100 rounded-2xl overflow-hidden">
                  {/* Question header */}
                  <div
                    className="flex items-center justify-between px-4 py-2.5 cursor-pointer hover:bg-gray-50"
                    onClick={() => setExpandedQ(expandedQ === idx ? null : idx)}
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className="text-xs font-black text-gray-300 w-6 flex-shrink-0">{idx + 1}</span>
                      <p className="text-xs font-semibold text-gray-700 truncate">{q.problem || q.question || '(kosong)'}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-xs text-gray-400">{q.options?.length || 0} pilihan</span>
                      <button
                        onClick={e => { e.stopPropagation(); deleteQuestion(idx); }}
                        className="p-1 text-red-400 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      {expandedQ === idx ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                    </div>
                  </div>

                  {/* Question edit form */}
                  <AnimatePresence>
                    {expandedQ === idx && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: 'auto' }}
                        exit={{ height: 0 }}
                        className="overflow-hidden border-t border-gray-100"
                      >
                        <div className="p-4 space-y-3">
                          <div>
                            <label className="text-xs font-bold text-gray-400 mb-1 block">Soalan</label>
                            <input
                              value={q.problem || q.question || ''}
                              onChange={e => updateQuestion(idx, 'problem', e.target.value)}
                              className="w-full border border-gray-200 rounded-xl p-2 text-sm focus:border-indigo-400 focus:outline-none"
                              placeholder="Tulis soalan..."
                            />
                          </div>
                          <div>
                            <label className="text-xs font-bold text-gray-400 mb-1 block">Pilihan Jawapan</label>
                            {(q.options || ['', '', '', '']).map((opt, oi) => (
                              <div key={oi} className="flex items-center gap-2 mb-1.5">
                                <button
                                  onClick={() => updateQuestion(idx, 'answer', oi)}
                                  className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-black border-2 transition-all ${q.answer === oi ? 'bg-green-500 border-green-500 text-white' : 'border-gray-200 text-gray-400'}`}
                                >
                                  {String.fromCharCode(65 + oi)}
                                </button>
                                <input
                                  value={opt}
                                  onChange={e => updateOption(idx, oi, e.target.value)}
                                  className="flex-1 border border-gray-200 rounded-xl p-2 text-sm focus:border-indigo-400 focus:outline-none"
                                  placeholder={`Pilihan ${String.fromCharCode(65 + oi)}`}
                                />
                              </div>
                            ))}
                            <p className="text-xs text-gray-400 mt-1">Klik huruf untuk tandakan jawapan betul</p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>

          {error && <p className="text-xs text-red-500 font-semibold text-center">{error}</p>}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 border-2 border-gray-200 rounded-xl font-bold text-gray-600 text-sm">Batal</button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 py-2.5 bg-indigo-500 text-white rounded-xl font-bold text-sm hover:bg-indigo-600 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            {saving ? 'Menyimpan...' : '💾 Simpan'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}