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
      className="rounded-3xl p-4 space-y-4"
      style={{
        background: 'linear-gradient(135deg, rgba(15,23,42,0.88), rgba(88,28,135,0.82), rgba(190,24,93,0.72))',
        backdropFilter: 'blur(22px) saturate(150%)',
        WebkitBackdropFilter: 'blur(22px) saturate(150%)',
        boxShadow: '0 18px 50px rgba(31, 16, 92, 0.25)',
      }}
    >
      <SectionCardHeader
        icon={Target}
        title="Apa Patut Buat Seterusnya"
        subtitle="Cadangan tindakan untuk bantu anak"
        gradient="from-rose-400 to-pink-500"
      />

      <div className="space-y-2">
        {items.map((item, i) => {
          const Icon = item.icon;
          return (
            <Link key={i} to={item.link}>
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                whileTap={{ scale: 0.98 }}
                className="rounded-2xl p-3 bg-white/12 border border-white/20 flex items-center gap-3 hover:bg-white/20 transition-all cursor-pointer"
              >
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${item.accent} flex items-center justify-center text-xl flex-shrink-0 shadow-lg`}>
                  {item.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-black text-sm leading-tight truncate">{item.title}</p>
                  <p className="text-white/75 text-[11px] font-semibold mt-0.5 line-clamp-1">{item.desc}</p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <span className="text-white/90 text-[10px] font-black uppercase tracking-wider hidden sm:inline">{item.cta}</span>
                  <ChevronRight className="w-4 h-4 text-white/80" />
                </div>
              </motion.div>
            </Link>
          );
        })}
      </div>
    </motion.div>
  );
}