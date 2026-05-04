import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Loader2, ChevronDown, ChevronRight, RefreshCw, Edit3, X, Trash2, Wand2, CheckCircle2, Clock, AlertCircle, Search } from 'lucide-react';
import AppHeader from '@/components/AppHeader';
import { gameLibrary } from '@/lib/gameLibrary';
import EditGameModal from '@/components/admin/EditGameModal';
import SyncAndEditModal from '@/components/admin/SyncAndEditModal';
import SubjectCard from '@/components/admin/SubjectCard';
import MiniGamesGenerator from '@/components/admin/MiniGamesGenerator';
import MiniGamesManager from '@/components/admin/MiniGamesManager';

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
  const [miniGamesTab, setMiniGamesTab] = useState('generate');
  const [expandedSections, setExpandedSections] = useState({ prasekolah: true, sekolah_rendah: true });

  // Shared
  const [toast, setToast] = useState(null);
  const showToast = (msg, ok = true) => { setToast({ msg, ok }); setTimeout(() => setToast(null), 4000); };

  // ── GENERATOR TAB STATE ──
  const [genConfig, setGenConfig] = useState({ games: 20, questions: 20 });
  const [selectedSubjects, setSelectedSubjects] = useState(new Set());
  const [tasks, setTasks] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [currentCounts, setCurrentCounts] = useState({}); // { 'prasekolah-bahasa_melayu': { games: 20, questions: 18 } }
  const [loadingCounts, setLoadingCounts] = useState(false);

  const loadCurrentCounts = async () => {
    setLoadingCounts(true);
    try {
      const results = await Promise.all(
        SUBJECT_CONFIG.map(sc => base44.entities.Game.filter({ ageGroup: sc.ageGroup, category: sc.subject, isPublished: true }))
      );
      const counts = {};
      SUBJECT_CONFIG.forEach((sc, i) => {
        const games = results[i] || [];
        const avgQ = games.length > 0
          ? Math.round(games.reduce((sum, g) => sum + (g.gameData?.questions?.length || g.totalQuestions || 0), 0) / games.length)
          : 0;
        counts[`${sc.ageGroup}-${sc.subject}`] = { games: games.length, avgQuestions: avgQ };
      });
      setCurrentCounts(counts);
    } catch {}
    setLoadingCounts(false);
  };

  const loadTasks = async () => {
    setLoadingTasks(true);
    try {
      const data = await base44.entities.GameTask.list('-created_date', 50);
      // Filter out mini game tasks (only show regular game generation tasks)
      const regularTasks = data.filter(t => {
        const miniGameSubjects = ['memory', 'dragdrop', 'wordbuilder', 'sorting', 'tilematch', 'story', 'physics', 'tracing'];
        return !miniGameSubjects.includes(t.subject);
      });
      setTasks(regularTasks);
    } catch {}
    setLoadingTasks(false);
  };

  useEffect(() => {
    if (tab === 'generator') {
      loadTasks();
      loadCurrentCounts();
    }
  }, [tab]);

  // Refresh counts button handler
  const refreshGeneratorCounts = () => loadCurrentCounts();

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
        const curr = currentCounts[subjectKey] || { games: 0, avgQuestions: 0 };
        const gamesToAdd = Math.max(0, genConfig.games - curr.games);
        const questionsToAdd = Math.max(0, genConfig.questions - curr.avgQuestions);
        
        if (gamesToAdd > 0 || questionsToAdd > 0) {
          await base44.entities.GameTask.create({
            taskName: sc?.label || subjectKey,
            ageGroup,
            subject,
            gamesCount: gamesToAdd > 0 ? gamesToAdd : 0,
            questionsPerGame: questionsToAdd > 0 ? questionsToAdd : 0,
            status: 'pending',
          });
        }
      }
      showToast(`✅ ${selectedSubjects.size} tasks dihantar ke queue (smart target)!`);
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
  const [managerSearch, setManagerSearch] = useState('');
  const [managerAgeFilter, setManagerAgeFilter] = useState('all');

  // Mini Games Hub Data
  const [miniGamesData, setMiniGamesData] = useState({});
  const [loadingMiniGames, setLoadingMiniGames] = useState(false);

  const loadMiniGamesData = async () => {
    setLoadingMiniGames(true);
    try {
      const gameIds = ['memory', 'dragdrop', 'wordbuilder', 'sorting', 'tilematch', 'story', 'physics', 'tracing'];
      const results = await Promise.all(
        gameIds.map(id => base44.entities.Game.filter({ category: id, isPublished: true }))
      );
      const data = {};
      gameIds.forEach((id, i) => {
        const games = results[i] || [];
        data[id] = { count: games.length, totalQuestions: games.reduce((sum, g) => sum + (g.gameData?.questions?.length || 0), 0) };
      });
      setMiniGamesData(data);
    } catch (err) {
      showToast('❌ Failed to load mini games data', false);
    }
    setLoadingMiniGames(false);
  };

  useEffect(() => {
    if (tab === 'minigames') loadMiniGamesData();
  }, [tab]);



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
    <div className="min-h-screen pb-32 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #667eea 0%, #f093fb 50%, #f5a623 100%)' }}>
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" />
        <div className="absolute top-1/3 -left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }} />
      </div>
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

      <div className="relative max-w-4xl mx-auto px-3 md:px-4 pt-8 pb-32">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-5 rounded-3xl flex items-center gap-3"
          style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.2)' }}>
          <div className="text-4xl">🎮</div>
          <div>
            <h1 className="text-xl font-black text-white">Game Manager</h1>
            <p className="text-white/60 text-xs">Jana & urus semua permainan CeriaKid</p>
          </div>
          <div className="ml-auto text-right">
            <p className="text-white font-black text-lg">{totalGames}</p>
            <p className="text-white/50 text-xs">total games</p>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 p-1 rounded-2xl overflow-x-auto" style={{ background: 'rgba(255,255,255,0.1)' }}>
          {[
            { id: 'generator', label: '🤖 Gen', labelFull: '🤖 Generator' },
            { id: 'manager', label: '📋 Mgr', labelFull: '📋 Manager' },
            { id: 'minigames', label: '🎯 Mini', labelFull: '🎯 Mini Games Hub' },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${tab === t.id ? 'bg-white text-indigo-700 shadow-lg' : 'text-white/70 hover:text-white'}`}
              title={t.labelFull}>
              <span className="md:hidden">{t.label}</span>
              <span className="hidden md:inline">{t.labelFull}</span>
            </button>
          ))}
        </div>

        {/* ══════════════ GENERATOR TAB ══════════════ */}
        {tab === 'generator' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {/* Config */}
            <div className="p-6 rounded-3xl mb-5" style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.2)' }}>
              <h2 className="font-black text-white mb-4">⚙️ Konfigurasi Generation</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                <div>
                  <label className="text-white/70 text-xs font-black uppercase tracking-wider block mb-2">🎮 Bilangan Games</label>
                  <input type="number" min="1" max="100" value={genConfig.games}
                    onChange={e => setGenConfig(c => ({ ...c, games: parseInt(e.target.value) || 1 }))}
                    className="w-full p-3 rounded-2xl bg-white/10 text-white border border-white/20 font-black text-xl text-center" />
                </div>
                <div>
                  <label className="text-white/70 text-xs font-black uppercase tracking-wider block mb-2">📝 Soalan per Game</label>
                  <input type="number" min="1" max="50" value={genConfig.questions}
                    onChange={e => setGenConfig(c => ({ ...c, questions: parseInt(e.target.value) || 1 }))}
                    className="w-full p-3 rounded-2xl bg-white/10 text-white border border-white/20 font-black text-xl text-center" />
                </div>
              </div>

              {/* Subject selector */}
              <div className="flex items-center justify-between mb-3">
                <p className="text-white/70 text-xs font-black uppercase tracking-wider">Pilih Subjek</p>
                <div className="flex gap-2 items-center">
                  <button onClick={refreshGeneratorCounts} disabled={loadingCounts} className="p-1 rounded-lg bg-white/10 hover:bg-white/20 transition-all" title="Refresh counts">
                    <RefreshCw className={`w-3 h-3 text-white/50 ${loadingCounts ? 'animate-spin' : ''}`} />
                  </button>
                  <button onClick={selectAll} className="text-xs font-bold text-yellow-300 hover:underline">Semua</button>
                  <span className="text-white/30">|</span>
                  <button onClick={selectNone} className="text-xs font-bold text-white/50 hover:underline">Kosong</button>
                </div>
              </div>

              {loadingCounts && (
                <div className="flex items-center gap-2 text-white/40 text-xs mb-3">
                  <Loader2 className="w-3 h-3 animate-spin" /> Memuatkan data semasa...
                </div>
              )}

              <p className="text-white/50 text-xs font-black mb-2">🧒 Prasekolah</p>
              <div className="grid grid-cols-1 gap-2 mb-3">
                {SUBJECT_CONFIG.filter(s => s.ageGroup === 'prasekolah').map(sc => {
                  const key = `${sc.ageGroup}-${sc.subject}`;
                  const sel = selectedSubjects.has(key);
                  const curr = currentCounts[key] || { games: 0, avgQuestions: 0 };
                  const gameDiff = genConfig.games - curr.games;
                  const qDiff = genConfig.questions - curr.avgQuestions;
                  return (
                    <button key={key} onClick={() => toggleSubject(key)}
                      className={`flex items-start gap-2 px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${sel ? 'bg-white text-indigo-700 shadow-lg' : 'bg-white/10 text-white/70 hover:bg-white/20'}`}>
                      <div className={`w-4 h-4 rounded border-2 flex-shrink-0 mt-0.5 flex items-center justify-center ${sel ? 'bg-indigo-600 border-indigo-600' : 'border-white/30'}`}>
                        {sel && <span className="text-white text-xs">✓</span>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="truncate">{sc.label.replace('Prasekolah - ', '')}</p>
                        <div className={`flex gap-2 mt-0.5 text-xs font-semibold ${sel ? 'text-indigo-400' : 'text-white/40'}`}>
                          <span>{curr.games} games</span>
                          <span>·</span>
                          <span>{curr.avgQuestions}Q avg</span>
                          {!loadingCounts && (
                            <span className={`font-black ${gameDiff > 0 ? 'text-green-500' : gameDiff < 0 ? 'text-red-400' : sel ? 'text-indigo-400' : 'text-white/30'}`}>
                              {gameDiff > 0 ? `+${gameDiff}` : gameDiff < 0 ? `${gameDiff}` : '✓'}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              <p className="text-white/50 text-xs font-black mb-2">🎒 Sekolah Rendah</p>
              <div className="grid grid-cols-1 gap-2 mb-5">
                {SUBJECT_CONFIG.filter(s => s.ageGroup === 'sekolah_rendah').map(sc => {
                  const key = `${sc.ageGroup}-${sc.subject}`;
                  const sel = selectedSubjects.has(key);
                  const curr = currentCounts[key] || { games: 0, avgQuestions: 0 };
                  const gameDiff = genConfig.games - curr.games;
                  return (
                    <button key={key} onClick={() => toggleSubject(key)}
                      className={`flex items-start gap-2 px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${sel ? 'bg-white text-indigo-700 shadow-lg' : 'bg-white/10 text-white/70 hover:bg-white/20'}`}>
                      <div className={`w-4 h-4 rounded border-2 flex-shrink-0 mt-0.5 flex items-center justify-center ${sel ? 'bg-indigo-600 border-indigo-600' : 'border-white/30'}`}>
                        {sel && <span className="text-white text-xs">✓</span>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="truncate">{sc.label.replace('Sekolah Rendah - ', '')}</p>
                        <div className={`flex gap-2 mt-0.5 text-xs font-semibold ${sel ? 'text-indigo-400' : 'text-white/40'}`}>
                          <span>{curr.games} games</span>
                          <span>·</span>
                          <span>{curr.avgQuestions}Q avg</span>
                          {!loadingCounts && (
                            <span className={`font-black ${gameDiff > 0 ? 'text-green-500' : gameDiff < 0 ? 'text-red-400' : sel ? 'text-indigo-400' : 'text-white/30'}`}>
                              {gameDiff > 0 ? `+${gameDiff}` : gameDiff < 0 ? `${gameDiff}` : '✓'}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {selectedSubjects.size > 0 && (
                <div className="mb-3 p-3 rounded-2xl bg-white/10 space-y-1">
                  {Array.from(selectedSubjects).map(key => {
                    const sc = SUBJECT_CONFIG.find(s => `${s.ageGroup}-${s.subject}` === key);
                    const curr = currentCounts[key] || { games: 0, avgQuestions: 0 };
                    const gameDiff = genConfig.games - curr.games;
                    const qDiff = genConfig.questions - curr.avgQuestions;
                    return (
                      <div key={key} className="flex items-center justify-between text-xs">
                        <span className="text-white/70 font-semibold truncate">{sc?.label}</span>
                        <div className="flex gap-2 flex-shrink-0 ml-2">
                          <span className={`font-black ${gameDiff > 0 ? 'text-green-300' : gameDiff < 0 ? 'text-red-300' : 'text-white/40'}`}>
                            {gameDiff > 0 ? `+${gameDiff} games` : gameDiff < 0 ? `${gameDiff} games` : 'games ✓'}
                          </span>
                          <span className={`font-black ${qDiff > 0 ? 'text-blue-300' : qDiff < 0 ? 'text-orange-300' : 'text-white/40'}`}>
                            {qDiff > 0 ? `+${qDiff}Q` : qDiff < 0 ? `${qDiff}Q` : 'Q ✓'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                onClick={handleQueueGeneration}
                disabled={submitting || selectedSubjects.size === 0}
                className="w-full py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-xl disabled:opacity-50">
                {submitting ? <><Loader2 className="w-5 h-5 animate-spin" /> Menghantar ke queue...</> : <><Wand2 className="w-5 h-5" /> Queue Generation ({selectedSubjects.size} subjek)</>}
              </motion.button>
              <p className="text-white/40 text-xs text-center mt-2">✅ Tasks diproses otomatik setiap 5 minit. Boleh tutup browser.</p>
            </div>

            {/* Task Queue */}
            <div className="p-6 rounded-3xl" style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.2)' }}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-black text-white">📋 Task Queue</h2>
                <div className="flex gap-2 items-center">
                  {pendingTasks.length > 0 && (
                    <button onClick={handleDeleteAllPending} className="text-xs font-bold text-red-300 hover:underline">Padam Pending</button>
                  )}
                  <button onClick={loadTasks} className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg transition-all">
                    <RefreshCw className={`w-4 h-4 text-white/70 ${loadingTasks ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-4 gap-2 mb-4">
                {[
                  { label: 'Pending', value: pendingTasks.length, color: 'text-yellow-300' },
                  { label: 'Running', value: runningTasks.length, color: 'text-blue-300' },
                  { label: 'Done', value: completedTasks.length, color: 'text-green-300' },
                  { label: 'Failed', value: failedTasks.length, color: 'text-red-300' },
                ].map(s => (
                  <div key={s.label} className="bg-white/10 rounded-xl p-2 text-center">
                    <p className={`font-black text-lg ${s.color}`}>{s.value}</p>
                    <p className="text-xs text-white/50 font-semibold">{s.label}</p>
                  </div>
                ))}
              </div>

              {loadingTasks ? (
                <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-white" /></div>
              ) : tasks.length === 0 ? (
                <div className="text-center py-8 text-white/40">
                  <p className="text-3xl mb-2">📭</p>
                  <p className="text-sm font-semibold">Tiada tasks dalam queue</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {tasks.map(task => {
                    const sc = statusConfig[task.status] || statusConfig.pending;
                    return (
                      <div key={task.id} className="flex items-center gap-3 rounded-xl px-3 py-2.5" style={{ background: 'rgba(255,255,255,0.08)' }}>
                        <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${sc.color}`}>
                          {sc.icon} {task.status}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-white truncate">{task.taskName}</p>
                          <p className="text-xs text-white/40">{task.gamesCount} games · {task.questionsPerGame} soalan
                            {task.createdGames > 0 && <span className="text-green-300 font-bold"> · {task.createdGames} dibuat</span>}
                          </p>
                        </div>
                        {task.status === 'pending' && (
                          <button onClick={() => handleDeleteTask(task.id)} className="p-1 text-red-300 hover:text-red-400 transition-all">
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

            {/* ══════════════ MINI GAMES HUB TAB ══════════════ */}
          {tab === 'minigames' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {/* Status Section */}
            <div className="p-6 rounded-3xl mb-5" style={{ background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(236, 72, 153, 0.15) 100%)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.25)' }}>
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="font-black text-white text-lg">🎮 Mini Games Status</h2>
                  <p className="text-white/50 text-xs mt-0.5">Lihat bilangan games untuk setiap mini game</p>
                </div>
                <button onClick={loadMiniGamesData} disabled={loadingMiniGames} className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all">
                  <RefreshCw className={`w-4 h-4 text-white/70 ${loadingMiniGames ? 'animate-spin' : ''}`} />
                </button>
              </div>

              {loadingMiniGames ? (
                <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-white" /></div>
              ) : (
                <>
                  {/* Mobile carousel */}
                  <div className="sm:hidden flex gap-3 overflow-x-auto pb-2 -mx-4 px-4">
                    {['memory', 'dragdrop', 'wordbuilder', 'sorting', 'tilematch', 'story', 'physics', 'tracing'].map(gameId => {
                      const data = miniGamesData[gameId] || { count: 0, totalQuestions: 0 };
                      const shortNames = { memory: '🧠', dragdrop: '🎯', wordbuilder: '📝', sorting: '🔄', tilematch: '🎮', story: '📖', physics: '⚡', tracing: '✏️' };
                      const colors = { memory: 'from-purple-400 to-purple-500', dragdrop: 'from-blue-400 to-blue-500', wordbuilder: 'from-pink-400 to-pink-500', sorting: 'from-green-400 to-green-500', tilematch: 'from-yellow-400 to-yellow-500', story: 'from-red-400 to-red-500', physics: 'from-indigo-400 to-indigo-500', tracing: 'from-cyan-400 to-cyan-500' };
                      return (
                        <div key={gameId} className={`bg-gradient-to-br ${colors[gameId]} rounded-2xl p-3 text-center flex-shrink-0 w-24 shadow-lg`}>
                          <p className="text-white font-black text-xl mb-1">{shortNames[gameId]}</p>
                          <p className="text-white text-lg font-black">{data.count}</p>
                          <p className="text-white/80 text-xs font-semibold">games</p>
                        </div>
                      );
                    })}
                  </div>
                  {/* Desktop grid */}
                  <div className="hidden sm:grid sm:grid-cols-4 gap-3">
                    {['memory', 'dragdrop', 'wordbuilder', 'sorting', 'tilematch', 'story', 'physics', 'tracing'].map(gameId => {
                      const data = miniGamesData[gameId] || { count: 0, totalQuestions: 0 };
                      const gameNames = { memory: '🧠 Memory', dragdrop: '🎯 Drag&Drop', wordbuilder: '📝 Word', sorting: '🔄 Sort', tilematch: '🎮 Tile', story: '📖 Story', physics: '⚡ Physics', tracing: '✏️ Tracing' };
                      const colors = { memory: 'from-purple-400 to-purple-500', dragdrop: 'from-blue-400 to-blue-500', wordbuilder: 'from-pink-400 to-pink-500', sorting: 'from-green-400 to-green-500', tilematch: 'from-yellow-400 to-yellow-500', story: 'from-red-400 to-red-500', physics: 'from-indigo-400 to-indigo-500', tracing: 'from-cyan-400 to-cyan-500' };
                      return (
                        <div key={gameId} className={`bg-gradient-to-br ${colors[gameId]} rounded-2xl p-4 text-center shadow-lg hover:shadow-xl transition-all`}>
                          <p className="text-white font-black text-sm mb-2">{gameNames[gameId]}</p>
                          <p className="text-white text-2xl font-black">{data.count}</p>
                          <p className="text-white/80 text-xs font-semibold">games</p>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
              )
            </div>

            {/* Mini Games Sub-tabs */}
            <div className="flex gap-2 mb-6 p-1 rounded-2xl overflow-x-auto" style={{ background: 'rgba(255,255,255,0.1)' }}>
              {[
                { id: 'generate', label: '🤖 Generate' },
                { id: 'manage', label: '📋 Manage' },
              ].map(t => (
                <button key={t.id} onClick={() => setMiniGamesTab(t.id)}
                  className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-all ${miniGamesTab === t.id ? 'bg-white text-indigo-700 shadow-lg' : 'text-white/70 hover:text-white'}`}>
                  {t.label}
                </button>
              ))}
            </div>

            {miniGamesTab === 'generate' && <MiniGamesGenerator onToast={showToast} />}
            {miniGamesTab === 'manage' && <MiniGamesManager onToast={showToast} />}
            </motion.div>
            )}

            {/* ══════════════ MANAGER TAB ══════════════ */}
            {tab === 'manager' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {/* Stats row */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
              {[
                { value: totalGames, label: 'Total Games', color: 'text-yellow-300' },
                { value: totalFull, label: 'Soalan Penuh', color: 'text-green-300' },
                { value: totalPlayers, label: 'Players', color: 'text-pink-300' },
              ].map(({ value, label, color }) => (
                <div key={label} className="rounded-2xl p-3 text-center" style={{ background: 'rgba(255,255,255,0.1)' }}>
                  <p className={`text-2xl font-black ${color}`}>{value}</p>
                  <p className="text-xs text-white/50 font-semibold">{label}</p>
                </div>
              ))}
            </div>

            {/* Search + Filter bar */}
            <div className="p-4 rounded-3xl mb-4" style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.2)' }}>
              <div className="flex gap-2 mb-3">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 text-sm">🔍</span>
                  <input
                    type="text"
                    placeholder="Cari..."
                    value={managerSearch}
                    onChange={e => setManagerSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 rounded-2xl bg-white/10 text-white placeholder-white/30 border border-white/20 text-sm font-semibold outline-none focus:border-white/50"
                  />
                </div>
                <button onClick={fetchStats} disabled={loading} className="p-2.5 bg-white/10 hover:bg-white/20 rounded-2xl border border-white/20 transition-all flex-shrink-0">
                  <RefreshCw className={`w-4 h-4 text-white/70 ${loading ? 'animate-spin' : ''}`} />
                </button>
              </div>
              <div className="flex gap-2 flex-wrap items-center justify-between">
                <div className="flex gap-2 flex-wrap">
                  {['all', 'prasekolah', 'sekolah_rendah'].map(ag => (
                    <button key={ag} onClick={() => setManagerAgeFilter(ag)}
                      className={`px-2 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${managerAgeFilter === ag ? 'bg-white text-indigo-700' : 'bg-white/10 text-white/60 hover:bg-white/20'}`}>
                      {ag === 'all' ? 'Semua' : ag === 'prasekolah' ? '🧒' : '🎒'}
                      <span className="hidden sm:inline ml-1">{ag === 'all' ? 'Semua' : ag === 'prasekolah' ? 'Prasekolah' : 'SR'}</span>
                    </button>
                  ))}
                </div>
                <button
                  onClick={async () => {
                    if (!window.confirm('🚨 DELETE semua games?')) return;
                    setActionLoading('delete-all');
                    try {
                      const res = await base44.functions.invoke('deleteAllGames', {});
                      showToast(`✅ Deleted ${res.data.deletedCount} games`);
                      await fetchStats();
                    } catch (err) { showToast('❌ ' + err.message, false); }
                    setActionLoading(null);
                  }}
                  disabled={!!actionLoading}
                  className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 bg-red-500/20 text-red-300 border border-red-400/30 rounded-xl text-xs font-bold hover:bg-red-500/30 transition-all flex-shrink-0">
                  {actionLoading === 'delete-all' ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                  <span className="hidden sm:inline">Delete All</span>
                </button>
              </div>
            </div>

            {/* Games list grouped by subject */}
            {loading ? (
              <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-white" /></div>
            ) : (
              <div className="space-y-5">
                {/* Prasekolah Section */}
                {(managerAgeFilter === 'all' || managerAgeFilter === 'prasekolah') && (
                  <div>
                    <button
                      onClick={() => setExpandedSections(prev => ({ ...prev, prasekolah: !prev.prasekolah }))}
                      className="w-full flex items-center gap-3 px-2 py-2.5 hover:bg-white/5 rounded-xl transition-all text-left mb-3"
                    >
                      <span className="text-xs font-black uppercase tracking-wider text-white/70">🧒 Prasekolah</span>
                      <span className="ml-auto">
                        {expandedSections.prasekolah
                          ? <ChevronDown className="w-4 h-4 text-white/50" />
                          : <ChevronRight className="w-4 h-4 text-white/50" />
                        }
                      </span>
                    </button>
                    {expandedSections.prasekolah && (
                      <div className="space-y-3">
                        {subjects
                          .filter(s => s.ageGroup === 'prasekolah')
                          .map((s, idx) => {
                    const filteredGames = s.games.filter(g =>
                      !managerSearch || g.title.toLowerCase().includes(managerSearch.toLowerCase())
                    );
                    if (filteredGames.length === 0 && managerSearch) return null;
                    return (
                      <motion.div key={s.file} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }} className="rounded-3xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }}>
                        {/* Subject header */}
                        <button
                          onClick={() => setExpandedFile(expandedFile === s.file ? null : s.file)}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-all text-left"
                        >
                          <div className={`w-2.5 h-2.5 rounded-full ${s.color.dot}`} />
                          <span className="font-black text-white text-sm flex-1">{s.label}</span>
                          <span className="text-white/40 text-xs font-semibold">{s.totalGames} games</span>
                          {expandedFile === s.file
                            ? <ChevronDown className="w-4 h-4 text-white/40" />
                            : <ChevronRight className="w-4 h-4 text-white/40" />
                          }
                        </button>

                        {/* Games list */}
                        {expandedFile === s.file && (
                          <div className="border-t border-white/10">
                            {filteredGames.length === 0 ? (
                              <p className="text-white/30 text-xs text-center py-4">Tiada games lagi</p>
                            ) : (
                              filteredGames.map(g => (
                                <div key={g.id} className="flex items-center gap-3 px-4 py-3 border-b border-white/5 last:border-0 hover:bg-white/5 transition-all">
                                  <div className="flex-1 min-w-0">
                                    <p className="text-white text-xs font-bold truncate">{g.title}</p>
                                    <div className="flex gap-2 mt-0.5">
                                      <span className="text-white/40 text-xs">{g.type}</span>
                                      <span className={`text-xs font-bold ${g.questionCount >= QUESTION_THRESHOLD ? 'text-green-400' : 'text-yellow-400'}`}>
                                        {g.questionCount} soalan
                                      </span>
                                      {g.players > 0 && <span className="text-white/30 text-xs">{g.players} players</span>}
                                    </div>
                                  </div>
                                  <button
                                    onClick={() => setEditGame(g._raw)}
                                    className="p-1.5 rounded-lg bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 transition-all"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              ))
                            )}
                            {/* Subject-level actions */}
                            <div className="flex gap-2 px-4 py-3 border-t border-white/10">
                              <button
                                onClick={() => setGenerateModal({ games: s.totalGames || 5, questions: 20, ageGroup: s.ageGroup, subject: s.subject, label: s.label, currentCount: s.totalGames })}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-green-500/20 text-green-300 border border-green-400/20 text-xs font-bold hover:bg-green-500/30 transition-all"
                              >
                                <Wand2 className="w-3 h-3" /> Sync Games
                              </button>
                              <button
                                onClick={() => handleVerifySubject(s.file, s.label, s.ageGroup, s.subject, dbGamesCache)}
                                disabled={actionLoading === `verify-${s.file}`}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-yellow-500/20 text-yellow-300 border border-yellow-400/20 text-xs font-bold hover:bg-yellow-500/30 disabled:opacity-50 transition-all"
                              >
                                {actionLoading === `verify-${s.file}` ? <Loader2 className="w-3 h-3 animate-spin" /> : '✅'} Verify
                              </button>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                      </div>
                    )}
                  </div>
                )}

                {/* Sekolah Rendah Section */}
                {(managerAgeFilter === 'all' || managerAgeFilter === 'sekolah_rendah') && (
                  <div>
                    <button
                      onClick={() => setExpandedSections(prev => ({ ...prev, sekolah_rendah: !prev.sekolah_rendah }))}
                      className="w-full flex items-center gap-3 px-2 py-2.5 hover:bg-white/5 rounded-xl transition-all text-left mb-3"
                    >
                      <span className="text-xs font-black uppercase tracking-wider text-white/70">🎒 Sekolah Rendah</span>
                      <span className="ml-auto">
                        {expandedSections.sekolah_rendah
                          ? <ChevronDown className="w-4 h-4 text-white/50" />
                          : <ChevronRight className="w-4 h-4 text-white/50" />
                        }
                      </span>
                    </button>
                    {expandedSections.sekolah_rendah && (
                      <div className="space-y-3">
                        {subjects
                          .filter(s => s.ageGroup === 'sekolah_rendah')
                          .map((s, idx) => {
                    const filteredGames = s.games.filter(g =>
                      !managerSearch || g.title.toLowerCase().includes(managerSearch.toLowerCase())
                    );
                    if (filteredGames.length === 0 && managerSearch) return null;
                    return (
                      <motion.div key={s.file} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }} className="rounded-3xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }}>
                        {/* Subject header */}
                        <button
                          onClick={() => setExpandedFile(expandedFile === s.file ? null : s.file)}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-all text-left"
                        >
                          <div className={`w-2.5 h-2.5 rounded-full ${s.color.dot}`} />
                          <span className="font-black text-white text-sm flex-1">{s.label}</span>
                          <span className="text-white/40 text-xs font-semibold">{s.totalGames} games</span>
                          {expandedFile === s.file
                            ? <ChevronDown className="w-4 h-4 text-white/40" />
                            : <ChevronRight className="w-4 h-4 text-white/40" />
                          }
                        </button>

                        {/* Games list */}
                        {expandedFile === s.file && (
                          <div className="border-t border-white/10">
                            {filteredGames.length === 0 ? (
                              <p className="text-white/30 text-xs text-center py-4">Tiada games lagi</p>
                            ) : (
                              filteredGames.map(g => (
                                <div key={g.id} className="flex items-center gap-3 px-4 py-3 border-b border-white/5 last:border-0 hover:bg-white/5 transition-all">
                                  <div className="flex-1 min-w-0">
                                    <p className="text-white text-xs font-bold truncate">{g.title}</p>
                                    <div className="flex gap-2 mt-0.5">
                                      <span className="text-white/40 text-xs">{g.type}</span>
                                      <span className={`text-xs font-bold ${g.questionCount >= QUESTION_THRESHOLD ? 'text-green-400' : 'text-yellow-400'}`}>
                                        {g.questionCount} soalan
                                      </span>
                                      {g.players > 0 && <span className="text-white/30 text-xs">{g.players} players</span>}
                                    </div>
                                  </div>
                                  <button
                                    onClick={() => setEditGame(g._raw)}
                                    className="p-1.5 rounded-lg bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 transition-all"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              ))
                            )}
                            {/* Subject-level actions */}
                            <div className="flex gap-2 px-4 py-3 border-t border-white/10">
                              <button
                                onClick={() => setGenerateModal({ games: s.totalGames || 5, questions: 20, ageGroup: s.ageGroup, subject: s.subject, label: s.label, currentCount: s.totalGames })}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-green-500/20 text-green-300 border border-green-400/20 text-xs font-bold hover:bg-green-500/30 transition-all"
                              >
                                <Wand2 className="w-3 h-3" /> Sync Games
                              </button>
                              <button
                                onClick={() => handleVerifySubject(s.file, s.label, s.ageGroup, s.subject, dbGamesCache)}
                                disabled={actionLoading === `verify-${s.file}`}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-yellow-500/20 text-yellow-300 border border-yellow-400/20 text-xs font-bold hover:bg-yellow-500/30 disabled:opacity-50 transition-all"
                              >
                                {actionLoading === `verify-${s.file}` ? <Loader2 className="w-3 h-3 animate-spin" /> : '✅'} Verify
                              </button>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                      </div>
                    )}
                  </div>
                )}
              </div>
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