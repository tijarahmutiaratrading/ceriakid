import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { CheckCircle2, AlertTriangle, XCircle, RefreshCw, Activity, Globe, CreditCard, Webhook, BarChart3, Sparkles, Database, Users as UsersIcon, ListChecks } from 'lucide-react';

const STATUS_CONFIG = {
  healthy:  { color: 'emerald', label: 'STABLE',   icon: CheckCircle2, ringClass: 'ring-emerald-300/40', textClass: 'text-emerald-200', bgClass: 'bg-emerald-400/15', badgeClass: 'bg-emerald-400 text-emerald-950' },
  warning:  { color: 'amber',   label: 'WARNING',  icon: AlertTriangle, ringClass: 'ring-amber-300/40', textClass: 'text-amber-100', bgClass: 'bg-amber-400/15', badgeClass: 'bg-amber-300 text-amber-950' },
  critical: { color: 'rose',    label: 'CRITICAL', icon: XCircle, ringClass: 'ring-rose-300/40', textClass: 'text-rose-100', bgClass: 'bg-rose-400/15', badgeClass: 'bg-rose-400 text-rose-950' },
};

const CHECK_ICONS = {
  landing_uptime: Globe,
  chip_gateway:   CreditCard,
  webhook_health: Webhook,
  fb_pixel:       BarChart3,
  game_quality:   Sparkles,
  task_queue:     ListChecks,
  db_health:      Database,
  user_health:    UsersIcon,
};

export default function SystemHealthPanel() {
  const [latestLog, setLatestLog] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initLoading, setInitLoading] = useState(true);

  const loadHistory = async () => {
    try {
      const logs = await base44.entities.HealthCheckLog.list('-runAt', 24);
      setHistory(logs || []);
      if (logs && logs.length > 0) setLatestLog(logs[0]);
    } catch (e) {
      console.error('Failed to load health logs:', e);
    } finally {
      setInitLoading(false);
    }
  };

  useEffect(() => { loadHistory(); }, []);

  const runCheck = async () => {
    setLoading(true);
    try {
      const res = await base44.functions.invoke('runHealthCheck', {});
      if (res?.data) {
        setLatestLog({
          runAt: new Date().toISOString(),
          overallStatus: res.data.overallStatus,
          totalChecks: res.data.totalChecks,
          healthyCount: res.data.healthyCount,
          warningCount: res.data.warningCount,
          criticalCount: res.data.criticalCount,
          durationMs: res.data.durationMs,
          checks: res.data.checks,
        });
        await loadHistory();
      }
    } catch (e) {
      console.error('Health check failed:', e);
    } finally {
      setLoading(false);
    }
  };

  // Uptime 24j = peratus check yang healthy dalam history
  const uptime24h = (() => {
    if (history.length === 0) return null;
    const totalChecks = history.reduce((s, l) => s + (l.totalChecks || 0), 0);
    const totalHealthy = history.reduce((s, l) => s + (l.healthyCount || 0), 0);
    if (totalChecks === 0) return null;
    return ((totalHealthy / totalChecks) * 100).toFixed(1);
  })();

  if (initLoading) {
    return (
      <div className="pro-glass rounded-3xl p-12 text-center">
        <div className="w-8 h-8 border-4 border-white/40 border-t-white rounded-full animate-spin mx-auto" />
        <p className="text-white/70 text-sm font-bold mt-3">Memuatkan sistem health...</p>
      </div>
    );
  }

  const status = latestLog?.overallStatus || 'healthy';
  const StatusIcon = STATUS_CONFIG[status].icon;
  const checks = latestLog?.checks || [];

  // Group by category
  const grouped = checks.reduce((acc, c) => {
    const cat = c.category || 'Other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(c);
    return acc;
  }, {});

  return (
    <div className="space-y-4 md:space-y-5">
      {/* HERO STATUS BANNER */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="pro-glass rounded-3xl p-5 md:p-7">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-5 items-center">
          <div className="flex items-start gap-4">
            <div className={`w-16 h-16 md:w-20 md:h-20 rounded-3xl ${STATUS_CONFIG[status].bgClass} ring-2 ${STATUS_CONFIG[status].ringClass} flex items-center justify-center flex-shrink-0`}>
              <StatusIcon className={`w-9 h-9 md:w-11 md:h-11 ${STATUS_CONFIG[status].textClass}`} />
            </div>
            <div className="min-w-0">
              <p className="text-white/65 text-[10px] md:text-[11px] font-black uppercase tracking-[0.18em] mb-1">STATUS SISTEM SEMASA</p>
              <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight capitalize leading-none">
                {status === 'healthy' ? 'Healthy' : status === 'warning' ? 'Warning' : 'Critical'}
              </h2>
              {latestLog && (
                <p className="text-white/65 text-xs md:text-sm font-semibold mt-2 flex items-center gap-2">
                  <Activity className="w-3.5 h-3.5" />
                  Audit terakhir: {new Date(latestLog.runAt).toLocaleString('ms-MY', { dateStyle: 'medium', timeStyle: 'short' })}
                </p>
              )}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 md:gap-4 text-center">
            <div>
              <p className="text-2xl md:text-3xl font-black text-white">{latestLog?.totalChecks ?? '–'}</p>
              <p className="text-white/55 text-[10px] md:text-xs font-bold uppercase tracking-wider mt-1">Checks Run</p>
            </div>
            <div>
              <p className="text-2xl md:text-3xl font-black text-rose-300">{latestLog?.criticalCount ?? '–'}</p>
              <p className="text-white/55 text-[10px] md:text-xs font-bold uppercase tracking-wider mt-1">Issues</p>
            </div>
            <div>
              <p className="text-2xl md:text-3xl font-black text-white">{latestLog?.durationMs ?? '–'}<span className="text-base text-white/55">ms</span></p>
              <p className="text-white/55 text-[10px] md:text-xs font-bold uppercase tracking-wider mt-1">Duration</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* STAT TILES */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {[
          { label: 'Uptime 24j', value: uptime24h !== null ? `${uptime24h}%` : '–', color: 'text-emerald-300' },
          { label: 'Audit Runs', value: history.length, color: 'text-sky-300' },
          { label: 'Healthy', value: latestLog?.healthyCount ?? '–', color: 'text-emerald-300' },
          { label: 'Warning', value: latestLog?.warningCount ?? '–', color: 'text-amber-300' },
        ].map((stat, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="pro-glass rounded-2xl p-4">
            <p className={`text-2xl md:text-3xl font-black ${stat.color}`}>{stat.value}</p>
            <p className="text-white/55 text-[10px] md:text-xs font-bold uppercase tracking-wider mt-1">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* CHECKS LIST */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="pro-glass rounded-3xl p-5">
        <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
          <div>
            <h3 className="text-white font-black text-lg">Apa Yang Auditor Check</h3>
            <p className="text-white/55 text-xs">{checks.length} checks dijalankan setiap audit run</p>
          </div>
          <button onClick={runCheck} disabled={loading} className="px-4 py-2.5 rounded-xl bg-white text-game-purple font-black text-sm flex items-center gap-2 shadow-lg disabled:opacity-60 hover:bg-white/95 transition-colors">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Auditing...' : 'Run Audit Sekarang'}
          </button>
        </div>

        {checks.length === 0 ? (
          <div className="text-center py-12 rounded-2xl bg-white/5 border border-white/10">
            <Activity className="w-8 h-8 text-white/40 mx-auto mb-2" />
            <p className="text-white/70 font-bold text-sm">Belum ada audit. Klik "Run Audit Sekarang" untuk mula.</p>
          </div>
        ) : (
          <div className="space-y-5">
            {Object.entries(grouped).map(([category, items]) => (
              <div key={category}>
                <p className="text-white/55 text-[10px] font-black uppercase tracking-[0.18em] mb-2 pl-1">{category}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {items.map((c) => {
                    const cfg = STATUS_CONFIG[c.status] || STATUS_CONFIG.healthy;
                    const Icon = CHECK_ICONS[c.key] || Activity;
                    return (
                      <div key={c.key} className={`rounded-2xl p-4 bg-white/5 border border-white/10 hover:border-white/25 transition-colors`}>
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                            <Icon className="w-5 h-5 text-white/85" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <p className="text-white font-black text-sm leading-tight truncate">{c.label}</p>
                              <span className={`flex-shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black ${cfg.badgeClass}`}>
                                <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
                                {cfg.label}
                              </span>
                            </div>
                            <p className="text-white/65 text-xs leading-snug">{c.message}</p>
                            {c.value && <p className="text-white/40 text-[11px] font-mono mt-1.5">{c.value}</p>}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* HISTORY */}
      {history.length > 1 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="pro-glass rounded-3xl p-5">
          <h3 className="text-white font-black text-lg mb-3">📜 Sejarah Audit</h3>
          <div className="space-y-2 max-h-72 overflow-y-auto">
            {history.slice(0, 20).map((log) => {
              const cfg = STATUS_CONFIG[log.overallStatus] || STATUS_CONFIG.healthy;
              return (
                <div key={log.id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/5 border border-white/10">
                  <span className={`flex-shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black ${cfg.badgeClass}`}>
                    {cfg.label}
                  </span>
                  <p className="text-white/85 text-xs font-bold flex-1 truncate">
                    {new Date(log.runAt).toLocaleString('ms-MY', { dateStyle: 'short', timeStyle: 'short' })}
                  </p>
                  <p className="text-white/55 text-[11px] font-semibold flex-shrink-0">
                    {log.healthyCount}✓ · {log.warningCount}⚠ · {log.criticalCount}✕
                  </p>
                  <p className="text-white/40 text-[11px] font-mono flex-shrink-0">{log.durationMs}ms</p>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}
    </div>
  );
}