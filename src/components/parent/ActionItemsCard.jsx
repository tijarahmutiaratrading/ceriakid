import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Target, ChevronRight, Flame, AlertCircle, Sparkles } from 'lucide-react';
import SectionCardHeader from '@/components/ui/SectionCardHeader';

const categoryLabels = {
  bahasa_melayu: 'Bahasa Melayu',
  english: 'English',
  mathematics: 'Matematik',
  science: 'Sains',
  jawi: 'Jawi',
};

const categoryEmojis = {
  bahasa_melayu: '🇲🇾',
  english: '🇬🇧',
  mathematics: '🔢',
  science: '🧪',
  jawi: '🕌',
};

/**
 * Smart action items — generates 3 actionable suggestions based on the child's data:
 *  1. Weakest subject (lowest avg stars)
 *  2. Inactive subject (not played in 3+ days)
 *  3. Strength to celebrate / streak galakan
 */
export default function ActionItemsCard({ childName, games }) {
  const items = useMemo(() => {
    if (!games || games.length === 0) return [];

    // Group by category
    const byCat = {};
    games.forEach((g) => {
      if (!byCat[g.category]) byCat[g.category] = { stars: 0, count: 0, lastPlayed: 0 };
      byCat[g.category].stars += g.bestStars || 0;
      byCat[g.category].count += 1;
      const t = g.lastPlayedDate ? new Date(g.lastPlayedDate).getTime() : 0;
      byCat[g.category].lastPlayed = Math.max(byCat[g.category].lastPlayed, t);
    });

    const categories = Object.entries(byCat).map(([cat, s]) => ({
      cat,
      avg: s.stars / s.count,
      count: s.count,
      lastPlayed: s.lastPlayed,
      daysSince: s.lastPlayed ? Math.floor((Date.now() - s.lastPlayed) / (24 * 60 * 60 * 1000)) : 999,
    }));

    const actions = [];

    // 1. Weakest subject
    const weakest = [...categories].sort((a, b) => a.avg - b.avg)[0];
    if (weakest && weakest.avg < 2.5) {
      actions.push({
        type: 'weak',
        emoji: categoryEmojis[weakest.cat] || '📚',
        title: `Ulang ${categoryLabels[weakest.cat] || weakest.cat}`,
        desc: `Purata ${weakest.avg.toFixed(1)}⭐ — perlu latihan tambahan`,
        cta: 'Main Sekarang',
        link: '/dashboard',
        accent: 'from-rose-400 to-pink-500',
        icon: AlertCircle,
      });
    }

    // 2. Inactive subject (≥3 days)
    const stale = [...categories].filter((c) => c.daysSince >= 3 && c.daysSince < 999).sort((a, b) => b.daysSince - a.daysSince)[0];
    if (stale && (!weakest || stale.cat !== weakest.cat)) {
      actions.push({
        type: 'stale',
        emoji: categoryEmojis[stale.cat] || '📚',
        title: `${stale.daysSince} hari tak main ${categoryLabels[stale.cat] || stale.cat}`,
        desc: 'Galakkan anak buat sesi pendek hari ni',
        cta: 'Buka Game',
        link: '/dashboard',
        accent: 'from-amber-400 to-orange-500',
        icon: Target,
      });
    }

    // 3. Strongest subject — celebrate
    const strongest = [...categories].sort((a, b) => b.avg - a.avg)[0];
    if (strongest && strongest.avg >= 2.5 && actions.length < 3) {
      actions.push({
        type: 'strong',
        emoji: categoryEmojis[strongest.cat] || '⭐',
        title: `${childName} hebat dalam ${categoryLabels[strongest.cat] || strongest.cat}!`,
        desc: `Purata ${strongest.avg.toFixed(1)}⭐ — galakkan teruskan`,
        cta: 'Cabaran Baru',
        link: '/dashboard',
        accent: 'from-emerald-400 to-teal-500',
        icon: Sparkles,
      });
    }

    // Fallback — kalau tiada apa-apa, encourage
    if (actions.length === 0) {
      actions.push({
        type: 'start',
        emoji: '🎮',
        title: 'Mula sesi baru',
        desc: 'Pilih subjek kegemaran dan mulakan!',
        cta: 'Pergi Games',
        link: '/dashboard',
        accent: 'from-purple-400 to-fuchsia-500',
        icon: Flame,
      });
    }

    return actions.slice(0, 3);
  }, [games, childName]);

  if (items.length === 0) return null;

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
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl"
          style={{ background: 'linear-gradient(135deg, #fbcfe8 0%, #f9a8d4 100%)', boxShadow: '0 3px 0 #f472b6' }}
        >
          🎯
        </motion.div>
        <div>
          <p className="text-slate-800 text-base font-black leading-none">Apa Patut Buat Seterusnya</p>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-wider mt-1">Cadangan untuk bantu anak</p>
        </div>
      </div>

      <div className="space-y-2">
        {items.map((item, i) => {
          const palettes = [
            { bg: '#fef3c7', shadow: '#fcd34d', iconBg: 'linear-gradient(135deg, #fde047 0%, #facc15 100%)' },
            { bg: '#dbeafe', shadow: '#93c5fd', iconBg: 'linear-gradient(135deg, #93c5fd 0%, #60a5fa 100%)' },
            { bg: '#dcfce7', shadow: '#86efac', iconBg: 'linear-gradient(135deg, #86efac 0%, #4ade80 100%)' },
          ];
          const p = palettes[i % palettes.length];
          return (
            <Link key={i} to={item.link}>
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                whileTap={{ scale: 0.98, y: 2 }}
                className="rounded-2xl p-3 flex items-center gap-3 cursor-pointer transition-all"
                style={{ background: p.bg, boxShadow: `0 3px 0 ${p.shadow}` }}
              >
                <div
                  className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl flex-shrink-0"
                  style={{ background: p.iconBg, boxShadow: '0 2px 6px rgba(0,0,0,0.1)' }}
                >
                  {item.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-slate-800 font-black text-sm leading-tight truncate">{item.title}</p>
                  <p className="text-slate-600 text-[11px] font-semibold mt-0.5 line-clamp-1">{item.desc}</p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <span className="text-slate-700 text-[10px] font-black uppercase tracking-wider hidden sm:inline">{item.cta}</span>
                  <ChevronRight className="w-4 h-4 text-slate-600" strokeWidth={3} />
                </div>
              </motion.div>
            </Link>
          );
        })}
      </div>
    </motion.div>
  );
}