import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, FileText, Trash2, Printer, X, Calendar } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import LibraryFilterBar from '@/components/ai/LibraryFilterBar';
import LoadMoreButton from '@/components/ai/LoadMoreButton';

const PAGE_SIZE = 20;

const SUBJECT_LABELS = {
  bahasa_melayu: 'Bahasa Melayu',
  english: 'English',
  mathematics: 'Matematik',
  science: 'Sains',
  jawi: 'Jawi',
  pendidikan_islam: 'P. Islam',
  sejarah: 'Sejarah',
};

const LEVEL_LABELS = {
  prasekolah: 'Prasekolah',
  darjah_1: 'Darjah 1',
  darjah_2: 'Darjah 2',
  darjah_3: 'Darjah 3',
  darjah_4: 'Darjah 4',
  darjah_5: 'Darjah 5',
  darjah_6: 'Darjah 6',
};

const SUBJECT_OPTIONS = Object.entries(SUBJECT_LABELS).map(([value, label]) => ({ value, label }));
const LEVEL_OPTIONS = Object.entries(LEVEL_LABELS).map(([value, label]) => ({ value, label }));

export default function MyBBMLibrary({ refreshKey = 0 }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [levelFilter, setLevelFilter] = useState('all');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const load = async () => {
    if (!user?.email) return;
    setLoading(true);
    try {
      const list = await base44.entities.BBMResource.filter(
        { created_by: user.email },
        '-created_date',
        100
      );
      setItems(list || []);
    } catch (e) {
      console.error('Failed to load library:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [user?.email, refreshKey]);

  const handleDelete = async (id, e) => {
    e?.stopPropagation();
    if (!window.confirm('Padam BBM ini dari koleksi anda?')) return;
    try {
      await base44.entities.BBMResource.delete(id);
      setItems(prev => prev.filter(x => x.id !== id));
      if (selected?.id === id) setSelected(null);
      toast({ title: 'Dipadam', description: 'BBM telah dipadam dari koleksi.' });
    } catch (err) {
      toast({ title: 'Ralat', description: err.message, variant: 'destructive' });
    }
  };

  const handlePrint = () => window.print();

  const filteredItems = useMemo(() => {
    const s = search.trim().toLowerCase();
    return items.filter(it => {
      if (subjectFilter !== 'all' && it.subject !== subjectFilter) return false;
      if (levelFilter !== 'all' && it.level !== levelFilter) return false;
      if (s) {
        const blob = `${it.title || ''} ${it.description || ''}`.toLowerCase();
        if (!blob.includes(s)) return false;
      }
      return true;
    });
  }, [items, search, subjectFilter, levelFilter]);

  const visibleItems = filteredItems.slice(0, visibleCount);
  const remaining = filteredItems.length - visibleItems.length;

  useEffect(() => { setVisibleCount(PAGE_SIZE); }, [search, subjectFilter, levelFilter]);

  if (loading) {
    return (
      <div className="bg-white/80 backdrop-blur-md border border-slate-200 rounded-3xl p-8 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-violet-500 mx-auto mb-2" />
        <p className="text-slate-600 text-sm font-bold">Memuat koleksi...</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="bg-white/80 backdrop-blur-md border border-slate-200 rounded-3xl p-8 text-center">
        <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <p className="text-slate-700 font-black text-base mb-1">Koleksi kosong</p>
        <p className="text-slate-500 text-xs font-semibold">BBM yang anda jana akan tersimpan di sini secara automatik.</p>
      </div>
    );
  }

  return (
    <>
      <LibraryFilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Cari BBM..."
        totalCount={filteredItems.length}
        filters={[
          { key: 'subject', label: 'Subjek', value: subjectFilter, options: SUBJECT_OPTIONS },
          { key: 'level', label: 'Tahap', value: levelFilter, options: LEVEL_OPTIONS },
        ]}
        onFilterChange={(key, val) => {
          if (key === 'subject') setSubjectFilter(val);
          if (key === 'level') setLevelFilter(val);
        }}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {visibleItems.map(item => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={() => setSelected(item)}
            className="bg-white border border-slate-200 rounded-2xl p-3 shadow-sm hover:shadow-md cursor-pointer transition-all flex items-start gap-3 group"
          >
            <div className="text-3xl flex-shrink-0">{item.emoji || '📄'}</div>
            <div className="flex-1 min-w-0">
              <p className="font-black text-slate-900 text-sm leading-tight line-clamp-2">{item.title}</p>
              <div className="flex flex-wrap gap-1 mt-1.5">
                <span className="px-2 py-0.5 rounded-full bg-violet-50 text-violet-700 text-[10px] font-bold">
                  {SUBJECT_LABELS[item.subject] || item.subject}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold">
                  {LEVEL_LABELS[item.level] || item.level}
                </span>
              </div>
              <p className="text-slate-400 text-[10px] font-semibold mt-1.5 flex items-center gap-1">
                <Calendar className="w-2.5 h-2.5" />
                {new Date(item.created_date).toLocaleDateString('ms-MY')}
              </p>
            </div>
            <button
              onClick={(e) => handleDelete(item.id, e)}
              className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 flex-shrink-0"
              title="Padam"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        ))}
      </div>

      <LoadMoreButton
        onClick={() => setVisibleCount(v => v + PAGE_SIZE)}
        remaining={remaining}
        color="violet"
      />

      {/* Reader modal */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelected(null)}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 print:bg-white print:p-0 print:static"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl print:shadow-none print:rounded-none print:max-h-none"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-slate-200 flex-shrink-0 print:hidden">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-2xl flex-shrink-0">{selected.emoji || '📄'}</span>
                  <p className="font-black text-slate-900 text-sm truncate">{selected.title}</p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button onClick={handlePrint} className="px-3 py-1.5 rounded-xl bg-violet-500 hover:bg-violet-600 text-white text-xs font-black flex items-center gap-1.5 transition-all">
                    <Printer className="w-3.5 h-3.5" /> Cetak
                  </button>
                  <button onClick={() => setSelected(null)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
              {/* Content */}
              <div className="overflow-y-auto p-6 md:p-8 print:overflow-visible">
                <div
                  className="bbm-content prose prose-base max-w-none text-gray-800"
                  style={{ fontFamily: 'Arial, sans-serif', lineHeight: 1.6 }}
                  dangerouslySetInnerHTML={{ __html: selected.htmlContent }}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}