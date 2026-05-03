import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wand2, FileText, BookOpen, ClipboardList, Loader2, Eye, Check, RefreshCw } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import AppHeader from '@/components/AppHeader';

const SUBJECTS = [
  { value: 'bahasa_melayu', label: '🇲🇾 Bahasa Melayu' },
  { value: 'english', label: '🇬🇧 English' },
  { value: 'mathematics', label: '🔢 Matematik' },
  { value: 'science', label: '🧪 Sains' },
  { value: 'jawi', label: '🕌 Jawi' },
  { value: 'pendidikan_islam', label: '☪️ Pendidikan Islam' },
  { value: 'pendidikan_moral', label: '🤝 Pendidikan Moral' },
  { value: 'sejarah', label: '🏰 Sejarah' },
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
  { value: 'lembaran_kerja', label: '📄 Lembaran Kerja', icon: FileText },
  { value: 'kuiz', label: '🧩 Kuiz', icon: ClipboardList },
  { value: 'rancangan_pengajaran', label: '📝 RPH', icon: BookOpen },
];

export default function AdminBBMGenerator() {
  const [form, setForm] = useState({
    subject: 'bahasa_melayu',
    level: 'darjah_1',
    type: 'lembaran_kerja',
    topic: '',
    count: 10,
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [previewOpen, setPreviewOpen] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await base44.functions.invoke('generateBBM', form);
      setResult(res.data);
    } catch (e) {
      setError(e.message || 'Gagal jana BBM');
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async () => {
    if (!result?.bbmId) return;
    await base44.entities.BBMResource.update(result.bbmId, { isPublished: true });
    setResult(prev => ({ ...prev, published: true }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      <AppHeader showBack={true} backTo="/admin-dashboard" />

      <div className="max-w-2xl mx-auto px-4 pt-8 pb-32">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 p-6 rounded-3xl"
          style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.2)' }}
        >
          <div className="flex items-center gap-3">
            <div className="text-5xl">🤖</div>
            <div>
              <h1 className="text-2xl font-black text-white">Jana BBM dengan AI</h1>
              <p className="text-white/60 text-sm">Generate lembaran kerja, kuiz & RPH automatik</p>
            </div>
          </div>
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-6 rounded-3xl mb-6"
          style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.2)' }}
        >
          {/* Type */}
          <div className="mb-5">
            <p className="text-white/70 text-xs font-black uppercase tracking-wider mb-2">Jenis BBM</p>
            <div className="grid grid-cols-3 gap-2">
              {TYPES.map(t => (
                <button
                  key={t.value}
                  onClick={() => setForm(f => ({ ...f, type: t.value }))}
                  className={`p-3 rounded-2xl text-sm font-bold transition-all text-center ${
                    form.type === t.value
                      ? 'bg-white text-indigo-700 shadow-lg'
                      : 'bg-white/10 text-white/70 hover:bg-white/20'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Subject */}
          <div className="mb-4">
            <p className="text-white/70 text-xs font-black uppercase tracking-wider mb-2">Subjek</p>
            <select
              value={form.subject}
              onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
              className="w-full p-3 rounded-2xl bg-white/10 text-white border border-white/20 font-semibold"
            >
              {SUBJECTS.map(s => <option key={s.value} value={s.value} className="text-black">{s.label}</option>)}
            </select>
          </div>

          {/* Level */}
          <div className="mb-4">
            <p className="text-white/70 text-xs font-black uppercase tracking-wider mb-2">Tahap</p>
            <select
              value={form.level}
              onChange={e => setForm(f => ({ ...f, level: e.target.value }))}
              className="w-full p-3 rounded-2xl bg-white/10 text-white border border-white/20 font-semibold"
            >
              {LEVELS.map(l => <option key={l.value} value={l.value} className="text-black">{l.label}</option>)}
            </select>
          </div>

          {/* Topic */}
          <div className="mb-4">
            <p className="text-white/70 text-xs font-black uppercase tracking-wider mb-2">Topik (opsional)</p>
            <input
              type="text"
              value={form.topic}
              onChange={e => setForm(f => ({ ...f, topic: e.target.value }))}
              placeholder="cth: Kata Adjektif, Nombor Bulat, Sistem Suria..."
              className="w-full p-3 rounded-2xl bg-white/10 text-white border border-white/20 placeholder-white/30 font-semibold"
            />
          </div>

          {/* Count (only for worksheet/quiz) */}
          {form.type !== 'rancangan_pengajaran' && (
            <div className="mb-4">
              <p className="text-white/70 text-xs font-black uppercase tracking-wider mb-2">Bilangan Soalan: <span className="text-yellow-300">{form.count}</span></p>
              <input
                type="range"
                min="5" max="20"
                value={form.count}
                onChange={e => setForm(f => ({ ...f, count: parseInt(e.target.value) }))}
                className="w-full"
              />
              <div className="flex justify-between text-white/40 text-xs mt-1">
                <span>5</span><span>10</span><span>15</span><span>20</span>
              </div>
            </div>
          )}

          {/* Generate Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleGenerate}
            disabled={loading}
            className="w-full py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-xl disabled:opacity-50"
          >
            {loading ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Jana sedang dalam proses... (~15 saat)</>
            ) : (
              <><Wand2 className="w-5 h-5" /> Jana BBM Sekarang!</>
            )}
          </motion.button>
        </motion.div>

        {/* Error */}
        {error && (
          <div className="p-4 rounded-2xl bg-red-500/20 border border-red-400/30 text-red-200 text-sm mb-4">
            ⚠️ {error}
          </div>
        )}

        {/* Result */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 rounded-3xl"
              style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.2)' }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                  <Check className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-white font-black">BBM Berjaya Dijana!</p>
                  <p className="text-white/60 text-xs">{result.title}</p>
                </div>
              </div>

              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setPreviewOpen(true)}
                  className="flex-1 py-3 rounded-2xl bg-white/10 text-white font-bold flex items-center justify-center gap-2 border border-white/20"
                >
                  <Eye className="w-4 h-4" /> Preview
                </motion.button>

                {!result.published ? (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handlePublish}
                    className="flex-1 py-3 rounded-2xl bg-green-500 text-white font-bold flex items-center justify-center gap-2"
                  >
                    <Check className="w-4 h-4" /> Publish ke BBM Hub
                  </motion.button>
                ) : (
                  <div className="flex-1 py-3 rounded-2xl bg-green-500/20 text-green-300 font-bold flex items-center justify-center gap-2 border border-green-400/30">
                    <Check className="w-4 h-4" /> Dah Published!
                  </div>
                )}
              </div>

              <button
                onClick={() => { setResult(null); }}
                className="w-full mt-3 py-2 text-white/50 text-sm flex items-center justify-center gap-2 hover:text-white/80"
              >
                <RefreshCw className="w-3 h-3" /> Jana Lagi
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Preview Modal */}
      <AnimatePresence>
        {previewOpen && result?.htmlContent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"
            onClick={() => setPreviewOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white rounded-3xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-4 border-b">
                <h3 className="font-black text-gray-800">Preview BBM</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      const win = window.open('', '_blank');
                      win.document.write(result.htmlContent);
                      win.document.close();
                      win.print();
                    }}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold text-sm"
                  >
                    🖨️ Print / Save PDF
                  </button>
                  <button onClick={() => setPreviewOpen(false)} className="px-4 py-2 bg-gray-100 rounded-xl font-bold text-sm">Tutup</button>
                </div>
              </div>
              <iframe
                srcDoc={result.htmlContent}
                className="flex-1 w-full"
                title="BBM Preview"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}