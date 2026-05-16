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
        className="relative isolate overflow-hidden rounded-[2rem] border border-purple-300/50 bg-gradient-to-br from-purple-400/40 via-pink-300/30 to-blue-300/25 p-5 shadow-lg shadow-purple-300/20 backdrop-blur-2xl transform-gpu [clip-path:inset(0_round_2rem)] md:p-7"
      >
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/25 via-white/10 to-transparent" />
        <div className="pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full bg-purple-300/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-28 left-1/3 h-64 w-64 rounded-full bg-pink-300/15 blur-3xl" />

        <div className="relative z-10 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" className="h-16 w-16 flex-shrink-0 rounded-[1.35rem] object-cover shadow-2xl ring-2 ring-white/50 md:h-20 md:w-20" />
            ) : (
              <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-[1.35rem] bg-gradient-to-br from-purple-300 to-pink-300 text-4xl shadow-lg md:h-20 md:w-20">🐱</div>
            )}
            <div className="min-w-0">
              <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-purple-400/50 bg-white/40 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-purple-900">
                <Sparkles className="h-3.5 w-3.5 text-purple-600" /> CeriaKid Dashboard
              </div>
              <p className="text-xs font-bold text-purple-700/80 md:text-sm">{greeting}</p>
              <h1 className="truncate text-2xl font-black tracking-tight text-purple-950 md:text-4xl">{name}</h1>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end">
            <ChildSelector />
            <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-2 text-xs font-black text-white shadow-lg shadow-purple-400/30">
              <UserRound className="h-4 w-4" /> Tetapan <ChevronRight className="h-4 w-4" />
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}