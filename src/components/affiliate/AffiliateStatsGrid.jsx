import React from 'react';
import { Users, DollarSign, TrendingUp, Wallet } from 'lucide-react';

export default function AffiliateStatsGrid({ affiliate }) {
  const stats = [
    { icon: Users, label: 'Jumlah Rujukan', value: affiliate.totalReferrals || 0, color: 'bg-blue-50 text-blue-600' },
    { icon: DollarSign, label: 'Pendapatan Keseluruhan', value: `RM${(affiliate.totalEarned || 0).toFixed(2)}`, color: 'bg-emerald-50 text-emerald-600' },
    { icon: Wallet, label: 'Menunggu Payout', value: `RM${(affiliate.pendingBalance || 0).toFixed(2)}`, color: 'bg-amber-50 text-amber-600' },
    { icon: TrendingUp, label: 'Telah Dibayar', value: `RM${(affiliate.totalPaidOut || 0).toFixed(2)}`, color: 'bg-purple-50 text-purple-600' },
  ];
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
      {stats.map(s => (
        <div key={s.label} className="rounded-2xl p-4 bg-white border border-slate-200 shadow-sm">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-2 ${s.color}`}>
            <s.icon className="w-5 h-5" />
          </div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">{s.label}</p>
          <p className="text-xl sm:text-2xl font-black text-slate-900">{s.value}</p>
        </div>
      ))}
    </div>
  );
}