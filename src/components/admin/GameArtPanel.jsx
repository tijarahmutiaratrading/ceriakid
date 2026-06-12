import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { ImageIcon, Loader2, RefreshCw, Sparkles, CheckCircle2, Play, AlertCircle } from 'lucide-react';

function timeAgo(min) {
  if (min < 1) return 'baru saja';
  if (min < 60) return `${min} min lalu`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h}j lalu`;
  return `${Math.floor(h / 24)}d lalu`;
}

export default function GameArtPanel() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setRefreshing(true);
    try {
      const res = await base44.functions.invoke('getGameArtProgress', {});
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
    const id = setInterval(fetchData, 20000);
    return () => clearInterval(id);
  }, [autoRefresh, fetchData]);

  const runBatch = async () => {
    setRunning(true);
    try {
      await base44.functions.invoke('generateGameArt', { batchSize: 8 });
      await fetchData();
    } catch (e) {
      setError(e.message);
    } finally {
      setRunning(false);
    }
  };

  if (loading) {
    return (
      <div className="pro-glass rounded-3xl p-12 text-center">
        <Loader2 className="w-8 h-8 text-fuchsia-500 animate-spin mx-auto mb-3" />
        <p className="text-slate-700 font-bold text-sm">Memuatkan progress gambar...</p>
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

  const { total, done, remaining, percent, last5, last15, lastHour, live, recentGames } = data;

  return (
    <div className="space-y-4">
      {/* Hero status */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-3xl p-5 ring-1 ${live ? 'bg-emerald-100 ring-emerald-300' : 'pro-glass'}`}
      >
        <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
          <div className="flex items-center gap-3">
            <div className={`relative w-12 h-12 rounded-2xl flex items-center justify-center ${live ? 'bg-emerald-500' : 'bg-fuchsia-600'}`}>
              <ImageIcon className="w-6 h-6 text-white" />
              {live && <span className="absolute inset-0 rounded-2xl bg-emerald-400 animate-ping opacity-40" />}
            </div>
            <div>
              <p className={`font-black text-base ${live ? 'text-emerald-700' : 'text-slate-900'}`}>
                {live ? '🔴 LIVE — sedang generate gambar' : '🖼️ Gambar Unik Games'}
              </p>
              <p className="text-slate-600 text-xs font-semibold">
                Server auto-generate 8 gambar setiap 5 minit. Browser boleh tutup. ✅
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-black ring-1 transition-all ${
                autoRefresh ? 'bg-emerald-500 text-white ring-emerald-600' : 'bg-white text-slate-700 ring-slate-300'
              }`}
            >
              {autoRefresh ? '⏸ Auto 20s' : '▶ Manual'}
            </button>
            <button onClick={fetchData} disabled={refreshing} className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 text-[11px] font-black ring-1 ring-slate-300 transition-all disabled:opacity-60 flex items-center gap-1">
              <RefreshCw className={`w-3 h-3 ${refreshing ? 'animate-spin' : ''}`} /> Refresh
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="flex items-center justify-between text-xs font-black text-slate-700 mb-1.5">
          <span>{done.toLocaleString()} / {total.toLocaleString()} ada gambar</span>
          <span>{percent}%</span>
        </div>
        <div className="h-3 rounded-full bg-white/70 ring-1 ring-slate-200 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-fuchsia-500 to-violet-500"
            initial={{ width: 0 }}
            animate={{ width: `${percent}%` }}
            transition={{ duration: 0.6 }}
          />
        </div>
        <p className="text-[11px] text-slate-600 font-bold mt-1.5">
          Baki <span className="text-fuchsia-700">{remaining.toLocaleString()}</span> game perlu gambar.
        </p>

        {/* Butang generate manual untuk laju */}
        <button
          onClick={runBatch}
          disabled={running || remaining === 0}
          className="mt-3 w-full py-2.5 rounded-xl bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-black text-sm flex items-center justify-center gap-2 disabled:opacity-50 transition-all"
        >
          {running ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
          {remaining === 0 ? 'Semua game ada gambar 🎉' : running ? 'Sedang generate...' : 'Generate 8 sekarang (manual)'}
        </button>
      </motion.div>

      {/* Counts */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: '5 min lepas', value: last5, hot: last5 > 0 },
          { label: '15 min lepas', value: last15 },
          { label: '1 jam lepas', value: lastHour },
        ].map((s, i) => (
          <div key={i} className={`rounded-xl p-3 ring-1 shadow-sm ${s.hot ? 'bg-emerald-100 ring-emerald-300' : 'bg-white ring-slate-200'}`}>
            <p className="text-[10px] font-black text-slate-600 uppercase tracking-wider mb-1">{s.label}</p>
            <p className={`text-2xl font-black ${s.hot ? 'text-emerald-700' : 'text-fuchsia-600'}`}>{s.value}</p>
            <p className="text-[10px] text-slate-500 mt-0.5 font-semibold">gambar dijana</p>
          </div>
        ))}
      </div>

      {/* Live feed — gambar terbaru */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="pro-glass rounded-2xl p-4">
        <h3 className="text-slate-900 font-black text-sm mb-3 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-fuchsia-600" /> Gambar Terbaru Dijana (12 terakhir)
        </h3>
        {recentGames.length === 0 ? (
          <div className="text-center py-6">
            <ImageIcon className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-slate-600 text-sm font-semibold">Tiada gambar dijana lagi</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            <AnimatePresence initial={false}>
              {recentGames.map(g => {
                const isHot = g.ageMin < 5;
                return (
                  <motion.div
                    key={g.id}
                    initial={{ opacity: 0, scale: 0.92 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className={`rounded-xl overflow-hidden ring-1 ${isHot ? 'ring-emerald-300' : 'ring-slate-200'}`}
                  >
                    <div className="aspect-[16/10] bg-slate-100 overflow-hidden">
                      <img src={g.iconUrl} alt={g.title} loading="lazy" className="w-full h-full object-cover" />
                    </div>
                    <div className="p-2 bg-white">
                      <p className="text-slate-900 font-bold text-[11px] truncate">{g.title}</p>
                      <span className={`text-[10px] font-black ${isHot ? 'text-emerald-700' : 'text-slate-500'} flex items-center gap-1`}>
                        {isHot && <CheckCircle2 className="w-3 h-3" />} {timeAgo(g.ageMin)}
                      </span>
                    </div>
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