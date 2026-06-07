import React from 'react';
import { motion } from 'framer-motion';
import { Flame, Star, Gamepad2, Award, TrendingUp } from 'lucide-react';
import { getChildAvatar } from '@/lib/childAvatars';

export default function ChildSnapshotCard({ child, games, streak = 0 }) {
  const totalGames = games.length;
  const totalStars = games.reduce((sum, g) => sum + (g.bestStars || 0), 0);
  const avgStars = totalGames > 0 ? (totalStars / totalGames).toFixed(1) : '0.0';
  const perfectGames = games.filter((g) => g.bestStars === 3).length;

  const today = new Date().toDateString();
  const playedToday = games.some((g) => g.lastPlayedDate && new Date(g.lastPlayedDate).toDateString() === today);
  const fallbackEmoji = child?.ageGroup === 'sekolah_rendah' ? '📚' : '🎨';

  const stats = [
    { icon: Gamepad2, label: 'Games', value: totalGames, iconColor: 'text-sky-600' },
    { icon: Star, label: 'Bintang', value: totalStars, iconColor: 'text-amber-500' },
    { icon: Award, label: 'Perfect', value: perfectGames, iconColor: 'text-emerald-600' },
    { icon: Flame, label: 'Streak', value: `${streak}h`, iconColor: 'text-red-500' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl ring-1 ring-slate-200 shadow-sm overflow-hidden"
    >
      {/* Header row */}
      <div className="flex items-center gap-4 px-5 py-4 border-b border-slate-100">
        <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 ring-1 ring-slate-200">
          <img src={getChildAvatar(child)} alt={child?.name} className="w-full h-full object-cover" />
        </div>

        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-black text-slate-900 truncate leading-tight">{child?.name || 'Anak'}</h2>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-wide">
              {child?.ageGroup === 'sekolah_rendah' ? '📚 Sek. Rendah' : '🎨 Prasekolah'}
            </span>
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide ${
              playedToday ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
            }`}>
              {playedToday ? '🔥 Aktif hari ni' : '💤 Belum main'}
            </span>
          </div>
        </div>

        <div className="text-right flex-shrink-0">
          <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400 mb-0.5">Purata</p>
          <p className="font-black text-2xl text-slate-900 leading-none tabular-nums">{avgStars}<span className="text-base ml-0.5">⭐</span></p>
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-4 gap-px bg-slate-100">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className="bg-white px-3 py-3 text-center"
          >
            <s.icon className={`w-4 h-4 mx-auto mb-1 ${s.iconColor}`} strokeWidth={2.5} />
            <p className="font-black text-base text-slate-900 leading-none tabular-nums">{s.value}</p>
            <p className="text-slate-400 text-[9px] font-bold uppercase tracking-wider mt-0.5">{s.label}</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}