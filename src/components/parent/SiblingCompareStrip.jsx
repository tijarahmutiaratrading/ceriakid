import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Flame } from 'lucide-react';

/**
 * Mini sibling comparison strip — shows all children side by side
 * with their stars + streak, highlighting the selected one.
 */
export default function SiblingCompareStrip({ children, childrenData, selectedChild, onSelect }) {
  if (!children || children.length < 2) return null;

  const stats = children.map((child) => {
    const games = childrenData[child.name] || [];
    const totalStars = games.reduce((sum, g) => sum + (g.bestStars || 0), 0);
    const totalGames = games.length;
    const avg = totalGames > 0 ? totalStars / totalGames : 0;
    const lastPlayed = games
      .map((g) => (g.lastPlayedDate ? new Date(g.lastPlayedDate).getTime() : 0))
      .reduce((a, b) => Math.max(a, b), 0);
    return { ...child, totalStars, totalGames, avg, lastPlayed };
  });

  // Find leader (highest stars)
  const leaderName = [...stats].sort((a, b) => b.totalStars - a.totalStars)[0]?.name;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl p-4 mb-4 mt-4"
      style={{ background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.3)' }}
    >
      <div className="flex items-center justify-between mb-3">
        <p className="text-white text-xs font-black uppercase tracking-wider flex items-center gap-2">
          👨‍👩‍👧‍👦 Bandingan Adik-Beradik
        </p>
        <p className="text-white/70 text-[10px] font-bold">Tap untuk pilih</p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {stats.map((c, i) => {
          const isActive = c.name === selectedChild;
          const isLeader = c.name === leaderName && c.totalStars > 0;
          const emoji = c.ageGroup === 'sekolah_rendah' ? '📚' : '🎨';

          return (
            <motion.button
              key={c.name}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onSelect(c.name)}
              className={`relative flex-shrink-0 rounded-2xl p-3 min-w-[140px] text-left transition-all ${
                isActive
                  ? 'bg-white text-purple-700 shadow-xl scale-[1.02]'
                  : 'bg-white/12 text-white border border-white/20 hover:bg-white/20'
              }`}
            >
              {isLeader && (
                <div className="absolute -top-1.5 -right-1.5 w-7 h-7 rounded-full bg-yellow-400 flex items-center justify-center shadow-lg ring-2 ring-white">
                  <Trophy className="w-3.5 h-3.5 text-yellow-900" />
                </div>
              )}

              <div className="flex items-center gap-2 mb-2">
                {c.avatarUrl ? (
                  <img src={c.avatarUrl} alt={c.name} className="w-9 h-9 rounded-xl object-cover ring-1 ring-white/40 flex-shrink-0" />
                ) : (
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0 ${isActive ? 'bg-purple-100' : 'bg-white/20'}`}>
                    {emoji}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="font-black text-sm truncate leading-tight">{c.name}</p>
                  <p className={`text-[9px] font-bold uppercase tracking-wide ${isActive ? 'text-purple-500' : 'text-white/60'}`}>
                    {c.ageGroup === 'sekolah_rendah' ? 'SR' : 'Pra'}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs font-black">
                <span className={isActive ? 'text-amber-600' : 'text-yellow-300'}>⭐ {c.totalStars}</span>
                <span className={isActive ? 'text-purple-600' : 'text-white/80'}>{c.totalGames} game</span>
              </div>

              {c.currentStreak > 0 && (
                <div className={`flex items-center gap-1 mt-1 text-[10px] font-bold ${isActive ? 'text-orange-500' : 'text-orange-300'}`}>
                  <Flame className="w-3 h-3" /> {c.currentStreak} hari
                </div>
              )}
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}