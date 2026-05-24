import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import {
  RefreshCw, Activity, CheckCircle2, AlertTriangle, Clock, Loader2,
  Zap, BookOpen, Brain, Lock, Unlock, PlayCircle, PauseCircle,
} from 'lucide-react';

const SUBJECT_LABELS = {
  bahasa_melayu: 'Bahasa Melayu',
  english: 'English',
  mathematics: 'Mathematics',
  science: 'Science',
  jawi: 'Jawi',
};

const MINI_LABELS = {
  memory_master: 'Memory Master',
  logic_puzzles: 'Logic Puzzles',
  speed_focus: 'Speed & Focus',
  pattern_genius: 'Pattern Genius',
  maze_adventure: 'Maze Adventure',
  creative_builder: 'Creative Builder',
  problem_solver: 'Problem Solver',
  brain_training: 'Brain Training',
};

function StatCard({ icon: Icon, label, value, sub, color = 'violet' }) {
  const colors = {
    violet: 'from-violet-500 to-purple-600',
    emerald: 'from-emerald-500 to-green-600',
    amber: 'from-amber-500 to-orange-600',
    rose: 'from-rose-500 to-red-600',
    sky: 'from-sky-500 to-blue-600',
  };
  return (
    <div className={`rounded-2xl p-4 bg-gradient-to-br ${colors[color]} text-white shadow-lg`}>
      <div className="flex items-center justify-between mb-2">
        <Icon className="w-5 h-5 opacity-80" />
        <span className="text-[10px] font-black uppercase tracking-wider opacity-80">{label}</span>
      </div>
      <p className="text-3xl font-black leading-none">{value}</p>
      {sub && <p className="text-[11px] font-bold opacity-85 mt-1">{sub}</p>}
    </div>
  );
}

function ProgressBar({ percent, color = 'bg-emerald-500' }) {
  return (
    <div className="w-full h-2 bg-white/15 rounded-full overflow-hidden">
      <div className={`h-full ${color} transition-all duration-500`} style={{ width: `${Math.min(100, percent)}%` }} />
    </div>
  );
}

function timeAgo(iso) {
  if (!iso) return '—';
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'baru sahaja';
  if (mins < 60) return `${mins} min lalu`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}j lalu`;
  return `${Math.floor(hrs / 24)} hari lalu`;
}

export default function BackgroundTaskMonitor() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchStatus = useCallback(async () => {
    setRefreshing(true);
    try {
      const res = await base44.functions.invoke('getBackgroundActivityStatus', {});
      if (res?.data?.success) {
        setData(res.data);
        setError(null);
      } else {
        setError(res?.data?.error || 'Unknown error');
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(fetchStatus, 30000); // every 30s
    return () => clearInterval(interval);
  }, [autoRefresh, fetchStatus]);

  if (loading) {
    return (
      <div className="pro-glass rounded-3xl p-12 text-center">
        <Loader2 className="w-8 h-8 text-white animate-spin mx-auto mb-3" />
        <p className="text-white font-bold">Memuatkan status background...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pro-glass rounded-3xl p-6 text-center">
        <AlertTriangle className="w-8 h-8 text-rose-400 mx-auto mb-2" />
        <p className="text-white font-black">Ralat: {error}</p>
        <button onClick={fetchStatus} className="mt-3 px-4 py-2 bg-white/15 text-white rounded-xl font-bold text-sm">Cuba lagi</button>
      </div>
    );
  }

  const { system, kssr, story, miniGames, tasks, recentQc } = data;

  return (
    <div className="space-y-4 md:space-y-5">
      {/* Header + auto-refresh control */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="pro-glass rounded-3xl p-4 md:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-lg md:text-xl font-black text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-400" />
            Background Activity Monitor
          </h2>
          <p className="text-white/75 text-xs font-semibold mt-0.5">
            Last update: {timeAgo(data.timestamp)} {autoRefresh && <span className="text-emerald-300">· auto-refresh aktif (30s)</span>}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-3 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 ring-1 transition-all ${
              autoRefresh ? 'bg-emerald-500/20 text-emerald-200 ring-emerald-400/40' : 'bg-white/10 text-white ring-white/20'
            }`}
          >
            {autoRefresh ? <PauseCircle className="w-3.5 h-3.5" /> : <PlayCircle className="w-3.5 h-3.5" />}
            {autoRefresh ? 'Pause' : 'Auto-refresh'}
          </button>
          <button onClick={fetchStatus} disabled={refreshing} className="px-3 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-black flex items-center gap-1.5 ring-1 ring-white/20 transition-all disabled:opacity-60">
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} /> Refresh
          </button>
        </div>
      </motion.div>

      {/* SYSTEM STATE */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="pro-glass rounded-3xl p-4 md:p-5">
        <h3 className="text-white font-black text-base mb-3 flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-300" /> Status Sistem
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className={`rounded-2xl p-3 ring-1 ${system.backgroundLaunchEnabled ? 'bg-emerald-500/15 ring-emerald-400/40' : 'bg-white/5 ring-white/15'}`}>
            <p className="text-[10px] font-black text-white/70 uppercase tracking-wider">KSSR Generator</p>
            <p className={`text-base font-black mt-1 ${system.backgroundLaunchEnabled ? 'text-emerald-300' : 'text-white/60'}`}>
              {system.backgroundLaunchEnabled ? '✅ AKTIF' : '⏸ Pause'}
            </p>
            <p className="text-[10px] text-white/60 mt-0.5">Setiap 5 minit</p>
          </div>
          <div className={`rounded-2xl p-3 ring-1 ${system.backgroundStoryEnabled ? 'bg-sky-500/15 ring-sky-400/40' : 'bg-white/5 ring-white/15'}`}>
            <p className="text-[10px] font-black text-white/70 uppercase tracking-wider">Story Generator</p>
            <p className={`text-base font-black mt-1 ${system.backgroundStoryEnabled ? 'text-sky-300' : 'text-white/60'}`}>
              {system.backgroundStoryEnabled ? '✅ AKTIF' : '⏸ Pause'}
            </p>
            <p className="text-[10px] text-white/60 mt-0.5">Setiap 10 minit</p>
          </div>
          <div className={`rounded-2xl p-3 ring-1 ${
            system.lockStatus === 'active' ? 'bg-amber-500/15 ring-amber-400/40' :
            system.lockStatus === 'stale' ? 'bg-rose-500/15 ring-rose-400/40' :
            'bg-white/5 ring-white/15'
          }`}>
            <p className="text-[10px] font-black text-white/70 uppercase tracking-wider">Lock</p>
            <p className={`text-base font-black mt-1 flex items-center gap-1 ${
              system.lockStatus === 'active' ? 'text-amber-300' :
              system.lockStatus === 'stale' ? 'text-rose-300' :
              'text-white/60'
            }`}>
              {system.lockStatus === 'idle' ? <><Unlock className="w-3.5 h-3.5" /> Bebas</> : <><Lock className="w-3.5 h-3.5" /> {system.lockStatus === 'stale' ? 'STALE' : 'Locked'}</>}
            </p>
            <p className="text-[10px] text-white/60 mt-0.5">{system.lockAgeMinutes !== null ? `${system.lockAgeMinutes} min lalu` : 'Tiada lock'}</p>
          </div>
          <div className="rounded-2xl p-3 ring-1 bg-white/5 ring-white/15">
            <p className="text-[10px] font-black text-white/70 uppercase tracking-wider">Current Bucket</p>
            <p className="text-xs font-black text-white mt-1 truncate" title={system.currentBucket}>
              {system.currentBucket || '—'}
            </p>
            <p className="text-[10px] text-white/60 mt-0.5">{system.lockedBy || 'Idle'}</p>
          </div>
        </div>
      </motion.div>

      {/* TASK QUEUE OVERVIEW */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <StatCard icon={Clock} color="amber" label="Pending" value={tasks.pending} sub="Menunggu run" />
        <StatCard icon={Loader2} color="sky" label="Running" value={tasks.running} sub="Sedang jalan" />
        <StatCard icon={CheckCircle2} color="emerald" label="Completed" value={tasks.completed} sub="Berjaya" />
        <StatCard icon={AlertTriangle} color="rose" label="Failed" value={tasks.failed} sub="Gagal" />
      </motion.div>

      {/* CONTENT PROGRESS — 3 cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* KSSR */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="pro-glass rounded-3xl p-4 md:p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-white font-black text-base flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-violet-300" /> KSSR Curriculum
            </h3>
            <span className="text-xs font-black text-violet-200 bg-violet-500/20 px-2 py-1 rounded-full ring-1 ring-violet-400/30">
              {kssr.completeBuckets}/{kssr.totalBuckets} buckets
            </span>
          </div>
          <p className="text-3xl font-black text-white">{kssr.totalExisting} <span className="text-base text-white/60 font-bold">/ {kssr.totalTarget}</span></p>
          <p className="text-xs font-bold text-white/70 mb-2">{kssr.percent}% complete</p>
          <ProgressBar percent={kssr.percent} color="bg-violet-500" />
          {kssr.nextBucket && (
            <div className="mt-3 p-2.5 rounded-xl bg-amber-500/15 ring-1 ring-amber-400/30">
              <p className="text-[10px] font-black text-amber-200 uppercase tracking-wider">Next bucket akan dijana</p>
              <p className="text-xs font-black text-white mt-0.5">
                {kssr.nextBucket.ageGroup}{kssr.nextBucket.darjah ? `/${kssr.nextBucket.darjah}` : ''} → {SUBJECT_LABELS[kssr.nextBucket.category]}
              </p>
              <p className="text-[10px] text-white/70">Perlu lagi {kssr.nextBucket.needed} games</p>
            </div>
          )}
        </motion.div>

        {/* Story Kid */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="pro-glass rounded-3xl p-4 md:p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-white font-black text-base flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-sky-300" /> Story Kid
            </h3>
            <span className={`text-xs font-black px-2 py-1 rounded-full ring-1 ${story.isComplete ? 'text-emerald-200 bg-emerald-500/20 ring-emerald-400/30' : 'text-sky-200 bg-sky-500/20 ring-sky-400/30'}`}>
              {story.isComplete ? '✓ Complete' : 'In progress'}
            </span>
          </div>
          <p className="text-3xl font-black text-white">{story.count} <span className="text-base text-white/60 font-bold">/ {story.target}</span></p>
          <p className="text-xs font-bold text-white/70 mb-2">{story.percent}% complete</p>
          <ProgressBar percent={story.percent} color="bg-sky-500" />
        </motion.div>

        {/* Mini Games */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="pro-glass rounded-3xl p-4 md:p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-white font-black text-base flex items-center gap-2">
              <Brain className="w-4 h-4 text-emerald-300" /> Mini Games
            </h3>
            <span className="text-xs font-black text-emerald-200 bg-emerald-500/20 px-2 py-1 rounded-full ring-1 ring-emerald-400/30">
              {miniGames.rows.filter(r => r.isComplete).length}/{miniGames.rows.length} kategori
            </span>
          </div>
          <p className="text-3xl font-black text-white">{miniGames.totalExisting} <span className="text-base text-white/60 font-bold">/ {miniGames.totalTarget}</span></p>
          <p className="text-xs font-bold text-white/70 mb-2">{miniGames.percent}% complete</p>
          <ProgressBar percent={miniGames.percent} color="bg-emerald-500" />
        </motion.div>
      </div>

      {/* RUNNING TASKS LIST */}
      {tasks.runningList.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="pro-glass rounded-3xl p-4 md:p-5">
          <h3 className="text-white font-black text-base mb-3 flex items-center gap-2">
            <Loader2 className="w-4 h-4 text-sky-300 animate-spin" /> Tasks Sedang Berjalan ({tasks.running})
          </h3>
          <div className="space-y-2">
            {tasks.runningList.map(t => (
              <div key={t.id} className="rounded-xl p-3 bg-sky-500/10 ring-1 ring-sky-400/30 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-white font-black text-sm truncate">{t.taskName}</p>
                  <p className="text-[11px] text-white/70 font-semibold">
                    {t.ageGroup}{t.darjah ? `/${t.darjah}` : ''} · {t.subject} · started {timeAgo(t.startedAt)}
                  </p>
                </div>
                <span className="text-xs font-black text-sky-200 bg-sky-500/20 px-2 py-1 rounded-full whitespace-nowrap">
                  {t.createdGames || 0} / {t.gamesCount} games
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* RECENT COMPLETED + FAILED side by side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="pro-glass rounded-3xl p-4 md:p-5">
          <h3 className="text-white font-black text-base mb-3 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-300" /> Terkini Berjaya
          </h3>
          {tasks.recentCompleted.length === 0 ? (
            <p className="text-white/60 text-xs font-semibold">Tiada task berjaya baru-baru ini.</p>
          ) : (
            <div className="space-y-2">
              {tasks.recentCompleted.map(t => (
                <div key={t.id} className="rounded-xl p-2.5 bg-emerald-500/10 ring-1 ring-emerald-400/20">
                  <p className="text-white font-bold text-xs truncate">{t.taskName}</p>
                  <p className="text-[10px] text-white/65">{t.createdGames || 0} games · {timeAgo(t.completedAt)}</p>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="pro-glass rounded-3xl p-4 md:p-5">
          <h3 className="text-white font-black text-base mb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-300" /> Tasks Gagal
          </h3>
          {tasks.recentFailed.length === 0 ? (
            <p className="text-white/60 text-xs font-semibold">Tiada task gagal — bagus! 🎉</p>
          ) : (
            <div className="space-y-2">
              {tasks.recentFailed.map(t => (
                <div key={t.id} className="rounded-xl p-2.5 bg-rose-500/10 ring-1 ring-rose-400/20">
                  <p className="text-white font-bold text-xs truncate">{t.taskName}</p>
                  <p className="text-[10px] text-rose-200 truncate" title={t.errorMessage}>{t.errorMessage || 'Unknown error'}</p>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* RECENT QC LOGS */}
      {recentQc.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="pro-glass rounded-3xl p-4 md:p-5">
          <h3 className="text-white font-black text-base mb-3 flex items-center gap-2">
            <Activity className="w-4 h-4 text-violet-300" /> Aktiviti QC Terkini
          </h3>
          <div className="space-y-1.5">
            {recentQc.map(log => (
              <div key={log.id} className="rounded-xl p-2.5 bg-white/5 ring-1 ring-white/10 flex items-center justify-between gap-2 flex-wrap">
                <div className="min-w-0 flex-1">
                  <p className="text-white font-bold text-xs">
                    <span className="text-violet-300">{log.action}</span> · {log.message || log.status}
                  </p>
                  <p className="text-[10px] text-white/55">{timeAgo(log.runAt)}</p>
                </div>
                {log.score !== undefined && log.score !== null && (
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full whitespace-nowrap ${
                    log.score >= 80 ? 'bg-emerald-500/25 text-emerald-200' :
                    log.score >= 60 ? 'bg-amber-500/25 text-amber-200' :
                    'bg-rose-500/25 text-rose-200'
                  }`}>
                    Score: {log.score}%
                  </span>
                )}
                {log.deletedCount > 0 && (
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-rose-500/25 text-rose-200 whitespace-nowrap">
                    -{log.deletedCount}
                  </span>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}