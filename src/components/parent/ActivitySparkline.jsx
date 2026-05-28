import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

/**
 * 7-day activity sparkline — counts games played per day for last 7 days.
 * Shows trend (up/down/flat) compared to previous 7 days.
 */
export default function ActivitySparkline({ games }) {
  const data = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const days = [];

    // Build 7-day bucket (today − 6 ... today)
    for (let i = 6; i >= 0; i--) {
      const day = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
      days.push({
        date: day,
        label: ['Ahd', 'Isn', 'Sel', 'Rab', 'Kha', 'Jum', 'Sab'][day.getDay()],
        count: 0,
        stars: 0,
      });
    }

    // Tally from playHistory if available, else from lastPlayedDate
    games.forEach((g) => {
      const history = Array.isArray(g.playHistory) ? g.playHistory : [];
      if (history.length > 0) {
        history.forEach((h) => {
          if (!h.date) return;
          const hDate = new Date(h.date);
          hDate.setHours(0, 0, 0, 0);
          const bucket = days.find((d) => d.date.getTime() === hDate.getTime());
          if (bucket) {
            bucket.count += 1;
            bucket.stars += h.stars || 0;
          }
        });
      } else if (g.lastPlayedDate) {
        const pDate = new Date(g.lastPlayedDate);
        pDate.setHours(0, 0, 0, 0);
        const bucket = days.find((d) => d.date.getTime() === pDate.getTime());
        if (bucket) {
          bucket.count += 1;
          bucket.stars += g.bestStars || 0;
        }
      }
    });

    const max = Math.max(...days.map((d) => d.count), 1);
    const total = days.reduce((s, d) => s + d.count, 0);
    return { days, max, total };
  }, [games]);

  // Compare last 3 vs first 3 days for trend
  const trend = useMemo(() => {
    const first3 = data.days.slice(0, 3).reduce((s, d) => s + d.count, 0);
    const last3 = data.days.slice(4, 7).reduce((s, d) => s + d.count, 0);
    if (last3 > first3) return 'up';
    if (last3 < first3) return 'down';
    return 'flat';
  }, [data]);

  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const trendColor = trend === 'up' ? 'text-emerald-300' : trend === 'down' ? 'text-rose-300' : 'text-white/60';
  const trendLabel = trend === 'up' ? 'Semakin Aktif' : trend === 'down' ? 'Perlu Galakan' : 'Stabil';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl p-4"
      style={{
        background: 'linear-gradient(135deg, rgba(15,23,42,0.88), rgba(88,28,135,0.82), rgba(190,24,93,0.72))',
        backdropFilter: 'blur(22px) saturate(150%)',
        WebkitBackdropFilter: 'blur(22px) saturate(150%)',
        border: '1px solid rgba(255,255,255,0.18)',
        boxShadow: '0 18px 50px rgba(31, 16, 92, 0.25)',
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <p className="text-white text-xs font-black uppercase tracking-wider flex items-center gap-2">
          📈 Aktiviti 7 Hari
        </p>
        <div className={`flex items-center gap-1.5 ${trendColor}`}>
          <TrendIcon className="w-3.5 h-3.5" />
          <span className="text-[10px] font-black uppercase tracking-wide">{trendLabel}</span>
        </div>
      </div>

      <div className="flex items-end justify-between gap-1.5 h-20 mb-2">
        {data.days.map((d, i) => {
          const isToday = i === data.days.length - 1;
          const heightPct = (d.count / data.max) * 100;
          return (
            <div key={i} className="flex-1 flex flex-col items-center justify-end h-full">
              <div className="relative w-full flex items-end justify-center h-full">
                {d.count > 0 && (
                  <span className="absolute -top-0.5 text-white text-[9px] font-black">{d.count}</span>
                )}
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${heightPct}%` }}
                  transition={{ duration: 0.6, delay: i * 0.05, ease: 'easeOut' }}
                  className={`w-full rounded-t-lg ${
                    d.count === 0
                      ? 'bg-white/15'
                      : isToday
                      ? 'bg-gradient-to-t from-pink-400 to-yellow-300'
                      : 'bg-gradient-to-t from-purple-400 to-cyan-300'
                  }`}
                  style={{ minHeight: d.count > 0 ? '12px' : '4px' }}
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
              <p className={`text-[10px] font-black ${isToday ? 'text-yellow-300' : 'text-white/70'}`}>{d.label}</p>
            </div>
          );
        })}
      </div>

      <div className="mt-3 pt-3 border-t border-white/15 flex items-center justify-between">
        <p className="text-white/80 text-[10px] font-bold">Jumlah minggu ini</p>
        <p className="text-white font-black text-sm">{data.total} sesi 🎮</p>
      </div>
    </motion.div>
  );
}