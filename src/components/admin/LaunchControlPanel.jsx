import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { CheckCircle2, AlertTriangle, RefreshCw, Play, Loader2, Trash2 } from 'lucide-react';

const SUBJECT_LABELS = {
  bahasa_melayu: 'BM', english: 'English', mathematics: 'Math', science: 'Sains', jawi: 'Jawi',
};

const LEVEL_LABELS = {
  prasekolah: 'Prasekolah',
  darjah_1: 'Darjah 1', darjah_2: 'Darjah 2', darjah_3: 'Darjah 3',
  darjah_4: 'Darjah 4', darjah_5: 'Darjah 5', darjah_6: 'Darjah 6',
};

export default function LaunchControlPanel() {
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(false);
  const [working, setWorking] = useState(null); // bucket key being processed
  const [log, setLog] = useState([]);
  const [autoRunning, setAutoRunning] = useState(false);

  const loadProgress = async () => {
    setLoading(true);
    try {
      const res = await base44.functions.invoke('launchGetProgress', {});
      setProgress(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadProgress(); }, []);

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
    if (!confirm('Auto-run akan generate semua bucket yang belum complete. Akan ambil masa ~30-60 minit. Teruskan?')) return;
    setAutoRunning(true);
    addLog(`🤖 AUTO-RUN STARTED`);

    let safetyCounter = 0;
    while (safetyCounter < 200) {
      safetyCounter++;
      const fresh = await base44.functions.invoke('launchGetProgress', {});
      const rows = fresh.data?.rows || [];
      const incomplete = rows.filter(r => r.needed > 0);
      if (incomplete.length === 0) {
        addLog(`🎉 SEMUA BUCKETS COMPLETE!`);
        break;
      }
      // Process the one with most needed first
      incomplete.sort((a, b) => b.needed - a.needed);
      const next = incomplete[0];
      await runBucket(next);
      await loadProgress();
      // Small delay between buckets
      await new Promise(r => setTimeout(r, 1500));
    }

    setAutoRunning(false);
    addLog(`✅ AUTO-RUN ENDED`);
  };

  if (!progress) {
    return (
      <div className="p-8 text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-game-purple" />
        <p className="mt-2 text-sm text-muted-foreground">Loading progress...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl p-5 text-white">
        <h2 className="text-xl font-black">🚀 Launch Control Panel</h2>
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
        <div className="mt-4 flex gap-2">
          <Button onClick={loadProgress} disabled={loading} variant="secondary" size="sm">
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} /> Reload
          </Button>
          <Button onClick={autoRunAll} disabled={autoRunning || progress.totalNeeded === 0} className="bg-yellow-400 hover:bg-yellow-300 text-purple-900 font-black">
            {autoRunning ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Running...</> : <><Play className="w-4 h-4 mr-2" /> Auto-Run All</>}
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
              <li>Setiap "+8" akan generate 8 games guna AI premium (claude_sonnet_4_6) — quality KSSR-aligned dengan validation ketat</li>
              <li>Setiap call ambil ~2-3 minit. Jangan tutup tab semasa "Auto-Run All"</li>
              <li>Anggaran masa siap semua: ~30-60 minit (193 games × 8 sec rata-rata)</li>
              <li>Anggaran kos: RM30-60 integration credits</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}