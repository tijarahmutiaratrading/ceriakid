import React from 'react';
import { Users, CheckCircle2, Clock, XCircle, Banknote } from 'lucide-react';
import { format } from 'date-fns';

const STATUS_STYLE = {
  pending: { icon: Clock, color: 'text-amber-600 bg-amber-50', label: 'Menunggu' },
  approved: { icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-50', label: 'Diluluskan' },
  paid: { icon: Banknote, color: 'text-blue-600 bg-blue-50', label: 'Dibayar' },
  rejected: { icon: XCircle, color: 'text-red-600 bg-red-50', label: 'Ditolak' },
};

export default function AffiliateReferralList({ referrals }) {
  return (
    <div className="rounded-2xl p-5 bg-white border border-slate-200 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <Users className="w-5 h-5 text-slate-700" />
        <h3 className="font-black text-slate-900">Sejarah Rujukan ({referrals.length})</h3>
      </div>
      {referrals.length === 0 ? (
        <p className="text-sm text-slate-500 text-center py-8">Belum ada rujukan. Mula share link anda! 🚀</p>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {referrals.map(r => {
            const s = STATUS_STYLE[r.status] || STATUS_STYLE.pending;
            return (
              <div key={r.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-slate-900 truncate">{r.referredEmail}</p>
                  <p className="text-xs text-slate-500">
                    {r.purchaseType === 'subscription' ? '📅 Langganan' : '⚡ Kredit'} • {r.purchaseDetail} • {r.created_date ? format(new Date(r.created_date), 'd MMM yy') : '—'}
                  </p>
                </div>
                <div className="text-right ml-3 flex-shrink-0">
                  <p className="text-sm font-black text-emerald-600">+RM{(r.commissionMYR || 0).toFixed(2)}</p>
                  <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${s.color}`}>
                    <s.icon className="w-3 h-3" /> {s.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}