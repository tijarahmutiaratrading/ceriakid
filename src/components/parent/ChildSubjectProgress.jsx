import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { BookOpen } from 'lucide-react';

const categoryLabels = {
  bahasa_melayu: 'Bahasa Melayu', english: 'English', mathematics: 'Matematik',
  science: 'Sains', jawi: 'Jawi', bahasa_tamil: 'Bahasa Tamil', bahasa_mandarin: 'Bahasa Mandarin',
};
const categoryEmojis = {
  bahasa_melayu: '🇲🇾', english: '🇬🇧', mathematics: '🔢', science: '🧪',
  jawi: '🕌', bahasa_tamil: '🌺', bahasa_mandarin: '🏮',
};

export default function ChildSubjectProgress({ games }) {
  const subjects = useMemo(() => {
    const map = {};
    games.forEach((g) => {
      if (!map[g.category]) map[g.category] = { stars: 0, played: 0, perfect: 0 };
      map[g.category].stars += g.bestStars || 0;
      map[g.category].played += 1;
      if (g.bestStars === 3) map[g.category].perfect += 1;
    });
    return Object.entries(map)
      .map(([cat, s]) => ({
        cat, avg: s.stars / s.played, played: s.played, perfect: s.perfect,
        totalStars: s.stars, pct: (s.stars / (s.played * 3)) * 100,
      }))
      .sort((a, b) => b.pct - a.pct);
  }, [games]);

  if (subjects.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-3xl shadow-xl border border-white/60 overflow-hidden"
    >
      <div className="flex items-center gap-2.5 px-5 py-4 border-b border-slate-100">
        <div className="w-8 h-8 rounded-lg bg-purple-500 flex items-center justify-center">
          <BookOpen className="w-4 h-4 text-white" />
        </div>
        <div>
          <p className="text-slate-900 text-sm font-black leading-none">Prestasi Per Subjek</p>
          <p className="text-slate-400 text-[10px] font-semibold mt-0.5">Purata bintang setiap subjek</p>
        </div>
      </div>

      <div className="px-5 py-4 space-y-4">
        {subjects.map((s, i) => {
          const barColor = s.pct >= 75 ? 'bg-purple-500' : s.pct >= 50 ? 'bg-fuchsia-400' : 'bg-pink-300';
          return (
            <motion.div
              key={s.cat}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-slate-900 text-sm font-bold flex items-center gap-1.5">
                  <span className="text-base">{categoryEmojis[s.cat] || '📚'}</span>
                  {categoryLabels[s.cat] || s.cat}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-purple-600 text-xs font-bold">{s.totalStars}⭐</span>
                  <span className="text-slate-400 text-[10px] font-semibold">{s.played} game</span>
                </div>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${s.pct}%` }}
                  transition={{ duration: 0.7, delay: 0.1 + i * 0.05 }}
                  className={`h-2 rounded-full ${barColor}`}
                />
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-slate-400 text-[10px] font-semibold">Purata {s.avg.toFixed(1)}⭐</span>
                {s.perfect > 0 && <span className="text-purple-600 text-[10px] font-bold">{s.perfect}× Perfect</span>}
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}