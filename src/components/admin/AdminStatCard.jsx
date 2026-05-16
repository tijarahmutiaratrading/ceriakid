import React from 'react';
import { motion } from 'framer-motion';

const COLOR_MAP = {
  violet: 'bg-violet-500',
  amber: 'bg-amber-500',
  sky: 'bg-sky-500',
  rose: 'bg-rose-500',
  emerald: 'bg-emerald-500',
  fuchsia: 'bg-fuchsia-500',
};

export default function AdminStatCard({ icon: Icon, label, value, sub, color = 'violet', delay = 0 }) {
  const bg = COLOR_MAP[color] || COLOR_MAP.violet;

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileHover={{ y: -3 }}
      className={`relative ${bg} rounded-2xl p-5 text-white shadow-lg overflow-hidden min-h-[155px] flex flex-col justify-between`}
    >
      <div className="w-11 h-11 rounded-2xl bg-white/25 backdrop-blur-md flex items-center justify-center shadow-inner">
        {Icon && <Icon className="w-5 h-5 text-white" />}
      </div>
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.15em] text-white/80 mb-1">{label}</p>
        <p className="text-2xl md:text-3xl font-black tracking-tight leading-tight">{value}</p>
        {sub && <p className="text-[11px] font-semibold text-white/85 mt-1">{sub}</p>}
      </div>
    </motion.div>
  );
}