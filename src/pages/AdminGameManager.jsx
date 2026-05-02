import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Loader2, ChevronDown, ChevronRight, RefreshCw, Users, Edit3, X, Database, Layers, Trash2, RotateCcw, CheckCircle2 } from 'lucide-react';
import AppHeader from '@/components/AppHeader';
import { gameLibrary } from '@/lib/gameLibrary';
import EditGameModal from '@/components/admin/EditGameModal';
import SyncAndEditModal from '@/components/admin/SyncAndEditModal';

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

  const showToast = (msg, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchStats = async () => {
    setLoading(true);
    try {
      const [statsRes, ...dbGameGroups] = await Promise.all([
        base44.functions.invoke('getGameDatabase', {}),
        ...SUBJECT_CONFIG.map(sc =>
          base44.entities.Game.filter({ ageGroup: sc.ageGroup, category: sc.subject, isPublished: true })
        ),
      ]);

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
        const source = dbGames.length > 0 ? dbGames : libGames;
        const cacheKey = `${ageGroup}-${subject}`;
        newDbGamesCache[cacheKey] = dbGames;

        return {
          file, label, ageGroup, subject, color,
          totalGames: source.length,
          games: source.map((g, idx) => {
            const key = `${ageGroup}-${subject}-${idx}`;
            const stat = stats[key] || { players: 0, timesPlayed: 0, avgScore: null };
            return {
              index: idx,
              id: g.id,
              title: g.title || `Game ${idx + 1}`,
              type: g.type || '-',
              ageGroup,
              category: subject,
              questionCount: dbGames.length > 0 ? (g.totalQuestions || g.gameData?.questions?.length || 0) : (g.gameData?.questions?.length || 0),
              totalQuestions: g.totalQuestions || g.gameData?.questions?.length || 0,
              players: stat.players,
              timesPlayed: stat.timesPlayed,
              avgScore: stat.avgScore,
              // full DB game object for editing
              _raw: dbGames.length > 0 ? g : null,
            };
          }),
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

  useEffect(() => { fetchStats(); }, []);

  const openModal = (file, label, currentGames, currentAvgQ, ageGroup, subject) => {
    setModal({ file, label, ageGroup, subject, gamesValue: String(currentGames), questionsValue: String(currentAvgQ || '') });
  };

  const openSyncAndEditModal = (games, label, ageGroup, subject) => {
    setSyncAndEdit({ games, label, ageGroup, subject });
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
          category: subject,
        });
      }

      if (questions && questions > 0) {
        const dbGames = await base44.entities.Game.filter({ ageGroup, category: subject, isPublished: true });
        // Only process games that need more questions (skip yang dah cukup)
        const needsUpdate = dbGames.filter(g => (g.gameData?.questions?.length || 0) < questions);
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
                gameId: g.id,
              });
              done++;
            } catch (err) {
              failed++;
              console.error(`Skip game ${g.id}: ${err.message}`);
            }
            // Delay antara games untuk elak rate limit
            if (i < needsUpdate.length - 1) {
              await new Promise(r => setTimeout(r, 5000));
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
        const dbTitles = new Set(dbGames.map(g => g.title));

        const newGames = libGames
          .filter(g => !dbTitles.has(g.title))
          .map((g, idx) => ({
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
            isPublished: true,
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
  const totalFull = subjects.reduce((a, s) => a + s.games.filter(g => g.questionCount >= 20).length, 0);

  return (
    <div className="min-h-screen pb-32 bg-pattern relative overflow-hidden">

      <AppHeader showBack={true} backTo="/admin-dashboard" />

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

      <AnimatePresence>
        {modal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setModal(null)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.92, y: 40 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.92, y: 40 }}
              transition={{ type: 'spring', damping: 22, stiffness: 300 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden"
            >
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
                      onChange={e => setModal(m => ({ ...m, gamesValue: e.target.value }))}
                      placeholder="e.g. 25"
                      className="w-full p-3.5 border-2 border-gray-200 rounded-2xl focus:border-game-purple focus:outline-none text-2xl font-black text-center bg-gray-50 transition-all"
                    />
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
                      onChange={e => setModal(m => ({ ...m, questionsValue: e.target.value }))}
                      placeholder="e.g. 20"
                      className="w-full p-3.5 border-2 border-gray-200 rounded-2xl focus:border-game-purple focus:outline-none text-2xl font-black text-center bg-gray-50 transition-all"
                    />
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
                  className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-game-purple to-game-pink text-white font-bold text-sm disabled:opacity-40 shadow-lg shadow-purple-200 transition-all hover:shadow-xl"
                >
                  ✅ Apply
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-4xl mx-auto px-3 md:px-4 pt-20 md:pt-24">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 md:mb-6 gap-3">
          <div>
            <h1 className="text-xl md:text-2xl font-black text-gray-900">🎮 Game Manager</h1>
            <p className="text-gray-600 text-xs md:text-sm font-semibold">Database semua games & soalan</p>
          </div>
          <div className="flex items-center gap-1.5 md:gap-2 flex-wrap">
            <button
              onClick={handleSyncToDB}
              disabled={!!actionLoading}
              title="Export games baru ke Database (skip yang sedia ada)"
              className="flex items-center gap-1 px-2 md:px-3 py-1.5 md:py-2 bg-gradient-to-r from-game-purple to-game-blue text-white rounded-lg md:rounded-xl shadow text-xs font-bold transition-all disabled:opacity-50 hover:shadow-lg"
            >
              {actionLoading === 'import' ? <Loader2 className="w-3 h-3 md:w-4 md:h-4 animate-spin" /> : <Database className="w-3 h-3 md:w-4 md:h-4" />}
              <span className="hidden sm:inline">Export to DB</span>
              <span className="sm:hidden">Export</span>
            </button>
            <button
              onClick={async () => {
                if (!window.confirm('Buang semua soalan kosong dari database?')) return;
                setActionLoading('clean');
                showToast('⏳ Membersihkan soalan kosong...', true);
                try {
                  const res = await base44.functions.invoke('cleanEmptyQuestions', {});
                  showToast(`✅ ${res.data.totalRemoved} soalan kosong dibuang dari ${res.data.cleaned} games!`);
                  await fetchStats();
                } catch (err) {
                  showToast('❌ ' + err.message, false);
                } finally {
                  setActionLoading(null);
                }
              }}
              disabled={!!actionLoading}
              title="Buang soalan kosong"
              className="flex items-center gap-1 px-2 md:px-3 py-1.5 md:py-2 bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-lg md:rounded-xl shadow text-xs font-bold transition-all disabled:opacity-50 hover:shadow-lg"
            >
              {actionLoading === 'clean' ? <Loader2 className="w-3 h-3 md:w-4 md:h-4 animate-spin" /> : <Trash2 className="w-3 h-3 md:w-4 md:h-4" />}
              <span className="hidden sm:inline">Clean</span>
              <span className="sm:hidden">C</span>
            </button>
            <button onClick={fetchStats} disabled={loading} className="p-1.5 md:p-2.5 bg-white/40 backdrop-blur-xl rounded-lg md:rounded-xl shadow border-2 border-white/30 hover:bg-white/60 transition-all">
              <RefreshCw className={`w-4 h-4 md:w-5 md:h-5 text-gray-600 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </motion.div>

        <div className="grid grid-cols-3 gap-2 md:gap-3 mb-4 md:mb-6">
          {[
            { value: totalGames, label: 'Total Games', color: 'text-game-purple' },
            { value: totalFull, label: 'Soalan Penuh', color: 'text-green-600' },
            { value: totalPlayers, label: 'Total Players', color: 'text-game-pink' },
          ].map(({ value, label, color }, i) => (
            <motion.div key={label} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.08 }}
              whileHover={{ y: -2, scale: 1.02 }}
              className="bg-white/40 backdrop-blur-xl rounded-2xl p-2 md:p-3 shadow-xl border-2 border-white/30 text-center">
              <p className={`text-lg md:text-2xl font-black ${color}`}>{value}</p>
              <p className="text-xs text-gray-600 font-semibold">{label}</p>
            </motion.div>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-game-purple" />
          </div>
        ) : (
          <>
            {/* Prasekolah */}
            <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3 mt-4 md:mt-0">
              <button
                onClick={() => setCollapsedSections(prev => ({ ...prev, prasekolah: !prev.prasekolah }))}
                className="p-1.5 hover:bg-white/40 rounded-lg transition-all"
              >
                {collapsedSections.prasekolah ? <ChevronRight className="w-4 h-4 md:w-5 md:h-5 text-gray-500" /> : <ChevronDown className="w-4 h-4 md:w-5 md:h-5 text-gray-500" />}
              </button>
              <div className="text-base md:text-lg font-black text-gray-700">🧒 Prasekolah</div>
              <div className="flex-1 h-px bg-gradient-to-r from-amber-300/60 to-transparent" />
            </div>
            {!collapsedSections.prasekolah && subjects.filter(s => s.ageGroup === 'prasekolah').map((s, idx) => {
               // strip prefix from label for cleaner display
               const shortLabel = s.label.replace('Prasekolah - ', '');
               const isExpanded = expandedFile === s.file;
               const avgQ = s.games.length > 0 ? Math.round(s.games.reduce((a, g) => a + g.questionCount, 0) / s.games.length) : 0;

               return (
                 <motion.div
                   key={s.file}
                   initial={{ opacity: 0, y: 8 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ delay: idx * 0.04 }}
                   className={`bg-white/40 backdrop-blur-xl rounded-2xl shadow-xl border-2 border-white/30 border-l-4 ${s.color.border} mb-2 md:mb-3 overflow-hidden`}
                 >
                   <div className="flex items-center justify-between px-3 md:px-4 py-2.5 md:py-3 gap-2">
                     <button
                       onClick={() => setExpandedFile(isExpanded ? null : s.file)}
                       className="flex items-center gap-2 md:gap-3 flex-1 text-left min-w-0"
                     >
                       <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${s.color.dot}`} />
                       <div className="min-w-0">
                         <p className="font-black text-gray-900 text-xs md:text-sm truncate">{shortLabel}</p>
                         <p className="text-xs text-gray-500 truncate">{s.totalGames} games · {avgQ}q</p>
                       </div>
                     </button>

                     <div className="flex items-center gap-0.5 md:gap-2 flex-shrink-0">
                       <span className={`text-xs font-bold px-2 md:px-2.5 py-0.5 md:py-1 rounded-lg md:rounded-full text-xs md:text-xs ${s.color.badge}`}>{s.totalGames}</span>
                       {s.games.reduce((a, g) => a + g.players, 0) > 0 && (
                         <span className="hidden sm:inline text-xs font-bold px-2.5 py-1 rounded-full bg-pink-100 text-pink-600 flex items-center gap-1">
                           <Users className="w-3 h-3" />{s.games.reduce((a, g) => a + g.players, 0)}
                         </span>
                       )}
                       <button
                         onClick={() => openModal(s.file, s.label, s.totalGames, avgQ, s.ageGroup, s.subject)}
                         disabled={!!actionLoading}
                         className="flex items-center gap-1.5 px-2.5 md:px-3 py-1.5 md:py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg border border-indigo-200 transition-all text-xs font-bold"
                       >
                         {actionLoading === s.file ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Edit3 className="w-3 h-3 md:w-3.5 md:h-3.5" />}
                         <span className="hidden sm:inline">Sync</span>
                       </button>

                       <button
                         onClick={async () => {
                           const verifyKey = `verify-${s.file}`;
                           setActionLoading(verifyKey);
                           showToast(`⏳ Kira & Semak ${s.label}...`, true);
                           try {
                             const dbGames = dbGamesCache[`${s.ageGroup}-${s.subject}`] || [];
                             if (dbGames.length === 0) { showToast('Tiada data untuk di-proses', false); setActionLoading(null); return; }

                             // Step 1: Sync question counts
                             let fixed = 0;
                             for (const g of dbGames) {
                               const actualCount = g.gameData?.questions?.length || 0;
                               if (g.totalQuestions !== actualCount) {
                                 await base44.entities.Game.update(g.id, { totalQuestions: actualCount });
                                 fixed++;
                               }
                             }

                             // Step 2: Verify quality
                             let verified = 0;
                             let flagged = 0;
                             const total = dbGames.length;
                             for (let i = 0; i < dbGames.length; i++) {
                               const game = dbGames[i];
                               if (!game.gameData?.questions?.length) continue;
                               try {
                                 showToast(`⏳ Verifying ${s.label}... ${i + 1}/${total}`, true);
                                 const result = await base44.functions.invoke('validateGameQuestionsQuality', {
                                   gameId: game.id,
                                   ageGroup: game.ageGroup,
                                   category: game.category,
                                   questions: game.gameData.questions,
                                 });
                                 if (result.data.validation.summary.invalid_count > 0) {
                                   flagged++;
                                   console.warn(`Game "${game.title}" flagged:`, result.data.validation.summary);
                                 } else {
                                   verified++;
                                 }
                               } catch (e) {
                                 console.error(`Skip game ${game.id}:`, e.message);
                               }
                             }
                             showToast(`✅ Kira: ${fixed} updated · Semak: ${verified} clean, ${flagged} flagged`);
                             await fetchStats();
                           } catch (err) {
                             showToast('❌ ' + err.message, false);
                           } finally {
                             setActionLoading(null);
                           }
                         }}
                         disabled={!!actionLoading}
                         className="flex items-center gap-1.5 px-2.5 md:px-3 py-1.5 md:py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg border border-blue-200 transition-all text-xs font-bold"
                       >
                         {actionLoading === `verify-${s.file}` ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3 h-3 md:w-3.5 md:h-3.5" />}
                         <span className="hidden sm:inline">Kira & Semak</span>
                       </button>
                       <button onClick={() => setExpandedFile(isExpanded ? null : s.file)} className="p-0.5 md:p-1">
                         {isExpanded ? <ChevronDown className="w-3 h-3 md:w-4 md:h-4 text-gray-400" /> : <ChevronRight className="w-3 h-3 md:w-4 md:h-4 text-gray-400" />}
                       </button>
                     </div>
                  </div>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden border-t border-white/30"
                      >
                        <div className="hidden md:grid grid-cols-12 gap-1 px-4 py-2 bg-amber-50/50 text-xs font-bold text-gray-400 uppercase tracking-wide">
                          <span className="col-span-1">#</span>
                          <span className="col-span-4">Nama Game</span>
                          <span className="col-span-2">Type</span>
                          <span className="col-span-2 text-center">Soalan</span>
                          <span className="col-span-2 text-center">Players</span>
                          <span className="col-span-1"></span>
                        </div>
                        <div className="max-h-52 md:max-h-64 overflow-y-auto">
                          {s.games.map((g) => (
                            <div key={g.index} className="hidden md:grid grid-cols-12 gap-1 items-center px-4 py-2.5 border-b border-amber-100/50 hover:bg-white/30 transition-all">
                              <span className="col-span-1 text-xs font-bold text-gray-300">{g.index + 1}</span>
                              <span className="col-span-4 text-xs font-semibold text-gray-800 truncate">{g.title}</span>
                              <span className="col-span-2 text-xs text-gray-400 truncate">{g.type}</span>
                              <div className="col-span-2 flex justify-center">
                                <span className={`text-xs font-black px-2 py-0.5 rounded-full ${
                                  g.questionCount >= 20 ? 'bg-green-100 text-green-700' :
                                  g.questionCount >= 10 ? 'bg-yellow-100 text-yellow-700' :
                                  'bg-red-100 text-red-600'
                                }`}>{g.questionCount}</span>
                              </div>
                              <div className="col-span-2 flex justify-center">
                                {g.players > 0 ? (
                                  <span className="text-xs font-bold text-pink-500 flex items-center gap-0.5">
                                    <Users className="w-3 h-3" />{g.players}
                                  </span>
                                ) : <span className="text-xs text-gray-200">—</span>}
                              </div>
                              <div className="col-span-1 flex justify-end pr-1">
                                {g._raw && (
                                  <button
                                    onClick={() => setEditGame(g._raw)}
                                    className="p-1 text-indigo-400 hover:bg-indigo-50 rounded-lg transition-all"
                                    title="Edit game ini"
                                  >
                                    <Edit3 className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                          <div className="md:hidden space-y-2 p-3">
                            {s.games.map((g) => (
                              <div key={g.index} className="bg-white/40 rounded-lg p-2.5 border border-amber-100/50">
                                <div className="flex items-start justify-between gap-2 mb-1">
                                  <div className="flex-1">
                                    <p className="text-xs font-bold text-gray-800">{g.index + 1}. {g.title}</p>
                                    <p className="text-xs text-gray-500 mt-0.5">{g.type}</p>
                                  </div>
                                  {g._raw && (
                                    <button
                                      onClick={() => setEditGame(g._raw)}
                                      className="p-1 text-indigo-400 hover:bg-indigo-50 rounded-lg transition-all"
                                      title="Edit game ini"
                                    >
                                      <Edit3 className="w-3 h-3" />
                                    </button>
                                  )}
                                </div>
                                <div className="flex gap-2">
                                  <span className={`text-xs font-black px-1.5 py-0.5 rounded-full text-xs ${
                                    g.questionCount >= 20 ? 'bg-green-100 text-green-700' :
                                    g.questionCount >= 10 ? 'bg-yellow-100 text-yellow-700' :
                                    'bg-red-100 text-red-600'
                                  }`}>{g.questionCount}Q</span>
                                  {g.players > 0 && (
                                    <span className="text-xs font-bold text-pink-500 flex items-center gap-0.5">
                                      <Users className="w-3 h-3" />{g.players}
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}

            {/* Sekolah Rendah */}
            <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3 mt-6">
              <button
                onClick={() => setCollapsedSections(prev => ({ ...prev, sekolah_rendah: !prev.sekolah_rendah }))}
                className="p-1.5 hover:bg-white/40 rounded-lg transition-all"
              >
                {collapsedSections.sekolah_rendah ? <ChevronRight className="w-4 h-4 md:w-5 md:h-5 text-gray-500" /> : <ChevronDown className="w-4 h-4 md:w-5 md:h-5 text-gray-500" />}
              </button>
              <div className="text-base md:text-lg font-black text-gray-700">🎒 Sekolah Rendah</div>
              <div className="flex-1 h-px bg-gradient-to-r from-amber-300/60 to-transparent" />
            </div>
            {!collapsedSections.sekolah_rendah && subjects.filter(s => s.ageGroup === 'sekolah_rendah').map((s, idx) => {
              const isExpanded = expandedFile === s.file;
              const avgQ = s.games.length > 0 ? Math.round(s.games.reduce((a, g) => a + g.questionCount, 0) / s.games.length) : 0;
              return (
                <motion.div
                  key={s.file}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.04 }}
                  className={`bg-white/40 backdrop-blur-xl rounded-2xl shadow-xl border-2 border-white/30 border-l-4 ${s.color.border} mb-3 overflow-hidden`}
                >
                  <div className="flex items-center justify-between px-3 md:px-4 py-2.5 md:py-3 gap-2">
                    <button onClick={() => setExpandedFile(isExpanded ? null : s.file)} className="flex items-center gap-2 md:gap-3 flex-1 text-left min-w-0">
                      <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${s.color.dot}`} />
                      <div className="min-w-0">
                        <p className="font-black text-gray-900 text-xs md:text-sm truncate">{s.label.replace('Sekolah Rendah - ', '')}</p>
                        <p className="text-xs text-gray-500 truncate">{s.totalGames} games · {avgQ}q</p>
                      </div>
                    </button>
                    <div className="flex items-center gap-0.5 md:gap-2 flex-shrink-0">
                      <span className={`text-xs font-bold px-2 md:px-2.5 py-0.5 md:py-1 rounded-lg md:rounded-full text-xs md:text-xs ${s.color.badge}`}>{s.totalGames}</span>
                      {s.games.reduce((a, g) => a + g.players, 0) > 0 && (
                        <span className="hidden sm:inline text-xs font-bold px-2.5 py-1 rounded-full bg-pink-100 text-pink-600 flex items-center gap-1">
                          <Users className="w-3 h-3" />{s.games.reduce((a, g) => a + g.players, 0)}
                        </span>
                      )}
                      <button onClick={() => { const games = dbGamesCache[`${s.ageGroup}-${s.subject}`] || []; if (games.length === 0) { showToast('Import ke DB dulu', false); return; } openSyncAndEditModal(games, s.label, s.ageGroup, s.subject); }} disabled={!!actionLoading} className="flex items-center gap-1.5 px-2.5 md:px-3 py-1.5 md:py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg border border-indigo-200 transition-all text-xs font-bold">
                       {actionLoading === s.file ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Edit3 className="w-3 h-3 md:w-3.5 md:h-3.5" />}
                       <span className="hidden sm:inline">Sync & Edit</span>
                      </button>
                      <button
                        onClick={async () => {
                          const verifyKey = `verify-${s.file}`;
                          setActionLoading(verifyKey);
                          showToast(`⏳ Kira & Semak ${s.label}...`, true);
                          try {
                            const dbGames = dbGamesCache[`${s.ageGroup}-${s.subject}`] || [];
                            if (dbGames.length === 0) { showToast('Tiada data untuk di-proses', false); setActionLoading(null); return; }

                            // Step 1: Sync question counts
                            let fixed = 0;
                            for (const g of dbGames) {
                              const actualCount = g.gameData?.questions?.length || 0;
                              if (g.totalQuestions !== actualCount) {
                                await base44.entities.Game.update(g.id, { totalQuestions: actualCount });
                                fixed++;
                              }
                            }

                            // Step 2: Verify quality
                            let verified = 0;
                            let flagged = 0;
                            const total = dbGames.length;
                            for (let i = 0; i < dbGames.length; i++) {
                              const game = dbGames[i];
                              if (!game.gameData?.questions?.length) continue;
                              try {
                                showToast(`⏳ Verifying ${s.label}... ${i + 1}/${total}`, true);
                                const result = await base44.functions.invoke('validateGameQuestionsQuality', {
                                  gameId: game.id,
                                  ageGroup: game.ageGroup,
                                  category: game.category,
                                  questions: game.gameData.questions,
                                });
                                if (result.data.validation.summary.invalid_count > 0) {
                                  flagged++;
                                  console.warn(`Game "${game.title}" flagged:`, result.data.validation.summary);
                                } else {
                                  verified++;
                                }
                              } catch (e) {
                                console.error(`Skip game ${game.id}:`, e.message);
                              }
                            }
                            showToast(`✅ Kira: ${fixed} updated · Semak: ${verified} clean, ${flagged} flagged`);
                            await fetchStats();
                          } catch (err) {
                            showToast('❌ ' + err.message, false);
                          } finally {
                            setActionLoading(null);
                          }
                        }}
                        disabled={!!actionLoading}
                        className="flex items-center gap-1.5 px-2.5 md:px-3 py-1.5 md:py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg border border-blue-200 transition-all text-xs font-bold"
                      >
                        {actionLoading === `verify-${s.file}` ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3 h-3 md:w-3.5 md:h-3.5" />}
                        <span className="hidden sm:inline">Kira & Semak</span>
                      </button>
                      <button onClick={() => setExpandedFile(isExpanded ? null : s.file)} className="p-0.5 md:p-1">
                        {isExpanded ? <ChevronDown className="w-3 h-3 md:w-4 md:h-4 text-gray-400" /> : <ChevronRight className="w-3 h-3 md:w-4 md:h-4 text-gray-400" />}
                      </button>
                    </div>
                  </div>
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden border-t border-white/30">
                        <div className="hidden md:grid grid-cols-12 gap-1 px-4 py-2 bg-amber-50/50 text-xs font-bold text-gray-400 uppercase tracking-wide">
                          <span className="col-span-1">#</span><span className="col-span-4">Nama Game</span><span className="col-span-2">Type</span><span className="col-span-2 text-center">Soalan</span><span className="col-span-2 text-center">Players</span><span className="col-span-1"></span>
                        </div>
                        <div className="max-h-52 md:max-h-64 overflow-y-auto">
                          {s.games.map((g) => (
                            <div key={g.index} className="hidden md:grid grid-cols-12 gap-1 items-center px-4 py-2.5 border-b border-amber-100/50 hover:bg-white/30 transition-all">
                              <span className="col-span-1 text-xs font-bold text-gray-300">{g.index + 1}</span>
                              <span className="col-span-4 text-xs font-semibold text-gray-800 truncate">{g.title}</span>
                              <span className="col-span-2 text-xs text-gray-400 truncate">{g.type}</span>
                              <div className="col-span-2 flex justify-center">
                                <span className={`text-xs font-black px-2 py-0.5 rounded-full ${g.questionCount >= 20 ? 'bg-green-100 text-green-700' : g.questionCount >= 10 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-600'}`}>{g.questionCount}</span>
                              </div>
                              <div className="col-span-2 flex justify-center">
                                {g.players > 0 ? <span className="text-xs font-bold text-pink-500 flex items-center gap-0.5"><Users className="w-3 h-3" />{g.players}</span> : <span className="text-xs text-gray-200">—</span>}
                              </div>
                              <div className="col-span-1 flex justify-end pr-1">
                                {g._raw && <button onClick={() => setEditGame(g._raw)} className="p-1 text-indigo-400 hover:bg-indigo-50 rounded-lg transition-all" title="Edit game ini"><Edit3 className="w-3 h-3" /></button>}
                              </div>
                            </div>
                          ))}
                          <div className="md:hidden space-y-2 p-3">
                            {s.games.map((g) => (
                              <div key={g.index} className="bg-white/40 rounded-lg p-2.5 border border-amber-100/50">
                                <div className="flex items-start justify-between gap-2 mb-1">
                                  <div className="flex-1">
                                    <p className="text-xs font-bold text-gray-800">{g.index + 1}. {g.title}</p>
                                    <p className="text-xs text-gray-500 mt-0.5">{g.type}</p>
                                  </div>
                                  {g._raw && (
                                    <button
                                      onClick={() => setEditGame(g._raw)}
                                      className="p-1 text-indigo-400 hover:bg-indigo-50 rounded-lg transition-all"
                                      title="Edit game ini"
                                    >
                                      <Edit3 className="w-3 h-3" />
                                    </button>
                                  )}
                                </div>
                                <div className="flex gap-2">
                                  <span className={`text-xs font-black px-1.5 py-0.5 rounded-full text-xs ${
                                    g.questionCount >= 20 ? 'bg-green-100 text-green-700' :
                                    g.questionCount >= 10 ? 'bg-yellow-100 text-yellow-700' :
                                    'bg-red-100 text-red-600'
                                  }`}>{g.questionCount}Q</span>
                                  {g.players > 0 && (
                                    <span className="text-xs font-bold text-pink-500 flex items-center gap-0.5">
                                      <Users className="w-3 h-3" />{g.players}
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
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
                {GAME_HUB.map(g => (
                  <div key={g.id} className="bg-orange-50/80 border border-orange-200 rounded-lg md:rounded-xl px-2 md:px-3 py-1.5 md:py-2 flex items-center gap-1 md:gap-2">
                    <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-orange-400 flex-shrink-0" />
                    <span className="text-xs font-semibold text-orange-800 truncate">{g.title}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Single Game Edit Modal */}
      <AnimatePresence>
        {editGame && (
          <EditGameModal
            game={editGame}
            onClose={() => setEditGame(null)}
            onSaved={() => { showToast('✅ Game berjaya disimpan!'); fetchStats(); }}
          />
        )}
      </AnimatePresence>

      {/* Sync & Edit Modal */}
      <AnimatePresence>
        {syncAndEdit && (
          <SyncAndEditModal
            games={syncAndEdit.games}
            subjectLabel={syncAndEdit.label}
            ageGroup={syncAndEdit.ageGroup}
            subject={syncAndEdit.subject}
            onClose={() => setSyncAndEdit(null)}
            onSaved={() => { showToast('✅ Proses selesai!'); fetchStats(); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}