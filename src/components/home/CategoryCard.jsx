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
};

export default function CategoryCard({ category, gameCount, idx }) {
  const config = categoryConfigs[category];
  
  return (
    <Link to={`/games/${category}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: idx * 0.08 }}
        whileHover={{ scale: 1.04, y: -6 }}
        whileTap={{ scale: 0.96 }}
        className={`clay rounded-3xl overflow-hidden cursor-pointer h-full min-h-[160px] group relative`}
      >
        {/* Gradient Background */}
        <div className={`absolute inset-0 bg-gradient-to-br ${config.color} opacity-90`} />
        
        {/* Floating Accent */}
        <div className={`absolute -top-8 -right-8 w-32 h-32 rounded-full ${config.accentBg} blur-2xl opacity-50 group-hover:opacity-70 transition-opacity`} />

        {/* Content */}
        <div className="relative z-10 p-6 h-full flex flex-col justify-between">
          <div>
            <div className="text-5xl mb-3 group-hover:scale-110 transition-transform origin-left">{config.emoji}</div>
            <h3 className="font-black text-xl text-white drop-shadow-sm">{config.label}</h3>
          </div>
          
          <div className="flex items-end justify-between">
            <div className="bg-white/30 backdrop-blur-sm rounded-full px-3 py-1">
              <p className="text-sm font-bold text-white">{gameCount} Games</p>
            </div>
            <motion.div
              animate={{ x: [0, 4, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-2xl opacity-70 group-hover:opacity-100"
            >
              →
            </motion.div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}