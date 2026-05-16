import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
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
      className="relative isolate overflow-hidden rounded-[2rem] border border-white/15 shadow-2xl shadow-black/40 mb-6 transform-gpu [clip-path:inset(0_round_2rem)] min-h-[240px]"
    >
      <img
        src={HERO_BG}
        alt=""
        className="absolute inset-0 w-full h-full object-cover z-0 opacity-30"
        onError={(e) => { e.target.style.display = 'none'; }}
      />
      <div className="absolute inset-0 z-[1] bg-gradient-to-br from-slate-950/85 via-slate-900/75 to-emerald-900/60" />
      <div className="absolute inset-x-0 bottom-0 h-2/3 z-[1] bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

      <div className="relative z-10 p-5 md:p-6">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/30 backdrop-blur-md ring-1 ring-emerald-300/40 flex items-center justify-center text-3xl shadow-lg flex-shrink-0">🛡️</div>
            <div>
              <p className="text-emerald-300 text-[11px] font-black uppercase tracking-[0.2em]">CeriaKid Control Center</p>
              <h1 className="text-2xl md:text-3xl font-black text-white leading-tight drop-shadow-lg">Admin Dashboard</h1>
              <p className="text-white/85 text-xs font-bold mt-0.5 drop-shadow-md">Pelanggan, revenue & konfigurasi sistem</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onRefresh}
              className="rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-md px-3 py-2 text-xs font-black text-white transition-all flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Refresh
            </button>
            <button
              type="button"
              onClick={onClearCache}
              disabled={clearingCache}
              className="rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-md px-3 py-2 text-xs font-black text-white transition-all disabled:opacity-60 flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${clearingCache ? 'animate-spin' : ''}`} /> Cache
            </button>
            <Link to="/admin-game-manager" className="rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white px-3 py-2 text-xs font-black shadow-lg shadow-emerald-950/40 transition-all">
              Game Manager
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.05 }}
              className="rounded-2xl p-2.5 bg-white/10 backdrop-blur-md border border-white/20 text-center"
            >
              <div className={`w-7 h-7 rounded-xl mx-auto mb-1 bg-gradient-to-br ${s.gradient} flex items-center justify-center shadow-md`}>
                <s.icon className="w-3.5 h-3.5 text-white" />
              </div>
              <p className="text-white font-black text-base leading-none truncate">{s.value}</p>
              <p className="text-white/75 text-[10px] font-bold mt-0.5 truncate">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}