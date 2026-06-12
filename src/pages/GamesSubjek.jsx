import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, GraduationCap } from 'lucide-react';
import { useAgeGroup } from '@/lib/AgeGroupContext';
import { base44 } from '@/api/base44Client';
import { getGamesByAge } from '@/lib/gameLibrary';
import { getSubjectArt, getSubjectAccent } from '@/lib/subjectArt';
import CinematicShowcase from '@/components/hub/CinematicShowcase';
import CinematicRail from '@/components/hub/CinematicRail';
import CinematicTips from '@/components/hub/CinematicTips';

const SUBJECTS = [
  { key: 'bahasa_melayu',    emoji: '🇲🇾', label: 'Bahasa Melayu',         desc: 'Kenal huruf, suku kata, perkataan & ayat mudah.' },
  { key: 'english',          emoji: '🇬🇧', label: 'English',               desc: 'Letters, words, phonics & simple sentences.' },
  { key: 'mathematics',      emoji: '🔢', label: 'Matematik',              desc: 'Nombor, mengira, operasi & penyelesaian masalah.' },
  { key: 'science',          emoji: '🧪', label: 'Sains',                  desc: 'Alam semula jadi, haiwan, tumbuhan & eksperimen.' },
  { key: 'bahasa_tamil',     emoji: '🇮🇳', label: 'Bahasa Tamil',          desc: 'Huruf, kosa kata & bacaan asas Bahasa Tamil.' },
  { key: 'bahasa_mandarin',  emoji: '🇨🇳', label: 'Bahasa Mandarin',       desc: 'Aksara, kosa kata & bacaan asas Bahasa Mandarin.' },
  { key: 'jawi',             emoji: '🕌', label: 'Aksara Jawi',            desc: 'Kenal & baca huruf Jawi langkah demi langkah.', srOnly: true },
  { key: 'pendidikan_islam', emoji: '🕋', label: 'Pendidikan Islam',       desc: 'Asas akidah, ibadah & akhlak harian.', srOnly: true },
  { key: 'pendidikan_moral', emoji: '🤝', label: 'Pendidikan Moral',       desc: 'Nilai murni & sahsiah dalam kehidupan.', srOnly: true },
  { key: 'sejarah',          emoji: '📜', label: 'Sejarah',                desc: 'Sejarah Malaysia & tokoh-tokoh penting.', srOnly: true },
  { key: 'rbt',              emoji: '🔧', label: 'Reka Bentuk & Teknologi', desc: 'Asas reka bentuk, alatan & teknologi.', srOnly: true },
  { key: 'pjk',              emoji: '⚽', label: 'PJ & Kesihatan',         desc: 'Sukan, kecergasan & penjagaan kesihatan.', srOnly: true },
  { key: 'seni',             emoji: '🎨', label: 'Seni Visual',            desc: 'Warna, lukisan & kreativiti seni.', srOnly: true },
  { key: 'kafa',             emoji: '🕌', label: 'KAFA',                   desc: '7 subjek UPKK JAKIM: Al-Quran, Jawi, Akidah, Ibadah, Sirah, Adab & Bahasa Arab.', srOnly: true, to: '/kafa' },
];

const KAFA_SUBJECT_KEYS = ['kafa_quran', 'kafa_jawi', 'kafa_akidah', 'kafa_ibadah', 'kafa_sirah', 'kafa_adab', 'kafa_bahasa_arab'];

const AGE_OPTIONS = [
  { key: 'prasekolah', label: 'Prasekolah (KSPK)', sub: '4–6 Tahun', emoji: '🎨' },
  { key: 'sekolah_rendah', label: 'Sekolah Rendah (KSSR)', sub: '7–12 Tahun', emoji: '📚' },
];

export default function GamesSubjek() {
  const { ageGroup, toggleAgeGroup } = useAgeGroup() || {};
  const navigate = useNavigate();
  const safeAgeGroup = ageGroup || 'prasekolah';
  const safeToggle = toggleAgeGroup || (() => {});
  const [counts, setCounts] = useState({});
  const [selectedIdx, setSelectedIdx] = useState(0);

  useEffect(() => {
    setSelectedIdx(0);
  }, [safeAgeGroup]);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const dbGames = await base44.entities.Game.filter({ ageGroup: safeAgeGroup, isPublished: true });
        if (!active) return;
        const grouped = {};
        dbGames.forEach(g => {
          grouped[g.category] = (grouped[g.category] || 0) + 1;
          if (KAFA_SUBJECT_KEYS.includes(g.category)) {
            grouped.kafa = (grouped.kafa || 0) + 1;
          }
        });
        const fallback = getGamesByAge(safeAgeGroup);
        SUBJECTS.forEach(s => {
          if (s.key === 'kafa') return;
          if (!grouped[s.key] && fallback[s.key]?.length) grouped[s.key] = fallback[s.key].length;
        });
        setCounts(grouped);
      } catch (err) {
        console.error('Failed to load game counts:', err);
      }
    })();
    return () => { active = false; };
  }, [safeAgeGroup]);

  const visibleSubjects = SUBJECTS.filter(s => safeAgeGroup === 'sekolah_rendah' || !s.srOnly);

  const items = visibleSubjects.map((s) => ({
    key: s.key,
    title: s.label,
    desc: s.desc,
    emoji: s.emoji,
    art: getSubjectArt(s.key),
    accent: getSubjectAccent(s.key),
    badge: safeAgeGroup === 'sekolah_rendah' ? 'KSSR' : 'KSPK',
    to: s.to || `/games/${s.key}`,
    metaChips: [
      `🎮 ${counts[s.key] || 0} game`,
      safeAgeGroup === 'sekolah_rendah' ? '🎓 Darjah 1–6' : '🧒 4–6 Tahun',
    ],
  }));

  const safeIdx = Math.min(selectedIdx, items.length - 1);
  const item = items[safeIdx];
  const handlePlay = () => navigate(item.to);

  return (
    <div className="min-h-screen bg-slate-950 pb-28 relative overflow-hidden font-nunito">
      {/* Latar sinematik — art subjek terpilih blur penuh skrin */}
      <AnimatePresence mode="sync">
        <motion.div
          key={item.key}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0 pointer-events-none"
        >
          {item.art ? (
            <img src={item.art} alt="" className="h-full w-full object-cover scale-110 blur-2xl opacity-30" />
          ) : (
            <div className="h-full w-full" style={{ background: `radial-gradient(80% 80% at 50% 30%, ${item.accent}44, transparent)` }} />
          )}
        </motion.div>
      </AnimatePresence>
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/70 via-slate-950/55 to-slate-950 pointer-events-none" />
      <motion.div
        animate={{ background: `radial-gradient(60% 50% at 70% 30%, ${item.accent}33 0%, transparent 70%)` }}
        transition={{ duration: 0.8 }}
        className="absolute inset-0 pointer-events-none"
      />

      <div className="relative z-10 max-w-7xl mx-auto page-px pt-6 sm:pt-10">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/15 backdrop-blur px-4 py-2 text-sm font-black text-white hover:bg-white/20 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Dashboard
          </Link>
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/15 backdrop-blur px-4 py-2">
            <GraduationCap className="w-4 h-4 text-white" />
            <span className="text-xs font-black text-white uppercase tracking-[0.25em]">Subjek</span>
          </div>
        </div>

        {/* Age group toggle — pill glass gelap */}
        <div className="mb-6">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 mb-2 px-1">Pilih Umur Anak</p>
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 -mx-1 px-1">
            {AGE_OPTIONS.map((age) => {
              const active = safeAgeGroup === age.key;
              return (
                <motion.button
                  key={age.key}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => safeToggle(age.key)}
                  className={`flex-shrink-0 min-h-10 px-4 py-2 rounded-full font-black text-sm transition-all inline-flex items-center gap-2 ${
                    active
                      ? 'bg-white text-slate-900 shadow-lg'
                      : 'bg-white/10 text-white/70 border border-white/15 hover:bg-white/20'
                  }`}
                >
                  {age.emoji} {age.label}
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                    active ? 'bg-slate-900/10 text-slate-700' : 'bg-white/10 text-white/60'
                  }`}>
                    {age.sub}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Showcase + rail gaya PS5 */}
        <CinematicShowcase item={item} playLabel="Pilih Subjek Ini" onPlay={handlePlay} />

        <div className="mt-8 sm:mt-12">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 mb-1">
            Pilih Subjek · {safeIdx + 1}/{items.length}
          </p>
          <CinematicRail items={items} selected={safeIdx} onSelect={setSelectedIdx} onActivate={handlePlay} />
        </div>

        <CinematicTips />
      </div>
    </div>
  );
}