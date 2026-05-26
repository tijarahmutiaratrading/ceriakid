import React from 'react';
import { Wallet, CheckCircle2, Clock, XCircle, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

const STATUS_STYLE = {
  requested: { icon: Clock, color: 'text-amber-600 bg-amber-50', label: 'Menunggu' },
  processing: { icon: Loader2, color: 'text-blue-600 bg-blue-50', label: 'Diproses' },
  completed: { icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-50', label: 'Selesai' },
  rejected: { icon: XCircle, color: 'text-red-600 bg-red-50', label: 'Ditolak' },
};

export default function AffiliatePayoutList({ payouts }) {
  return (
    <div className="rounded-2xl p-5 bg-white border border-slate-200 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <Wallet className="w-5 h-5 text-slate-700" />
        <h3 className="font-black text-slate-900">Sejarah Payout ({payouts.length})</h3>
      </div>
      {payouts.length === 0 ? (
        <p className="text-sm text-slate-500 text-center py-8">Belum ada payout direkodkan.</p>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {payouts.map(p => {
            const s = STATUS_STYLE[p.status] || STATUS_STYLE.requested;
            return (
              <div key={p.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center justify-between mb-1">
                  <p className="font-black text-slate-900">RM{(p.amountMYR || 0).toFixed(2)}</p>
                  <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${s.color}`}>
                    <s.icon className="w-3 h-3" /> {s.label}
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Diminta: {p.requestedAt ? format(new Date(p.requestedAt), 'd MMM yy, HH:mm') : '—'}
                </p>
                {p.processedAt && <p className="text-xs text-slate-500">Diproses: {format(new Date(p.processedAt), 'd MMM yy')}</p>}
                {p.transactionRef && <p className="text-xs text-slate-600 mt-1">Ref: <strong>{p.transactionRef}</strong></p>}
                {p.adminNote && <p className="text-xs text-slate-600 mt-1 italic">"{p.adminNote}"</p>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}