import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { Loader2, BookOpen, Trash2, Printer, X, Calendar } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { useToast } from '@/components/ui/use-toast';

const AGE_LABELS = {
  '4-6': 'Prasekolah',
  '7-9': 'Darjah 1-3',
  '10-12': 'Darjah 4-6',
};

const MORAL_LABELS = {
  kejujuran: 'Kejujuran',
  persahabatan: 'Persahabatan',
  keberanian: 'Keberanian',
  kasih_sayang: 'Kasih Sayang',
  kerajinan: 'Kerajinan',
  tolong_menolong: 'Tolong-Menolong',
  menghormati: 'Menghormati',
  sabar: 'Kesabaran',
};

export default function MyStoryLibrary({ refreshKey = 0 }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  const load = async () => {
    if (!user?.email) return;
    setLoading(true);
    try {
      const list = await base44.entities.AIStory.filter(
        { created_by: user.email },
        '-created_date',
        100
      );
      setItems(list || []);
    } catch (e) {
      console.error('Failed to load story library:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [user?.email, refreshKey]);

  const handleDelete = async (id, e) => {
    e?.stopPropagation();
    if (!window.confirm('Padam cerita ini dari koleksi anda?')) return;
    try {
      await base44.entities.AIStory.delete(id);
      setItems(prev => prev.filter(x => x.id !== id));
      if (selected?.id === id) setSelected(null);
      toast({ title: 'Dipadam', description: 'Cerita telah dipadam dari koleksi.' });
    } catch (err) {
      toast({ title: 'Ralat', description: err.message, variant: 'destructive' });
    }
  };

  const handlePrint = () => window.print();

  if (loading) {
    return (
      <div className="bg-white/80 backdrop-blur-md border border-slate-200 rounded-3xl p-8 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-pink-500 mx-auto mb-2" />
        <p className="text-slate-600 text-sm font-bold">Memuat koleksi...</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="bg-white/80 backdrop-blur-md border border-slate-200 rounded-3xl p-8 text-center">
        <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <p className="text-slate-700 font-black text-base mb-1">Koleksi kosong</p>
        <p className="text-slate-500 text-xs font-semibold">Cerita yang anda jana akan tersimpan di sini secara automatik.</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {items.map(item => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={() => setSelected(item)}
            className="bg-white border border-slate-200 rounded-2xl p-3 shadow-sm hover:shadow-md cursor-pointer transition-all flex items-start gap-3 group"
          >
            {item.coverImage ? (
              <img src={item.coverImage} alt={item.title} className="w-16 h-16 rounded-xl object-cover flex-shrink-0 ring-1 ring-slate-200" />
            ) : (
              <div className="text-3xl flex-shrink-0">{item.emoji || '📖'}</div>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-black text-slate-900 text-sm leading-tight line-clamp-2">{item.title}</p>
              {item.moralSummary && (
                <p className="text-slate-500 text-[11px] italic mt-1 line-clamp-1">{item.moralSummary}</p>
              )}
              <div className="flex flex-wrap gap-1 mt-1.5">
                <span className="px-2 py-0.5 rounded-full bg-pink-50 text-pink-700 text-[10px] font-bold">
                  {AGE_LABELS[item.ageRange] || item.ageRange}
                </span>
                {item.moralLesson && (
                  <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold">
                    {MORAL_LABELS[item.moralLesson] || item.moralLesson}
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
              title="Padam"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        ))}
      </div>

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
                  <span className="text-2xl flex-shrink-0">{selected.emoji || '📖'}</span>
                  <p className="font-black text-slate-900 text-sm truncate">{selected.title}</p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button onClick={handlePrint} className="px-3 py-1.5 rounded-xl bg-pink-500 hover:bg-pink-600 text-white text-xs font-black flex items-center gap-1.5 transition-all">
                    <Printer className="w-3.5 h-3.5" /> Cetak
                  </button>
                  <button onClick={() => setSelected(null)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
              {/* Content */}
              <div className="overflow-y-auto p-6 md:p-8 print:overflow-visible">
                {selected.coverImage && (
                  <div className="mb-6 rounded-2xl overflow-hidden shadow-xl print:shadow-none">
                    <img src={selected.coverImage} alt={selected.title} className="w-full h-auto object-cover" />
                  </div>
                )}
                <div className="text-center mb-6">
                  {!selected.coverImage && <p className="text-5xl mb-2">{selected.emoji || '📖'}</p>}
                  <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-1">{selected.title}</h2>
                  {selected.moralSummary && (
                    <p className="text-sm text-gray-500 italic">{selected.moralSummary}</p>
                  )}
                </div>
                <div className="prose prose-base max-w-none text-gray-800 leading-relaxed">
                  <ReactMarkdown>{selected.story}</ReactMarkdown>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}