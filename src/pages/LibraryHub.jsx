import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Lock, Library, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { getActiveTier, isGameIndexLocked } from '@/lib/tierAccess';
import { NOTE_SUBJECTS, NOTE_LEVELS } from '@/lib/libraryConfig';
import StudyNoteCard from '@/components/library/StudyNoteCard';
import StudyNoteReader from '@/components/library/StudyNoteReader';
import AppHeader from '@/components/AppHeader';

export default function LibraryHub() {
  const { user, isAuthenticated } = useAuth() || {};
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tier, setTier] = useState('free');
  const [activeSubject, setActiveSubject] = useState('all');
  const [activeLevel, setActiveLevel] = useState('all');
  const [openNote, setOpenNote] = useState(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      const [list, subs] = await Promise.all([
        base44.entities.StudyNote.filter({ isPublished: true }, '-created_date', 500),
        user?.email ? base44.entities.UserSubscription.filter({ email: user.email }) : Promise.resolve([]),
      ]);
      if (!alive) return;
      setNotes(list || []);
      setTier(getActiveTier(subs?.[0]));
      setLoading(false);
    })();
    return () => { alive = false; };
  }, [user?.email]);

  // Lock per-bucket macam Games Subjek: setiap kombinasi subject+level dapat
  // quota sendiri ikut tier. Susun nota dalam bucket ikut tarikh cipta (lama dulu)
  // supaya nota awal yang dibuka untuk tier rendah.
  const lockedIds = useMemo(() => {
    const buckets = {};
    [...notes]
      .sort((a, b) => new Date(a.created_date || 0) - new Date(b.created_date || 0))
      .forEach((n) => {
        const key = `${n.subject}|${n.level}`;
        const idx = buckets[key] ?? 0;
        buckets[key] = idx + 1;
        if (isGameIndexLocked({ index: idx, tier, isAuthenticated })) {
          n.__locked = true;
        } else {
          n.__locked = false;
        }
      });
    return notes.reduce((acc, n) => { acc[n.id] = !!n.__locked; return acc; }, {});
  }, [notes, tier, isAuthenticated]);

  const isFree = tier === 'free';

  const filtered = useMemo(() => notes.filter((n) =>
    (activeSubject === 'all' || n.subject === activeSubject) &&
    (activeLevel === 'all' || n.level === activeLevel)
  ), [notes, activeSubject, activeLevel]);

  const handleOpen = (note) => {
    if (lockedIds[note.id]) return; // locked ikut tier
    setOpenNote(note);
  };

  return (
    <div className="min-h-screen w-full font-nunito relative">
      <AppHeader showBack={true} backTo="/dashboard" title="Library Hub" />

      <div className="relative w-full max-w-7xl mx-auto page-px pb-16 pt-4">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative isolate overflow-hidden mb-5 p-6 rounded-3xl shadow-2xl border border-white/30"
          style={{ background: 'linear-gradient(135deg, hsl(280 65% 55%), hsl(330 75% 58%), hsl(25 95% 58%))' }}
        >
          <div className="absolute inset-0 opacity-20" style={{
            backgroundImage: 'radial-gradient(circle at 20% 30%, rgba(255,255,255,0.5) 0%, transparent 40%), radial-gradient(circle at 80% 70%, rgba(255,255,255,0.4) 0%, transparent 40%)'
          }} />
          <Link to="/dashboard" className="relative inline-flex items-center gap-2 text-white/95 text-xs font-black mb-3 drop-shadow-md">
            <ArrowLeft className="w-4 h-4" /> Kembali
          </Link>
          <div className="relative flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/25 backdrop-blur-md ring-1 ring-white/40 flex items-center justify-center flex-shrink-0">
              <Library className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight drop-shadow-lg">Library Hub</h1>
              <p className="text-white/95 text-sm font-bold mt-1 drop-shadow-md">Nota ringkas & mind map berwarna-warni</p>
              <p className="text-white/80 text-xs font-semibold mt-0.5">Ikut silibus KSSR · Semua subjek & tahap</p>
            </div>
          </div>
        </motion.div>

        {/* Tier banner — ikut sistem lock Games Subjek */}
        {isFree && (
          <div className="mb-5 rounded-2xl bg-amber-50 ring-1 ring-amber-200 p-4 flex items-center gap-3">
            <Lock className="h-5 w-5 text-amber-500 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-black text-amber-800 text-sm">Nota terkunci</p>
              <p className="text-amber-700 text-xs font-bold">Langgan untuk buka nota & mind map ikut pakej anda.</p>
            </div>
            <Link to="/settings" className="px-4 py-2 rounded-xl brand-gradient text-white font-black text-xs shadow-md whitespace-nowrap">Langgan</Link>
          </div>
        )}

        {/* Filter subjek */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 -mx-1 px-1">
          <FilterPill active={activeSubject === 'all'} onClick={() => setActiveSubject('all')}>Semua Subjek</FilterPill>
          {NOTE_SUBJECTS.map((s) => (
            <FilterPill key={s.id} active={activeSubject === s.id} onClick={() => setActiveSubject(s.id)}>
              {s.emoji} {s.label}
            </FilterPill>
          ))}
        </div>

        {/* Filter tahap */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-3 -mx-1 px-1">
          <FilterPill active={activeLevel === 'all'} onClick={() => setActiveLevel('all')} small>Semua Tahap</FilterPill>
          {NOTE_LEVELS.map((l) => (
            <FilterPill key={l.id} active={activeLevel === l.id} onClick={() => setActiveLevel(l.id)} small>{l.label}</FilterPill>
          ))}
        </div>

        {/* Senarai nota */}
        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 text-purple-400 animate-spin" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-5xl mb-2">📭</p>
            <p className="font-black text-slate-700">Belum ada nota di sini lagi</p>
            <p className="text-slate-500 text-sm font-bold mt-1">Nota baru akan ditambah dari masa ke masa.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {filtered.map((note) => (
              <StudyNoteCard key={note.id} note={note} locked={lockedIds[note.id]} onOpen={handleOpen} />
            ))}
          </div>
        )}
      </div>

      <StudyNoteReader note={openNote} onClose={() => setOpenNote(null)} />
    </div>
  );
}

function FilterPill({ active, onClick, children, small }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-shrink-0 rounded-full font-black whitespace-nowrap transition-all ${small ? 'px-3 py-1.5 text-xs' : 'px-3.5 py-2 text-xs'} ${
        active ? 'brand-gradient text-white shadow-md' : 'bg-white text-slate-600 ring-1 ring-slate-200'
      }`}
    >
      {children}
    </button>
  );
}