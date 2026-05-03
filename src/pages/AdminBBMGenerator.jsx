import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wand2, FileText, BookOpen, ClipboardList, Loader2, Eye, Check, RefreshCw, Trash2, ToggleLeft, ToggleRight, Search, Plus, Edit3 } from 'lucide-react';
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
  const [previewOpen, setPreviewOpen] = useState(false);

  // Manager state
  const [resources, setResources] = useState([]);
  const [loadingResources, setLoadingResources] = useState(false);
  const [search, setSearch] = useState('');
  const [filterSubject, setFilterSubject] = useState('all');
  const [toast, setToast] = useState(null);
  const [editItem, setEditItem] = useState(null);

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

  useEffect(() => {
    if (tab === 'manager') loadResources();
  }, [tab]);

  // Generator
  const handleGenerate = async () => {
    setLoading(true);
    setError('');
    setResult(null);
    const total = selectedSubjects.size * selectedLevels.size * selectedTypes.size;
    let count = 0;
    try {
      for (const subject of selectedSubjects) {
        for (const level of selectedLevels) {
          for (const type of selectedTypes) {
            count++;
            await base44.functions.invoke('generateBBM', { 
              subject, level, type, 
              topic: form.topic, 
              count: form.count 
            });
          }
        }
      }
      setResult({ success: true, total, title: `${total} BBM berhasil dijana` });
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
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

      <div className="max-w-3xl mx-auto px-4 pt-8 pb-32">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-5 rounded-3xl flex items-center gap-3"
          style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.2)' }}
        >
          <div className="text-4xl">📚</div>
          <div>
            <h1 className="text-xl font-black text-white">BBM Generator & Manager</h1>
            <p className="text-white/60 text-xs">Jana & urus semua Bahan Bantu Mengajar</p>
          </div>
          <div className="ml-auto text-right">
            <p className="text-white font-black text-lg">{resources.length}</p>
            <p className="text-white/50 text-xs">total BBM</p>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 p-1 rounded-2xl" style={{ background: 'rgba(255,255,255,0.1)' }}>
          {[
            { id: 'generator', label: '🤖 Generator', icon: Wand2 },
            { id: 'manager', label: '📋 Manager', icon: FileText },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-all ${
                tab === t.id ? 'bg-white text-indigo-700 shadow-lg' : 'text-white/70 hover:text-white'
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
              className="p-6 rounded-3xl mb-6"
              style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.2)' }}
            >
              {/* Type */}
              <div className="mb-5">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-white/70 text-xs font-black uppercase tracking-wider">Jenis BBM</p>
                  <div className="flex gap-1">
                    <button onClick={() => setSelectedTypes(new Set(TYPES.map(t => t.value)))} className="text-xs text-yellow-300 hover:underline">Semua</button>
                    <button onClick={() => setSelectedTypes(new Set())} className="text-xs text-white/50 hover:underline">Kosong</button>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-2">
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
                        className={`p-2 rounded-2xl text-xs font-bold transition-all text-center ${
                          sel ? 'bg-white text-indigo-700 shadow-lg' : 'bg-white/10 text-white/70 hover:bg-white/20'
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
                  <p className="text-white/70 text-xs font-black uppercase tracking-wider">Subjek</p>
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
                        className={`p-2 rounded-2xl text-xs font-bold transition-all text-center ${
                          sel ? 'bg-white text-indigo-700 shadow-lg' : 'bg-white/10 text-white/70 hover:bg-white/20'
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
                  <p className="text-white/70 text-xs font-black uppercase tracking-wider">Tahap</p>
                  <div className="flex gap-1">
                    <button onClick={() => setSelectedLevels(new Set(LEVELS.map(l => l.value)))} className="text-xs text-yellow-300 hover:underline">Semua</button>
                    <button onClick={() => setSelectedLevels(new Set())} className="text-xs text-white/50 hover:underline">Kosong</button>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-2">
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
                        className={`p-2 rounded-2xl text-xs font-bold transition-all text-center ${
                          sel ? 'bg-white text-indigo-700 shadow-lg' : 'bg-white/10 text-white/70 hover:bg-white/20'
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
                <p className="text-white/70 text-xs font-black uppercase tracking-wider mb-2">Topik (opsional)</p>
                <input
                  type="text"
                  value={form.topic}
                  onChange={e => setForm(f => ({ ...f, topic: e.target.value }))}
                  placeholder="cth: Kata Adjektif, Nombor Bulat, Sistem Suria..."
                  className="w-full p-3 rounded-2xl bg-white/10 text-white border border-white/20 placeholder-white/30 font-semibold text-sm"
                />
              </div>

              {form.type !== 'rancangan_pengajaran' && (
                <div className="mb-5">
                  <p className="text-white/70 text-xs font-black uppercase tracking-wider mb-2">Bilangan Soalan: <span className="text-yellow-300">{form.count}</span></p>
                  <input type="range" min="5" max="20" value={form.count} onChange={e => setForm(f => ({ ...f, count: parseInt(e.target.value) }))} className="w-full" />
                  <div className="flex justify-between text-white/40 text-xs mt-1"><span>5</span><span>10</span><span>15</span><span>20</span></div>
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
                className="w-full py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-xl disabled:opacity-50"
              >
                {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Jana sedang dalam proses...</> : <><Wand2 className="w-5 h-5" /> Jana BBM ({selectedSubjects.size} × {selectedLevels.size} × {selectedTypes.size})!</>}
              </motion.button>
            </div>

            {error && <div className="p-4 rounded-2xl bg-red-500/20 border border-red-400/30 text-red-200 text-sm mb-4">⚠️ {error}</div>}

            <AnimatePresence>
              {result && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  className="p-6 rounded-3xl"
                  style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.2)' }}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center"><Check className="w-5 h-5 text-white" /></div>
                    <div>
                      <p className="text-white font-black">BBM Berjaya Dijana!</p>
                      <p className="text-white/60 text-xs">{result.title}</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={() => setPreviewOpen(true)}
                      className="flex-1 py-3 rounded-2xl bg-white/10 text-white font-bold flex items-center justify-center gap-2 border border-white/20">
                      <Eye className="w-4 h-4" /> Preview
                    </motion.button>
                    {!result.published ? (
                      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={handlePublish}
                        className="flex-1 py-3 rounded-2xl bg-green-500 text-white font-bold flex items-center justify-center gap-2">
                        <Check className="w-4 h-4" /> Publish ke BBM Hub
                      </motion.button>
                    ) : (
                      <div className="flex-1 py-3 rounded-2xl bg-green-500/20 text-green-300 font-bold flex items-center justify-center gap-2 border border-green-400/30">
                        <Check className="w-4 h-4" /> Dah Published!
                      </div>
                    )}
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
            <div className="flex gap-2 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <input
                  type="text" placeholder="Cari BBM..."
                  value={search} onChange={e => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white/10 text-white placeholder-white/30 border border-white/20 text-sm font-semibold"
                />
              </div>
              <select
                value={filterSubject} onChange={e => setFilterSubject(e.target.value)}
                className="px-3 py-2.5 rounded-2xl bg-white/10 text-white border border-white/20 font-semibold text-sm"
              >
                <option value="all" className="text-black">Semua Subjek</option>
                {SUBJECTS.map(s => <option key={s.value} value={s.value} className="text-black">{s.label}</option>)}
              </select>
              <button onClick={loadResources} className="p-2.5 rounded-2xl bg-white/10 text-white border border-white/20 hover:bg-white/20">
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
                className="p-2.5 rounded-2xl bg-red-500/20 text-red-300 border border-red-400/30 hover:bg-red-500/30"
                title="Delete all BBM"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              {[
                { label: 'Jumlah', value: resources.length, color: 'text-yellow-300' },
                { label: 'Published', value: resources.filter(r => r.isPublished !== false).length, color: 'text-green-300' },
                { label: 'Hidden', value: resources.filter(r => r.isPublished === false).length, color: 'text-red-300' },
              ].map(s => (
                <div key={s.label} className="p-3 rounded-2xl text-center" style={{ background: 'rgba(255,255,255,0.08)' }}>
                  <p className={`font-black text-xl ${s.color}`}>{s.value}</p>
                  <p className="text-white/50 text-xs">{s.label}</p>
                </div>
              ))}
            </div>

            {loadingResources ? (
              <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-white" /></div>
            ) : (
              <div className="space-y-2">
                {filtered.map(r => (
                  <motion.div
                    key={r.id}
                    initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-2xl flex items-center gap-3"
                    style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}
                  >
                    <div className="text-2xl flex-shrink-0">{r.emoji || '📄'}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-bold text-sm truncate">{r.title}</p>
                      <div className="flex gap-1.5 mt-1 flex-wrap">
                        <span className="text-xs bg-white/10 text-white/60 px-2 py-0.5 rounded-full">{SUBJECT_LABELS[r.subject] || r.subject}</span>
                        <span className="text-xs bg-white/10 text-white/60 px-2 py-0.5 rounded-full">{LEVEL_LABELS[r.level] || r.level}</span>
                        <span className="text-xs bg-white/10 text-white/60 px-2 py-0.5 rounded-full">{TYPE_LABELS[r.type] || r.type}</span>
                        {r.tier === 'premium' && <span className="text-xs bg-yellow-500/20 text-yellow-300 px-2 py-0.5 rounded-full">⭐ Premium</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {/* Toggle publish */}
                      <button
                        onClick={() => handleTogglePublish(r)}
                        className={`p-2 rounded-xl transition-all ${r.isPublished !== false ? 'bg-green-500/20 text-green-300 hover:bg-green-500/30' : 'bg-gray-500/20 text-gray-400 hover:bg-gray-500/30'}`}
                        title={r.isPublished !== false ? 'Sembunyikan' : 'Publish'}
                      >
                        {r.isPublished !== false ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                      </button>
                      {/* Edit */}
                      <button
                        onClick={() => setEditItem({ ...r })}
                        className="p-2 rounded-xl bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 transition-all"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      {/* Delete */}
                      <button
                        onClick={() => handleDelete(r)}
                        className="p-2 rounded-xl bg-red-500/20 text-red-300 hover:bg-red-500/30 transition-all"
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
            className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
            onClick={() => setEditItem(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              className="bg-white rounded-3xl w-full max-w-md p-6"
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

      {/* Preview Modal */}
      <AnimatePresence>
        {previewOpen && result?.htmlContent && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"
            onClick={() => setPreviewOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              className="bg-white rounded-3xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-4 border-b">
                <h3 className="font-black text-gray-800">Preview BBM</h3>
                <div className="flex gap-2">
                  <button onClick={() => { const win = window.open('', '_blank'); win.document.write(result.htmlContent); win.document.close(); win.print(); }}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold text-sm">🖨️ Print / Save PDF</button>
                  <button onClick={() => setPreviewOpen(false)} className="px-4 py-2 bg-gray-100 rounded-xl font-bold text-sm">Tutup</button>
                </div>
              </div>
              <iframe srcDoc={result.htmlContent} className="flex-1 w-full" title="BBM Preview" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}