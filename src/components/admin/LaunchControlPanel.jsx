import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { CheckCircle2, AlertTriangle, RefreshCw, Play, Loader2, Trash2, Settings, Zap, Lock, Unlock } from 'lucide-react';
import LaunchSettingsModal from '@/components/admin/LaunchSettingsModal';
import BackgroundProgressPanel from '@/components/admin/BackgroundProgressPanel';

const SUBJECT_LABELS = {
  bahasa_melayu: 'BM', english: 'English', mathematics: 'Math', science: 'Sains', jawi: 'Jawi',
};

const LEVEL_LABELS = {
  prasekolah: 'Prasekolah',
  darjah_1: 'Darjah 1', darjah_2: 'Darjah 2', darjah_3: 'Darjah 3',
  darjah_4: 'Darjah 4', darjah_5: 'Darjah 5', darjah_6: 'Darjah 6',
};

export default function LaunchControlPanel() {
  const [activeSection, setActiveSection] = useState('curriculum');
  const [progress, setProgress] = useState(null);
  const [storyProgress, setStoryProgress] = useState(null);
  const [miniGamesProgress, setMiniGamesProgress] = useState(null);
  const [loading, setLoading] = useState(false);
  const [working, setWorking] = useState(null);
  const [log, setLog] = useState([]);
  const [autoRunning, setAutoRunning] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [backgroundEnabled, setBackgroundEnabled] = useState(false);
  const [backgroundStoryEnabled, setBackgroundStoryEnabled] = useState(false);
  const [bgToggling, setBgToggling] = useState(false);
  const [autoRunLock, setAutoRunLock] = useState(null); // { lockedAt, lockedBy, currentBucket, isMine, isStale }
  const lastLoadRef = useRef(0);
  const autoRunLoopRef = useRef(false); // marker untuk current tab
  const lockHeartbeatRef = useRef(null);

  // Lock expires after 10 minutes of no heartbeat
  const LOCK_TIMEOUT_MS = 10 * 60 * 1000;

  const checkAutoRunLock = async () => {
    try {
      const settings = await base44.entities.QCSetting.list();
      const s = settings[0];
      if (!s?.autoRunLockedAt) {
        setAutoRunLock(null);
        return null;
      }
      const lockedAt = new Date(s.autoRunLockedAt);
      const ageMs = Date.now() - lockedAt.getTime();
      const isStale = ageMs > LOCK_TIMEOUT_MS;
      const me = await base44.auth.me().catch(() => null);
      const lock = {
        lockedAt: s.autoRunLockedAt,
        lockedBy: s.autoRunLockedBy,
        currentBucket: s.autoRunCurrentBucket,
        isMine: me?.email === s.autoRunLockedBy && autoRunLoopRef.current,
        isStale,
        ageMinutes: Math.floor(ageMs / 60000),
      };
      setAutoRunLock(lock);
      return lock;
    } catch (e) {
      return null;
    }
  };

  const acquireLock = async () => {
    const settings = await base44.entities.QCSetting.list();
    const s = settings[0];
    if (s?.autoRunLockedAt) {
      const ageMs = Date.now() - new Date(s.autoRunLockedAt).getTime();
      if (ageMs < LOCK_TIMEOUT_MS) {
        return { acquired: false, lockedBy: s.autoRunLockedBy };
      }
    }
    const me = await base44.auth.me();
    const now = new Date().toISOString();
    if (s?.id) {
      await base44.entities.QCSetting.update(s.id, {
        autoRunLockedAt: now,
        autoRunLockedBy: me.email,
        autoRunCurrentBucket: '',
      });
    } else {
      await base44.entities.QCSetting.create({
        intervalMinutes: 10,
        autoRunLockedAt: now,
        autoRunLockedBy: me.email,
      });
    }
    return { acquired: true };
  };

  const updateLockBucket = async (bucketLabel) => {
    try {
      const settings = await base44.entities.QCSetting.list();
      if (settings[0]?.id) {
        await base44.entities.QCSetting.update(settings[0].id, {
          autoRunLockedAt: new Date().toISOString(), // heartbeat
          autoRunCurrentBucket: bucketLabel,
        });
      }
    } catch (e) { /* ignore */ }
  };

  const releaseLock = async () => {
    try {
      const settings = await base44.entities.QCSetting.list();
      if (settings[0]?.id) {
        await base44.entities.QCSetting.update(settings[0].id, {
          autoRunLockedAt: null,
          autoRunLockedBy: null,
          autoRunCurrentBucket: null,
        });
      }
      autoRunLoopRef.current = false;
      setAutoRunLock(null);
    } catch (e) { /* ignore */ }
  };

  const forceReleaseLock = async () => {
    if (!confirm('Force release lock? Hanya gunakan jika auto-run stuck di tab lain.')) return;
    await releaseLock();
    addLog('🔓 Lock dilepaskan secara paksa.');
  };

  const loadBackgroundStatus = async () => {
    try {
      const settings = await base44.entities.QCSetting.list();
      setBackgroundEnabled(settings[0]?.backgroundLaunchEnabled === true);
      setBackgroundStoryEnabled(settings[0]?.backgroundStoryEnabled === true);
    } catch (e) { /* ignore */ }
  };

  const toggleMasterBackground = async () => {
    setBgToggling(true);
    try {
      const settings = await base44.entities.QCSetting.list();
      // ON jika SEMUA off; OFF jika MANA-MANA on
      const anyOn = backgroundEnabled || backgroundStoryEnabled;
      const next = !anyOn;
      const payload = { backgroundLaunchEnabled: next, backgroundStoryEnabled: next };
      if (settings.length > 0) {
        await base44.entities.QCSetting.update(settings[0].id, payload);
      } else {
        await base44.entities.QCSetting.create({ intervalMinutes: 10, ...payload });
      }
      setBackgroundEnabled(next);
      setBackgroundStoryEnabled(next);
      addLog(next
        ? '🟢 Background ON — KSSR (5 min) + Story Opus 4.7 (10 min) jalan di server'
        : '🔴 Background OFF — semua auto-generation dihentikan');
    } catch (e) {
      addLog(`❌ Toggle error: ${e.message}`);
    } finally {
      setBgToggling(false);
    }
  };

  const loadProgress = async () => {
    const now = Date.now();
    if (now - lastLoadRef.current < 12000) {
      addLog(`⏳ Tunggu sebentar sebelum refresh lagi (rate limit protection)`);
      return;
    }
    lastLoadRef.current = now;
    setLoading(true);
    try {
      const res = await base44.functions.invoke('launchGetProgress', {});
      setProgress(res.data);
    } catch (error) {
      addLog(`❌ Error: ${error?.message || 'Gagal load progress'}`);
    } finally {
      setLoading(false);
    }
  };

  const loadStoryProgress = async () => {
    setLoading(true);
    try {
      const res = await base44.functions.invoke('launchGetStoryProgress', {});
      setStoryProgress(res.data);
    } catch (error) {
      addLog(`❌ Error: ${error?.message || 'Gagal load story progress'}`);
    } finally {
      setLoading(false);
    }
  };

  const loadMiniGamesProgress = async () => {
    setLoading(true);
    try {
      const res = await base44.functions.invoke('launchGetMiniGamesProgress', {});
      setMiniGamesProgress(res.data);
    } catch (error) {
      addLog(`❌ Error: ${error?.message || 'Gagal load mini games progress'}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProgress();
    loadStoryProgress();
    loadMiniGamesProgress();
    loadBackgroundStatus();
    checkAutoRunLock();
    // Poll lock status every 15s so other tabs/admins see updates
    const lockPoll = setInterval(checkAutoRunLock, 15000);
    return () => clearInterval(lockPoll);
  }, []);

  const addLog = (msg) => setLog(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev].slice(0, 50));

  const runBucket = async (row) => {
    const key = `${row.ageGroup}-${row.darjah || 'pra'}-${row.category}`;
    setWorking(key);
    addLog(`🚀 ${LEVEL_LABELS[row.darjah || row.ageGroup]} • ${SUBJECT_LABELS[row.category]} — generating ${Math.min(5, row.needed)} games...`);
    try {
      const res = await base44.functions.invoke('launchGenerateBatch', {
        ageGroup: row.ageGroup,
        darjah: row.darjah,
        category: row.category,
        targetCount: 30,
        dryRun: false,
      });
      const d = res.data;
      addLog(`✅ ${LEVEL_LABELS[row.darjah || row.ageGroup]} • ${SUBJECT_LABELS[row.category]} — +${d.generated} games (${d.failed || 0} failed)`);
      return d;
    } catch (e) {
      addLog(`❌ Error: ${e.message}`);
      return null;
    } finally {
      setWorking(null);
    }
  };

  const purgeBucket = async (row) => {
    if (!confirm(`Padam SEMUA ${row.count} games untuk ${LEVEL_LABELS[row.darjah || row.ageGroup]} • ${SUBJECT_LABELS[row.category]}?`)) return;
    const key = `${row.ageGroup}-${row.darjah || 'pra'}-${row.category}-purge`;
    setWorking(key);
    addLog(`🗑️ Purging ${LEVEL_LABELS[row.darjah || row.ageGroup]} • ${SUBJECT_LABELS[row.category]}...`);
    try {
      await base44.functions.invoke('launchPurgeBucket', {
        ageGroup: row.ageGroup,
        darjah: row.darjah,
        category: row.category,
        dryRun: false,
      });
      addLog(`✅ Purged. Reload progress.`);
      await loadProgress();
    } catch (e) {
      addLog(`❌ Purge error: ${e.message}`);
    } finally {
      setWorking(null);
    }
  };

  const autoRunAll = async () => {
    // Lock acquire
    const acq = await acquireLock();
    if (!acq.acquired) {
      addLog(`🔒 Auto-run sedang aktif oleh ${acq.lockedBy}. Tunggu siap atau force-release.`);
      await checkAutoRunLock();
      return;
    }
    if (!confirm('Auto-run akan generate semua bucket yang belum complete & resume dari mana berhenti. Teruskan?')) {
      await releaseLock();
      return;
    }
    autoRunLoopRef.current = true;
    setAutoRunning(true);
    addLog(`🤖 AUTO-RUN STARTED (resume from where it stopped)`);

    // Heartbeat: refresh lock timestamp setiap 30s supaya tak expired
    lockHeartbeatRef.current = setInterval(() => {
      base44.entities.QCSetting.list().then(s => {
        if (s[0]?.id) base44.entities.QCSetting.update(s[0].id, { autoRunLockedAt: new Date().toISOString() });
      }).catch(() => {});
    }, 30000);

    let safetyCounter = 0;
    while (safetyCounter < 200 && autoRunLoopRef.current) {
      safetyCounter++;
      try {
        const fresh = await base44.functions.invoke('launchGetProgress', {});
        const rows = fresh.data?.rows || [];
        const incomplete = rows.filter(r => r.needed > 0);
        if (incomplete.length === 0) {
          addLog(`🎉 SEMUA BUCKETS COMPLETE!`);
          break;
        }
        incomplete.sort((a, b) => b.needed - a.needed);
        const next = incomplete[0];
        const bucketLabel = `${LEVEL_LABELS[next.darjah || next.ageGroup]} • ${SUBJECT_LABELS[next.category]}`;
        await updateLockBucket(bucketLabel);
        await runBucket(next);
        await new Promise(r => setTimeout(r, 2000));
      } catch (error) {
        addLog(`❌ Auto-run error: ${error?.message || 'Unknown'}`);
        break;
      }
    }

    if (lockHeartbeatRef.current) clearInterval(lockHeartbeatRef.current);
    await releaseLock();
    setAutoRunning(false);
    addLog(`✅ AUTO-RUN ENDED`);
  };

  const stopAutoRun = async () => {
    autoRunLoopRef.current = false;
    if (lockHeartbeatRef.current) clearInterval(lockHeartbeatRef.current);
    await releaseLock();
    addLog(`⏸️ Auto-run dihentikan oleh user.`);
  };

  const autoGenerateMiniGames = async () => {
    if (!confirm('Auto-generate akan fill semua mini game categories yang belum complete. Teruskan?')) return;
    setAutoRunning(true);
    addLog(`🤖 MINI GAMES AUTO-GENERATE STARTED`);

    try {
      const incomplete = miniGamesProgress.rows.filter(r => r.needed > 0);
      if (incomplete.length === 0) {
        addLog(`✅ Semua mini games sudah complete!`);
        setAutoRunning(false);
        return;
      }

      for (const row of incomplete) {
        addLog(`🎮 ${row.label} — generating ${row.needed} games...`);
        try {
          const res = await base44.functions.invoke('launchGenerateMiniGames', {
            category: row.category,
            targetCount: parseInt(miniGamesProgress.targetPerCategory) || 10,
            dryRun: false,
          });
          addLog(`✅ ${row.label} — +${res.data?.generated || 0} games`);
        } catch (e) {
          addLog(`❌ ${row.label} error: ${e.message}`);
        }
        await new Promise(r => setTimeout(r, 2000));
      }

      await loadMiniGamesProgress();
      addLog(`✅ MINI GAMES AUTO-GENERATE ENDED`);
    } catch (error) {
      addLog(`❌ Error: ${error?.message || 'Unknown'}`);
    }

    setAutoRunning(false);
  };

  const deleteAllMiniGames = async () => {
    if (!confirm('⚠️ PADAM SEMUA MINI GAMES? Ini tak boleh reverse!')) return;
    setWorking('delete-mini-games');
    addLog(`🗑️ Deleting all mini games...`);
    try {
      const res = await base44.functions.invoke('deleteMiniGames', {});
      addLog(`✅ Deleted ${res.data?.deleted || 0} mini games. Ready for fresh generation with Claude Sonnet.`);
      await loadMiniGamesProgress();
    } catch (e) {
      addLog(`❌ Delete error: ${e.message}`);
    } finally {
      setWorking(null);
    }
  };

  const autoGenerateStoryKid = async () => {
    if (!confirm('Auto-generate Story Kid sampai cukup target? (5 cerita per batch)')) return;
    setAutoRunning(true);
    addLog(`🤖 STORY KID GENERATE STARTED (Claude Opus 4.7)`);

    let safetyCounter = 0;
    while (safetyCounter < 20) {
      safetyCounter++;
      try {
        const res = await base44.functions.invoke('launchGenerateStoryKid', { targetCount: storyProgress.target });
        const d = res.data;
        addLog(`✅ Batch ${safetyCounter}: +${d.generated || 0} stories (${d.failed || 0} failed). Still needed: ${d.stillNeeded || 0}`);
        if ((d.stillNeeded || 0) === 0) {
          addLog(`🎉 STORY KID COMPLETE!`);
          break;
        }
        await new Promise(r => setTimeout(r, 2000));
      } catch (error) {
        addLog(`❌ Error: ${error?.message || 'Unknown'}`);
        break;
      }
    }

    await loadStoryProgress();
    setAutoRunning(false);
  };

  const deleteAllStoryKid = async () => {
    if (!confirm('⚠️ PADAM SEMUA STORY KID GAMES? Ini tak boleh reverse!')) return;
    setWorking('delete-story-kid');
    addLog(`🗑️ Deleting all story kid games...`);
    try {
      const res = await base44.functions.invoke('deleteStoryKidGames', {});
      addLog(`✅ Deleted ${res.data?.deleted || 0} story kid games. Ready for fresh generation with Claude Sonnet.`);
      await loadStoryProgress();
    } catch (e) {
      addLog(`❌ Delete error: ${e.message}`);
    } finally {
      setWorking(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Master Background Toggle — covers ALL tabs */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className={`rounded-2xl p-4 border-2 ${(backgroundEnabled || backgroundStoryEnabled) ? 'bg-green-500/15 border-green-300/50' : 'bg-white/10 border-white/20'}`}>
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${(backgroundEnabled || backgroundStoryEnabled) ? 'bg-green-400' : 'bg-white/20'}`}>
              <Zap className={`w-6 h-6 ${(backgroundEnabled || backgroundStoryEnabled) ? 'text-green-900' : 'text-white'}`} />
            </div>
            <div>
              <p className="text-white font-black text-base">🤖 Master Background Auto-Generate</p>
              <p className="text-white/70 text-xs">Server auto-generate KSSR (5 min) + Story Kid Opus 4.7 (10 min). Tab boleh tutup.</p>
            </div>
          </div>
          <Button
            onClick={toggleMasterBackground}
            disabled={bgToggling}
            size="lg"
            className={(backgroundEnabled || backgroundStoryEnabled)
              ? 'bg-green-400 hover:bg-green-300 text-green-900 font-black'
              : 'bg-yellow-400 hover:bg-yellow-300 text-purple-900 font-black'}
          >
            {bgToggling ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Zap className="w-5 h-5 mr-2" />}
            {(backgroundEnabled || backgroundStoryEnabled) ? 'Background: ON 🟢' : 'Turn ON Background'}
          </Button>
        </div>
      </motion.div>

      {/* Background Progress Panel — live tracking */}
      <BackgroundProgressPanel />

      {/* AUTO-RUN LOCK BANNER */}
      {autoRunLock && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-2xl p-4 border-2 ${
            autoRunLock.isMine
              ? 'bg-blue-500/15 border-blue-300/50'
              : autoRunLock.isStale
                ? 'bg-orange-500/15 border-orange-300/50'
                : 'bg-red-500/15 border-red-300/50'
          }`}
        >
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                autoRunLock.isMine ? 'bg-blue-400/40' : autoRunLock.isStale ? 'bg-orange-400/40' : 'bg-red-400/40'
              }`}>
                <Lock className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-white font-black text-sm">
                  {autoRunLock.isMine ? '🔵 Auto-Run aktif (tab ini)' : autoRunLock.isStale ? '🟠 Lock lama (mungkin stuck)' : '🔴 Auto-Run aktif di tempat lain'}
                </p>
                <p className="text-white/70 text-xs">
                  By: <span className="font-mono">{autoRunLock.lockedBy}</span>
                  {autoRunLock.currentBucket && <> • Sedang proses: <span className="font-bold text-yellow-300">{autoRunLock.currentBucket}</span></>}
                  {' '}• {autoRunLock.ageMinutes} min lalu
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              {autoRunLock.isMine && autoRunning && (
                <Button onClick={stopAutoRun} size="sm" variant="destructive">
                  <Trash2 className="w-4 h-4 mr-2" /> Stop
                </Button>
              )}
              {(autoRunLock.isStale || !autoRunLock.isMine) && (
                <Button onClick={forceReleaseLock} size="sm" variant="outline" className="bg-white/10 text-white border-white/30 hover:bg-white/20">
                  <Unlock className="w-4 h-4 mr-2" /> Force Release
                </Button>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Section Tabs + Settings */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex gap-2 flex-wrap items-center justify-between">
        <div className="flex gap-2 flex-wrap">
          {[
            { key: 'curriculum', label: '📚 KSSR Curriculum' },
            { key: 'story', label: '📖 Story Kid' },
            { key: 'mini_games', label: '🎮 Mini Games' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveSection(tab.key)}
              className={`py-2 px-4 rounded-xl font-bold text-sm transition-all ${
                activeSection === tab.key
                  ? 'bg-white text-game-purple shadow-lg'
                  : 'bg-white/15 text-white hover:bg-white/25'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <Button
          onClick={() => setShowSettingsModal(true)}
          variant="outline"
          size="sm"
          className="bg-white/15 text-white hover:bg-white/25 border-white/25"
        >
          <Settings className="w-4 h-4 mr-2" /> Target Settings
        </Button>
      </motion.div>

      {/* Settings Modal */}
      <LaunchSettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        onSave={() => {
          loadProgress();
          loadStoryProgress();
          loadMiniGamesProgress();
        }}
      />

      <div className="space-y-4">
        {/* CURRICULUM SECTION */}
        {activeSection === 'curriculum' && progress && (
          <>
            {/* Header */}
            <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl p-5 text-white">
              <h2 className="text-xl font-black">🚀 KSSR Curriculum</h2>
              <p className="text-white/80 text-sm mt-1">Target: 30 games per subjek setiap peringkat. Total: 1,050 games.</p>
              <div className="mt-4 grid grid-cols-3 gap-3">
                <div className="bg-white/15 rounded-xl p-3">
                  <p className="text-white/70 text-xs">Progress</p>
                  <p className="text-2xl font-black">{progress.overallPercent}%</p>
                  <p className="text-white/70 text-xs">{progress.totalExisting}/{progress.totalTarget} games</p>
                </div>
                <div className="bg-white/15 rounded-xl p-3">
                  <p className="text-white/70 text-xs">Buckets Complete</p>
                  <p className="text-2xl font-black">{progress.completeBuckets}/{progress.totalBuckets}</p>
                </div>
                <div className="bg-white/15 rounded-xl p-3">
                  <p className="text-white/70 text-xs">Still Needed</p>
                  <p className="text-2xl font-black">{progress.totalNeeded}</p>
                  <p className="text-white/70 text-xs">games</p>
                </div>
              </div>
              <div className="mt-4 flex gap-2 flex-wrap">
                <Button onClick={loadProgress} disabled={loading} variant="secondary" size="sm">
                  <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} /> Reload
                </Button>
                <Button
                  onClick={autoRunAll}
                  disabled={autoRunning || progress.totalNeeded === 0 || (autoRunLock && !autoRunLock.isMine && !autoRunLock.isStale)}
                  className="bg-yellow-400 hover:bg-yellow-300 text-purple-900 font-black"
                >
                  {autoRunning
                    ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Running...</>
                    : (autoRunLock && !autoRunLock.isMine && !autoRunLock.isStale)
                      ? <><Lock className="w-4 h-4 mr-2" /> Locked</>
                      : <><Play className="w-4 h-4 mr-2" /> Resume Auto-Run</>}
                </Button>
              </div>
            </div>

            {/* Bucket table */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="grid grid-cols-12 bg-gray-100 px-4 py-2 text-xs font-bold text-gray-700">
                <div className="col-span-3">Peringkat</div>
                <div className="col-span-2">Subjek</div>
                <div className="col-span-2 text-center">Games</div>
                <div className="col-span-2 text-center">Progress</div>
                <div className="col-span-3 text-right">Aksi</div>
              </div>
              <div className="max-h-[60vh] overflow-y-auto">
                {progress.rows.map((row, i) => {
                  const key = `${row.ageGroup}-${row.darjah || 'pra'}-${row.category}`;
                  const isWorking = working === key;
                  const isPurging = working === `${key}-purge`;
                  return (
                    <motion.div
                      key={key}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.01 }}
                      className={`grid grid-cols-12 px-4 py-2.5 text-sm border-b border-gray-50 items-center ${row.status === 'complete' ? 'bg-green-50' : 'bg-white'}`}
                    >
                      <div className="col-span-3 font-semibold">{LEVEL_LABELS[row.darjah || row.ageGroup]}</div>
                      <div className="col-span-2">{SUBJECT_LABELS[row.category]}</div>
                      <div className="col-span-2 text-center font-mono">
                        <span className={row.status === 'complete' ? 'text-green-600 font-bold' : 'text-gray-700'}>
                          {row.count}/{row.target}
                        </span>
                      </div>
                      <div className="col-span-2">
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${row.status === 'complete' ? 'bg-green-500' : row.percent > 50 ? 'bg-yellow-400' : 'bg-red-400'}`}
                            style={{ width: `${row.percent}%` }}
                          />
                        </div>
                      </div>
                      <div className="col-span-3 flex justify-end gap-1.5">
                        {row.status === 'complete' ? (
                          <span className="flex items-center gap-1 text-green-600 text-xs font-bold"><CheckCircle2 className="w-4 h-4" /> Complete</span>
                        ) : (
                          <Button size="sm" onClick={() => runBucket(row)} disabled={isWorking || autoRunning} className="h-7 text-xs">
                            {isWorking ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3 mr-1" />}
                            +{Math.min(5, row.needed)}
                          </Button>
                        )}
                        <Button size="sm" variant="outline" onClick={() => purgeBucket(row)} disabled={isPurging || autoRunning} className="h-7 px-2 border-red-200 text-red-600 hover:bg-red-50">
                          {isPurging ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                        </Button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {/* STORY SECTION */}
        {activeSection === 'story' && storyProgress && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-5 text-white">
            <h2 className="text-xl font-black">📖 Story Kid Generation</h2>
            <p className="text-white/80 text-sm mt-1">Target: 30 story games total.</p>
            <div className="mt-4 grid grid-cols-3 gap-3">
              <div className="bg-white/15 rounded-xl p-3">
                <p className="text-white/70 text-xs">Progress</p>
                <p className="text-2xl font-black">{storyProgress.percent}%</p>
                <p className="text-white/70 text-xs">{storyProgress.count}/{storyProgress.target}</p>
              </div>
              <div className="bg-white/15 rounded-xl p-3">
                <p className="text-white/70 text-xs">Status</p>
                <p className="text-lg font-black">{storyProgress.status === 'complete' ? '✅ Done' : '⏳ Pending'}</p>
              </div>
              <div className="bg-white/15 rounded-xl p-3">
                <p className="text-white/70 text-xs">Needed</p>
                <p className="text-2xl font-black">{storyProgress.needed}</p>
              </div>
            </div>
            <div className="mt-4 flex gap-2 flex-wrap">
              <Button onClick={loadStoryProgress} disabled={loading} variant="secondary" size="sm">
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} /> Reload
              </Button>
              <Button onClick={autoGenerateStoryKid} disabled={autoRunning || storyProgress.needed === 0} className="bg-yellow-400 hover:bg-yellow-300 text-purple-900 font-black">
                {autoRunning ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Running...</> : <><Play className="w-4 h-4 mr-2" /> Auto-Generate (Tab)</>}
              </Button>
              <Button onClick={deleteAllStoryKid} disabled={working === 'delete-story-kid'} variant="destructive" size="sm" className="ml-auto">
                {working === 'delete-story-kid' ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Deleting...</> : <><Trash2 className="w-4 h-4 mr-2" /> Delete All</>}
              </Button>
            </div>
          </motion.div>
        )}

        {/* MINI GAMES SECTION */}
        {activeSection === 'mini_games' && miniGamesProgress && (
          <>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-5 text-white">
              <h2 className="text-xl font-black">🎮 Mini Games Generation</h2>
              <p className="text-white/80 text-sm mt-1">Target: 10 games per category (8 categories = 80 total).</p>
              <div className="mt-4 grid grid-cols-3 gap-3">
                <div className="bg-white/15 rounded-xl p-3">
                  <p className="text-white/70 text-xs">Overall Progress</p>
                  <p className="text-2xl font-black">{miniGamesProgress.overallPercent}%</p>
                  <p className="text-white/70 text-xs">{miniGamesProgress.totalExisting}/{miniGamesProgress.totalTarget}</p>
                </div>
                <div className="bg-white/15 rounded-xl p-3">
                  <p className="text-white/70 text-xs">Categories Done</p>
                  <p className="text-2xl font-black">{miniGamesProgress.completeBuckets}/{miniGamesProgress.totalBuckets}</p>
                </div>
                <div className="bg-white/15 rounded-xl p-3">
                  <p className="text-white/70 text-xs">Still Needed</p>
                  <p className="text-2xl font-black">{miniGamesProgress.totalNeeded}</p>
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <Button onClick={loadMiniGamesProgress} disabled={loading} variant="secondary" size="sm">
                  <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} /> Reload
                </Button>
              </div>
              <p className="text-white/70 text-xs mt-3">ℹ️ Mini Games adalah hand-crafted blueprints dari kod (tiada AI generation). Untuk tambah, edit fail di <code className="bg-white/15 px-1.5 py-0.5 rounded">lib/miniGames/*.js</code>.</p>
            </motion.div>

            {/* Mini Games Table */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="grid grid-cols-12 bg-gray-100 px-4 py-2 text-xs font-bold text-gray-700">
                <div className="col-span-4">Kategori</div>
                <div className="col-span-2 text-center">Games</div>
                <div className="col-span-3 text-center">Progress</div>
                <div className="col-span-3 text-right">Status</div>
              </div>
              <div className="max-h-[40vh] overflow-y-auto">
                {miniGamesProgress.rows.map((row) => (
                  <motion.div
                    key={row.category}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={`grid grid-cols-12 px-4 py-2.5 text-sm border-b border-gray-50 items-center ${row.status === 'complete' ? 'bg-green-50' : 'bg-white'}`}
                  >
                    <div className="col-span-4 font-semibold">{row.label}</div>
                    <div className="col-span-2 text-center font-mono">
                      <span className={row.status === 'complete' ? 'text-green-600 font-bold' : 'text-gray-700'}>
                        {row.count}/{row.target}
                      </span>
                    </div>
                    <div className="col-span-3">
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className={`h-full ${row.status === 'complete' ? 'bg-green-500' : 'bg-amber-400'}`} style={{ width: `${row.percent}%` }} />
                      </div>
                    </div>
                    <div className="col-span-3 text-right text-xs font-bold">
                      {row.status === 'complete' ? <span className="text-green-600">✅ Complete</span> : <span className="text-amber-600">{row.needed} needed</span>}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Activity log */}
      {log.length > 0 && (
        <div className="bg-gray-900 text-green-300 rounded-2xl p-4 font-mono text-xs max-h-60 overflow-y-auto">
          <p className="text-white font-bold mb-2">📋 Activity Log</p>
          {log.map((line, i) => <div key={i}>{line}</div>)}
        </div>
      )}

      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm text-yellow-900">
        <div className="flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Nota Penting:</p>
            <ul className="mt-1 space-y-0.5 list-disc list-inside text-xs">
              <li>Setiap tab ada progress tracking & reload button tersendiri</li>
              <li>Story & Mini Games progress automatically updated setiap reload</li>
              <li>Rate limit 12 saat antara refresh untuk curriculum tab</li>
              <li><b>Auto-Run Lock:</b> Hanya 1 tab boleh jalan auto-run pada satu masa — tab lain akan nampak status "Locked"</li>
              <li><b>Resume:</b> Tekan "Resume Auto-Run" untuk sambung dari bucket yang belum siap (auto-detect dari database)</li>
              <li><b>Stuck?</b> Lock auto-expire selepas 10 minit tanpa heartbeat — atau tekan "Force Release"</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}