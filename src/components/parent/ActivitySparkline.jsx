import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, BarChart3 } from 'lucide-react';

export default function ActivitySparkline({ games }) {
  const data = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const day = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
      days.push({ date: day, label: ['Ahd', 'Isn', 'Sel', 'Rab', 'Kha', 'Jum', 'Sab'][day.getDay()], count: 0 });
    }
    games.forEach((g) => {
      const history = Array.isArray(g.playHistory) ? g.playHistory : [];
      if (history.length > 0) {
        history.forEach((h) => {
          if (!h.date) return;
          const hDate = new Date(h.date);
          hDate.setHours(0, 0, 0, 0);
          const bucket = days.find((d) => d.date.getTime() === hDate.getTime());
          if (bucket) bucket.count += 1;
        });
      } else if (g.lastPlayedDate) {
        const pDate = new Date(g.lastPlayedDate);
        pDate.setHours(0, 0, 0, 0);
        const bucket = days.find((d) => d.date.getTime() === pDate.getTime());
        if (bucket) bucket.count += 1;
      }
    });
    const max = Math.max(...days.map((d) => d.count), 1);
    const total = days.reduce((s, d) => s + d.count, 0);
    return { days, max, total };
  }, [games]);

  const trend = useMemo(() => {
    const first3 = data.days.slice(0, 3).reduce((s, d) => s + d.count, 0);
    const last3 = data.days.slice(4, 7).reduce((s, d) => s + d.count, 0);
    if (last3 > first3) return 'up';
    if (last3 < first3) return 'down';
    return 'flat';
  }, [data]);

  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const trendConfig = {
    up: { label: 'Semakin Aktif', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    down: { label: 'Perlu Galakan', cls: 'bg-red-50 text-red-600 border-red-200' },
    flat: { label: 'Stabil', cls: 'bg-slate-100 text-slate-600 border-slate-200' },
  }[trend];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-3xl shadow-xl border border-white/60 overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-purple-500 flex items-center justify-center">
            <BarChart3 className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-slate-900 text-sm font-black leading-none">Aktiviti 7 Hari</p>
            <p className="text-slate-400 text-[10px] font-semibold mt-0.5">Sesi bermain harian</p>
          </div>
        </div>
        <div className={`flex items-center gap-1 px-2 py-1 rounded-md border text-[10px] font-bold ${trendConfig.cls}`}>
          <TrendIcon className="w-3 h-3" />
          <span>{trendConfig.label}</span>
        </div>
      </div>

      {/* Chart */}
      <div className="px-5 py-4">
        <div className="flex items-end justify-between gap-1.5 h-20 mb-2">
          {data.days.map((d, i) => {
            const isToday = i === data.days.length - 1;
            const heightPct = (d.count / data.max) * 100;
            return (
              <div key={i} className="flex-1 flex flex-col items-center justify-end h-full">
                <div className="relative w-full flex items-end justify-center h-full">
                  {d.count > 0 && (
                    <span className="absolute -top-4 text-slate-600 text-[9px] font-bold">{d.count}</span>
                  )}
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${heightPct}%` }}
                    transition={{ duration: 0.6, delay: i * 0.05, ease: 'easeOut' }}
                    className={`w-full rounded-t-md ${isToday ? 'bg-pink-500' : d.count > 0 ? 'bg-purple-400' : 'bg-slate-200'}`}
                    style={{ minHeight: d.count > 0 ? '10px' : '3px' }}
                  />
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex items-end justify-between gap-1.5">
          {data.days.map((d, i) => {
            const isToday = i === data.days.length - 1;
            return (
              <div key={i} className="flex-1 text-center">
                <p className={`text-[10px] font-bold ${isToday ? 'text-pink-600' : 'text-slate-400'}`}>{d.label}</p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 bg-slate-50">
        <p className="text-slate-500 text-[11px] font-bold uppercase tracking-wide">Minggu ini</p>
        <p className="text-slate-900 font-black text-sm">{data.total} sesi</p>
      </div>
    </motion.div>
  );
}