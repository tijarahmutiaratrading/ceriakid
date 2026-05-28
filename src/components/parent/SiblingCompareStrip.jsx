import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Flame, Users } from 'lucide-react';

/**
 * Premium sibling comparison strip — refined layout with clear hierarchy,
 * leader crown, and animated active state.
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

  // Find leader (highest stars, must have played)
  const leader = [...stats].sort((a, b) => b.totalStars - a.totalStars)[0];
  const leaderName = leader && leader.totalStars > 0 ? leader.name : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl p-5 mb-4 mt-4 relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, rgba(255,255,255,0.16), rgba(255,255,255,0.08))',
        backdropFilter: 'blur(24px) saturate(150%)',
        WebkitBackdropFilter: 'blur(24px) saturate(150%)',
        border: '1px solid rgba(255,255,255,0.25)',
        boxShadow: '0 12px 36px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.35)',
      }}
    >
      {/* Soft glow accent */}
      <div className="absolute -top-20 -right-10 w-48 h-48 rounded-full bg-fuchsia-400/15 blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between mb-4 relative">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center shadow-inner">
            <Users className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-white text-sm font-black leading-none">Bandingan Adik-Beradik</p>
            <p className="text-white/65 text-[10px] font-bold uppercase tracking-wider mt-1">Tap kad untuk pilih anak</p>
          </div>
        </div>
        {leaderName && (
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-yellow-400/20 border border-yellow-300/40">
            <Trophy className="w-3 h-3 text-yellow-300" />
            <span className="text-yellow-200 text-[10px] font-black uppercase tracking-wider">{leaderName} Memimpin</span>
          </div>
        )}
      </div>

      {/* Cards */}
      <div className="flex gap-2.5 overflow-x-auto overflow-y-visible pb-2 pt-3 -mx-1 px-1 snap-x snap-mandatory scrollbar-hide">
        {stats.map((c, i) => {
          const isActive = c.name === selectedChild;
          const isLeader = c.name === leaderName;
          const emoji = c.ageGroup === 'sekolah_rendah' ? '📚' : '🎨';
          const ageLabel = c.ageGroup === 'sekolah_rendah' ? 'Sekolah Rendah' : 'Prasekolah';

          return (
            <motion.button
              key={c.name}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, type: 'spring', stiffness: 220 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => onSelect(c.name)}
              className={`relative flex-shrink-0 rounded-2xl p-3 min-w-[160px] text-left snap-start transition-all duration-200 ${
                isActive
                  ? 'bg-white text-purple-900 shadow-2xl ring-2 ring-yellow-300/60'
                  : 'bg-white/10 text-white border border-white/20 hover:bg-white/18 hover:border-white/35'
              }`}
              style={isActive ? { transform: 'translateY(-2px)' } : undefined}
            >
              {/* Leader crown */}
              {isLeader && (
                <motion.div
                  initial={{ scale: 0, rotate: -30 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 300, delay: 0.3 }}
                  className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-gradient-to-br from-yellow-300 to-amber-500 flex items-center justify-center shadow-lg ring-2 ring-white z-10"
                  title="Pemimpin keluarga"
                >
                  <Trophy className="w-3.5 h-3.5 text-yellow-900" />
                </motion.div>
              )}

              {/* Active dot indicator */}
              {isActive && (
                <motion.div
                  layoutId="sibling-active-dot"
                  className="absolute top-2 left-2 w-2 h-2 rounded-full bg-purple-600 shadow-lg"
                />
              )}

              {/* Header: avatar + name */}
              <div className="flex items-center gap-2 mb-2.5">
                {c.avatarUrl ? (
                  <img
                    src={c.avatarUrl}
                    alt={c.name}
                    className={`w-11 h-11 rounded-xl object-cover flex-shrink-0 shadow-md ${
                      isActive ? 'ring-2 ring-purple-300' : 'ring-1 ring-white/30'
                    }`}
                  />
                ) : (
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0 shadow-md ${
                      isActive ? 'bg-purple-100' : 'bg-white/20 border border-white/25'
                    }`}
                  >
                    {emoji}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="font-black text-sm truncate leading-tight">{c.name}</p>
                  <p className={`text-[9px] font-black uppercase tracking-wide truncate ${isActive ? 'text-purple-500' : 'text-white/55'}`}>
                    {ageLabel}
                  </p>
                </div>
              </div>

              {/* Stats row — split into two clear metrics */}
              <div className={`grid grid-cols-2 gap-1.5 rounded-xl p-2 ${isActive ? 'bg-purple-50' : 'bg-white/8'}`}>
                <div className="text-center">
                  <p className={`text-[9px] font-black uppercase tracking-wider leading-none ${isActive ? 'text-amber-600' : 'text-yellow-300/90'}`}>
                    ⭐ Bintang
                  </p>
                  <p className={`font-black text-base leading-none mt-1 ${isActive ? 'text-purple-900' : 'text-white'}`}>
                    {c.totalStars}
                  </p>
                </div>
                <div className={`text-center border-l ${isActive ? 'border-purple-200' : 'border-white/15'}`}>
                  <p className={`text-[9px] font-black uppercase tracking-wider leading-none ${isActive ? 'text-purple-500' : 'text-white/65'}`}>
                    🎮 Games
                  </p>
                  <p className={`font-black text-base leading-none mt-1 ${isActive ? 'text-purple-900' : 'text-white'}`}>
                    {c.totalGames}
                  </p>
                </div>
              </div>

              {/* Streak badge */}
              {c.currentStreak > 0 && (
                <div
                  className={`flex items-center justify-center gap-1 mt-2 px-2 py-1 rounded-full text-[10px] font-black ${
                    isActive
                      ? 'bg-orange-100 text-orange-700'
                      : 'bg-orange-400/20 text-orange-200 border border-orange-300/30'
                  }`}
                >
                  <Flame className="w-3 h-3" />
                  <span>{c.currentStreak} hari berturut-turut</span>
                </div>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Mobile leader pill (visible only when leader exists, hidden on sm+) */}
      {leaderName && (
        <div className="sm:hidden flex justify-center mt-2">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-400/20 border border-yellow-300/40">
            <Trophy className="w-3 h-3 text-yellow-300" />
            <span className="text-yellow-200 text-[10px] font-black uppercase tracking-wider">{leaderName} Memimpin</span>
          </div>
        </div>
      )}
    </motion.div>
  );
}