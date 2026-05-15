import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Gamepad2, Palette, BookOpen } from 'lucide-react';

const actions = [
  { to: '/games-hub', icon: Gamepad2, emoji: '🎮', title: 'Game Hub', subtitle: 'Permainan interaktif', tone: 'from-violet-400/30 to-blue-400/20' },
  { to: '/drawing', icon: Palette, emoji: '🎨', title: 'Studio Lukisan', subtitle: 'Lukis bebas & tracing', tone: 'from-pink-400/30 to-orange-400/20' },
  { to: '/story-kid', icon: BookOpen, emoji: '📖', title: 'Story Kid', subtitle: 'Cerita interaktif', tone: 'from-yellow-300/30 to-pink-400/20', featured: true },
];

export default function QuickAccessGrid() {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="grid grid-cols-1 gap-3 sm:grid-cols-3 md:gap-4">
      {actions.map((item) => {
        const Icon = item.icon;
        return (
          <Link key={item.to} to={item.to} className="block min-w-0">
            <motion.div whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }} className={`group relative h-full overflow-hidden rounded-[1.5rem] border border-white/15 bg-gradient-to-br ${item.tone} p-4 shadow-xl shadow-black/10 backdrop-blur-2xl transform-gpu [clip-path:inset(0_round_1.5rem)] md:rounded-[1.75rem] md:p-5 md:[clip-path:inset(0_round_1.75rem)]`}>
              <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-white/15 blur-2xl transition-all group-hover:bg-white/25" />
              {item.featured && <div className="absolute right-3 top-3 text-yellow-200 animate-pulse">✨</div>}
              <div className="relative z-10 flex items-start justify-between gap-3">
                <div>
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 text-3xl ring-1 ring-white/15">{item.emoji}</div>
                  <p className="font-black text-white leading-tight drop-shadow">{item.title}</p>
                  <p className="mt-1 text-xs font-bold text-white/85">{item.subtitle}</p>
                </div>
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-white text-purple-800 shadow-lg">
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <div className="relative z-10 mt-4 inline-flex items-center gap-1 text-xs font-black text-white/90">
                Buka <ArrowRight className="h-3.5 w-3.5" />
              </div>
            </motion.div>
          </Link>
        );
      })}
    </motion.div>
  );
}