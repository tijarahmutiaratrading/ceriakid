import React from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, Users, DollarSign, Crown, Shield } from 'lucide-react';

const HERO_BG = 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/dc153cf03_generated_image.png';

export default function AdminHeroCard({ totalUsers, totalRevenue, paidCustomers, onRefresh, onClearCache, clearingCache }) {
  const stats = [
    { icon: Users, label: 'Pembeli', value: totalUsers, gradient: 'from-emerald-300 to-teal-400' },
    { icon: DollarSign, label: 'Revenue', value: `RM${totalRevenue}`, gradient: 'from-yellow-300 to-orange-400' },
    { icon: Crown, label: 'Premium', value: paidCustomers, gradient: 'from-blue-300 to-indigo-400' },
    { icon: Shield, label: 'Status', value: '🟢', gradient: 'from-pink-300 to-rose-400' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative isolate overflow-hidden rounded-[1.75rem] md:rounded-[2rem] border border-white/15 shadow-2xl shadow-black/40 mb-6 transform-gpu min-h-[200px] md:min-h-[240px]"
    >
      <img
        src={HERO_BG}
        alt=""
        className="absolute inset-0 w-full h-full object-cover z-0 opacity-30"
        onError={(e) => { e.target.style.display = 'none'; }}
      />
      <div className="absolute inset-0 z-[1] bg-gradient-to-br from-slate-950/90 via-slate-900/80 to-emerald-900/65" />
      <div className="absolute inset-x-0 bottom-0 h-2/3 z-[1] bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

      <div className="relative z-10 p-4 sm:p-5 md:p-6">
        {/* Top: title + actions */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4 mb-4 sm:mb-5">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-emerald-500/30 backdrop-blur-md ring-1 ring-emerald-300/40 flex items-center justify-center text-2xl sm:text-3xl shadow-lg flex-shrink-0">🛡️</div>
            <div className="min-w-0">
              <p className="text-emerald-300 text-[9px] sm:text-[11px] font-black uppercase tracking-[0.18em] sm:tracking-[0.2em] truncate">Control Center</p>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-white leading-tight drop-shadow-lg">Admin Dashboard</h1>
              <p className="text-white/80 text-[11px] sm:text-xs font-bold mt-0.5 drop-shadow-md line-clamp-1">Pelanggan, revenue & sistem</p>
            </div>
          </div>

          {/* Actions — compact icons on mobile */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              type="button"
              onClick={onRefresh}
              aria-label="Refresh"
              className="rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-md px-3 py-2 text-xs font-black text-white transition-all flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <button
              type="button"
              onClick={onClearCache}
              disabled={clearingCache}
              aria-label="Clear cache"
              className="rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-md px-3 py-2 text-xs font-black text-white transition-all disabled:opacity-60 flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${clearingCache ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Cache</span>
            </button>
          </div>
        </div>

        {/* Stats: 2x2 on mobile, 4-col from sm up */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.05 }}
              className="rounded-2xl p-3 sm:p-2.5 bg-white/10 backdrop-blur-md border border-white/20 flex sm:block items-center gap-2.5 sm:gap-0 sm:text-center"
            >
              <div className={`w-9 h-9 sm:w-7 sm:h-7 rounded-xl sm:mx-auto sm:mb-1 bg-gradient-to-br ${s.gradient} flex items-center justify-center shadow-md flex-shrink-0`}>
                <s.icon className="w-4 h-4 sm:w-3.5 sm:h-3.5 text-white" />
              </div>
              <div className="min-w-0 sm:contents">
                <p className="text-white font-black text-base sm:text-base leading-none truncate text-left sm:text-center">{s.value}</p>
                <p className="text-white/75 text-[10px] font-bold mt-0.5 truncate text-left sm:text-center">{s.label}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}