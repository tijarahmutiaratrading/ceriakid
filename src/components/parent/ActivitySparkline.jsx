import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, BarChart3 } from 'lucide-react';
import SectionCardHeader from '@/components/ui/SectionCardHeader';

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
  const trendColor = trend === 'up' ? '#16a34a' : trend === 'down' ? '#dc2626' : '#64748b';
  const trendBg = trend === 'up' ? '#dcfce7' : trend === 'down' ? '#fee2e2' : '#f1f5f9';
  const trendLabel = trend === 'up' ? 'Semakin Aktif' : trend === 'down' ? 'Perlu Galakan' : 'Stabil';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-[2rem] p-5 space-y-3"
      style={{
        background: 'linear-gradient(135deg, #ffffff 0%, #fef9f3 100%)',
        boxShadow: '0 8px 20px rgba(251, 207, 232, 0.25), 0 0 0 2px rgba(251, 207, 232, 0.3)',
      }}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <motion.div
            animate={{ y: [0, -3, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #c7d2fe 0%, #a5b4fc 100%)', boxShadow: '0 3px 0 #818cf8' }}
          >
            📊
          </motion.div>
          <div className="min-w-0">
            <p className="text-slate-800 text-base font-black leading-none truncate">Aktiviti 7 Hari</p>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-wider mt-1">Sesi bermain harian</p>
          </div>
        </div>
        <div
          className="flex items-center gap-1 px-2.5 py-1 rounded-full flex-shrink-0"
          style={{ background: trendBg, color: trendColor }}
        >
          <TrendIcon className="w-3 h-3" strokeWidth={3} />
          <span className="text-[10px] font-black uppercase tracking-wide">{trendLabel}</span>
        </div>
      </div>

      <div
        className="rounded-2xl p-3"
        style={{ background: 'linear-gradient(135deg, #fef9f3 0%, #fce7f3 100%)' }}
      >
        <div className="flex items-end justify-between gap-1.5 h-20 mb-2">
          {data.days.map((d, i) => {
            const isToday = i === data.days.length - 1;
            const heightPct = (d.count / data.max) * 100;
            return (
              <div key={i} className="flex-1 flex flex-col items-center justify-end h-full">
                <div className="relative w-full flex items-end justify-center h-full">
                  {d.count > 0 && (
                    <span className="absolute -top-1 text-slate-700 text-[9px] font-black">{d.count}</span>
                  )}
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${heightPct}%` }}
                    transition={{ duration: 0.6, delay: i * 0.05, ease: 'easeOut' }}
                    className="w-full rounded-t-xl"
                    style={{
                      background: d.count === 0
                        ? '#e2e8f0'
                        : isToday
                        ? 'linear-gradient(to top, #f472b6, #fcd34d)'
                        : 'linear-gradient(to top, #a5b4fc, #67e8f9)',
                      minHeight: d.count > 0 ? '12px' : '4px',
                      boxShadow: d.count > 0 ? '0 2px 4px rgba(0,0,0,0.06)' : 'none',
                    }}
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
                <p className="text-[10px] font-black" style={{ color: isToday ? '#db2777' : '#64748b' }}>
                  {d.label}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-between pt-1">
        <p className="text-slate-500 text-[10px] font-black uppercase tracking-wider">Minggu ini</p>
        <p className="text-slate-800 font-black text-sm">{data.total} sesi 🎮</p>
      </div>
    </motion.div>
  );
}