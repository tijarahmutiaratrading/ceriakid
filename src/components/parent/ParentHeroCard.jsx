import React from 'react';
import { motion } from 'framer-motion';
import { Users, BarChart2, Star, TrendingUp } from 'lucide-react';

export default function ParentHeroCard({ totalChildren, totalGames, totalStars, avgStars }) {
  const stats = [
    { label: 'Anak', value: totalChildren, icon: Users, iconColor: 'text-violet-600' },
    { label: 'Games', value: totalGames, icon: BarChart2, iconColor: 'text-sky-600' },
    { label: 'Bintang', value: totalStars, icon: Star, iconColor: 'text-amber-500' },
    { label: 'Purata ⭐', value: avgStars, icon: TrendingUp, iconColor: 'text-emerald-600' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl ring-1 ring-slate-200 shadow-sm mb-5 overflow-hidden"
    >
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-violet-600 flex items-center justify-center">
            <BarChart2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-black text-slate-900 text-base leading-tight">Prestasi Anak</h1>
            <p className="text-[11px] text-slate-500 font-semibold">Pantau progress pembelajaran anak-anak</p>
          </div>
        </div>
      </div>

      {/* KPI strip */}
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
    </motion.div>
  );
}