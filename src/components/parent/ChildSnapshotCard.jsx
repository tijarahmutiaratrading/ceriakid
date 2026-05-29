import React from 'react';
import { motion } from 'framer-motion';
import { Flame, Star, Gamepad2, Award } from 'lucide-react';

/**
 * Playful CeriaKid child snapshot — soft pastel card, bouncy mascot,
 * candy-colored stat pills.
 */
export default function ChildSnapshotCard({ child, games, streak = 0 }) {
  const totalGames = games.length;
  const totalStars = games.reduce((sum, g) => sum + (g.bestStars || 0), 0);
  const avgStars = totalGames > 0 ? (totalStars / totalGames).toFixed(1) : '0.0';
  const perfectGames = games.filter((g) => g.bestStars === 3).length;

  const today = new Date().toDateString();
  const playedToday = games.some((g) => g.lastPlayedDate && new Date(g.lastPlayedDate).toDateString() === today);

  const fallbackEmoji = child?.ageGroup === 'sekolah_rendah' ? '📚' : '🎨';

  const stats = [
    { icon: Gamepad2, label: 'Games', value: totalGames, color: '#93c5fd', soft: '#dbeafe' },
    { icon: Star, label: 'Bintang', value: totalStars, color: '#fcd34d', soft: '#fef3c7' },
    { icon: Award, label: 'Perfect', value: perfectGames, color: '#86efac', soft: '#dcfce7' },
    { icon: Flame, label: 'Streak', value: `${streak}h`, color: '#fca5a5', soft: '#fee2e2' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-[2rem] p-5"
      style={{
        background: 'linear-gradient(135deg, #ffffff 0%, #fef9f3 100%)',
        boxShadow: '0 8px 20px rgba(251, 207, 232, 0.25), 0 0 0 2px rgba(251, 207, 232, 0.3)',
      }}
    >
      {/* Top: avatar (synced from Children Profile) + name + avg stars */}
      <div className="flex items-center gap-4 mb-5">
        <motion.div
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl overflow-hidden flex-shrink-0 flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, #fef3c7 0%, #fbcfe8 100%)',
            boxShadow: '0 4px 0 #f9a8d4, 0 6px 14px rgba(0,0,0,0.05)',
          }}
        >
          {child?.avatarUrl ? (
            <img
              src={child.avatarUrl}
              alt={child.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-4xl sm:text-5xl">{fallbackEmoji}</span>
          )}
        </motion.div>
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-800 truncate leading-tight">
            {child?.name || 'Anak'}
          </h2>
          <div className="flex items-center gap-1.5 flex-wrap mt-1.5">
            <span
              className="text-[10px] sm:text-xs font-black px-2.5 py-1 rounded-full"
              style={{ background: '#e0e7ff', color: '#4338ca' }}
            >
              {child?.ageGroup === 'sekolah_rendah' ? '📚 Sek. Rendah' : '🎨 Prasekolah'}
            </span>
            <span
              className="text-[10px] sm:text-xs font-black px-2.5 py-1 rounded-full"
              style={
                playedToday
                  ? { background: '#dcfce7', color: '#166534' }
                  : { background: '#fef3c7', color: '#92400e' }
              }
            >
              {playedToday ? '🔥 Aktif hari ni' : '💤 Belum main'}
            </span>
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-wider">Purata</p>
          <p className="font-black text-3xl sm:text-4xl leading-none tabular-nums text-slate-800">
            {avgStars}
            <span className="text-xl sm:text-2xl ml-0.5">⭐</span>
          </p>
        </div>
      </div>

      {/* Stats — soft candy pills */}
      <div className="grid grid-cols-4 gap-2 sm:gap-3">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="rounded-2xl p-2.5 sm:p-3 text-center"
            style={{
              background: s.soft,
              boxShadow: `0 3px 0 ${s.color}80`,
            }}
          >
            <div
              className="w-9 h-9 sm:w-11 sm:h-11 rounded-2xl mx-auto mb-1.5 flex items-center justify-center"
              style={{ background: 'rgba(255,255,255,0.8)' }}
            >
              <s.icon className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={3} style={{ color: s.color }} />
            </div>
            <p className="font-black text-lg sm:text-xl leading-none tabular-nums text-slate-800">{s.value}</p>
            <p className="text-slate-500 text-[9px] sm:text-[10px] font-black uppercase tracking-wider mt-1">
              {s.label}
            </p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}