import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Brain, Trash2, X, Calendar, CheckCircle2, XCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import LibraryFilterBar from '@/components/ai/LibraryFilterBar';
import LoadMoreButton from '@/components/ai/LoadMoreButton';

const PAGE_SIZE = 20;

const SUBJECT_LABELS = {
  bahasa_melayu: 'BM',
  english: 'English',
  mathematics: 'Matematik',
  science: 'Sains',
  jawi: 'Jawi',
  general: 'Umum',
};

const SUBJECT_OPTIONS = Object.entries(SUBJECT_LABELS).map(([value, label]) => ({ value, label }));

const STATUS_OPTIONS = [
  { value: 'correct', label: 'Betul' },
  { value: 'wrong', label: 'Salah' },
];

const LEVEL_LABELS = {
  prasekolah: 'Prasekolah',
  darjah_1: 'Darjah 1',
  darjah_2: 'Darjah 2',
  darjah_3: 'Darjah 3',
  darjah_4: 'Darjah 4',
  darjah_5: 'Darjah 5',
  darjah_6: 'Darjah 6',
};

export default function MyQuizLibrary({ refreshKey = 0 }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const load = async () => {
    if (!user?.email) return;
    setLoading(true);
    try {
      const list = await base44.entities.QuizHistory.filter(
        { created_by: user.email },
        '-created_date',
        200
      );
      setItems(list || []);
    } catch (e) {
      console.error('Failed to load quiz history:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [user?.email, refreshKey]);

  const handleDelete = async (id, e) => {
    e?.stopPropagation();
    if (!window.confirm('Padam soalan ini dari koleksi?')) return;
    try {
      await base44.entities.QuizHistory.delete(id);
      setItems(prev => prev.filter(x => x.id !== id));
      if (selected?.id === id) setSelected(null);
      toast({ title: 'Dipadam' });
    } catch (err) {
      toast({ title: 'Ralat', description: err.message, variant: 'destructive' });
    }
  };

  const totalCorrect = items.filter(x => x.isCorrect).length;
  const accuracy = items.length > 0 ? Math.round((totalCorrect / items.length) * 100) : 0;

  const filteredItems = useMemo(() => {
    const s = search.trim().toLowerCase();
    return items.filter(it => {
      if (subjectFilter !== 'all' && it.subject !== subjectFilter) return false;
      if (statusFilter === 'correct' && !it.isCorrect) return false;
      if (statusFilter === 'wrong' && it.isCorrect) return false;
      if (s) {
        const blob = `${it.question || ''} ${it.topic || ''}`.toLowerCase();
        if (!blob.includes(s)) return false;
      }
      return true;
    });
  }, [items, search, subjectFilter, statusFilter]);

  const visibleItems = filteredItems.slice(0, visibleCount);
  const remaining = filteredItems.length - visibleItems.length;

  useEffect(() => { setVisibleCount(PAGE_SIZE); }, [search, subjectFilter, statusFilter]);

  if (loading) {
    return (
      <div className="bg-white/80 backdrop-blur-md border border-slate-200 rounded-3xl p-8 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-500 mx-auto mb-2" />
        <p className="text-slate-600 text-sm font-bold">Memuat koleksi...</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="bg-white/80 backdrop-blur-md border border-slate-200 rounded-3xl p-8 text-center">
        <Brain className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <p className="text-slate-700 font-black text-base mb-1">Belum ada sejarah kuiz</p>
        <p className="text-slate-500 text-xs font-semibold">Setiap soalan yang anda jawab akan tersimpan di sini.</p>
      </div>
    );
  }

  return (
    <>
      {/* Stats summary */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="bg-white border border-slate-200 rounded-2xl p-3 text-center">
          <p className="text-slate-500 text-[10px] font-black uppercase">Jumlah</p>
          <p className="text-slate-900 font-black text-lg">{items.length}</p>
        </div>
        <div className="bg-white border border-emerald-200 rounded-2xl p-3 text-center">
          <p className="text-emerald-600 text-[10px] font-black uppercase">Betul</p>
          <p className="text-emerald-700 font-black text-lg">{totalCorrect}</p>
        </div>
        <div className="bg-white border border-cyan-200 rounded-2xl p-3 text-center">
          <p className="text-cyan-600 text-[10px] font-black uppercase">Ketepatan</p>
          <p className="text-cyan-700 font-black text-lg">{accuracy}%</p>
        </div>
      </div>

      <LibraryFilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Cari soalan atau topik..."
        totalCount={filteredItems.length}
        filters={[
          { key: 'subject', label: 'Subjek', value: subjectFilter, options: SUBJECT_OPTIONS },
          { key: 'status', label: 'Status', value: statusFilter, options: STATUS_OPTIONS },
        ]}
        onFilterChange={(key, val) => {
          if (key === 'subject') setSubjectFilter(val);
          if (key === 'status') setStatusFilter(val);
        }}
      />

      <div className="space-y-2">
        {visibleItems.map(item => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={() => setSelected(item)}
            className="bg-white border border-slate-200 rounded-2xl p-3 shadow-sm hover:shadow-md cursor-pointer transition-all flex items-start gap-3 group"
          >
            <div className="flex-shrink-0 mt-0.5">
              {item.isCorrect ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              ) : (
                <XCircle className="w-5 h-5 text-rose-500" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-black text-slate-900 text-sm leading-tight line-clamp-2">
                {item.emoji || '❓'} {item.question}
              </p>
              <div className="flex flex-wrap gap-1 mt-1.5">
                <span className="px-2 py-0.5 rounded-full bg-cyan-50 text-cyan-700 text-[10px] font-bold">
                  {SUBJECT_LABELS[item.subject] || item.subject}
                </span>
                {item.level && (
                  <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold">
                    {LEVEL_LABELS[item.level] || item.level}
                  </span>
                )}
                {item.topic && (
                  <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-bold">
                    {item.topic}
                  </span>
                )}
              </div>
              <p className="text-slate-400 text-[10px] font-semibold mt-1.5 flex items-center gap-1">
                <Calendar className="w-2.5 h-2.5" />
                {new Date(item.created_date).toLocaleDateString('ms-MY')}
              </p>
            </div>
            <button
              onClick={(e) => handleDelete(item.id, e)}
              className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 flex-shrink-0"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        ))}
      </div>

      <LoadMoreButton
        onClick={() => setVisibleCount(v => v + PAGE_SIZE)}
        remaining={remaining}
        color="cyan"
      />

      {/* Detail modal */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelected(null)}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            >
              <div className="flex items-center justify-between p-4 border-b border-slate-200 sticky top-0 bg-white">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{selected.emoji || '❓'}</span>
                  <div>
                    <p className="text-slate-500 text-[10px] font-black uppercase">Soalan kuiz</p>
                    <p className={`font-black text-xs ${selected.isCorrect ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {selected.isCorrect ? '✓ Anda jawab betul' : '✗ Anda jawab salah'}
                    </p>
                  </div>
                </div>
                <button onClick={() => setSelected(null)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-5 space-y-4">
                <p className="text-slate-900 font-black text-base">{selected.question}</p>

                <div className="space-y-2">
                  {selected.choices.map((c, i) => {
                    const isCorrectChoice = i === selected.correctIndex;
                    const isUserChoice = i === selected.userAnswerIndex;
                    return (
                      <div
                        key={i}
                        className={`px-3 py-2.5 rounded-xl border-2 text-sm font-bold flex items-center justify-between gap-2 ${
                          isCorrectChoice
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                            : isUserChoice
                            ? 'bg-rose-50 border-rose-300 text-rose-800'
                            : 'bg-slate-50 border-slate-200 text-slate-700'
                        }`}
                      >
                        <span>{c}</span>
                        {isCorrectChoice && <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />}
                        {isUserChoice && !isCorrectChoice && <XCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />}
                      </div>
                    );
                  })}
                </div>

                {selected.explanation && (
                  <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3">
                    <p className="text-amber-700 text-[10px] font-black uppercase mb-1">💡 Penerangan</p>
                    <p className="text-amber-900 text-sm font-semibold">{selected.explanation}</p>
                  </div>
                )}

                {selected.hint && (
                  <div className="bg-cyan-50 border border-cyan-200 rounded-2xl p-3">
                    <p className="text-cyan-700 text-[10px] font-black uppercase mb-1">🔑 Petua</p>
                    <p className="text-cyan-900 text-sm font-semibold">{selected.hint}</p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}