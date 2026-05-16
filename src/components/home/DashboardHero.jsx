import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import ChildSelector from '@/components/ChildSelector';

const SUNSET_BG = 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/dae5af1e6_generated_image.png';

export default function DashboardHero({ user, avatarUrl, lang }) {
  const greeting = lang === 'bm' ? 'Selamat datang kembali!' : 'Welcome back!';
  const name = user?.full_name || 'Teman';

  return (
    <Link to="/settings" className="block">
      <motion.div
        initial={{ opacity: 0, y: -14 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.01 }}
        className="relative isolate overflow-hidden rounded-[2rem] border border-white/30 shadow-2xl shadow-orange-950/30 transform-gpu [clip-path:inset(0_round_2rem)] min-h-[200px] md:min-h-[260px]"
      >
        {/* Sunset background image */}
        <img
          src={SUNSET_BG}
          alt=""
          className="absolute inset-0 w-full h-full object-cover z-0"
          onError={(e) => { e.target.style.display = 'none'; }}
        />

        {/* Subtle dark overlay for text legibility */}
        <div className="absolute inset-0 z-[1] bg-gradient-to-r from-black/30 via-transparent to-black/20" />

        {/* Content */}
        <div className="relative z-10 h-full p-5 md:p-8 flex flex-col justify-between gap-4">
          {/* Top: Title */}
          <div>
            <h2 className="text-white font-black text-xl md:text-3xl drop-shadow-lg tracking-tight">
              CeriaKid Dashboard
            </h2>
            <p className="text-white/95 font-black text-base md:text-xl drop-shadow-md mt-1 md:mt-2">
              {greeting}
            </p>
          </div>

          {/* Bottom: Avatar + Name + Child Selector */}
          <div className="flex items-center gap-3 md:gap-4 flex-wrap">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="Avatar"
                className="h-14 w-14 md:h-16 md:w-16 rounded-full object-cover shadow-xl ring-4 ring-white/60 flex-shrink-0"
              />
            ) : (
              <div className="h-14 w-14 md:h-16 md:w-16 rounded-full bg-gradient-to-br from-orange-300 to-pink-400 flex items-center justify-center text-3xl shadow-xl ring-4 ring-white/60 flex-shrink-0">
                🐱
              </div>
            )}

            <h1 className="text-white font-black text-lg md:text-2xl drop-shadow-lg truncate flex-1 min-w-0">
              {name}
            </h1>

            <div onClick={(e) => e.preventDefault()} className="flex-shrink-0">
              <ChildSelector />
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}