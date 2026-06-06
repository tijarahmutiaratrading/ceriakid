import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Loader2, ChevronDown, ChevronRight, Plus, Minus, BookOpen, Gamepad2, RefreshCw, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import AppHeader from '@/components/AppHeader';

const SUBJECT_COLORS = {
  bahasa_melayu: 'bg-blue-100 text-blue-700 border-blue-300',
  english: 'bg-green-100 text-green-700 border-green-300',
  mathematics: 'bg-purple-100 text-purple-700 border-purple-300',
  science: 'bg-orange-100 text-orange-700 border-orange-300',
};

const SUBJECT_BORDER = {
  bahasa_melayu: 'border-l-blue-500',
  english: 'border-l-green-500',
  mathematics: 'border-l-purple-500',
  science: 'border-l-orange-500',
};

export default function GameDatabase() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedFile, setExpandedFile] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [toast, setToast] = useState(null);
  const [inputModal, setInputModal] = useState(null); // { type, file, label }
  const [inputValue, setInputValue] = useState('');
  const [generatingIcons, setGeneratingIcons] = useState(false);
  const [iconResult, setIconResult] = useState(null);

  const showToast = (msg, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await base44.functions.invoke('getGameDatabase', {});
      setData(res.data);
    } catch (err) {
      showToast('Gagal load data: ' + err.message, false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const openModal = (type, file, label) => {
    setInputModal({ type, file, label });
    setInputValue('');
  };

  const handleModalConfirm = async () => {
    if (!inputValue || isNaN(parseInt(inputValue))) return;
    const { type, file } = inputModal;
    setInputModal(null);
    setActionLoading(`${type}-${file}`);

    try {
      const count = parseInt(inputValue);
      let fnName = '';
      let payload = {};

      if (type === 'add-questions') {
        fnName = 'syncSubjectGameQuestions';
        payload = { targetCount: count, files: [file] };
      } else if (type === 'remove-questions') {
        fnName = 'syncSubjectGameQuestions';
        payload = { targetCount: count, files: [file] };
      } else if (type === 'add-games') {
        fnName = 'syncSubjectGames';
        payload = { targetCount: count, files: [file] };
      } else if (type === 'remove-games') {
        fnName = 'syncSubjectGames';
        payload = { targetCount: count, files: [file] };
      }

      await base44.functions.invoke(fnName, payload);
      showToast('✅ Berjaya!');
      await fetchData();
    } catch (err) {
      showToast('❌ Error: ' + err.message, false);
    } finally {
      setActionLoading(null);
    }
  };

  const handleGenerateIcons = async (overwrite = false) => {
    setGeneratingIcons(true);
    setIconResult(null);
    try {
      const res = await base44.functions.invoke('generateGameIcons', { overwrite });
      setIconResult(res.data);
      showToast(res.data?.message || '✅ Selesai!');
    } catch (err) {
      showToast('❌ Error: ' + err.message, false);
    } finally {
      setGeneratingIcons(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #667eea 0%, #f093fb 50%, #f5a623 100%)' }}>
        <div className="text-center">
          <div className="text-6xl animate-bounce mb-4">🗄️</div>
          <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-32 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #667eea 0%, #f093fb 50%, #f5a623 100%)' }}>
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" />
        <div className="absolute top-1/3 -left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }} />
      </div>
      <AppHeader showBack={true} backTo="/admin-game-manager" />

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-2xl shadow-xl font-bold text-white text-sm ${toast.ok ? 'bg-green-500' : 'bg-red-500'}`}
          >
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input Modal */}
      <AnimatePresence>
        {inputModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setInputModal(null)}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-3xl p-6 max-w-xs w-full shadow-2xl"
            >
              <h3 className="text-lg font-black text-gray-900 mb-1">{inputModal.label}</h3>
              <p className="text-sm text-gray-500 mb-4">
                {inputModal.type.includes('questions') ? 'Set target jumlah soalan per game' : 'Set target jumlah games'}
              </p>
              <input
                type="number"
                min="1"
                autoFocus
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleModalConfirm()}
                placeholder={inputModal.type.includes('questions') ? 'e.g. 20' : 'e.g. 25'}
                className="w-full p-3 border-2 border-gray-300 rounded-xl focus:border-indigo-500 focus:outline-none mb-4 text-lg font-bold"
              />
              <div className="flex gap-3">
                <button onClick={() => setInputModal(null)} className="flex-1 py-2 rounded-xl border-2 border-gray-200 text-gray-600 font-bold">Batal</button>
                <button onClick={handleModalConfirm} disabled={!inputValue} className="flex-1 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-bold disabled:opacity-50">Apply</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative max-w-4xl mx-auto px-4 pt-8 pb-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 p-5 rounded-3xl" style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.4)' }}>
          <div>
            <h1 className="text-xl font-black text-white">🗄️ Game Database</h1>
            <p className="text-white/60 text-xs mt-1">Semua games & soalan dalam sistem</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleGenerateIcons(false)}
              disabled={generatingIcons}
              className="flex items-center gap-2 px-3 py-2 bg-yellow-400/20 hover:bg-yellow-400/30 text-yellow-200 rounded-xl border border-yellow-400/30 transition-all text-xs font-bold"
              title="Generate icon AI untuk games yang belum ada icon"
            >
              {generatingIcons ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {generatingIcons ? 'Generating...' : 'Gen Icons'}
            </button>
            <button onClick={fetchData} className="p-2 bg-white/20 rounded-xl border border-white/30 hover:bg-white/30 transition-all">
              <RefreshCw className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Icon Generation Result */}
        {iconResult && (
          <div className="mb-4 p-4 rounded-2xl text-sm font-semibold text-white" style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)' }}>
            <p>✅ {iconResult.success} icon berjaya | ❌ {iconResult.failed} gagal</p>
            {iconResult.errors?.length > 0 && (
              <p className="text-white/60 text-xs mt-1">{iconResult.errors.join(', ')}</p>
            )}
            <button onClick={() => handleGenerateIcons(true)} disabled={generatingIcons} className="mt-2 text-xs text-yellow-300 underline">
              Regenerate semua (overwrite)
            </button>
          </div>
        )}

        {/* Summary Bar */}
        {data && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            <div className="rounded-2xl p-4 text-center" style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)' }}>
              <p className="text-2xl font-black text-yellow-300">{data.subjects.length}</p>
              <p className="text-xs text-white/70 font-semibold">Subjek</p>
            </div>
            <div className="rounded-2xl p-4 text-center" style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)' }}>
              <p className="text-2xl font-black text-blue-200">{data.subjects.reduce((a, s) => a + s.totalGames, 0)}</p>
              <p className="text-xs text-white/70 font-semibold">Total Games</p>
            </div>
            <div className="rounded-2xl p-4 text-center" style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)' }}>
              <p className="text-2xl font-black text-green-300">
                {data.subjects.reduce((a, s) => a + s.games.filter(g => g.questionCount >= 20).length, 0)}
              </p>
              <p className="text-xs text-white/70 font-semibold">Games 20+ Soalan</p>
            </div>
            <div className="rounded-2xl p-4 text-center" style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)' }}>
              <p className="text-2xl font-black text-orange-300">{data.gameHub.length}</p>
              <p className="text-xs text-white/70 font-semibold">Hub Mini-Games</p>
            </div>
          </div>
        )}

        {/* Subject Files */}
        {data?.subjects.map((subjectData, idx) => (
          <motion.div
            key={subjectData.file}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.04 }}
            className={`rounded-2xl mb-4 overflow-hidden border-l-4 ${SUBJECT_BORDER[subjectData.subject] || 'border-l-gray-400'}`} style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)' }}
          >
            {/* File Header Row */}
            <div className="flex items-center justify-between p-4">
              <button
                onClick={() => setExpandedFile(expandedFile === subjectData.file ? null : subjectData.file)}
                className="flex items-center gap-3 flex-1 text-left"
              >
                <div>
                  {expandedFile === subjectData.file
                    ? <ChevronDown className="w-5 h-5 text-white/60" />
                    : <ChevronRight className="w-5 h-5 text-white/60" />}
                </div>
                <div>
                  <p className="font-black text-white">{subjectData.label}</p>
                  <p className="text-xs text-white/50">{subjectData.file}.js</p>
                </div>
              </button>

              <div className="flex items-center gap-2">
                <span className={`text-xs font-bold px-3 py-1 rounded-full border ${subjectData.subject ? 'bg-white/15 text-white border-white/30' : 'bg-white/15 text-white border-white/30'}`}>
                  {subjectData.totalGames} games
                </span>

                {/* Action Buttons */}
                <div className="flex gap-1">
                  <button
                    onClick={() => openModal('add-questions', subjectData.file, `Tambah Soalan - ${subjectData.label}`)}
                    disabled={!!actionLoading}
                    className="p-1.5 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded-lg transition-all border border-blue-400/30"
                    title="Tambah/Set soalan"
                  >
                    {actionLoading === `add-questions-${subjectData.file}` ? <Loader2 className="w-4 h-4 animate-spin" /> : <BookOpen className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => openModal('add-games', subjectData.file, `Set Games - ${subjectData.label}`)}
                    disabled={!!actionLoading}
                    className="p-1.5 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded-lg transition-all border border-purple-400/30"
                    title="Tambah/Set jumlah games"
                  >
                    {actionLoading === `add-games-${subjectData.file}` ? <Loader2 className="w-4 h-4 animate-spin" /> : <Gamepad2 className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Progress bar */}
            <div className="px-4 pb-3">
              <div className="flex items-center gap-2 mb-1">
                <div className="flex-1 h-2 bg-white/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-300 to-purple-400 rounded-full transition-all duration-700"
                    style={{ width: `${Math.round((subjectData.games.filter(g => g.questionCount >= 20).length / subjectData.totalGames) * 100)}%` }}
                  />
                </div>
                <span className="text-xs font-bold text-white/60">
                  {subjectData.games.filter(g => g.questionCount >= 20).length}/{subjectData.totalGames} full
                </span>
              </div>
            </div>

            {/* Expanded Games List */}
            <AnimatePresence>
              {expandedFile === subjectData.file && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="border-t border-white/10 overflow-hidden"
                >
                  <div className="p-3 space-y-1 max-h-80 overflow-y-auto">
                    {subjectData.games.map((game) => (
                      <div key={game.index} className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white/10 transition-all">
                        <span className="text-xs text-white/40 font-bold w-5 flex-shrink-0">{game.index + 1}</span>
                        <span className="flex-1 text-xs font-semibold text-white truncate">{game.title}</span>
                        <span className={`text-xs font-black flex-shrink-0 ${game.questionCount >= 20 ? 'text-green-300' : game.questionCount >= 10 ? 'text-orange-300' : 'text-red-300'}`}>
                          {game.questionCount}Q
                        </span>
                        {game.questionCount >= 20
                          ? <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
                          : <AlertCircle className="w-4 h-4 text-orange-400 flex-shrink-0" />}
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}

        {/* Game Hub Section */}
        {data?.gameHub && (
          <div className="mt-8">
            <h2 className="text-xl font-black text-white mb-3">🎪 Game Hub Mini-Games</h2>
            <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)' }}>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {data.gameHub.map((game, idx) => (
                  <motion.div
                    key={game.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    className="rounded-xl p-3 text-center" style={{ background: 'rgba(255,255,255,0.15)' }}
                  >
                    <p className="text-sm font-bold text-white">{game.title}</p>
                    <p className="text-xs text-green-300 mt-1">✓ Active</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}