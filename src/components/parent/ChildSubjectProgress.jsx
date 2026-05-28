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
      className="rounded-3xl p-4 relative overflow-hidden isolate"
      style={{
        backgroundImage: "url('https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/0bfe6883a_generated_image.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        boxShadow: '0 20px 50px -15px rgba(147, 51, 234, 0.45), 0 0 0 1px rgba(255,255,255,0.12) inset',
      }}
    >
      <div className="absolute inset-0 -z-10" style={{ background: 'linear-gradient(135deg, rgba(109,40,217,0.82) 0%, rgba(147,51,234,0.74) 50%, rgba(225,29,72,0.8) 100%)' }} />
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