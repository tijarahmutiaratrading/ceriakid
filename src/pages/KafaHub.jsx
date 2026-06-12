import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import CinematicHub from '@/components/hub/CinematicHub';
import { useAgeGroup } from '@/lib/AgeGroupContext';

// 7 subjek KAFA UPKK rasmi JAKIM — Darjah 1 hingga 6
const KAFA_SUBJECTS = [
  { key: 'kafa_quran',       emoji: '📖', label: 'Al-Quran & Hafazan',  desc: 'Bacaan, tajwid asas, hafazan surah pilihan untuk anak.',  accent: '#10b981', art: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/87a679cc1_generated_image.png' },
  { key: 'kafa_jawi',        emoji: '✍️', label: 'Jawi & Khat',          desc: 'Tulisan Jawi rasmi DBP & seni khat naskhi.',              accent: '#8b5cf6', art: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/d0b540b54_generated_image.png' },
  { key: 'kafa_akidah',      emoji: '☪️', label: 'Akidah',               desc: 'Rukun iman, sifat Allah & asas kepercayaan.',             accent: '#14b8a6', art: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/c62e76171_generated_image.png' },
  { key: 'kafa_ibadah',      emoji: '🕌', label: 'Ibadah & Fekah',       desc: 'Solat, wuduk, puasa, zakat & haji.',                      accent: '#3b82f6', art: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/fdc3130ab_generated_image.png' },
  { key: 'kafa_sirah',       emoji: '🌙', label: 'Sirah Nabawiyah',      desc: 'Sejarah Nabi Muhammad SAW & para sahabat.',               accent: '#6366f1', art: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/b641b349b_generated_image.png' },
  { key: 'kafa_adab',        emoji: '🤲', label: 'Adab & Akhlak',        desc: 'Akhlak Islamiah & adab dalam kehidupan harian.',          accent: '#f43f5e', art: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/4e4edbc96_generated_image.png' },
  { key: 'kafa_bahasa_arab', emoji: '🔤', label: 'Bahasa Arab',          desc: 'Kosa kata & ayat mudah Bahasa Arab.',                     accent: '#f59e0b', art: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/7b5dc1406_generated_image.png' },
];

export default function KafaHub() {
  const { ageGroup } = useAgeGroup();
  const [counts, setCounts] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const all = await Promise.all(
          KAFA_SUBJECTS.map(s =>
            base44.entities.Game.filter({ category: s.key, ageGroup: 'sekolah_rendah', isPublished: true })
          )
        );
        if (!active) return;
        const map = {};
        KAFA_SUBJECTS.forEach((s, i) => { map[s.key] = all[i].length; });
        setCounts(map);
      } catch (e) {
        console.error('Failed to load KAFA counts:', e);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  const items = KAFA_SUBJECTS.map((s) => ({
    key: s.key,
    title: s.label,
    desc: s.desc,
    emoji: s.emoji,
    art: s.art,
    accent: s.accent,
    badge: 'KAFA · UPKK',
    to: `/games/${s.key}`,
    metaChips: [
      `🎮 ${loading ? '...' : (counts[s.key] || 0)} game`,
      '🎓 Darjah 1–6',
    ],
  }));

  return (
    <CinematicHub
      label="KAFA"
      backTo="/dashboard"
      backLabel="Dashboard"
      items={items}
      playLabel="Mula Belajar"
      railLabel="Pilih Subjek"
    >
      {ageGroup !== 'sekolah_rendah' && (
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 rounded-3xl bg-amber-400/10 border border-amber-300/25 backdrop-blur-xl p-5"
        >
          <p className="text-amber-200 text-sm font-bold">
            ⚠️ KAFA hanya untuk peringkat Sekolah Rendah (Darjah 1-6). Tukar peringkat anak di profil untuk akses.
          </p>
        </motion.div>
      )}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl p-5"
      >
        <h3 className="font-black text-white/90 text-sm mb-1">🕌 Kelas Agama Fardhu Ain</h3>
        <p className="text-white/60 text-xs font-bold">7 subjek mengikut sukatan UPKK rasmi JAKIM · Darjah 1 hingga 6.</p>
      </motion.div>
    </CinematicHub>
  );
}