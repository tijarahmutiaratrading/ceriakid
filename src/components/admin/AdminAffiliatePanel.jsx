import React, { useEffect, useState } from 'react';
import { Loader2, Users, Wallet, DollarSign, Clock, CheckCircle2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import AdminAffiliateList from '@/components/admin/AdminAffiliateList';
import AdminPayoutQueue from '@/components/admin/AdminPayoutQueue';

export default function AdminAffiliatePanel() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [tab, setTab] = useState('payouts');
  const { toast } = useToast();

  const load = async () => {
    setLoading(true);
    try {
      const res = await base44.functions.invoke('adminListAffiliates', {});
      setData(res.data);
    } catch (e) {
      toast({ title: 'Ralat', description: e.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (!data) return null;

  const { affiliates, payouts, stats } = data;

  const statCards = [
    { icon: Users, label: 'Jumlah Affiliate', value: stats.totalAffiliates, sub: `${stats.totalActiveAffiliates} aktif`, color: 'bg-blue-50 text-blue-600' },
    { icon: Clock, label: 'Payout Menunggu', value: stats.pendingPayouts, sub: 'perlu diproses', color: 'bg-amber-50 text-amber-600' },
    { icon: Wallet, label: 'Komisen Tertunggak', value: `RM${stats.totalCommissionPending.toFixed(2)}`, sub: 'belum dibayar', color: 'bg-purple-50 text-purple-600' },
    { icon: CheckCircle2, label: 'Telah Dibayar', value: `RM${stats.totalCommissionPaid.toFixed(2)}`, sub: 'sepanjang masa', color: 'bg-emerald-50 text-emerald-600' },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-black text-slate-900 mb-1">🤝 Program Affiliate</h2>
        <p className="text-sm text-slate-600">Urus affiliate, komisen dan payout.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {statCards.map(s => (
          <div key={s.label} className="rounded-2xl p-4 bg-white border border-slate-200 shadow-sm">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-2 ${s.color}`}>
              <s.icon className="w-5 h-5" />
            </div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">{s.label}</p>
            <p className="text-xl font-black text-slate-900 leading-tight">{s.value}</p>
            <p className="text-[10px] text-slate-500 font-semibold">{s.sub}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-2 border-b border-slate-200">
        {[
          { id: 'payouts', label: `🏦 Payout Queue (${payouts.filter(p => p.status === 'requested').length})` },
          { id: 'affiliates', label: `👥 Semua Affiliate (${affiliates.length})` },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 font-bold text-sm transition-colors ${tab === t.id ? 'text-purple-600 border-b-2 border-purple-600' : 'text-slate-500 hover:text-slate-700'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'payouts' && <AdminPayoutQueue payouts={payouts} onRefresh={load} />}
      {tab === 'affiliates' && <AdminAffiliateList affiliates={affiliates} onRefresh={load} />}
    </div>
  );
}