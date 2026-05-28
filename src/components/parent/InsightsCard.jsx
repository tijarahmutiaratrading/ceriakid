import React from 'react';
import { motion } from 'framer-motion';
import { Flame, TrendingUp, Clock, Award } from 'lucide-react';

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

export default function InsightsCard({ games }) {
  // Games dimain hari ini
  const today = new Date().toDateString();
  const todayGames = games.filter(g => g.lastPlayedDate && new Date(g.lastPlayedDate).toDateString() === today).length;

  // Games dimain minggu ini (7 hari terakhir)
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const weekGames = games.filter(g => g.lastPlayedDate && new Date(g.lastPlayedDate).getTime() > weekAgo).length;

  // Best subject (subject dengan bintang purata tertinggi)
  const subjectMap = {};
  games.forEach(g => {
    if (!subjectMap[g.category]) subjectMap[g.category] = { total: 0, count: 0 };
    subjectMap[g.category].total += g.bestStars || 0;
    subjectMap[g.category].count += 1;
  });
  const bestSubject = Object.entries(subjectMap)
    .map(([cat, s]) => ({ cat, avg: s.total / s.count }))
    .sort((a, b) => b.avg - a.avg)[0];

  // Perfect games (3 bintang)
  const perfectGames = games.filter(g => g.bestStars === 3).length;

  const insights = [
    {
      icon: Clock,
      label: 'Hari Ini',
      value: todayGames,
      subtitle: `${weekGames} minggu ini`,
      gradient: 'from-blue-400 to-cyan-500',
    },
    {
      icon: Award,
      label: 'Perfect 3⭐',
      value: perfectGames,
      subtitle: 'Skor penuh',
      gradient: 'from-yellow-400 to-amber-500',
    },
    {
      icon: TrendingUp,
      label: 'Subjek Top',
      value: bestSubject ? categoryEmojis[bestSubject.cat] || '📚' : '—',
      subtitle: bestSubject ? categoryLabels[bestSubject.cat] || bestSubject.cat : 'Belum ada',
      gradient: 'from-emerald-400 to-teal-500',
    },
    {
      icon: Flame,
      label: 'Status',
      value: todayGames > 0 ? '🔥' : '😴',
      subtitle: todayGames > 0 ? 'Aktif!' : 'Rehat',
      gradient: 'from-orange-400 to-pink-500',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl p-4"
      style={{ background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.3)' }}
    >
      <p className="text-white text-xs font-black uppercase tracking-wider mb-3 flex items-center gap-2">
        ⚡ Trend & Insights
      </p>
      <div className="grid grid-cols-2 gap-2">
        {insights.map((ins, i) => (
          <motion.div
            key={ins.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.06 }}
            className="rounded-2xl p-3 bg-white/15 border border-white/25"
          >
            <div className={`w-8 h-8 rounded-xl mb-2 bg-gradient-to-br ${ins.gradient} flex items-center justify-center shadow-md`}>
              <ins.icon className="w-4 h-4 text-white" />
            </div>
            <p className="text-white font-black text-xl leading-none">{ins.value}</p>
            <p className="text-white/85 text-[10px] font-bold uppercase tracking-wider mt-1">{ins.label}</p>
            <p className="text-white/65 text-[10px] font-semibold truncate">{ins.subtitle}</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}