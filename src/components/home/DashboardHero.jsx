import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import ChildSelector from '@/components/ChildSelector';

const SCIENTIST_BG = 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/0db82d394_generated_image.png';
const CERIAKID_LOGO = 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/c0ad02d9e_ChatGPTImageMay12026at12_29_37PM.png';

export default function DashboardHero({ user, avatarUrl, lang }) {
  const greeting = lang === 'bm' ? 'Selamat datang kembali!' : 'Welcome back!';
  const name = user?.full_name || 'Teman';

  return (
    <Link to="/settings" className="block">
      <motion.div
        initial={{ opacity: 0, y: -14 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.01 }}
        className="relative isolate overflow-hidden rounded-[2rem] border border-white/30 shadow-2xl shadow-purple-950/30 transform-gpu [clip-path:inset(0_round_2rem)] min-h-[220px] md:min-h-[280px]"
      >
        {/* Full scientist background image */}
        <img
          src={SCIENTIST_BG}
          alt=""
          className="absolute inset-0 w-full h-full object-cover z-0"
          onError={(e) => { e.target.style.display = 'none'; }}
        />

        {/* Soft overlay for text legibility — keeps image visible */}
        <div className="absolute inset-0 z-[1] bg-gradient-to-b from-black/30 via-black/10 to-black/45" />

        {/* Content */}
        <div className="relative z-10 h-full p-5 md:p-8 flex flex-col justify-between gap-4">
          {/* Top: Logo + Title */}
          <div className="flex items-center gap-3">
            <img
              src={CERIAKID_LOGO}
              alt="CeriaKid"
              className="h-14 w-14 md:h-20 md:w-20 rounded-2xl shadow-xl ring-2 ring-white/70 flex-shrink-0"
            />
            <div className="min-w-0">
              <h2 className="text-white font-black text-2xl md:text-4xl drop-shadow-[0_3px_6px_rgba(0,0,0,0.6)] tracking-tight leading-tight">
                CeriaKid
              </h2>
              <p className="text-white/95 font-bold text-xs md:text-sm drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]">
                {greeting}
              </p>
            </div>
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

            <h1 className="text-white font-black text-lg md:text-2xl drop-shadow-[0_3px_6px_rgba(0,0,0,0.6)] truncate flex-1 min-w-0">
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