import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const categoryConfigs = {
  bahasa_melayu: { emoji: '🇲🇾', label: 'Bahasa Melayu', color: 'from-amber-400 via-yellow-400 to-orange-400', shadow: 'shadow-amber-400/50' },
  english: { emoji: '🇬🇧', label: 'English', color: 'from-sky-400 via-blue-400 to-cyan-500', shadow: 'shadow-blue-400/50' },
  mathematics: { emoji: '🔢', label: 'Matematik', color: 'from-pink-400 via-rose-400 to-red-400', shadow: 'shadow-pink-400/50' },
  science: { emoji: '🔬', label: 'Sains', color: 'from-emerald-400 via-green-400 to-teal-500', shadow: 'shadow-emerald-400/50' },
  jawi: { emoji: '🕌', label: 'Aksara Jawi', color: 'from-purple-400 via-indigo-400 to-blue-500', shadow: 'shadow-purple-400/50' },
  worksheet: { emoji: '✏️', label: 'Worksheet', color: 'from-orange-400 via-amber-400 to-yellow-400', shadow: 'shadow-orange-400/50' },
  bahasa_tamil: { emoji: '🇮🇳', label: 'Bahasa Tamil', color: 'from-orange-500 via-red-400 to-pink-500', shadow: 'shadow-red-400/50' },
  bahasa_mandarin: { emoji: '🇨🇳', label: 'Bahasa Mandarin', color: 'from-red-400 via-pink-400 to-rose-400', shadow: 'shadow-red-400/50' },
};

export default function CategoryCard({ category, gameCount, idx }) {
  const config = categoryConfigs[category];
  
  return (
    <Link to={`/games/${category}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: idx * 0.08 }}
        whileHover={{ scale: 1.05, y: -8 }}
        whileTap={{ scale: 0.94 }}
        className={`rounded-3xl overflow-hidden cursor-pointer h-full min-h-[180px] sm:min-h-[220px] group relative shadow-2xl ${config.shadow} hover:shadow-2xl transition-all transform-gpu [clip-path:inset(0_round_3rem)]`}
        >
        <div className={`absolute inset-0 bg-gradient-to-br ${config.color}`} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        <div className="absolute -right-20 -top-20 w-56 h-56 bg-white/15 rounded-full blur-3xl group-hover:bg-white/25 transition-all" />

        {/* Content */}
        <div className="relative z-10 p-6 sm:p-7 md:p-8 h-full flex flex-col justify-between">
          <div>
            <div className="text-7xl sm:text-8xl md:text-9xl mb-4 drop-shadow-lg select-none">{config.emoji}</div>
            <h3 className="font-black text-2xl sm:text-3xl md:text-4xl text-white leading-tight drop-shadow-md">{config.label}</h3>
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full font-black shadow-xl bg-white text-gray-900 hover:bg-gray-50 transition-colors">
              <span className="text-lg">🎮</span>
              <p className="text-sm font-black">{gameCount} Games</p>
            </div>
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/95 text-gray-900 shadow-xl transition-all group-hover:translate-x-2 group-hover:scale-125 font-black text-2xl">→</div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}