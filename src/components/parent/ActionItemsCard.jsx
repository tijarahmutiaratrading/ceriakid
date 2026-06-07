import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Target, ChevronRight, Flame, AlertCircle, Sparkles, Lightbulb } from 'lucide-react';

const categoryLabels = {
  bahasa_melayu: 'Bahasa Melayu', english: 'English',
  mathematics: 'Matematik', science: 'Sains', jawi: 'Jawi',
};
const categoryEmojis = {
  bahasa_melayu: '🇲🇾', english: '🇬🇧', mathematics: '🔢', science: '🧪', jawi: '🕌',
};

const ACCENT_COLORS = [
  { dot: 'bg-amber-500', badge: 'bg-amber-50 text-amber-700 border-amber-200' },
  { dot: 'bg-sky-500', badge: 'bg-sky-50 text-sky-700 border-sky-200' },
  { dot: 'bg-emerald-500', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
];

export default function ActionItemsCard({ childName, games }) {
  const items = useMemo(() => {
    if (!games || games.length === 0) return [];

    const byCat = {};
    games.forEach((g) => {
      if (!byCat[g.category]) byCat[g.category] = { stars: 0, count: 0, lastPlayed: 0 };
      byCat[g.category].stars += g.bestStars || 0;
      byCat[g.category].count += 1;
      const t = g.lastPlayedDate ? new Date(g.lastPlayedDate).getTime() : 0;
      byCat[g.category].lastPlayed = Math.max(byCat[g.category].lastPlayed, t);
    });

    const categories = Object.entries(byCat).map(([cat, s]) => ({
      cat, avg: s.stars / s.count, count: s.count, lastPlayed: s.lastPlayed,
      daysSince: s.lastPlayed ? Math.floor((Date.now() - s.lastPlayed) / (24 * 60 * 60 * 1000)) : 999,
    }));

    const actions = [];

    const weakest = [...categories].sort((a, b) => a.avg - b.avg)[0];
    if (weakest && weakest.avg < 2.5) {
      actions.push({
        emoji: categoryEmojis[weakest.cat] || '📚',
        title: `Ulang ${categoryLabels[weakest.cat] || weakest.cat}`,
        desc: `Purata ${weakest.avg.toFixed(1)}⭐ — perlu latihan tambahan`,
        cta: 'Main Sekarang', link: '/dashboard',
      });
    }

    const stale = [...categories].filter((c) => c.daysSince >= 3 && c.daysSince < 999).sort((a, b) => b.daysSince - a.daysSince)[0];
    if (stale && (!weakest || stale.cat !== weakest.cat)) {
      actions.push({
        emoji: categoryEmojis[stale.cat] || '📚',
        title: `${stale.daysSince} hari tak main ${categoryLabels[stale.cat] || stale.cat}`,
        desc: 'Galakkan anak buat sesi pendek hari ni',
        cta: 'Buka Game', link: '/dashboard',
      });
    }

    const strongest = [...categories].sort((a, b) => b.avg - a.avg)[0];
    if (strongest && strongest.avg >= 2.5 && actions.length < 3) {
      actions.push({
        emoji: categoryEmojis[strongest.cat] || '⭐',
        title: `${childName} hebat dalam ${categoryLabels[strongest.cat] || strongest.cat}!`,
        desc: `Purata ${strongest.avg.toFixed(1)}⭐ — galakkan teruskan`,
        cta: 'Cabaran Baru', link: '/dashboard',
      });
    }

    if (actions.length === 0) {
      actions.push({
        emoji: '🎮',
        title: 'Mula sesi baru',
        desc: 'Pilih subjek kegemaran dan mulakan!',
        cta: 'Pergi Games', link: '/dashboard',
      });
    }

    return actions.slice(0, 3);
  }, [games, childName]);

  if (items.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl ring-1 ring-slate-200 shadow-sm overflow-hidden"
    >
      <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100">
        <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center">
          <Lightbulb className="w-4 h-4 text-white" />
        </div>
        <div>
          <p className="text-slate-900 text-sm font-black leading-none">Apa Patut Buat Seterusnya</p>
          <p className="text-slate-400 text-[10px] font-semibold mt-0.5">Cadangan untuk bantu anak</p>
        </div>
      </div>

      <div className="divide-y divide-slate-100">
        {items.map((item, i) => {
          const accent = ACCENT_COLORS[i % ACCENT_COLORS.length];
          return (
            <Link key={i} to={item.link}>
              <motion.div
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                className="flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-2.5 flex-1 min-w-0">
                  <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${accent.dot}`} />
                  <span className="text-xl flex-shrink-0">{item.emoji}</span>
                  <div className="min-w-0">
                    <p className="text-slate-900 font-black text-sm truncate">{item.title}</p>
                    <p className="text-slate-500 text-[11px] font-medium mt-0.5 truncate">{item.desc}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`hidden sm:inline text-[10px] font-bold px-2 py-0.5 rounded-md border ${accent.badge}`}>{item.cta}</span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>
              </motion.div>
            </Link>
          );
        })}
      </div>
    </motion.div>
  );
}