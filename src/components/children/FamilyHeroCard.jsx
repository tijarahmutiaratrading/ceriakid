import React from 'react';
import { motion } from 'framer-motion';
import { Users, Plus, Trophy, Sparkles } from 'lucide-react';

/**
 * Premium dark-glass family hero — matches ParentDashboard aesthetic.
 * Replaces the bright purple/pink gradient hero with a refined navy/purple dark-glass look.
 */
export default function FamilyHeroCard({
  children,
  maxCount,
  familyStats,
  leaderName,
  showForm,
  onAddClick,
}) {
  const canAdd = children.length < maxCount && !showForm;
  const fillPct = Math.min(100, (children.length / maxCount) * 100);

  // Leader avatar (for spotlight strip)
  const leaderChild = leaderName ? children.find((c) => c.name === leaderName) : null;

  const stats = [
    { label: 'Anak', value: children.length, emoji: '👶', gradient: 'from-cyan-400 to-blue-500' },
    { label: 'Games', value: familyStats.totalGames, emoji: '🎮', gradient: 'from-purple-400 to-fuchsia-500' },
    { label: 'Bintang', value: familyStats.totalStars, emoji: '⭐', gradient: 'from-yellow-400 to-orange-500' },
    { label: 'Perfect', value: familyStats.totalPerfect, emoji: '🏆', gradient: 'from-emerald-400 to-teal-500' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6 rounded-[2rem] relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, rgba(15,23,42,0.95) 0%, rgba(49,16,90,0.92) 45%, rgba(88,28,135,0.88) 100%)',
        backdropFilter: 'blur(24px)',
        border: '1px solid rgba(255,255,255,0.12)',
        boxShadow: '0 30px 80px -20px rgba(15,23,42,0.7), inset 0 1px 0 rgba(255,255,255,0.08)',
      }}
    >
      {/* Subtle ambient orbs — much more muted than before */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ x: [0, 18, 0], y: [0, -8, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-24 -right-20 w-72 h-72 rounded-full bg-fuchsia-500/15 blur-3xl"
        />
        <motion.div
          animate={{ x: [0, -12, 0], y: [0, 12, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -bottom-24 -left-16 w-80 h-80 rounded-full bg-indigo-500/15 blur-3xl"
        />
      </div>

      {/* Fine grid pattern — barely visible */}
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none" style={{
        backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
        backgroundSize: '28px 28px',
      }} />

      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />

      <div className="relative z-10 p-5 sm:p-7 md:p-8">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3 mb-5">
          <div className="flex items-center gap-3.5 min-w-0 flex-1">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center flex-shrink-0 relative"
              style={{
                background: 'linear-gradient(135deg, rgba(168,85,247,0.4), rgba(236,72,153,0.3))',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.2)',
                boxShadow: '0 8px 24px rgba(168,85,247,0.3), inset 0 1px 0 rgba(255,255,255,0.25)',
              }}
            >
              <svg viewBox="0 0 64 64" className="w-9 h-9 sm:w-11 sm:h-11" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="famParent" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#fde68a" />
                    <stop offset="100%" stopColor="#fb923c" />
                  </linearGradient>
                  <linearGradient id="famKid" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#a5f3fc" />
                    <stop offset="100%" stopColor="#60a5fa" />
                  </linearGradient>
                  <linearGradient id="famKid2" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#fbcfe8" />
                    <stop offset="100%" stopColor="#f472b6" />
                  </linearGradient>
                </defs>
                {/* Parent left (taller) */}
                <circle cx="20" cy="20" r="6" fill="url(#famParent)" />
                <path d="M10 44c0-5.5 4.5-10 10-10s10 4.5 10 10v6H10v-6z" fill="url(#famParent)" />
                {/* Parent right */}
                <circle cx="44" cy="20" r="6" fill="url(#famParent)" opacity="0.85" />
                <path d="M34 44c0-5.5 4.5-10 10-10s10 4.5 10 10v6H34v-6z" fill="url(#famParent)" opacity="0.85" />
                {/* Kid 1 (front-left) */}
                <circle cx="26" cy="34" r="4.5" fill="url(#famKid)" />
                <path d="M19 52c0-3.9 3.1-7 7-7s7 3.1 7 7v3H19v-3z" fill="url(#famKid)" />
                {/* Kid 2 (front-right) */}
                <circle cx="38" cy="34" r="4.5" fill="url(#famKid2)" />
                <path d="M31 52c0-3.9 3.1-7 7-7s7 3.1 7 7v3H31v-3z" fill="url(#famKid2)" />
                {/* Heart on top */}
                <path d="M32 10c-1.5-2.5-5.5-2.5-5.5 1 0 2.5 2.75 4.5 5.5 6.5 2.75-2 5.5-4 5.5-6.5 0-3.5-4-3.5-5.5-1z" fill="#fff" opacity="0.95" />
              </svg>
              <Sparkles className="absolute -top-1 -right-1 w-3.5 h-3.5 text-yellow-300" />
            </motion.div>
            <div className="min-w-0">
              <p className="text-white/60 text-[10px] sm:text-[11px] font-black uppercase tracking-[0.24em] leading-none">Family Hub</p>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white leading-tight mt-1.5">
                Profil Anak
              </h1>
              <p className="text-white/70 text-xs sm:text-sm font-semibold mt-1.5 flex items-center gap-1.5">
                <Users className="w-3 h-3" /> {children.length}/{maxCount} anak terdaftar
              </p>
            </div>
          </div>

          {canAdd && (
            <motion.button
              whileHover={{ scale: 1.03, y: -1 }}
              whileTap={{ scale: 0.95 }}
              onClick={onAddClick}
              className="hidden sm:flex items-center gap-2 bg-white text-purple-700 rounded-2xl px-4 py-2.5 font-black text-sm shadow-xl hover:shadow-2xl transition-all flex-shrink-0"
            >
              <Plus className="w-4 h-4" /> Tambah Anak
            </motion.button>
          )}
        </div>

        {/* Leader spotlight — refined with avatar */}
        {leaderName && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="mb-4 flex items-center gap-2.5 px-3 py-2 rounded-2xl"
            style={{
              background: 'linear-gradient(135deg, rgba(251,191,36,0.18), rgba(245,158,11,0.1))',
              border: '1px solid rgba(251,191,36,0.3)',
              backdropFilter: 'blur(12px)',
            }}
          >
            <div className="w-6 h-6 rounded-full bg-yellow-400/20 flex items-center justify-center flex-shrink-0 ring-1 ring-yellow-300/40">
              {leaderChild?.avatarUrl ? (
                <img src={leaderChild.avatarUrl} alt="" className="w-full h-full rounded-full object-cover" />
              ) : (
                <Trophy className="w-3.5 h-3.5 text-yellow-200" />
              )}
            </div>
            <p className="text-yellow-100 text-xs font-black tracking-wide">
              <span className="text-white">{leaderName}</span> sedang memimpin keluarga 🏆
            </p>
          </motion.div>
        )}

        {/* Premium stats grid */}
        {children.length > 0 && (
          <div className="grid grid-cols-4 gap-2 sm:gap-2.5">
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 15, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.15 + i * 0.07, type: 'spring', stiffness: 200 }}
                whileHover={{ y: -2 }}
                className="relative rounded-2xl p-3 overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.03))',
                  backdropFilter: 'blur(16px)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.15)',
                }}
              >
                <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl mb-2 bg-gradient-to-br ${s.gradient} flex items-center justify-center shadow-lg text-base sm:text-lg`}>
                  {s.emoji}
                </div>
                <p className="text-white font-black text-lg sm:text-2xl leading-none">{s.value}</p>
                <p className="text-white/60 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider mt-1 truncate">{s.label}</p>
              </motion.div>
            ))}
          </div>
        )}

        {/* Capacity bar — moved inline into hero (cleaner) */}
        {children.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-4 rounded-2xl px-3.5 py-2.5"
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <div className="flex justify-between text-white/70 text-[10px] font-black uppercase tracking-wider mb-1.5">
              <span>Kapasiti Profil</span>
              <span className="text-white">{children.length}/{maxCount}</span>
            </div>
            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${fillPct}%` }}
                transition={{ delay: 0.6, duration: 0.7, ease: 'easeOut' }}
                className="h-full rounded-full"
                style={{ background: 'linear-gradient(90deg, #a855f7, #ec4899)' }}
              />
            </div>
          </motion.div>
        )}

        {/* Mobile add button */}
        {canAdd && (
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={onAddClick}
            className="sm:hidden mt-3 w-full flex items-center justify-center gap-2 bg-white text-purple-700 rounded-2xl px-4 py-3 font-black text-sm shadow-xl"
          >
            <Plus className="w-4 h-4" /> Tambah Anak Baru
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}