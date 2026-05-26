import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import { calculateTier, getTierByKey } from '@/lib/affiliateTiers';

const STATUS_COLOR = {
  active: 'bg-emerald-100 text-emerald-700',
  suspended: 'bg-red-100 text-red-700',
  pending: 'bg-amber-100 text-amber-700',
};

export default function AdminAffiliateList({ affiliates, onRefresh }) {
  const [editing, setEditing] = useState(null);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({});
  const { toast } = useToast();

  const startEdit = (a) => {
    setEditing(a.id);
    setForm({
      status: a.status,
      commissionRateSubscription: a.commissionRateSubscription,
      commissionRateCredit: a.commissionRateCredit,
    });
  };

  const save = async (id) => {
    setBusy(true);
    try {
      const res = await base44.functions.invoke('adminUpdateAffiliate', { affiliateId: id, ...form });
      if (res.data.error) {
        toast({ title: 'Gagal', description: res.data.error, variant: 'destructive' });
      } else {
        toast({ title: '✅ Disimpan', description: 'Affiliate dikemaskini.' });
        setEditing(null);
        onRefresh?.();
      }
    } catch (e) {
      toast({ title: 'Ralat', description: e.message, variant: 'destructive' });
    } finally {
      setBusy(false);
    }
  };

  if (affiliates.length === 0) {
    return <p className="text-center py-12 text-slate-500">Belum ada affiliate berdaftar.</p>;
  }

  return (
    <div className="overflow-x-auto rounded-2xl bg-white border border-slate-200 shadow-sm">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 border-b border-slate-200">
          <tr className="text-left">
            <th className="px-3 py-3 font-black text-slate-700">Nama / Email</th>
            <th className="px-3 py-3 font-black text-slate-700">Kod</th>
            <th className="px-3 py-3 font-black text-slate-700">Tier</th>
            <th className="px-3 py-3 font-black text-slate-700">Rate %</th>
            <th className="px-3 py-3 font-black text-slate-700">Rujukan</th>
            <th className="px-3 py-3 font-black text-slate-700">Pendapatan</th>
            <th className="px-3 py-3 font-black text-slate-700">Status</th>
            <th className="px-3 py-3 font-black text-slate-700">Tindakan</th>
          </tr>
        </thead>
        <tbody>
          {affiliates.map(a => (
            <tr key={a.id} className="border-b border-slate-100 hover:bg-slate-50">
              <td className="px-3 py-3">
                <p className="font-bold text-slate-900">{a.fullName || '—'}</p>
                <p className="text-xs text-slate-500">{a.userEmail}</p>
                {a.joinedAt && <p className="text-[10px] text-slate-400">Sertai: {format(new Date(a.joinedAt), 'd MMM yy')}</p>}
              </td>
              <td className="px-3 py-3"><code className="bg-purple-50 text-purple-700 px-2 py-1 rounded font-bold text-xs">{a.referralCode}</code></td>
              <td className="px-3 py-3">
                {(() => {
                  const tier = a.tier ? getTierByKey(a.tier) : calculateTier(a.totalReferrals || 0);
                  return (
                    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full ${tier.bgLight} ${tier.textColor} text-xs font-black`}>
                      <span>{tier.emoji}</span>
                      <span>{tier.name}</span>
                    </div>
                  );
                })()}
              </td>
              <td className="px-3 py-3">
                {editing === a.id ? (
                  <div className="space-y-1">
                    <Input type="number" className="w-20 h-8 text-xs" value={form.commissionRateSubscription} onChange={(e) => setForm({ ...form, commissionRateSubscription: e.target.value })} />
                    <Input type="number" className="w-20 h-8 text-xs" value={form.commissionRateCredit} onChange={(e) => setForm({ ...form, commissionRateCredit: e.target.value })} />
                  </div>
                ) : (
                  <div className="text-xs">
                    <p>Sub: <strong>{a.commissionRateSubscription}%</strong></p>
                    <p>Kredit: <strong>{a.commissionRateCredit}%</strong></p>
                  </div>
                )}
              </td>
              <td className="px-3 py-3 font-bold text-slate-900">{a.totalReferrals || 0}</td>
              <td className="px-3 py-3">
                <p className="font-black text-emerald-600">RM{(a.totalEarned || 0).toFixed(2)}</p>
                <p className="text-[10px] text-slate-500">Pending: RM{(a.pendingBalance || 0).toFixed(2)}</p>
              </td>
              <td className="px-3 py-3">
                {editing === a.id ? (
                  <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="text-xs border rounded px-2 py-1">
                    <option value="active">active</option>
                    <option value="suspended">suspended</option>
                    <option value="pending">pending</option>
                  </select>
                ) : (
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${STATUS_COLOR[a.status] || 'bg-slate-100 text-slate-700'}`}>{a.status}</span>
                )}
              </td>
              <td className="px-3 py-3">
                {editing === a.id ? (
                  <div className="flex gap-1">
                    <Button size="sm" onClick={() => save(a.id)} disabled={busy} className="bg-emerald-600 text-white h-7 text-xs">
                      {busy ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Simpan'}
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setEditing(null)} className="h-7 text-xs">Batal</Button>
                  </div>
                ) : (
                  <Button size="sm" variant="outline" onClick={() => startEdit(a)} className="h-7 text-xs">Edit</Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}