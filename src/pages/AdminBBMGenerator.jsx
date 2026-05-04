import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wand2, FileText, Loader2, Check, RefreshCw, Trash2, ToggleLeft, ToggleRight, Search, Edit3 } from 'lucide-react';
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
  { value: 'lembaran_kerja', label: '📄 Lembaran Kerja' },
  { value: 'kuiz', label: '🧩 Kuiz' },
  { value: 'rancangan_pengajaran', label: '📝 RPH' },
  { value: 'kad_imbasan', label: '🃏 Kad Imbasan' },
  { value: 'carta', label: '📊 Carta' },
  { value: 'modul', label: '📦 Modul' },
  { value: 'aktiviti', label: '🎯 Aktiviti' },
  { value: 'permainan_bilik_darjah', label: '🎲 Permainan' },
];

const TYPE_LABELS = Object.fromEntries(TYPES.map(t => [t.value, t.label]));
const LEVEL_LABELS = Object.fromEntries(LEVELS.map(l => [l.value, l.label]));
const SUBJECT_LABELS = Object.fromEntries(SUBJECTS.map(s => [s.value, s.label]));

export default function AdminBBMGenerator() {
  const [tab, setTab] = useState('generator');

  // Generator state
  const [form, setForm] = useState({ subject: 'bahasa_melayu', level: 'darjah_1', type: 'lembaran_kerja', topic: '', count: 10 });
  const [selectedSubjects, setSelectedSubjects] = useState(new Set(['bahasa_melayu']));
  const [selectedLevels, setSelectedLevels] = useState(new Set(['darjah_1']));
  const [selectedTypes, setSelectedTypes] = useState(new Set(['lembaran_kerja']));
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  // Manager state
  const [resources, setResources] = useState([]);
  const [loadingResources, setLoadingResources] = useState(false);
  const [search, setSearch] = useState('');
  const [filterSubject, setFilterSubject] = useState('all');
  const [toast, setToast] = useState(null);
  const [editItem, setEditItem] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(false);

  const showToast = (msg, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  };

  const loadResources = async () => {
    setLoadingResources(true);
    try {
      const data = await base44.entities.BBMResource.list('-created_date', 200);
      setResources(data);
    } catch (e) {
      showToast('Gagal load BBM', false);
    } finally {
      setLoadingResources(false);
    }
  };

  const loadTasks = async () => {
    setLoadingTasks(true);
    try {
      const data = await base44.entities.GameTask.list('-created_date', 100);
      // Filter only BBM-related tasks (taskName contains 'BBM' or 'Bahan Bantu')
      const bbmTasks = data.filter(t => t.taskName?.toLowerCase().includes('bbm') || t.taskName?.toLowerCase().includes('bahan bantu'));
      setTasks(bbmTasks);
    } catch (e) {
      console.error('Gagal load tasks:', e);
    } finally {
      setLoadingTasks(false);
    }
  };

  useEffect(() => {
    if (tab === 'manager') {
      loadResources();
      loadTasks();
    }
  }, [tab]);

  const generateBbmDirect = async ({ subject, level, type, topic, count, autoPublish }) => {
    const typeInfo = TYPES.find(t => t.value === type) || { label: type };
    const subjectLabel = SUBJECT_LABELS[subject] || subject;
    const levelLabel = LEVEL_LABELS[level] || level;

    const data = await base44.integrations.Core.InvokeLLM({
      prompt: `Anda ialah guru pakar KSSR/DSKP Malaysia. Jana ${typeInfo.label} lengkap, berkualiti dan siap cetak A4 untuk ${subjectLabel} ${levelLabel}. Topik: ${topic || 'umum'}. Bilangan item/soalan: ${count}. Wajib ada objektif pembelajaran jelas, arahan murid yang mudah, kandungan selari tahap umur, soalan pelbagai aras mudah-sederhana, contoh tempatan Malaysia, jawapan/skema ringkas, tiada placeholder dan tiada fakta meragukan. DILARANG guna heading seperti "Soalan 1", "Item", "Gambar di bawah", atau arahan yang perlukan imej jika tiada imej sebenar. Setiap heading mesti menerangkan kemahiran khusus seperti "Kenal Pasti Kata Nama Am". Pulangkan JSON sahaja: title, description, instructions, items[{heading,content,answer}].`,
      response_json_schema: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          description: { type: 'string' },
          instructions: { type: 'string' },
          items: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                heading: { type: 'string' },
                content: { type: 'string' },
                answer: { type: 'string' },
              },
            },
          },
        },
      },
    });

    const items = Array.isArray(data.items) ? data.items : [];
    const htmlContent = `<!DOCTYPE html><html lang="ms"><head><meta charset="UTF-8"><style>body{font-family:Arial,sans-serif;max-width:820px;margin:auto;padding:24px;color:#1f2937;line-height:1.45}h1{text-align:center;color:#4f46e5}h2{text-align:center;color:#64748b;font-size:14px}.meta{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin:20px 0}.box,.item{border:1px solid #c7d2fe;border-radius:12px;padding:12px}.box{background:#eef2ff}.item{margin:14px 0;border-left:5px solid #6366f1;background:#fafafa;break-inside:avoid}.answer{color:#047857;font-weight:bold}footer{text-align:center;color:#64748b;font-size:11px;margin-top:28px;border-top:1px solid #eee;padding-top:12px}@media print{body{padding:12px}.item{page-break-inside:avoid}}</style></head><body><h1>${data.title || typeInfo.label}</h1><h2>${subjectLabel} | ${levelLabel} | ${typeInfo.label}</h2><div class="meta"><div class="box">Nama: ____________</div><div class="box">Kelas: ____________</div><div class="box">Tarikh: ____________</div></div><div class="box"><b>Arahan:</b> ${data.instructions || 'Gunakan bahan ini semasa pembelajaran.'}</div>${items.map((item, i) => `<section class="item"><h3>${i + 1}. ${item.heading || 'Item'}</h3><p>${item.content || ''}</p>${item.answer ? `<p class="answer">Jawapan/Nota: ${item.answer}</p>` : ''}</section>`).join('')}<footer>CeriaKid Educational Platform | Malaysia</footer></body></html>`;

    const saved = await base44.entities.BBMResource.create({
      title: data.title || `${typeInfo.label} - ${subjectLabel}`,
      description: data.description || `Jana AI | ${topic || 'Umum'}`,
      subject,
      level,
      type,
      emoji: typeInfo.label?.split(' ')[0] || '📄',
      tier: 'free',
      downloadCount: 0,
      isPublished: Boolean(autoPublish),
      tags: [subjectLabel, levelLabel, typeInfo.label, topic || 'AI'],
      htmlContent,
    });

    return { data: { success: true, bbmId: saved.id, title: saved.title } };
  };

  // Generator
  const handleGenerate = async () => {
    setLoading(true);
    setError('');
    setResult(null);
    const total = selectedSubjects.size * selectedLevels.size * selectedTypes.size;
    let createdCount = 0;
    try {
      for (const subject of selectedSubjects) {
        for (const level of selectedLevels) {
          for (const type of selectedTypes) {
            const res = await generateBbmDirect({ 
              subject, level, type, 
              topic: form.topic, 
              count: form.count,
              autoPublish: true
            });
            if (res.data?.success) createdCount++;
          }
        }
      }
      setResult({ success: true, total, createdCount, title: `${createdCount}/${total} BBM berkualitas tinggi dijana & dipublish` });
      loadResources();
    } catch (e) {
      setError(e.message || 'Gagal jana BBM');
    } finally {
      setLoading(false);
    }
  };

  // Manager actions
  const handleTogglePublish = async (item) => {
    await base44.entities.BBMResource.update(item.id, { isPublished: !item.isPublished });
    setResources(prev => prev.map(r => r.id === item.id ? { ...r, isPublished: !r.isPublished } : r));
    showToast(item.isPublished ? 'BBM disembunyikan' : 'BBM dipublish');
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Padam "${item.title}"?`)) return;
    await base44.entities.BBMResource.delete(item.id);
    setResources(prev => prev.filter(r => r.id !== item.id));
    showToast('BBM dipadam');
  };

  const handleSaveEdit = async () => {
    if (!editItem) return;
    await base44.entities.BBMResource.update(editItem.id, {
      title: editItem.title,
      description: editItem.description,
      tier: editItem.tier,
      isPublished: editItem.isPublished,
    });
    setResources(prev => prev.map(r => r.id === editItem.id ? { ...r, ...editItem } : r));
    setEditItem(null);
    showToast('BBM dikemaskini');
  };

  const filtered = resources.filter(r => {
    const matchSearch = !search || r.title?.toLowerCase().includes(search.toLowerCase());
    const matchSubject = filterSubject === 'all' || r.subject === filterSubject;
    return matchSearch && matchSubject;
  });

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-950 via-indigo-950 to-fuchsia-950">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.12) 1px, transparent 0)', backgroundSize: '28px 28px' }} />
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-fuchsia-500 rounded-full mix-blend-screen filter blur-3xl opacity-25 animate-pulse" />
        <div className="absolute top-1/3 -left-20 w-80 h-80 bg-blue-500 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-violet-500 rounded-full mix-blend-screen filter blur-3xl opacity-15 animate-pulse" style={{ animationDelay: '2s' }} />
      </div>
      <AppHeader showBack={true} backTo="/admin-dashboard" />

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-5 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl shadow-xl font-bold text-white text-sm ${toast.ok ? 'bg-green-500' : 'bg-red-500'}`}
          >
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative max-w-6xl mx-auto px-4 md:px-6 pt-28 md:pt-32 pb-32 space-y-7">
        {/* Header */}
         <motion.div
           initial={{ opacity: 0, y: -20 }}
           animate={{ opacity: 1, y: 0 }}
           className="mb-7 p-5 md:p-7 rounded-[2rem] flex flex-col md:flex-row md:items-center md:justify-between gap-5 shadow-2xl shadow-fuchsia-950/30"
           style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.18), rgba(255,255,255,0.07))', backdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.25)' }}
         >
           <div className="flex items-center gap-4 min-w-0">
             <div className="w-14 h-14 md:w-16 md:h-16 flex-shrink-0 rounded-3xl bg-gradient-to-br from-cyan-300 via-blue-400 to-fuchsia-500 flex items-center justify-center text-2xl md:text-3xl shadow-xl shadow-purple-950/30 ring-1 ring-white/30 leading-none">📚</div>
             <div className="min-w-0">
               <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-white/70 text-[11px] font-black uppercase tracking-wider mb-2">Premium BBM Studio</div>
               <h1 className="text-2xl md:text-4xl font-black text-white tracking-tight">BBM Generator & Manager</h1>
               <p className="text-white/75 text-sm">Jana dan urus Bahan Bantu Mengajar dengan lebih pantas, kemas dan profesional.</p>
             </div>
           </div>
           <div className="grid grid-cols-3 gap-2 w-full md:w-auto md:min-w-80">
             <div className="rounded-2xl bg-white/10 border border-white/15 p-3 text-center"><p className="text-white font-black text-lg">{resources.length}</p><p className="text-white/60 text-[11px] font-bold">Total</p></div>
             <div className="rounded-2xl bg-white/10 border border-white/15 p-3 text-center"><p className="text-white font-black text-lg">{resources.filter(r => r.isPublished !== false).length}</p><p className="text-white/60 text-[11px] font-bold">Published</p></div>
             <div className="rounded-2xl bg-white/10 border border-white/15 p-3 text-center"><p className="text-white font-black text-lg">{tasks.length}</p><p className="text-white/60 text-[11px] font-bold">Tasks</p></div>
           </div>
         </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 p-1.5 rounded-3xl overflow-x-auto shadow-xl shadow-black/10" style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(18px)', border: '1px solid rgba(255,255,255,0.16)' }}>
          {[
            { id: 'generator', label: '🤖 Generator', icon: Wand2 },
            { id: 'manager', label: '📋 Manager', icon: FileText },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 py-3 px-3 rounded-2xl font-black text-sm transition-all whitespace-nowrap ${
                tab === t.id ? 'bg-white text-indigo-800 shadow-lg' : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* GENERATOR TAB */}
        {tab === 'generator' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div
              className="p-5 md:p-7 rounded-[2rem] mb-6 shadow-2xl shadow-black/20"
              style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.16), rgba(255,255,255,0.07))', backdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.22)' }}
            >
              {/* Type */}
              <div className="mb-5">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-white text-xs font-black uppercase tracking-wider">Jenis BBM</p>
                  <div className="flex gap-1">
                    <button onClick={() => setSelectedTypes(new Set(TYPES.map(t => t.value)))} className="text-xs text-yellow-300 hover:underline">Semua</button>
                    <button onClick={() => setSelectedTypes(new Set())} className="text-xs text-white/50 hover:underline">Kosong</button>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                   {TYPES.map(t => {
                    const sel = selectedTypes.has(t.value);
                    return (
                      <button
                        key={t.value}
                        onClick={() => {
                          const next = new Set(selectedTypes);
                          sel ? next.delete(t.value) : next.add(t.value);
                          setSelectedTypes(next);
                        }}
                        className={`p-3 rounded-2xl text-xs font-black transition-all text-center border ${
                          sel ? 'bg-white text-indigo-800 shadow-lg border-white' : 'bg-white/10 text-white/75 hover:bg-white/20 border-white/10'
                        }`}
                      >
                        {t.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Subject */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-white text-xs font-black uppercase tracking-wider">Subjek</p>
                  <div className="flex gap-1">
                    <button onClick={() => setSelectedSubjects(new Set(SUBJECTS.map(s => s.value)))} className="text-xs text-yellow-300 hover:underline">Semua</button>
                    <button onClick={() => setSelectedSubjects(new Set())} className="text-xs text-white/50 hover:underline">Kosong</button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {SUBJECTS.map(s => {
                    const sel = selectedSubjects.has(s.value);
                    return (
                      <button
                        key={s.value}
                        onClick={() => {
                          const next = new Set(selectedSubjects);
                          sel ? next.delete(s.value) : next.add(s.value);
                          setSelectedSubjects(next);
                        }}
                        className={`p-3 rounded-2xl text-xs font-black transition-all text-center border ${
                          sel ? 'bg-white text-indigo-800 shadow-lg border-white' : 'bg-white/10 text-white/75 hover:bg-white/20 border-white/10'
                        }`}
                      >
                        {s.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Level */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-white text-xs font-black uppercase tracking-wider">Tahap</p>
                  <div className="flex gap-1">
                    <button onClick={() => setSelectedLevels(new Set(LEVELS.map(l => l.value)))} className="text-xs text-yellow-300 hover:underline">Semua</button>
                    <button onClick={() => setSelectedLevels(new Set())} className="text-xs text-white/50 hover:underline">Kosong</button>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                   {LEVELS.map(l => {
                    const sel = selectedLevels.has(l.value);
                    return (
                      <button
                        key={l.value}
                        onClick={() => {
                          const next = new Set(selectedLevels);
                          sel ? next.delete(l.value) : next.add(l.value);
                          setSelectedLevels(next);
                        }}
                        className={`p-3 rounded-2xl text-xs font-black transition-all text-center border ${
                          sel ? 'bg-white text-indigo-800 shadow-lg border-white' : 'bg-white/10 text-white/75 hover:bg-white/20 border-white/10'
                        }`}
                      >
                        {l.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Topic */}
              <div className="mb-4">
                <p className="text-white text-xs font-black uppercase tracking-wider mb-2">Topik (opsional)</p>
                <input
                  type="text"
                  value={form.topic}
                  onChange={e => setForm(f => ({ ...f, topic: e.target.value }))}
                  placeholder="cth: Kata Adjektif, Nombor Bulat, Sistem Suria..."
                  className="w-full p-4 rounded-2xl bg-white/10 text-white border border-white/20 placeholder-white/30 font-semibold text-sm shadow-inner shadow-black/10 outline-none focus:border-white/50 focus:bg-white/15 transition-all"
                />
              </div>

              {form.type !== 'rancangan_pengajaran' && (
                <div className="mb-5">
                  <p className="text-white text-xs font-black uppercase tracking-wider mb-2">Bilangan Soalan: <span className="text-yellow-300">{form.count}</span></p>
                  <input type="range" min="5" max="20" value={form.count} onChange={e => setForm(f => ({ ...f, count: parseInt(e.target.value) }))} className="w-full" />
                  <div className="flex justify-between text-white/70 text-xs mt-1"><span>5</span><span>10</span><span>15</span><span>20</span></div>
                </div>
              )}

              <motion.button
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                onClick={() => {
                  if (selectedSubjects.size === 0 || selectedLevels.size === 0 || selectedTypes.size === 0) {
                    setError('Pilih sekurang-kurangnya satu untuk setiap kategori');
                    return;
                  }
                  handleGenerate();
                }}
                disabled={loading}
                className="w-full py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-3 bg-gradient-to-r from-cyan-300 via-blue-400 to-fuchsia-500 text-white shadow-2xl shadow-blue-950/30 disabled:opacity-50 disabled:shadow-none transition-all"
              >
                {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Jana sedang dalam proses...</> : <><Wand2 className="w-5 h-5" /> Jana BBM ({selectedSubjects.size} × {selectedLevels.size} × {selectedTypes.size})!</>}
              </motion.button>
            </div>

            {error && <div className="p-4 rounded-2xl bg-red-500/20 border border-red-400/30 text-red-200 text-sm mb-4">⚠️ {error}</div>}

            <AnimatePresence>
              {result && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  className="p-5 md:p-6 rounded-[2rem] shadow-2xl shadow-black/20"
                  style={{ background: 'linear-gradient(135deg, rgba(34,197,94,0.18), rgba(255,255,255,0.08))', backdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.22)' }}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center"><Check className="w-5 h-5 text-white" /></div>
                    <div>
                      <p className="text-white font-black">BBM Berjaya Dijana!</p>
                      <p className="text-white/80 text-xs">{result.title}</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={() => setTab('manager')}
                      className="flex-1 py-3 rounded-2xl bg-white/10 text-white font-bold flex items-center justify-center gap-2 border border-white/20">
                      <FileText className="w-4 h-4" /> Tengok di Manager
                    </motion.button>
                    <div className="flex-1 py-3 rounded-2xl bg-green-500/20 text-green-300 font-bold flex items-center justify-center gap-2 border border-green-400/30">
                      <Check className="w-4 h-4" /> Auto Published!
                    </div>
                  </div>
                  <button onClick={() => setResult(null)} className="w-full mt-3 py-2 text-white/50 text-sm flex items-center justify-center gap-2 hover:text-white/80">
                    <RefreshCw className="w-3 h-3" /> Jana Lagi
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* MANAGER TAB */}
        {tab === 'manager' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {/* Search + Filter */}
             <div className="space-y-3 mb-5 p-3 sm:p-4 md:p-5 rounded-[1.5rem] sm:rounded-[1.75rem] shadow-xl shadow-black/10" style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(22px)', border: '1px solid rgba(255,255,255,0.2)' }}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <input
                  type="text" placeholder="Cari BBM..."
                  value={search} onChange={e => setSearch(e.target.value)}
                  className="w-full min-h-[46px] pl-10 pr-4 py-3 rounded-2xl bg-white/10 text-white placeholder-white/30 border border-white/20 text-sm font-semibold shadow-inner shadow-black/10 outline-none focus:border-white/50 focus:bg-white/15 transition-all"
                />
              </div>
              <div className="grid grid-cols-[1fr_auto_auto] gap-2 items-stretch">
                <select
                  value={filterSubject} onChange={e => setFilterSubject(e.target.value)}
                  className="min-w-0 flex-1 min-h-[46px] px-3 py-3 rounded-2xl bg-white/10 text-white border border-white/20 font-semibold text-sm shadow-inner shadow-black/10 outline-none focus:border-white/50 focus:bg-white/15 transition-all"
                >
                  <option value="all" className="text-black">Semua Subjek</option>
                  {SUBJECTS.map(s => <option key={s.value} value={s.value} className="text-black">{s.label}</option>)}
                </select>
                <button onClick={loadResources} className="w-11 h-11 md:w-12 md:h-12 rounded-2xl bg-white/10 text-white border border-white/20 hover:bg-white/20 flex items-center justify-center flex-shrink-0 transition-all">
                  <RefreshCw className={`w-4 h-4 ${loadingResources ? 'animate-spin' : ''}`} />
                </button>
                <button
                  onClick={async () => {
                    if (!window.confirm('🚨 Delete SEMUA BBM? (Tidak boleh undo)')) return;
                    for (const r of resources) {
                      try {
                        await base44.entities.BBMResource.delete(r.id);
                      } catch (e) {
                        console.error(`Gagal delete ${r.id}:`, e);
                      }
                    }
                    setResources([]);
                    showToast('✅ Semua BBM dipadam');
                  }}
                  className="w-11 h-11 md:w-12 md:h-12 rounded-2xl bg-red-500/20 text-red-300 border border-red-400/30 hover:bg-red-500/30 flex items-center justify-center flex-shrink-0 transition-all"
                  title="Delete all BBM"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
             </div>

            {/* Stats row */}
             <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
              {[
                { label: 'Jumlah BBM', value: resources.length, color: 'text-yellow-300' },
                { label: 'Published', value: resources.filter(r => r.isPublished !== false).length, color: 'text-green-300' },
                { label: 'Hidden', value: resources.filter(r => r.isPublished === false).length, color: 'text-red-300' },
                { label: 'Task Queue', value: tasks.length, color: 'text-blue-300' },
              ].map(s => (
                <div key={s.label} className="p-4 rounded-3xl text-center shadow-xl shadow-black/10 border border-white/15" style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(18px)' }}>
                  <p className={`font-black text-xl ${s.color}`}>{s.value}</p>
                  <p className="text-white/80 text-xs">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Task Queue Section */}
            {tasks.length > 0 && (
              <div className="p-4 md:p-5 rounded-[1.75rem] mb-5 shadow-xl shadow-black/10" style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.18)' }}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-white font-bold">📋 Task Queue ({tasks.length})</h3>
                  <button onClick={loadTasks} className="p-1 text-white/50 hover:text-white">
                    <RefreshCw className={`w-3.5 h-3.5 ${loadingTasks ? 'animate-spin' : ''}`} />
                  </button>
                </div>
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  {tasks.map(t => (
                    <div key={t.id} className="flex items-center gap-2 p-3 rounded-2xl text-xs border border-white/10" style={{ background: 'rgba(255,255,255,0.07)' }}>
                      <span className={`px-2 py-0.5 rounded font-bold ${
                        t.status === 'pending' ? 'bg-yellow-500/20 text-yellow-300' :
                        t.status === 'running' ? 'bg-blue-500/20 text-blue-300' :
                        t.status === 'completed' ? 'bg-green-500/20 text-green-300' :
                        'bg-red-500/20 text-red-300'
                      }`}>
                        {t.status}
                      </span>
                      <span className="text-white/90 flex-1 truncate">{t.taskName}</span>
                      <span className="text-white/70 whitespace-nowrap">{t.gamesCount || 0} items</span>
                    </div>
                  ))}
                </div>
                <p className="text-white/70 text-xs text-center mt-3 pt-3 border-t border-white/10">✅ Jalan background setiap 5 minit. Boleh tutup browser.</p>
              </div>
            )}

            {loadingResources ? (
              <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-white" /></div>
            ) : (
              <div className="space-y-2">
                {filtered.map(r => (
                  <motion.div
                    key={r.id}
                    initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                    className="p-4 md:p-5 rounded-[1.75rem] flex flex-col md:flex-row md:items-center gap-3 shadow-xl shadow-black/10 transition-all hover:-translate-y-0.5"
                    style={{ background: 'rgba(255,255,255,0.10)', backdropFilter: 'blur(18px)', border: '1px solid rgba(255,255,255,0.18)' }}
                  >
                    <div className="w-11 h-11 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center text-2xl flex-shrink-0 shadow-lg shadow-black/10">{r.emoji || '📄'}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-black text-sm md:text-base truncate">{r.title}</p>
                      <div className="flex gap-1.5 mt-1 flex-wrap">
                        <span className="text-xs bg-white/10 text-white/80 px-2 py-0.5 rounded-full">{SUBJECT_LABELS[r.subject] || r.subject}</span>
                        <span className="text-xs bg-white/10 text-white/80 px-2 py-0.5 rounded-full">{LEVEL_LABELS[r.level] || r.level}</span>
                        <span className="text-xs bg-white/10 text-white/80 px-2 py-0.5 rounded-full">{TYPE_LABELS[r.type] || r.type}</span>
                        {r.tier === 'premium' && <span className="text-xs bg-yellow-500/20 text-yellow-300 px-2 py-0.5 rounded-full">⭐ Premium</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {/* Toggle publish */}
                      <button
                        onClick={() => handleTogglePublish(r)}
                        className={`p-1.5 md:p-2 rounded-xl transition-all ${r.isPublished !== false ? 'bg-green-500/20 text-green-300 hover:bg-green-500/30' : 'bg-white/10 text-white/50 hover:bg-white/20'}`}
                        title={r.isPublished !== false ? 'Sembunyikan' : 'Publish'}
                      >
                        {r.isPublished !== false ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                      </button>
                      {/* Edit */}
                      <button
                        onClick={() => setEditItem({ ...r })}
                        className="p-1.5 md:p-2 rounded-xl bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 transition-all"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      {/* Delete */}
                      <button
                        onClick={() => handleDelete(r)}
                        className="p-1.5 md:p-2 rounded-xl bg-red-500/20 text-red-300 hover:bg-red-500/30 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                ))}
                {filtered.length === 0 && (
                  <div className="text-center py-12 text-white/40">
                    <p className="text-4xl mb-2">📭</p>
                    <p className="font-semibold">Tiada BBM dijumpai</p>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {editItem && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setEditItem(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              className="bg-white rounded-[2rem] w-full max-w-md p-5 md:p-6 shadow-2xl overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <h3 className="font-black text-gray-800 text-lg mb-4">✏️ Edit BBM</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-black text-gray-500 uppercase mb-1 block">Tajuk</label>
                  <input value={editItem.title || ''} onChange={e => setEditItem(p => ({ ...p, title: e.target.value }))}
                    className="w-full p-3 rounded-xl border-2 border-gray-200 font-semibold text-sm focus:border-indigo-400 outline-none" />
                </div>
                <div>
                  <label className="text-xs font-black text-gray-500 uppercase mb-1 block">Penerangan</label>
                  <textarea value={editItem.description || ''} onChange={e => setEditItem(p => ({ ...p, description: e.target.value }))}
                    rows={3} className="w-full p-3 rounded-xl border-2 border-gray-200 font-semibold text-sm focus:border-indigo-400 outline-none resize-none" />
                </div>
                <div>
                  <label className="text-xs font-black text-gray-500 uppercase mb-1 block">Tier</label>
                  <select value={editItem.tier || 'free'} onChange={e => setEditItem(p => ({ ...p, tier: e.target.value }))}
                    className="w-full p-3 rounded-xl border-2 border-gray-200 font-semibold text-sm focus:border-indigo-400 outline-none">
                    <option value="free">Free</option>
                    <option value="premium">Premium</option>
                  </select>
                </div>
                <div className="flex items-center gap-3">
                  <input type="checkbox" id="pub" checked={editItem.isPublished !== false} onChange={e => setEditItem(p => ({ ...p, isPublished: e.target.checked }))} className="w-4 h-4" />
                  <label htmlFor="pub" className="text-sm font-semibold text-gray-700">Published (kelihatan di BBM Hub)</label>
                </div>
              </div>
              <div className="flex gap-3 mt-5">
                <button onClick={() => setEditItem(null)} className="flex-1 py-3 rounded-2xl border-2 border-gray-200 text-gray-600 font-bold text-sm">Batal</button>
                <button onClick={handleSaveEdit} className="flex-1 py-3 rounded-2xl bg-indigo-600 text-white font-bold text-sm hover:bg-indigo-700">Simpan</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>


    </div>
  );
}