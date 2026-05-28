import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

const categoryLabels = {
  bahasa_melayu: 'Bahasa Melayu',
  english: 'English',
  mathematics: 'Matematik',
  science: 'Sains',
  jawi: 'Jawi',
  bahasa_tamil: 'Bahasa Tamil',
  bahasa_mandarin: 'Bahasa Mandarin',
};

const categoryEmojis = {
  bahasa_melayu: '🇲🇾',
  english: '🇬🇧',
  mathematics: '🔢',
  science: '🧪',
  jawi: '🕌',
  bahasa_tamil: '🌺',
  bahasa_mandarin: '🏮',
};

/**
 * Combined subject progress — one chart per subject with stars+count.
 * Replaces the old duplicate (SubjectBreakdown + manual bars).
 */
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
        cat,
        avg: s.stars / s.played,
        played: s.played,
        perfect: s.perfect,
        totalStars: s.stars,
        pct: (s.stars / (s.played * 3)) * 100,
      }))
      .sort((a, b) => b.pct - a.pct);
  }, [games]);

  if (subjects.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl p-4"
      style={{
        background: 'linear-gradient(135deg, rgba(15,23,42,0.88), rgba(88,28,135,0.82), rgba(190,24,93,0.72))',
        backdropFilter: 'blur(22px) saturate(150%)',
        WebkitBackdropFilter: 'blur(22px) saturate(150%)',
        border: '1px solid rgba(255,255,255,0.18)',
        boxShadow: '0 18px 50px rgba(31, 16, 92, 0.25)',
      }}
    >
      <p className="text-white text-xs font-black uppercase tracking-wider mb-3 flex items-center gap-2">
        📚 Prestasi Per Subjek
      </p>

      <div className="space-y-3">
        {subjects.map((s, i) => {
          const barColor =
            s.pct >= 75 ? 'from-emerald-400 to-teal-400'
            : s.pct >= 50 ? 'from-yellow-400 to-amber-400'
            : 'from-rose-400 to-pink-400';

          return (
            <motion.div
              key={s.cat}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-white text-sm font-black flex items-center gap-1.5">
                  <span className="text-base">{categoryEmojis[s.cat] || '📚'}</span>
                  {categoryLabels[s.cat] || s.cat}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-yellow-300 text-xs font-black">{s.totalStars}⭐</span>
                  <span className="text-white/70 text-[10px] font-bold">{s.played} game</span>
                </div>
              </div>
              <div className="relative w-full bg-white/15 rounded-full h-2.5 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${s.pct}%` }}
                  transition={{ duration: 0.8, delay: 0.1 + i * 0.05 }}
                  className={`h-2.5 rounded-full bg-gradient-to-r ${barColor}`}
                />
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-white/60 text-[10px] font-bold">Purata {s.avg.toFixed(1)}⭐</span>
                {s.perfect > 0 && <span className="text-emerald-300 text-[10px] font-black">{s.perfect}× Perfect ⭐⭐⭐</span>}
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}