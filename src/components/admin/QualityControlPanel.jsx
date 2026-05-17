import React, { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle2, History, Loader2, RefreshCw, ShieldCheck, Wrench } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import QcOverviewReport from '@/components/admin/QcOverviewReport';

export default function QualityControlPanel({ onToast }) {
  const [qc, setQc] = useState(null);
  const [history, setHistory] = useState([]);
  const [intervalMinutes, setIntervalMinutes] = useState(10);
  const [savingInterval, setSavingInterval] = useState(false);
  const [loading, setLoading] = useState(false);
  const [repairing, setRepairing] = useState(false);

  const loadHistory = async () => {
    try {
      const logs = await base44.entities.QCLog.list('-created_date', 10);
      setHistory(logs || []);
    } catch {}
  };

  const loadSetting = async () => {
    const res = await base44.functions.invoke('updateQualityControlSettings', {});
    if (res.data?.setting?.intervalMinutes) setIntervalMinutes(res.data.setting.intervalMinutes);
  };

  const saveSetting = async () => {
    setSavingInterval(true);
    try {
      const res = await base44.functions.invoke('updateQualityControlSettings', { intervalMinutes });
      setIntervalMinutes(res.data?.setting?.intervalMinutes || intervalMinutes);
      onToast?.(`✅ QC auto check setiap ${res.data?.setting?.intervalMinutes || intervalMinutes} minit`);
    } catch (error) {
      onToast?.('❌ Gagal simpan QC interval: ' + error.message, false);
    }
    setSavingInterval(false);
  };

  const runCheck = async (repair = false, silent = false) => {
    repair ? setRepairing(true) : setLoading(true);
    try {
      const res = await base44.functions.invoke('backgroundQualityControl', repair ? { force: true } : { auditOnly: true, force: true });
      setQc(res.data);
      await loadHistory();
      if (!silent) onToast?.(repair ? '✅ QC repair dijalankan' : '✅ QC audit dikemaskini');
    } catch (error) {
      if (!silent) onToast?.('❌ QC gagal: ' + error.message, false);
    }
    setLoading(false);
    setRepairing(false);
  };

  useEffect(() => {
    runCheck(false, true); // silent on mount — elak noti rimas tiap kali buka page
    loadHistory();
    loadSetting();
  }, []);

  const score = typeof qc?.score === 'number' ? qc.score : 0;
  const isPassing = score >= 90;
  const isWaiting = qc?.status === 'waiting_for_generation';

  return (
    <>
    <QcOverviewReport onToast={onToast} />
    <div className="w-full min-w-0 max-w-full overflow-hidden p-3 md:p-7 rounded-[1.5rem] md:rounded-[2rem] mb-5 md:mb-6 shadow-2xl shadow-black/20" style={{ background: 'linear-gradient(135deg, rgba(34,197,94,0.20), rgba(59,130,246,0.12))', backdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.22)' }}>
      <div className="flex min-w-0 flex-col md:flex-row md:items-center justify-between gap-3 md:gap-4 mb-4 md:mb-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6 text-green-300" />
          </div>
          <div>
            <h2 className="font-black text-white text-lg">🛡️ Quality Control Worker</h2>
            <p className="text-white/55 text-xs font-semibold">Auto audit, repair, re-queue replacement, dan ajar generator elak isu sama berulang.</p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex items-center gap-2 rounded-2xl bg-white/10 border border-white/15 px-3 py-2">
            <span className="text-white/60 text-xs font-black whitespace-nowrap">Auto QC</span>
            <input
              type="number"
              min="5"
              max="1440"
              value={intervalMinutes}
              onChange={(e) => setIntervalMinutes(parseInt(e.target.value) || 5)}
              className="w-16 bg-white/10 border border-white/10 rounded-xl px-2 py-1 text-white text-xs font-black text-center"
            />
            <span className="text-white/60 text-xs font-bold">min</span>
            <button onClick={saveSetting} disabled={savingInterval} className="px-2 py-1 rounded-xl bg-blue-400 text-blue-950 text-xs font-black disabled:opacity-50">
              {savingInterval ? '...' : 'Simpan'}
            </button>
          </div>
          <button onClick={() => runCheck(false)} disabled={loading || repairing} className="px-4 py-2 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-black border border-white/15 flex items-center gap-2 disabled:opacity-50">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />} Audit
          </button>
          <button onClick={() => runCheck(true)} disabled={loading || repairing || isPassing} className="px-4 py-2 rounded-2xl bg-green-400 text-green-950 text-xs font-black flex items-center gap-2 disabled:opacity-50">
            {repairing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wrench className="w-4 h-4" />} Repair + Teach Generator
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
        <div className="rounded-2xl bg-white/10 border border-white/10 p-3 text-center">
          <p className={`text-2xl font-black ${isPassing ? 'text-green-300' : 'text-yellow-300'}`}>{isWaiting ? 'WAIT' : `${score}%`}</p>
          <p className="text-white/60 text-xs font-bold">Quality Score</p>
        </div>
        <div className="rounded-2xl bg-white/10 border border-white/10 p-3 text-center">
          <p className="text-2xl font-black text-white">{qc?.total ?? '-'}</p>
          <p className="text-white/60 text-xs font-bold">Audited</p>
        </div>
        <div className="rounded-2xl bg-white/10 border border-white/10 p-3 text-center">
          <p className="text-2xl font-black text-green-300">{qc?.passed ?? '-'}</p>
          <p className="text-white/60 text-xs font-bold">Passed</p>
        </div>
        <div className="rounded-2xl bg-white/10 border border-white/10 p-3 text-center">
          <p className="text-2xl font-black text-red-300">{qc?.failed ?? qc?.failedBeforeRepair ?? '-'}</p>
          <p className="text-white/60 text-xs font-bold">Failed</p>
        </div>
      </div>

      <div className={`rounded-2xl p-3 border text-xs font-bold flex items-start gap-2 ${isPassing ? 'bg-green-400/15 border-green-300/20 text-green-100' : 'bg-yellow-400/15 border-yellow-300/20 text-yellow-100'}`}>
        {isPassing ? <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" /> : <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />}
        <span>{qc?.message || 'Memuatkan status quality control...'}</span>
      </div>

      {qc?.sampleIssues?.length > 0 && (
        <div className="mt-3 space-y-1 max-h-36 overflow-y-auto">
          {qc.sampleIssues.slice(0, 5).map((item, index) => (
            <div key={index} className="rounded-xl bg-white/8 border border-white/10 px-3 py-2 text-xs text-white/70">
              <span className="font-black text-white">{item.title}</span> · {item.issues?.join(', ')}
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 rounded-2xl bg-white/8 border border-white/10 p-3">
        <div className="flex items-center gap-2 mb-2 text-white font-black text-xs uppercase tracking-wider">
          <History className="w-4 h-4 text-blue-200" /> History Audit & Repair
        </div>
        {history.length === 0 ? (
          <p className="text-white/45 text-xs font-semibold">Belum ada rekod QC.</p>
        ) : (
          <div className="space-y-2 max-h-52 overflow-y-auto">
            {history.map(log => (
              <div key={log.id} className="rounded-xl bg-white/8 border border-white/10 px-3 py-2 text-xs">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-white font-black">{log.action === 'repair' || log.action === 'auto_repair' ? 'Repair' : 'Audit'} · {log.status}</span>
                  <span className="text-white/45 font-semibold">{log.runAt ? new Date(log.runAt).toLocaleString('ms-MY') : '-'}</span>
                </div>
                <p className="text-white/65 mt-1">
                  Score {typeof log.score === 'number' ? `${log.score}%` : '-'} · Lulus {log.passed || 0}/{log.total || 0} · Gagal {log.failed || 0}
                  {(log.deletedCount || log.replacementTasks) ? ` · Fixed ${log.deletedCount || 0}, Queue ${log.replacementTasks || 0}` : ''}
                </p>
                {log.message && <p className="text-white/45 mt-1 truncate">{log.message}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
    </>
  );
}