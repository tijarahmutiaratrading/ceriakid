import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Sparkles, UserRound, ChevronRight } from 'lucide-react';
import ChildSelector from '@/components/ChildSelector';

export default function DashboardHero({ user, avatarUrl, lang }) {
  const greeting = lang === 'bm' ? 'Selamat datang kembali!' : 'Welcome back!';
  const name = user?.full_name || 'Teman';

  return (
    <Link to="/settings" className="block">
      <motion.div
        initial={{ opacity: 0, y: -14 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.01 }}
        className="relative isolate overflow-hidden rounded-[2.5rem] border border-white/40 bg-gradient-to-br from-purple-600/60 via-pink-600/55 to-blue-600/50 p-5 shadow-xl shadow-purple-900/40 backdrop-blur-3xl transform-gpu [clip-path:inset(0_round_2.5rem)] md:p-8"
      >
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/35 via-white/15 to-transparent" />
        <div className="pointer-events-none absolute -right-20 -top-20 h-52 w-52 rounded-full bg-purple-300/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-1/3 h-60 w-60 rounded-full bg-pink-300/25 blur-3xl" />

        <div className="relative z-10 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" className="h-16 w-16 flex-shrink-0 rounded-[1.5rem] object-cover shadow-lg ring-2 ring-white/70 md:h-20 md:w-20" />
            ) : (
              <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-[1.5rem] bg-gradient-to-br from-purple-300 to-pink-300 text-4xl shadow-md ring-1 ring-white/60 md:h-20 md:w-20">🐱</div>
            )}
            <div className="min-w-0">
              <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/25 backdrop-blur-sm px-3.5 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-white shadow-sm">
                <Sparkles className="h-3.5 w-3.5 text-yellow-200" /> CeriaKid Dashboard
              </div>
              <p className="text-xs font-bold text-white/90 md:text-sm">{greeting}</p>
              <h1 className="truncate text-2xl font-black tracking-tight text-white md:text-4xl">{name}</h1>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end">
            <ChildSelector />
            <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 px-5 py-2.5 text-xs font-black text-white shadow-lg shadow-purple-400/40 hover:shadow-xl hover:from-purple-600 transition-all">
              <UserRound className="h-4 w-4" /> Tetapan <ChevronRight className="h-4 w-4" />
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}