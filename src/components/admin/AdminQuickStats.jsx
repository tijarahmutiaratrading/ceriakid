import React from 'react';
import { motion } from 'framer-motion';
import { Clock, CheckCircle2, Users2, TrendingUp } from 'lucide-react';

export default function AdminQuickStats({ pending, succeeded, visitorsToday, totalVisitors }) {
  const stats = [
    { icon: Clock, label: 'Pending', value: pending, sub: 'menunggu', tint: 'bg-amber-50 text-amber-600' },
    { icon: CheckCircle2, label: 'Berjaya', value: succeeded, sub: 'diterima', tint: 'bg-emerald-50 text-emerald-600' },
    { icon: Users2, label: 'Pengunjung', value: visitorsToday, sub: 'hari ini', tint: 'bg-violet-50 text-violet-600' },
    { icon: TrendingUp, label: 'Total Visitor', value: totalVisitors, sub: 'sepanjang masa', tint: 'bg-sky-50 text-sky-600' },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
      {stats.map((s, i) => (
        <motion.div
          key={s.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all"
        >
          <div className="flex items-start gap-3">
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 ${s.tint}`}>
              <s.icon className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-bold text-slate-500">{s.label}</p>
              <p className="text-2xl font-black text-slate-900 leading-tight">{s.value}</p>
              <p className="text-[10px] text-slate-400 font-semibold">{s.sub}</p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}