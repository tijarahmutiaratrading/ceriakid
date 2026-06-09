import React from 'react';
import { motion } from 'framer-motion';
import { Users, Plus, Trophy, BarChart2, Star, Target } from 'lucide-react';

export default function FamilyHeroCard({ children, maxCount, familyStats, leaderName, showForm, onAddClick }) {
  const canAdd = children.length < maxCount && !showForm;
  const fillPct = Math.min(100, (children.length / maxCount) * 100);

  const stats = [
    { label: 'Profil Anak', value: children.length, icon: Users, iconBg: 'bg-purple-600' },
    { label: 'Games Dimain', value: familyStats.totalGames, icon: BarChart2, iconBg: 'bg-purple-500' },
    { label: 'Jumlah Bintang', value: familyStats.totalStars, icon: Star, iconBg: 'bg-fuchsia-500' },
    { label: 'Perfect Score', value: familyStats.totalPerfect, icon: Target, iconBg: 'bg-pink-500' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-3xl shadow-xl border border-white/60 mb-5 overflow-hidden"
    >
      {/* Gradient banner */}
      <div className="px-6 py-5 brand-gradient relative overflow-hidden">
        <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full bg-white/10 pointer-events-none" />
        <div className="absolute -bottom-8 right-16 w-24 h-24 rounded-full bg-white/5 pointer-events-none" />
        <div className="relative flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0 ring-1 ring-white/30">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-black text-white text-lg leading-tight">Profil Anak</h1>
              <p className="text-white/70 text-xs font-semibold mt-0.5">
                {children.length}/{maxCount} slot digunakan
                {leaderName && <span className="ml-2 inline-flex items-center gap-1"><Trophy className="w-3 h-3" /> {leaderName} memimpin</span>}
              </p>
            </div>
          </div>
          {canAdd && (
            <button
              onClick={onAddClick}
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white font-bold text-xs transition-colors ring-1 ring-white/30"
            >
              <Plus className="w-3.5 h-3.5" /> Tambah Anak
            </button>
          )}
        </div>
      </div>

      {/* KPI strip */}
      {children.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-slate-100">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white px-4 py-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-7 h-7 rounded-lg ${s.iconBg} flex items-center justify-center`}>
                  <s.icon className="w-3.5 h-3.5 text-white" />
                </div>
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">{s.label}</p>
              </div>
              <p className="text-2xl font-black text-slate-900 leading-none tabular-nums">{s.value}</p>
            </motion.div>
          ))}
        </div>
      )}

      {/* Capacity bar */}
      {children.length > 0 && (
        <div className="px-5 py-3 border-t border-slate-100 flex items-center gap-3">
          <p className="text-[11px] font-semibold text-slate-400 whitespace-nowrap">Kapasiti</p>
          <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${fillPct}%` }}
              transition={{ delay: 0.3, duration: 0.6, ease: 'easeOut' }}
              className={`h-full rounded-full ${fillPct >= 100 ? 'bg-red-500' : 'bg-purple-500'}`}
            />
          </div>
          <p className="text-[11px] font-semibold text-slate-500 whitespace-nowrap tabular-nums">{children.length}/{maxCount}</p>
          {fillPct >= 100 && <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-md">Penuh</span>}
        </div>
      )}

      {/* Mobile add button */}
      {canAdd && (
        <div className="px-5 py-3 border-t border-slate-100 sm:hidden">
          <button
            onClick={onAddClick}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl brand-gradient text-white font-bold text-sm shadow-lg transition-all"
          >
            <Plus className="w-4 h-4" /> Tambah Anak Baru
          </button>
        </div>
      )}
    </motion.div>
  );
}