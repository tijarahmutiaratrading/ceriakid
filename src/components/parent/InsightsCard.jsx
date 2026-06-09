import React from 'react';
import { motion } from 'framer-motion';
import { Flame, TrendingUp, Clock, Award, Zap } from 'lucide-react';

const categoryLabels = {
  bahasa_melayu: 'Bahasa Melayu', english: 'English',
  mathematics: 'Matematik', science: 'Sains', jawi: 'Jawi',
};
const categoryEmojis = {
  bahasa_melayu: '🇲🇾', english: '🇬🇧', mathematics: '🔢', science: '🧪', jawi: '🕌',
};

export default function InsightsCard({ games }) {
  const today = new Date().toDateString();
  const todayGames = games.filter(g => g.lastPlayedDate && new Date(g.lastPlayedDate).toDateString() === today).length;
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const weekGames = games.filter(g => g.lastPlayedDate && new Date(g.lastPlayedDate).getTime() > weekAgo).length;

  const subjectMap = {};
  games.forEach(g => {
    if (!subjectMap[g.category]) subjectMap[g.category] = { total: 0, count: 0 };
    subjectMap[g.category].total += g.bestStars || 0;
    subjectMap[g.category].count += 1;
  });
  const bestSubject = Object.entries(subjectMap)
    .map(([cat, s]) => ({ cat, avg: s.total / s.count }))
    .sort((a, b) => b.avg - a.avg)[0];

  const perfectGames = games.filter(g => g.bestStars === 3).length;

  const insights = [
    { icon: Clock, iconColor: 'text-sky-600', label: 'Hari Ini', value: todayGames, subtitle: `${weekGames} minggu ini` },
    { icon: Award, iconColor: 'text-amber-500', label: 'Perfect 3⭐', value: perfectGames, subtitle: 'Skor penuh' },
    { icon: TrendingUp, iconColor: 'text-emerald-600', label: 'Subjek Top', value: bestSubject ? categoryEmojis[bestSubject.cat] || '📚' : '—', subtitle: bestSubject ? categoryLabels[bestSubject.cat] || bestSubject.cat : 'Belum ada' },
    { icon: Flame, iconColor: 'text-red-500', label: 'Status', value: todayGames > 0 ? '🔥' : '😴', subtitle: todayGames > 0 ? 'Aktif!' : 'Rehat' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-3xl shadow-xl border border-white/60 overflow-hidden"
    >
      <div className="flex items-center gap-2.5 px-5 py-4 border-b border-slate-100">
        <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center">
          <Zap className="w-4 h-4 text-white" />
        </div>
        <div>
          <p className="text-slate-900 text-sm font-black leading-none">Trend & Insights</p>
          <p className="text-slate-400 text-[10px] font-semibold mt-0.5">Prestasi terkini</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-px bg-slate-100">
        {insights.map((ins, i) => (
          <motion.div
            key={ins.label}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white px-4 py-4"
          >
            <div className="flex items-center gap-2 mb-1.5">
              <ins.icon className={`w-3.5 h-3.5 ${ins.iconColor}`} />
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">{ins.label}</p>
            </div>
            <p className="text-2xl font-black text-slate-900 leading-none">{ins.value}</p>
            <p className="text-slate-400 text-[11px] font-semibold mt-1 truncate">{ins.subtitle}</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}