import React, { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle2, Loader2, RefreshCw, ShieldCheck } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const statusMeta = {
  safe: { icon: CheckCircle2, color: 'text-green-200', bg: 'bg-green-400/15', border: 'border-green-300/20' },
  warning: { icon: AlertCircle, color: 'text-yellow-200', bg: 'bg-yellow-400/15', border: 'border-yellow-300/20' },
};

export default function ProductionSafetyChecklist() {
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState({ pending: 0, running: 0, failed: 0, games: 0, miniGames: 0, storyKid: 0 });

  const loadSummary = async () => {
    setLoading(true);
    const [tasks, countsRes] = await Promise.all([
      base44.entities.GameTask.list('-created_date', 200),
      base44.functions.invoke('getGameManagerCounts', {}),
    ]);

    const miniTotal = Object.values(countsRes.data?.miniCounts || {}).reduce((sum, item) => sum + (item.count || 0), 0);
    const subjectTotal = Object.values(countsRes.data?.subjectCounts || {}).reduce((sum, item) => sum + (item.games || 0), 0);
    const storyKidTotal = countsRes.data?.storyKidCounts?.count || 0;

    setSummary({
      pending: tasks.filter(t => t.status === 'pending').length,
      running: tasks.filter(t => t.status === 'running').length,
      failed: tasks.filter(t => t.status === 'failed').length,
      games: subjectTotal,
      miniGames: miniTotal,
      storyKid: storyKidTotal,
    });
    setLoading(false);
  };

  useEffect(() => {
    loadSummary();
  }, []);

  const checks = [
    { label: 'Queue aktif dipantau', value: `${summary.pending} pending · ${summary.running} running`, status: summary.running > 0 ? 'warning' : 'safe' },
    { label: 'Failed task perlu semak', value: `${summary.failed} failed`, status: summary.failed > 0 ? 'warning' : 'safe' },
    { label: 'Kandungan utama tersedia', value: `${summary.games} games subjek`, status: summary.games > 0 ? 'safe' : 'warning' },
    { label: 'Mini Games tersedia', value: `${summary.miniGames} mini games`, status: summary.miniGames > 0 ? 'safe' : 'warning' },
    { label: 'Story Kid tersedia', value: `${summary.storyKid} story`, status: summary.storyKid > 0 ? 'safe' : 'warning' },
  ];

  return (
    <div className="rounded-[2rem] p-4 md:p-5 shadow-2xl shadow-black/20 bg-white/10 border border-white/15 backdrop-blur-2xl">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-11 h-11 rounded-2xl bg-green-400/20 border border-green-300/20 flex items-center justify-center flex-shrink-0">
            <ShieldCheck className="w-5 h-5 text-green-200" />
          </div>
          <div className="min-w-0">
            <h3 className="text-white font-black text-base md:text-lg">Production Safety Checklist</h3>
            <p className="text-white/55 text-xs font-semibold">Semak ringkas sebelum run bulk generation besar.</p>
          </div>
        </div>
        <button onClick={loadSummary} disabled={loading} className="p-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white transition-all flex-shrink-0">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
        {checks.map((check) => {
          const meta = statusMeta[check.status];
          const Icon = meta.icon;
          return (
            <div key={check.label} className={`rounded-2xl p-3 border ${meta.bg} ${meta.border}`}>
              <div className="flex items-center gap-2 mb-1.5">
                <Icon className={`w-4 h-4 ${meta.color}`} />
                <p className="text-white/70 text-[11px] font-black uppercase tracking-wide leading-tight">{check.label}</p>
              </div>
              <p className="text-white font-black text-sm">{check.value}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}