import React from 'react';
import { motion } from 'framer-motion';
import { Flame, TrendingUp, Clock, Award, Zap } from 'lucide-react';
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
      bg: '#dbeafe', shadow: '#93c5fd', iconBg: 'linear-gradient(135deg, #93c5fd 0%, #60a5fa 100%)',
    },
    {
      icon: Award,
      label: 'Perfect 3⭐',
      value: perfectGames,
      subtitle: 'Skor penuh',
      bg: '#fef3c7', shadow: '#fcd34d', iconBg: 'linear-gradient(135deg, #fde047 0%, #facc15 100%)',
    },
    {
      icon: TrendingUp,
      label: 'Subjek Top',
      value: bestSubject ? categoryEmojis[bestSubject.cat] || '📚' : '—',
      subtitle: bestSubject ? categoryLabels[bestSubject.cat] || bestSubject.cat : 'Belum ada',
      bg: '#dcfce7', shadow: '#86efac', iconBg: 'linear-gradient(135deg, #86efac 0%, #4ade80 100%)',
    },
    {
      icon: Flame,
      label: 'Status',
      value: todayGames > 0 ? '🔥' : '😴',
      subtitle: todayGames > 0 ? 'Aktif!' : 'Rehat',
      bg: '#fce7f3', shadow: '#f9a8d4', iconBg: 'linear-gradient(135deg, #f9a8d4 0%, #ec4899 100%)',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-[2rem] p-5 space-y-3"
      style={{
        background: 'linear-gradient(135deg, #ffffff 0%, #fef9f3 100%)',
        boxShadow: '0 8px 20px rgba(251, 207, 232, 0.25), 0 0 0 2px rgba(251, 207, 232, 0.3)',
      }}
    >
      <div className="flex items-center gap-2.5">
        <motion.div
          animate={{ rotate: [0, 8, -8, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl"
          style={{ background: 'linear-gradient(135deg, #fde047 0%, #facc15 100%)', boxShadow: '0 3px 0 #eab308' }}
        >
          ✨
        </motion.div>
        <div>
          <p className="text-slate-800 text-base font-black leading-none">Trend & Insights</p>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-wider mt-1">Prestasi terkini</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {insights.map((ins, i) => (
          <motion.div
            key={ins.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.06 }}
            className="rounded-2xl p-3"
            style={{ background: ins.bg, boxShadow: `0 3px 0 ${ins.shadow}` }}
          >
            <div
              className="w-9 h-9 rounded-xl mb-2 flex items-center justify-center"
              style={{ background: ins.iconBg, boxShadow: '0 2px 4px rgba(0,0,0,0.08)' }}
            >
              <ins.icon className="w-4 h-4 text-white" strokeWidth={3} />
            </div>
            <p className="text-slate-800 font-black text-xl leading-none">{ins.value}</p>
            <p className="text-slate-700 text-[10px] font-black uppercase tracking-wider mt-1">{ins.label}</p>
            <p className="text-slate-500 text-[10px] font-semibold truncate">{ins.subtitle}</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}