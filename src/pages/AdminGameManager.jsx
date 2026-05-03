import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Loader2, ChevronDown, ChevronRight, RefreshCw, Edit3, X, Trash2, Wand2, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import AppHeader from '@/components/AppHeader';
import { gameLibrary } from '@/lib/gameLibrary';
import EditGameModal from '@/components/admin/EditGameModal';
import SyncAndEditModal from '@/components/admin/SyncAndEditModal';
import SubjectCard from '@/components/admin/SubjectCard';

const QUESTION_THRESHOLD = 20;
const QUESTION_GENERATION_DELAY = 3000;

const SUBJECT_CONFIG = [
  { file: 'gameData_prasekolah_bm', label: 'Prasekolah - BM', ageGroup: 'prasekolah', subject: 'bahasa_melayu', color: { border: 'border-l-blue-500', badge: 'bg-blue-100 text-blue-700', dot: 'bg-blue-500' } },
  { file: 'gameData_prasekolah_en', label: 'Prasekolah - English', ageGroup: 'prasekolah', subject: 'english', color: { border: 'border-l-green-500', badge: 'bg-green-100 text-green-700', dot: 'bg-green-500' } },
  { file: 'gameData_prasekolah_math', label: 'Prasekolah - Math', ageGroup: 'prasekolah', subject: 'mathematics', color: { border: 'border-l-purple-500', badge: 'bg-purple-100 text-purple-700', dot: 'bg-purple-500' } },
  { file: 'gameData_prasekolah_science', label: 'Prasekolah - Science', ageGroup: 'prasekolah', subject: 'science', color: { border: 'border-l-orange-500', badge: 'bg-orange-100 text-orange-700', dot: 'bg-orange-500' } },
  { file: 'gameData_prasekolah_tamil', label: 'Prasekolah - Tamil', ageGroup: 'prasekolah', subject: 'bahasa_tamil', color: { border: 'border-l-red-500', badge: 'bg-red-100 text-red-700', dot: 'bg-red-500' } },
  { file: 'gameData_prasekolah_mandarin', label: 'Prasekolah - Mandarin', ageGroup: 'prasekolah', subject: 'bahasa_mandarin', color: { border: 'border-l-yellow-500', badge: 'bg-yellow-100 text-yellow-700', dot: 'bg-yellow-500' } },
  { file: 'gameData_sr_bm', label: 'Sekolah Rendah - BM', ageGroup: 'sekolah_rendah', subject: 'bahasa_melayu', color: { border: 'border-l-blue-500', badge: 'bg-blue-100 text-blue-700', dot: 'bg-blue-500' } },
  { file: 'gameData_sr_jawi', label: 'Sekolah Rendah - Jawi', ageGroup: 'sekolah_rendah', subject: 'jawi', color: { border: 'border-l-teal-500', badge: 'bg-teal-100 text-teal-700', dot: 'bg-teal-500' } },
  { file: 'gameData_sr_english', label: 'Sekolah Rendah - English', ageGroup: 'sekolah_rendah', subject: 'english', color: { border: 'border-l-green-500', badge: 'bg-green-100 text-green-700', dot: 'bg-green-500' } },
  { file: 'gameData_sr_math', label: 'Sekolah Rendah - Math', ageGroup: 'sekolah_rendah', subject: 'mathematics', color: { border: 'border-l-purple-500', badge: 'bg-purple-100 text-purple-700', dot: 'bg-purple-500' } },
  { file: 'gameData_sr_science', label: 'Sekolah Rendah - Science', ageGroup: 'sekolah_rendah', subject: 'science', color: { border: 'border-l-orange-500', badge: 'bg-orange-100 text-orange-700', dot: 'bg-orange-500' } },
  { file: 'gameData_sr_tamil', label: 'Sekolah Rendah - Tamil', ageGroup: 'sekolah_rendah', subject: 'bahasa_tamil', color: { border: 'border-l-red-500', badge: 'bg-red-100 text-red-700', dot: 'bg-red-500' } },
  { file: 'gameData_sr_mandarin', label: 'Sekolah Rendah - Mandarin', ageGroup: 'sekolah_rendah', subject: 'bahasa_mandarin', color: { border: 'border-l-yellow-500', badge: 'bg-yellow-100 text-yellow-700', dot: 'bg-yellow-500' } },
];

const GAME_HUB = [
  { id: 'memory', title: 'Memory Game' },
  { id: 'dragdrop', title: 'Drag & Drop' },
  { id: 'wordbuilder', title: 'Word Builder' },
  { id: 'sorting', title: 'Sorting Game' },
  { id: 'tilematch', title: 'Tile Match' },
  { id: 'story', title: 'Story Adventure' },
  { id: 'physics', title: 'Physics Game' },
  { id: 'tracing', title: 'Tracing Game' },
];

export default function AdminGameManager() {
  const [tab, setTab] = useState('generator');

  // Shared
  const [toast, setToast] = useState(null);
  const showToast = (msg, ok = true) => { setToast({ msg, ok }); setTimeout(() => setToast(null), 4000); };

  // ── GENERATOR TAB STATE ──
  const [genConfig, setGenConfig] = useState({ games: 20, questions: 20 });
  const [selectedSubjects, setSelectedSubjects] = useState(new Set());
  const [tasks, setTasks] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const loadTasks = async () => {
    setLoadingTasks(true);
    try {
      const data = await base44.entities.GameTask.list('-created_date', 50);
      setTasks(data);
    } catch {}
    setLoadingTasks(false);
  };

  useEffect(() => { if (tab === 'generator') loadTasks(); }, [tab]);

  const toggleSubject = (key) => {
    const next = new Set(selectedSubjects);
    next.has(key) ? next.delete(key) : next.add(key);
    setSelectedSubjects(next);
  };

  const selectAll = () => setSelectedSubjects(new Set(SUBJECT_CONFIG.map(sc => `${sc.ageGroup}-${sc.subject}`)));
  const selectNone = () => setSelectedSubjects(new Set());

  const handleQueueGeneration = async () => {
    if (selectedSubjects.size === 0) { showToast('Pilih sekurang-kurangnya satu subjek', false); return; }
    setSubmitting(true);
    try {
      for (const subjectKey of Array.from(selectedSubjects)) {
        const [ageGroup, ...rest] = subjectKey.split('-');
        const subject = rest.join('-');
        const sc = SUBJECT_CONFIG.find(s => s.ageGroup === ageGroup && s.subject === subject);
        await base44.entities.GameTask.create({
          taskName: sc?.label || subjectKey,
          ageGroup,
          subject,
          gamesCount: genConfig.games,
          questionsPerGame: genConfig.questions,
          status: 'pending',
        });
      }
      showToast(`✅ ${selectedSubjects.size} tasks dihantar ke queue!`);
      setSelectedSubjects(new Set());
      loadTasks();
    } catch (err) {
      showToast('❌ ' + err.message, false);
    }
    setSubmitting(false);
  };

  const handleDeleteTask = async (id) => {
    await base44.entities.GameTask.delete(id);
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const handleDeleteAllPending = async () => {
    if (!window.confirm('Padam semua pending tasks?')) return;
    const pending = tasks.filter(t => t.status === 'pending');
    for (const t of pending) await base44.entities.GameTask.delete(t.id);
    loadTasks();
    showToast(`✅ ${pending.length} tasks dipadam`);
  };

  // ── MANAGER TAB STATE ──
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedFile, setExpandedFile] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [modal, setModal] = useState(null);
  const [editGame, setEditGame] = useState(null);
  const [syncAndEdit, setSyncAndEdit] = useState(null);
  const [dbGamesCache, setDbGamesCache] = useState({});
  const [collapsedSections, setCollapsedSections] = useState({ prasekolah: false, sekolah_rendah: false });
  const [generateModal, setGenerateModal] = useState(null);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const [statsRes, ...dbGameGroups] = await Promise.all([
        base44.functions.invoke('getGameDatabase', {}),
        ...SUBJECT_CONFIG.map(sc => base44.entities.Game.filter({ ageGroup: sc.ageGroup, category: sc.subject, isPublished: true })),
      ]);

      const stats = {};
      for (const sub of statsRes.data.subjects) {
        for (const g of sub.games) {
          stats[`${sub.ageGroup}-${sub.subject}-${g.index}`] = { players: g.players, timesPlayed: g.timesPlayed, avgScore: g.avgScore };
        }
      }

      const newCache = {};
      const builtSubjects = SUBJECT_CONFIG.map(({ file, label, ageGroup, subject, color }, i) => {
        const dbGames = (dbGameGroups[i] || []).sort((a, b) => (a.order || 0) - (b.order || 0));
        newCache[`${ageGroup}-${subject}`] = dbGames;
        return {
          file, label, ageGroup, subject, color,
          totalGames: dbGames.length,
          games: dbGames.map((g, idx) => {
            const stat = stats[`${ageGroup}-${subject}-${idx}`] || { players: 0, timesPlayed: 0, avgScore: null };
            return { index: idx, id: g.id, title: g.title || `Game ${idx + 1}`, type: g.type || '-', ageGroup, category: subject, questionCount: g.gameData?.questions?.length || g.totalQuestions || 0, totalQuestions: g.gameData?.questions?.length || g.totalQuestions || 0, players: stat.players, timesPlayed: stat.timesPlayed, avgScore: stat.avgScore, _raw: g };
          }),
        };
      });
      setDbGamesCache(newCache);
      setSubjects(builtSubjects);
    } catch (err) {
      showToast('Stats tidak dapat diload', false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (tab === 'manager') fetchStats(); }, [tab]);

  const handleModalConfirm = async () => {
    const { file, ageGroup, subject } = modal;
    const games = parseInt(modal.gamesValue);
    const questions = parseInt(modal.questionsValue);
    setModal(null);
    setActionLoading(file);
    try {
      if (games > 0) {
        showToast('⏳ Mengemas kini bilangan games...', true);
        await base44.functions.invoke('syncSubjectGames', { targetCount: games, ageGroup, category: subject });
      }
      if (questions > 0) {
        const dbGames = await base44.entities.Game.filter({ ageGroup, category: subject, isPublished: true });
        const needsUpdate = dbGames.filter(g => (g.gameData?.questions?.length || 0) < questions);
        for (let i = 0; i < needsUpdate.length; i++) {
          showToast(`⏳ AI menjana soalan... ${i + 1}/${needsUpdate.length}`, true);
          await base44.functions.invoke('syncSubjectGameQuestions', { targetCount: questions, ageGroup, category: subject, gameId: needsUpdate[i].id });
          if (i < needsUpdate.length - 1) await new Promise(r => setTimeout(r, QUESTION_GENERATION_DELAY));
        }
      }
      showToast('✅ Selesai!');
      await fetchStats();
    } catch (err) {
      showToast('❌ ' + err.message, false);
    } finally {
      setActionLoading(null);
    }
  };

  const handleVerifySubject = async (file, label, ageGroup, subject, cache) => {
    setActionLoading(`verify-${file}`);
    showToast(`⏳ Verifying ${label}...`, true);
    try {
      const dbGames = cache[`${ageGroup}-${subject}`] || [];
      let fixed = 0, verified = 0, autoFixed = 0, flagged = 0;
      for (const g of dbGames) {
        const actualCount = g.gameData?.questions?.length || 0;
        if (g.totalQuestions !== actualCount) { await base44.entities.Game.update(g.id, { totalQuestions: actualCount }); fixed++; }
      }
      for (let i = 0; i < dbGames.length; i++) {
        const game = dbGames[i];
        if (!game.gameData?.questions?.length) continue;
        try {
          const result = await base44.functions.invoke('validateGameQuestionsQuality', { gameId: game.id, ageGroup: game.ageGroup, category: game.category, questions: game.gameData.questions });
          if (result.data.validation.summary.invalid_count > 0) {
            const fixResult = await base44.functions.invoke('autoFixGameQuestions', { gameId: game.id, validationResult: result.data.validation });
            autoFixed += fixResult.data.fixed; verified++;
          } else { verified++; }
        } catch { flagged++; }
      }
      showToast(`✅ ${fixed} updated · ${verified} verified · ${autoFixed} fixed · ${flagged} failed`);
      await fetchStats();
    } catch (err) {
      showToast('❌ ' + err.message, false);
    } finally {
      setActionLoading(null);
    }
  };

  const totalGames = subjects.reduce((a, s) => a + s.totalGames, 0);
  const totalFull = subjects.reduce((a, s) => a + s.games.filter(g => g.questionCount >= QUESTION_THRESHOLD).length, 0);
  const totalPlayers = subjects.reduce((a, s) => a + s.games.reduce((b, g) => b + g.players, 0), 0);

  const pendingTasks = tasks.filter(t => t.status === 'pending');
  const runningTasks = tasks.filter(t => t.status === 'running');
  const completedTasks = tasks.filter(t => t.status === 'completed');
  const failedTasks = tasks.filter(t => t.status === 'failed');

  const statusConfig = {
    pending: { color: 'bg-yellow-100 text-yellow-700', icon: <Clock className="w-3 h-3" /> },
    running: { color: 'bg-blue-100 text-blue-700', icon: <Loader2 className="w-3 h-3 animate-spin" /> },
    completed: { color: 'bg-green-100 text-green-700', icon: <CheckCircle2 className="w-3 h-3" /> },
    failed: { color: 'bg-red-100 text-red-700', icon: <AlertCircle className="w-3 h-3" /> },
  };

  return (
    <div className="min-h-screen pb-32 bg-pattern relative overflow-hidden">
      <AppHeader showBack={true} backTo="/admin-dashboard" />

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className={`fixed top-5 left-1/2 -translate-x-1/2 z-[60] px-5 py-3 rounded-2xl shadow-xl font-bold text-white text-sm ${toast.ok ? 'bg-green-500' : 'bg-red-500'}`}>
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-4xl mx-auto px-3 md:px-4 pt-20 md:pt-24">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-5">
          <h1 className="text-xl md:text-2xl font-black text-gray-900">🎮 Game Manager</h1>
          <p className="text-gray-600 text-xs font-semibold">{totalGames} games dalam database</p>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 p-1 bg-white/40 backdrop-blur-xl rounded-2xl border-2 border-white/30 shadow-lg">
          {[
            { id: 'generator', label: '🤖 Generator', desc: 'Jana games baru' },
            { id: 'manager', label: '📋 Manager', desc: 'Urus games sedia ada' },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-all ${tab === t.id ? 'bg-game-purple text-white shadow-lg' : 'text-gray-600 hover:bg-white/60'}`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ══════════════ GENERATOR TAB ══════════════ */}
        {tab === 'generator' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {/* Config */}
            <div className="bg-white/40 backdrop-blur-xl rounded-3xl border-2 border-white/30 shadow-xl p-5 mb-5">
              <h2 className="font-black text-gray-800 mb-4">⚙️ Konfigurasi Generation</h2>
              <div className="grid grid-cols-2 gap-4 mb-5">
                <div>
                  <label className="text-xs font-black text-gray-500 uppercase tracking-wide block mb-1">🎮 Bilangan Games</label>
                  <input type="number" min="1" max="100" value={genConfig.games}
                    onChange={e => setGenConfig(c => ({ ...c, games: parseInt(e.target.value) || 1 }))}
                    className="w-full p-3 border-2 border-gray-200 rounded-2xl text-xl font-black text-center bg-white focus:border-game-purple outline-none" />
                </div>
                <div>
                  <label className="text-xs font-black text-gray-500 uppercase tracking-wide block mb-1">📝 Soalan per Game</label>
                  <input type="number" min="1" max="50" value={genConfig.questions}
                    onChange={e => setGenConfig(c => ({ ...c, questions: parseInt(e.target.value) || 1 }))}
                    className="w-full p-3 border-2 border-gray-200 rounded-2xl text-xl font-black text-center bg-white focus:border-game-purple outline-none" />
                </div>
              </div>

              {/* Subject selector */}
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-black text-gray-500 uppercase tracking-wide">Pilih Subjek</p>
                <div className="flex gap-2">
                  <button onClick={selectAll} className="text-xs font-bold text-game-purple hover:underline">Semua</button>
                  <span className="text-gray-300">|</span>
                  <button onClick={selectNone} className="text-xs font-bold text-gray-400 hover:underline">Kosong</button>
                </div>
              </div>

              {/* Prasekolah */}
              <p className="text-xs font-black text-gray-400 mb-2">🧒 Prasekolah</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3">
                {SUBJECT_CONFIG.filter(s => s.ageGroup === 'prasekolah').map(sc => {
                  const key = `${sc.ageGroup}-${sc.subject}`;
                  const sel = selectedSubjects.has(key);
                  return (
                    <button key={key} onClick={() => toggleSubject(key)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold border-2 transition-all text-left ${sel ? 'border-game-purple bg-game-purple/10 text-game-purple' : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'}`}>
                      <div className={`w-4 h-4 rounded border-2 flex-shrink-0 flex items-center justify-center ${sel ? 'bg-game-purple border-game-purple' : 'border-gray-300'}`}>
                        {sel && <span className="text-white text-xs">✓</span>}
                      </div>
                      {sc.label.replace('Prasekolah - ', '')}
                    </button>
                  );
                })}
              </div>

              {/* Sekolah Rendah */}
              <p className="text-xs font-black text-gray-400 mb-2">🎒 Sekolah Rendah</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-5">
                {SUBJECT_CONFIG.filter(s => s.ageGroup === 'sekolah_rendah').map(sc => {
                  const key = `${sc.ageGroup}-${sc.subject}`;
                  const sel = selectedSubjects.has(key);
                  return (
                    <button key={key} onClick={() => toggleSubject(key)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold border-2 transition-all text-left ${sel ? 'border-game-purple bg-game-purple/10 text-game-purple' : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'}`}>
                      <div className={`w-4 h-4 rounded border-2 flex-shrink-0 flex items-center justify-center ${sel ? 'bg-game-purple border-game-purple' : 'border-gray-300'}`}>
                        {sel && <span className="text-white text-xs">✓</span>}
                      </div>
                      {sc.label.replace('Sekolah Rendah - ', '')}
                    </button>
                  );
                })}
              </div>

              {selectedSubjects.size > 0 && (
                <p className="text-xs text-game-purple font-semibold text-center mb-3 bg-game-purple/10 py-2 rounded-xl">
                  {selectedSubjects.size} subjek dipilih · {selectedSubjects.size * genConfig.games} games · {selectedSubjects.size * genConfig.games * genConfig.questions} soalan
                </p>
              )}

              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                onClick={handleQueueGeneration}
                disabled={submitting || selectedSubjects.size === 0}
                className="w-full py-4 rounded-2xl font-black text-base flex items-center justify-center gap-3 bg-gradient-to-r from-game-purple to-game-pink text-white shadow-xl disabled:opacity-40">
                {submitting ? <><Loader2 className="w-5 h-5 animate-spin" /> Menghantar ke queue...</> : <><Wand2 className="w-5 h-5" /> Queue Generation ({selectedSubjects.size} subjek)</>}
              </motion.button>
              <p className="text-xs text-gray-400 text-center mt-2">✅ Tasks diproses otomatik setiap 5 minit. Boleh tutup browser.</p>
            </div>

            {/* Task Queue */}
            <div className="bg-white/40 backdrop-blur-xl rounded-3xl border-2 border-white/30 shadow-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-black text-gray-800">📋 Task Queue</h2>
                <div className="flex gap-2">
                  {pendingTasks.length > 0 && (
                    <button onClick={handleDeleteAllPending} className="text-xs font-bold text-red-500 hover:underline">Padam Pending</button>
                  )}
                  <button onClick={loadTasks} className="p-1.5 hover:bg-white/60 rounded-lg transition-all">
                    <RefreshCw className={`w-4 h-4 text-gray-500 ${loadingTasks ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-4 gap-2 mb-4">
                {[
                  { label: 'Pending', value: pendingTasks.length, color: 'text-yellow-600' },
                  { label: 'Running', value: runningTasks.length, color: 'text-blue-600' },
                  { label: 'Done', value: completedTasks.length, color: 'text-green-600' },
                  { label: 'Failed', value: failedTasks.length, color: 'text-red-600' },
                ].map(s => (
                  <div key={s.label} className="bg-white/60 rounded-xl p-2 text-center">
                    <p className={`font-black text-lg ${s.color}`}>{s.value}</p>
                    <p className="text-xs text-gray-500 font-semibold">{s.label}</p>
                  </div>
                ))}
              </div>

              {loadingTasks ? (
                <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-game-purple" /></div>
              ) : tasks.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <p className="text-3xl mb-2">📭</p>
                  <p className="text-sm font-semibold">Tiada tasks dalam queue</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {tasks.map(task => {
                    const sc = statusConfig[task.status] || statusConfig.pending;
                    return (
                      <div key={task.id} className="flex items-center gap-3 bg-white/60 rounded-xl px-3 py-2.5">
                        <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${sc.color}`}>
                          {sc.icon} {task.status}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-gray-800 truncate">{task.taskName}</p>
                          <p className="text-xs text-gray-400">{task.gamesCount} games · {task.questionsPerGame} soalan
                            {task.createdGames > 0 && <span className="text-green-600 font-bold"> · {task.createdGames} dibuat</span>}
                          </p>
                        </div>
                        {task.status === 'pending' && (
                          <button onClick={() => handleDeleteTask(task.id)} className="p-1 text-red-400 hover:text-red-600 transition-all">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* ══════════════ MANAGER TAB ══════════════ */}
        {tab === 'manager' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {/* Stats */}
            <div className="grid grid-cols-3 gap-2 md:gap-3 mb-5">
              {[
                { value: totalGames, label: 'Total Games', color: 'text-game-purple' },
                { value: totalFull, label: 'Soalan Penuh', color: 'text-green-600' },
                { value: totalPlayers, label: 'Total Players', color: 'text-game-pink' },
              ].map(({ value, label, color }) => (
                <div key={label} className="bg-white/40 backdrop-blur-xl rounded-2xl p-2 md:p-3 shadow-xl border-2 border-white/30 text-center">
                  <p className={`text-lg md:text-2xl font-black ${color}`}>{value}</p>
                  <p className="text-xs text-gray-600 font-semibold">{label}</p>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex gap-2 mb-4 flex-wrap">
              <button onClick={fetchStats} disabled={loading} className="p-2 bg-white/40 backdrop-blur-xl rounded-xl border-2 border-white/30 hover:bg-white/60 transition-all">
                <RefreshCw className={`w-4 h-4 text-gray-600 ${loading ? 'animate-spin' : ''}`} />
              </button>
              <motion.button whileTap={{ scale: 0.97 }}
                onClick={async () => {
                  if (!window.confirm('🚨 DELETE semua games? Tidak boleh di-undo!')) return;
                  setActionLoading('delete-all');
                  try {
                    const res = await base44.functions.invoke('deleteAllGames', {});
                    showToast(`✅ Deleted ${res.data.deletedCount} games`);
                    await fetchStats();
                  } catch (err) { showToast('❌ ' + err.message, false); }
                  setActionLoading(null);
                }}
                disabled={!!actionLoading}
                className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded-xl text-xs font-bold hover:shadow-lg disabled:opacity-50 transition-all">
                {actionLoading === 'delete-all' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                Delete All
              </motion.button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-game-purple" /></div>
            ) : (
              <>
                {/* Prasekolah */}
                <div className="flex items-center gap-2 mb-2 mt-2">
                  <button onClick={() => setCollapsedSections(p => ({ ...p, prasekolah: !p.prasekolah }))} className="p-1.5 hover:bg-white/40 rounded-lg transition-all">
                    {collapsedSections.prasekolah ? <ChevronRight className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
                  </button>
                  <div className="text-lg font-black text-gray-700">🧒 Prasekolah</div>
                  <div className="flex-1 h-px bg-gradient-to-r from-amber-300/60 to-transparent" />
                </div>
                {!collapsedSections.prasekolah && subjects.filter(s => s.ageGroup === 'prasekolah').map((s, idx) => (
                  <SubjectCard key={s.file} subject={s} isExpanded={expandedFile === s.file} onExpandToggle={setExpandedFile}
                    actionLoading={actionLoading} onBulkEdit={(games, label, ag, sub) => setSyncAndEdit({ games, label, ageGroup: ag, subject: sub })}
                    onEditSubjectConfig={(file, label, cg, cq, ag, sub) => { setActionLoading(`config-${file}`); setModal({ file, label, ageGroup: ag, subject: sub, gamesValue: String(cg), questionsValue: String(cq || '') }); }}
                    showToast={showToast} dbGamesCache={dbGamesCache} onVerify={handleVerifySubject}
                    onEditGame={setEditGame} onGenerateSubject={(label, ag, sub, cc) => setGenerateModal({ games: 5, questions: 10, ageGroup: ag, subject: sub, label, currentCount: cc })} idx={idx} />
                ))}

                {/* Sekolah Rendah */}
                <div className="flex items-center gap-2 mb-2 mt-6">
                  <button onClick={() => setCollapsedSections(p => ({ ...p, sekolah_rendah: !p.sekolah_rendah }))} className="p-1.5 hover:bg-white/40 rounded-lg transition-all">
                    {collapsedSections.sekolah_rendah ? <ChevronRight className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
                  </button>
                  <div className="text-lg font-black text-gray-700">🎒 Sekolah Rendah</div>
                  <div className="flex-1 h-px bg-gradient-to-r from-amber-300/60 to-transparent" />
                </div>
                {!collapsedSections.sekolah_rendah && subjects.filter(s => s.ageGroup === 'sekolah_rendah').map((s, idx) => (
                  <SubjectCard key={s.file} subject={s} isExpanded={expandedFile === s.file} onExpandToggle={setExpandedFile}
                    actionLoading={actionLoading} onBulkEdit={(games, label, ag, sub) => setSyncAndEdit({ games, label, ageGroup: ag, subject: sub })}
                    onEditSubjectConfig={(file, label, cg, cq, ag, sub) => { setActionLoading(`config-${file}`); setModal({ file, label, ageGroup: ag, subject: sub, gamesValue: String(cg), questionsValue: String(cq || '') }); }}
                    showToast={showToast} dbGamesCache={dbGamesCache} onVerify={handleVerifySubject}
                    onEditGame={setEditGame} onGenerateSubject={(label, ag, sub, cc) => setGenerateModal({ games: 5, questions: 10, ageGroup: ag, subject: sub, label, currentCount: cc })} idx={idx} />
                ))}

                {/* Mini Games */}
                <div className="flex items-center gap-2 mb-2 mt-6">
                  <div className="text-lg font-black text-gray-700">🎪 Mini-Games</div>
                  <div className="flex-1 h-px bg-gradient-to-r from-amber-300/60 to-transparent" />
                </div>
                <div className="bg-white/40 backdrop-blur-xl rounded-2xl shadow-xl border-2 border-white/30 border-l-4 border-l-orange-400 p-4 mt-3">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {GAME_HUB.map(g => (
                      <div key={g.id} className="bg-orange-50/80 border border-orange-200 rounded-xl px-3 py-2 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-orange-400 flex-shrink-0" />
                        <span className="text-xs font-semibold text-orange-800 truncate">{g.title}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </div>

      {/* Edit Subject Config Modal */}
      <AnimatePresence>
        {modal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setModal(null)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.92 }} animate={{ scale: 1 }} exit={{ scale: 0.92 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden">
              <div className="bg-gradient-to-r from-game-purple to-game-pink px-6 py-5 flex items-center justify-between">
                <div><h3 className="font-black text-white text-lg">✏️ Edit Database</h3><p className="text-white/70 text-xs">{modal.label}</p></div>
                <button onClick={() => setModal(null)} className="p-1.5 bg-white/20 hover:bg-white/30 rounded-xl"><X className="w-4 h-4 text-white" /></button>
              </div>
              <div className="px-6 py-5 space-y-4">
                <div>
                  <label className="block text-xs font-black text-gray-500 uppercase mb-2">🎮 Bilangan Games</label>
                  <input type="number" min="1" autoFocus value={modal.gamesValue} onChange={e => setModal(m => ({ ...m, gamesValue: e.target.value }))}
                    className="w-full p-3.5 border-2 border-gray-200 rounded-2xl focus:border-game-purple focus:outline-none text-2xl font-black text-center bg-gray-50" />
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-500 uppercase mb-2">📝 Soalan per Game</label>
                  <input type="number" min="1" value={modal.questionsValue} onChange={e => setModal(m => ({ ...m, questionsValue: e.target.value }))}
                    className="w-full p-3.5 border-2 border-gray-200 rounded-2xl focus:border-game-purple focus:outline-none text-2xl font-black text-center bg-gray-50" />
                </div>
              </div>
              <div className="px-6 pb-6 flex gap-3">
                <button onClick={() => setModal(null)} className="flex-1 py-3 rounded-2xl border-2 border-gray-200 text-gray-600 font-bold text-sm">Batal</button>
                <button onClick={handleModalConfirm} className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-game-purple to-game-pink text-white font-bold text-sm shadow-lg">✅ Apply</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Generate Subject Modal */}
      <AnimatePresence>
        {generateModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setGenerateModal(null)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.92 }} animate={{ scale: 1 }} exit={{ scale: 0.92 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden">
              <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-5">
                <h3 className="font-black text-white text-lg">🎮 Generate Games</h3>
                <p className="text-white/70 text-xs">{generateModal.label}</p>
              </div>
              <div className="px-6 py-5 space-y-4">
                <div>
                  <label className="text-xs font-black text-gray-500 uppercase mb-2 block">Target Games</label>
                  <input type="number" min="1" max="100" value={generateModal.games}
                    onChange={e => setGenerateModal(m => ({ ...m, games: parseInt(e.target.value) || 1 }))}
                    className="w-full p-3.5 border-2 border-gray-200 rounded-2xl focus:border-green-400 focus:outline-none text-2xl font-black text-center bg-gray-50" />
                </div>
                <div>
                  <label className="text-xs font-black text-gray-500 uppercase mb-2 block">Soalan per Game</label>
                  <input type="number" min="1" max="50" value={generateModal.questions}
                    onChange={e => setGenerateModal(m => ({ ...m, questions: parseInt(e.target.value) || 1 }))}
                    className="w-full p-3.5 border-2 border-gray-200 rounded-2xl focus:border-green-400 focus:outline-none text-2xl font-black text-center bg-gray-50" />
                </div>
              </div>
              <div className="px-6 pb-6 flex gap-3">
                <button onClick={() => setGenerateModal(null)} className="flex-1 py-3 rounded-2xl border-2 border-gray-200 text-gray-600 font-bold text-sm">Batal</button>
                <button
                  onClick={async () => {
                    setGenerateModal(null);
                    setActionLoading(`gen-${generateModal.ageGroup}-${generateModal.subject}`);
                    showToast(`⏳ Syncing ${generateModal.label}...`, true);
                    try {
                      await base44.functions.invoke('syncSubjectGames', { targetCount: generateModal.games, ageGroup: generateModal.ageGroup, category: generateModal.subject });
                      const dbGames = await base44.entities.Game.filter({ ageGroup: generateModal.ageGroup, category: generateModal.subject, isPublished: true });
                      const needsExpand = dbGames.filter(g => (g.gameData?.questions?.length || 0) < generateModal.questions);
                      for (let i = 0; i < needsExpand.length; i++) {
                        await base44.functions.invoke('syncSubjectGameQuestions', { targetCount: generateModal.questions, ageGroup: generateModal.ageGroup, category: generateModal.subject, gameId: needsExpand[i].id });
                        if (i < needsExpand.length - 1) await new Promise(r => setTimeout(r, 3000));
                      }
                      showToast(`✅ Done! ${generateModal.games} games`);
                      await fetchStats();
                    } catch (err) { showToast('❌ ' + err.message, false); }
                    setActionLoading(null);
                  }}
                  className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold text-sm">
                  ✅ Sync Now
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Game Modal */}
      <AnimatePresence>
        {editGame && <EditGameModal game={editGame} onClose={() => setEditGame(null)} onSaved={() => { showToast('✅ Game disimpan!'); fetchStats(); }} />}
      </AnimatePresence>

      {/* Sync & Edit Modal */}
      <AnimatePresence>
        {syncAndEdit && <SyncAndEditModal games={syncAndEdit.games} subjectLabel={syncAndEdit.label} ageGroup={syncAndEdit.ageGroup} subject={syncAndEdit.subject}
          onClose={() => setSyncAndEdit(null)} onSaved={() => { showToast('✅ Proses selesai!'); fetchStats(); }} />}
      </AnimatePresence>
    </div>
  );
}