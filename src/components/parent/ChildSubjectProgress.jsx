import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { BookOpen } from 'lucide-react';
import SectionCardHeader from '@/components/ui/SectionCardHeader';

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
      className="rounded-[2rem] p-5 space-y-4"
      style={{
        background: 'linear-gradient(135deg, #ffffff 0%, #fef9f3 100%)',
        boxShadow: '0 8px 20px rgba(251, 207, 232, 0.25), 0 0 0 2px rgba(251, 207, 232, 0.3)',
      }}
    >
      <div className="flex items-center gap-2.5">
        <motion.div
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl"
          style={{ background: 'linear-gradient(135deg, #86efac 0%, #4ade80 100%)', boxShadow: '0 3px 0 #22c55e' }}
        >
          📚
        </motion.div>
        <div>
          <p className="text-slate-800 text-base font-black leading-none">Prestasi Per Subjek</p>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-wider mt-1">Purata bintang setiap subjek</p>
        </div>
      </div>

      <div className="space-y-3">
        {subjects.map((s, i) => {
          const barGradient =
            s.pct >= 75 ? 'linear-gradient(to right, #4ade80, #22c55e)'
            : s.pct >= 50 ? 'linear-gradient(to right, #facc15, #f59e0b)'
            : 'linear-gradient(to right, #f472b6, #ec4899)';

          return (
            <motion.div
              key={s.cat}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-slate-800 text-sm font-black flex items-center gap-1.5">
                  <span className="text-base">{categoryEmojis[s.cat] || '📚'}</span>
                  {categoryLabels[s.cat] || s.cat}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-amber-600 text-xs font-black">{s.totalStars}⭐</span>
                  <span className="text-slate-500 text-[10px] font-bold">{s.played} game</span>
                </div>
              </div>
              <div className="relative w-full rounded-full h-3 overflow-hidden" style={{ background: '#fef3c7' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${s.pct}%` }}
                  transition={{ duration: 0.8, delay: 0.1 + i * 0.05 }}
                  className="h-3 rounded-full"
                  style={{ background: barGradient }}
                />
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-slate-500 text-[10px] font-bold">Purata {s.avg.toFixed(1)}⭐</span>
                {s.perfect > 0 && <span className="text-emerald-600 text-[10px] font-black">{s.perfect}× Perfect ⭐⭐⭐</span>}
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}