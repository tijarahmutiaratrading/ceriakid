import React from 'react';
import { motion } from 'framer-motion';
import { Flame, Star, Gamepad2, Award } from 'lucide-react';

/**
 * Snapshot card for ONE child — replaces the big per-child card.
 * Shows avatar, name, key stats in clean layout.
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
    { icon: Gamepad2, label: 'Games', value: totalGames, color: 'from-cyan-300 to-blue-400' },
    { icon: Star, label: 'Bintang', value: totalStars, color: 'from-yellow-300 to-amber-400' },
    { icon: Award, label: 'Perfect', value: perfectGames, color: 'from-emerald-300 to-teal-400' },
    { icon: Flame, label: 'Streak', value: `${streak}h`, color: 'from-orange-300 to-rose-400' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl p-4 relative overflow-hidden isolate"
      style={{
        backgroundImage: "url('https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/13046f20a_generated_image.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        boxShadow: '0 20px 50px -15px rgba(139, 92, 246, 0.45), 0 0 0 1px rgba(255,255,255,0.12) inset',
      }}
    >
      <div className="absolute inset-0 -z-10" style={{ background: 'linear-gradient(135deg, rgba(76,29,149,0.78) 0%, rgba(124,58,237,0.7) 50%, rgba(219,39,119,0.78) 100%)' }} />
      <div className="flex items-center gap-3 mb-4">
        {child?.avatarUrl ? (
          <img src={child.avatarUrl} alt={child.name} className="w-14 h-14 rounded-2xl object-cover ring-2 ring-white/40 shadow-lg flex-shrink-0" />
        ) : (
          <div className="w-14 h-14 rounded-2xl bg-white/25 backdrop-blur-md flex items-center justify-center text-3xl shadow-lg ring-1 ring-white/40 flex-shrink-0">
            {emoji}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-black text-white drop-shadow truncate leading-tight">{child?.name || 'Anak'}</h2>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-white/80 text-[10px] font-black uppercase tracking-wider">
              {child?.ageGroup === 'sekolah_rendah' ? 'Sekolah Rendah' : 'Prasekolah'}
            </span>
            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${playedToday ? 'bg-emerald-400/30 text-emerald-200' : 'bg-white/15 text-white/70'}`}>
              {playedToday ? '🔥 Main hari ni' : '💤 Belum main hari ni'}
            </span>
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-white/80 text-[10px] font-black uppercase tracking-wider">Purata</p>
          <p className="text-white font-black text-3xl leading-none drop-shadow">{avgStars}<span className="text-base text-yellow-300">⭐</span></p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-2xl p-2.5 bg-white/12 border border-white/20 text-center"
          >
            <div className={`w-7 h-7 rounded-xl mx-auto mb-1 bg-gradient-to-br ${s.color} flex items-center justify-center shadow-md`}>
              <s.icon className="w-3.5 h-3.5 text-white" />
            </div>
            <p className="text-white font-black text-base leading-none">{s.value}</p>
            <p className="text-white/80 text-[10px] font-bold mt-0.5">{s.label}</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}