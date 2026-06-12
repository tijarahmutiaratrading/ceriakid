import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAgeGroup } from '@/lib/AgeGroupContext';
import { base44 } from '@/api/base44Client';
import { getGamesByAge } from '@/lib/gameLibrary';
import { getSubjectArt, getSubjectAccent } from '@/lib/subjectArt';
import CinematicShowcase from '@/components/hub/CinematicShowcase';
import CinematicRail from '@/components/hub/CinematicRail';

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

export default function HomeSubjectShowcase() {
  const { ageGroup } = useAgeGroup() || {};
  const navigate = useNavigate();
  const safeAgeGroup = ageGroup || 'prasekolah';
  const [counts, setCounts] = useState({});
  const [selectedIdx, setSelectedIdx] = useState(0);

  useEffect(() => { setSelectedIdx(0); }, [safeAgeGroup]);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const dbGames = await base44.entities.Game.filter({ ageGroup: safeAgeGroup, isPublished: true });
        if (!active) return;
        const grouped = {};
        dbGames.forEach(g => {
          grouped[g.category] = (grouped[g.category] || 0) + 1;
          if (KAFA_SUBJECT_KEYS.includes(g.category)) grouped.kafa = (grouped.kafa || 0) + 1;
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

  if (!items.length) return null;

  const safeIdx = Math.min(selectedIdx, items.length - 1);
  const item = items[safeIdx];
  const handlePlay = () => navigate(item.to);

  return (
    <div className="relative">
      <div className="relative">
        <CinematicShowcase item={item} playLabel="Pilih Subjek Ini" onPlay={handlePlay} />
        <CinematicRail items={items} selected={safeIdx} onSelect={setSelectedIdx} onActivate={handlePlay} />
      </div>
    </div>
  );
}