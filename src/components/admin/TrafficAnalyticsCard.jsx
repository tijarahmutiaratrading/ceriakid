import React from 'react';
import { motion } from 'framer-motion';
import { Users2, MousePointer, TrendingUp, Facebook } from 'lucide-react';

const SOURCE_META = {
  facebook: { label: 'Facebook / IG', color: 'bg-blue-500', icon: Facebook },
  google: { label: 'Google', color: 'bg-red-500' },
  tiktok: { label: 'TikTok', color: 'bg-slate-900' },
  youtube: { label: 'YouTube', color: 'bg-red-600' },
  whatsapp: { label: 'WhatsApp', color: 'bg-emerald-500' },
  telegram: { label: 'Telegram', color: 'bg-sky-500' },
  direct: { label: 'Direct / Type-in', color: 'bg-slate-500' },
  referral: { label: 'Lain-lain Web', color: 'bg-violet-500' },
  unknown: { label: 'Tidak Diketahui', color: 'bg-slate-400' },
};

function StatCell({ icon: Icon, label, value, sub, iconColor }) {
  return (
    <div className="bg-white p-4 sm:p-5">
      <div className="flex items-center gap-2 mb-1.5">
        <Icon className={`w-3.5 h-3.5 ${iconColor || 'text-slate-400'}`} />
        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">{label}</p>
      </div>
      <p className="text-2xl font-black text-slate-900 leading-none tracking-tight tabular-nums">{value}</p>
      {sub && <p className="text-[11px] font-semibold text-slate-500 mt-1.5 truncate">{sub}</p>}
    </div>
  );
}

export default function TrafficAnalyticsCard({ uniqueVisitors, conversionRate, paidOrders, sourceBreakdown, topPages }) {
  // Normalize source breakdown — sorted by count desc
  const sources = Object.entries(sourceBreakdown || {})
    .map(([key, count]) => ({ key, count, meta: SOURCE_META[key] || { label: key, color: 'bg-slate-400' } }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  const maxSource = Math.max(1, ...sources.map(s => s.count));
  const totalSources = sources.reduce((sum, s) => sum + s.count, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl ring-1 ring-slate-200 shadow-sm overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 md:px-6 py-4 border-b border-slate-100">
        <div>
          <h2 className="text-base font-black text-slate-900">Trafik & Pengunjung</h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">Auto-tracked — unique visitor per session</p>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 ring-1 ring-emerald-100">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-black text-emerald-700 tracking-wider">LIVE</span>
        </div>
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-3 gap-px bg-slate-200">
        <StatCell icon={Users2} label="Unique Visitors" value={uniqueVisitors.toLocaleString()} sub="session unik" iconColor="text-violet-500" />
        <StatCell icon={MousePointer} label="Paid Orders" value={paidOrders.toLocaleString()} sub="dari trafik ni" iconColor="text-emerald-500" />
        <StatCell icon={TrendingUp} label="Conv. Rate" value={`${conversionRate.toFixed(2)}%`} sub="visitor → bayar" iconColor="text-amber-500" />
      </div>

      {/* Source breakdown */}
      <div className="px-5 md:px-6 py-5 border-t border-slate-100">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-black text-slate-700 uppercase tracking-wider">Sumber Trafik</p>
          <p className="text-[10px] font-bold text-slate-400">{totalSources} unique sessions</p>
        </div>
        {sources.length === 0 ? (
          <p className="text-xs text-slate-400 font-medium py-4 text-center">Tiada data trafik untuk tempoh ini.</p>
        ) : (
          <div className="space-y-2.5">
            {sources.map(s => {
              const pct = (s.count / maxSource) * 100;
              const sharePct = totalSources ? ((s.count / totalSources) * 100).toFixed(1) : '0';
              return (
                <div key={s.key} className="flex items-center gap-3">
                  <div className="w-28 sm:w-36 flex-shrink-0">
                    <p className="text-xs font-bold text-slate-700 truncate">{s.meta.label}</p>
                  </div>
                  <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                      className={`h-full ${s.meta.color} rounded-full`}
                    />
                  </div>
                  <div className="w-20 sm:w-24 text-right flex-shrink-0">
                    <p className="text-xs font-black text-slate-900 tabular-nums">{s.count}</p>
                    <p className="text-[10px] font-bold text-slate-400 tabular-nums">{sharePct}%</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Top pages */}
      {topPages && topPages.length > 0 && (
        <div className="px-5 md:px-6 py-5 border-t border-slate-100 bg-slate-50/50">
          <p className="text-xs font-black text-slate-700 uppercase tracking-wider mb-3">Top Pages</p>
          <div className="space-y-1.5">
            {topPages.slice(0, 5).map((p, i) => (
              <div key={p.path} className="flex items-center gap-3">
                <span className="w-5 h-5 rounded-md bg-slate-200 text-slate-600 flex items-center justify-center text-[10px] font-black flex-shrink-0">{i + 1}</span>
                <code className="flex-1 text-xs font-mono text-slate-700 truncate">{p.path || '/'}</code>
                <span className="text-xs font-black text-slate-900 tabular-nums">{p.count.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}