import React from 'react';
import { motion } from 'framer-motion';
import { Users, Plus, Trophy, Gamepad2, Star, Award, UserCircle } from 'lucide-react';

/**
 * Clean Linear/Stripe-style family hero card.
 * Mengandungi mascot, KPI strip, leader badge & capacity meter.
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
    { label: 'Anak', value: children.length, icon: UserCircle },
    { label: 'Games', value: familyStats.totalGames, icon: Gamepad2 },
    { label: 'Bintang', value: familyStats.totalStars, icon: Star },
    { label: 'Perfect', value: familyStats.totalPerfect, icon: Award },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative rounded-2xl p-5 sm:p-6 mb-5 bg-white ring-1 ring-slate-200 shadow-sm"
    >
      <div className="relative flex items-start gap-4 mb-5">
        <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-slate-100 ring-1 ring-slate-200">
          <img
            src="https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/fd0f2ba5f_generated_image.png"
            alt=""
            loading="lazy"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex-1 min-w-0 pt-0.5">
          <div className="inline-flex items-center gap-1.5 mb-1">
            <Users className="w-3 h-3 text-slate-500" strokeWidth={2.5} />
            <span className="text-[10px] font-bold uppercase tracking-label text-slate-500">Family Hub</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
            Profil Anak
          </h1>
          <p className="text-slate-500 text-xs font-semibold mt-0.5">
            {children.length}/{maxCount} anak terdaftar
          </p>
        </div>

        {canAdd && (
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={onAddClick}
            className="hidden sm:flex items-center gap-1.5 text-white rounded-xl px-3.5 py-2 font-black text-sm flex-shrink-0 bg-slate-900 hover:bg-slate-800 transition-colors"
          >
            <Plus className="w-4 h-4" strokeWidth={2.5} /> Tambah Anak
          </motion.button>
        )}
      </div>

      {/* Leader spotlight */}
      {leaderName && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-4 flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-50 ring-1 ring-amber-200"
        >
          <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden bg-amber-500">
            {leaderChild?.avatarUrl ? (
              <img src={leaderChild.avatarUrl} alt="" loading="lazy" className="w-full h-full rounded-full object-cover" />
            ) : (
              <Trophy className="w-3 h-3 text-white" strokeWidth={2.5} />
            )}
          </div>
          <p className="text-amber-900 text-xs font-bold">
            <span className="font-black">{leaderName}</span> sedang memimpin keluarga
          </p>
        </motion.div>
      )}

      {/* Stats — KPI strip Linear-style */}
      {children.length > 0 && (
        <div className="grid grid-cols-4 gap-px bg-slate-200 rounded-xl overflow-hidden ring-1 ring-slate-200">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 + i * 0.04 }}
              className="bg-white p-3 text-center"
            >
              <s.icon className="w-3.5 h-3.5 mx-auto mb-1 text-slate-400" strokeWidth={2.5} />
              <p className="font-black text-lg text-slate-900 leading-none tabular-nums">{s.value}</p>
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-label-tight mt-1">
                {s.label}
              </p>
            </motion.div>
          ))}
        </div>
      )}

      {/* Capacity bar */}
      {children.length > 0 && (
        <div className="mt-4 px-1">
          <div className="flex justify-between text-slate-500 text-[10px] font-bold uppercase tracking-label mb-1.5">
            <span>Kapasiti Profil</span>
            <span className="text-slate-700">{children.length}/{maxCount}</span>
          </div>
          <div
            className="h-1.5 rounded-full overflow-hidden bg-slate-100"
            role="progressbar"
            aria-valuenow={children.length}
            aria-valuemin={0}
            aria-valuemax={maxCount}
          >
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${fillPct}%` }}
              transition={{ delay: 0.3, duration: 0.6, ease: 'easeOut' }}
              className={`h-full rounded-full ${
                fillPct >= 100 ? 'bg-red-500' : fillPct >= 75 ? 'bg-amber-500' : 'bg-slate-900'
              }`}
            />
          </div>
          {fillPct >= 100 && (
            <p className="text-red-600 text-[10px] font-bold mt-1.5">
              Kapasiti penuh — naik taraf untuk lagi anak
            </p>
          )}
        </div>
      )}

      {/* Mobile add button */}
      {canAdd && (
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={onAddClick}
          className="sm:hidden mt-4 w-full flex items-center justify-center gap-1.5 text-white rounded-xl px-4 py-2.5 font-black text-sm bg-slate-900 hover:bg-slate-800 transition-colors"
        >
          <Plus className="w-4 h-4" strokeWidth={2.5} /> Tambah Anak Baru
        </motion.button>
      )}
    </motion.div>
  );
}