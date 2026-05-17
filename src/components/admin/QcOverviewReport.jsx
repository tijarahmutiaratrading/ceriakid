import React, { useEffect, useState } from 'react';
import { Loader2, RefreshCw, BookOpen, Gamepad2, Sparkles, ListChecks } from 'lucide-react';
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

const MINI_LABELS = {
  memory_master: 'Memory Master',
  logic_puzzles: 'Logic Puzzles',
  speed_focus: 'Speed Focus',
  pattern_genius: 'Pattern Genius',
  maze_adventure: 'Maze Adventure',
  creative_builder: 'Creative Builder',
  problem_solver: 'Problem Solver',
  brain_training: 'Brain Training',
  memory: 'Memory',
  dragdrop: 'Drag & Drop',
  wordbuilder: 'Word Builder',
  sorting: 'Sorting',
  tilematch: 'Tile Match',
  story: 'Story',
  physics: 'Physics',
  tracing: 'Tracing',
};

const GENIUS_MINI = new Set(['memory_master', 'logic_puzzles', 'speed_focus', 'pattern_genius', 'maze_adventure', 'creative_builder', 'problem_solver', 'brain_training']);

function bucketColor(b, count, cap) {
  if (b.empty || count === 0) return 'bg-red-500/30 text-red-100 border-red-300/40';
  if (cap && count >= cap) return 'bg-purple-500/25 text-purple-100 border-purple-300/40';
  if (cap && count >= cap * 0.9) return 'bg-orange-500/25 text-orange-100 border-orange-300/40';
  if (b.low) return 'bg-yellow-500/25 text-yellow-100 border-yellow-300/40';
  return 'bg-green-500/20 text-green-100 border-green-300/30';
}

export default function QcOverviewReport({ onToast }) {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);

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

  if (!report && loading) {
    return (
      <div className="rounded-3xl p-6 border border-white/15 bg-white/5 flex items-center justify-center gap-3 text-white/80 text-sm font-bold">
        <Loader2 className="w-5 h-5 animate-spin" /> Loading report...
      </div>
    );
  }

  if (!report) {
    return (
      <div className="rounded-3xl p-6 border border-white/15 bg-white/5 text-center text-white/70 text-sm font-bold">
        <p className="mb-3">Belum ada data report.</p>
        <button onClick={() => load(false)} className="px-4 py-2 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-black border border-white/15 inline-flex items-center gap-2">
          <RefreshCw className="w-4 h-4" /> Load Report
        </button>
      </div>
    );
  }

  const { totals, subjectBuckets, miniBreakdown, storySummary, queue, health, qcSetting } = report;
  const subjectCap = qcSetting?.subjectCap || 30;
  const miniCap = qcSetting?.miniGameCap || 30;
  const storyCap = qcSetting?.storyKidCap || 30;

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
            <p className="text-white/60 text-xs font-semibold">Status game library & queue di seluruh platform</p>
          </div>
        </div>
        <button onClick={() => load(false)} disabled={loading} className="px-4 py-2 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-black border border-white/15 flex items-center gap-2 disabled:opacity-50">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />} Refresh
        </button>
      </div>

      {/* Color legend */}
      <div className="flex flex-wrap gap-1.5 mb-3 px-1">
        <LegendChip color="bg-red-500/30 border-red-300/40" label="Kosong" />
        <LegendChip color="bg-yellow-500/25 border-yellow-300/40" label="Low" />
        <LegendChip color="bg-green-500/20 border-green-300/30" label="OK" />
        <LegendChip color="bg-orange-500/25 border-orange-300/40" label="≥90%" />
        <LegendChip color="bg-purple-500/25 border-purple-300/40" label="At cap" />
      </div>

      {/* Top-level totals */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
        <StatTile icon={BookOpen} color="text-blue-200" label="Subject Games" value={totals.subjectGames} />
        <StatTile icon={Gamepad2} color="text-green-200" label="Mini Games" value={totals.miniGames} />
        <StatTile icon={Sparkles} color="text-pink-200" label="Story Kid" value={totals.storyKid} />
        <StatTile icon={ListChecks} color="text-amber-200" label="Queue Aktif" value={queue.active} sub={`${queue.failed} failed`} />
      </div>

      {/* Subject Games breakdown */}
      <Section title="📚 Subject Games · per subject × darjah">
        <div className="space-y-1.5">
          {Object.entries(subjectsBySubject).map(([subject, buckets]) => (
            <div key={subject} className="flex items-center gap-2">
              <span className="text-white/80 text-xs font-black w-14 flex-shrink-0">{SUBJECT_LABELS[subject] || subject}</span>
              <div className="flex gap-1 flex-wrap">
                {buckets.map(b => (
                  <span key={b.level} className={`px-2 py-1 rounded-lg text-[10px] font-black border ${bucketColor(b, b.count, subjectCap)}`} title={`${subject} · ${b.level}: ${b.count}/${subjectCap} games`}>
                    {LEVEL_LABELS[b.level] || b.level}: {b.count}/{subjectCap}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Mini Games breakdown — grouped Genius vs Legacy */}
      <Section title={`🎮 Mini Games · per category (cap ${miniCap})`}>
        {(() => {
          const genius = miniBreakdown.filter(b => GENIUS_MINI.has(b.category));
          const legacy = miniBreakdown.filter(b => !GENIUS_MINI.has(b.category));
          return (
            <div className="space-y-2">
              {genius.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-white/65 text-[10px] font-black uppercase w-14 flex-shrink-0">Genius</span>
                  <div className="flex gap-1 flex-wrap">
                    {genius.map(b => (
                      <span key={b.category} className={`px-2 py-1 rounded-lg text-[10px] font-black border ${bucketColor(b, b.count, miniCap)}`}>
                        {MINI_LABELS[b.category] || b.category}: {b.count}/{miniCap}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {legacy.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-white/65 text-[10px] font-black uppercase w-14 flex-shrink-0">Legacy</span>
                  <div className="flex gap-1 flex-wrap">
                    {legacy.map(b => (
                      <span key={b.category} className={`px-2 py-1 rounded-lg text-[10px] font-black border ${bucketColor(b, b.count, miniCap)}`}>
                        {MINI_LABELS[b.category] || b.category}: {b.count}/{miniCap}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })()}
      </Section>

      {/* Story Kid breakdown */}
      <Section title={`📖 Story Kid (cap ${storyCap})`}>
        <div className="flex flex-wrap gap-1.5">
          <span className={`px-2 py-1 rounded-lg text-[10px] font-black border ${bucketColor({ empty: storySummary.empty, low: storySummary.low }, storySummary.total, storyCap)}`}>
            Total: {storySummary.total}/{storyCap}
          </span>
          <span className="px-2 py-1 rounded-lg text-[10px] font-black border bg-white/10 text-white/85 border-white/15">
            Prasekolah: {storySummary.prasekolah}
          </span>
          <span className="px-2 py-1 rounded-lg text-[10px] font-black border bg-white/10 text-white/85 border-white/15">
            Sekolah Rendah: {storySummary.sekolahRendah}
          </span>
        </div>
      </Section>

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

function LegendChip({ color, label }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider border ${color} text-white/85`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" /> {label}
    </span>
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