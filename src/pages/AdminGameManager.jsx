import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Loader2, ChevronDown, ChevronRight, RefreshCw, Users, Edit3, X, Database, Layers, Trash2, RotateCcw, CheckCircle2 } from 'lucide-react';
import AppHeader from '@/components/AppHeader';
import { gameLibrary } from '@/lib/gameLibrary';
import EditGameModal from '@/components/admin/EditGameModal';
import SyncAndEditModal from '@/components/admin/SyncAndEditModal';
import SubjectCard from '@/components/admin/SubjectCard';

const QUESTION_THRESHOLD = 20; // Matches SubjectCard threshold
const QUESTION_GENERATION_DELAY = 3000; // 3 seconds between games to avoid rate limiting

const SUBJECT_CONFIG = [
// Prasekolah
{ file: 'gameData_prasekolah_bm', label: 'Prasekolah - BM', ageGroup: 'prasekolah', subject: 'bahasa_melayu', color: { border: 'border-l-blue-500', badge: 'bg-blue-100 text-blue-700', dot: 'bg-blue-500' } },
{ file: 'gameData_prasekolah_en', label: 'Prasekolah - English', ageGroup: 'prasekolah', subject: 'english', color: { border: 'border-l-green-500', badge: 'bg-green-100 text-green-700', dot: 'bg-green-500' } },
{ file: 'gameData_prasekolah_math', label: 'Prasekolah - Math', ageGroup: 'prasekolah', subject: 'mathematics', color: { border: 'border-l-purple-500', badge: 'bg-purple-100 text-purple-700', dot: 'bg-purple-500' } },
{ file: 'gameData_prasekolah_science', label: 'Prasekolah - Science', ageGroup: 'prasekolah', subject: 'science', color: { border: 'border-l-orange-500', badge: 'bg-orange-100 text-orange-700', dot: 'bg-orange-500' } },
{ file: 'gameData_prasekolah_tamil', label: 'Prasekolah - Tamil', ageGroup: 'prasekolah', subject: 'bahasa_tamil', color: { border: 'border-l-red-500', badge: 'bg-red-100 text-red-700', dot: 'bg-red-500' } },
{ file: 'gameData_prasekolah_mandarin', label: 'Prasekolah - Mandarin', ageGroup: 'prasekolah', subject: 'bahasa_mandarin', color: { border: 'border-l-yellow-500', badge: 'bg-yellow-100 text-yellow-700', dot: 'bg-yellow-500' } },
// Sekolah Rendah
{ file: 'gameData_sr_bm', label: 'Sekolah Rendah - BM', ageGroup: 'sekolah_rendah', subject: 'bahasa_melayu', color: { border: 'border-l-blue-500', badge: 'bg-blue-100 text-blue-700', dot: 'bg-blue-500' } },
{ file: 'gameData_sr_jawi', label: 'Sekolah Rendah - Jawi', ageGroup: 'sekolah_rendah', subject: 'jawi', color: { border: 'border-l-teal-500', badge: 'bg-teal-100 text-teal-700', dot: 'bg-teal-500' } },
{ file: 'gameData_sr_english', label: 'Sekolah Rendah - English', ageGroup: 'sekolah_rendah', subject: 'english', color: { border: 'border-l-green-500', badge: 'bg-green-100 text-green-700', dot: 'bg-green-500' } },
{ file: 'gameData_sr_math', label: 'Sekolah Rendah - Math', ageGroup: 'sekolah_rendah', subject: 'mathematics', color: { border: 'border-l-purple-500', badge: 'bg-purple-100 text-purple-700', dot: 'bg-purple-500' } },
{ file: 'gameData_sr_science', label: 'Sekolah Rendah - Science', ageGroup: 'sekolah_rendah', subject: 'science', color: { border: 'border-l-orange-500', badge: 'bg-orange-100 text-orange-700', dot: 'bg-orange-500' } },
{ file: 'gameData_sr_tamil', label: 'Sekolah Rendah - Tamil', ageGroup: 'sekolah_rendah', subject: 'bahasa_tamil', color: { border: 'border-l-red-500', badge: 'bg-red-100 text-red-700', dot: 'bg-red-500' } },
{ file: 'gameData_sr_mandarin', label: 'Sekolah Rendah - Mandarin', ageGroup: 'sekolah_rendah', subject: 'bahasa_mandarin', color: { border: 'border-l-yellow-500', badge: 'bg-yellow-100 text-yellow-700', dot: 'bg-yellow-500' } }];


const GAME_HUB = [
{ id: 'memory', title: 'Memory Game' },
{ id: 'dragdrop', title: 'Drag & Drop' },
{ id: 'wordbuilder', title: 'Word Builder' },
{ id: 'sorting', title: 'Sorting Game' },
{ id: 'tilematch', title: 'Tile Match' },
{ id: 'story', title: 'Story Adventure' },
{ id: 'physics', title: 'Physics Game' },
{ id: 'tracing', title: 'Tracing Game' }];


export default function AdminGameManager() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedFile, setExpandedFile] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [toast, setToast] = useState(null);
  const [modal, setModal] = useState(null);
  const [editGame, setEditGame] = useState(null); // single game edit
  const [syncAndEdit, setSyncAndEdit] = useState(null); // { games, label, ageGroup, subject }
  const [dbGamesCache, setDbGamesCache] = useState({}); // cache DB games by subject key
  const [collapsedSections, setCollapsedSections] = useState({ prasekolah: false, sekolah_rendah: false });
  const [regenerationTasks, setRegenerationTasks] = useState(null);
  const [taskProgress, setTaskProgress] = useState([]);
  const [isPaused, setIsPaused] = useState(false);
  const [generateModal, setGenerateModal] = useState(null);
  const [selectedSubjects, setSelectedSubjects] = useState(new Set()); // track selected subjects
  const [bulkGenerateConfig, setBulkGenerateConfig] = useState(null); // config for bulk generation

  const showToast = (msg, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchStats = async () => {
    setLoading(true);
    try {
      const [statsRes, ...dbGameGroups] = await Promise.all([
      base44.functions.invoke('getGameDatabase', {}),
      ...SUBJECT_CONFIG.map((sc) =>
      base44.entities.Game.filter({ ageGroup: sc.ageGroup, category: sc.subject, isPublished: true })
      )]
      );

      const stats = {};
      for (const sub of statsRes.data.subjects) {
        for (const g of sub.games) {
          const key = `${sub.ageGroup}-${sub.subject}-${g.index}`;
          stats[key] = { players: g.players, timesPlayed: g.timesPlayed, avgScore: g.avgScore };
        }
      }

      const newDbGamesCache = {};
      const builtSubjects = SUBJECT_CONFIG.map(({ file, label, ageGroup, subject, color }, i) => {
        const dbGames = (dbGameGroups[i] || []).sort((a, b) => (a.order || 0) - (b.order || 0));
        const libGames = gameLibrary[ageGroup]?.[subject] || [];
        const cacheKey = `${ageGroup}-${subject}`;
        newDbGamesCache[cacheKey] = dbGames;

        return {
          file, label, ageGroup, subject, color,
          totalGames: dbGames.length,
          games: dbGames.map((g, idx) => {
            const key = `${ageGroup}-${subject}-${idx}`;
            const stat = stats[key] || { players: 0, timesPlayed: 0, avgScore: null };
            return {
              index: idx,
              id: g.id,
              title: g.title || `Game ${idx + 1}`,
              type: g.type || '-',
              ageGroup,
              category: subject,
              questionCount: dbGames.length > 0 ? g.totalQuestions || g.gameData?.questions?.length || 0 : g.gameData?.questions?.length || 0,
              totalQuestions: g.totalQuestions || g.gameData?.questions?.length || 0,
              players: stat.players,
              timesPlayed: stat.timesPlayed,
              avgScore: stat.avgScore,
              // full DB game object for editing
              _raw: dbGames.length > 0 ? g : null
            };
          })
        };
      });

      setDbGamesCache(newDbGamesCache);
      setSubjects(builtSubjects);
    } catch (err) {
      showToast('Stats tidak dapat diload', false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {fetchStats();}, []);

  const openSyncAndEditModal = (games, label, ageGroup, subject) => {
    setSyncAndEdit({ games, label, ageGroup, subject });
  };

  const handleGenerateSubject = (label, ageGroup, subject, currentCount = 0) => {
    setGenerateModal({ games: 5, questions: 10, ageGroup, subject, label, currentCount });
  };

  const handleBulkGenerateStart = () => {
    if (selectedSubjects.size === 0) {
      showToast('Pilih sekurang-kurangnya satu subjek', false);
      return;
    }
    setBulkGenerateConfig({ games: 5, questions: 10, selectedCount: selectedSubjects.size });
  };

  const executeBulkGeneration = async () => {
    if (!bulkGenerateConfig) return;

    const tasks = Array.from(selectedSubjects).map((subjectKey) => {
      const [ageGroup, subject] = subjectKey.split('-');
      const subjectConfig = SUBJECT_CONFIG.find((sc) => sc.ageGroup === ageGroup && sc.subject === subject);
      return {
        taskId: Math.random().toString(36).slice(2, 9),
        taskName: subjectConfig?.label || subjectKey,
        ageGroup,
        subject,
        gamesCount: bulkGenerateConfig.games,
        questionsPerGame: bulkGenerateConfig.questions
      };
    });

    setRegenerationTasks(tasks);
    setBulkGenerateConfig(null);
    setSelectedSubjects(new Set());
  };

  const openSubjectConfigModal = (file, label, currentGames, currentAvgQ, ageGroup, subject) => {
    setActionLoading(`config-${file}`);
    setModal({ file, label, ageGroup, subject, gamesValue: String(currentGames), questionsValue: String(currentAvgQ || '') });
  };

  const handleVerifySubject = async (file, label, ageGroup, subject, cache) => {
    const verifyKey = `verify-${file}`;
    setActionLoading(verifyKey);
    showToast(`⏳ Kira & Semak ${label}...`, true);
    try {
      const dbGames = cache[`${ageGroup}-${subject}`] || [];
      if (dbGames.length === 0) {
        showToast('Tiada data untuk di-proses', false);
        setActionLoading(null);
        return;
      }

      let fixed = 0;
      for (const g of dbGames) {
        const actualCount = g.gameData?.questions?.length || 0;
        if (g.totalQuestions !== actualCount) {
          await base44.entities.Game.update(g.id, { totalQuestions: actualCount });
          fixed++;
        }
      }

      let verified = 0;
      let flagged = 0;
      let autoFixed = 0;
      const total = dbGames.length;
      for (let i = 0; i < dbGames.length; i++) {
        const game = dbGames[i];
        if (!game.gameData?.questions?.length) continue;
        try {
          showToast(`⏳ Verifying ${label}... ${i + 1}/${total}`, true);
          const result = await base44.functions.invoke('validateGameQuestionsQuality', {
            gameId: game.id,
            ageGroup: game.ageGroup,
            category: game.category,
            questions: game.gameData.questions
          });

          // If has issues, auto-fix
          if (result.data.validation.summary.invalid_count > 0) {
            showToast(`⚙️ Auto-fixing "${game.title}"...`, true);
            try {
              const fixResult = await base44.functions.invoke('autoFixGameQuestions', {
                gameId: game.id,
                validationResult: result.data.validation
              });
              autoFixed += fixResult.data.fixed;
              verified++;
            } catch (fixErr) {
              flagged++;
              console.error(`Auto-fix failed for ${game.id}:`, fixErr.message);
            }
          } else {
            verified++;
          }
        } catch (e) {
          flagged++;
          console.error(`Skip game ${game.id}:`, e.message);
        }
      }
      showToast(`✅ Kira: ${fixed} updated · Semak: ${verified} verified, ${autoFixed} auto-fixed, ${flagged} failed`);
      await fetchStats();
    } catch (err) {
      showToast('❌ ' + err.message, false);
    } finally {
      setActionLoading(null);
    }
  };

  const handleModalConfirm = async () => {
    const { file, ageGroup, subject } = modal;
    const games = parseInt(modal.gamesValue);
    const questions = parseInt(modal.questionsValue);
    setModal(null);
    setActionLoading(file);

    try {
      if (games && games > 0) {
        showToast('⏳ Mengemas kini bilangan games...', true);
        await base44.functions.invoke('syncSubjectGames', {
          targetCount: games,
          ageGroup,
          category: subject
        });
      }

      if (questions && questions > 0) {
        const dbGames = await base44.entities.Game.filter({ ageGroup, category: subject, isPublished: true });
        // Only process games that need more questions (skip yang dah cukup)
        const needsUpdate = dbGames.filter((g) => (g.gameData?.questions?.length || 0) < questions);
        const total = needsUpdate.length;

        if (total === 0) {
          showToast('✅ Semua games dah ada cukup soalan!');
        } else {
          let done = 0;
          let failed = 0;
          for (let i = 0; i < needsUpdate.length; i++) {
            const g = needsUpdate[i];
            showToast(`⏳ AI menjana soalan... ${i + 1}/${total} (${g.title?.slice(0, 20)}...)`, true);
            try {
              await base44.functions.invoke('syncSubjectGameQuestions', {
                targetCount: questions,
                ageGroup,
                category: subject,
                gameId: g.id
              });
              done++;
            } catch (err) {
              failed++;
              console.error(`Skip game ${g.id}: ${err.message}`);
            }
            // Delay antara games untuk elak rate limit
            if (i < needsUpdate.length - 1) {
              await new Promise((r) => setTimeout(r, QUESTION_GENERATION_DELAY));
            }
          }
          showToast(`✅ Selesai! ${done} games berjaya, ${failed} gagal (skip).`);
        }
      }

      await fetchStats();
    } catch (err) {
      showToast('❌ ' + err.message, false);
    } finally {
      setActionLoading(null);
    }
  };

  const handleSyncToDB = async () => {
    setActionLoading('import');
    showToast('⏳ Sync games ke database...', true);
    try {
      let added = 0;
      let skipped = 0;

      for (const sc of SUBJECT_CONFIG) {
        const libGames = gameLibrary[sc.ageGroup]?.[sc.subject] || [];
        const dbGames = dbGamesCache[`${sc.ageGroup}-${sc.subject}`] || [];
        const dbTitles = new Set(dbGames.map((g) => g.title));

        const newGames = libGames.
        filter((g) => !dbTitles.has(g.title)).
        map((g, idx) => ({
          title: g.title,
          type: g.type,
          emoji: g.emoji,
          difficulty: g.difficulty,
          tier: g.tier,
          ageGroup: sc.ageGroup,
          category: sc.subject,
          order: dbGames.length + idx,
          totalQuestions: g.gameData?.questions?.length || 8,
          gameData: { questions: (g.gameData?.questions || []).slice(0, 20) },
          isPublished: true
        }));

        skipped += libGames.length - newGames.length;

        if (newGames.length > 0) {
          const BATCH = 10;
          for (let i = 0; i < newGames.length; i += BATCH) {
            const batch = newGames.slice(i, i + BATCH);
            await base44.functions.invoke('importGamesToDB', { games: batch });
            showToast(`⏳ Sync ${sc.label}... ${Math.min(i + BATCH, newGames.length)}/${newGames.length}`, true);
          }
          added += newGames.length;
        }
      }

      showToast(`✅ Sync selesai! ${added} games baru ditambah, ${skipped} games sedia ada dikekalkan.`);
      await fetchStats();
    } catch (err) {
      showToast('❌ Sync gagal: ' + err.message, false);
    } finally {
      setActionLoading(null);
    }
  };

  const totalGames = subjects.reduce((a, s) => a + s.totalGames, 0);
  const totalPlayers = subjects.reduce((a, s) => a + s.games.reduce((b, g) => b + g.players, 0), 0);
  const totalFull = subjects.reduce((a, s) => a + s.games.filter((g) => g.questionCount >= QUESTION_THRESHOLD).length, 0);

  return (
    <div className="min-h-screen pb-32 bg-pattern relative overflow-hidden">

      <AppHeader showBack={true} backTo="/admin-dashboard" />



      <AnimatePresence>
        {toast &&
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className={`fixed top-5 left-1/2 -translate-x-1/2 z-[60] px-5 py-3 rounded-2xl shadow-xl font-bold text-white text-sm ${toast.ok ? 'bg-green-500' : 'bg-red-500'}`}>
          
            {toast.msg}
          </motion.div>
        }
      </AnimatePresence>

      <AnimatePresence>
        {modal &&
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setModal(null)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
          
            <motion.div
            initial={{ scale: 0.92, y: 40 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.92, y: 40 }}
            transition={{ type: 'spring', damping: 22, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden">
            
              {/* Gradient Header */}
              <div className="bg-gradient-to-r from-game-purple to-game-pink px-6 py-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-black text-white text-lg">✏️ Edit Database</h3>
                    <p className="text-white/70 text-xs mt-0.5 font-semibold">{modal.label}</p>
                  </div>
                  <button onClick={() => setModal(null)} className="p-1.5 bg-white/20 hover:bg-white/30 rounded-xl transition-all">
                    <X className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>

              {/* Body */}
              <div className="px-6 py-5 space-y-4">
                <div>
                  <label className="block text-xs font-black text-gray-500 uppercase tracking-wide mb-2">🎮 Bilangan Games</label>
                  <div className="relative">
                    <input
                    type="number"
                    min="1"
                    autoFocus
                    value={modal.gamesValue}
                    onChange={(e) => setModal((m) => ({ ...m, gamesValue: e.target.value }))}
                    placeholder="e.g. 25"
                    className="w-full p-3.5 border-2 border-gray-200 rounded-2xl focus:border-game-purple focus:outline-none text-2xl font-black text-center bg-gray-50 transition-all" />
                  
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-semibold">semasa: {modal.gamesValue}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-500 uppercase tracking-wide mb-2">📝 Soalan per Game</label>
                  <div className="relative">
                    <input
                    type="number"
                    min="1"
                    value={modal.questionsValue}
                    onChange={(e) => setModal((m) => ({ ...m, questionsValue: e.target.value }))}
                    placeholder="e.g. 20"
                    className="w-full p-3.5 border-2 border-gray-200 rounded-2xl focus:border-game-purple focus:outline-none text-2xl font-black text-center bg-gray-50 transition-all" />
                  
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-semibold">semasa: {modal.questionsValue || '—'}</span>
                  </div>
                </div>
                <p className="text-xs text-gray-400 text-center">Kosongkan field untuk tidak ubah</p>
              </div>

              {/* Footer */}
              <div className="px-6 pb-6 flex gap-3">
                <button onClick={() => setModal(null)} className="flex-1 py-3 rounded-2xl border-2 border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-50 transition-all">
                  Batal
                </button>
                <button
                onClick={handleModalConfirm}
                disabled={(!modal.gamesValue || parseInt(modal.gamesValue) < 1) && (!modal.questionsValue || parseInt(modal.questionsValue) < 1)}
                className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-game-purple to-game-pink text-white font-bold text-sm disabled:opacity-40 shadow-lg shadow-purple-200 transition-all hover:shadow-xl">
                
                  ✅ Apply
                </button>
              </div>
            </motion.div>
          </motion.div>
        }
      </AnimatePresence>

      <div className="max-w-4xl mx-auto px-3 md:px-4 pt-20 md:pt-24">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 md:mb-6 gap-3">
          <div className="flex-1">
            <h1 className="text-xl md:text-2xl font-black text-gray-900">🎮 Game Manager</h1>
            <p className="text-gray-600 text-xs md:text-sm font-semibold">{totalGames} games · {totalFull} soalan penuh</p>
            {selectedSubjects.size > 0 && <p className="text-xs text-orange-600 font-bold mt-1">✅ {selectedSubjects.size} subjects selected</p>}
            
            {regenerationTasks &&
            <div className="mt-3 space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-bold text-orange-600">🚀 Generating: {taskProgress.length}/{regenerationTasks.length}</p>
                  <p className="text-xs font-bold text-orange-600">{Math.round(taskProgress.length / regenerationTasks.length * 100)}%</p>
                </div>
                <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden border border-orange-200">
                  <motion.div
                  className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${taskProgress.length / regenerationTasks.length * 100}%` }}
                  transition={{ duration: 0.4, ease: 'easeOut' }} />
                
                </div>
              </div>
            }
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={async () => {
                if (!window.confirm('🚨 DELETE semua games? Ini tidak boleh di-undo!')) return;
                setActionLoading('delete-all');
                showToast('🗑️ Deleting all games...', true);
                try {
                  const deleteRes = await base44.functions.invoke('deleteAllGames', {});
                  showToast(`✅ Deleted ${deleteRes.data.deletedCount} games`);
                  await fetchStats();
                } catch (err) {
                  showToast('❌ ' + err.message, false);
                } finally {
                  setActionLoading(null);
                }
              }}
              disabled={!!actionLoading}
              className="flex items-center gap-2 px-3 py-2 bg-red-700 text-white rounded-xl text-xs md:text-sm font-bold hover:shadow-lg disabled:opacity-50 transition-all">
              
              {actionLoading === 'delete-all' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              Delete All Games
            </button>

            



















            
            <button
              onClick={async () => {
                setActionLoading('audit-all');
                showToast('📋 Auditing semua games...', true);
                try {
                  const res = await base44.functions.invoke('auditAllGames', {});
                  console.log('Audit Results:', res.data);
                  showToast(`📊 Audit selesai: ${res.data.summary.passed}/${res.data.summary.totalGames} games OKEY (${res.data.summary.passRate})`, true);
                  if (res.data.failedGames.length > 0) {
                    showToast(`⚠️ ${res.data.failedGames.length} games ada issues - check console details`, false);
                  }
                } catch (err) {
                  showToast('❌ ' + err.message, false);
                } finally {
                  setActionLoading(null);
                }
              }}
              disabled={!!actionLoading} className="flex items-center gap-2 px-3 py-2 bg-indigo-600 text-white rounded-xl text-xs md:text-sm font-bold hover:shadow-lg disabled:opacity-50 transition-all hidden"

              title="Audit all games questions quality">
              
              {actionLoading === 'audit-all' ? <Loader2 className="w-4 h-4 animate-spin" /> : '📋'}
              Audit All
            </button>
            <button
              onClick={async () => {
                if (!window.confirm('Auto-fix semua games dengan issues? (validate + fix soalan)')) return;
                setActionLoading('check-all');
                showToast('🤖 Checking & auto-fixing semua games...', true);
                try {
                  const res = await base44.functions.invoke('checkGameQuestionsMatching', { autoFix: true });
                  if (res.data.autoFixedGames > 0) {
                    showToast(`✅ Fixed ${res.data.autoFixedGames} games (${res.data.autoFixedQuestions} soalan)!`);
                  } else if (res.data.issueCount > 0) {
                    showToast(`⚠️ Found ${res.data.issueCount} issues - check console`, false);
                    console.log('Issues:', res.data.issues);
                  } else {
                    showToast(`✅ Semua OK! ${res.data.totalQuestions} soalan across ${res.data.totalGames} games.`);
                  }
                  await fetchStats();
                } catch (err) {
                  showToast('❌ ' + err.message, false);
                } finally {
                  setActionLoading(null);
                }
              }}
              disabled={!!actionLoading} className="flex items-center gap-2 px-3 py-2 bg-yellow-500 text-white rounded-xl text-xs md:text-sm font-bold hover:shadow-lg disabled:opacity-50 transition-all hidden"

              title="Check and auto-fix all games all subjects">
              
              {actionLoading === 'check-all' ? <Loader2 className="w-4 h-4 animate-spin" /> : '🤖'}
              Check & Fix All
            </button>
            <button onClick={fetchStats} disabled={loading} title="Refresh" className="p-2 bg-white/40 backdrop-blur-xl rounded-xl border-2 border-white/30 hover:bg-white/60 transition-all">
              <RefreshCw className={`w-4 h-4 text-gray-600 ${loading ? 'animate-spin' : ''}`} />
            </button>
            
            {selectedSubjects.size > 0 &&
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={handleBulkGenerateStart}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl text-xs md:text-sm font-bold hover:shadow-lg transition-all">
                🚀 Bulk Generate {selectedSubjects.size}
              </motion.button>
            }
          </div>
        </motion.div>

        <div className="grid grid-cols-3 gap-2 md:gap-3 mb-4 md:mb-6">
          {[
          { value: totalGames, label: 'Total Games', color: 'text-game-purple' },
          { value: totalFull, label: 'Soalan Penuh', color: 'text-green-600' },
          { value: totalPlayers, label: 'Total Players', color: 'text-game-pink' }].
          map(({ value, label, color }, i) =>
          <motion.div key={label} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.08 }}
          whileHover={{ y: -2, scale: 1.02 }}
          className="bg-white/40 backdrop-blur-xl rounded-2xl p-2 md:p-3 shadow-xl border-2 border-white/30 text-center">
              <p className={`text-lg md:text-2xl font-black ${color}`}>{value}</p>
              <p className="text-xs text-gray-600 font-semibold">{label}</p>
            </motion.div>
          )}
        </div>

        {/* Generation Progress Bar */}
        <AnimatePresence>
          {taskProgress.length > 0 && regenerationTasks &&
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl p-4 md:p-5 shadow-xl border-2 border-orange-300 mb-4 md:mb-6">
            
              <div className="flex items-center justify-between gap-4 mb-3">
                <div className="flex-1">
                  <p className="font-black text-white text-sm md:text-base">{isPaused ? '⏸️ Paused' : '🔥 Generating Games...'}</p>
                  <p className="text-white/80 text-xs font-semibold">{taskProgress.length}/{regenerationTasks.length} tasks completed</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                  onClick={() => setIsPaused(!isPaused)}
                  className={`px-3 py-1.5 rounded-lg font-bold text-xs text-white transition-all ${
                  isPaused ? 'bg-green-600 hover:bg-green-700' : 'bg-white/20 hover:bg-white/30'}`
                  }>
                  
                    {isPaused ? '▶️ Resume' : '⏸️ Pause'}
                  </button>
                  <motion.div
                  className="text-3xl"
                  animate={isPaused ? {} : { rotate: 360 }}
                  transition={isPaused ? {} : { duration: 2, repeat: Infinity, ease: 'linear' }}>
                  
                    🔋
                  </motion.div>
                </div>
              </div>
              <div className="h-3 bg-white/20 rounded-full overflow-hidden border border-white/50">
                <motion.div
                className={`h-full rounded-full ${isPaused ? 'bg-gradient-to-r from-yellow-400 to-orange-500' : 'bg-gradient-to-r from-yellow-300 via-orange-400 to-red-500'}`}
                initial={{ width: 0 }}
                animate={{ width: `${taskProgress.length / regenerationTasks.length * 100}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                style={{
                  boxShadow: '0 0 12px rgba(255, 165, 0, 0.9)'
                }} />
              
              </div>
              <p className="text-white/70 text-xs mt-2.5 text-center font-semibold">{Math.round(taskProgress.length / regenerationTasks.length * 100)}% — {Math.ceil((regenerationTasks.length - taskProgress.length) * 30 / 60)}m remaining</p>
            </motion.div>
          }
        </AnimatePresence>

        {loading ?
        <div className="flex items-center justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-game-purple" />
          </div> :

        <>
            {/* Prasekolah */}
            <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3 mt-4 md:mt-0">
              <button
              onClick={() => setCollapsedSections((prev) => ({ ...prev, prasekolah: !prev.prasekolah }))}
              className="p-1.5 hover:bg-white/40 rounded-lg transition-all">
              
                {collapsedSections.prasekolah ? <ChevronRight className="w-4 h-4 md:w-5 md:h-5 text-gray-500" /> : <ChevronDown className="w-4 h-4 md:w-5 md:h-5 text-gray-500" />}
              </button>
              <div className="text-base md:text-lg font-black text-gray-700">🧒 Prasekolah</div>
              <div className="flex-1 h-px bg-gradient-to-r from-amber-300/60 to-transparent" />
            </div>
            {!collapsedSections.prasekolah && subjects.filter((s) => s.ageGroup === 'prasekolah').map((s, idx) => {
            const isExpanded = expandedFile === s.file;
            const subjectKey = `${s.ageGroup}-${s.subject}`;
            const isSelected = selectedSubjects.has(subjectKey);
            return (
              <div key={s.file} className="flex items-start gap-2">
                <button
                  onClick={() => {
                    const next = new Set(selectedSubjects);
                    next.has(subjectKey) ? next.delete(subjectKey) : next.add(subjectKey);
                    setSelectedSubjects(next);
                  }}
                  className={`mt-3 p-2 rounded-lg transition-all ${isSelected ? 'bg-orange-200' : 'bg-white/20'}`}>
                  <div className={`w-4 h-4 border-2 rounded flex items-center justify-center ${isSelected ? 'bg-orange-500 border-orange-500' : 'border-gray-300'}`}>
                    {isSelected && <span className="text-white text-xs">✓</span>}
                  </div>
                </button>
                <div className="flex-1">
                  <SubjectCard
                    subject={s}
                    isExpanded={isExpanded}
                    onExpandToggle={setExpandedFile}
                    actionLoading={actionLoading}
                    onBulkEdit={openSyncAndEditModal}
                    onEditSubjectConfig={openSubjectConfigModal}
                    showToast={showToast}
                    dbGamesCache={dbGamesCache}
                    onVerify={handleVerifySubject}
                    onEditGame={setEditGame}
                    onGenerateSubject={handleGenerateSubject}
                    idx={idx} />
                </div>
              </div>);



          })}

            {/* Sekolah Rendah */}
            <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3 mt-6">
              <button
              onClick={() => setCollapsedSections((prev) => ({ ...prev, sekolah_rendah: !prev.sekolah_rendah }))}
              className="p-1.5 hover:bg-white/40 rounded-lg transition-all">
              
                {collapsedSections.sekolah_rendah ? <ChevronRight className="w-4 h-4 md:w-5 md:h-5 text-gray-500" /> : <ChevronDown className="w-4 h-4 md:w-5 md:h-5 text-gray-500" />}
              </button>
              <div className="text-base md:text-lg font-black text-gray-700">🎒 Sekolah Rendah</div>
              <div className="flex-1 h-px bg-gradient-to-r from-amber-300/60 to-transparent" />
            </div>
            {!collapsedSections.sekolah_rendah && subjects.filter((s) => s.ageGroup === 'sekolah_rendah').map((s, idx) => {
            const isExpanded = expandedFile === s.file;
            const subjectKey = `${s.ageGroup}-${s.subject}`;
            const isSelected = selectedSubjects.has(subjectKey);
            return (
              <div key={s.file} className="flex items-start gap-2">
                <button
                  onClick={() => {
                    const next = new Set(selectedSubjects);
                    next.has(subjectKey) ? next.delete(subjectKey) : next.add(subjectKey);
                    setSelectedSubjects(next);
                  }}
                  className={`mt-3 p-2 rounded-lg transition-all ${isSelected ? 'bg-orange-200' : 'bg-white/20'}`}>
                  <div className={`w-4 h-4 border-2 rounded flex items-center justify-center ${isSelected ? 'bg-orange-500 border-orange-500' : 'border-gray-300'}`}>
                    {isSelected && <span className="text-white text-xs">✓</span>}
                  </div>
                </button>
                <div className="flex-1">
                  <SubjectCard
                    subject={s}
                    isExpanded={isExpanded}
                    onExpandToggle={setExpandedFile}
                    actionLoading={actionLoading}
                    onBulkEdit={openSyncAndEditModal}
                    onEditSubjectConfig={openSubjectConfigModal}
                    showToast={showToast}
                    dbGamesCache={dbGamesCache}
                    onVerify={handleVerifySubject}
                    onEditGame={setEditGame}
                    onGenerateSubject={handleGenerateSubject}
                    idx={idx} />
                </div>
              </div>);



          })}

            {/* Game Hub */}
            <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3 mt-6">
              <div className="text-base md:text-lg font-black text-gray-700">🎪 Mini-Games</div>
              <div className="flex-1 h-px bg-gradient-to-r from-amber-300/60 to-transparent" />
            </div>
            <div className="bg-white/40 backdrop-blur-xl rounded-2xl shadow-xl border-2 border-white/30 border-l-4 border-l-orange-400 p-3 md:p-4 mt-3">
              <div className="flex items-center justify-between mb-2 md:mb-3">
                <span className="px-2 md:px-3 py-0.5 md:py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-700">{GAME_HUB.length} games aktif</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1.5 md:gap-2">
                {GAME_HUB.map((g) =>
              <div key={g.id} className="bg-orange-50/80 border border-orange-200 rounded-lg md:rounded-xl px-2 md:px-3 py-1.5 md:py-2 flex items-center gap-1 md:gap-2">
                    <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-orange-400 flex-shrink-0" />
                    <span className="text-xs font-semibold text-orange-800 truncate">{g.title}</span>
                  </div>
              )}
              </div>
            </div>
          </>
        }
      </div>

      {/* Single Game Edit Modal */}
      <AnimatePresence>
        {editGame &&
        <EditGameModal
          game={editGame}
          onClose={() => setEditGame(null)}
          onSaved={() => {showToast('✅ Game berjaya disimpan!');fetchStats();}} />

        }
      </AnimatePresence>

      {/* Bulk Generate Config Modal */}
      <AnimatePresence>
        {bulkGenerateConfig &&
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setBulkGenerateConfig(null)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          
            <motion.div
            initial={{ scale: 0.92, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.92, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden">
            
              <div className="bg-gradient-to-r from-orange-600 to-red-600 px-6 py-5">
                <h3 className="font-black text-white text-lg">🚀 Bulk Generate Games</h3>
                <p className="text-white/70 text-xs mt-0.5">{bulkGenerateConfig.selectedCount} subjects selected</p>
              </div>

              <div className="px-6 py-5 space-y-4">
                <div>
                  <label className="text-xs font-black text-gray-500 uppercase mb-2 block">Bilangan Games</label>
                  <input
                  type="number"
                  min="1"
                  max="100"
                  value={bulkGenerateConfig.games}
                  onChange={(e) => setBulkGenerateConfig((c) => ({ ...c, games: parseInt(e.target.value) || 1 }))}
                  className="w-full p-3.5 border-2 border-gray-200 rounded-2xl focus:border-orange-400 focus:outline-none text-2xl font-black text-center bg-gray-50" />
                
                  <p className="text-xs text-gray-400 mt-1">Same untuk semua subjects</p>
                </div>

                <div>
                  <label className="text-xs font-black text-gray-500 uppercase mb-2 block">Soalan per Game</label>
                  <input
                  type="number"
                  min="1"
                  max="50"
                  value={bulkGenerateConfig.questions}
                  onChange={(e) => setBulkGenerateConfig((c) => ({ ...c, questions: parseInt(e.target.value) || 1 }))}
                  className="w-full p-3.5 border-2 border-gray-200 rounded-2xl focus:border-orange-400 focus:outline-none text-2xl font-black text-center bg-gray-50" />
                
                  <p className="text-xs text-gray-400 mt-1">Same untuk semua subjects</p>
                </div>

                <p className="text-xs text-orange-600 font-semibold text-center py-2 bg-orange-50 rounded-xl">
                  Total: {bulkGenerateConfig.games} games × {bulkGenerateConfig.questions} soalan × {bulkGenerateConfig.selectedCount} subjects
                </p>
                <p className="text-xs text-gray-500 text-center">✅ Boleh close browser—tasks akan jalan background</p>
              </div>

              <div className="px-6 pb-6 flex gap-3">
                <button
                onClick={() => setBulkGenerateConfig(null)}
                className="flex-1 py-3 rounded-2xl border-2 border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-50">
                
                  Batal
                </button>
                <button
                onClick={executeBulkGeneration}
                className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-orange-600 to-red-600 text-white font-bold text-sm hover:shadow-lg">
                
                  ✅ Start Generation
                </button>
              </div>
            </motion.div>
          </motion.div>
        }
      </AnimatePresence>

      {/* Generate Modal */}
      <AnimatePresence>
        {generateModal &&
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setGenerateModal(null)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          
            <motion.div
            initial={{ scale: 0.92, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.92, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden">
            
              <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-5">
                <h3 className="font-black text-white text-lg">🎮 Generate Games</h3>
                <p className="text-white/70 text-xs mt-0.5">{generateModal.label || 'Selected Subject'}</p>
                {generateModal.currentCount > 0 && <p className="text-white/60 text-xs mt-1">📊 Ada {generateModal.currentCount} games sekarang</p>}
              </div>

              <div className="px-6 py-5 space-y-4">
                <div>
                  <label className="text-xs font-black text-gray-500 uppercase mb-2 block">Target Bilangan Games</label>
                  <input
                  type="number"
                  min="1"
                  max="100"
                  value={generateModal.games}
                  onChange={(e) => setGenerateModal((m) => ({ ...m, games: parseInt(e.target.value) || 1 }))}
                  className="w-full p-3.5 border-2 border-gray-200 rounded-2xl focus:border-green-400 focus:outline-none text-2xl font-black text-center bg-gray-50" />
                
                  <p className="text-xs text-gray-400 mt-1">Target total games yg dinak</p>
                </div>

                <div>
                  <label className="text-xs font-black text-gray-500 uppercase mb-2 block">Soalan per Game</label>
                  <input
                  type="number"
                  min="1"
                  max="50"
                  value={generateModal.questions}
                  onChange={(e) => setGenerateModal((m) => ({ ...m, questions: parseInt(e.target.value) || 1 }))}
                  className="w-full p-3.5 border-2 border-gray-200 rounded-2xl focus:border-green-400 focus:outline-none text-2xl font-black text-center bg-gray-50" />
                
                  <p className="text-xs text-gray-400 mt-1">Default: 10</p>
                </div>

                {(() => {
                const diff = generateModal.games - generateModal.currentCount;
                const action = diff > 0 ? `+ ${diff} games baru` : diff < 0 ? `- ${Math.abs(diff)} games dihapus` : 'Sama je';
                const color = diff > 0 ? 'text-blue-600 bg-blue-50' : diff < 0 ? 'text-orange-600 bg-orange-50' : 'text-gray-600 bg-gray-50';
                return <p className={`text-xs font-semibold text-center py-2 rounded-xl ${color}`}>
                    Target: {generateModal.games} games | Aksi: {action}
                  </p>;
              })()}
              </div>

              <div className="px-6 pb-6 flex gap-3">
                <button
                onClick={() => setGenerateModal(null)}
                className="flex-1 py-3 rounded-2xl border-2 border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-50">
                
                  Batal
                </button>
                <button
                onClick={async () => {
                  const diff = generateModal.games - generateModal.currentCount;
                  const action = diff > 0 ? `tambah ${diff}` : diff < 0 ? `buang ${Math.abs(diff)}` : 'keep';
                  if (!window.confirm(`${action} games untuk ${generateModal.label}?\nTarget: ${generateModal.games} games × ${generateModal.questions} soalan`)) return;
                  setGenerateModal(null);
                  setActionLoading(`gen-${generateModal.ageGroup}-${generateModal.subject}`);
                  showToast(`⏳ Syncing ${generateModal.label}...`, true);
                  try {
                    const res = await base44.functions.invoke('syncSubjectGames', {
                      targetCount: generateModal.games,
                      ageGroup: generateModal.ageGroup,
                      category: generateModal.subject
                    });
                    showToast(`✅ Synced to ${generateModal.games} games`);

                    // If need to expand questions
                    const dbGames = await base44.entities.Game.filter({ ageGroup: generateModal.ageGroup, category: generateModal.subject, isPublished: true });
                    const needsExpand = dbGames.filter((g) => (g.gameData?.questions?.length || 0) < generateModal.questions);
                    if (needsExpand.length > 0) {
                      showToast(`⏳ Expanding questions for ${needsExpand.length} games...`, true);
                      for (let i = 0; i < needsExpand.length; i++) {
                        await base44.functions.invoke('syncSubjectGameQuestions', {
                          targetCount: generateModal.questions,
                          ageGroup: generateModal.ageGroup,
                          category: generateModal.subject,
                          gameId: needsExpand[i].id
                        });
                        if (i < needsExpand.length - 1) await new Promise((r) => setTimeout(r, 3000));
                      }
                    }

                    showToast(`✅ Done! ${generateModal.games} games × ${generateModal.questions} soalan`);
                    await fetchStats();
                  } catch (err) {
                    showToast('❌ ' + err.message, false);
                  } finally {
                    setActionLoading(null);
                  }
                }}
                className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold text-sm hover:shadow-lg">
                
                  ✅ Sync Now
                </button>
              </div>
            </motion.div>
          </motion.div>
        }
      </AnimatePresence>

      {/* Sync & Edit Modal */}
      <AnimatePresence>
        {syncAndEdit &&
        <SyncAndEditModal
          games={syncAndEdit.games}
          subjectLabel={syncAndEdit.label}
          ageGroup={syncAndEdit.ageGroup}
          subject={syncAndEdit.subject}
          onClose={() => setSyncAndEdit(null)}
          onSaved={() => {showToast('✅ Proses selesai!');fetchStats();}} />

        }
      </AnimatePresence>

      {/* Regeneration Task Executor */}
      <AnimatePresence>
        {regenerationTasks &&
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          
            <motion.div
            initial={{ scale: 0.92, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.92, y: 20 }}
            className="bg-white rounded-3xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            
              {/* Header */}
              <div className="bg-gradient-to-r from-red-600 to-orange-600 px-6 py-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-black text-white text-lg">🚀 Regeneration Executor</h3>
                    <p className="text-white/80 text-xs mt-1">Execute tasks sequentially. Wait for each to complete.</p>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-bold text-sm">{taskProgress.length}/{regenerationTasks.length}</p>
                    <p className="text-white/70 text-xs">{Math.round(taskProgress.length / regenerationTasks.length * 100)}%</p>
                  </div>
                </div>
                <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                  <div
                  className="h-full bg-white transition-all duration-300"
                  style={{ width: `${taskProgress.length / regenerationTasks.length * 100}%` }} />
                
                </div>
              </div>

              {/* Task List */}
              <div className="flex-1 overflow-y-auto px-6 py-4">
                <div className="space-y-2">
                  {regenerationTasks.map((task, idx) => {
                  const progress = taskProgress.find((p) => p.taskId === task.taskId);
                  const isCompleted = progress?.status === 'completed';
                  const isRunning = progress?.status === 'running';

                  return (
                    <div key={task.taskId} className={`p-3 rounded-2xl border-2 transition-all ${
                    isCompleted ? 'bg-green-50 border-green-300' :
                    isRunning ? 'bg-blue-50 border-blue-300' :
                    'bg-gray-50 border-gray-200'}`
                    }>
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <p className="text-sm font-bold text-gray-800">{task.taskName}</p>
                            <p className="text-xs text-gray-500">{task.gamesCount} games × {task.questionsPerGame} soalan</p>
                          </div>
                          <div className="flex items-center gap-2">
                            {isCompleted ?
                          <span className="text-xs font-bold text-green-600">✅ Done</span> :
                          isRunning ?
                          <Loader2 className="w-4 h-4 animate-spin text-blue-600" /> :

                          <span className="text-xs font-bold text-gray-400">Pending</span>
                          }
                          </div>
                        </div>
                        {progress?.message &&
                      <p className="text-xs text-gray-600 mt-2">{progress.message}</p>
                      }
                      </div>);

                })}
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-gray-200">
                <p className="text-xs text-gray-400 mb-3 text-center">💡 Backend jalan di server—boleh close browser, tasks akan terus jalan background (~30-60 minit)</p>
                <div className="flex gap-3">
                  <button
                  onClick={() => {setRegenerationTasks(null);setTaskProgress([]);}}
                  className="flex-1 py-2.5 border-2 border-gray-200 rounded-xl font-bold text-gray-600 text-sm">
                  
                    Close
                  </button>
                  <button
                  onClick={async () => {
                    setActionLoading('execute-all');
                    setIsPaused(false);
                    let updatedProgress = [...taskProgress];

                    // Execute all remaining tasks
                    for (const task of regenerationTasks) {
                      const alreadyDone = updatedProgress.find((p) => p.taskId === task.taskId);
                      if (alreadyDone) continue;

                      // Wait if paused
                      while (isPaused) {
                        await new Promise((r) => setTimeout(r, 500));
                      }

                      // Mark as running
                      updatedProgress = [...updatedProgress, { taskId: task.taskId, status: 'running', message: 'Running...' }];
                      setTaskProgress(updatedProgress);
                      showToast(`⏳ Executing ${task.taskName}...`, true);

                      try {
                        const res = await base44.functions.invoke('regenerateGamesTask', {
                          taskId: task.taskId,
                          taskName: task.taskName,
                          ageGroup: task.ageGroup,
                          subject: task.subject,
                          gamesCount: task.gamesCount,
                          questionsPerGame: task.questionsPerGame
                        });

                        // Mark as completed
                        updatedProgress = updatedProgress.map((p) =>
                        p.taskId === task.taskId ?
                        { ...p, status: 'completed', message: `✅ ${res.data.createdGames} games created` } :
                        p
                        );
                        setTaskProgress(updatedProgress);
                        showToast(`✅ ${task.taskName} done!`);
                      } catch (err) {
                        // Mark as failed
                        updatedProgress = updatedProgress.map((p) =>
                        p.taskId === task.taskId ?
                        { ...p, status: 'failed', message: err.message } :
                        p
                        );
                        setTaskProgress(updatedProgress);
                        showToast(`❌ ${task.taskName} failed`, false);
                      }

                      // Delay before next task
                      await new Promise((r) => setTimeout(r, 2000));
                    }

                    // All done—refresh & close
                    showToast('✅ Semua tasks selesai!');
                    await fetchStats();
                    setActionLoading(null);
                    setRegenerationTasks(null);
                    setTaskProgress([]);
                    setIsPaused(false);
                  }}
                  disabled={actionLoading === 'execute-all'}
                  className="flex-1 py-2.5 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-xl font-bold text-sm hover:shadow-lg disabled:opacity-50">

                    {actionLoading === 'execute-all' ?
                  <>
                        <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
                        Executing...
                      </> :

                  taskProgress.length === regenerationTasks.length ? '✅ Done' : `▶️ Execute All ${regenerationTasks.length} Tasks`
                  }
                    </button>
                    </div>
                    </div>
                    </motion.div>
                    </motion.div>
        }
                    </AnimatePresence>
                    </div>);

}