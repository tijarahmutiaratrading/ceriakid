import React from 'react';
import { motion } from 'framer-motion';
import { Users, Plus, Trophy, BarChart2, Star, Target } from 'lucide-react';

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

  const stats = [
    { label: 'Anak', value: children.length, icon: Users, iconColor: 'text-violet-600' },
    { label: 'Games', value: familyStats.totalGames, icon: BarChart2, iconColor: 'text-sky-600' },
    { label: 'Bintang', value: familyStats.totalStars, icon: Star, iconColor: 'text-amber-500' },
    { label: 'Perfect', value: familyStats.totalPerfect, icon: Target, iconColor: 'text-emerald-600' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl ring-1 ring-slate-200 shadow-sm mb-5 overflow-hidden"
    >
      {/* Header bar */}
      <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-violet-600 flex items-center justify-center">
            <Users className="w-4.5 h-4.5 text-white w-5 h-5" />
          </div>
          <div>
            <h1 className="font-black text-slate-900 text-base leading-tight">Profil Anak</h1>
            <p className="text-[11px] text-slate-500 font-semibold">
              {children.length}/{maxCount} profil terdaftar
              {leaderName && (
                <span className="ml-2 text-amber-600">· 🏆 {leaderName} memimpin</span>
              )}
            </p>
          </div>
        </div>

        {canAdd && (
          <button
            onClick={onAddClick}
            className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Tambah Anak
          </button>
        )}
      </div>

      {/* KPI strip */}
      {children.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-slate-100">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="bg-white px-4 py-4"
            >
              <div className="flex items-center gap-2 mb-1.5">
                <s.icon className={`w-3.5 h-3.5 ${s.iconColor}`} />
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">{s.label}</p>
              </div>
              <p className="text-2xl font-black text-slate-900 leading-none tabular-nums">{s.value}</p>
            </motion.div>
          ))}
        </div>
      )}

      {/* Capacity bar */}
      {children.length > 0 && (
        <div className="px-5 py-3 border-t border-slate-100 flex items-center gap-3">
          <p className="text-[11px] font-bold text-slate-500 whitespace-nowrap">Kapasiti {children.length}/{maxCount}</p>
          <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${fillPct}%` }}
              transition={{ delay: 0.3, duration: 0.6, ease: 'easeOut' }}
              className={`h-full rounded-full ${fillPct >= 100 ? 'bg-red-500' : 'bg-violet-500'}`}
            />
          </div>
          {fillPct >= 100 && (
            <p className="text-[11px] font-bold text-red-600 whitespace-nowrap">Penuh</p>
          )}
        </div>
      )}

      {/* Mobile add button */}
      {canAdd && (
        <div className="px-5 py-3 border-t border-slate-100 sm:hidden">
          <button
            onClick={onAddClick}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm transition-colors"
          >
            <Plus className="w-4 h-4" /> Tambah Anak Baru
          </button>
        </div>
      )}
    </motion.div>
  );
}