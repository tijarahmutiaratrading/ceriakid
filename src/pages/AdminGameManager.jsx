import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Loader2, ChevronDown, ChevronRight, Plus, Minus, Trash2, Edit3, RefreshCw, Users, BookOpen, X, Check } from 'lucide-react';
import AppHeader from '@/components/AppHeader';

const SUBJECT_COLORS = {
  bahasa_melayu: { bg: 'bg-blue-50', border: 'border-l-blue-500', badge: 'bg-blue-100 text-blue-700', dot: 'bg-blue-500' },
  english: { bg: 'bg-green-50', border: 'border-l-green-500', badge: 'bg-green-100 text-green-700', dot: 'bg-green-500' },
  mathematics: { bg: 'bg-purple-50', border: 'border-l-purple-500', badge: 'bg-purple-100 text-purple-700', dot: 'bg-purple-500' },
  science: { bg: 'bg-orange-50', border: 'border-l-orange-500', badge: 'bg-orange-100 text-orange-700', dot: 'bg-orange-500' },
};

export default function AdminGameManager() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedFile, setExpandedFile] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [toast, setToast] = useState(null);
  const [modal, setModal] = useState(null); // { type, file, label, current }

  const showToast = (msg, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await base44.functions.invoke('getGameDatabase', {});
      setData(res.data);
    } catch (err) {
      showToast('Gagal load: ' + err.message, false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const openModal = (type, file, label, current) => {
    setModal({ type, file, label, current, value: String(current) });
  };

  const handleModalConfirm = async () => {
    const count = parseInt(modal.value);
    if (!count || count < 1) return;
    setModal(null);
    setActionLoading(`${modal.type}-${modal.file}`);

    try {
      const fnName = modal.type === 'questions' ? 'syncSubjectGameQuestions' : 'syncSubjectGames';
      await base44.functions.invoke(fnName, { targetCount: count, files: [modal.file] });
      showToast('✅ Berjaya dikemaskini!');
      await fetchData();
    } catch (err) {
      showToast('❌ ' + err.message, false);
    } finally {
      setActionLoading(null);
    }
  };

  const totalGames = data?.subjects.reduce((a, s) => a + s.totalGames, 0) || 0;
  const totalFull = data?.subjects.reduce((a, s) => a + s.games.filter(g => g.questionCount >= 20).length, 0) || 0;
  const totalPlayers = data?.subjects.reduce((a, s) => a + s.games.reduce((b, g) => b + g.players, 0), 0) || 0;

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      <AppHeader showBack={true} backTo="/admin-dashboard" />

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-5 left-1/2 -translate-x-1/2 z-[60] px-5 py-3 rounded-2xl shadow-xl font-bold text-white text-sm ${toast.ok ? 'bg-green-500' : 'bg-red-500'}`}
          >
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input Modal */}
      <AnimatePresence>
        {modal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setModal(null)}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-3xl p-6 max-w-xs w-full shadow-2xl"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-black text-gray-900 text-lg">
                  {modal.type === 'questions' ? '📝 Set Soalan' : '🎮 Set Games'}
                </h3>
                <button onClick={() => setModal(null)} className="p-1 hover:bg-gray-100 rounded-lg">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <p className="text-sm text-gray-500 mb-1">{modal.label}</p>
              <p className="text-xs text-gray-400 mb-4">
                {modal.type === 'questions' ? `Semasa: ${modal.current} soalan per game` : `Semasa: ${modal.current} games`}
              </p>
              <input
                type="number"
                min="1"
                autoFocus
                value={modal.value}
                onChange={e => setModal(m => ({ ...m, value: e.target.value }))}
                onKeyDown={e => e.key === 'Enter' && handleModalConfirm()}
                className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none text-xl font-black text-center mb-4"
              />
              <div className="flex gap-3">
                <button onClick={() => setModal(null)} className="flex-1 py-2.5 rounded-xl border-2 border-gray-200 text-gray-600 font-bold text-sm">Batal</button>
                <button onClick={handleModalConfirm} disabled={!modal.value || parseInt(modal.value) < 1} className="flex-1 py-2.5 rounded-xl bg-indigo-500 text-white font-bold text-sm disabled:opacity-40">
                  Apply
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-4xl mx-auto px-4 pt-24">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-black text-gray-900">🎮 Game Manager</h1>
            <p className="text-gray-500 text-sm">Senarai semua games & soalan</p>
          </div>
          <button
            onClick={fetchData}
            disabled={loading}
            className="p-2.5 bg-white rounded-xl shadow border border-gray-200 hover:bg-gray-50 transition-all"
          >
            <RefreshCw className={`w-5 h-5 text-gray-600 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Summary Cards */}
        {!loading && data && (
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-center">
              <p className="text-2xl font-black text-indigo-600">{totalGames}</p>
              <p className="text-xs text-gray-400 font-semibold mt-0.5">Total Games</p>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-center">
              <p className="text-2xl font-black text-green-600">{totalFull}</p>
              <p className="text-xs text-gray-400 font-semibold mt-0.5">Soalan Penuh</p>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-center">
              <p className="text-2xl font-black text-pink-600">{totalPlayers}</p>
              <p className="text-xs text-gray-400 font-semibold mt-0.5">Total Plays</p>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-indigo-400" />
          </div>
        ) : (
          <>
            {/* Subject Tables */}
            {data?.subjects.map((subjectData, idx) => {
              const colors = SUBJECT_COLORS[subjectData.subject] || SUBJECT_COLORS.bahasa_melayu;
              const isExpanded = expandedFile === subjectData.file;
              const avgQ = subjectData.games.length > 0
                ? Math.round(subjectData.games.reduce((a, g) => a + g.questionCount, 0) / subjectData.games.length)
                : 0;
              const totalSubjectPlayers = subjectData.games.reduce((a, g) => a + g.players, 0);

              return (
                <motion.div
                  key={subjectData.file}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`bg-white rounded-2xl shadow-sm border border-gray-100 border-l-4 ${colors.border} mb-4 overflow-hidden`}
                >
                  {/* Section Header */}
                  <button
                    onClick={() => setExpandedFile(isExpanded ? null : subjectData.file)}
                    className="w-full flex items-center justify-between px-4 py-4 hover:bg-gray-50 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-2.5 h-2.5 rounded-full ${colors.dot}`} />
                      <div className="text-left">
                        <p className="font-black text-gray-900 text-sm">{subjectData.label}</p>
                        <p className="text-xs text-gray-400">{subjectData.file}.js</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex gap-2 text-xs text-right">
                        <span className={`px-2.5 py-1 rounded-full font-bold ${colors.badge}`}>{subjectData.totalGames} games</span>
                        <span className="px-2.5 py-1 rounded-full font-bold bg-gray-100 text-gray-600">{avgQ} soalan avg</span>
                        {totalSubjectPlayers > 0 && (
                          <span className="px-2.5 py-1 rounded-full font-bold bg-pink-100 text-pink-700 flex items-center gap-1">
                            <Users className="w-3 h-3" />{totalSubjectPlayers}
                          </span>
                        )}
                      </div>
                      {/* Edit buttons */}
                      <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                        <button
                          onClick={() => openModal('questions', subjectData.file, subjectData.label, avgQ)}
                          disabled={!!actionLoading}
                          className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg border border-blue-200 transition-all"
                          title="Edit soalan"
                        >
                          {actionLoading === `questions-${subjectData.file}` ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <BookOpen className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          onClick={() => openModal('games', subjectData.file, subjectData.label, subjectData.totalGames)}
                          disabled={!!actionLoading}
                          className="p-1.5 bg-purple-50 hover:bg-purple-100 text-purple-600 rounded-lg border border-purple-200 transition-all"
                          title="Edit games"
                        >
                          {actionLoading === `games-${subjectData.file}` ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Edit3 className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                      {isExpanded ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
                    </div>
                  </button>

                  {/* Games Table */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden border-t border-gray-100"
                      >
                        {/* Table Header */}
                        <div className="grid grid-cols-12 gap-2 px-4 py-2 bg-gray-50 text-xs font-bold text-gray-400 uppercase tracking-wide">
                          <span className="col-span-1">#</span>
                          <span className="col-span-4">Nama Game</span>
                          <span className="col-span-2">Jenis</span>
                          <span className="col-span-2 text-center">Soalan</span>
                          <span className="col-span-2 text-center">Players</span>
                          <span className="col-span-1 text-center">Status</span>
                        </div>

                        <div className="max-h-72 overflow-y-auto divide-y divide-gray-50">
                          {subjectData.games.map((game) => (
                            <div key={game.index} className="grid grid-cols-12 gap-2 items-center px-4 py-3 hover:bg-gray-50 transition-all text-sm">
                              <span className="col-span-1 text-xs font-bold text-gray-300">{game.index + 1}</span>
                              <span className="col-span-4 font-semibold text-gray-800 truncate text-xs leading-tight">{game.title}</span>
                              <span className="col-span-2 text-xs text-gray-400 truncate">{game.type}</span>
                              <div className="col-span-2 flex justify-center">
                                <span className={`text-xs font-black px-2 py-0.5 rounded-full ${
                                  game.questionCount >= 20 ? 'bg-green-100 text-green-700' :
                                  game.questionCount >= 10 ? 'bg-yellow-100 text-yellow-700' :
                                  'bg-red-100 text-red-600'
                                }`}>
                                  {game.questionCount}
                                </span>
                              </div>
                              <div className="col-span-2 flex justify-center items-center gap-1">
                                {game.players > 0 ? (
                                  <span className="text-xs font-bold text-pink-600 flex items-center gap-1">
                                    <Users className="w-3 h-3" />{game.players}
                                  </span>
                                ) : (
                                  <span className="text-xs text-gray-300">—</span>
                                )}
                              </div>
                              <div className="col-span-1 flex justify-center">
                                {game.questionCount >= 20
                                  ? <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center"><Check className="w-2.5 h-2.5 text-white" /></div>
                                  : <div className="w-4 h-4 rounded-full bg-orange-400" />
                                }
                              </div>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}

            {/* Game Hub */}
            {data?.gameHub && (
              <div className="mt-4">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 border-l-4 border-l-orange-500 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-black text-gray-900">🎪 Game Hub Mini-Games</p>
                      <p className="text-xs text-gray-400">{data.gameHub.length} mini-games aktif</p>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-700">{data.gameHub.length} games</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {data.gameHub.map((game) => (
                      <div key={game.id} className="bg-orange-50 border border-orange-200 rounded-xl px-3 py-2 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-orange-400" />
                        <span className="text-xs font-semibold text-orange-800">{game.title}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}