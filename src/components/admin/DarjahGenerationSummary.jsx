import React from 'react';

const DARJAH_LEVELS = [
  { id: 'darjah_1', label: 'D1' },
  { id: 'darjah_2', label: 'D2' },
  { id: 'darjah_3', label: 'D3' },
  { id: 'darjah_4', label: 'D4' },
  { id: 'darjah_5', label: 'D5' },
  { id: 'darjah_6', label: 'D6' },
];

export default function DarjahGenerationSummary({ counts, targetGames, selected }) {
  const darjahCounts = counts?.darjah || {};

  return (
    <div className="mt-2 grid grid-cols-3 sm:grid-cols-6 gap-1.5">
      {DARJAH_LEVELS.map(({ id, label }) => {
        const games = darjahCounts[id]?.games || 0;
        const needed = Math.max(0, targetGames - games);
        return (
          <div
            key={id}
            className={`rounded-lg px-2 py-1 text-center border ${
              selected
                ? 'bg-indigo-50 border-indigo-100 text-indigo-700'
                : 'bg-white/10 border-white/10 text-white/80'
            }`}
          >
            <p className="text-[10px] font-black leading-none">{label}</p>
            <p className="text-[11px] font-black mt-0.5">{games}</p>
            {needed > 0 && <p className="text-[9px] font-black text-green-400 leading-none">+{needed}</p>}
          </div>
        );
      })}
    </div>
  );
}