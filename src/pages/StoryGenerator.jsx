import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { Sparkles, Loader2, BookOpen, RefreshCw, Printer, FileText, User, Cake, Heart, Ruler, Lightbulb, AlertTriangle } from 'lucide-react';
import AppHeader from '@/components/AppHeader';
import AIBackButton from '@/components/ai/AIBackButton';
import CreditBalanceWidget from '@/components/credits/CreditBalanceWidget';
import MyStoryLibrary from '@/components/ai/MyStoryLibrary';
import { Library } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { CREDIT_COSTS } from '@/lib/creditPackages';

const AGE_OPTIONS = [
  { value: '4-6', label: 'Prasekolah (4-6)' },
  { value: '7-9', label: 'Darjah 1-3 (7-9)' },
  { value: '10-12', label: 'Darjah 4-6 (10-12)' },
];

const LENGTH_OPTIONS = [
  { value: 'short', label: 'Pendek' },
  { value: 'medium', label: 'Sederhana' },
  { value: 'long', label: 'Panjang' },
];

const MORAL_OPTIONS = [
  { value: 'kejujuran', label: 'Kejujuran' },
  { value: 'persahabatan', label: 'Persahabatan' },
  { value: 'keberanian', label: 'Keberanian' },
  { value: 'kasih_sayang', label: 'Kasih Sayang' },
  { value: 'kerajinan', label: 'Kerajinan' },
  { value: 'tolong_menolong', label: 'Tolong-Menolong' },
  { value: 'menghormati', label: 'Menghormati' },
  { value: 'sabar', label: 'Kesabaran' },
];

const THEME_SUGGESTIONS = [
  'Pengembaraan di hutan ajaib 🌳',
  'Robot kecil belajar berkawan 🤖',
  'Putera/Puteri yang berani ⚔️',
  'Ikan mas yang hilang dalam laut 🐠',
  'Kucing comel jadi detektif 🔍',
];

export default function StoryGenerator() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [theme, setTheme] = useState('');
  const [childName, setChildName] = useState('');
  const [ageRange, setAgeRange] = useState('7-9');
  const [moralLesson, setMoralLesson] = useState('persahabatan');
  const [length, setLength] = useState('medium');
  const [loading, setLoading] = useState(false);
  const [story, setStory] = useState(null);
  const [insufficient, setInsufficient] = useState(false);
  const [activeTab, setActiveTab] = useState('generate'); // 'generate' | 'library'
  const [libraryRefresh, setLibraryRefresh] = useState(0);

  const handleGenerate = async () => {
    if (!theme.trim() || theme.trim().length < 3) {
      toast({ title: 'Sila masukkan tema cerita', variant: 'destructive' });
      return;
    }
    setLoading(true);
    setInsufficient(false);
    try {
      const res = await base44.functions.invoke('generateAIStory', {
        theme: theme.trim(),
        childName: childName.trim(),
        ageRange,
        moralLesson,
        length,
      });
      if (res.data?.error === 'INSUFFICIENT_CREDITS') {
        setInsufficient(true);
        toast({ title: 'Kredit tidak mencukupi', description: `Diperlukan ${res.data.required} kredit`, variant: 'destructive' });
      } else if (res.data?.success) {
        setStory(res.data.story);
        setLibraryRefresh(k => k + 1);
        // Notify CreditBalanceWidget supaya auto-refresh
        if (typeof res.data.newBalance === 'number') {
          window.dispatchEvent(new CustomEvent('credit-updated', {
            detail: { newBalance: res.data.newBalance, amountUsed: res.data.creditsUsed || 5 },
          }));
        }
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
  const handleReset = () => setStory(null);

  return (
    <div className="relative min-h-screen print:bg-white">
      <div className="md:hidden print:hidden">
        <AppHeader showBack={true} backTo="/dashboard" title="Penjana Cerita AI" />
      </div>

      <div className="relative max-w-5xl mx-auto page-px pt-4 pb-32">
        <div className="mb-4 print:hidden">
          <AIBackButton to="/dashboard" label="Kembali ke Dashboard" />
        </div>

        {/* Header */}
        <div className="print:hidden mb-4 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <img
              src="https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/d2061d998_generated_image.png"
              alt="Cikgu Mira"
              className="w-14 h-14 rounded-2xl object-cover ring-2 ring-white/40 shadow-lg bg-gradient-to-br from-pink-400 to-rose-500"
            />
            <div>
              <p className="text-pink-600 text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Bersama Cikgu Mira
              </p>
              <h1 className="text-xl md:text-2xl font-black text-slate-900">Penjana Cerita AI</h1>
            </div>
          </div>
          <CreditBalanceWidget compact />
        </div>

        {/* Tab switcher */}
        <div className="print:hidden bg-white/80 backdrop-blur-md border border-slate-200 shadow-sm rounded-2xl p-1.5 mb-4 grid grid-cols-2 gap-1.5">
          <button
            onClick={() => { setActiveTab('generate'); setStory(null); }}
            className={`py-2.5 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all ${
              activeTab === 'generate' ? 'bg-gradient-to-br from-pink-500 to-rose-600 text-white shadow' : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <Sparkles className="w-4 h-4" /> Jana Cerita
          </button>
          <button
            onClick={() => setActiveTab('library')}
            className={`py-2.5 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all ${
              activeTab === 'library' ? 'bg-gradient-to-br from-pink-500 to-rose-600 text-white shadow' : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <Library className="w-4 h-4" /> Koleksi Saya
          </button>
        </div>

        {/* Story result */}
        {activeTab === 'library' ? (
          <MyStoryLibrary refreshKey={libraryRefresh} />
        ) : story ? (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-3xl p-6 md:p-8 shadow-2xl mb-4 print:shadow-none print:rounded-none">
            {story.coverImage && (
              <div className="mb-6 rounded-2xl overflow-hidden shadow-xl print:shadow-none">
                <img src={story.coverImage} alt={story.title} className="w-full h-auto object-cover" />
              </div>
            )}
            <div className="text-center mb-6">
              {!story.coverImage && <p className="text-6xl mb-3">{story.emoji || '📖'}</p>}
              <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-2">{story.title}</h2>
              <p className="text-sm text-gray-500 italic">{story.moralSummary}</p>
            </div>
            <div className="prose prose-base max-w-none text-gray-800 leading-relaxed">
              <ReactMarkdown>{story.story}</ReactMarkdown>
            </div>
            <div className="mt-6 flex gap-2 justify-center print:hidden">
              <button onClick={handleReset} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 font-black text-sm text-gray-700 transition-all">
                <RefreshCw className="w-4 h-4" /> Cerita Baru
              </button>
              <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-pink-500 hover:bg-pink-600 font-black text-sm text-white transition-all">
                <Printer className="w-4 h-4" /> Cetak / PDF
              </button>
            </div>
          </motion.div>
        ) : (
          // Form
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white/80 backdrop-blur-md border border-slate-200 shadow-sm rounded-3xl p-5 md:p-6 space-y-4">
            <div>
              <label className="block text-slate-700 text-xs font-black mb-2 flex items-center gap-1.5"><FileText className="w-3 h-3" strokeWidth={3} /> Tema Cerita *</label>
              <input
                type="text"
                value={theme}
                onChange={e => setTheme(e.target.value)}
                placeholder="Contoh: Arnab pintar menyelamatkan hutan"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 text-sm font-semibold focus:outline-none focus:bg-white focus:border-pink-400"
              />
              <div className="flex flex-wrap gap-1.5 mt-2">
                {THEME_SUGGESTIONS.map((s, i) => (
                  <button key={i} onClick={() => setTheme(s.replace(/[\s🌳🤖⚔️🐠🔍]+$/, '').trim())} className="px-2.5 py-1 rounded-full bg-pink-50 hover:bg-pink-100 text-pink-700 text-[11px] font-semibold transition-all border border-pink-200">
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-slate-700 text-xs font-black mb-2 flex items-center gap-1.5"><User className="w-3 h-3" strokeWidth={3} /> Nama Watak Utama (pilihan)</label>
              <input
                type="text"
                value={childName}
                onChange={e => setChildName(e.target.value)}
                placeholder="Contoh: Aisyah / Aiman"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 text-sm font-semibold focus:outline-none focus:bg-white focus:border-pink-400"
              />
            </div>

            <div>
              <label className="block text-slate-700 text-xs font-black mb-2 flex items-center gap-1.5"><Cake className="w-3 h-3" strokeWidth={3} /> Umur Pembaca</label>
              <div className="flex gap-1.5 flex-wrap">
                {AGE_OPTIONS.map(o => (
                  <button key={o.value} onClick={() => setAgeRange(o.value)} className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${ageRange === o.value ? 'bg-gradient-to-br from-pink-500 to-rose-600 text-white shadow' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>
                    {o.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-slate-700 text-xs font-black mb-2 flex items-center gap-1.5"><Heart className="w-3 h-3" strokeWidth={3} fill="currentColor" /> Pengajaran Moral</label>
              <div className="flex gap-1.5 flex-wrap">
                {MORAL_OPTIONS.map(o => (
                  <button key={o.value} onClick={() => setMoralLesson(o.value)} className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${moralLesson === o.value ? 'bg-gradient-to-br from-pink-500 to-rose-600 text-white shadow' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>
                    {o.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-slate-700 text-xs font-black mb-2 flex items-center gap-1.5"><Ruler className="w-3 h-3" strokeWidth={3} /> Panjang Cerita</label>
              <div className="flex gap-1.5">
                {LENGTH_OPTIONS.map(o => (
                  <button key={o.value} onClick={() => setLength(o.value)} className={`flex-1 px-3 py-1.5 rounded-xl text-xs font-black transition-all ${length === o.value ? 'bg-gradient-to-br from-pink-500 to-rose-600 text-white shadow' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>
                    {o.label}
                  </button>
                ))}
              </div>
            </div>

            {insufficient && (
              <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-3 flex items-center justify-between gap-3 flex-wrap">
                <p className="text-amber-800 text-xs font-bold flex items-center gap-1.5"><AlertTriangle className="w-3.5 h-3.5" strokeWidth={3} /> Kredit tidak mencukupi</p>
                <Link to="/buy-credits" className="px-3 py-1.5 rounded-xl bg-amber-500 text-white font-black text-xs hover:bg-amber-600 transition-all">
                  Top Up →
                </Link>
              </div>
            )}

            <button
              onClick={handleGenerate}
              disabled={loading || !theme.trim()}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-600 text-white font-black text-base shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Sedang mencipta cerita...</> : <><Sparkles className="w-5 h-5" /> Jana Cerita ({CREDIT_COSTS.story_generator} kredit)</>}
            </button>
            <p className="text-center text-slate-500 text-[10px] font-semibold flex items-center justify-center gap-1">
              <Lightbulb className="w-3 h-3 text-amber-500" strokeWidth={3} /> Cerita unik dijana AI khas untuk anak anda
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}