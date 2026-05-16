import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Sparkles, Settings, ChevronRight } from 'lucide-react';
import ChildSelector from '@/components/ChildSelector';

export default function DashboardHero({ user, avatarUrl, lang }) {
  const hour = new Date().getHours();
  const greeting = lang === 'bm'
    ? (hour < 12 ? 'Selamat pagi' : hour < 18 ? 'Selamat petang' : 'Selamat malam')
    : (hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening');
  const name = user?.full_name?.split(' ')[0] || 'Teman';

  return (
    <motion.div
      initial={{ opacity: 0, y: -14 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative isolate overflow-hidden rounded-[1.75rem] border border-white/20 bg-gradient-to-br from-fuchsia-500/30 via-purple-500/20 to-indigo-500/25 p-4 shadow-2xl shadow-purple-950/30 backdrop-blur-3xl md:rounded-[2.25rem] md:p-6"
    >
      {/* Decorative orbs */}
      <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-pink-400/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-10 h-56 w-56 rounded-full bg-blue-400/25 blur-3xl" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent" />

      <div className="relative z-10 flex items-center gap-4">
        <Link to="/settings" className="flex-shrink-0">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="relative">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" className="h-16 w-16 rounded-2xl object-cover shadow-2xl ring-2 ring-white/60 md:h-20 md:w-20" />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/25 text-4xl shadow-2xl ring-2 ring-white/40 md:h-20 md:w-20">🐱</div>
            )}
          </motion.div>
        </Link>

        <div className="min-w-0 flex-1">
          <div className="mb-1.5 inline-flex items-center gap-1.5 rounded-full border border-white/30 bg-white/15 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-white">
            <Sparkles className="h-3 w-3 text-yellow-300" /> {greeting}
          </div>
          <h1 className="truncate text-xl font-black leading-tight text-white md:text-3xl" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.25)' }}>
            Hai, {name}! 👋
          </h1>
          <p className="mt-0.5 text-xs font-bold text-white/85 md:text-sm">
            {lang === 'bm' ? 'Jom belajar hari ini!' : "Let's learn today!"}
          </p>
        </div>

        <Link to="/settings" className="flex-shrink-0">
          <motion.div whileTap={{ scale: 0.92 }} className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/20 ring-1 ring-white/30 backdrop-blur-xl transition hover:bg-white/30">
            <Settings className="h-5 w-5 text-white" />
          </motion.div>
        </Link>
      </div>

      {/* Child Selector bar */}
      <div className="relative z-10 mt-4 rounded-2xl border border-white/15 bg-white/10 p-2 backdrop-blur-xl">
        <ChildSelector />
      </div>
    </motion.div>
  );
}