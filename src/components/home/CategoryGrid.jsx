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
  // KAFA — single hub card (klik → /kafa, dalam tu pecah jadi 7 subjek UPKK)
  kafa: 'kafa',
};

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
    // Prasekolah: tiada jawi & KAFA (KAFA bermula peringkat sekolah rendah)
    if (ageGroup !== 'sekolah_rendah') {
      if (category === 'jawi') return false;
      if (category === 'kafa') return false;
    }
    return true;
  });

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
      {categories.map((category, i) => (
        <CategoryCard
          key={category}
          category={category}
          gameCount={games[category]?.length || 0}
          idx={i}
        />
      ))}
    </div>
  );
}