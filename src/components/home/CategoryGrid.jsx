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
};

export default function CategoryGrid() {
  const { ageGroup } = useAgeGroup();
  const [games, setGames] = useState({});
  const [loading, setLoading] = useState(true);

  // Load from DB, fallback to gameLibrary if empty
  const loadGames = async () => {
    try {
      setLoading(true);
      const dbGames = await base44.entities.Game.filter({ ageGroup, isPublished: true });
      
      if (dbGames.length > 0) {
        // Group by category
        const grouped = {};
        Object.keys(CATEGORY_MAP).forEach(cat => { grouped[cat] = []; });
        
        dbGames.forEach(g => {
          if (grouped[g.category]) {
            grouped[g.category].push(g);
          }
        });
        
        setGames(grouped);
      } else {
        // Fallback to static library
        setGames(getGamesByAge(ageGroup));
      }
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

  // Poll for changes every 10 seconds
  useEffect(() => {
    const interval = setInterval(loadGames, 10000);
    return () => clearInterval(interval);
  }, [ageGroup]);

  const categories = Object.keys(games);

  return (
    <div className="grid grid-cols-2 gap-4">
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