import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Database, RefreshCw, CheckCircle2, AlertTriangle, Clock, Play } from 'lucide-react';

export default function SupabaseSyncCard() {
  const [latest, setLatest] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  const load = async () => {
    try {
      const res = await base44.functions.invoke('getSupabaseSyncStatus', {});
      if (res?.data?.success) {
        setLatest(res.data.latest);
        setHistory(res.data.history || []);
      }
    } catch (e) {
      console.error('Failed to load Supabase sync status:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const runSyncNow = async () => {
    setSyncing(true);
    try {
      await base44.functions.invoke('syncToSupabase', {});
      await load();
    } catch (e) {
      console.error('Manual sync failed:', e);
    } finally {
      setSyncing(false);
    }
  };

  const statusCfg = {
    success: { badge: 'bg-emerald-500 text-white', icon: CheckCircle2, color: 'text-emerald-600' },
    partial: { badge: 'bg-amber-400 text-amber-950', icon: AlertTriangle, color: 'text-amber-600' },
    error:   { badge: 'bg-rose-500 text-white', icon: AlertTriangle, color: 'text-rose-600' },
  };

  const cfg = statusCfg[latest?.status] || statusCfg.success;
  const StatusIcon = cfg.icon;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="pro-glass rounded-3xl p-5">
      <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-emerald-100 ring-1 ring-emerald-300 flex items-center justify-center">
            <Database className="w-6 h-6 text-emerald-700" />
          </div>
          <div>
            <h3 className="text-slate-900 font-black text-lg leading-tight">Supabase Sync</h3>
            <p className="text-slate-600 text-xs font-semibold">Auto-sync setiap 3 jam</p>
          </div>
        </div>
        <button
          onClick={runSyncNow}
          disabled={syncing}
          className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-sm flex items-center gap-2 shadow-lg disabled:opacity-60 transition-colors"
        >
          {syncing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
          {syncing ? 'Sync...' : 'Sync Sekarang'}
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="w-6 h-6 border-4 border-slate-300 border-t-slate-700 rounded-full animate-spin mx-auto" />
        </div>
      ) : !latest ? (
        <div className="text-center py-10 rounded-2xl bg-white/70 border border-slate-200">
          <Clock className="w-7 h-7 text-slate-400 mx-auto mb-2" />
          <p className="text-slate-700 font-bold text-sm">Belum ada sync. Klik "Sync Sekarang" untuk mula.</p>
        </div>
      ) : (
        <>
          {/* Latest snapshot */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <div className="rounded-2xl p-4 bg-white ring-1 ring-slate-200 shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <StatusIcon className={`w-4 h-4 ${cfg.color}`} />
                <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${cfg.badge}`}>
                  {(latest.status || 'unknown').toUpperCase()}
                </span>
              </div>
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mt-1">Status</p>
            </div>
            <div className="rounded-2xl p-4 bg-white ring-1 ring-slate-200 shadow-sm">
              <p className="text-2xl font-black text-slate-900">{latest.total_records ?? 0}</p>
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mt-1">Records</p>
            </div>
            <div className="rounded-2xl p-4 bg-white ring-1 ring-slate-200 shadow-sm">
              <p className="text-2xl font-black text-slate-900">
                {latest.duration_ms ?? 0}<span className="text-base text-slate-500">ms</span>
              </p>
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mt-1">Duration</p>
            </div>
            <div className="rounded-2xl p-4 bg-white ring-1 ring-slate-200 shadow-sm">
              <p className="text-xs font-bold text-slate-900 leading-tight">
                {new Date(latest.run_at).toLocaleString('ms-MY', { dateStyle: 'short', timeStyle: 'short' })}
              </p>
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mt-1">Last Run</p>
            </div>
          </div>

          {/* Per-entity breakdown */}
          {latest.entities_synced && (
            <div className="rounded-2xl p-4 bg-white ring-1 ring-slate-200 shadow-sm mb-4">
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.18em] mb-3">Per Entity (Sync Terakhir)</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {Object.entries(latest.entities_synced).map(([entity, info]) => (
                  <div key={entity} className="rounded-xl p-2.5 bg-slate-50 ring-1 ring-slate-200">
                    <p className="text-slate-800 text-[11px] font-bold truncate">{entity}</p>
                    {info.error ? (
                      <p className="text-rose-600 text-[10px] font-semibold truncate" title={info.error}>✕ Error</p>
                    ) : (
                      <p className="text-emerald-700 text-[11px] font-black">{info.synced} rec</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent history */}
          {history.length > 1 && (
            <div>
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.18em] mb-2 pl-1">Sejarah Sync</p>
              <div className="space-y-2 max-h-56 overflow-y-auto">
                {history.slice(0, 10).map((log) => {
                  const c = statusCfg[log.status] || statusCfg.success;
                  return (
                    <div key={log.id} className="flex items-center gap-3 px-3 py-2 rounded-xl bg-white ring-1 ring-slate-200">
                      <span className={`flex-shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black ${c.badge}`}>
                        {(log.status || 'unknown').toUpperCase()}
                      </span>
                      <p className="text-slate-900 text-xs font-bold flex-1 truncate">
                        {new Date(log.run_at).toLocaleString('ms-MY', { dateStyle: 'short', timeStyle: 'short' })}
                      </p>
                      <p className="text-slate-600 text-[11px] font-semibold flex-shrink-0">
                        {log.total_records ?? 0} rec
                      </p>
                      <p className="text-slate-500 text-[11px] font-mono flex-shrink-0">{log.duration_ms ?? 0}ms</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </motion.div>
  );
}