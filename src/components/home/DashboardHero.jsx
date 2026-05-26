import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Settings } from 'lucide-react';
import ChildSelector from '@/components/ChildSelector';

const SCIENTIST_BG = 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/0db82d394_generated_image.png';
const CERIAKID_LOGO = 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/c0ad02d9e_ChatGPTImageMay12026at12_29_37PM.png';

export default function DashboardHero({ user, avatarUrl, lang }) {
  const greeting = lang === 'bm' ? 'Selamat datang kembali' : 'Welcome back';
  const name = user?.full_name?.split(' ')[0] || 'Teman';

  return (
    <motion.div
      initial={{ opacity: 0, y: -14 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative isolate overflow-hidden rounded-[1.75rem] md:rounded-[2rem] border border-white/30 shadow-2xl shadow-purple-950/30 transform-gpu min-h-[180px] sm:min-h-[220px] md:min-h-[280px]"
    >
      {/* Background image */}
      <img
        src={SCIENTIST_BG}
        alt=""
        className="absolute inset-0 w-full h-full object-cover z-0"
        onError={(e) => { e.target.style.display = 'none'; }}
      />

      {/* Stronger overlay on mobile for legibility */}
      <div className="absolute inset-0 z-[1] bg-gradient-to-b from-purple-950/60 via-purple-900/30 to-black/70 md:from-black/30 md:via-black/10 md:to-black/45" />

      {/* Top-right settings shortcut */}
      <Link
        to="/settings"
        aria-label="Tetapan"
        className="absolute top-3 right-3 md:top-4 md:right-4 z-20 w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 backdrop-blur-md border border-white/30 flex items-center justify-center transition-colors"
      >
        <Settings className="w-4 h-4 text-white" />
      </Link>

      {/* Content */}
      <div className="relative z-10 h-full p-4 sm:p-5 md:p-8 flex flex-col justify-between gap-4 md:gap-5">
        {/* Top row: Logo + brand */}
        <div className="flex items-center gap-2.5 sm:gap-3 pr-10">
          <img
            src={CERIAKID_LOGO}
            alt="CeriaKid"
            className="h-11 w-11 sm:h-14 sm:w-14 md:h-20 md:w-20 rounded-xl md:rounded-2xl shadow-xl ring-2 ring-white/70 flex-shrink-0"
          />
          <div className="min-w-0">
            <h2 className="text-white font-black text-lg sm:text-2xl md:text-4xl drop-shadow-[0_3px_6px_rgba(0,0,0,0.6)] tracking-tight leading-tight">
              CeriaKid
            </h2>
            <p className="text-white/90 font-bold text-[11px] sm:text-xs md:text-sm drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)] leading-tight mt-0.5">
              {greeting}, {name}! 👋
            </p>
          </div>
        </div>

        {/* Bottom row: Child selector full-width on mobile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt="Avatar"
              className="h-11 w-11 sm:h-14 sm:w-14 md:h-16 md:w-16 rounded-full object-cover shadow-xl ring-2 sm:ring-4 ring-white/60 flex-shrink-0"
            />
          ) : (
            <div className="h-11 w-11 sm:h-14 sm:w-14 md:h-16 md:w-16 rounded-full bg-gradient-to-br from-orange-300 to-pink-400 flex items-center justify-center text-2xl sm:text-3xl shadow-xl ring-2 sm:ring-4 ring-white/60 flex-shrink-0">
              🐱
            </div>
          )}

          <div className="flex-1 min-w-0">
            <ChildSelector />
          </div>
        </div>
      </div>
    </motion.div>
  );
}