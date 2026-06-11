import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import {
  Activity, Loader2, RefreshCw, Zap, BookOpen, Gamepad2,
  Clock, Sparkles, AlertCircle, CheckCircle2, Pause, Library
} from 'lucide-react';

const LIB_LEVEL_LABEL = {
  prasekolah: 'Pra', darjah_1: 'D1', darjah_2: 'D2', darjah_3: 'D3',
  darjah_4: 'D4', darjah_5: 'D5', darjah_6: 'D6',
};

const CATEGORY_LABEL = {
  bahasa_melayu: 'BM', english: 'English', mathematics: 'Math',
  science: 'Sains', jawi: 'Jawi', story: 'Story',
};

const LEVEL_LABEL = {
  prasekolah: 'Prasekolah',
  darjah_1: 'D1', darjah_2: 'D2', darjah_3: 'D3',
  darjah_4: 'D4', darjah_5: 'D5', darjah_6: 'D6',
};

function timeAgo(min) {
  if (min < 1) return 'baru saja';
  if (min < 60) return `${min} min lalu`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h}j lalu`;
  return `${Math.floor(h / 24)}d lalu`;
}

function sourceIcon(source) {
  if (source === 'Story Generator') return <BookOpen className="w-3 h-3 text-sky-600" />;
  if (source === 'Mini Games (static)') return <Gamepad2 className="w-3 h-3 text-amber-600" />;
  return <Zap className="w-3 h-3 text-violet-600" />;
}

function sourceColor(source) {
  if (source === 'Story Generator') return 'bg-sky-100 text-sky-800 ring-sky-300';
  if (source === 'Mini Games (static)') return 'bg-amber-100 text-amber-800 ring-amber-300';
  return 'bg-violet-100 text-violet-800 ring-violet-300';
}

export default function BackgroundActivityPanel() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setRefreshing(true);
    try {
      const res = await base44.functions.invoke('getWorkerActivity', {});
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

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    if (!autoRefresh) return;
    const id = setInterval(fetchData, 30000); // refresh every 30s
    return () => clearInterval(id);
  }, [autoRefresh, fetchData]);

  if (loading) {
    return (
      <div className="pro-glass rounded-3xl p-12 text-center">
        <Loader2 className="w-8 h-8 text-violet-500 animate-spin mx-auto mb-3" />
        <p className="text-slate-700 font-bold text-sm">Memuatkan activity feed...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="pro-glass rounded-3xl p-6 text-center">
        <AlertCircle className="w-8 h-8 text-rose-500 mx-auto mb-2" />
        <p className="text-slate-900 font-black text-sm">Ralat: {error || 'No data'}</p>
        <button onClick={fetchData} className="mt-3 px-4 py-2 bg-slate-900 text-white rounded-xl font-bold text-sm">Cuba lagi</button>
      </div>
    );
  }

  const { liveStatus, currentActivity, enabled, counts, recentGames, hourlyBreakdown, library } = data;
  const lib = library || { last5Min: 0, last15Min: 0, last24h: 0, recentNotes: [] };
  const maxHourly = Math.max(...hourlyBreakdown.map(h => h.count), 1);

  const statusColors = {
    active: { bg: 'bg-emerald-100 ring-emerald-300', text: 'text-emerald-700', pulse: true, label: '🔴 LIVE — sedang generate' },
    recent: { bg: 'bg-sky-100 ring-sky-300', text: 'text-sky-700', pulse: false, label: '🟡 Recent — baru-baru ini ada activity' },
    idle: { bg: 'bg-slate-100 ring-slate-300', text: 'text-slate-700', pulse: false, label: '⚪ Idle — tiada activity terkini' },
  };
  const status = statusColors[liveStatus];

  return (
    <div className="space-y-4">
      {/* Live status hero */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-3xl p-5 ring-1 ${status.bg}`}
      >
        <div className="flex items-center justify-between gap-3 flex-wrap mb-3">
          <div className="flex items-center gap-3">
            <div className={`relative w-12 h-12 rounded-2xl flex items-center justify-center ${status.pulse ? 'bg-emerald-500' : 'bg-slate-900'}`}>
              <Activity className={`w-6 h-6 ${status.pulse ? 'text-white' : 'text-white'}`} />
              {status.pulse && <span className="absolute inset-0 rounded-2xl bg-emerald-400 animate-ping opacity-40" />}
            </div>
            <div>
              <p className={`font-black text-base ${status.text}`}>{status.label}</p>
              <p className="text-slate-700 text-xs font-semibold">{currentActivity}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-black ring-1 transition-all ${
                autoRefresh ? 'bg-emerald-500 text-white ring-emerald-600' : 'bg-white text-slate-700 ring-slate-300'
              }`}
            >
              {autoRefresh ? '⏸ Auto 30s' : '▶ Manual'}
            </button>
            <button onClick={fetchData} disabled={refreshing} className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 text-[11px] font-black ring-1 ring-slate-300 transition-all disabled:opacity-60 flex items-center gap-1">
              <RefreshCw className={`w-3 h-3 ${refreshing ? 'animate-spin' : ''}`} /> Refresh
            </button>
          </div>
        </div>

        {/* Generator state pills */}
        <div className="flex gap-2 flex-wrap">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black ring-1 ${enabled.kssr ? 'bg-violet-500 text-white ring-violet-600' : 'bg-white text-slate-500 ring-slate-300'}`}>
            <Zap className="w-3 h-3" /> KSSR {enabled.kssr ? 'ON · 5min' : 'OFF'}
          </span>
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black ring-1 ${enabled.story ? 'bg-sky-500 text-white ring-sky-600' : 'bg-white text-slate-500 ring-slate-300'}`}>
            <BookOpen className="w-3 h-3" /> Story {enabled.story ? 'ON · 10min' : 'OFF'}
          </span>
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black ring-1 ${lib.last5Min > 0 ? 'bg-fuchsia-500 text-white ring-fuchsia-600' : 'bg-white text-slate-500 ring-slate-300'}`}>
            <Library className="w-3 h-3" /> Library {lib.last5Min > 0 ? `LIVE · ${lib.last5Min}` : `${lib.last24h}/24j`}
          </span>
        </div>
      </motion.div>

      {/* Counts */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Last 5 min', value: counts.last5Min, color: counts.last5Min > 0 ? 'text-emerald-600' : 'text-slate-400', hot: counts.last5Min > 0 },
          { label: 'Last 15 min', value: counts.last15Min, color: 'text-sky-600' },
          { label: 'Last 1 jam', value: counts.lastHour, color: 'text-amber-600' },
          { label: 'Last 24 jam', value: counts.last24h, color: 'text-violet-600' },
        ].map((s, i) => (
          <div key={i} className={`rounded-xl p-3 ring-1 shadow-sm ${s.hot ? 'bg-emerald-100 ring-emerald-300' : 'bg-white ring-slate-200'}`}>
            <p className="text-[10px] font-black text-slate-600 uppercase tracking-wider mb-1">{s.label}</p>
            <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
            <p className="text-[10px] text-slate-500 mt-0.5 font-semibold">games created</p>
          </div>
        ))}
      </div>

      {/* Hourly breakdown chart */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="pro-glass rounded-2xl p-4">
        <h3 className="text-slate-900 font-black text-sm mb-3 flex items-center gap-2">
          <Clock className="w-4 h-4 text-amber-600" /> Activity 24 Jam Lepas
        </h3>
        <div className="flex items-end gap-0.5 h-24">
          {hourlyBreakdown.map((h, i) => {
            const heightPct = (h.count / maxHourly) * 100;
            return (
              <div key={i} className="flex-1 flex flex-col items-center justify-end h-full group relative">
                {h.count > 0 && (
                  <>
                    {h.story > 0 && (
                      <div
                        className="w-full bg-sky-500 transition-all"
                        style={{ height: `${(h.story / maxHourly) * 100}%` }}
                      />
                    )}
                    {h.kssr > 0 && (
                      <div
                        className="w-full bg-violet-500 transition-all"
                        style={{ height: `${(h.kssr / maxHourly) * 100}%` }}
                      />
                    )}
                  </>
                )}
                {h.count === 0 && <div className="w-full h-px bg-slate-200" />}
                <div className="absolute -top-7 bg-slate-900 text-white text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-10">
                  {h.hourAgo}j lalu: {h.count}
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex items-center justify-between mt-2 text-[10px] text-slate-600 font-semibold">
          <span>24j lalu</span>
          <div className="flex gap-3">
            <span className="flex items-center gap-1"><div className="w-2 h-2 bg-violet-500 rounded-sm" /> KSSR</span>
            <span className="flex items-center gap-1"><div className="w-2 h-2 bg-sky-500 rounded-sm" /> Story</span>
          </div>
          <span>Sekarang</span>
        </div>
      </motion.div>

      {/* Live feed — last 15 games */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="pro-glass rounded-2xl p-4">
        <h3 className="text-slate-900 font-black text-sm mb-3 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-600" /> Game Terbaru Dicipta (15 terakhir)
        </h3>
        {recentGames.length === 0 ? (
          <div className="text-center py-6">
            <Pause className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-slate-600 text-sm font-semibold">Tiada games dicipta lagi</p>
          </div>
        ) : (
          <div className="space-y-1.5 max-h-[400px] overflow-y-auto pr-1">
            <AnimatePresence initial={false}>
              {recentGames.map(g => {
                const lvl = LEVEL_LABEL[g.darjah || g.ageGroup] || g.ageGroup;
                const cat = CATEGORY_LABEL[g.category] || g.category;
                const isHot = g.ageMin < 5;
                return (
                  <motion.div
                    key={g.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className={`rounded-lg p-2.5 ring-1 flex items-center justify-between gap-2 ${isHot ? 'bg-emerald-50 ring-emerald-300' : 'bg-white ring-slate-200'}`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        {sourceIcon(g.source)}
                        <span className={`text-[9px] font-black px-1.5 py-0.5 rounded ring-1 ${sourceColor(g.source)}`}>
                          {g.source.replace(' Generator', '').replace(' (static)', '')}
                        </span>
                        <span className="text-[9px] font-bold text-slate-600">{lvl} · {cat} · {g.difficulty}</span>
                      </div>
                      <p className="text-slate-900 font-bold text-xs truncate">{g.title}</p>
                      <p className="text-[10px] text-slate-600 font-semibold">{g.questionsCount} soalan</p>
                    </div>
                    <div className="flex flex-col items-end gap-0.5 shrink-0">
                      {isHot && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                      <span className={`text-[10px] font-black whitespace-nowrap ${isHot ? 'text-emerald-700' : 'text-slate-600'}`}>
                        {timeAgo(g.ageMin)}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
        <p className="text-[10px] text-slate-500 mt-3 text-center font-semibold">
          ℹ️ Background generator create terus ke DB. Refresh setiap 30s untuk tengok live.
        </p>
      </motion.div>

      {/* Live feed — Library notes terbaru */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="pro-glass rounded-2xl p-4">
        <h3 className="text-slate-900 font-black text-sm mb-3 flex items-center gap-2">
          <Library className="w-4 h-4 text-fuchsia-600" /> Nota Library Terbaru (15 terakhir)
        </h3>
        {lib.recentNotes.length === 0 ? (
          <div className="text-center py-6">
            <Pause className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-slate-600 text-sm font-semibold">Tiada nota dijana lagi</p>
          </div>
        ) : (
          <div className="space-y-1.5 max-h-[400px] overflow-y-auto pr-1">
            <AnimatePresence initial={false}>
              {lib.recentNotes.map(n => {
                const isHot = n.ageMin < 5;
                return (
                  <motion.div
                    key={n.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className={`rounded-lg p-2.5 ring-1 flex items-center justify-between gap-2 ${isHot ? 'bg-fuchsia-50 ring-fuchsia-300' : 'bg-white ring-slate-200'}`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <span className="text-xl shrink-0">{n.emoji}</span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="text-[9px] font-black px-1.5 py-0.5 rounded ring-1 bg-fuchsia-100 text-fuchsia-800 ring-fuchsia-300">
                            {n.subject}
                          </span>
                          <span className="text-[9px] font-bold text-slate-600">{LIB_LEVEL_LABEL[n.level] || n.level} · {n.branches} cabang</span>
                        </div>
                        <p className="text-slate-900 font-bold text-xs truncate">{n.title}</p>
                      </div>
                    </div>
                    <span className={`text-[10px] font-black whitespace-nowrap shrink-0 ${isHot ? 'text-fuchsia-700' : 'text-slate-600'}`}>
                      {timeAgo(n.ageMin)}
                    </span>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </motion.div>
    </div>
  );
}