import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Sparkles, UserRound, ChevronRight } from 'lucide-react';
import ChildSelector from '@/components/ChildSelector';

export default function DashboardHero({ user, avatarUrl, lang }) {
  const hour = new Date().getHours();
  const timeOfDay = hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening';
  const greetings = {
    bm: { morning: 'Selamat pagi ☀️', afternoon: 'Selamat petang 🌤️', evening: 'Selamat malam 🌙' },
    en: { morning: 'Good morning ☀️', afternoon: 'Good afternoon 🌤️', evening: 'Good evening 🌙' },
  };
  const greeting = greetings[lang === 'bm' ? 'bm' : 'en'][timeOfDay];
  const name = user?.full_name?.split(' ')[0] || 'Teman';

  return (
    <Link to="/settings" className="block">
      <motion.div
        initial={{ opacity: 0, y: -14 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.01, y: -2 }}
        className="relative isolate overflow-hidden rounded-[1.5rem] border border-orange-200/30 bg-gradient-to-br from-orange-400/40 via-amber-300/25 to-pink-500/30 p-4 shadow-2xl shadow-orange-950/30 backdrop-blur-3xl transform-gpu [clip-path:inset(0_round_1.5rem)] md:rounded-[2.25rem] md:p-7 md:[clip-path:inset(0_round_2.25rem)]"
      >
        {/* Shimmer overlay */}
        <motion.div
          aria-hidden
          initial={{ x: '-150%' }}
          animate={{ x: '150%' }}
          transition={{ duration: 3.5, repeat: Infinity, repeatDelay: 5, ease: 'easeInOut' }}
          className="pointer-events-none absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/25 to-transparent skew-x-12"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/20 via-white/6 to-transparent" />
        <div className="pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full bg-orange-300/40 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-28 left-1/3 h-64 w-64 rounded-full bg-yellow-300/25 blur-3xl" />
        <motion.div
          aria-hidden
          animate={{ y: [0, -8, 0], rotate: [0, 8, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="pointer-events-none absolute right-8 top-4 text-2xl md:text-3xl drop-shadow-lg"
        >
          ✨
        </motion.div>

        <div className="relative z-10 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <motion.div whileHover={{ rotate: [0, -8, 8, 0] }} transition={{ duration: 0.5 }} className="relative flex-shrink-0">
              <div className="absolute inset-0 rounded-[1.35rem] bg-gradient-to-br from-yellow-300 to-pink-400 blur-md opacity-60" />
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="relative h-16 w-16 rounded-[1.35rem] object-cover shadow-2xl ring-2 ring-white/70 md:h-20 md:w-20" />
              ) : (
                <div className="relative flex h-16 w-16 items-center justify-center rounded-[1.35rem] bg-white/25 text-4xl shadow-2xl ring-2 ring-white/50 md:h-20 md:w-20">🐱</div>
              )}
              <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-green-400 ring-2 ring-white text-[9px]">✓</div>
            </motion.div>
            <div className="min-w-0">
              <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/25 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-white shadow-sm">
                <Sparkles className="h-3.5 w-3.5 text-yellow-200" /> CeriaKid
              </div>
              <p className="text-xs font-bold text-white/95 md:text-sm">{greeting}</p>
              <h1 className="truncate text-2xl font-black tracking-tight text-white drop-shadow-md md:text-4xl">{name} 👋</h1>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end">
            <ChildSelector />
            <motion.div whileHover={{ scale: 1.05 }} className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-black text-purple-800 shadow-xl ring-2 ring-white/60">
              <UserRound className="h-4 w-4" /> Tetapan <ChevronRight className="h-4 w-4" />
            </motion.div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}