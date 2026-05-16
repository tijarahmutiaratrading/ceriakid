import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Gamepad2, Palette, BookOpen } from 'lucide-react';

const actions = [
  {
    to: '/games-hub',
    icon: Gamepad2,
    emoji: '🎮',
    title: 'Game Hub',
    subtitle: 'Permainan seronok',
    gradient: 'from-violet-500 via-purple-500 to-blue-500',
    glow: 'shadow-violet-500/40',
  },
  {
    to: '/drawing',
    icon: Palette,
    emoji: '🎨',
    title: 'Studio Lukisan',
    subtitle: 'Lukis & tracing',
    gradient: 'from-pink-500 via-rose-500 to-orange-500',
    glow: 'shadow-pink-500/40',
  },
  {
    to: '/story-kid',
    icon: BookOpen,
    emoji: '📖',
    title: 'Story Kid',
    subtitle: 'Cerita interaktif',
    gradient: 'from-amber-400 via-orange-500 to-pink-500',
    glow: 'shadow-orange-500/40',
    featured: true,
  },
];

export default function QuickAccessGrid() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="grid grid-cols-3 gap-2.5 md:gap-4"
    >
      {actions.map((item, i) => {
        const Icon = item.icon;
        return (
          <Link key={item.to} to={item.to} className="block min-w-0" aria-label={`Buka ${item.title}`}>
            <motion.div
              whileHover={{ scale: 1.04, y: -3 }}
              whileTap={{ scale: 0.96 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.06 }}
              className={`group relative h-full min-h-[140px] overflow-hidden rounded-3xl bg-gradient-to-br ${item.gradient} p-3 shadow-xl ${item.glow} md:min-h-[160px] md:p-4 isolate`}
            >
              {/* Decorative shine */}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/25 via-transparent to-transparent" />
              <div className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full bg-white/20 blur-2xl transition-all group-hover:bg-white/35" />

              {item.featured && (
                <motion.div
                  animate={{ rotate: [0, 15, -15, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute right-2 top-2 text-yellow-200 text-lg"
                >
                  ✨
                </motion.div>
              )}

              <div className="relative z-10 flex h-full flex-col items-center justify-center gap-2 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/25 text-3xl ring-2 ring-white/40 shadow-lg backdrop-blur-sm md:h-16 md:w-16 md:text-4xl">
                  {item.emoji}
                </div>
                <div>
                  <p className="font-black text-white text-xs leading-tight md:text-sm" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.35)' }}>
                    {item.title}
                  </p>
                  <p className="mt-0.5 text-[10px] font-bold text-white/90 md:text-xs">
                    {item.subtitle}
                  </p>
                </div>
              </div>
            </motion.div>
          </Link>
        );
      })}
    </motion.div>
  );
}