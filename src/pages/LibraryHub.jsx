import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Lock, Library, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { getActiveTier, isGameIndexLocked } from '@/lib/tierAccess';
import { NOTE_SUBJECTS, NOTE_LEVELS } from '@/lib/libraryConfig';
import StudyNoteCard from '@/components/library/StudyNoteCard';
import StudyNoteReader from '@/components/library/StudyNoteReader';
import CinematicHub from '@/components/hub/CinematicHub';

// Art Pixar 3D per subjek
const SUBJECT_ART = {
  all:              'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/25319fa86_generated_image.png',
  bahasa_melayu:    'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/be21bf850_generated_image.png',
  english:          'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/826d26090_generated_image.png',
  mathematics:      'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/e51d9e39b_generated_image.png',
  science:          'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/3ee173577_generated_image.png',
  jawi:             'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/f37ef98f5_generated_image.png',
  pendidikan_islam: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/b426bdcf0_generated_image.png',
  pendidikan_moral: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/beb7d1de4_generated_image.png',
  sejarah:          'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/90072f0d5_generated_image.png',
  rbt:              'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/71d8ab133_generated_image.png',
  pjk:              'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/7a4546dcc_generated_image.png',
  seni:             'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/ed4344389_generated_image.png',
  '3m_membaca':     'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/ab1e98aae_generated_image.png',
  '3m_menulis':     'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/a20cbdced_generated_image.png',
  '3m_mengira':     'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/d8aadf405_generated_image.png',
};

const SUBJECT_ACCENT = {
  all: '#8b5cf6', bahasa_melayu: '#ef4444', english: '#22c55e', mathematics: '#6366f1',
  science: '#06b6d4', jawi: '#f59e0b', pendidikan_islam: '#10b981', pendidikan_moral: '#ec4899',
  sejarah: '#d97706', rbt: '#64748b', pjk: '#f97316', seni: '#a855f7',
  '3m_membaca': '#8b5cf6', '3m_menulis': '#6366f1', '3m_mengira': '#14b8a6',
};

export default function LibraryHub() {
  const { user, isAuthenticated } = useAuth() || {};
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tier, setTier] = useState('free');
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

  // Lock per-bucket: setiap kombinasi subject+level dapat quota sendiri ikut tier.
  const lockedIds = useMemo(() => {
    const buckets = {};
    [...notes]
      .sort((a, b) => new Date(a.created_date || 0) - new Date(b.created_date || 0))
      .forEach((n) => {
        const key = `${n.subject}|${n.level}`;
        const idx = buckets[key] ?? 0;
        buckets[key] = idx + 1;
        n.__locked = isGameIndexLocked({ index: idx, tier, isAuthenticated });
      });
    return notes.reduce((acc, n) => { acc[n.id] = !!n.__locked; return acc; }, {});
  }, [notes, tier, isAuthenticated]);

  const isFree = tier === 'free';

  const countsBySubject = useMemo(() => {
    const map = { all: notes.length };
    notes.forEach((n) => { map[n.subject] = (map[n.subject] || 0) + 1; });
    return map;
  }, [notes]);

  const items = useMemo(() => [
    {
      key: 'all',
      title: 'Semua Subjek',
      desc: 'Nota ringkas & mind map berwarna-warni ikut silibus KSSR — semua subjek dan tahap.',
      emoji: '📚',
      art: SUBJECT_ART.all,
      accent: SUBJECT_ACCENT.all,
      badge: 'Library',
      metaChips: [`📒 ${countsBySubject.all || 0} nota`, '🧠 Mind map'],
    },
    ...NOTE_SUBJECTS.map((s) => ({
      key: s.id,
      title: s.label,
      desc: `Nota ringkas & mind map ${s.label} ikut silibus — Prasekolah hingga Darjah 6.`,
      emoji: s.emoji,
      art: SUBJECT_ART[s.id],
      accent: SUBJECT_ACCENT[s.id] || '#8b5cf6',
      badge: 'Library',
      metaChips: [`📒 ${countsBySubject[s.id] || 0} nota`, '🧠 Mind map'],
    })),
  ], [countsBySubject]);

  const handleOpen = (note) => {
    if (lockedIds[note.id]) return;
    setOpenNote(note);
  };

  return (
    <>
      <CinematicHub
        label="Library Hub"
        labelIcon={Library}
        items={items}
        playLabel={null}
        railLabel="Pilih Subjek"
      >
        {(item) => {
          const filtered = notes.filter((n) =>
            (item.key === 'all' || n.subject === item.key) &&
            (activeLevel === 'all' || n.level === activeLevel)
          );
          return (
            <div className="mt-2">
              {/* Tier banner */}
              {isFree && (
                <div className="mb-5 rounded-3xl bg-amber-400/10 border border-amber-300/25 backdrop-blur p-4 flex items-center gap-3">
                  <Lock className="h-5 w-5 text-amber-300 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="font-black text-amber-200 text-sm">Nota terkunci</p>
                    <p className="text-amber-200/70 text-xs font-bold">Langgan untuk buka nota & mind map ikut pakej anda.</p>
                  </div>
                  <Link to="/settings" className="px-4 py-2 rounded-xl bg-white text-slate-900 font-black text-xs shadow-md whitespace-nowrap">Langgan</Link>
                </div>
              )}

              {/* Filter tahap */}
              <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-4 -mx-1 px-1">
                <LevelPill active={activeLevel === 'all'} onClick={() => setActiveLevel('all')}>Semua Tahap</LevelPill>
                {NOTE_LEVELS.map((l) => (
                  <LevelPill key={l.id} active={activeLevel === l.id} onClick={() => setActiveLevel(l.id)}>{l.label}</LevelPill>
                ))}
              </div>

              {/* Senarai nota */}
              {loading ? (
                <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 text-white/50 animate-spin" /></div>
              ) : filtered.length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-5xl mb-2">📭</p>
                  <p className="font-black text-white">Belum ada nota di sini lagi</p>
                  <p className="text-white/50 text-sm font-bold mt-1">Nota baru akan ditambah dari masa ke masa.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                  {filtered.map((note) => (
                    <StudyNoteCard key={note.id} note={note} locked={lockedIds[note.id]} onOpen={handleOpen} />
                  ))}
                </div>
              )}
            </div>
          );
        }}
      </CinematicHub>

      <StudyNoteReader note={openNote} onClose={() => setOpenNote(null)} />
    </>
  );
}

function LevelPill({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-shrink-0 rounded-full px-3.5 py-2 text-xs font-black whitespace-nowrap transition-all ${
        active ? 'bg-white text-slate-900 shadow-md' : 'bg-white/10 text-white/70 border border-white/15 hover:bg-white/20'
      }`}
    >
      {children}
    </button>
  );
}