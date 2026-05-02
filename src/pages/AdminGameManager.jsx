import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Loader2, ChevronDown, ChevronRight, RefreshCw, Users, Edit3, X, Database, Layers, Trash2, RotateCcw } from 'lucide-react';
import AppHeader from '@/components/AppHeader';
import { gameLibrary } from '@/lib/gameLibrary';
import EditGameModal from '@/components/admin/EditGameModal';
import BulkEditModal from '@/components/admin/BulkEditModal';

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
  const [bulkEdit, setBulkEdit] = useState(null); // { games, label, ageGroup, subject }
  const [dbGamesCache, setDbGamesCache] = useState({}); // cache DB games by subject key

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
    <div className="min-h-screen pb-32 relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)' }}
    >
      {/* Ambient blobs */}
      <div className="fixed top-[-10%] left-[-10%] w-96 h-96 rounded-full opacity-20 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, #7c3aed, transparent)' }} />
      <div className="fixed bottom-[-10%] right-[-10%] w-96 h-96 rounded-full opacity-20 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, #2563eb, transparent)' }} />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-10 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, #ec4899, transparent)' }} />

      <AppHeader showBack={true} backTo="/admin-dashboard" />

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-5 left-1/2 -translate-x-1/2 z-[60] px-5 py-3 rounded-2xl shadow-xl font-bold text-white text-sm backdrop-blur-md border ${toast.ok ? 'bg-green-500/80 border-green-400/40' : 'bg-red-500/80 border-red-400/40'}`}
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
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={e => e.stopPropagation()}
              className="rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-white/20"
              style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(24px)' }}
            >
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-black text-white">✏️ Edit Database</h3>
                <button onClick={() => setModal(null)} className="p-1 hover:bg-white/10 rounded-lg transition-all">
                  <X className="w-5 h-5 text-white/60" />
                </button>
              </div>
              <p className="text-sm text-white/50 mb-5">{modal.label}</p>

              <div className="space-y-4 mb-5">
                <div>
                  <label className="block text-xs font-bold text-white/50 mb-1.5">🎮 Bilangan Games (semasa: {modal.gamesValue})</label>
                  <input
                    type="number"
                    min="1"
                    autoFocus
                    value={modal.gamesValue}
                    onChange={e => setModal(m => ({ ...m, gamesValue: e.target.value }))}
                    placeholder="e.g. 25"
                    className="w-full p-3 rounded-xl focus:outline-none text-lg font-black text-center text-white border border-white/20 focus:border-violet-400"
                    style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(8px)' }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-white/50 mb-1.5">📝 Soalan per Game (semasa: {modal.questionsValue || '—'})</label>
                  <input
                    type="number"
                    min="1"
                    value={modal.questionsValue}
                    onChange={e => setModal(m => ({ ...m, questionsValue: e.target.value }))}
                    placeholder="e.g. 20"
                    className="w-full p-3 rounded-xl focus:outline-none text-lg font-black text-center text-white border border-white/20 focus:border-violet-400"
                    style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(8px)' }}
                  />
                </div>
              </div>

              <p className="text-xs text-white/30 mb-4 text-center">Kosongkan mana-mana field untuk tidak ubah</p>

              <div className="flex gap-3">
                <button onClick={() => setModal(null)} className="flex-1 py-2.5 rounded-xl border border-white/20 text-white/70 font-bold text-sm hover:bg-white/10 transition-all">Batal</button>
                <button
                  onClick={handleModalConfirm}
                  disabled={(!modal.gamesValue || parseInt(modal.gamesValue) < 1) && (!modal.questionsValue || parseInt(modal.questionsValue) < 1)}
                  className="flex-1 py-2.5 rounded-xl font-bold text-sm text-white disabled:opacity-40 transition-all"
                  style={{ background: 'linear-gradient(135deg, #7c3aed, #2563eb)' }}
                >
                  Apply
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-4xl mx-auto px-4 pt-24">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-black text-white">🎮 Game Manager</h1>
            <p className="text-white/40 text-sm">Database semua games & soalan</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSyncToDB}
              disabled={!!actionLoading}
              title="Sync games baru ke Database (skip yang sedia ada)"
              className="flex items-center gap-1.5 px-3 py-2 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50 border border-violet-400/40 hover:border-violet-400"
              style={{ background: 'rgba(124,58,237,0.3)', backdropFilter: 'blur(8px)' }}
            >
              {actionLoading === 'import' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4" />}
              Sync DB
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
              className="flex items-center gap-1.5 px-3 py-2 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50 border border-red-400/40 hover:border-red-400"
              style={{ background: 'rgba(239,68,68,0.25)', backdropFilter: 'blur(8px)' }}
            >
              {actionLoading === 'clean' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              Clean
            </button>
            <button
              onClick={fetchStats}
              disabled={loading}
              className="p-2.5 rounded-xl border border-white/20 hover:bg-white/10 transition-all"
              style={{ background: 'rgba(255,255,255,0.07)', backdropFilter: 'blur(8px)' }}
            >
              <RefreshCw className={`w-5 h-5 text-white/60 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { value: totalGames, label: 'Total Games', color: 'text-violet-300' },
            { value: totalFull, label: 'Soalan Penuh', color: 'text-emerald-300' },
            { value: totalPlayers, label: 'Total Players', color: 'text-pink-300' },
          ].map(({ value, label, color }) => (
            <div key={label} className="rounded-2xl p-3 text-center border border-white/10"
              style={{ background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(12px)' }}>
              <p className={`text-2xl font-black ${color}`}>{value}</p>
              <p className="text-xs text-white/40 font-semibold">{label}</p>
            </div>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-violet-400" />
          </div>
        ) : (
          <>
            {subjects.map((s, idx) => {
              const isExpanded = expandedFile === s.file;
              const avgQ = s.games.length > 0 ? Math.round(s.games.reduce((a, g) => a + g.questionCount, 0) / s.games.length) : 0;

              return (
                <motion.div
                  key={s.file}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.04 }}
                  className={`rounded-2xl border border-white/10 border-l-4 ${s.color.border} mb-3 overflow-hidden`}
                  style={{ background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(16px)' }}
                >
                  <div className="flex items-center justify-between px-4 py-3">
                    <button
                      onClick={() => setExpandedFile(isExpanded ? null : s.file)}
                      className="flex items-center gap-3 flex-1 text-left"
                    >
                      <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${s.color.dot}`} />
                      <div>
                        <p className="font-black text-white text-sm">{s.label}</p>
                        <p className="text-xs text-white/40">{s.totalGames} games · avg {avgQ} soalan</p>
                      </div>
                    </button>

                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${s.color.badge} opacity-90`}>{s.totalGames}</span>
                      {s.games.reduce((a, g) => a + g.players, 0) > 0 && (
                        <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-pink-500/20 text-pink-300 border border-pink-400/30 flex items-center gap-1">
                          <Users className="w-3 h-3" />{s.games.reduce((a, g) => a + g.players, 0)}
                        </span>
                      )}
                      <button
                        onClick={() => openModal(s.file, s.label, s.totalGames, avgQ, s.ageGroup, s.subject)}
                        disabled={!!actionLoading}
                        className="p-1.5 rounded-lg border border-violet-400/30 text-violet-300 hover:bg-violet-500/20 transition-all"
                        title="Sync games & soalan"
                      >
                        {actionLoading === s.file ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Edit3 className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        onClick={() => {
                          const dbGames = dbGamesCache[`${s.ageGroup}-${s.subject}`] || [];
                          if (dbGames.length === 0) { showToast('Import ke DB dulu sebelum bulk edit', false); return; }
                          setBulkEdit({ games: dbGames, label: s.label, ageGroup: s.ageGroup, subject: s.subject });
                        }}
                        disabled={!!actionLoading}
                        className="p-1.5 rounded-lg border border-purple-400/30 text-purple-300 hover:bg-purple-500/20 transition-all"
                        title="Bulk Edit games"
                      >
                        <Layers className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={async () => {
                          const syncKey = `sync-${s.file}`;
                          setActionLoading(syncKey);
                          showToast(`⏳ Sync ${s.label}...`, true);
                          try {
                            const dbGames = dbGamesCache[`${s.ageGroup}-${s.subject}`] || [];
                            if (dbGames.length === 0) { showToast('Tiada data DB untuk di-sync', false); return; }
                            let fixed = 0;
                            for (const g of dbGames) {
                              const actualCount = g.gameData?.questions?.length || 0;
                              if (g.totalQuestions !== actualCount) {
                                await base44.entities.Game.update(g.id, { totalQuestions: actualCount });
                                fixed++;
                              }
                            }
                            showToast(`✅ Sync selesai! ${fixed} games dikemas kini.`);
                            await fetchStats();
                          } catch (err) {
                            showToast('❌ ' + err.message, false);
                          } finally {
                            setActionLoading(null);
                          }
                        }}
                        disabled={!!actionLoading}
                        className="p-1.5 rounded-lg border border-emerald-400/30 text-emerald-300 hover:bg-emerald-500/20 transition-all"
                        title="Sync totalQuestions ke frontend"
                      >
                        {actionLoading === `sync-${s.file}` ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RotateCcw className="w-3.5 h-3.5" />}
                      </button>
                      <button onClick={() => setExpandedFile(isExpanded ? null : s.file)} className="p-1">
                        {isExpanded ? <ChevronDown className="w-4 h-4 text-white/40" /> : <ChevronRight className="w-4 h-4 text-white/40" />}
                      </button>
                    </div>
                  </div>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden border-t border-white/10"
                      >
                        <div className="grid grid-cols-12 gap-1 px-4 py-2 text-xs font-bold text-white/30 uppercase tracking-wide"
                          style={{ background: 'rgba(255,255,255,0.03)' }}>
                          <span className="col-span-1">#</span>
                          <span className="col-span-4">Nama Game</span>
                          <span className="col-span-2">Type</span>
                          <span className="col-span-2 text-center">Soalan</span>
                          <span className="col-span-2 text-center">Players</span>
                          <span className="col-span-1"></span>
                        </div>
                        <div className="max-h-64 overflow-y-auto divide-y divide-white/5">
                          {s.games.map((g) => (
                            <div key={g.index} className="grid grid-cols-12 gap-1 items-center px-4 py-2.5 hover:bg-white/5 transition-all">
                              <span className="col-span-1 text-xs font-bold text-white/20">{g.index + 1}</span>
                              <span className="col-span-4 text-xs font-semibold text-white/80 truncate">{g.title}</span>
                              <span className="col-span-2 text-xs text-white/30 truncate">{g.type}</span>
                              <div className="col-span-2 flex justify-center">
                                <span className={`text-xs font-black px-2 py-0.5 rounded-full ${
                                  g.questionCount >= 20 ? 'bg-emerald-500/20 text-emerald-300' :
                                  g.questionCount >= 10 ? 'bg-yellow-500/20 text-yellow-300' :
                                  'bg-red-500/20 text-red-300'
                                }`}>{g.questionCount}</span>
                              </div>
                              <div className="col-span-2 flex justify-center">
                                {g.players > 0 ? (
                                  <span className="text-xs font-bold text-pink-300 flex items-center gap-0.5">
                                    <Users className="w-3 h-3" />{g.players}
                                  </span>
                                ) : <span className="text-xs text-white/10">—</span>}
                              </div>
                              <div className="col-span-1 flex justify-end pr-1">
                                {g._raw && (
                                  <button
                                    onClick={() => setEditGame(g._raw)}
                                    className="p-1 text-violet-300 hover:bg-violet-500/20 rounded-lg transition-all"
                                    title="Edit game ini"
                                  >
                                    <Edit3 className="w-3 h-3" />
                                  </button>
                                )}
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

            <div className="rounded-2xl border border-white/10 border-l-4 border-l-orange-400 p-4 mt-3"
              style={{ background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(16px)' }}>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="font-black text-white">🎪 Game Hub Mini-Games</p>
                  <p className="text-xs text-white/40">{GAME_HUB.length} mini-games aktif</p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-orange-500/20 text-orange-300 border border-orange-400/30">{GAME_HUB.length} games</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {GAME_HUB.map(g => (
                  <div key={g.id} className="rounded-xl px-3 py-2 flex items-center gap-2 border border-orange-400/20"
                    style={{ background: 'rgba(251,146,60,0.1)' }}>
                    <div className="w-2 h-2 rounded-full bg-orange-400 flex-shrink-0" />
                    <span className="text-xs font-semibold text-orange-200 truncate">{g.title}</span>
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

      {/* Bulk Edit Modal */}
      <AnimatePresence>
        {bulkEdit && (
          <BulkEditModal
            games={bulkEdit.games}
            subjectLabel={bulkEdit.label}
            onClose={() => setBulkEdit(null)}
            onSaved={() => { showToast('✅ Bulk edit berjaya!'); fetchStats(); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}