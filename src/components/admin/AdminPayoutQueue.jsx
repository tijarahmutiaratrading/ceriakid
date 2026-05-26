import React, { useState } from 'react';
import { Loader2, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';

const STATUS_STYLE = {
  requested: { color: 'text-amber-600 bg-amber-50 border-amber-200', label: 'Menunggu' },
  processing: { color: 'text-blue-600 bg-blue-50 border-blue-200', label: 'Diproses' },
  completed: { color: 'text-emerald-600 bg-emerald-50 border-emerald-200', label: 'Selesai' },
  rejected: { color: 'text-red-600 bg-red-50 border-red-200', label: 'Ditolak' },
};

export default function AdminPayoutQueue({ payouts, onRefresh }) {
  const [busy, setBusy] = useState(null);
  const [refMap, setRefMap] = useState({});
  const [noteMap, setNoteMap] = useState({});
  const { toast } = useToast();

  const action = async (payoutId, act) => {
    setBusy(payoutId);
    try {
      const res = await base44.functions.invoke('adminProcessPayout', {
        payoutId,
        action: act,
        transactionRef: refMap[payoutId] || '',
        adminNote: noteMap[payoutId] || '',
      });
      if (res.data.error) {
        toast({ title: 'Gagal', description: res.data.error, variant: 'destructive' });
      } else {
        toast({ title: '✅ Berjaya', description: `Payout dikemaskini.` });
        onRefresh?.();
      }
    } catch (e) {
      toast({ title: 'Ralat', description: e.message, variant: 'destructive' });
    } finally {
      setBusy(null);
    }
  };

  // Sort: requested first
  const sorted = [...payouts].sort((a, b) => {
    if (a.status === 'requested' && b.status !== 'requested') return -1;
    if (b.status === 'requested' && a.status !== 'requested') return 1;
    return 0;
  });

  if (sorted.length === 0) {
    return <p className="text-center py-12 text-slate-500">Belum ada payout direkodkan.</p>;
  }

  return (
    <div className="space-y-3">
      {sorted.map(p => {
        const s = STATUS_STYLE[p.status] || STATUS_STYLE.requested;
        const isPending = p.status === 'requested' || p.status === 'processing';
        return (
          <div key={p.id} className={`rounded-2xl p-4 bg-white border-2 ${s.color.split(' ')[2]}`}>
            <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${s.color}`}>{s.label}</span>
                  <span className="text-xs text-slate-500">{p.requestedAt ? format(new Date(p.requestedAt), 'd MMM yy, HH:mm') : '—'}</span>
                </div>
                <p className="font-black text-slate-900 text-lg">{p.affiliateEmail}</p>
                <p className="text-2xl font-black text-emerald-600 mt-1">RM{(p.amountMYR || 0).toFixed(2)}</p>
                <p className="text-xs text-slate-500 mt-0.5">{p.referralCount || 0} rujukan diluluskan</p>
              </div>
              <div className="text-sm text-slate-700 bg-slate-50 rounded-xl p-3 min-w-[200px]">
                <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Bank Info</p>
                <p className="font-bold">{p.bankName || '—'}</p>
                <p className="font-mono text-xs">{p.bankAccountNumber || '—'}</p>
                <p className="text-xs">{p.bankAccountHolder || '—'}</p>
              </div>
            </div>

            {isPending && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-3 border-t border-slate-100">
                <Input
                  placeholder="Rujukan transaksi bank"
                  value={refMap[p.id] || ''}
                  onChange={(e) => setRefMap(prev => ({ ...prev, [p.id]: e.target.value }))}
                />
                <Input
                  placeholder="Nota (opsional)"
                  value={noteMap[p.id] || ''}
                  onChange={(e) => setNoteMap(prev => ({ ...prev, [p.id]: e.target.value }))}
                />
                <div className="sm:col-span-2 flex gap-2 flex-wrap">
                  {p.status === 'requested' && (
                    <Button onClick={() => action(p.id, 'processing')} disabled={busy === p.id} className="bg-blue-600 hover:bg-blue-700 text-white">
                      <Clock className="w-4 h-4 mr-1" /> Mula Proses
                    </Button>
                  )}
                  <Button onClick={() => action(p.id, 'complete')} disabled={busy === p.id} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                    {busy === p.id ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <CheckCircle2 className="w-4 h-4 mr-1" />}
                    Tandakan Siap
                  </Button>
                  <Button onClick={() => action(p.id, 'reject')} disabled={busy === p.id} variant="outline" className="border-red-300 text-red-600 hover:bg-red-50">
                    <XCircle className="w-4 h-4 mr-1" /> Tolak
                  </Button>
                </div>
              </div>
            )}
            {!isPending && (p.transactionRef || p.adminNote) && (
              <div className="pt-2 border-t border-slate-100 text-xs text-slate-600">
                {p.transactionRef && <p>Ref: <strong>{p.transactionRef}</strong></p>}
                {p.adminNote && <p className="italic">"{p.adminNote}"</p>}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}