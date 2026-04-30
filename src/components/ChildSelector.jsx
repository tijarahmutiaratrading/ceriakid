import React from 'react';
import { motion } from 'framer-motion';
import { useSelectedChild } from '@/lib/SelectedChildContext';
import { useNavigate } from 'react-router-dom';

export default function ChildSelector() {
  const { selectedChild, setSelectedChild, childrenList, loading } = useSelectedChild();
  const navigate = useNavigate();

  if (loading || childrenList.length === 0) {
    return null;
  }

  if (childrenList.length === 1) {
    return null; // No need to show selector if only one child
  }

  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-white/40 backdrop-blur-xl rounded-full border border-white/30 shadow-lg">
      <span className="text-sm font-bold text-gray-700">Bermain sebagai:</span>
      <select
        value={selectedChild?.id || ''}
        onChange={(e) => {
          const child = childrenList.find(c => c.id === parseInt(e.target.value));
          setSelectedChild(child);
        }}
        className="px-3 py-1 rounded-full bg-game-purple text-white font-bold text-sm border-0 focus:outline-none cursor-pointer"
      >
        {childrenList.map(child => (
          <option key={child.id} value={child.id}>
            {child.name}
          </option>
        ))}
      </select>
    </div>
  );
}