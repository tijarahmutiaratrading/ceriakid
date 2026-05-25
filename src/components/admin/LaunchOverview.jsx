import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import {
  RefreshCw, Loader2, CheckCircle2, AlertTriangle,
  BookOpen, GraduationCap, Gamepad2, Activity, Sparkles,
} from 'lucide-react';

function timeAgo(iso) {
  if (!iso) return '—';
  const diff = Date.now() - new Date(iso).getTime();
  const secs = Math.floor(diff / 1000);
  if (secs < 60) return `${secs}s lalu`;
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins} min lalu`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}j lalu`;
  return `${Math.floor(hrs / 24)} hari lalu`;
}

const SUBJECT_LABEL = {
  bahasa_melayu: 'BM', english: 'English', mathematics: 'Math',
  science: 'Sains', jawi: 'Jawi', story: 'Story',
};
const LEVEL_LABEL = {
  prasekolah: 'Prasekolah',
  darjah_1: 'D1', darjah_2: 'D2', darjah_3: 'D3',
  darjah_4: 'D4', darjah_5: 'D5', darjah_6: 'D6',
};

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

function StatPill({ label, value, color, sub }) {
  const colors = {
    amber: 'text-amber-300', sky: 'text-sky-300', emerald: 'text-emerald-300', rose: 'text-rose-300',
  };
  return (
    <div className="rounded-xl p-3 bg-white/5 ring-1 ring-white/10">
      <p className="text-[10px] font-black text-white/65 uppercase tracking-wider mb-1">{label}</p>
      <p className={`text-2xl font-black ${colors[color]}`}>{value}</p>
      {sub && <p className="text-[10px] text-white/50 mt-0.5">{sub}</p>}
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
    const interval = setInterval(fetch, 60000);
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

  const { system, kssr, story, miniGames, activity } = data;
  const isHot = activity.createdLast5Min > 0;

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

      {/* Live Activity Stats — based on REAL Game creation */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className={`rounded-xl p-3 ring-1 ${isHot ? 'bg-emerald-500/20 ring-emerald-400/40' : 'bg-white/5 ring-white/10'}`}>
          <p className={`text-[10px] font-black uppercase tracking-wider mb-1 ${isHot ? 'text-emerald-200' : 'text-white/65'}`}>
            {isHot ? '🔥 Live' : 'Last 5 min'}
          </p>
          <p className={`text-2xl font-black ${isHot ? 'text-emerald-300' : 'text-white/60'}`}>{activity.createdLast5Min}</p>
          <p className="text-[10px] text-white/50 mt-0.5">games created</p>
        </div>
        <StatPill label="Last 15 min" value={activity.createdLast15Min} color="sky" sub="games" />
        <StatPill label="Last 1 jam" value={activity.createdLastHour} color="amber" sub="games" />
        <StatPill
          label="Latest"
          value={activity.lastGameCreatedAt ? timeAgo(activity.lastGameCreatedAt) : '—'}
          color="emerald"
          sub="last game"
        />
      </motion.div>

      {/* Recent activity feed */}
      {activity.recent?.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="pro-glass rounded-2xl p-4">
          <h3 className="text-white font-black text-sm mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-300" /> Games Terkini Dicipta
          </h3>
          <div className="space-y-1.5">
            {activity.recent.map(g => {
              const lvl = LEVEL_LABEL[g.darjah || g.ageGroup] || g.ageGroup;
              const subj = SUBJECT_LABEL[g.category] || g.category;
              return (
                <div key={g.id} className="rounded-lg p-2.5 bg-emerald-500/5 ring-1 ring-emerald-400/15 flex items-center justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-white font-bold text-xs truncate">{g.title}</p>
                    <p className="text-[10px] text-white/60">{lvl} · {subj}</p>
                  </div>
                  <span className="text-[10px] font-black text-emerald-200 bg-emerald-500/15 px-2 py-0.5 rounded-full whitespace-nowrap">
                    {timeAgo(g.createdAt)}
                  </span>
                </div>
              );
            })}
          </div>
          <p className="text-[10px] text-white/45 mt-3 text-center">
            ℹ️ Background generator create games terus ke DB (tiada queue system) — ini activity sebenar.
          </p>
        </motion.div>
      )}
    </div>
  );
}