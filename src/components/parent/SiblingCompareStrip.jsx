import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Flame, Users } from 'lucide-react';

/**
 * Duolingo-style sibling strip — chunky white cards with thick green border on active,
 * pressed-button shadows, gold trophy crown on leader.
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
      className="rounded-3xl p-5 mb-4 bg-white"
      style={{
        border: '3px solid #e2e8f0',
        boxShadow: '0 4px 0 #cbd5e1, 0 10px 20px rgba(15,23,42,0.05)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: '#58cc02', boxShadow: '0 3px 0 #4fb302' }}
          >
            <Users className="w-5 h-5 text-white" strokeWidth={3} />
          </div>
          <div>
            <p className="text-slate-900 text-base font-black leading-none">Adik-Beradik</p>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-wider mt-1">Tap untuk pilih anak</p>
          </div>
        </div>
        {leaderName && (
          <div
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl"
            style={{ background: '#fef9c3', border: '2px solid #fde047', boxShadow: '0 2px 0 #facc15' }}
          >
            <Trophy className="w-3.5 h-3.5 text-yellow-600" strokeWidth={3} />
            <span className="text-yellow-800 text-[10px] font-black uppercase tracking-wider">{leaderName} #1</span>
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
              className="relative flex-shrink-0 rounded-2xl p-3 min-w-[170px] text-left snap-start transition-all"
              style={
                isActive
                  ? {
                      background: '#dcfce7',
                      border: '3px solid #58cc02',
                      boxShadow: '0 4px 0 #4fb302',
                    }
                  : {
                      background: '#ffffff',
                      border: '3px solid #e2e8f0',
                      boxShadow: '0 3px 0 #cbd5e1',
                    }
              }
            >
              {/* Leader crown */}
              {isLeader && (
                <motion.div
                  initial={{ scale: 0, rotate: -30 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 300, delay: 0.3 }}
                  className="absolute -top-3 -right-2 w-8 h-8 rounded-full flex items-center justify-center z-10"
                  style={{ background: '#ffc800', border: '2.5px solid white', boxShadow: '0 3px 0 #e6b400' }}
                  title="Pemimpin keluarga"
                >
                  <Trophy className="w-4 h-4 text-yellow-900" strokeWidth={3} />
                </motion.div>
              )}

              {/* Header: avatar + name */}
              <div className="flex items-center gap-2 mb-2.5">
                {c.avatarUrl ? (
                  <img
                    src={c.avatarUrl}
                    alt={c.name}
                    className="w-12 h-12 rounded-xl object-cover flex-shrink-0"
                    style={{ border: `2px solid ${isActive ? '#58cc02' : '#e2e8f0'}` }}
                  />
                ) : (
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                    style={{
                      background: isActive ? '#bbf7d0' : '#f1f5f9',
                      border: `2px solid ${isActive ? '#58cc02' : '#e2e8f0'}`,
                    }}
                  >
                    {emoji}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="font-black text-sm truncate leading-tight text-slate-900">{c.name}</p>
                  <p className="text-[9px] font-black uppercase tracking-wide truncate text-slate-500 mt-0.5">
                    {ageLabel}
                  </p>
                </div>
              </div>

              {/* Stats row */}
              <div
                className="grid grid-cols-2 gap-1.5 rounded-xl p-2"
                style={{ background: isActive ? 'rgba(255,255,255,0.6)' : '#f8fafc' }}
              >
                <div className="text-center">
                  <p className="text-[9px] font-black uppercase tracking-wider leading-none text-amber-600">
                    ⭐ Bintang
                  </p>
                  <p className="font-black text-lg leading-none mt-1 text-slate-900 tabular-nums">{c.totalStars}</p>
                </div>
                <div className="text-center border-l-2" style={{ borderColor: isActive ? '#86efac' : '#e2e8f0' }}>
                  <p className="text-[9px] font-black uppercase tracking-wider leading-none text-blue-500">
                    🎮 Games
                  </p>
                  <p className="font-black text-lg leading-none mt-1 text-slate-900 tabular-nums">{c.totalGames}</p>
                </div>
              </div>

              {/* Streak badge */}
              {c.currentStreak > 0 && (
                <div
                  className="flex items-center justify-center gap-1 mt-2 px-2 py-1.5 rounded-xl text-[10px] font-black"
                  style={{ background: '#ffedd5', color: '#9a3412', border: '1.5px solid #fdba74' }}
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
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl"
            style={{ background: '#fef9c3', border: '2px solid #fde047', boxShadow: '0 2px 0 #facc15' }}
          >
            <Trophy className="w-3.5 h-3.5 text-yellow-600" strokeWidth={3} />
            <span className="text-yellow-800 text-[10px] font-black uppercase tracking-wider">{leaderName} #1</span>
          </div>
        </div>
      )}
    </motion.div>
  );
}