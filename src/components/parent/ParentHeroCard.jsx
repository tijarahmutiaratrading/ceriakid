import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Zap, Star, Target, Sparkles } from 'lucide-react';

export default function ParentHeroCard({ totalChildren, totalGames, totalStars, avgStars }) {
  const stats = [
    { icon: Trophy, label: 'Anak Aktif', value: totalChildren, gradient: 'from-yellow-400 to-orange-500', glow: 'shadow-yellow-500/40' },
    { icon: Zap, label: 'Games', value: totalGames, gradient: 'from-cyan-400 to-blue-500', glow: 'shadow-cyan-500/40' },
    { icon: Star, label: 'Bintang', value: totalStars, gradient: 'from-pink-400 to-rose-500', glow: 'shadow-pink-500/40' },
    { icon: Target, label: 'Purata', value: `${avgStars}⭐`, gradient: 'from-emerald-400 to-teal-500', glow: 'shadow-emerald-500/40' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative isolate overflow-hidden rounded-[2rem] transform-gpu"
      style={{
        background: 'linear-gradient(135deg, rgba(255,255,255,0.16), rgba(255,255,255,0.06))',
        backdropFilter: 'blur(28px) saturate(160%)',
        WebkitBackdropFilter: 'blur(28px) saturate(160%)',
        border: '1px solid rgba(255,255,255,0.25)',
        boxShadow: '0 30px 80px -20px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.12) inset',
      }}
    >
      {/* Decorative glass orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ x: [0, 20, 0], y: [0, -10, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-white/20 blur-3xl"
        />
        <motion.div
          animate={{ x: [0, -15, 0], y: [0, 15, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -bottom-20 -left-10 w-72 h-72 rounded-full bg-cyan-300/25 blur-3xl"
        />
        <motion.div
          animate={{ x: [0, 10, 0], y: [0, 8, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-1/2 left-1/3 w-40 h-40 rounded-full bg-yellow-300/20 blur-3xl"
        />
      </div>

      {/* Grid pattern overlay — adds depth */}
      <div
        className="absolute inset-0 opacity-[0.08] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* Floating sparkles */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        className="absolute top-4 right-4 text-yellow-200/50"
      >
        <Sparkles className="w-8 h-8" />
      </motion.div>

      <div className="relative z-10 p-5 sm:p-6 md:p-7">
        {/* Header */}
        <div className="flex items-center gap-3 sm:gap-4 mb-5 sm:mb-6">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center text-3xl sm:text-4xl flex-shrink-0"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.35), rgba(255,255,255,0.15))',
              backdropFilter: 'blur(20px)',
              border: '1.5px solid rgba(255,255,255,0.4)',
              boxShadow: '0 8px 20px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.5)',
            }}
          >
            📊
          </motion.div>
          <div className="min-w-0 flex-1">
            <p className="text-white/85 text-[10px] sm:text-[11px] font-black uppercase tracking-[0.22em] leading-none">Parent Dashboard</p>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white leading-tight mt-1.5 drop-shadow-md">
              Prestasi Anak
            </h1>
            <p className="text-white/85 text-xs sm:text-sm font-semibold mt-1 drop-shadow">
              Pantau perkembangan & beri motivasi
            </p>
          </div>
        </div>

        {/* Stats grid — true glass tiles */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 15, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.15 + i * 0.07, type: 'spring', stiffness: 200 }}
              whileHover={{ y: -2, scale: 1.02 }}
              className="relative rounded-2xl p-3 sm:p-3.5 overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.25), rgba(255,255,255,0.1))',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.35)',
                boxShadow: '0 8px 24px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.4)',
              }}
            >
              {/* Icon */}
              <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl mb-2 bg-gradient-to-br ${s.gradient} flex items-center justify-center shadow-lg ${s.glow}`}>
                <s.icon className="w-4 h-4 sm:w-5 sm:h-5 text-white drop-shadow" />
              </div>
              {/* Value */}
              <p className="text-white font-black text-xl sm:text-2xl leading-none drop-shadow">{s.value}</p>
              <p className="text-white/85 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider mt-1 truncate">{s.label}</p>

              {/* Subtle inner highlight */}
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}