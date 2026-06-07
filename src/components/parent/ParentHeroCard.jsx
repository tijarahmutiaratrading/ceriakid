import React from 'react';
import { motion } from 'framer-motion';
import { Users, Gamepad2, Star, TrendingUp, BarChart2 } from 'lucide-react';

export default function ParentHeroCard({ totalChildren, totalGames, totalStars, avgStars }) {
  const stats = [
    { label: 'Anak Didaftarkan', value: totalChildren, icon: Users, iconBg: 'bg-violet-600', change: null },
    { label: 'Jumlah Games', value: totalGames, icon: Gamepad2, iconBg: 'bg-sky-600', change: null },
    { label: 'Jumlah Bintang', value: totalStars, icon: Star, iconBg: 'bg-amber-500', change: null },
    { label: 'Purata Bintang', value: avgStars + ' ⭐', icon: TrendingUp, iconBg: 'bg-emerald-600', change: null },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-5 rounded-2xl overflow-hidden bg-white ring-1 ring-slate-200 shadow-sm"
    >
      {/* Gradient banner */}
      <div className="px-6 py-5 bg-gradient-to-r from-violet-600 to-indigo-600 relative overflow-hidden">
        <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full bg-white/10 pointer-events-none" />
        <div className="absolute -bottom-8 right-16 w-24 h-24 rounded-full bg-white/5 pointer-events-none" />
        <div className="relative flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0 ring-1 ring-white/30">
            <BarChart2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-black text-white text-lg leading-tight">Prestasi Anak</h1>
            <p className="text-white/70 text-xs font-semibold mt-0.5">Pantau progress pembelajaran anak-anak</p>
          </div>
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-slate-100">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
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
    </motion.div>
  );
}