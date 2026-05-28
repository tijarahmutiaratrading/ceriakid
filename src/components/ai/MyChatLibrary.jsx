import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, MessageCircle, Trash2, X, Calendar, ArrowRight } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import AIChatMessage from '@/components/ai/AIChatMessage';
import LibraryFilterBar from '@/components/ai/LibraryFilterBar';
import LoadMoreButton from '@/components/ai/LoadMoreButton';

const PAGE_SIZE = 20;

const SUBJECT_OPTIONS = [
  { value: 'bahasa_melayu', label: 'BM' },
  { value: 'english', label: 'English' },
  { value: 'mathematics', label: 'Matematik' },
  { value: 'science', label: 'Sains' },
  { value: 'jawi', label: 'Jawi' },
  { value: 'general', label: 'Umum' },
];

export default function MyChatLibrary({ refreshKey = 0, onResume }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const load = async () => {
    if (!user?.email) return;
    setLoading(true);
    try {
      const list = await base44.entities.ChatConversation.filter(
        { created_by: user.email },
        '-lastMessageAt',
        100
      );
      setItems(list || []);
    } catch (e) {
      console.error('Failed to load chat history:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [user?.email, refreshKey]);

  const handleDelete = async (id, e) => {
    e?.stopPropagation();
    if (!window.confirm('Padam perbualan ini?')) return;
    try {
      await base44.entities.ChatConversation.delete(id);
      setItems(prev => prev.filter(x => x.id !== id));
      if (selected?.id === id) setSelected(null);
      toast({ title: 'Dipadam' });
    } catch (err) {
      toast({ title: 'Ralat', description: err.message, variant: 'destructive' });
    }
  };

  const handleResume = (conv) => {
    setSelected(null);
    onResume?.(conv);
  };

  const filteredItems = useMemo(() => {
    const s = search.trim().toLowerCase();
    return items.filter(conv => {
      if (subjectFilter !== 'all' && conv.subject !== subjectFilter) return false;
      if (s && !(conv.title || '').toLowerCase().includes(s)) return false;
      return true;
    });
  }, [items, search, subjectFilter]);

  const visibleItems = filteredItems.slice(0, visibleCount);
  const remaining = filteredItems.length - visibleItems.length;

  // Reset pagination bila filter/search berubah
  useEffect(() => { setVisibleCount(PAGE_SIZE); }, [search, subjectFilter]);

  if (loading) {
    return (
      <div className="bg-white/80 backdrop-blur-md border border-slate-200 rounded-3xl p-8 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500 mx-auto mb-2" />
        <p className="text-slate-600 text-sm font-bold">Memuat perbualan...</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="bg-white/80 backdrop-blur-md border border-slate-200 rounded-3xl p-8 text-center">
        <MessageCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <p className="text-slate-700 font-black text-base mb-1">Belum ada perbualan</p>
        <p className="text-slate-500 text-xs font-semibold">Perbualan dengan Cikgu Firdaus akan tersimpan di sini.</p>
      </div>
    );
  }

  return (
    <>
      <LibraryFilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Cari perbualan..."
        totalCount={filteredItems.length}
        filters={[
          { key: 'subject', label: 'Subjek', value: subjectFilter, options: SUBJECT_OPTIONS },
        ]}
        onFilterChange={(key, val) => {
          if (key === 'subject') setSubjectFilter(val);
        }}
      />

      <div className="space-y-2">
        {visibleItems.map(conv => (
          <motion.div
            key={conv.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={() => setSelected(conv)}
            className="bg-white border border-slate-200 rounded-2xl p-3 shadow-sm hover:shadow-md cursor-pointer transition-all flex items-start gap-3 group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white flex-shrink-0 shadow">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-black text-slate-900 text-sm leading-tight line-clamp-1">{conv.title}</p>
              <p className="text-slate-500 text-[11px] font-semibold mt-0.5">
                {conv.messageCount || conv.messages?.length || 0} mesej
              </p>
              <p className="text-slate-400 text-[10px] font-semibold mt-1 flex items-center gap-1">
                <Calendar className="w-2.5 h-2.5" />
                {new Date(conv.lastMessageAt || conv.updated_date || conv.created_date).toLocaleString('ms-MY', {
                  day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
                })}
              </p>
            </div>
            <button
              onClick={(e) => handleDelete(conv.id, e)}
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
        color="amber"
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
              className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
            >
              <div className="flex items-center justify-between p-4 border-b border-slate-200 flex-shrink-0">
                <div className="min-w-0">
                  <p className="text-amber-600 text-[10px] font-black uppercase tracking-widest">Perbualan</p>
                  <p className="font-black text-slate-900 text-sm truncate">{selected.title}</p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  {onResume && (
                    <button
                      onClick={() => handleResume(selected)}
                      className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs font-black flex items-center gap-1.5 transition-all"
                    >
                      Sambung <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button onClick={() => setSelected(null)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="overflow-y-auto p-4 space-y-3">
                {(selected.messages || []).map((m, i) => (
                  <AIChatMessage key={i} role={m.role} content={m.content} />
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}