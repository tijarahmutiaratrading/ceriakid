import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const categoryConfigs = {
  bahasa_melayu: { emoji: '🇲🇾', label: 'Bahasa Melayu', color: 'from-amber-300 to-yellow-400', accentBg: 'bg-amber-100/30' },
  english: { emoji: '🇬🇧', label: 'English', color: 'from-sky-300 to-blue-400', accentBg: 'bg-sky-100/30' },
  mathematics: { emoji: '🔢', label: 'Matematik', color: 'from-pink-300 to-rose-400', accentBg: 'bg-pink-100/30' },
  science: { emoji: '🔬', label: 'Sains', color: 'from-emerald-300 to-green-400', accentBg: 'bg-emerald-100/30' },
  jawi: { emoji: '🕌', label: 'Aksara Jawi', color: 'from-purple-300 to-indigo-400', accentBg: 'bg-purple-100/30' },
  worksheet: { emoji: '✏️', label: 'Worksheet', color: 'from-orange-300 to-amber-400', accentBg: 'bg-orange-100/30' },
  bahasa_tamil: { emoji: '🇮🇳', label: 'Bahasa Tamil', color: 'from-orange-300 to-red-400', accentBg: 'bg-orange-100/30' },
  bahasa_mandarin: { emoji: '🇨🇳', label: 'Bahasa Mandarin', color: 'from-red-300 to-pink-400', accentBg: 'bg-red-100/30' },
};

export default function CategoryCard({ category, gameCount, idx }) {
  const config = categoryConfigs[category];
  
  return (
    <Link to={`/games/${category}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: idx * 0.08 }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.96 }}
        className="rounded-[2rem] overflow-hidden cursor-pointer h-full min-h-[160px] sm:min-h-[200px] group relative border border-white/50 shadow-lg shadow-black/10 hover:shadow-xl hover:shadow-black/15 transition-shadow transform-gpu [clip-path:inset(0_round_2rem)]"
        >
        <div className={`absolute inset-0 bg-gradient-to-br ${config.color} opacity-85`} />
        <div className="absolute inset-0 bg-gradient-to-br from-white/25 via-white/8 to-transparent backdrop-blur-sm" />
        <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-white/30 blur-3xl transition-all group-hover:bg-white/40" />

        

         {/* Content */}
        <div className="relative z-10 p-4 sm:p-6 md:p-8 h-full flex flex-col justify-between">
          <div>
            <div className="text-5xl sm:text-6xl md:text-7xl mb-3 sm:mb-4 drop-shadow-md">{config.emoji}</div>
            <h3 className="font-black text-lg sm:text-xl md:text-2xl text-white leading-tight break-words drop-shadow-sm">{config.label}</h3>
          </div>

          <div className="flex justify-end">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/95 text-purple-700 shadow-lg hover:shadow-xl ring-1 ring-white/70 transition-all group-hover:translate-x-1.5 group-hover:scale-110 font-black text-lg">→</div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}