import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const categoryConfigs = {
  bahasa_melayu: { image: 'https://images.unsplash.com/photo-1577720643272-265f434e54f1?w=400&h=300&fit=crop', label: 'Bahasa Melayu', color: 'from-amber-300 to-yellow-400', accentBg: 'bg-amber-100/30' },
  english: { image: 'https://images.unsplash.com/photo-1546410531-bb4caa6b0e71?w=400&h=300&fit=crop', label: 'English', color: 'from-sky-300 to-blue-400', accentBg: 'bg-sky-100/30' },
  mathematics: { image: 'https://images.unsplash.com/photo-1596533405514-b30251012c96?w=400&h=300&fit=crop', label: 'Matematik', color: 'from-pink-300 to-rose-400', accentBg: 'bg-pink-100/30' },
  science: { image: 'https://images.unsplash.com/photo-1579154204601-01d966d545d1?w=400&h=300&fit=crop', label: 'Sains', color: 'from-emerald-300 to-green-400', accentBg: 'bg-emerald-100/30' },
  jawi: { image: 'https://images.unsplash.com/photo-1507842217343-583f20270319?w=400&h=300&fit=crop', label: 'Aksara Jawi', color: 'from-purple-300 to-indigo-400', accentBg: 'bg-purple-100/30' },
  worksheet: { image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&h=300&fit=crop', label: 'Worksheet', color: 'from-orange-300 to-amber-400', accentBg: 'bg-orange-100/30' },
  bahasa_tamil: { image: 'https://images.unsplash.com/photo-1504995617088-87a37e9d0e15?w=400&h=300&fit=crop', label: 'Bahasa Tamil', color: 'from-orange-300 to-red-400', accentBg: 'bg-orange-100/30' },
  bahasa_mandarin: { image: 'https://images.unsplash.com/photo-1536882240095-0379873feb4e?w=400&h=300&fit=crop', label: 'Bahasa Mandarin', color: 'from-red-300 to-pink-400', accentBg: 'bg-red-100/30' },
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

        

        {/* Background Image */}
        <div className="absolute inset-0 overflow-hidden">
          <img src={config.image} alt={config.label} className="w-full h-full object-cover opacity-40 group-hover:opacity-55 transition-opacity duration-300" />
        </div>

        {/* Content */}
        <div className="relative z-10 p-4 sm:p-6 md:p-8 h-full flex flex-col justify-between">
          <div>
            <h3 className="font-black text-lg sm:text-xl md:text-2xl text-white leading-tight break-words drop-shadow-md">{config.label}</h3>
          </div>

          <div className="flex items-end justify-between gap-3">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full font-black shadow-xl shadow-black/20 ring-1 ring-white/40 bg-gradient-to-br from-white/35 to-white/15 backdrop-blur-lg hover:from-white/45 hover:to-white/25 transition-all">
              <span className="text-base">🎮</span>
              <p className="text-xs text-white whitespace-nowrap leading-none font-bold">
                {gameCount} <span className="text-white/90">Game</span>
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-white/40 to-white/20 text-white shadow-lg hover:shadow-xl ring-1 ring-white/40 backdrop-blur-lg transition-all group-hover:translate-x-1.5 group-hover:scale-110 font-black text-lg">→</div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}