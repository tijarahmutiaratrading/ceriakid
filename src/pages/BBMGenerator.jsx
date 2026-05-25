import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, Loader2, FileText, RefreshCw, Printer } from 'lucide-react';
import AppHeader from '@/components/AppHeader';
import AIBackButton from '@/components/ai/AIBackButton';
import CreditBalanceWidget from '@/components/credits/CreditBalanceWidget';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import { CREDIT_COSTS } from '@/lib/creditPackages';

const SUBJECTS = [
  { value: 'bahasa_melayu', label: 'Bahasa Melayu', emoji: '📖' },
  { value: 'english', label: 'English', emoji: '🔤' },
  { value: 'mathematics', label: 'Matematik', emoji: '🔢' },
  { value: 'science', label: 'Sains', emoji: '🔬' },
  { value: 'jawi', label: 'Jawi', emoji: '✍️' },
  { value: 'pendidikan_islam', label: 'P. Islam', emoji: '🕌' },
  { value: 'sejarah', label: 'Sejarah', emoji: '📜' },
];

const LEVELS = [
  { value: 'prasekolah', label: 'Prasekolah' },
  { value: 'darjah_1', label: 'Darjah 1' },
  { value: 'darjah_2', label: 'Darjah 2' },
  { value: 'darjah_3', label: 'Darjah 3' },
  { value: 'darjah_4', label: 'Darjah 4' },
  { value: 'darjah_5', label: 'Darjah 5' },
  { value: 'darjah_6', label: 'Darjah 6' },
];

const TYPES = [
  { value: 'lembaran_kerja', label: 'Lembaran Kerja', emoji: '📝', desc: '8-12 soalan latihan' },
  { value: 'nota_ringkas', label: 'Nota Ringkas', emoji: '📒', desc: 'Ringkasan konsep' },
  { value: 'latihan_kbat', label: 'Latihan KBAT', emoji: '🧠', desc: 'Soalan aras tinggi' },
  { value: 'kuiz', label: 'Kuiz', emoji: '❓', desc: '10 soalan aneka pilihan' },
  { value: 'mind_map', label: 'Mind Map', emoji: '🗺️', desc: 'Peta minda visual' },
];

export default function BBMGenerator() {
  const { toast } = useToast();
  const [subject, setSubject] = useState('bahasa_melayu');
  const [level, setLevel] = useState('darjah_3');
  const [type, setType] = useState('lembaran_kerja');
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [bbm, setBbm] = useState(null);
  const [insufficient, setInsufficient] = useState(false);

  const handleGenerate = async () => {
    if (!topic.trim() || topic.trim().length < 3) {
      toast({ title: 'Sila masukkan tajuk/topik', variant: 'destructive' });
      return;
    }
    setLoading(true);
    setInsufficient(false);
    try {
      const res = await base44.functions.invoke('generateCustomBBM', { subject, level, type, topic: topic.trim() });
      if (res.data?.error === 'INSUFFICIENT_CREDITS') {
        setInsufficient(true);
        toast({ title: 'Kredit tidak mencukupi', description: `Diperlukan ${res.data.required} kredit`, variant: 'destructive' });
      } else if (res.data?.success) {
        setBbm(res.data.bbm);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        throw new Error(res.data?.error || 'Gagal menjana');
      }
    } catch (e) {
      toast({ title: 'Ralat', description: e.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => window.print();
  const handleReset = () => setBbm(null);

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #1a0b2e 0%, #2d1b4e 35%, #4a1d6e 70%, #6b1d52 100%)' }}>
      <div className="fixed inset-0 overflow-hidden pointer-events-none print:hidden">
        <div className="absolute -top-32 -left-24 w-[28rem] h-[28rem] bg-violet-500/40 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-24 w-[26rem] h-[26rem] bg-purple-500/35 rounded-full blur-3xl" />
      </div>

      <div className="md:hidden print:hidden">
        <AppHeader showBack={true} backTo="/dashboard" title="Penjana BBM AI" />
      </div>

      <div className="relative max-w-4xl mx-auto px-4 pt-24 md:pt-6 pb-32">
        <div className="hidden md:block mb-4 print:hidden">
          <AIBackButton to="/dashboard" label="Kembali ke Dashboard" />
        </div>

        <div className="print:hidden mb-4 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center shadow-lg">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-violet-300 text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Penjana BBM
              </p>
              <h1 className="text-xl md:text-2xl font-black text-white">Bahan Bantu Mengajar AI</h1>
            </div>
          </div>
          <CreditBalanceWidget compact />
        </div>

        {bbm ? (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-3xl p-6 md:p-10 shadow-2xl print:shadow-none print:rounded-none print:p-0">
            <div className="text-center mb-4 print:mb-2">
              <p className="text-5xl mb-2">{bbm.emoji || '📄'}</p>
              <h2 className="text-2xl font-black text-gray-900">{bbm.title}</h2>
            </div>
            <div
              className="bbm-content prose prose-base max-w-none text-gray-800"
              style={{ fontFamily: 'Arial, sans-serif', lineHeight: 1.6 }}
              dangerouslySetInnerHTML={{ __html: bbm.htmlContent }}
            />
            <div className="mt-6 flex gap-2 justify-center print:hidden">
              <button onClick={handleReset} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 font-black text-sm text-gray-700 transition-all">
                <RefreshCw className="w-4 h-4" /> BBM Baru
              </button>
              <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-500 hover:bg-violet-600 font-black text-sm text-white transition-all">
                <Printer className="w-4 h-4" /> Cetak / PDF
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pro-glass rounded-3xl p-5 md:p-6 space-y-4">
            {/* Subject */}
            <div>
              <label className="block text-white text-xs font-black mb-2">📚 Subjek</label>
              <div className="flex gap-1.5 flex-wrap">
                {SUBJECTS.map(s => (
                  <button key={s.value} onClick={() => setSubject(s.value)} className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1 ${subject === s.value ? 'bg-white text-game-purple shadow' : 'bg-white/15 text-white hover:bg-white/25'}`}>
                    <span>{s.emoji}</span> {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Level */}
            <div>
              <label className="block text-white text-xs font-black mb-2">🎓 Tahap</label>
              <div className="flex gap-1.5 flex-wrap">
                {LEVELS.map(l => (
                  <button key={l.value} onClick={() => setLevel(l.value)} className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${level === l.value ? 'bg-white text-game-purple shadow' : 'bg-white/15 text-white hover:bg-white/25'}`}>
                    {l.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Type */}
            <div>
              <label className="block text-white text-xs font-black mb-2">📄 Jenis BBM</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {TYPES.map(t => (
                  <button
                    key={t.value}
                    onClick={() => setType(t.value)}
                    className={`p-3 rounded-2xl text-left transition-all border-2 ${type === t.value ? 'bg-white text-game-purple border-white shadow' : 'bg-white/10 text-white border-white/20 hover:bg-white/20'}`}
                  >
                    <p className="text-xl mb-0.5">{t.emoji}</p>
                    <p className="font-black text-xs">{t.label}</p>
                    <p className="text-[10px] opacity-75 leading-tight">{t.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Topic */}
            <div>
              <label className="block text-white text-xs font-black mb-2">🎯 Tajuk / Topik *</label>
              <input
                type="text"
                value={topic}
                onChange={e => setTopic(e.target.value)}
                placeholder="Contoh: Pecahan Wajar, Sistem Suria, Kata Kerja"
                className="w-full bg-white/15 border border-white/25 rounded-xl px-4 py-3 text-white placeholder-white/40 text-sm font-semibold focus:outline-none focus:border-white/55"
              />
            </div>

            {insufficient && (
              <div className="bg-amber-400/20 border-2 border-amber-300/50 rounded-2xl p-3 flex items-center justify-between gap-3 flex-wrap">
                <p className="text-amber-200 text-xs font-bold">⚠️ Kredit tidak mencukupi</p>
                <Link to="/buy-credits" className="px-3 py-1.5 rounded-xl bg-amber-300 text-amber-950 font-black text-xs hover:bg-amber-200 transition-all">
                  Top Up →
                </Link>
              </div>
            )}

            <button
              onClick={handleGenerate}
              disabled={loading || !topic.trim()}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-violet-500 to-purple-600 text-white font-black text-base shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Sedang menjana BBM...</> : <><Sparkles className="w-5 h-5" /> Jana BBM ({CREDIT_COSTS.bbm_generator} kredit)</>}
            </button>
            <p className="text-center text-white/50 text-[10px] font-semibold">
              💡 BBM dijana selaras dengan sukatan KSSR/KSPK
            </p>
          </motion.div>
        )}
      </div>

      <style>{`
        @media print {
          body { background: white !important; }
          .bbm-content h1, .bbm-content h2, .bbm-content h3 { page-break-after: avoid; }
          .bbm-content table { page-break-inside: avoid; }
        }
        .bbm-content h1 { font-size: 1.5rem; font-weight: 800; margin: 0.5em 0; }
        .bbm-content h2 { font-size: 1.25rem; font-weight: 700; margin: 0.75em 0 0.25em; color: #5b21b6; }
        .bbm-content h3 { font-size: 1.1rem; font-weight: 700; margin: 0.5em 0 0.25em; }
        .bbm-content ol, .bbm-content ul { padding-left: 1.5rem; margin: 0.5em 0; }
        .bbm-content li { margin: 0.25em 0; }
        .bbm-content table { width: 100%; border-collapse: collapse; margin: 0.5em 0; }
        .bbm-content th, .bbm-content td { border: 1px solid #d1d5db; padding: 0.5rem; text-align: left; }
        .bbm-content th { background: #f3e8ff; font-weight: 700; }
      `}</style>
    </div>
  );
}