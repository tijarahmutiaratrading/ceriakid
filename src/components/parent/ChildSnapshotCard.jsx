import React from 'react';
import { motion } from 'framer-motion';
import { Flame, Star, Gamepad2, Award } from 'lucide-react';

/**
 * Duolingo-style child snapshot — white card, big mascot, chunky stats with
 * rounded shadows underneath (signature Duo "pressed button" look).
 */
export default function ChildSnapshotCard({ child, games, streak = 0 }) {
  const totalGames = games.length;
  const totalStars = games.reduce((sum, g) => sum + (g.bestStars || 0), 0);
  const avgStars = totalGames > 0 ? (totalStars / totalGames).toFixed(1) : '0.0';
  const perfectGames = games.filter((g) => g.bestStars === 3).length;

  const today = new Date().toDateString();
  const playedToday = games.some((g) => g.lastPlayedDate && new Date(g.lastPlayedDate).toDateString() === today);

  const emoji = child?.ageGroup === 'sekolah_rendah' ? '📚' : '🎨';

  const stats = [
    { icon: Gamepad2, label: 'Games', value: totalGames, color: '#1cb0f6', bg: '#dbeafe', shadow: '#1aa1e0' },
    { icon: Star, label: 'Bintang', value: totalStars, color: '#ffc800', bg: '#fef9c3', shadow: '#e6b400' },
    { icon: Award, label: 'Perfect', value: perfectGames, color: '#58cc02', bg: '#dcfce7', shadow: '#4fb302' },
    { icon: Flame, label: 'Streak', value: `${streak}h`, color: '#ff9600', bg: '#ffedd5', shadow: '#e68600' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl p-5 bg-white"
      style={{
        border: '3px solid #e2e8f0',
        boxShadow: '0 4px 0 #cbd5e1, 0 10px 20px rgba(15,23,42,0.05)',
      }}
    >
      {/* Top: mascot + name + avg stars */}
      <div className="flex items-center gap-4 mb-5">
        {child?.avatarUrl ? (
          <img
            src={child.avatarUrl}
            alt={child.name}
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover flex-shrink-0"
            style={{ border: '3px solid #e2e8f0', boxShadow: '0 4px 0 #cbd5e1' }}
          />
        ) : (
          <motion.div
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center text-4xl sm:text-5xl flex-shrink-0"
            style={{ background: '#fef3c7', border: '3px solid #fde68a', boxShadow: '0 4px 0 #f59e0b' }}
          >
            {emoji}
          </motion.div>
        )}
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 truncate leading-tight">{child?.name || 'Anak'}</h2>
          <div className="flex items-center gap-1.5 flex-wrap mt-1.5">
            <span className="text-[10px] sm:text-xs font-black px-2 py-0.5 rounded-md text-slate-700 bg-slate-100 uppercase tracking-wider">
              {child?.ageGroup === 'sekolah_rendah' ? 'Sek. Rendah' : 'Prasekolah'}
            </span>
            <span
              className="text-[10px] sm:text-xs font-black px-2 py-0.5 rounded-md flex items-center gap-1"
              style={
                playedToday
                  ? { background: '#dcfce7', color: '#166534' }
                  : { background: '#fee2e2', color: '#991b1b' }
              }
            >
              {playedToday ? '🔥 Aktif hari ni' : '💤 Belum main'}
            </span>
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-wider">Purata</p>
          <p className="text-slate-900 font-black text-3xl sm:text-4xl leading-none tabular-nums">
            {avgStars}
            <span className="text-xl sm:text-2xl ml-0.5">⭐</span>
          </p>
        </div>
      </div>

      {/* Stats — 4 chunky Duolingo-style buttons */}
      <div className="grid grid-cols-4 gap-2 sm:gap-3">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="rounded-2xl p-2.5 sm:p-3 text-center"
            style={{
              background: s.bg,
              border: `2px solid ${s.color}40`,
              boxShadow: `0 3px 0 ${s.shadow}40`,
            }}
          >
            <div
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl mx-auto mb-1.5 flex items-center justify-center"
              style={{ background: s.color, boxShadow: `0 2px 0 ${s.shadow}` }}
            >
              <s.icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" strokeWidth={3} />
            </div>
            <p className="font-black text-lg sm:text-xl leading-none tabular-nums" style={{ color: s.shadow }}>
              {s.value}
            </p>
            <p className="text-slate-600 text-[9px] sm:text-[10px] font-black uppercase tracking-wider mt-1">{s.label}</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}