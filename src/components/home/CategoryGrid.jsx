import React, { useState, useEffect } from 'react';
import { useAgeGroup } from '@/lib/AgeGroupContext';
import { getGamesByAge } from '@/lib/gameLibrary';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { categoryConfigs } from './CategoryCard';

const CATEGORY_MAP = {
  bahasa_melayu: 'bahasa_melayu',
  english: 'english',
  mathematics: 'mathematics',
  science: 'science',
  bahasa_tamil: 'bahasa_tamil',
  bahasa_mandarin: 'bahasa_mandarin',
  jawi: 'jawi',
  pendidikan_islam: 'pendidikan_islam',
  pendidikan_moral: 'pendidikan_moral',
  sejarah: 'sejarah',
  rbt: 'rbt',
  pjk: 'pjk',
  seni: 'seni',
  // KAFA — single hub card (klik → /kafa, dalam tu pecah jadi 7 subjek UPKK)
  kafa: 'kafa',
};

// Subjek yang hanya wujud di peringkat sekolah rendah (tiada di prasekolah)
const SR_ONLY = ['jawi', 'pendidikan_islam', 'pendidikan_moral', 'sejarah', 'rbt', 'pjk', 'seni', 'kafa'];

// 7 subjek sebenar KAFA — guna untuk kira total games dalam hub card
const KAFA_SUBJECTS = ['kafa_quran', 'kafa_jawi', 'kafa_akidah', 'kafa_ibadah', 'kafa_sirah', 'kafa_adab', 'kafa_bahasa_arab'];

export default function CategoryGrid() {
  const { ageGroup } = useAgeGroup();
  const [games, setGames] = useState({});
  const [loading, setLoading] = useState(true);

  // Load from DB, fallback to gameLibrary if empty
  const loadGames = async () => {
    try {
      setLoading(true);
      const dbGames = await base44.entities.Game.filter({ ageGroup, isPublished: true });
      
      // Group by category
      const grouped = {};
      Object.keys(CATEGORY_MAP).forEach(cat => { grouped[cat] = []; });
      grouped.kafa = []; // aggregate bucket untuk 7 KAFA subjek

      dbGames.forEach(g => {
        if (grouped[g.category]) {
          grouped[g.category].push(g);
        }
        // Aggregate semua KAFA subjek ke dalam 1 "kafa" bucket untuk hub card
        if (KAFA_SUBJECTS.includes(g.category)) {
          grouped.kafa.push(g);
        }
      });

      const fallbackGames = getGamesByAge(ageGroup);
      Object.keys(CATEGORY_MAP).forEach(cat => {
        if (cat === 'kafa') return; // skip kafa — agg dari DB sahaja
        if ((grouped[cat]?.length || 0) === 0 && (fallbackGames[cat]?.length || 0) > 0) {
          grouped[cat] = fallbackGames[cat];
        }
      });
      
      setGames(grouped);
    } catch (err) {
      console.error('Failed to load games from DB:', err);
      setGames(getGamesByAge(ageGroup));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGames();
  }, [ageGroup]);

  // Poll for changes every 60 seconds
  useEffect(() => {
    const interval = setInterval(loadGames, 60000);
    return () => clearInterval(interval);
  }, [ageGroup]);

  const categories = Object.keys(CATEGORY_MAP).filter(category => {
    // Prasekolah: subjek SR_ONLY hanya muncul di peringkat sekolah rendah
    if (ageGroup !== 'sekolah_rendah' && SR_ONLY.includes(category)) return false;
    return true;
  });

  return (
    <div className="relative -mx-4 sm:-mx-6 lg:-mx-8">
      {/* Fade tepi gaya PS5 */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-slate-950 to-transparent z-10" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-slate-950 to-transparent z-10" />

      <div className="flex gap-3 sm:gap-4 overflow-x-auto scrollbar-hide snap-x px-4 sm:px-6 lg:px-8 pt-2 pb-3">
        {categories.map((category, i) => {
          const config = categoryConfigs[category];
          if (!config) return null;
          const linkTo = category === 'kafa' ? '/kafa' : `/games/${category}`;
          const count = games[category]?.length || 0;
          return (
            <Link key={category} to={linkTo} className="snap-start shrink-0 group" aria-label={config.label}>
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.96 }}
                className="w-[104px] sm:w-[120px]"
              >
                <div className="relative h-[104px] w-[104px] sm:h-[120px] sm:w-[120px] overflow-hidden rounded-2xl ring-1 ring-white/15 group-hover:ring-2 group-hover:ring-white group-hover:shadow-[0_0_25px_rgba(255,255,255,0.25)] transition-all duration-300">
                  {config.image ? (
                    <img src={config.image} alt={config.label} loading="lazy" className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500" onError={(e) => e.target.style.display = 'none'} />
                  ) : (
                    <div className={`h-full w-full bg-gradient-to-br ${config.color} flex items-center justify-center`}>
                      <span className="text-4xl">{config.emoji || '📚'}</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
                  {count > 0 && (
                    <span className="absolute bottom-1.5 right-1.5 rounded-full bg-white/15 backdrop-blur border border-white/20 px-2 py-0.5 text-[9px] font-black text-white">
                      {count}
                    </span>
                  )}
                </div>
                <p className="mt-2 text-center text-[11px] sm:text-xs font-black text-white/70 group-hover:text-white leading-tight transition-colors line-clamp-2">
                  {config.label}
                </p>
              </motion.div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}