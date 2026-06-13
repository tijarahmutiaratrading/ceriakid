import React, { useState, useEffect } from 'react';
import { useAgeGroup } from '@/lib/AgeGroupContext';
import { getGamesByAge } from '@/lib/gameLibrary';
import { base44 } from '@/api/base44Client';
import CategoryCard, { categoryConfigs } from './CategoryCard';

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
  kafa: 'kafa',
};

const SR_ONLY = ['jawi', 'pendidikan_islam', 'pendidikan_moral', 'sejarah', 'rbt', 'pjk', 'seni', 'kafa'];
const KAFA_SUBJECTS = ['kafa_quran', 'kafa_jawi', 'kafa_akidah', 'kafa_ibadah', 'kafa_sirah', 'kafa_adab', 'kafa_bahasa_arab'];

// Versi KLASIK — papar subjek sebagai GRID card hub (bukan scroll horizontal).
export default function CategoryGridClassic() {
  const { ageGroup } = useAgeGroup();
  const [games, setGames] = useState({});

  const loadGames = async () => {
    try {
      const dbGames = await base44.entities.Game.filter({ ageGroup, isPublished: true });

      const grouped = {};
      Object.keys(CATEGORY_MAP).forEach((cat) => { grouped[cat] = []; });
      grouped.kafa = [];

      dbGames.forEach((g) => {
        if (grouped[g.category]) grouped[g.category].push(g);
        if (KAFA_SUBJECTS.includes(g.category)) grouped.kafa.push(g);
      });

      const fallbackGames = getGamesByAge(ageGroup);
      Object.keys(CATEGORY_MAP).forEach((cat) => {
        if (cat === 'kafa') return;
        if ((grouped[cat]?.length || 0) === 0 && (fallbackGames[cat]?.length || 0) > 0) {
          grouped[cat] = fallbackGames[cat];
        }
      });

      setGames(grouped);
    } catch (err) {
      console.error('Failed to load games from DB:', err);
      setGames(getGamesByAge(ageGroup));
    }
  };

  useEffect(() => { loadGames(); }, [ageGroup]);
  useEffect(() => {
    const interval = setInterval(loadGames, 60000);
    return () => clearInterval(interval);
  }, [ageGroup]);

  const categories = Object.keys(CATEGORY_MAP).filter((category) => {
    if (ageGroup !== 'sekolah_rendah' && SR_ONLY.includes(category)) return false;
    return categoryConfigs[category];
  });

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4">
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