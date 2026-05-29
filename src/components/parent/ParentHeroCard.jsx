import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

/**
 * Playful CeriaKid hero — pastel candy gradient, floating bunny mascot,
 * rounded soft pills. Vibe: friendly children's brand untuk parents.
 */
export default function ParentHeroCard({ totalChildren, totalGames, totalStars, avgStars }) {
  const stats = [
    { emoji: '👶', label: 'Anak', value: totalChildren, color: '#f9a8d4' },
    { emoji: '🎮', label: 'Games', value: totalGames, color: '#93c5fd' },
    { emoji: '⭐', label: 'Bintang', value: totalStars, color: '#fcd34d' },
    { emoji: '✨', label: 'Purata', value: avgStars, color: '#c4b5fd' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative rounded-[2rem] p-6 sm:p-7 mb-5 overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #fef3c7 0%, #fbcfe8 50%, #c7d2fe 100%)',
        boxShadow: '0 10px 30px rgba(251, 207, 232, 0.4), inset 0 2px 0 rgba(255,255,255,0.6)',
      }}
    >
      {/* Floating decorations */}
      <motion.div
        animate={{ y: [0, -8, 0], rotate: [0, 5, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-4 right-6 text-3xl opacity-70"
      >
        🌈
      </motion.div>
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        className="absolute top-12 right-20 text-2xl opacity-60"
      >
        ☁️
      </motion.div>
      <div className="absolute bottom-2 left-4 text-2xl opacity-40">⭐</div>
      <div className="absolute top-1/2 right-1/3 text-xl opacity-30">💖</div>

      <div className="relative flex items-start gap-4 mb-5">
        {/* Bunny mascot */}
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl flex items-center justify-center text-5xl sm:text-6xl flex-shrink-0"
          style={{
            background: 'rgba(255,255,255,0.7)',
            boxShadow: '0 6px 0 rgba(244, 114, 182, 0.3), 0 8px 20px rgba(0,0,0,0.05)',
          }}
        >
          🐰
        </motion.div>

        <div className="flex-1 min-w-0 pt-1">
          <div
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full mb-2"
            style={{ background: 'rgba(255,255,255,0.7)' }}
          >
            <Sparkles className="w-3 h-3 text-pink-500" strokeWidth={3} />
            <span className="text-[10px] font-black uppercase tracking-wider text-pink-700">Prestasi Keluarga</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-800 leading-tight">
            Hai Mama & Papa! 👋
          </h1>
          <p className="text-slate-600 text-sm font-bold mt-1">
            Tengok progress anak-anak kita hari ini ✨
          </p>
        </div>
      </div>

      {/* Stats — soft pastel pills */}
      <div className="relative grid grid-cols-4 gap-2 sm:gap-3">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 + i * 0.08, type: 'spring', stiffness: 220 }}
            className="rounded-2xl p-2.5 sm:p-3 text-center"
            style={{
              background: 'rgba(255,255,255,0.85)',
              boxShadow: `0 4px 0 ${s.color}, 0 6px 14px rgba(0,0,0,0.04)`,
            }}
          >
            <div className="text-2xl sm:text-3xl mb-0.5 leading-none">{s.emoji}</div>
            <p className="font-black text-lg sm:text-xl text-slate-800 leading-none tabular-nums">{s.value}</p>
            <p className="text-slate-500 text-[9px] sm:text-[10px] font-black uppercase tracking-wider mt-1">
              {s.label}
            </p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}