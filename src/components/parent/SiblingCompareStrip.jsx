import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Flame } from 'lucide-react';

/**
 * Playful CeriaKid sibling strip — pastel candy cards, bouncy mascots,
 * gold crown for the leader, soft rainbow vibes.
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

  const leader = [...stats].sort((a, b) => b.totalStars - a.totalStars)[0];
  const leaderName = leader && leader.totalStars > 0 ? leader.name : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-[2rem] p-5 mb-4"
      style={{
        background: 'linear-gradient(135deg, #ffffff 0%, #fef9f3 100%)',
        boxShadow: '0 8px 20px rgba(251, 207, 232, 0.25), 0 0 0 2px rgba(251, 207, 232, 0.3)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <motion.div
            animate={{ rotate: [0, 8, -8, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="text-3xl"
          >
            👨‍👩‍👧‍👦
          </motion.div>
          <div>
            <p className="text-slate-800 text-base font-black leading-none">Adik-Beradik</p>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-wider mt-1">Tap untuk pilih anak</p>
          </div>
        </div>
        {leaderName && (
          <div
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full"
            style={{ background: '#fef3c7', boxShadow: '0 2px 0 #fcd34d' }}
          >
            <Trophy className="w-3.5 h-3.5 text-amber-600" strokeWidth={3} />
            <span className="text-amber-800 text-[10px] font-black uppercase tracking-wider">{leaderName} #1</span>
          </div>
        )}
      </div>

      {/* Cards */}
      <div className="flex gap-3 overflow-x-auto overflow-y-visible pb-2 pt-3 -mx-1 px-1 snap-x snap-mandatory scrollbar-hide">
        {stats.map((c, i) => {
          const isActive = c.name === selectedChild;
          const isLeader = c.name === leaderName;
          const emoji = c.ageGroup === 'sekolah_rendah' ? '📚' : '🎨';
          const ageLabel = c.ageGroup === 'sekolah_rendah' ? 'Sek. Rendah' : 'Prasekolah';

          return (
            <motion.button
              key={c.name}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, type: 'spring', stiffness: 220 }}
              whileTap={{ scale: 0.96, y: 2 }}
              onClick={() => onSelect(c.name)}
              className="relative flex-shrink-0 rounded-3xl p-3 min-w-[170px] text-left snap-start transition-all"
              style={
                isActive
                  ? {
                      background: 'linear-gradient(135deg, #fef3c7 0%, #fbcfe8 100%)',
                      boxShadow: '0 5px 0 #f9a8d4, 0 8px 20px rgba(251, 207, 232, 0.4)',
                    }
                  : {
                      background: '#ffffff',
                      boxShadow: '0 3px 0 #e2e8f0, 0 4px 10px rgba(0,0,0,0.04)',
                    }
              }
            >
              {/* Leader crown */}
              {isLeader && (
                <motion.div
                  initial={{ scale: 0, rotate: -30 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 300, delay: 0.3 }}
                  className="absolute -top-3 -right-2 w-9 h-9 rounded-full flex items-center justify-center z-10"
                  style={{
                    background: 'linear-gradient(135deg, #fcd34d 0%, #f59e0b 100%)',
                    border: '2.5px solid white',
                    boxShadow: '0 3px 8px rgba(251, 191, 36, 0.5)',
                  }}
                  title="Pemimpin keluarga"
                >
                  <Trophy className="w-4 h-4 text-white" strokeWidth={3} />
                </motion.div>
              )}

              {/* Header: avatar + name */}
              <div className="flex items-center gap-2 mb-2.5">
                {c.avatarUrl ? (
                  <img
                    src={c.avatarUrl}
                    alt={c.name}
                    className="w-12 h-12 rounded-2xl object-cover flex-shrink-0"
                    style={{ boxShadow: `0 3px 0 ${isActive ? '#f9a8d4' : '#e2e8f0'}` }}
                  />
                ) : (
                  <motion.div
                    animate={isActive ? { y: [0, -3, 0] } : {}}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                    style={{
                      background: isActive ? 'rgba(255,255,255,0.8)' : '#fef9f3',
                      boxShadow: `0 3px 0 ${isActive ? '#f9a8d4' : '#fde68a'}`,
                    }}
                  >
                    {emoji}
                  </motion.div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="font-black text-sm truncate leading-tight text-slate-800">{c.name}</p>
                  <p className="text-[9px] font-black uppercase tracking-wide truncate text-slate-500 mt-0.5">
                    {ageLabel}
                  </p>
                </div>
              </div>

              {/* Stats row */}
              <div
                className="grid grid-cols-2 gap-1.5 rounded-2xl p-2"
                style={{ background: isActive ? 'rgba(255,255,255,0.7)' : '#fef9f3' }}
              >
                <div className="text-center">
                  <p className="text-[9px] font-black uppercase tracking-wider leading-none text-amber-600">
                    ⭐ Bintang
                  </p>
                  <p className="font-black text-lg leading-none mt-1 text-slate-800 tabular-nums">{c.totalStars}</p>
                </div>
                <div className="text-center border-l-2" style={{ borderColor: isActive ? '#fbcfe8' : '#fde68a' }}>
                  <p className="text-[9px] font-black uppercase tracking-wider leading-none text-blue-500">
                    🎮 Games
                  </p>
                  <p className="font-black text-lg leading-none mt-1 text-slate-800 tabular-nums">{c.totalGames}</p>
                </div>
              </div>

              {/* Streak badge */}
              {c.currentStreak > 0 && (
                <div
                  className="flex items-center justify-center gap-1 mt-2 px-2 py-1.5 rounded-full text-[10px] font-black"
                  style={{ background: '#fee2e2', color: '#991b1b' }}
                >
                  <Flame className="w-3 h-3" strokeWidth={3} />
                  <span>{c.currentStreak}h streak</span>
                </div>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Mobile leader pill */}
      {leaderName && (
        <div className="sm:hidden flex justify-center mt-3">
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
            style={{ background: '#fef3c7', boxShadow: '0 2px 0 #fcd34d' }}
          >
            <Trophy className="w-3.5 h-3.5 text-amber-600" strokeWidth={3} />
            <span className="text-amber-800 text-[10px] font-black uppercase tracking-wider">{leaderName} #1</span>
          </div>
        </div>
      )}
    </motion.div>
  );
}