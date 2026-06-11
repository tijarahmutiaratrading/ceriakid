import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Gamepad2, Palette, BookOpen, GraduationCap, Library, Sparkles } from 'lucide-react';

const actions = [
  { to: '/games-hub', icon: Gamepad2, emoji: '🎮', title: 'Game Hub', subtitle: 'Permainan interaktif', tone: 'from-violet-400/30 to-blue-400/20', image: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/c313ca888_generated_image.png' },
  { to: '/3m', icon: GraduationCap, emoji: '📚', title: 'Modul 3M', subtitle: 'Membaca · Menulis · Mengira', tone: 'from-blue-400/30 to-emerald-400/20', featured: true, image: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/dd42df217_generated_image.png' },
  { to: '/ai-hub', icon: Sparkles, emoji: '🤖', title: 'AI Hub', subtitle: 'Cikgu AI · Kuiz · Cerita · BBM', tone: 'from-indigo-400/30 to-fuchsia-400/20', featured: true, image: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/2ad5ce117_generated_image.png' },
  { to: '/library', icon: Library, emoji: '📒', title: 'Library Hub', subtitle: 'Nota & mind map silibus', tone: 'from-purple-400/30 to-pink-400/20', featured: true, image: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/cbafc9750_generated_image.png' },
  { to: '/drawing', icon: Palette, emoji: '🎨', title: 'Studio Lukisan', subtitle: 'Lukis bebas & tracing', tone: 'from-pink-400/30 to-orange-400/20', image: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/1bf081296_generated_image.png' },
  { to: '/story-kid', icon: BookOpen, emoji: '📖', title: 'Story Kid', subtitle: 'Cerita interaktif', tone: 'from-yellow-300/30 to-pink-400/20', image: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/71823ab6e_generated_image.png' },
];

export default function QuickAccessGrid() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="flex gap-3 overflow-x-auto scrollbar-hide snap-x snap-mandatory -mx-4 px-4 pb-2 md:gap-4"
    >
      {actions.map((item) => {
        const Icon = item.icon;
        return (
          <Link key={item.to} to={item.to} className="block snap-start shrink-0 w-[180px] sm:w-[210px]" aria-label={`Buka ${item.title}`}>
            <motion.div whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }} className={`group relative h-full min-h-[170px] overflow-hidden rounded-[1.75rem] border border-white/40 bg-gradient-to-br ${item.tone} p-5 shadow-lg shadow-purple-200/20 backdrop-blur-xl transform-gpu [clip-path:inset(0_round_1.75rem)] md:p-6`}>
              {item.image && (
                <img src={item.image} alt={item.title} className="absolute inset-0 w-full h-full object-cover z-0 group-hover:scale-110 transition-transform duration-500" onError={(e) => e.target.style.display = 'none'} />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-purple-950/80 via-purple-950/40 to-purple-900/20 z-[1]" />
              <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-white/20 blur-2xl transition-all group-hover:bg-white/30 z-[1]" />
              {item.featured && <div className="absolute right-3 top-3 text-yellow-200 animate-pulse">✨</div>}
              <div className="relative z-10 flex items-start justify-between gap-3">
                <div>
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/50 text-3xl ring-1 ring-white/70">{item.emoji}</div>
                  <p className="font-black text-white text-sm leading-tight">{item.title}</p>
                  <p className="mt-1 text-xs font-bold text-white/90">{item.subtitle}</p>
                </div>
                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-white/90 text-purple-600 shadow-lg shadow-white/20 hover:bg-white transition-colors">
                  <Icon className="h-5 w-5" />
                </div>
              </div>
              <div className="relative z-10 mt-4 inline-flex items-center gap-1 text-xs font-black text-white">
                Buka <ArrowRight className="h-3.5 w-3.5" />
              </div>
            </motion.div>
          </Link>
        );
      })}
    </motion.div>
  );
}