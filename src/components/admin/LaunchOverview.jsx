import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import {
  RefreshCw, Loader2, CheckCircle2, AlertTriangle, Clock,
  BookOpen, GraduationCap, Gamepad2, Activity, Zap,
} from 'lucide-react';

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

function ProgressCard({ icon: Icon, title, accent, current, target, percent, enabled, interval, status, extra }) {
  const accents = {
    violet: { ring: 'ring-violet-400/30', text: 'text-violet-300', bar: 'from-violet-400 to-purple-500', badge: 'bg-violet-500/20 text-violet-200' },
    sky:    { ring: 'ring-sky-400/30',    text: 'text-sky-300',    bar: 'from-sky-400 to-blue-500',      badge: 'bg-sky-500/20 text-sky-200' },
    amber:  { ring: 'ring-amber-400/30',  text: 'text-amber-300',  bar: 'from-amber-400 to-orange-500',  badge: 'bg-amber-500/20 text-amber-200' },
  };
  const a = accents[accent];
  return (
    <div className={`rounded-2xl p-4 bg-white/5 ring-1 ${a.ring}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Icon className={`w-5 h-5 ${a.text}`} />
          <span className="text-white font-black text-sm">{title}</span>
        </div>
        {enabled !== undefined && (
          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${enabled ? 'bg-emerald-400 text-emerald-950' : `${a.badge}`}`}>
            {enabled ? 'ON' : status || 'IDLE'}
          </span>
        )}
        {enabled === undefined && status && (
          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${a.badge}`}>{status}</span>
        )}
      </div>
      <div className="flex items-baseline justify-between mb-1.5">
        <span className="text-3xl font-black text-white leading-none">{current}</span>
        <span className="text-xs text-white/60 font-bold">/ {target}</span>
      </div>
      <div className="h-2 bg-white/10 rounded-full overflow-hidden mb-2">
        <div className={`h-full bg-gradient-to-r ${a.bar} transition-all duration-500`} style={{ width: `${Math.min(100, percent)}%` }} />
      </div>
      <p className="text-[11px] font-bold text-white/65">{percent}% complete{interval && <span className="text-white/45"> · {interval}</span>}</p>
      {extra && <div className="mt-2">{extra}</div>}
    </div>
  );
}

function StatPill({ icon: Icon, label, value, color }) {
  const colors = {
    amber: 'text-amber-300', sky: 'text-sky-300', emerald: 'text-emerald-300', rose: 'text-rose-300',
  };
  return (
    <div className="rounded-xl p-3 bg-white/5 ring-1 ring-white/10">
      <div className="flex items-center gap-1.5 mb-1">
        <Icon className={`w-3.5 h-3.5 ${colors[color]}`} />
        <span className="text-[10px] font-black text-white/65 uppercase tracking-wider">{label}</span>
      </div>
      <p className={`text-2xl font-black ${colors[color]}`}>{value}</p>
    </div>
  );
}

export default function LaunchOverview() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
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

  useEffect(() => { fetch(); }, [fetch]);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(fetch, 60000); // gentle 60s
    return () => clearInterval(interval);
  }, [autoRefresh, fetch]);

  if (loading) {
    return (
      <div className="pro-glass rounded-3xl p-12 text-center">
        <Loader2 className="w-8 h-8 text-white animate-spin mx-auto mb-3" />
        <p className="text-white font-bold text-sm">Memuatkan status...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="pro-glass rounded-3xl p-6 text-center">
        <AlertTriangle className="w-8 h-8 text-rose-400 mx-auto mb-2" />
        <p className="text-white font-black text-sm">Ralat: {error || 'No data'}</p>
        <button onClick={fetch} className="mt-3 px-4 py-2 bg-white/15 text-white rounded-xl font-bold text-sm">Cuba lagi</button>
      </div>
    );
  }

  const { system, kssr, story, miniGames, tasks } = data;

  return (
    <div className="space-y-4">
      {/* Refresh bar */}
      <div className="pro-glass rounded-2xl p-3 flex items-center justify-between gap-3 flex-wrap">
        <p className="text-white/70 text-xs font-semibold">
          <Activity className="w-3.5 h-3.5 inline mr-1 text-emerald-300" />
          Last update: {timeAgo(data.timestamp)}
          {autoRefresh && <span className="text-emerald-300 ml-2">· auto 60s</span>}
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-black ring-1 transition-all ${
              autoRefresh ? 'bg-emerald-500/20 text-emerald-200 ring-emerald-400/40' : 'bg-white/10 text-white ring-white/20'
            }`}
          >
            {autoRefresh ? '⏸ Pause' : '▶ Auto'}
          </button>
          <button onClick={fetch} disabled={refreshing} className="px-3 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-white text-[11px] font-black ring-1 ring-white/20 transition-all disabled:opacity-60 flex items-center gap-1">
            <RefreshCw className={`w-3 h-3 ${refreshing ? 'animate-spin' : ''}`} /> Refresh
          </button>
        </div>
      </div>

      {/* Content Progress — 3 cards */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <ProgressCard
          icon={GraduationCap}
          title="KSSR Curriculum"
          accent="violet"
          current={kssr.totalExisting}
          target={kssr.totalTarget}
          percent={kssr.percent}
          enabled={system.backgroundLaunchEnabled}
          interval="5 min"
          extra={kssr.nextBucket && (
            <div className="p-2 rounded-lg bg-amber-500/10 ring-1 ring-amber-400/25">
              <p className="text-[10px] font-black text-amber-200">Next: {kssr.nextBucket.ageGroup}{kssr.nextBucket.darjah ? `/${kssr.nextBucket.darjah}` : ''} → {kssr.nextBucket.category}</p>
              <p className="text-[10px] text-white/60">Perlu lagi {kssr.nextBucket.needed} games</p>
            </div>
          )}
        />
        <ProgressCard
          icon={BookOpen}
          title="Story Kid"
          accent="sky"
          current={story.count}
          target={story.target}
          percent={story.percent}
          enabled={system.backgroundStoryEnabled}
          interval="10 min · Opus 4.7"
          extra={story.isComplete && (
            <div className="flex items-center gap-1.5 text-[11px] text-emerald-300">
              <CheckCircle2 className="w-3 h-3" /> Complete
            </div>
          )}
        />
        <ProgressCard
          icon={Gamepad2}
          title="Mini Games"
          accent="amber"
          current={miniGames.totalExisting}
          target={miniGames.totalTarget}
          percent={miniGames.percent}
          status="STATIC"
          interval="Hand-crafted blueprints"
        />
      </motion.div>

      {/* Task Queue Stats */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatPill icon={Clock} label="Pending" value={tasks.pending} color="amber" />
        <StatPill icon={Loader2} label="Running" value={tasks.running} color="sky" />
        <StatPill icon={CheckCircle2} label="Completed" value={tasks.completed} color="emerald" />
        <StatPill icon={AlertTriangle} label="Failed" value={tasks.failed} color="rose" />
      </motion.div>

      {/* Running Tasks */}
      {tasks.runningList?.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="pro-glass rounded-2xl p-4">
          <h3 className="text-white font-black text-sm mb-3 flex items-center gap-2">
            <Loader2 className="w-4 h-4 text-sky-300 animate-spin" /> Sedang Berjalan
          </h3>
          <div className="space-y-2">
            {tasks.runningList.map(t => (
              <div key={t.id} className="rounded-lg p-2.5 bg-sky-500/10 ring-1 ring-sky-400/25 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-white font-bold text-xs truncate">{t.taskName}</p>
                  <p className="text-[10px] text-white/65">started {timeAgo(t.startedAt)}</p>
                </div>
                <span className="text-[10px] font-black text-sky-200 bg-sky-500/20 px-2 py-0.5 rounded-full whitespace-nowrap">
                  {t.createdGames || 0}/{t.gamesCount}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Recent Completed + Failed */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="pro-glass rounded-2xl p-4">
          <h3 className="text-white font-black text-sm mb-3 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-300" /> Terkini Berjaya
          </h3>
          {tasks.recentCompleted?.length === 0 ? (
            <p className="text-white/55 text-xs">Tiada task.</p>
          ) : (
            <div className="space-y-1.5">
              {tasks.recentCompleted.map(t => (
                <div key={t.id} className="rounded-lg p-2 bg-emerald-500/10 ring-1 ring-emerald-400/20">
                  <p className="text-white font-bold text-xs truncate">{t.taskName}</p>
                  <p className="text-[10px] text-white/60">{t.createdGames || 0} games · {timeAgo(t.completedAt)}</p>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="pro-glass rounded-2xl p-4">
          <h3 className="text-white font-black text-sm mb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-300" /> Tasks Gagal
          </h3>
          {tasks.recentFailed?.length === 0 ? (
            <p className="text-white/55 text-xs">Tiada — bagus! 🎉</p>
          ) : (
            <div className="space-y-1.5">
              {tasks.recentFailed.map(t => (
                <div key={t.id} className="rounded-lg p-2 bg-rose-500/10 ring-1 ring-rose-400/20">
                  <p className="text-white font-bold text-xs truncate">{t.taskName}</p>
                  <p className="text-[10px] text-rose-200 truncate" title={t.errorMessage}>{t.errorMessage || 'Unknown'}</p>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}