import React from 'react';
import { motion } from 'framer-motion';
import { useAgeGroup } from '@/lib/AgeGroupContext';

export default function AgeGroupSelector() {
  const { ageGroup, toggleAgeGroup } = useAgeGroup();

  return (
    <div className="flex gap-3 mb-8">
      {[
        { id: 'prasekolah', label: 'Prasekolah · KSPK (4-6)', emoji: '👶' },
        { id: 'sekolah_rendah', label: 'Sekolah Rendah · KSSR (7-12)', emoji: '👧' },
      ].map(group => (
        <motion.button
          key={group.id}
          whileTap={{ scale: 0.95 }}
          whileHover={{ scale: 1.05 }}
          onClick={() => toggleAgeGroup(group.id)}
          className={`flex-1 rounded-2xl py-3 px-4 font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            ageGroup === group.id
              ? 'clay-button bg-gradient-to-br from-game-purple/30 to-game-pink/30 ring-2 ring-game-purple'
              : 'clay-button hover:bg-gray-50'
          }`}
        >
          <span className="text-2xl">{group.emoji}</span>
          <span className="hidden sm:inline">{group.label}</span>
        </motion.button>
      ))}
    </div>
  );
}