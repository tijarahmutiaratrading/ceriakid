import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Gamepad2, Palette, BookOpen } from 'lucide-react';

const actions = [
  { to: '/games-hub', icon: Gamepad2, emoji: '🎮', title: 'Game Hub', subtitle: 'Permainan interaktif', tone: 'from-violet-500/45 via-fuchsia-400/30 to-blue-500/30', badge: 'HOT' },
  { to: '/drawing', icon: Palette, emoji: '🎨', title: 'Studio Lukisan', subtitle: 'Lukis bebas & tracing', tone: 'from-pink-500/45 via-rose-400/30 to-orange-400/30', badge: 'NEW' },
  { to: '/story-kid', icon: BookOpen, emoji: '📖', title: 'Story Kid', subtitle: 'Cerita interaktif', tone: 'from-amber-400/45 via-yellow-300/30 to-pink-400/30', featured: true, badge: '⭐' },
];

export default function QuickAccessGrid() {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="grid grid-cols-1 gap-3 sm:grid-cols-3 md:gap-4">
      {actions.map((item, idx) => {
        const Icon = item.icon;
        return (
          <Link key={item.to} to={item.to} className="block min-w-0">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + idx * 0.08 }}
              whileHover={{ scale: 1.04, y: -4 }}
              whileTap={{ scale: 0.97 }}
              className={`group relative h-full overflow-hidden rounded-[1.5rem] border border-white/20 bg-gradient-to-br ${item.tone} p-4 shadow-xl shadow-black/20 backdrop-blur-2xl transform-gpu [clip-path:inset(0_round_1.5rem)] md:rounded-[1.75rem] md:p-5 md:[clip-path:inset(0_round_1.75rem)]`}
            >
              {/* Animated shimmer */}
              <motion.div
                aria-hidden
                initial={{ x: '-100%' }}
                animate={{ x: '200%' }}
                transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 4 + idx, ease: 'easeInOut' }}
                className="pointer-events-none absolute inset-y-0 w-1/2 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"
              />
              <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-white/20 blur-2xl transition-all group-hover:bg-white/35 group-hover:scale-125" />
              {item.featured && (
                <motion.div animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.15, 1] }} transition={{ duration: 2.5, repeat: Infinity }} className="absolute right-3 top-3 text-yellow-200 text-lg drop-shadow">
                  ✨
                </motion.div>
              )}
              {item.badge && !item.featured && (
                <div className="absolute right-3 top-3 rounded-full bg-white/95 px-2 py-0.5 text-[9px] font-black text-purple-700 shadow-md">{item.badge}</div>
              )}
              <div className="relative z-10 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <motion.div whileHover={{ rotate: [0, -10, 10, 0] }} transition={{ duration: 0.5 }} className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/25 text-3xl ring-1 ring-white/30 shadow-lg backdrop-blur-sm">
                    {item.emoji}
                  </motion.div>
                  <p className="font-black text-white leading-tight drop-shadow-md text-base">{item.title}</p>
                  <p className="mt-1 text-xs font-bold text-white/90">{item.subtitle}</p>
                </div>
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-white text-purple-800 shadow-lg ring-2 ring-white/40 transition-transform group-hover:rotate-12">
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <div className="relative z-10 mt-4 inline-flex items-center gap-1 rounded-full bg-white/15 px-3 py-1 text-xs font-black text-white backdrop-blur-sm transition-all group-hover:bg-white/25 group-hover:gap-2">
                Buka <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </div>
            </motion.div>
          </Link>
        );
      })}
    </motion.div>
  );
}