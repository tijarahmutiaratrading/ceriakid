import React, { useEffect, useState } from 'react';
import { Loader2, RefreshCw, BookOpen, Gamepad2, Sparkles, Send, ListChecks } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const SUBJECT_LABELS = {
  bahasa_melayu: 'BM',
  english: 'EN',
  mathematics: 'MATH',
  science: 'SAINS',
  jawi: 'JAWI',
  bahasa_tamil: 'TAMIL',
  bahasa_mandarin: 'MAND',
};

const LEVEL_LABELS = {
  prasekolah: 'Pra',
  darjah_1: 'D1',
  darjah_2: 'D2',
  darjah_3: 'D3',
  darjah_4: 'D4',
  darjah_5: 'D5',
  darjah_6: 'D6',
};

function bucketColor(b) {
  if (b.empty) return 'bg-red-500/30 text-red-100 border-red-300/40';
  if (b.low) return 'bg-yellow-500/25 text-yellow-100 border-yellow-300/40';
  return 'bg-green-500/20 text-green-100 border-green-300/30';
}

export default function QcOverviewReport({ onToast }) {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [command, setCommand] = useState('');
  const [sending, setSending] = useState(false);

  const load = async (silent = false, attempt = 0) => {
    setLoading(true);
    try {
      const res = await base44.functions.invoke('getQcOverviewReport', {});
      setReport(res.data);
    } catch (e) {
      // 429 rate limit — retry sekali lepas 2.5s. Silent mode tak tunjuk toast (auto-mount).
      const is429 = e?.response?.status === 429 || /rate limit/i.test(e?.message || '');
      if (is429 && attempt < 1) {
        setTimeout(() => load(silent, attempt + 1), 2500);
        return;
      }
      if (!silent && !is429) onToast?.('❌ Gagal load report: ' + e.message, false);
    }
    setLoading(false);
  };

  useEffect(() => { load(true); }, []);

  const sendCommand = async (cmd) => {
    setSending(true);
    try {
      let payload = {};
      if (cmd === 'audit') payload = { auditOnly: true, force: true };
      else if (cmd === 'repair') payload = { force: true };
      else if (cmd === 'custom') payload = { force: true, note: command };

      const res = await base44.functions.invoke('backgroundQualityControl', payload);
      onToast?.(`✅ Worker reply: ${res.data?.message || res.data?.status}`);
      await load();
      setCommand('');
    } catch (e) {
      onToast?.('❌ Command gagal: ' + e.message, false);
    }
    setSending(false);
  };

  if (!report && loading) {
    return (
      <div className="rounded-3xl p-6 border border-white/15 bg-white/5 flex items-center justify-center gap-3 text-white/80 text-sm font-bold">
        <Loader2 className="w-5 h-5 animate-spin" /> Loading report...
      </div>
    );
  }

  if (!report) return null;

  const { totals, subjectBuckets, miniBreakdown, storySummary, queue, health } = report;

  // Group subject buckets by subject
  const subjectsBySubject = {};
  for (const b of subjectBuckets) {
    if (!subjectsBySubject[b.subject]) subjectsBySubject[b.subject] = [];
    subjectsBySubject[b.subject].push(b);
  }

  return (
    <div className="w-full min-w-0 rounded-[1.5rem] md:rounded-[2rem] p-3 md:p-6 mb-5 shadow-2xl shadow-black/20" style={{ background: 'linear-gradient(135deg, rgba(168,85,247,0.18), rgba(59,130,246,0.10))', backdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.22)' }}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center">
            <ListChecks className="w-6 h-6 text-purple-200" />
          </div>
          <div>
            <h2 className="font-black text-white text-lg">📊 QC Overview Report</h2>
            <p className="text-white/60 text-xs font-semibold">Status keseluruhan & komunikasi dengan QC worker</p>
          </div>
        </div>
        <button onClick={load} disabled={loading} className="px-4 py-2 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-black border border-white/15 flex items-center gap-2 disabled:opacity-50">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />} Refresh
        </button>
      </div>

      {/* Top-level totals */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
        <StatTile icon={BookOpen} color="text-blue-200" label="Subject Games" value={totals.subjectGames} />
        <StatTile icon={Gamepad2} color="text-green-200" label="Mini Games" value={totals.miniGames} />
        <StatTile icon={Sparkles} color="text-pink-200" label="Story Kid" value={totals.storyKid} />
        <StatTile icon={ListChecks} color="text-amber-200" label="Queue Aktif" value={queue.active} sub={`${queue.failed} failed`} />
      </div>

      {/* Health alerts */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
        <HealthChip label="Subject buckets kosong" value={health.emptySubjectBuckets} total={health.totalSubjectBuckets} danger={health.emptySubjectBuckets > 0} />
        <HealthChip label="Subject buckets low" value={health.lowSubjectBuckets} total={health.totalSubjectBuckets} warn={health.lowSubjectBuckets > 0} />
        <HealthChip label="Mini categories kosong" value={health.emptyMiniBuckets} total={miniBreakdown.length} danger={health.emptyMiniBuckets > 0} />
      </div>

      {/* Subject Games breakdown */}
      <Section title="📚 Subject Games · per subject × darjah">
        <div className="space-y-1.5">
          {Object.entries(subjectsBySubject).map(([subject, buckets]) => (
            <div key={subject} className="flex items-center gap-2">
              <span className="text-white/80 text-xs font-black w-14 flex-shrink-0">{SUBJECT_LABELS[subject] || subject}</span>
              <div className="flex gap-1 flex-wrap">
                {buckets.map(b => (
                  <span key={b.level} className={`px-2 py-1 rounded-lg text-[10px] font-black border ${bucketColor(b)}`} title={`${subject} · ${b.level}: ${b.count} games`}>
                    {LEVEL_LABELS[b.level] || b.level}: {b.count}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Mini Games breakdown */}
      <Section title="🎮 Mini Games · per category">
        <div className="flex flex-wrap gap-1.5">
          {miniBreakdown.map(b => (
            <span key={b.category} className={`px-2 py-1 rounded-lg text-[10px] font-black border ${bucketColor(b)}`}>
              {b.category}: {b.count}
            </span>
          ))}
        </div>
      </Section>

      {/* Story Kid breakdown */}
      <Section title="📖 Story Kid">
        <div className="flex flex-wrap gap-1.5">
          <span className={`px-2 py-1 rounded-lg text-[10px] font-black border ${bucketColor({ empty: storySummary.empty, low: storySummary.low })}`}>
            Total: {storySummary.total}
          </span>
          <span className="px-2 py-1 rounded-lg text-[10px] font-black border bg-white/10 text-white/85 border-white/15">
            Prasekolah: {storySummary.prasekolah}
          </span>
          <span className="px-2 py-1 rounded-lg text-[10px] font-black border bg-white/10 text-white/85 border-white/15">
            Sekolah Rendah: {storySummary.sekolahRendah}
          </span>
        </div>
      </Section>

      {/* Communicate with worker */}
      <div className="rounded-2xl bg-white/8 border border-white/15 p-3 mt-3">
        <p className="text-white text-xs font-black uppercase tracking-wider mb-2 flex items-center gap-2">
          <Send className="w-3.5 h-3.5 text-cyan-200" /> Communicate dengan QC Worker
        </p>
        <div className="flex flex-col sm:flex-row gap-2">
          <button onClick={() => sendCommand('audit')} disabled={sending} className="px-3 py-2 rounded-xl bg-blue-400/90 text-blue-950 text-xs font-black disabled:opacity-50 flex items-center justify-center gap-1.5">
            {sending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : '🔍'} Audit Sekarang
          </button>
          <button onClick={() => sendCommand('repair')} disabled={sending} className="px-3 py-2 rounded-xl bg-green-400/90 text-green-950 text-xs font-black disabled:opacity-50 flex items-center justify-center gap-1.5">
            {sending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : '🛠️'} Force Repair
          </button>
        </div>
        <div className="mt-2 flex gap-2">
          <input
            type="text"
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            placeholder="Custom note untuk worker (e.g. focus darjah 4 BM)"
            className="flex-1 bg-white/10 border border-white/15 rounded-xl px-3 py-2 text-white text-xs placeholder-white/40 focus:outline-none focus:border-white/40"
          />
          <button onClick={() => sendCommand('custom')} disabled={sending || !command.trim()} className="px-3 py-2 rounded-xl bg-purple-400/90 text-purple-950 text-xs font-black disabled:opacity-50 flex items-center gap-1.5">
            <Send className="w-3.5 h-3.5" /> Hantar
          </button>
        </div>
        <p className="text-white/45 text-[10px] mt-2">Worker akan run repair + log note kau dalam QC history.</p>
      </div>
    </div>
  );
}

function StatTile({ icon: Icon, color, label, value, sub }) {
  return (
    <div className="rounded-2xl bg-white/10 border border-white/10 p-3">
      <div className="flex items-center gap-2 mb-1">
        <Icon className={`w-4 h-4 ${color}`} />
        <p className="text-white/60 text-[10px] font-black uppercase tracking-wider">{label}</p>
      </div>
      <p className="text-white text-2xl font-black leading-none">{value}</p>
      {sub && <p className="text-white/45 text-[10px] font-bold mt-1">{sub}</p>}
    </div>
  );
}

function HealthChip({ label, value, total, danger, warn }) {
  const tone = danger ? 'bg-red-500/20 text-red-100 border-red-300/30' : warn ? 'bg-yellow-500/20 text-yellow-100 border-yellow-300/30' : 'bg-green-500/15 text-green-100 border-green-300/25';
  return (
    <div className={`rounded-xl border px-3 py-2 ${tone}`}>
      <p className="text-[10px] font-black uppercase tracking-wider opacity-80">{label}</p>
      <p className="text-sm font-black">{value} / {total}</p>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="rounded-2xl bg-white/8 border border-white/10 p-3 mb-2">
      <p className="text-white text-xs font-black uppercase tracking-wider mb-2">{title}</p>
      {children}
    </div>
  );
}