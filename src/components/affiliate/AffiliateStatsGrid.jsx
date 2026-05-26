import React from 'react';
import { motion } from 'framer-motion';
import { Users, DollarSign, TrendingUp, Wallet } from 'lucide-react';

export default function AffiliateStatsGrid({ affiliate }) {
  const stats = [
    {
      icon: Users,
      label: 'Jumlah Rujukan',
      value: affiliate.totalReferrals || 0,
      suffix: 'orang',
      gradient: 'from-blue-500 to-cyan-400',
      bgGradient: 'from-blue-50 to-cyan-50',
      ring: 'ring-blue-100',
    },
    {
      icon: DollarSign,
      label: 'Pendapatan Total',
      value: `RM${(affiliate.totalEarned || 0).toFixed(2)}`,
      suffix: 'lifetime',
      gradient: 'from-emerald-500 to-green-400',
      bgGradient: 'from-emerald-50 to-green-50',
      ring: 'ring-emerald-100',
    },
    {
      icon: Wallet,
      label: 'Pending Payout',
      value: `RM${(affiliate.pendingBalance || 0).toFixed(2)}`,
      suffix: 'sedia withdraw',
      gradient: 'from-amber-500 to-orange-400',
      bgGradient: 'from-amber-50 to-orange-50',
      ring: 'ring-amber-100',
    },
    {
      icon: TrendingUp,
      label: 'Telah Dibayar',
      value: `RM${(affiliate.totalPaidOut || 0).toFixed(2)}`,
      suffix: 'sudah masuk bank',
      gradient: 'from-violet-500 to-purple-400',
      bgGradient: 'from-violet-50 to-purple-50',
      ring: 'ring-violet-100',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
      {stats.map((s, i) => (
        <motion.div
          key={s.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          whileHover={{ y: -4 }}
          className={`relative overflow-hidden rounded-2xl p-4 sm:p-5 bg-gradient-to-br ${s.bgGradient} border border-white shadow-lg shadow-slate-200/60 ring-1 ${s.ring}`}
        >
          {/* Decorative blob */}
          <div className={`absolute -top-8 -right-8 w-24 h-24 rounded-full bg-gradient-to-br ${s.gradient} opacity-10 blur-2xl`} />

          <div className="relative">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-3 bg-gradient-to-br ${s.gradient} shadow-md`}>
              <s.icon className="w-5 h-5 text-white" />
            </div>
            <p className="text-[10px] sm:text-xs font-black text-slate-500 uppercase tracking-wider">{s.label}</p>
            <p className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 mt-0.5 leading-tight">{s.value}</p>
            <p className="text-[10px] text-slate-400 font-bold mt-0.5">{s.suffix}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}