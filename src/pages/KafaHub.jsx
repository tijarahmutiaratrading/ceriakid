import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import AppHeader from '@/components/AppHeader';
import { useAgeGroup } from '@/lib/AgeGroupContext';

// 7 subjek KAFA UPKK rasmi JAKIM — Darjah 1 hingga 6
const KAFA_SUBJECTS = [
  { key: 'kafa_quran',       emoji: '📖', label: 'Al-Quran & Hafazan',  desc: 'Bacaan, tajwid asas, hafazan surah',     color: 'from-emerald-400 to-teal-500',  bgImage: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/87a679cc1_generated_image.png' },
  { key: 'kafa_jawi',        emoji: '✍️', label: 'Jawi & Khat',          desc: 'Tulisan Jawi rasmi DBP, khat naskhi',   color: 'from-purple-400 to-indigo-500', bgImage: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/d0b540b54_generated_image.png' },
  { key: 'kafa_akidah',      emoji: '☪️', label: 'Akidah',               desc: 'Rukun iman, sifat Allah, kepercayaan',  color: 'from-teal-400 to-cyan-500',     bgImage: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/c62e76171_generated_image.png' },
  { key: 'kafa_ibadah',      emoji: '🕌', label: 'Ibadah & Fekah',       desc: 'Solat, wuduk, puasa, zakat, haji',      color: 'from-blue-400 to-sky-500',      bgImage: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/fdc3130ab_generated_image.png' },
  { key: 'kafa_sirah',       emoji: '🌙', label: 'Sirah Nabawiyah',      desc: 'Sejarah Nabi & para sahabat',           color: 'from-indigo-400 to-violet-500', bgImage: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/b641b349b_generated_image.png' },
  { key: 'kafa_adab',        emoji: '🤲', label: 'Adab & Akhlak',        desc: 'Akhlak Islamiah & adab harian',         color: 'from-rose-400 to-pink-500',     bgImage: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/4e4edbc96_generated_image.png' },
  { key: 'kafa_bahasa_arab', emoji: '🔤', label: 'Bahasa Arab',          desc: 'Kosa kata & ayat mudah',                color: 'from-amber-500 to-orange-500',  bgImage: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/7b5dc1406_generated_image.png' },
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

  return (
    <div className="min-h-screen w-full font-nunito relative">
      <AppHeader showBack={true} backTo="/dashboard" title="KAFA" />

      <div className="relative w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-32 pt-20 md:pt-24">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative isolate overflow-hidden mb-6 p-6 rounded-3xl shadow-2xl border border-white/30"
          style={{ background: 'linear-gradient(135deg, hsl(160 70% 40%), hsl(190 80% 45%), hsl(280 60% 55%))' }}
        >
          <div className="absolute inset-0 opacity-20" style={{
            backgroundImage: 'radial-gradient(circle at 20% 30%, rgba(255,255,255,0.5) 0%, transparent 40%), radial-gradient(circle at 80% 70%, rgba(255,255,255,0.4) 0%, transparent 40%)'
          }} />
          <Link to="/dashboard" className="relative inline-flex items-center gap-2 text-white/95 text-xs font-black mb-3 drop-shadow-md">
            <ArrowLeft className="w-4 h-4" /> Kembali ke kategori
          </Link>
          <div className="relative flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/25 backdrop-blur-md ring-1 ring-white/40 flex items-center justify-center text-4xl shadow-lg flex-shrink-0">
              🕌
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight drop-shadow-lg">KAFA</h1>
              <p className="text-white/95 text-sm font-bold mt-1 drop-shadow-md">Kelas Agama Fardhu Ain · Sukatan UPKK JAKIM</p>
              <p className="text-white/80 text-xs font-semibold mt-0.5">7 subjek · Darjah 1 hingga 6</p>
            </div>
          </div>
        </motion.div>

        {/* Notice kalau bukan sekolah_rendah */}
        {ageGroup !== 'sekolah_rendah' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-4 p-4 rounded-2xl bg-amber-100/90 border border-amber-300 text-amber-900 text-sm font-bold backdrop-blur-md"
          >
            ⚠️ KAFA hanya untuk peringkat Sekolah Rendah (Darjah 1-6). Tukar peringkat anak di profil untuk akses.
          </motion.div>
        )}

        {/* 7 Subject Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {KAFA_SUBJECTS.map((subject, idx) => (
            <Link key={subject.key} to={`/games/${subject.key}`}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.06 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.96 }}
                className="rounded-3xl overflow-hidden cursor-pointer h-full min-h-[150px] sm:min-h-[180px] group relative border border-white/50 shadow-lg shadow-black/10 hover:shadow-xl transition-shadow"
              >
                {/* AI-generated background image */}
                {subject.bgImage && (
                  <img
                    src={subject.bgImage}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover z-0"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                )}
                {/* Color tint overlay for theme consistency */}
                <div className={`absolute inset-0 bg-gradient-to-br ${subject.color} opacity-40 z-[1]`} />
                {/* Emoji decoration */}
                <div className="absolute right-4 top-4 text-6xl sm:text-7xl opacity-40 group-hover:opacity-70 transition-opacity z-[2] drop-shadow-lg">
                  {subject.emoji}
                </div>
                {/* Bottom gradient for text legibility */}
                <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/85 via-black/45 to-transparent z-[3]" />
                <div className="relative z-10 p-4 sm:p-5 h-full min-h-[150px] sm:min-h-[180px] flex flex-col justify-between">
                  <div>
                    <h3 className="font-black text-lg sm:text-xl text-white leading-tight drop-shadow-md">{subject.label}</h3>
                    <p className="text-white/85 text-xs font-semibold mt-1 drop-shadow-md line-clamp-2">{subject.desc}</p>
                  </div>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full font-black shadow-xl ring-1 ring-white/40 bg-gradient-to-br from-white/35 to-white/15 backdrop-blur-lg w-fit">
                    <span className="text-sm">🎮</span>
                    <p className="text-xs text-white whitespace-nowrap leading-none font-bold">
                      {loading ? '...' : (counts[subject.key] || 0)} <span className="text-white/90">Game</span>
                    </p>
                  </div>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}