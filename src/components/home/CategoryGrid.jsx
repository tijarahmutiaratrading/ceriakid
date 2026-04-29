import React from 'react';
import { useAgeGroup } from '@/lib/AgeGroupContext';
import { getGamesByAge } from '@/lib/gameLibrary';
import CategoryCard from './CategoryCard';

export default function CategoryGrid() {
  const { ageGroup } = useAgeGroup();
  const games = getGamesByAge(ageGroup);
  const categories = Object.keys(games);

  return (
    <div className="grid grid-cols-2 gap-4">
      {categories.map((category, i) => (
        <CategoryCard
          key={category}
          category={category}
          gameCount={games[category].length}
          idx={i}
        />
      ))}
    </div>
  );
}