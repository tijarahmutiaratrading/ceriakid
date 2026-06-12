import React, { useState, useEffect } from 'react';
import { useAgeGroup } from '@/lib/AgeGroupContext';
import { getGamesByAge } from '@/lib/gameLibrary';
import { base44 } from '@/api/base44Client';
import CategoryCard from './CategoryCard';

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

      <div className="flex gap-3 sm:gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory px-4 sm:px-6 lg:px-8 pb-2">
        {categories.map((category, i) => (
          <div key={category} className="snap-start shrink-0 w-[240px] sm:w-[280px]">
            <CategoryCard
              category={category}
              gameCount={games[category]?.length || 0}
              idx={i}
            />
          </div>
        ))}
      </div>
    </div>
  );
}