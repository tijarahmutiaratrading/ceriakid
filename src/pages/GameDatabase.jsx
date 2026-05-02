import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Loader2, ChevronDown, ChevronRight, Plus, Minus, BookOpen, Gamepad2, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-indigo-500 mx-auto mb-3" />
          <p className="text-gray-600 font-semibold">Loading database...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 pb-32">
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

      <div className="max-w-4xl mx-auto px-4 pt-24">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-black text-gray-900">🗄️ Game Database</h1>
            <p className="text-gray-500 text-sm mt-1">Semua games & soalan dalam sistem</p>
          </div>
          <button onClick={fetchData} className="p-2 bg-white rounded-xl shadow border border-gray-200 hover:bg-gray-50 transition-all">
            <RefreshCw className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Summary Bar */}
        {data && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
            <div className="bg-white rounded-2xl p-4 shadow border border-gray-100 text-center">
              <p className="text-2xl font-black text-indigo-600">{data.subjects.length}</p>
              <p className="text-xs text-gray-500 font-semibold">Subjek</p>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow border border-gray-100 text-center">
              <p className="text-2xl font-black text-blue-600">{data.subjects.reduce((a, s) => a + s.totalGames, 0)}</p>
              <p className="text-xs text-gray-500 font-semibold">Total Games</p>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow border border-gray-100 text-center">
              <p className="text-2xl font-black text-green-600">
                {data.subjects.reduce((a, s) => a + s.games.filter(g => g.questionCount >= 20).length, 0)}
              </p>
              <p className="text-xs text-gray-500 font-semibold">Games 20+ Soalan</p>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow border border-gray-100 text-center">
              <p className="text-2xl font-black text-orange-600">{data.gameHub.length}</p>
              <p className="text-xs text-gray-500 font-semibold">Hub Mini-Games</p>
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
            className={`bg-white rounded-2xl shadow border-l-4 ${SUBJECT_BORDER[subjectData.subject] || 'border-l-gray-400'} mb-4 overflow-hidden`}
          >
            {/* File Header Row */}
            <div className="flex items-center justify-between p-4">
              <button
                onClick={() => setExpandedFile(expandedFile === subjectData.file ? null : subjectData.file)}
                className="flex items-center gap-3 flex-1 text-left"
              >
                <div>
                  {expandedFile === subjectData.file
                    ? <ChevronDown className="w-5 h-5 text-gray-500" />
                    : <ChevronRight className="w-5 h-5 text-gray-500" />}
                </div>
                <div>
                  <p className="font-black text-gray-900">{subjectData.label}</p>
                  <p className="text-xs text-gray-500">{subjectData.file}.js</p>
                </div>
              </button>

              <div className="flex items-center gap-2">
                <span className={`text-xs font-bold px-3 py-1 rounded-full border ${SUBJECT_COLORS[subjectData.subject] || 'bg-gray-100 text-gray-700 border-gray-300'}`}>
                  {subjectData.totalGames} games
                </span>

                {/* Action Buttons */}
                <div className="flex gap-1">
                  <button
                    onClick={() => openModal('add-questions', subjectData.file, `Tambah Soalan - ${subjectData.label}`)}
                    disabled={!!actionLoading}
                    className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-all border border-blue-200"
                    title="Tambah/Set soalan"
                  >
                    {actionLoading === `add-questions-${subjectData.file}` ? <Loader2 className="w-4 h-4 animate-spin" /> : <BookOpen className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => openModal('add-games', subjectData.file, `Set Games - ${subjectData.label}`)}
                    disabled={!!actionLoading}
                    className="p-1.5 bg-purple-50 hover:bg-purple-100 text-purple-600 rounded-lg transition-all border border-purple-200"
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
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-400 to-purple-500 rounded-full transition-all duration-700"
                    style={{ width: `${Math.round((subjectData.games.filter(g => g.questionCount >= 20).length / subjectData.totalGames) * 100)}%` }}
                  />
                </div>
                <span className="text-xs font-bold text-gray-500">
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
                  className="border-t border-gray-100 overflow-hidden"
                >
                  <div className="p-3 space-y-1 max-h-80 overflow-y-auto">
                    {/* Table Header */}
                    <div className="grid grid-cols-12 gap-2 px-3 py-1 text-xs font-bold text-gray-400 uppercase">
                      <span className="col-span-1">#</span>
                      <span className="col-span-5">Title</span>
                      <span className="col-span-2">Type</span>
                      <span className="col-span-2 text-center">Soalan</span>
                      <span className="col-span-2 text-center">Status</span>
                    </div>

                    {subjectData.games.map((game) => (
                      <div key={game.index} className="grid grid-cols-12 gap-2 items-center px-3 py-2 rounded-xl hover:bg-gray-50 transition-all">
                        <span className="col-span-1 text-xs text-gray-400 font-bold">{game.index + 1}</span>
                        <span className="col-span-5 text-sm font-semibold text-gray-800 truncate">{game.title}</span>
                        <span className="col-span-2 text-xs text-gray-500 truncate">{game.type}</span>
                        <span className={`col-span-2 text-center text-sm font-black ${game.questionCount >= 20 ? 'text-green-600' : game.questionCount >= 10 ? 'text-orange-500' : 'text-red-500'}`}>
                          {game.questionCount}
                        </span>
                        <div className="col-span-2 flex justify-center">
                          {game.questionCount >= 20
                            ? <CheckCircle2 className="w-4 h-4 text-green-500" />
                            : <AlertCircle className="w-4 h-4 text-orange-400" />}
                        </div>
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
            <h2 className="text-xl font-black text-gray-800 mb-3">🎪 Game Hub Mini-Games</h2>
            <div className="bg-white rounded-2xl shadow border-l-4 border-l-orange-500 p-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {data.gameHub.map((game, idx) => (
                  <motion.div
                    key={game.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    className="bg-orange-50 border-2 border-orange-200 rounded-xl p-3 text-center"
                  >
                    <p className="text-sm font-bold text-orange-800">{game.title}</p>
                    <p className="text-xs text-orange-500 mt-1">✓ Active</p>
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