import React, { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle2, History, Loader2, RefreshCw, ShieldCheck, Wrench, Eye } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import QcIssueDetailModal from '@/components/admin/QcIssueDetailModal';

export default function QualityControlPanel({ onToast }) {
  const [qc, setQc] = useState(null);
  const [history, setHistory] = useState([]);
  const [intervalMinutes, setIntervalMinutes] = useState(10);
  const [subjectCap, setSubjectCap] = useState(30);
  const [miniGameCap, setMiniGameCap] = useState(30);
  const [storyKidCap, setStoryKidCap] = useState(30);
  const [savingSettings, setSavingSettings] = useState(false);
  const [loading, setLoading] = useState(false);
  const [repairing, setRepairing] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailSource, setDetailSource] = useState(null); // null = current qc, else log object

  const loadHistory = async () => {
    try {
      const logs = await base44.entities.QCLog.list('-created_date', 10);
      setHistory(logs || []);
    } catch {}
  };

  const loadSetting = async () => {
    const res = await base44.functions.invoke('updateQualityControlSettings', {});
    const s = res.data?.setting;
    if (s?.intervalMinutes) setIntervalMinutes(s.intervalMinutes);
    if (s?.subjectCap) setSubjectCap(s.subjectCap);
    if (s?.miniGameCap) setMiniGameCap(s.miniGameCap);
    if (s?.storyKidCap) setStoryKidCap(s.storyKidCap);
  };

  const saveAllSettings = async () => {
    setSavingSettings(true);
    try {
      const res = await base44.functions.invoke('updateQualityControlSettings', { intervalMinutes, subjectCap, miniGameCap, storyKidCap });
      const s = res.data?.setting;
      if (s?.intervalMinutes) setIntervalMinutes(s.intervalMinutes);
      if (s?.subjectCap) setSubjectCap(s.subjectCap);
      if (s?.miniGameCap) setMiniGameCap(s.miniGameCap);
      if (s?.storyKidCap) setStoryKidCap(s.storyKidCap);
      onToast?.(`✅ Tetapan disimpan: ${s?.intervalMinutes}min · Cap ${s?.subjectCap}/${s?.miniGameCap}/${s?.storyKidCap}`);
    } catch (error) {
      onToast?.('❌ Gagal simpan tetapan: ' + error.message, false);
    }
    setSavingSettings(false);
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
    // Skip auto-audit on mount (jimat credits). User klik "Audit" untuk run.
    loadHistory();
    loadSetting();
  }, []);

  const score = typeof qc?.score === 'number' ? qc.score : 0;
  const isPassing = score >= 90;
  const isWaiting = qc?.status === 'waiting_for_generation';
  const hasIssues = (qc?.failed || qc?.failedBeforeRepair || 0) > 0;
  const hasStuckTasks = (qc?.stuckTasksCleaned || 0) > 0 || (qc?.bucketRefills || 0) > 0;
  const canRepair = hasIssues || hasStuckTasks || !qc;
  const deletedCount = qc?.deletedThisRun || qc?.deletedCount || 0;
  const queuedCount = qc?.replacementTasks || 0;

  return (
    <>
    <div className="w-full min-w-0 max-w-full overflow-hidden p-3 md:p-7 rounded-[1.5rem] md:rounded-[2rem] mb-5 md:mb-6 shadow-2xl shadow-black/20" style={{ background: 'linear-gradient(135deg, rgba(34,197,94,0.20), rgba(59,130,246,0.12))', backdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.22)' }}>
      {/* Header */}
      <div className="flex items-start gap-3 mb-4">
        <div className="w-11 h-11 md:w-12 md:h-12 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center flex-shrink-0">
          <ShieldCheck className="w-5 h-5 md:w-6 md:h-6 text-green-300" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="font-black text-white text-base md:text-lg leading-tight">🛡️ Quality Control Worker</h2>
          <p className="text-white/55 text-[11px] md:text-xs font-semibold leading-snug mt-0.5">Auto audit, repair, re-queue replacement, dan ajar generator elak isu sama berulang.</p>
        </div>
      </div>

      {/* Action buttons — full width on mobile, inline on desktop */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <button onClick={() => runCheck(false)} disabled={loading || repairing} className="px-3 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-black border border-white/15 flex items-center justify-center gap-2 disabled:opacity-50">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />} Audit
        </button>
        <button onClick={() => runCheck(true)} disabled={loading || repairing || !canRepair} className="px-3 py-2.5 rounded-2xl bg-green-400 text-green-950 text-xs font-black flex items-center justify-center gap-2 disabled:opacity-50">
          {repairing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wrench className="w-4 h-4" />} <span className="truncate">Repair + Teach</span>
        </button>
      </div>

      {/* Combined Settings: Interval + Caps */}
      <div className="rounded-2xl bg-white/10 border border-white/15 px-3 py-3 mb-4 md:mb-5">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-white font-black text-xs">⚙️ Tetapan QC</span>
          <span className="text-white/45 text-[10px] font-semibold">Auto interval + cap auto-replace</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-2">
          <div>
            <label className="block text-white/55 text-[10px] font-black mb-1">⏱️ Interval (min)</label>
            <input type="number" min="5" max="1440" value={intervalMinutes} onChange={(e) => setIntervalMinutes(parseInt(e.target.value) || 5)}
              className="w-full bg-white/10 border border-white/10 rounded-xl px-2 py-1.5 text-white text-xs font-black text-center" />
          </div>
          <div>
            <label className="block text-white/55 text-[10px] font-black mb-1">📚 Subjek</label>
            <input type="number" min="4" max="200" value={subjectCap} onChange={(e) => setSubjectCap(parseInt(e.target.value) || 4)}
              className="w-full bg-white/10 border border-white/10 rounded-xl px-2 py-1.5 text-white text-xs font-black text-center" />
          </div>
          <div>
            <label className="block text-white/55 text-[10px] font-black mb-1">🎮 Mini</label>
            <input type="number" min="4" max="200" value={miniGameCap} onChange={(e) => setMiniGameCap(parseInt(e.target.value) || 4)}
              className="w-full bg-white/10 border border-white/10 rounded-xl px-2 py-1.5 text-white text-xs font-black text-center" />
          </div>
          <div>
            <label className="block text-white/55 text-[10px] font-black mb-1">📖 Story</label>
            <input type="number" min="4" max="200" value={storyKidCap} onChange={(e) => setStoryKidCap(parseInt(e.target.value) || 4)}
              className="w-full bg-white/10 border border-white/10 rounded-xl px-2 py-1.5 text-white text-xs font-black text-center" />
          </div>
        </div>
        <button onClick={saveAllSettings} disabled={savingSettings} className="w-full px-3 py-2 rounded-xl bg-green-400 text-green-950 text-xs font-black disabled:opacity-50">
          {savingSettings ? 'Menyimpan...' : '💾 Simpan Semua Tetapan'}
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
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

      {/* Breakdown by content type */}
      {qc?.breakdown && (
        <div className="grid grid-cols-3 gap-2 mb-3">
          <div className="rounded-2xl bg-purple-400/15 border border-purple-300/20 p-2.5 text-center">
            <p className="text-lg font-black text-purple-200">{qc.breakdown.subject?.failed || 0}<span className="text-xs text-purple-200/60">/{qc.breakdown.subject?.total || 0}</span></p>
            <p className="text-purple-100/70 text-[10px] font-bold uppercase tracking-wider">📚 Subjek</p>
          </div>
          <div className="rounded-2xl bg-pink-400/15 border border-pink-300/20 p-2.5 text-center">
            <p className="text-lg font-black text-pink-200">{qc.breakdown.mini?.failed || 0}<span className="text-xs text-pink-200/60">/{qc.breakdown.mini?.total || 0}</span></p>
            <p className="text-pink-100/70 text-[10px] font-bold uppercase tracking-wider">🎮 Mini</p>
          </div>
          <div className="rounded-2xl bg-cyan-400/15 border border-cyan-300/20 p-2.5 text-center">
            <p className="text-lg font-black text-cyan-200">{qc.breakdown.story?.failed || 0}<span className="text-xs text-cyan-200/60">/{qc.breakdown.story?.total || 0}</span></p>
            <p className="text-cyan-100/70 text-[10px] font-bold uppercase tracking-wider">📖 Story</p>
          </div>
        </div>
      )}

      {/* Capacity Gaps — kategori yang kurang dari target */}
      {qc?.capacityGaps && (qc.capacityGaps.subject?.length > 0 || qc.capacityGaps.mini?.length > 0 || qc.capacityGaps.story?.length > 0) && (
        <div className="rounded-2xl bg-amber-400/10 border border-amber-300/20 p-3 mb-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-amber-100 font-black text-xs flex items-center gap-1.5">📊 Kategori Bawah Target ({(qc.capacityGaps.subject?.length || 0) + (qc.capacityGaps.mini?.length || 0) + (qc.capacityGaps.story?.length || 0)})</span>
            {(qc.capacityRefills || qc.bucketRefills) > 0 && (
              <span className="text-green-200 text-[10px] font-black">+{qc.bucketRefills || 0} queued</span>
            )}
          </div>
          <div className="space-y-1 max-h-40 overflow-y-auto">
            {[...(qc.capacityGaps.subject || []), ...(qc.capacityGaps.mini || []), ...(qc.capacityGaps.story || [])].slice(0, 12).map((gap, i) => (
              <div key={i} className="flex items-center justify-between gap-2 px-2 py-1.5 rounded-lg bg-white/5 text-[11px]">
                <span className="text-white/80 font-bold truncate">{gap.label}</span>
                <span className="text-white/60 font-black flex-shrink-0">
                  {gap.current}/{gap.target}
                  <span className="text-amber-300 ml-1">(−{gap.need})</span>
                </span>
              </div>
            ))}
          </div>
          <p className="text-amber-100/60 text-[10px] font-semibold mt-2">💡 Klik "Repair + Teach" untuk auto-queue refill kategori ini.</p>
        </div>
      )}

      {/* Last repair summary — show what QC did */}
      {(deletedCount > 0 || queuedCount > 0 || qc?.autofixedGames > 0) && (
        <div className="grid grid-cols-3 gap-2 mb-3">
          <div className="rounded-2xl bg-green-400/15 border border-green-300/20 p-2.5 text-center">
            <p className="text-lg font-black text-green-200">{qc?.autofixedGames || 0}</p>
            <p className="text-green-100/70 text-[10px] font-bold uppercase tracking-wider">✨ Auto-Fixed</p>
          </div>
          <div className="rounded-2xl bg-orange-400/15 border border-orange-300/20 p-2.5 text-center">
            <p className="text-lg font-black text-orange-200">{deletedCount}</p>
            <p className="text-orange-100/70 text-[10px] font-bold uppercase tracking-wider">🗑️ Deleted</p>
          </div>
          <div className="rounded-2xl bg-blue-400/15 border border-blue-300/20 p-2.5 text-center">
            <p className="text-lg font-black text-blue-200">{queuedCount}</p>
            <p className="text-blue-100/70 text-[10px] font-bold uppercase tracking-wider">📥 Queued</p>
          </div>
        </div>
      )}

      <div className={`rounded-2xl p-3 border text-xs font-bold flex items-start gap-2 ${isPassing ? 'bg-green-400/15 border-green-300/20 text-green-100' : 'bg-yellow-400/15 border-yellow-300/20 text-yellow-100'}`}>
        {isPassing ? <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" /> : <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />}
        <span>{qc?.message || 'Memuatkan status quality control...'}</span>
      </div>

      {qc?.sampleIssues?.length > 0 && (
        <>
          <div className="mt-3 space-y-1 max-h-36 overflow-y-auto">
            {qc.sampleIssues.slice(0, 5).map((item, index) => (
              <div key={index} className="rounded-xl bg-white/8 border border-white/10 px-3 py-2 text-xs text-white/70">
                <span className="font-black text-white">{item.title}</span> · {item.issues?.join(', ')}
              </div>
            ))}
          </div>
          <button
            onClick={() => { setDetailSource(null); setDetailOpen(true); }}
            className="mt-2 w-full flex items-center justify-center gap-2 px-3 py-2 rounded-2xl bg-blue-400/20 hover:bg-blue-400/30 border border-blue-300/20 text-blue-100 text-xs font-black transition-all"
          >
            <Eye className="w-4 h-4" /> Lihat detail issues
          </button>
        </>
      )}

      <div className="mt-4 rounded-2xl bg-white/8 border border-white/10 p-3">
        <div className="flex items-center gap-2 mb-2 text-white font-black text-xs uppercase tracking-wider">
          <History className="w-4 h-4 text-blue-200" /> History Audit & Repair
        </div>
        {history.length === 0 ? (
          <p className="text-white/45 text-xs font-semibold">Belum ada rekod QC.</p>
        ) : (
          <div className="space-y-2 max-h-52 overflow-y-auto">
            {history.map(log => {
              const hasIssues = Array.isArray(log.sampleIssues) && log.sampleIssues.length > 0;
              return (
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
                  {hasIssues && (
                    <button
                      onClick={() => { setDetailSource(log); setDetailOpen(true); }}
                      className="mt-1.5 inline-flex items-center gap-1 text-blue-300 hover:text-blue-200 text-[11px] font-black"
                    >
                      <Eye className="w-3 h-3" /> Lihat {log.sampleIssues.length} issues
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>

    <QcIssueDetailModal
      open={detailOpen}
      onClose={() => setDetailOpen(false)}
      sampleIssues={detailSource ? (detailSource.sampleIssues || []) : (qc?.sampleIssues || [])}
      lastRunAt={detailSource ? detailSource.runAt : (history[0]?.runAt)}
      score={detailSource ? detailSource.score : qc?.score}
      message={detailSource ? detailSource.message : qc?.message}
    />
    </>
  );
}