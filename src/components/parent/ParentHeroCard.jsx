import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Zap, Star, Target } from 'lucide-react';

const HERO_BG = 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/dc153cf03_generated_image.png';

export default function ParentHeroCard({ totalChildren, totalGames, totalStars, avgStars }) {
  const stats = [
    { icon: Trophy, label: 'Anak Aktif', value: totalChildren, color: 'from-yellow-300 to-orange-400' },
    { icon: Zap, label: 'Games', value: totalGames, color: 'from-cyan-300 to-blue-400' },
    { icon: Star, label: 'Bintang', value: totalStars, color: 'from-pink-300 to-rose-400' },
    { icon: Target, label: 'Purata', value: `${avgStars}⭐`, color: 'from-emerald-300 to-teal-400' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative isolate overflow-hidden rounded-[2rem] border border-white/30 shadow-2xl shadow-purple-950/40 mb-5 transform-gpu [clip-path:inset(0_round_2rem)] min-h-[240px]"
    >
      <img
        src={HERO_BG}
        alt=""
        className="absolute inset-0 w-full h-full object-cover z-0"
        onError={(e) => { e.target.style.display = 'none'; }}
      />
      <div className="absolute inset-0 z-[1] bg-gradient-to-br from-purple-900/55 via-fuchsia-800/40 to-pink-700/60" />
      <div className="absolute inset-x-0 bottom-0 h-2/3 z-[1] bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

      <div className="relative z-10 p-5 md:p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-14 h-14 rounded-2xl bg-white/25 backdrop-blur-md ring-1 ring-white/40 flex items-center justify-center text-3xl shadow-lg flex-shrink-0">📊</div>
          <div>
            <p className="text-white/80 text-[11px] font-black uppercase tracking-[0.2em]">Parent Dashboard</p>
            <h1 className="text-2xl md:text-3xl font-black text-white leading-tight drop-shadow-lg">Prestasi Anak Anda</h1>
            <p className="text-white/90 text-xs font-bold mt-0.5 drop-shadow-md">Pantau perkembangan & motivasi belajar</p>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.05 }}
              className="rounded-2xl p-2.5 bg-white/20 backdrop-blur-md border border-white/30 text-center"
            >
              <div className={`w-7 h-7 rounded-xl mx-auto mb-1 bg-gradient-to-br ${s.color} flex items-center justify-center shadow-md`}>
                <s.icon className="w-3.5 h-3.5 text-white" />
              </div>
              <p className="text-white font-black text-base leading-none">{s.value}</p>
              <p className="text-white/80 text-[10px] font-bold mt-0.5 truncate">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}