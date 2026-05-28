import React from 'react';
import { ChevronDown } from 'lucide-react';

/**
 * Reusable "Load More" button untuk semua AI library.
 */
export default function LoadMoreButton({ onClick, remaining, color = 'amber' }) {
  if (remaining <= 0) return null;

  const colorMap = {
    amber: 'from-amber-400 to-orange-500',
    cyan: 'from-cyan-400 to-blue-500',
    pink: 'from-pink-400 to-rose-500',
    violet: 'from-violet-400 to-purple-500',
  };

  return (
    <div className="mt-3 text-center">
      <button
        onClick={onClick}
        className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r ${colorMap[color] || colorMap.amber} text-white font-black text-xs shadow-md hover:shadow-lg transition-all`}
      >
        <ChevronDown className="w-3.5 h-3.5" />
        Tunjuk Lagi ({remaining})
      </button>
    </div>
  );
}