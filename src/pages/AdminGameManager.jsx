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
import MonthlyGenSettings from '@/components/admin/MonthlyGenSettings';
import StoryKidGenerator from '@/components/admin/StoryKidGenerator';
import StoryKidManager from '@/components/admin/StoryKidManager';
import BBMGeneratorManager from '@/components/admin/BBMGeneratorManager';
import MasterTaskQueue from '@/components/admin/MasterTaskQueue';
import ProductionSafetyChecklist from '@/components/admin/ProductionSafetyChecklist';
import { MINI_GAME_CATEGORIES } from '@/lib/miniGameBlueprints';

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

export default function AdminGameManager() {
  const [tab, setTab] = useState('generator');
  const [miniGamesTab, setMiniGamesTab] = useState('generate');
  const [storyKidTab, setStoryKidTab] = useState('generate');
  const [expandedSections, setExpandedSections] = useState({ prasekolah: true, sekolah_rendah: true });

  // Shared
  const [toast, setToast] = useState(null);
  const showToast = (msg, ok = true) => { setToast({ msg, ok }); setTimeout(() => setToast(null), 4000); };

  // ── GENERATOR TAB STATE ──
  const [genConfig, setGenConfig] = useState({ games: 20, questions: 20 });
  const [darjahGameConfig, setDarjahGameConfig] = useState({
    darjah_1: 20,
    darjah_2: 20,
    darjah_3: 20,
    darjah_4: 20,
    darjah_5: 20,
    darjah_6: 20,
  });
  const [categoryGameConfig, setCategoryGameConfig] = useState(() =>
    Object.fromEntries(SUBJECT_CONFIG.map(sc => [`${sc.ageGroup}-${sc.subject}`, 20]))
  );
  const [categoryQuestionConfig, setCategoryQuestionConfig] = useState(() =>
    Object.fromEntries(SUBJECT_CONFIG.map(sc => [`${sc.ageGroup}-${sc.subject}`, 20]))
  );
  const [darjahSubjectGameConfig, setDarjahSubjectGameConfig] = useState(() =>
    Object.fromEntries(SUBJECT_CONFIG.filter(sc => sc.ageGroup === 'sekolah_rendah').flatMap(sc =>
      ['darjah_1', 'darjah_2', 'darjah_3', 'darjah_4', 'darjah_5', 'darjah_6'].map(darjah => [`${sc.ageGroup}-${sc.subject}-${darjah}`, 20])
    ))
  );
  const [darjahSubjectQuestionConfig, setDarjahSubjectQuestionConfig] = useState(() =>
    Object.fromEntries(SUBJECT_CONFIG.filter(sc => sc.ageGroup === 'sekolah_rendah').flatMap(sc =>
      ['darjah_1', 'darjah_2', 'darjah_3', 'darjah_4', 'darjah_5', 'darjah_6'].map(darjah => [`${sc.ageGroup}-${sc.subject}-${darjah}`, 20])
    ))
  );
  const [prasekolahMaster, setPrasekolahMaster] = useState({ games: 20, questions: 20 });
  const [sekolahRendahMaster, setSekolahRendahMaster] = useState({ games: 20, questions: 20 });
  const [selectedSubjects, setSelectedSubjects] = useState(new Set());
  const [tasks, setTasks] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [currentCounts, setCurrentCounts] = useState({}); // { 'prasekolah-bahasa_melayu': { games: 20, questions: 18 } }
  const [loadingCounts, setLoadingCounts] = useState(false);

  const loadCurrentCounts = async () => {
    setLoadingCounts(true);
    try {
      const res = await base44.functions.invoke('getGameManagerCounts', {});
      setCurrentCounts(res.data?.subjectCounts || {});
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

  const applyPrasekolahMaster = () => {
    const keys = SUBJECT_CONFIG.filter(sc => sc.ageGroup === 'prasekolah').map(sc => `${sc.ageGroup}-${sc.subject}`);
    setCategoryGameConfig(prev => ({ ...prev, ...Object.fromEntries(keys.map(key => [key, prasekolahMaster.games])) }));
    setCategoryQuestionConfig(prev => ({ ...prev, ...Object.fromEntries(keys.map(key => [key, prasekolahMaster.questions])) }));
    showToast('✅ Master Prasekolah digunakan');
  };

  const applySekolahRendahMaster = () => {
    const darjahLevels = ['darjah_1', 'darjah_2', 'darjah_3', 'darjah_4', 'darjah_5', 'darjah_6'];
    const keys = SUBJECT_CONFIG.filter(sc => sc.ageGroup === 'sekolah_rendah').flatMap(sc =>
      darjahLevels.map(darjah => `${sc.ageGroup}-${sc.subject}-${darjah}`)
    );
    setDarjahSubjectGameConfig(prev => ({ ...prev, ...Object.fromEntries(keys.map(key => [key, sekolahRendahMaster.games])) }));
    setDarjahSubjectQuestionConfig(prev => ({ ...prev, ...Object.fromEntries(keys.map(key => [key, sekolahRendahMaster.questions])) }));
    showToast('✅ Master Sekolah Rendah digunakan');
  };

  const handleQueueGeneration = async () => {
    if (selectedSubjects.size === 0) { showToast('Pilih sekurang-kurangnya satu subjek', false); return; }
    setSubmitting(true);
    try {
      const darjahLevels = ['darjah_1', 'darjah_2', 'darjah_3', 'darjah_4', 'darjah_5', 'darjah_6'];
      const darjahLabels = { darjah_1: 'Darjah 1', darjah_2: 'Darjah 2', darjah_3: 'Darjah 3', darjah_4: 'Darjah 4', darjah_5: 'Darjah 5', darjah_6: 'Darjah 6' };

      let queuedCount = 0;

      for (const subjectKey of Array.from(selectedSubjects)) {
        const [ageGroup, ...rest] = subjectKey.split('-');
        const subject = rest.join('-');
        const sc = SUBJECT_CONFIG.find(s => s.ageGroup === ageGroup && s.subject === subject);
        const levelsToQueue = ageGroup === 'sekolah_rendah' ? darjahLevels : [null];

        for (const darjah of levelsToQueue) {
          const curr = darjah
            ? (currentCounts[subjectKey]?.darjah?.[darjah] || { games: 0, avgQuestions: 0 })
            : (currentCounts[subjectKey] || { games: 0, avgQuestions: 0 });

          const darjahKey = darjah ? `${subjectKey}-${darjah}` : subjectKey;
          const targetGames = darjah ? (darjahSubjectGameConfig[darjahKey] || 0) : (categoryGameConfig[subjectKey] || 0);
          const targetQuestions = darjah ? (darjahSubjectQuestionConfig[darjahKey] || 0) : (categoryQuestionConfig[subjectKey] || 0);
          const questionsToAdd = Math.max(0, targetQuestions - curr.avgQuestions);
          const gamesToAdd = Math.max(0, targetGames - curr.games);

          if (questionsToAdd > 0 || gamesToAdd > 0) {
            await base44.entities.GameTask.create({
              taskName: `${sc?.label || subjectKey}${darjah ? ` - ${darjahLabels[darjah]}` : ''}`,
              ageGroup,
              ...(darjah ? { darjah } : {}),
              subject,
              gamesCount: gamesToAdd,
              questionsPerGame: targetQuestions,
              status: 'pending',
            });
            queuedCount++;
          }
        }
      }

      if (queuedCount === 0) {
        showToast('Semua subjek/darjah sudah capai target. Naikkan jumlah games atau soalan.', false);
        setSubmitting(false);
        return;
      }

      showToast(`✅ ${queuedCount} task dihantar ke queue!`);
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
    const pending = tasks.filter(t => t.status === 'pending');
    if (pending.length === 0) { showToast('Tiada pending task untuk dipadam', false); return; }
    if (!window.confirm('Padam semua pending tasks?')) return;
    for (const t of pending) await base44.entities.GameTask.delete(t.id);
    loadTasks();
    showToast(`✅ ${pending.length} tasks dipadam`);
  };

  const handleDeleteAllCompleted = async () => {
    const completed = tasks.filter(t => t.status === 'completed');
    if (completed.length === 0) { showToast('Tiada completed task untuk dipadam', false); return; }
    if (!window.confirm('Padam semua completed tasks?')) return;
    for (const t of completed) await base44.entities.GameTask.delete(t.id);
    loadTasks();
    showToast(`✅ ${completed.length} completed tasks dipadam`);
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
      const res = await base44.functions.invoke('getGameManagerCounts', {});
      setMiniGamesData(res.data?.miniCounts || {});
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
    <div className="min-h-screen pb-32 relative overflow-hidden bg-gradient-to-br from-slate-950 via-indigo-950 to-fuchsia-950">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.12) 1px, transparent 0)', backgroundSize: '28px 28px' }} />
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-fuchsia-500 rounded-full mix-blend-screen filter blur-3xl opacity-25 animate-pulse" />
        <div className="absolute top-1/3 -left-20 w-80 h-80 bg-blue-500 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-violet-500 rounded-full mix-blend-screen filter blur-3xl opacity-15 animate-pulse" style={{ animationDelay: '2s' }} />
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

      <div className="relative max-w-6xl mx-auto px-3 sm:px-4 md:px-6 pt-28 md:pt-32 pb-32 space-y-7">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          className="mb-7 p-5 md:p-7 rounded-[2rem] flex flex-col md:flex-row md:items-center md:justify-between gap-5 shadow-2xl shadow-fuchsia-950/30"
          style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.18), rgba(255,255,255,0.07))', backdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.25)' }}>
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-14 h-14 md:w-16 md:h-16 flex-shrink-0 rounded-3xl bg-gradient-to-br from-yellow-300 via-orange-400 to-pink-500 flex items-center justify-center text-2xl md:text-3xl shadow-xl shadow-purple-950/30 ring-1 ring-white/30 leading-none">🎮</div>
            <div className="min-w-0">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-white/70 text-[11px] font-black uppercase tracking-wider mb-2">Admin Content Studio</div>
              <h1 className="text-2xl md:text-4xl font-black text-white tracking-tight">Master Generator</h1>
              <p className="text-white/75 text-sm">Satu tempat untuk jana, urus dan pantau Games, BBM dan Story Kid.</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 w-full md:w-auto md:min-w-80">
            <div className="rounded-2xl bg-white/10 border border-white/15 p-3 text-center"><p className="text-white font-black text-lg">{totalGames}</p><p className="text-white/60 text-[11px] font-bold">Games</p></div>
            <div className="rounded-2xl bg-white/10 border border-white/15 p-3 text-center"><p className="text-white font-black text-lg">{totalFull}</p><p className="text-white/60 text-[11px] font-bold">Penuh</p></div>
            <div className="rounded-2xl bg-white/10 border border-white/15 p-3 text-center"><p className="text-white font-black text-lg">{totalPlayers}</p><p className="text-white/60 text-[11px] font-bold">Players</p></div>
          </div>
        </motion.div>

        <ProductionSafetyChecklist />

        {/* Main Tabs */}
        <div className="flex gap-2 mb-4 p-2 rounded-[1.75rem] sm:rounded-3xl overflow-x-auto shadow-xl shadow-black/10 snap-x scroll-px-2" style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(18px)', border: '1px solid rgba(255,255,255,0.16)', WebkitOverflowScrolling: 'touch' }}>
          {[
            { id: 'subject', label: '🎮 Games', labelFull: '🎮 Games' },
            { id: 'minigames', label: '🎯 Mini', labelFull: '🎯 Mini Games' },
            { id: 'bbm', label: '📚 BBM', labelFull: '📚 BBM' },
            { id: 'storykid', label: '📖 Story', labelFull: '📖 Story Kid' },
          ].map(t => {
            const isSubjectActive = t.id === 'subject' && ['generator', 'manager', 'monthly'].includes(tab);
            const isActiveTab = tab === t.id || isSubjectActive;
            return (
              <button key={t.id} onClick={() => setTab(t.id === 'subject' ? 'generator' : t.id)}
                className={`flex-none min-w-[7.5rem] sm:min-w-[9rem] md:flex-1 py-3.5 px-4 rounded-2xl font-black text-xs md:text-sm transition-all whitespace-nowrap snap-start ${isActiveTab ? 'bg-white text-indigo-800 shadow-lg' : 'text-white/80 hover:text-white hover:bg-white/10'}`}
                title={t.labelFull}>
                <span className="md:hidden">{t.label}</span>
                <span className="hidden md:inline">{t.labelFull}</span>
              </button>
            );
          })}
        </div>

        {['generator', 'manager', 'monthly'].includes(tab) && (
          <div className="flex gap-2 mb-6 p-2 rounded-[1.5rem] overflow-x-auto shadow-lg shadow-black/10" style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(18px)', border: '1px solid rgba(255,255,255,0.12)', WebkitOverflowScrolling: 'touch' }}>
            {[
              { id: 'generator', label: '🤖 Generate' },
              { id: 'manager', label: '📋 Manage' },
              { id: 'monthly', label: '📅 Monthly' },
            ].map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`flex-1 min-w-[8rem] py-3 px-4 rounded-2xl font-black text-xs md:text-sm transition-all whitespace-nowrap ${tab === t.id ? 'bg-white text-indigo-800 shadow-lg' : 'text-white/75 hover:text-white hover:bg-white/10'}`}>
                {t.label}
              </button>
            ))}
          </div>
        )}

        {/* ══════════════ GENERATOR TAB ══════════════ */}
        {tab === 'generator' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {/* Config */}
            <div className="p-5 md:p-7 rounded-[2rem] mb-6 shadow-2xl shadow-black/20" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.16), rgba(255,255,255,0.07))', backdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.22)' }}>
              <div className="mb-5">
                <h2 className="font-black text-white text-xl md:text-2xl">⚙️ Konfigurasi Generation</h2>
                <p className="text-white/60 text-xs font-semibold mt-1">Tetapkan target game dan soalan sebelum masuk queue.</p>
              </div>
              {/* Subject selector */}
              <div className="mb-5 rounded-3xl bg-white/10 border border-white/10 p-4">
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div>
                    <p className="text-white font-black text-sm">2. Pilih Subjek</p>
                    <p className="text-white/50 text-xs">Klik subjek yang nak dimasukkan ke queue.</p>
                  </div>
                  <div className="flex gap-2 items-center flex-shrink-0">
                    <button onClick={refreshGeneratorCounts} disabled={loadingCounts} className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all" title="Refresh counts">
                      <RefreshCw className={`w-4 h-4 text-white/60 ${loadingCounts ? 'animate-spin' : ''}`} />
                    </button>
                    <button onClick={selectAll} className="px-3 py-2 rounded-xl bg-yellow-300 text-yellow-950 text-xs font-black">Semua</button>
                    <button onClick={selectNone} className="px-3 py-2 rounded-xl bg-white/10 text-white/70 text-xs font-black">Kosong</button>
                  </div>
                </div>

                {loadingCounts && (
                  <div className="flex items-center gap-2 text-white/45 text-xs mb-3">
                    <Loader2 className="w-3 h-3 animate-spin" /> Memuatkan data semasa...
                  </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-white/10 border border-white/10 p-3">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-white font-black text-sm">🧒 Prasekolah</p>
                    </div>
                    <div className="mb-3 rounded-2xl bg-white/10 border border-white/10 p-3">
                      <p className="text-white/60 text-[10px] font-black uppercase mb-2">Master Prasekolah</p>
                      <div className="grid grid-cols-2 gap-2 mb-2">
                        <input type="number" min="0" max="100" value={prasekolahMaster.games} onChange={e => setPrasekolahMaster(m => ({ ...m, games: parseInt(e.target.value) || 0 }))} className="w-full px-2 py-2 rounded-xl bg-white/10 border border-white/15 text-white font-black text-center outline-none" placeholder="Games" />
                        <input type="number" min="1" max="50" value={prasekolahMaster.questions} onChange={e => setPrasekolahMaster(m => ({ ...m, questions: parseInt(e.target.value) || 0 }))} className="w-full px-2 py-2 rounded-xl bg-white/10 border border-white/15 text-white font-black text-center outline-none" placeholder="Soalan" />
                      </div>
                      <button onClick={applyPrasekolahMaster} className="w-full py-2 rounded-xl bg-yellow-300 text-yellow-950 text-xs font-black">Apply ke semua Prasekolah</button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {SUBJECT_CONFIG.filter(s => s.ageGroup === 'prasekolah').map(sc => {
                        const key = `${sc.ageGroup}-${sc.subject}`;
                        const sel = selectedSubjects.has(key);
                        const curr = currentCounts[key] || { games: 0, avgQuestions: 0 };
                        const targetGames = categoryGameConfig[key] || 0;
                        const gameDiff = targetGames - curr.games;
                        return (
                          <div key={key} className={`p-3 rounded-2xl border transition-all ${sel ? 'bg-white text-indigo-800 shadow-lg border-white' : 'bg-white/10 text-white border-white/10'}`}>
                            <button onClick={() => toggleSubject(key)} className="w-full flex items-center gap-2 text-left">
                              <span className={`w-5 h-5 rounded-lg flex items-center justify-center text-xs font-black ${sel ? 'bg-indigo-600 text-white' : 'bg-white/10 text-white/40'}`}>{sel ? '✓' : '+'}</span>
                              <span className="font-black text-xs truncate">{sc.label.replace('Prasekolah - ', '')}</span>
                            </button>
                            <p className={`mt-2 text-[11px] font-bold ${sel ? 'text-indigo-500' : 'text-white/55'}`}>{curr.games} games ada · avg {curr.avgQuestions} soalan {gameDiff > 0 ? `· perlu +${gameDiff}` : '· cukup'}</p>
                            <div className="mt-3 grid grid-cols-2 gap-2">
                              <div>
                                <label className={`block text-[10px] font-black mb-1 ${sel ? 'text-indigo-500' : 'text-white/45'}`}>Games</label>
                                <input
                                  type="number"
                                  min="0"
                                  max="100"
                                  value={targetGames}
                                  onChange={e => setCategoryGameConfig(c => ({ ...c, [key]: parseInt(e.target.value) || 0 }))}
                                  className={`w-full px-2 py-2 rounded-xl border font-black text-center outline-none ${sel ? 'bg-indigo-50 border-indigo-200 text-indigo-800' : 'bg-white/10 border-white/15 text-white'}`}
                                />
                              </div>
                              <div>
                                <label className={`block text-[10px] font-black mb-1 ${sel ? 'text-indigo-500' : 'text-white/45'}`}>Soalan</label>
                                <input
                                  type="number"
                                  min="1"
                                  max="50"
                                  value={categoryQuestionConfig[key] || 0}
                                  onChange={e => setCategoryQuestionConfig(c => ({ ...c, [key]: parseInt(e.target.value) || 0 }))}
                                  className={`w-full px-2 py-2 rounded-xl border font-black text-center outline-none ${sel ? 'bg-indigo-50 border-indigo-200 text-indigo-800' : 'bg-white/10 border-white/15 text-white'}`}
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="rounded-2xl bg-white/10 border border-white/10 p-3">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-white font-black text-sm">🎒 Sekolah Rendah</p>
                    </div>
                    <div className="mb-3 rounded-2xl bg-white/10 border border-white/10 p-3">
                      <p className="text-white/60 text-[10px] font-black uppercase mb-2">Master Sekolah Rendah</p>
                      <div className="grid grid-cols-2 gap-2 mb-2">
                        <input type="number" min="0" max="100" value={sekolahRendahMaster.games} onChange={e => setSekolahRendahMaster(m => ({ ...m, games: parseInt(e.target.value) || 0 }))} className="w-full px-2 py-2 rounded-xl bg-white/10 border border-white/15 text-white font-black text-center outline-none" placeholder="Games" />
                        <input type="number" min="1" max="50" value={sekolahRendahMaster.questions} onChange={e => setSekolahRendahMaster(m => ({ ...m, questions: parseInt(e.target.value) || 0 }))} className="w-full px-2 py-2 rounded-xl bg-white/10 border border-white/15 text-white font-black text-center outline-none" placeholder="Soalan" />
                      </div>
                      <button onClick={applySekolahRendahMaster} className="w-full py-2 rounded-xl bg-cyan-300 text-cyan-950 text-xs font-black">Apply ke semua SR D1-D6</button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {SUBJECT_CONFIG.filter(s => s.ageGroup === 'sekolah_rendah').map(sc => {
                        const key = `${sc.ageGroup}-${sc.subject}`;
                        const sel = selectedSubjects.has(key);
                        const darjahLevels = ['darjah_1', 'darjah_2', 'darjah_3', 'darjah_4', 'darjah_5', 'darjah_6'];
                        const darjahLabels = { darjah_1: 'D1', darjah_2: 'D2', darjah_3: 'D3', darjah_4: 'D4', darjah_5: 'D5', darjah_6: 'D6' };
                        return (
                          <div key={key} className={`p-3 rounded-2xl border transition-all ${sel ? 'bg-white text-indigo-800 shadow-lg border-white' : 'bg-white/10 text-white border-white/10'}`}>
                            <button onClick={() => toggleSubject(key)} className="w-full flex items-center gap-2 text-left">
                              <span className={`w-5 h-5 rounded-lg flex items-center justify-center text-xs font-black ${sel ? 'bg-indigo-600 text-white' : 'bg-white/10 text-white/40'}`}>{sel ? '✓' : '+'}</span>
                              <span className="font-black text-xs truncate">{sc.label.replace('Sekolah Rendah - ', '')}</span>
                            </button>
                            <div className="mt-3 space-y-2">
                              {darjahLevels.map(darjah => {
                                const darjahKey = `${key}-${darjah}`;
                                const currDarjah = currentCounts[key]?.darjah?.[darjah] || { games: 0, avgQuestions: 0 };
                                return (
                                  <div key={darjah} className={`rounded-xl p-2 ${sel ? 'bg-indigo-50' : 'bg-white/5'}`}>
                                    <div className={`text-[10px] font-black mb-1 ${sel ? 'text-indigo-500' : 'text-white/45'}`}>{darjahLabels[darjah]} · {currDarjah.games} games · avg {currDarjah.avgQuestions} soalan</div>
                                    <div className="grid grid-cols-2 gap-2">
                                      <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        aria-label={`${darjahLabels[darjah]} games`}
                                        value={darjahSubjectGameConfig[darjahKey] || 0}
                                        onChange={e => setDarjahSubjectGameConfig(c => ({ ...c, [darjahKey]: parseInt(e.target.value) || 0 }))}
                                        className={`w-full px-2 py-2 rounded-lg border font-black text-center outline-none text-xs ${sel ? 'bg-white border-indigo-200 text-indigo-800' : 'bg-white/10 border-white/15 text-white'}`}
                                        placeholder="Games"
                                      />
                                      <input
                                        type="number"
                                        min="1"
                                        max="50"
                                        aria-label={`${darjahLabels[darjah]} soalan`}
                                        value={darjahSubjectQuestionConfig[darjahKey] || 0}
                                        onChange={e => setDarjahSubjectQuestionConfig(c => ({ ...c, [darjahKey]: parseInt(e.target.value) || 0 }))}
                                        className={`w-full px-2 py-2 rounded-lg border font-black text-center outline-none text-xs ${sel ? 'bg-white border-indigo-200 text-indigo-800' : 'bg-white/10 border-white/15 text-white'}`}
                                        placeholder="Soalan"
                                      />
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
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
                        <span className="text-white font-semibold truncate">{sc?.label}</span>
                        <div className="flex gap-2 flex-shrink-0 ml-2">
                          <span className={`font-black ${key.startsWith('sekolah_rendah') ? 'text-cyan-300' : gameDiff > 0 ? 'text-green-300' : gameDiff < 0 ? 'text-red-300' : 'text-white/40'}`}>
                            {key.startsWith('sekolah_rendah') ? 'custom D1-D6' : gameDiff > 0 ? `+${gameDiff} games` : gameDiff < 0 ? `${gameDiff} games` : 'games ✓'}
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
                className="w-full py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-3 bg-gradient-to-r from-yellow-300 via-orange-400 to-pink-500 text-white shadow-2xl shadow-orange-950/30 disabled:opacity-50 disabled:shadow-none transition-all">
                {submitting ? <><Loader2 className="w-5 h-5 animate-spin" /> Menghantar ke queue...</> : <><Wand2 className="w-5 h-5" /> Queue Generation ({selectedSubjects.size} subjek)</>}
              </motion.button>
              <p className="text-white/40 text-xs text-center mt-2">✅ Tasks diproses otomatik setiap 5 minit. Boleh tutup browser.</p>
            </div>

            </motion.div>
            )}

            {/* ══════════════ MINI GAMES HUB TAB ══════════════ */}
          {tab === 'minigames' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {/* Status Section */}
            <div className="p-5 md:p-7 rounded-[2rem] mb-6 shadow-2xl shadow-black/20" style={{ background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.22) 0%, rgba(236, 72, 153, 0.16) 100%)', backdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.25)' }}>
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
                    {MINI_GAME_CATEGORIES.map(category => {
                      const data = miniGamesData[category.id] || { count: 0, totalQuestions: 0 };
                      return (
                        <div key={category.id} className={`bg-gradient-to-br ${category.color} rounded-2xl p-3 text-center flex-shrink-0 w-32 shadow-lg`}>
                          <p className="text-white font-black text-2xl mb-1">{category.emoji}</p>
                          <p className="text-white text-xs font-black leading-tight line-clamp-2 min-h-[2rem]">{category.title}</p>
                          <p className="text-white text-lg font-black mt-2">{data.count}</p>
                          <p className="text-white/80 text-xs font-semibold">games</p>
                        </div>
                      );
                    })}
                  </div>
                  {/* Desktop grid */}
                  <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {MINI_GAME_CATEGORIES.map(category => {
                      const data = miniGamesData[category.id] || { count: 0, totalQuestions: 0 };
                      return (
                        <div key={category.id} className={`bg-gradient-to-br ${category.color} rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all`}>
                          <div className="flex items-start justify-between gap-3 mb-3">
                            <p className="text-3xl">{category.emoji}</p>
                            <span className="text-xs px-2 py-1 rounded-full font-black bg-white/25 text-white">{category.games.length} jenis</span>
                          </div>
                          <p className="text-white font-black text-sm leading-tight mb-1">{category.title}</p>
                          <p className="text-white/80 text-[11px] font-bold leading-snug line-clamp-2 mb-3">{category.objective}</p>
                          <p className="text-white text-2xl font-black">{data.count}</p>
                          <p className="text-white/80 text-xs font-semibold">games</p>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>

            {/* Mini Games Sub-tabs */}
            <div className="flex gap-2 mb-6 p-2 rounded-[1.75rem] sm:rounded-3xl overflow-x-auto shadow-xl shadow-black/10 snap-x scroll-px-2" style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(18px)', border: '1px solid rgba(255,255,255,0.16)', WebkitOverflowScrolling: 'touch' }}>
              {[
                { id: 'generate', label: '🤖 Generate' },
                { id: 'manage', label: '📋 Manage' },
              ].map(t => (
                <button key={t.id} onClick={() => setMiniGamesTab(t.id)}
                  className={`flex-1 min-w-[8rem] py-3.5 px-4 rounded-2xl font-black text-sm transition-all whitespace-nowrap ${miniGamesTab === t.id ? 'bg-white text-indigo-800 shadow-lg' : 'text-white/75 hover:text-white hover:bg-white/10'}`}>
                  {t.label}
                </button>
              ))}
            </div>

            {miniGamesTab === 'generate' && <MiniGamesGenerator onToast={showToast} />}
            {miniGamesTab === 'manage' && <MiniGamesManager onToast={showToast} />}
            </motion.div>
            )}

        {/* ══════════════ MONTHLY AUTO TAB ══════════════ */}
        {tab === 'monthly' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <MonthlyGenSettings onToast={showToast} />
          </motion.div>
        )}

        {/* ══════════════ BBM TAB ══════════════ */}
        {tab === 'bbm' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <BBMGeneratorManager onToast={showToast} />
          </motion.div>
        )}

        {/* ══════════════ STORY KID TAB ══════════════ */}
        {tab === 'storykid' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="flex gap-2 mb-6 p-2 rounded-[1.75rem] sm:rounded-3xl overflow-x-auto shadow-xl shadow-black/10 snap-x scroll-px-2" style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(18px)', border: '1px solid rgba(255,255,255,0.16)', WebkitOverflowScrolling: 'touch' }}>
              {[
                { id: 'generate', label: '🤖 Generator' },
                { id: 'manage', label: '📋 Management' },
              ].map(t => (
                <button key={t.id} onClick={() => setStoryKidTab(t.id)}
                  className={`flex-1 min-w-[8rem] py-3.5 px-4 rounded-2xl font-black text-sm transition-all whitespace-nowrap ${storyKidTab === t.id ? 'bg-white text-indigo-800 shadow-lg' : 'text-white/75 hover:text-white hover:bg-white/10'}`}>
                  {t.label}
                </button>
              ))}
            </div>

            {storyKidTab === 'generate' && <StoryKidGenerator onToast={showToast} />}
            {storyKidTab === 'manage' && <StoryKidManager onToast={showToast} />}
          </motion.div>
        )}

            {/* ══════════════ MANAGER TAB ══════════════ */}
            {tab === 'manager' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {/* Stats row */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-4">
              {[
                { value: totalGames, label: 'Total Games', color: 'text-yellow-300' },
                { value: totalFull, label: 'Soalan Penuh', color: 'text-green-300' },
                { value: totalPlayers, label: 'Players', color: 'text-pink-300' },
              ].map(({ value, label, color }) => (
                <div key={label} className="rounded-2xl p-3 sm:p-4 text-center shadow-lg shadow-black/10 border border-white/15" style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(18px)' }}>
                  <p className={`text-lg sm:text-xl font-black ${color}`}>{value}</p>
                  <p className="text-[10px] sm:text-xs text-white/90 font-semibold leading-tight">{label}</p>
                </div>
              ))}
            </div>

            {/* Search + Filter bar */}
            <div className="p-3 md:p-5 rounded-2xl md:rounded-[1.75rem] mb-3 md:mb-5 shadow-lg md:shadow-xl shadow-black/10" style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(22px)', border: '1px solid rgba(255,255,255,0.2)' }}>
              <div className="flex gap-2 mb-3 items-center">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 text-sm">🔍</span>
                  <input
                    type="text"
                    placeholder="Cari..."
                    value={managerSearch}
                    onChange={e => setManagerSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-3 rounded-2xl bg-white/10 text-white placeholder-white/30 border border-white/20 text-sm font-semibold outline-none focus:border-white/50 focus:bg-white/15 shadow-inner shadow-black/10 transition-all"
                  />
                </div>
                <button onClick={fetchStats} disabled={loading} className="w-11 h-11 bg-white/10 hover:bg-white/20 rounded-2xl border border-white/20 transition-all flex-shrink-0 flex items-center justify-center">
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
                      <motion.div key={s.file} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }} className="rounded-[1.75rem] overflow-hidden shadow-xl shadow-black/10" style={{ background: 'rgba(255,255,255,0.10)', backdropFilter: 'blur(18px)', border: '1px solid rgba(255,255,255,0.18)' }}>
                        {/* Subject header */}
                        <button
                          onClick={() => setExpandedFile(expandedFile === s.file ? null : s.file)}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-all text-left"
                        >
                          <div className="w-2 h-2 rounded-full bg-white/35" />
                          <span className="font-black text-white text-sm flex-1">{s.label}</span>
                          <span className="text-white/70 text-xs font-semibold">{s.totalGames} games</span>
                          {expandedFile === s.file
                           ? <ChevronDown className="w-4 h-4 text-white/60" />
                           : <ChevronRight className="w-4 h-4 text-white/60" />
                          }
                          </button>

                          {/* Games list */}
                          {expandedFile === s.file && (
                          <div className="border-t border-white/10">
                           {filteredGames.length === 0 ? (
                             <p className="text-white/50 text-xs text-center py-4">Tiada games lagi</p>
                           ) : (
                             filteredGames.map(g => (
                               <div key={g.id} className="flex items-center gap-3 px-4 py-3.5 border-b border-white/5 last:border-0 hover:bg-white/8 transition-all">
                                 <div className="flex-1 min-w-0">
                                   <p className="text-white text-xs font-bold truncate">{g.title}</p>
                                   <div className="flex gap-2 mt-0.5">
                                     <span className="text-white/60 text-xs">{g.type}</span>
                                     <span className={`text-xs font-bold ${g.questionCount >= QUESTION_THRESHOLD ? 'text-green-400' : 'text-yellow-400'}`}>
                                       {g.questionCount} soalan
                                     </span>
                                     {g.players > 0 && <span className="text-white/60 text-xs">{g.players} players</span>}
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
                      <motion.div key={s.file} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }} className="rounded-[1.75rem] overflow-hidden shadow-xl shadow-black/10" style={{ background: 'rgba(255,255,255,0.10)', backdropFilter: 'blur(18px)', border: '1px solid rgba(255,255,255,0.18)' }}>
                        {/* Subject header */}
                        <button
                          onClick={() => setExpandedFile(expandedFile === s.file ? null : s.file)}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-all text-left"
                        >
                          <div className="w-2 h-2 rounded-full bg-white/35" />
                          <span className="font-black text-white text-sm flex-1">{s.label}</span>
                          <span className="text-white/70 text-xs font-semibold">{s.totalGames} games</span>
                          {expandedFile === s.file
                           ? <ChevronDown className="w-4 h-4 text-white/60" />
                           : <ChevronRight className="w-4 h-4 text-white/60" />
                          }
                          </button>

                          {/* Games list */}
                          {expandedFile === s.file && (
                          <div className="border-t border-white/10">
                           {filteredGames.length === 0 ? (
                             <p className="text-white/50 text-xs text-center py-4">Tiada games lagi</p>
                           ) : (
                             filteredGames.map(g => (
                               <div key={g.id} className="flex items-center gap-3 px-4 py-3.5 border-b border-white/5 last:border-0 hover:bg-white/8 transition-all">
                                 <div className="flex-1 min-w-0">
                                   <p className="text-white text-xs font-bold truncate">{g.title}</p>
                                   <div className="flex gap-2 mt-0.5">
                                     <span className="text-white/60 text-xs">{g.type}</span>
                                      <span className={`text-xs font-bold ${g.questionCount >= QUESTION_THRESHOLD ? 'text-green-400' : 'text-yellow-400'}`}>
                                        {g.questionCount} soalan
                                      </span>
                                      {g.players > 0 && <span className="text-white/60 text-xs">{g.players} players</span>}
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

        <MasterTaskQueue onToast={showToast} />
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