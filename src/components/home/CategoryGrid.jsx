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
  // KAFA — Kelas Agama Fardhu Ain (Premium only)
  kafa_quran_jawi: 'kafa_quran_jawi',
  kafa_ulum_syariah: 'kafa_ulum_syariah',
  kafa_sirah: 'kafa_sirah',
  kafa_adab: 'kafa_adab',
  kafa_bahasa_arab: 'kafa_bahasa_arab',
};

// KAFA hanya untuk sekolah_rendah (tidak ditunjukkan dalam prasekolah)
const KAFA_CATEGORIES = ['kafa_quran_jawi', 'kafa_ulum_syariah', 'kafa_sirah', 'kafa_adab', 'kafa_bahasa_arab'];

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
      
      dbGames.forEach(g => {
        if (grouped[g.category]) {
          grouped[g.category].push(g);
        }
      });

      const fallbackGames = getGamesByAge(ageGroup);
      Object.keys(CATEGORY_MAP).forEach(cat => {
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
      if (KAFA_CATEGORIES.includes(category)) return false;
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