import React from 'react';
import { motion } from 'framer-motion';
import { Flame } from 'lucide-react';

/**
 * Duolingo-style hero card — white bg, chunky rounded, big streak number with flame,
 * daily goal progress bar with rainbow gradient, mascot illustration on the left.
 */
export default function ParentHeroCard({ totalChildren, totalGames, totalStars, avgStars }) {
  // Streak proxy = totalStars (overall family fire)
  const streak = totalStars;
  // Daily goal proxy: assume 30 stars/day target → percentage capped at 100
  const dailyTarget = 30;
  const dailyProgress = Math.min(100, Math.round((streak / dailyTarget) * 100));

  return (
    <motion.div
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative rounded-[2rem] overflow-hidden mb-4"
      style={{
        background: '#f1f5f9',
        border: '3px solid #e2e8f0',
        boxShadow: '0 4px 0 #cbd5e1, 0 12px 24px rgba(15, 23, 42, 0.06)',
      }}
    >
      {/* Confetti dots */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[
          { x: '8%', y: '20%', color: '#ef4444', shape: 'rounded-full', size: 'w-2 h-2' },
          { x: '18%', y: '12%', color: '#3b82f6', shape: 'rounded-sm', size: 'w-2.5 h-1' },
          { x: '32%', y: '8%', color: '#10b981', shape: 'rounded-full', size: 'w-1.5 h-1.5' },
          { x: '55%', y: '15%', color: '#f59e0b', shape: 'rounded-sm', size: 'w-2 h-1' },
          { x: '75%', y: '10%', color: '#8b5cf6', shape: 'rounded-full', size: 'w-2 h-2' },
          { x: '88%', y: '22%', color: '#ec4899', shape: 'rounded-sm', size: 'w-2 h-1' },
          { x: '92%', y: '40%', color: '#fbbf24', shape: 'rounded-full', size: 'w-1.5 h-1.5' },
        ].map((d, i) => (
          <motion.div
            key={i}
            animate={{ y: [0, -6, 0], rotate: [0, 15, 0] }}
            transition={{ duration: 3 + i * 0.3, repeat: Infinity, ease: 'easeInOut' }}
            className={`absolute ${d.shape} ${d.size}`}
            style={{ left: d.x, top: d.y, backgroundColor: d.color }}
          />
        ))}
      </div>

      {/* Top section: mascot + streak */}
      <div className="relative grid grid-cols-[auto_1fr] sm:grid-cols-[1fr_auto] items-center gap-3 sm:gap-6 p-5 sm:p-7 pb-3 sm:pb-4">
        {/* Mascot — left side */}
        <motion.div
          initial={{ scale: 0, rotate: -30 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 14, delay: 0.1 }}
          className="text-6xl sm:text-8xl leading-none order-1 sm:order-1"
        >
          📊
        </motion.div>

        {/* Text + streak number — right side */}
        <div className="min-w-0 order-2 sm:order-2 text-right">
          <p className="text-slate-500 text-[10px] sm:text-xs font-black uppercase tracking-[0.18em] mb-1">Parent Dashboard</p>
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-slate-900 leading-none tracking-tight">
            Prestasi Anak
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm font-bold mt-1">Pantau dan beri motivasi</p>

          {/* BIG streak number with flame */}
          <div className="flex items-end justify-end gap-2 mt-3 sm:mt-4">
            <motion.span
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.3 }}
              className="text-5xl sm:text-7xl font-black text-slate-900 leading-none tracking-tight tabular-nums"
            >
              {streak}
            </motion.span>
            <motion.span
              animate={{ rotate: [0, -8, 8, -8, 0], scale: [1, 1.1, 1] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
              className="text-4xl sm:text-6xl leading-none"
            >
              🔥
            </motion.span>
          </div>
        </div>
      </div>

      {/* Daily Goal bar — yellow strip across full width */}
      <div
        className="relative px-5 sm:px-7 py-3 sm:py-4 flex items-center gap-3 sm:gap-4"
        style={{ background: '#fbbf24', borderTop: '3px solid #f59e0b' }}
      >
        <div className="flex-1 min-w-0">
          <p className="text-amber-950 text-[11px] sm:text-sm font-black mb-1.5 sm:mb-2 flex items-center gap-1.5">
            Daily Goal:
            <span className="text-amber-900">{streak} / {dailyTarget} bintang</span>
            <span className="ml-auto sm:ml-2 flex gap-0.5">
              {[1, 2, 3].map((star) => (
                <span key={star} className={`text-base sm:text-lg ${dailyProgress >= star * 33 ? 'text-yellow-200' : 'text-amber-700/40'}`}>
                  ⭐
                </span>
              ))}
            </span>
          </p>
          {/* Rainbow progress bar */}
          <div className="relative h-5 sm:h-6 rounded-full overflow-hidden bg-white shadow-inner border-2 border-amber-700/30">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${dailyProgress}%` }}
              transition={{ duration: 1.2, ease: 'easeOut', delay: 0.4 }}
              className="absolute inset-y-0 left-0 rounded-full"
              style={{
                background: 'linear-gradient(90deg, #ef4444 0%, #f97316 20%, #fbbf24 40%, #22c55e 60%, #3b82f6 80%, #8b5cf6 100%)',
              }}
            />
            <div className="absolute inset-0 flex items-center justify-end pr-2 sm:pr-3">
              <span className="text-[10px] sm:text-xs font-black text-slate-900 drop-shadow-sm">{dailyProgress}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4 mini stat chips below */}
      <div className="relative grid grid-cols-4 gap-2 px-3 sm:px-5 py-3 sm:py-4 bg-white border-t-2 border-slate-100">
        {[
          { emoji: '👶', value: totalChildren, label: 'Anak' },
          { emoji: '🎮', value: totalGames, label: 'Games' },
          { emoji: '⭐', value: totalStars, label: 'Bintang' },
          { emoji: '📈', value: avgStars, label: 'Purata' },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + i * 0.06 }}
            className="text-center"
          >
            <div className="text-xl sm:text-2xl mb-0.5">{s.emoji}</div>
            <p className="text-slate-900 font-black text-base sm:text-lg leading-none tabular-nums">{s.value}</p>
            <p className="text-slate-500 text-[9px] sm:text-[10px] font-black uppercase tracking-wider mt-0.5">{s.label}</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}