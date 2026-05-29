import React from 'react';
import { motion } from 'framer-motion';
import { Users, Plus, Trophy, Sparkles } from 'lucide-react';

/**
 * Playful CeriaKid family hero — pastel candy gradient, floating bunny mascot,
 * rounded soft pills to match ParentDashboard aesthetic.
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

  const leaderChild = leaderName ? children.find((c) => c.name === leaderName) : null;

  const stats = [
    { label: 'Anak', value: children.length, emoji: '👶', color: '#f9a8d4' },
    { label: 'Games', value: familyStats.totalGames, emoji: '🎮', color: '#93c5fd' },
    { label: 'Bintang', value: familyStats.totalStars, emoji: '⭐', color: '#fcd34d' },
    { label: 'Perfect', value: familyStats.totalPerfect, emoji: '🏆', color: '#86efac' },
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
        {/* Pixar 3D family mascot */}
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl overflow-hidden flex-shrink-0 relative"
          style={{
            background: 'rgba(255,255,255,0.7)',
            boxShadow: '0 6px 0 rgba(244, 114, 182, 0.3), 0 8px 20px rgba(0,0,0,0.05)',
          }}
        >
          <img
            src="https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/fd0f2ba5f_generated_image.png"
            alt="Keluarga"
            className="w-full h-full object-cover"
          />
          <Sparkles className="absolute -top-1 -right-1 w-4 h-4 text-yellow-500 drop-shadow" />
        </motion.div>

        <div className="flex-1 min-w-0 pt-1">
          <div
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full mb-2"
            style={{ background: 'rgba(255,255,255,0.7)' }}
          >
            <Users className="w-3 h-3 text-pink-500" strokeWidth={3} />
            <span className="text-[10px] font-black uppercase tracking-wider text-pink-700">Family Hub</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-800 leading-tight">
            Profil Anak 💕
          </h1>
          <p className="text-slate-600 text-sm font-bold mt-1">
            {children.length}/{maxCount} anak terdaftar
          </p>
        </div>

        {canAdd && (
          <motion.button
            whileTap={{ scale: 0.95, y: 2 }}
            onClick={onAddClick}
            className="hidden sm:flex items-center gap-2 text-white rounded-full px-4 py-2.5 font-black text-sm flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #f472b6 0%, #ec4899 100%)', boxShadow: '0 4px 0 #db2777, 0 6px 14px rgba(236, 72, 153, 0.3)' }}
          >
            <Plus className="w-4 h-4" strokeWidth={3} /> Tambah Anak
          </motion.button>
        )}
      </div>

      {/* Leader spotlight */}
      {leaderName && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="relative mb-4 flex items-center gap-2.5 px-3 py-2 rounded-full"
          style={{
            background: 'rgba(255,255,255,0.85)',
            boxShadow: '0 3px 0 #fcd34d',
          }}
        >
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #fde047 0%, #facc15 100%)' }}
          >
            {leaderChild?.avatarUrl ? (
              <img src={leaderChild.avatarUrl} alt="" className="w-full h-full rounded-full object-cover" />
            ) : (
              <Trophy className="w-3.5 h-3.5 text-yellow-900" strokeWidth={3} />
            )}
          </div>
          <p className="text-slate-700 text-xs font-black">
            <span className="text-pink-700">{leaderName}</span> sedang memimpin keluarga 🏆
          </p>
        </motion.div>
      )}

      {/* Stats — soft pastel pills */}
      {children.length > 0 && (
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
      )}

      {/* Capacity bar */}
      {children.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="relative mt-4 rounded-2xl px-3.5 py-2.5"
          style={{ background: 'rgba(255,255,255,0.7)' }}
        >
          <div className="flex justify-between text-slate-600 text-[10px] font-black uppercase tracking-wider mb-1.5">
            <span>Kapasiti Profil</span>
            <span className="text-pink-700">{children.length}/{maxCount}</span>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: '#fef3c7' }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${fillPct}%` }}
              transition={{ delay: 0.6, duration: 0.7, ease: 'easeOut' }}
              className="h-full rounded-full"
              style={{ background: 'linear-gradient(90deg, #f472b6, #ec4899)' }}
            />
          </div>
        </motion.div>
      )}

      {/* Mobile add button */}
      {canAdd && (
        <motion.button
          whileTap={{ scale: 0.95, y: 2 }}
          onClick={onAddClick}
          className="relative sm:hidden mt-3 w-full flex items-center justify-center gap-2 text-white rounded-full px-4 py-3 font-black text-sm"
          style={{ background: 'linear-gradient(135deg, #f472b6 0%, #ec4899 100%)', boxShadow: '0 4px 0 #db2777, 0 6px 14px rgba(236, 72, 153, 0.3)' }}
        >
          <Plus className="w-4 h-4" strokeWidth={3} /> Tambah Anak Baru
        </motion.button>
      )}
    </motion.div>
  );
}