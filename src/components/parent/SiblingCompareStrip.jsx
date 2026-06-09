import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Flame, Users } from 'lucide-react';
import { getChildAvatar } from '@/lib/childAvatars';

export default function SiblingCompareStrip({ children, childrenData, selectedChild, onSelect }) {
  if (!children || children.length < 2) return null;

  const stats = children.map((child) => {
    const games = childrenData[child.name] || [];
    const totalStars = games.reduce((sum, g) => sum + (g.bestStars || 0), 0);
    const totalGames = games.length;
    const avg = totalGames > 0 ? totalStars / totalGames : 0;
    return { ...child, totalStars, totalGames, avg };
  });

  const leader = [...stats].sort((a, b) => b.totalStars - a.totalStars)[0];
  const leaderName = leader && leader.totalStars > 0 ? leader.name : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-3xl shadow-xl border border-white/60 mb-4 overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center">
            <Users className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-slate-900 text-sm font-black leading-none">Adik-Beradik</p>
            <p className="text-slate-400 text-[10px] font-semibold mt-0.5">Tap untuk pilih anak</p>
          </div>
        </div>
        {leaderName && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-50 border border-amber-200">
            <Trophy className="w-3 h-3 text-amber-600" />
            <span className="text-amber-700 text-[10px] font-bold">{leaderName} #1</span>
          </div>
        )}
      </div>

      {/* Cards */}
      <div className="flex gap-2 overflow-x-auto pb-3 pt-3 px-4 snap-x snap-mandatory scrollbar-hide">
        {stats.map((c, i) => {
          const isActive = c.name === selectedChild;
          const isLeader = c.name === leaderName;
          const emoji = c.ageGroup === 'sekolah_rendah' ? '📚' : '🎨';
          const ageLabel = c.ageGroup === 'sekolah_rendah' ? 'Sek. Rendah' : 'Prasekolah';

          return (
            <motion.button
              key={c.name}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onSelect(c.name)}
              className={`relative flex-shrink-0 rounded-xl p-3 min-w-[160px] text-left snap-start border transition-all ${
                isActive
                  ? 'bg-violet-50 border-violet-300 ring-1 ring-violet-200'
                  : 'bg-slate-50 border-slate-200 hover:border-slate-300'
              }`}
            >
              {isLeader && (
                <div className="absolute -top-2 -right-1 flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-amber-400 border border-white">
                  <Trophy className="w-2.5 h-2.5 text-white" />
                  <span className="text-white text-[8px] font-black">TOP</span>
                </div>
              )}

              <div className="flex items-center gap-2 mb-2.5">
                <img
                  src={getChildAvatar(c)}
                  alt={c.name}
                  className="w-10 h-10 rounded-lg object-cover flex-shrink-0 ring-1 ring-slate-200"
                />
                <div className="min-w-0">
                  <p className="font-black text-sm truncate text-slate-900">{c.name}</p>
                  <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-wide">{ageLabel}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-1.5">
                <div className="bg-white rounded-lg px-2 py-1.5 text-center ring-1 ring-slate-100">
                  <p className="text-[9px] font-bold text-amber-600 uppercase tracking-wide">Bintang</p>
                  <p className="font-black text-base text-slate-900 leading-tight tabular-nums">{c.totalStars}</p>
                </div>
                <div className="bg-white rounded-lg px-2 py-1.5 text-center ring-1 ring-slate-100">
                  <p className="text-[9px] font-bold text-sky-600 uppercase tracking-wide">Games</p>
                  <p className="font-black text-base text-slate-900 leading-tight tabular-nums">{c.totalGames}</p>
                </div>
              </div>

              {c.currentStreak > 0 && (
                <div className="flex items-center gap-1 mt-2 px-2 py-1 rounded-md bg-red-50 border border-red-100">
                  <Flame className="w-3 h-3 text-red-500" />
                  <span className="text-red-600 text-[10px] font-bold">{c.currentStreak}h streak</span>
                </div>
              )}
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}