import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Edit3, FileText, Loader2, RefreshCw, Search, ToggleLeft, ToggleRight, Trash2, Wand2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';

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

export default function BBMGeneratorManager({ onToast }) {
  const [tab, setTab] = useState('generator');
  const [form, setForm] = useState({ topic: '', count: 10 });
  const [selectedSubjects, setSelectedSubjects] = useState(new Set(['bahasa_melayu']));
  const [selectedLevels, setSelectedLevels] = useState(new Set(['darjah_1']));
  const [selectedTypes, setSelectedTypes] = useState(new Set(['lembaran_kerja']));
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [resources, setResources] = useState([]);
  const [loadingResources, setLoadingResources] = useState(false);
  const [search, setSearch] = useState('');
  const [filterSubject, setFilterSubject] = useState('all');
  const [editItem, setEditItem] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(false);

  const notify = (message, ok = true) => onToast?.(message, ok);

  const loadResources = async () => {
    setLoadingResources(true);
    const data = await base44.entities.BBMResource.list('-created_date', 200);
    setResources(data);
    setLoadingResources(false);
  };

  const loadTasks = async () => {
    setLoadingTasks(true);
    const data = await base44.entities.GameTask.list('-created_date', 100);
    setTasks(data.filter(t => t.taskName?.toLowerCase().includes('bbm') || t.taskName?.toLowerCase().includes('bahan bantu')));
    setLoadingTasks(false);
  };

  useEffect(() => {
    loadTasks();
    if (tab === 'manager') loadResources();
  }, [tab]);

  const handleGenerate = async () => {
    if (!form.topic.trim()) {
      setError('Masukkan topik yang jelas dulu supaya BBM tidak jadi terlalu umum. Contoh: Pecahan Wang, Kata Adjektif, Sistem Suria.');
      return;
    }
    setLoading(true);
    setError('');
    setResult(null);
    const total = selectedSubjects.size * selectedLevels.size * selectedTypes.size;
    let queuedCount = 0;

    for (const subject of selectedSubjects) {
      for (const level of selectedLevels) {
        for (const type of selectedTypes) {
          await base44.entities.GameTask.create({
            taskName: `BBM: ${SUBJECT_LABELS[subject] || subject} - ${LEVEL_LABELS[level] || level} - ${TYPE_LABELS[type] || type}${form.topic ? ` - ${form.topic}` : ''}`,
            ageGroup: level,
            subject: `bbm_${subject}_${type}`,
            gamesCount: 1,
            questionsPerGame: form.count,
            status: 'pending',
            errorMessage: JSON.stringify({ subject, level, type, topic: form.topic || '' })
          });
          queuedCount++;
        }
      }
    }

    setResult({ total, createdCount: queuedCount, title: `${queuedCount}/${total} BBM tasks dihantar ke queue` });
    await loadTasks();
    setLoading(false);
  };

  const handleTogglePublish = async (item) => {
    await base44.entities.BBMResource.update(item.id, { isPublished: !item.isPublished });
    setResources(prev => prev.map(r => r.id === item.id ? { ...r, isPublished: !r.isPublished } : r));
    notify(item.isPublished ? 'BBM disembunyikan' : 'BBM dipublish');
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Padam "${item.title}"?`)) return;
    await base44.entities.BBMResource.delete(item.id);
    setResources(prev => prev.filter(r => r.id !== item.id));
    notify('BBM dipadam');
  };

  const handleDeleteTask = async (id) => {
    await base44.entities.GameTask.delete(id);
    setTasks(prev => prev.filter(t => t.id !== id));
    notify('✅ Task dipadam');
  };

  const handleDeletePendingTasks = async () => {
    const pending = tasks.filter(t => t.status === 'pending');
    if (pending.length === 0) return notify('Tiada pending BBM task', false);
    if (!window.confirm(`Padam ${pending.length} pending BBM tasks?`)) return;
    for (const t of pending) await base44.entities.GameTask.delete(t.id);
    setTasks(prev => prev.filter(t => t.status !== 'pending'));
    notify(`✅ ${pending.length} pending tasks dipadam`);
  };

  const handleDeleteCompletedTasks = async () => {
    const completed = tasks.filter(t => t.status === 'completed');
    if (completed.length === 0) return notify('Tiada completed BBM task', false);
    if (!window.confirm(`Padam ${completed.length} completed BBM tasks?`)) return;
    for (const t of completed) await base44.entities.GameTask.delete(t.id);
    setTasks(prev => prev.filter(t => t.status !== 'completed'));
    notify(`✅ ${completed.length} completed tasks dipadam`);
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
    notify('BBM dikemaskini');
  };

  const filtered = resources.filter(r => {
    const matchSearch = !search || r.title?.toLowerCase().includes(search.toLowerCase());
    const matchSubject = filterSubject === 'all' || r.subject === filterSubject;
    return matchSearch && matchSubject;
  });

  const toggleSetValue = (setValue, value) => {
    setValue(prev => {
      const next = new Set(prev);
      next.has(value) ? next.delete(value) : next.add(value);
      return next;
    });
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="grid grid-cols-3 gap-2 mb-5">
        <div className="rounded-2xl bg-white/10 border border-white/15 p-3 text-center"><p className="text-white font-black text-lg">{resources.length}</p><p className="text-white/60 text-[11px] font-bold">Total BBM</p></div>
        <div className="rounded-2xl bg-white/10 border border-white/15 p-3 text-center"><p className="text-white font-black text-lg">{resources.filter(r => r.isPublished !== false).length}</p><p className="text-white/60 text-[11px] font-bold">Published</p></div>
        <div className="rounded-2xl bg-white/10 border border-white/15 p-3 text-center"><p className="text-white font-black text-lg">{tasks.length}</p><p className="text-white/60 text-[11px] font-bold">Tasks</p></div>
      </div>

      <div className="flex gap-2 mb-6 p-2 rounded-[1.75rem] sm:rounded-3xl overflow-x-auto shadow-xl shadow-black/10" style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(18px)', border: '1px solid rgba(255,255,255,0.16)' }}>
        {[{ id: 'generator', label: '🤖 BBM Generator' }, { id: 'manager', label: '📋 BBM Manager' }].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} className={`flex-1 min-w-[9rem] py-3.5 px-4 rounded-2xl font-black text-sm transition-all whitespace-nowrap ${tab === t.id ? 'bg-white text-indigo-800 shadow-lg' : 'text-white/75 hover:text-white hover:bg-white/10'}`}>{t.label}</button>
        ))}
      </div>

      {tab === 'generator' && (
        <div>
          <div className="p-5 md:p-7 rounded-[2rem] mb-6 shadow-2xl shadow-black/20" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.16), rgba(255,255,255,0.07))', backdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.22)' }}>
            <Picker title="Jenis BBM" items={TYPES} selected={selectedTypes} setSelected={setSelectedTypes} onToggle={(value) => toggleSetValue(setSelectedTypes, value)} />
            <Picker title="Subjek" items={SUBJECTS} selected={selectedSubjects} setSelected={setSelectedSubjects} onToggle={(value) => toggleSetValue(setSelectedSubjects, value)} compact />
            <Picker title="Tahap" items={LEVELS} selected={selectedLevels} setSelected={setSelectedLevels} onToggle={(value) => toggleSetValue(setSelectedLevels, value)} />

            <div className="mb-4">
              <p className="text-white text-xs font-black uppercase tracking-wider mb-2">Topik (opsional)</p>
              <input type="text" value={form.topic} onChange={e => setForm(f => ({ ...f, topic: e.target.value }))} placeholder="cth: Kata Adjektif, Nombor Bulat, Sistem Suria..." className="w-full p-4 rounded-2xl bg-white/10 text-white border border-white/20 placeholder-white/30 font-semibold text-sm shadow-inner shadow-black/10 outline-none focus:border-white/50 focus:bg-white/15 transition-all" />
            </div>

            <div className="mb-5">
              <p className="text-white text-xs font-black uppercase tracking-wider mb-2">Bilangan Soalan: <span className="text-yellow-300">{form.count}</span></p>
              <input type="range" min="5" max="20" value={form.count} onChange={e => setForm(f => ({ ...f, count: parseInt(e.target.value) }))} className="w-full" />
              <div className="flex justify-between text-white/70 text-xs mt-1"><span>5</span><span>10</span><span>15</span><span>20</span></div>
            </div>

            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={() => {
              if (selectedSubjects.size === 0 || selectedLevels.size === 0 || selectedTypes.size === 0) {
                setError('Pilih sekurang-kurangnya satu untuk setiap kategori');
                return;
              }
              handleGenerate();
            }} disabled={loading} className="w-full py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-3 bg-gradient-to-r from-cyan-300 via-blue-400 to-fuchsia-500 text-white shadow-2xl shadow-blue-950/30 disabled:opacity-50 disabled:shadow-none transition-all">
              {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Menghantar ke queue...</> : <><Wand2 className="w-5 h-5" /> Queue BBM ({selectedSubjects.size} × {selectedLevels.size} × {selectedTypes.size})</>}
            </motion.button>
          </div>

          {error && <div className="p-4 rounded-2xl bg-red-500/20 border border-red-400/30 text-red-200 text-sm mb-4">⚠️ {error}</div>}
          <AnimatePresence>{result && <ResultCard result={result} onManage={() => setTab('manager')} onReset={() => setResult(null)} />}</AnimatePresence>
        </div>
      )}

      {tab === 'manager' && (
        <div>
          <div className="space-y-3 mb-5 p-3 sm:p-4 md:p-5 rounded-[1.5rem] sm:rounded-[1.75rem] shadow-xl shadow-black/10" style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(22px)', border: '1px solid rgba(255,255,255,0.2)' }}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input type="text" placeholder="Cari BBM..." value={search} onChange={e => setSearch(e.target.value)} className="w-full min-h-[46px] pl-10 pr-4 py-3 rounded-2xl bg-white/10 text-white placeholder-white/30 border border-white/20 text-sm font-semibold shadow-inner shadow-black/10 outline-none focus:border-white/50 focus:bg-white/15 transition-all" />
            </div>
            <div className="grid grid-cols-[1fr_auto_auto] gap-2 items-stretch">
              <select value={filterSubject} onChange={e => setFilterSubject(e.target.value)} className="min-w-0 flex-1 min-h-[46px] px-3 py-3 rounded-2xl bg-white/10 text-white border border-white/20 font-semibold text-sm shadow-inner shadow-black/10 outline-none focus:border-white/50 focus:bg-white/15 transition-all">
                <option value="all" className="text-black">Semua Subjek</option>
                {SUBJECTS.map(s => <option key={s.value} value={s.value} className="text-black">{s.label}</option>)}
              </select>
              <button onClick={loadResources} className="w-11 h-11 md:w-12 md:h-12 rounded-2xl bg-white/10 text-white border border-white/20 hover:bg-white/20 flex items-center justify-center flex-shrink-0 transition-all"><RefreshCw className={`w-4 h-4 ${loadingResources ? 'animate-spin' : ''}`} /></button>
              <button onClick={async () => {
                if (!window.confirm('🚨 Delete SEMUA BBM? (Tidak boleh undo)')) return;
                for (const r of resources) await base44.entities.BBMResource.delete(r.id);
                setResources([]);
                notify('✅ Semua BBM dipadam');
              }} className="w-11 h-11 md:w-12 md:h-12 rounded-2xl bg-red-500/20 text-red-300 border border-red-400/30 hover:bg-red-500/30 flex items-center justify-center flex-shrink-0 transition-all"><Trash2 className="w-4 h-4" /></button>
            </div>
          </div>

          {loadingResources ? <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-white" /></div> : (
            <div className="space-y-2">
              {filtered.map(r => <BBMResourceRow key={r.id} item={r} onToggle={handleTogglePublish} onEdit={() => setEditItem({ ...r })} onDelete={handleDelete} />)}
              {filtered.length === 0 && <div className="text-center py-12 text-white/40"><p className="text-4xl mb-2">📭</p><p className="font-semibold">Tiada BBM dijumpai</p></div>}
            </div>
          )}
        </div>
      )}

      <AnimatePresence>{editItem && <EditBBMModal item={editItem} setItem={setEditItem} onClose={() => setEditItem(null)} onSave={handleSaveEdit} />}</AnimatePresence>
    </motion.div>
  );
}

function Picker({ title, items, selected, setSelected, onToggle, compact = false }) {
  return (
    <div className="mb-5">
      <div className="flex items-center justify-between mb-2">
        <p className="text-white text-xs font-black uppercase tracking-wider">{title}</p>
        <div className="flex gap-2"><button onClick={() => setSelected(new Set(items.map(i => i.value)))} className="text-xs text-yellow-300 hover:underline">Semua</button><button onClick={() => setSelected(new Set())} className="text-xs text-white/50 hover:underline">Kosong</button></div>
      </div>
      <div className={`grid grid-cols-2 ${compact ? '' : 'md:grid-cols-4'} gap-2`}>
        {items.map(item => {
          const isSelected = selected.has(item.value);
          return <button key={item.value} onClick={() => onToggle(item.value)} className={`p-3 rounded-2xl text-xs font-black transition-all text-center border ${isSelected ? 'bg-white text-indigo-800 shadow-lg border-white' : 'bg-white/10 text-white/75 hover:bg-white/20 border-white/10'}`}>{item.label}</button>;
        })}
      </div>
    </div>
  );
}

function ResultCard({ result, onManage, onReset }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-5 md:p-6 rounded-[2rem] shadow-2xl shadow-black/20 mb-6" style={{ background: 'linear-gradient(135deg, rgba(34,197,94,0.18), rgba(255,255,255,0.08))', backdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.22)' }}>
      <div className="flex items-center gap-3 mb-4"><div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center"><Check className="w-5 h-5 text-white" /></div><div><p className="text-white font-black">BBM Task Berjaya Masuk Queue!</p><p className="text-white/80 text-xs">{result.title}</p></div></div>
      <div className="flex gap-3"><button onClick={onManage} className="flex-1 py-3 rounded-2xl bg-white/10 text-white font-bold flex items-center justify-center gap-2 border border-white/20"><FileText className="w-4 h-4" /> Tengok di Manager</button><div className="flex-1 py-3 rounded-2xl bg-green-500/20 text-green-300 font-bold flex items-center justify-center gap-2 border border-green-400/30"><Check className="w-4 h-4" /> Queued</div></div>
      <button onClick={onReset} className="w-full mt-3 py-2 text-white/50 text-sm flex items-center justify-center gap-2 hover:text-white/80"><RefreshCw className="w-3 h-3" /> Jana Lagi</button>
    </motion.div>
  );
}

function BBMResourceRow({ item, onToggle, onEdit, onDelete }) {
  return (
    <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="p-4 md:p-5 rounded-[1.75rem] flex flex-col md:flex-row md:items-center gap-3 shadow-xl shadow-black/10 transition-all hover:-translate-y-0.5" style={{ background: 'rgba(255,255,255,0.10)', backdropFilter: 'blur(18px)', border: '1px solid rgba(255,255,255,0.18)' }}>
      <div className="w-11 h-11 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center text-2xl flex-shrink-0 shadow-lg shadow-black/10">{item.emoji || '📄'}</div>
      <div className="flex-1 min-w-0"><p className="text-white font-black text-sm md:text-base truncate">{item.title}</p><div className="flex gap-1.5 mt-1 flex-wrap"><span className="text-xs bg-white/10 text-white/80 px-2 py-0.5 rounded-full">{SUBJECT_LABELS[item.subject] || item.subject}</span><span className="text-xs bg-white/10 text-white/80 px-2 py-0.5 rounded-full">{LEVEL_LABELS[item.level] || item.level}</span><span className="text-xs bg-white/10 text-white/80 px-2 py-0.5 rounded-full">{TYPE_LABELS[item.type] || item.type}</span>{item.tier === 'premium' && <span className="text-xs bg-yellow-500/20 text-yellow-300 px-2 py-0.5 rounded-full">⭐ Premium</span>}</div></div>
      <div className="flex items-center gap-1 flex-shrink-0"><button onClick={() => onToggle(item)} className={`p-1.5 md:p-2 rounded-xl transition-all ${item.isPublished !== false ? 'bg-green-500/20 text-green-300 hover:bg-green-500/30' : 'bg-white/10 text-white/50 hover:bg-white/20'}`}>{item.isPublished !== false ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}</button><button onClick={onEdit} className="p-1.5 md:p-2 rounded-xl bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 transition-all"><Edit3 className="w-4 h-4" /></button><button onClick={() => onDelete(item)} className="p-1.5 md:p-2 rounded-xl bg-red-500/20 text-red-300 hover:bg-red-500/30 transition-all"><Trash2 className="w-4 h-4" /></button></div>
    </motion.div>
  );
}

function EditBBMModal({ item, setItem, onClose, onSave }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="bg-white rounded-[2rem] w-full max-w-md p-5 md:p-6 shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
        <h3 className="font-black text-gray-800 text-lg mb-4">✏️ Edit BBM</h3>
        <div className="space-y-3">
          <div><label className="text-xs font-black text-gray-500 uppercase mb-1 block">Tajuk</label><input value={item.title || ''} onChange={e => setItem(p => ({ ...p, title: e.target.value }))} className="w-full p-3 rounded-xl border-2 border-gray-200 font-semibold text-sm focus:border-indigo-400 outline-none" /></div>
          <div><label className="text-xs font-black text-gray-500 uppercase mb-1 block">Penerangan</label><textarea value={item.description || ''} onChange={e => setItem(p => ({ ...p, description: e.target.value }))} rows={3} className="w-full p-3 rounded-xl border-2 border-gray-200 font-semibold text-sm focus:border-indigo-400 outline-none resize-none" /></div>
          <div><label className="text-xs font-black text-gray-500 uppercase mb-1 block">Tier</label><select value={item.tier || 'free'} onChange={e => setItem(p => ({ ...p, tier: e.target.value }))} className="w-full p-3 rounded-xl border-2 border-gray-200 font-semibold text-sm focus:border-indigo-400 outline-none"><option value="free">Free</option><option value="premium">Premium</option></select></div>
          <div className="flex items-center gap-3"><input type="checkbox" id="bbm-pub" checked={item.isPublished !== false} onChange={e => setItem(p => ({ ...p, isPublished: e.target.checked }))} className="w-4 h-4" /><label htmlFor="bbm-pub" className="text-sm font-semibold text-gray-700">Published di BBM Hub</label></div>
        </div>
        <div className="flex gap-3 mt-5"><button onClick={onClose} className="flex-1 py-3 rounded-2xl border-2 border-gray-200 text-gray-600 font-bold text-sm">Batal</button><button onClick={onSave} className="flex-1 py-3 rounded-2xl bg-indigo-600 text-white font-bold text-sm hover:bg-indigo-700">Simpan</button></div>
      </motion.div>
    </motion.div>
  );
}