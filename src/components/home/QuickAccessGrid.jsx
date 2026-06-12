import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, ChevronRight, Gamepad2, Palette, BookOpen, GraduationCap, Library, Sparkles } from 'lucide-react';

const actions = [
  { to: '/games-hub', icon: Gamepad2, emoji: '🎮', title: 'Game Hub', subtitle: 'Permainan interaktif', tone: 'from-violet-400/30 to-blue-400/20', image: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/c313ca888_generated_image.png' },
  { to: '/3m', icon: GraduationCap, emoji: '📚', title: 'Modul 3M', subtitle: 'Membaca · Menulis · Mengira', tone: 'from-blue-400/30 to-emerald-400/20', featured: true, image: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/dd42df217_generated_image.png' },
  { to: '/ai-hub', icon: Sparkles, emoji: '🤖', title: 'AI Hub', subtitle: 'Cikgu AI · Kuiz · Cerita · BBM', tone: 'from-indigo-400/30 to-fuchsia-400/20', featured: true, image: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/2ad5ce117_generated_image.png' },
  { to: '/library', icon: Library, emoji: '📒', title: 'Library Hub', subtitle: 'Nota & mind map silibus', tone: 'from-purple-400/30 to-pink-400/20', featured: true, image: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/cbafc9750_generated_image.png' },
  { to: '/arcade', icon: Gamepad2, emoji: '🕹️', title: 'Arcade Zone', subtitle: 'Game santai & nilai murni', tone: 'from-fuchsia-400/30 to-violet-400/20', featured: true, image: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/c313ca888_generated_image.png' },
  { to: '/drawing', icon: Palette, emoji: '🎨', title: 'Studio Lukisan', subtitle: 'Lukis bebas & tracing', tone: 'from-pink-400/30 to-orange-400/20', image: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/1bf081296_generated_image.png' },
  { to: '/story-kid', icon: BookOpen, emoji: '📖', title: 'Story Kid', subtitle: 'Cerita interaktif', tone: 'from-yellow-300/30 to-pink-400/20', image: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/71823ab6e_generated_image.png' },
];

export default function QuickAccessGrid() {
  const scrollRef = useRef(null);

  const scrollBy = (dir) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.7, behavior: 'smooth' });
  };

  return (
    <div className="relative">
      {/* Arrow glass kanan — mobile sahaja */}
      <button
        type="button"
        onClick={() => scrollBy(1)}
        aria-label="Scroll kanan"
        className="sm:hidden flex absolute right-1 top-1/2 -translate-y-1/2 z-20 h-10 w-10 items-center justify-center rounded-full bg-white/10 backdrop-blur-xl ring-1 ring-white/20 shadow-lg text-white hover:bg-white/20 transition-colors animate-pulse"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      <motion.div
        ref={scrollRef}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="flex gap-3 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-2 pr-6 sm:grid sm:grid-cols-3 sm:overflow-visible sm:pr-0 md:gap-4"
      >
        {actions.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.to} to={item.to} className="block snap-start shrink-0 w-[68%] sm:w-auto sm:shrink" aria-label={`Buka ${item.title}`}>
            <motion.div whileHover={{ scale: 1.03, y: -3 }} whileTap={{ scale: 0.97 }} className="group relative h-full min-h-[180px] overflow-hidden rounded-[1.75rem] border border-white/10 ring-1 ring-white/5 bg-slate-900 p-5 shadow-2xl shadow-black/40 transform-gpu [clip-path:inset(0_round_1.75rem)] md:p-6 transition-all hover:ring-white/30">
              {item.image && (
                <img src={item.image} alt={item.title} className="absolute inset-0 w-full h-full object-cover z-0 opacity-90 group-hover:scale-110 group-hover:opacity-100 transition-all duration-500" onError={(e) => e.target.style.display = 'none'} />
              )}
              {/* Cinematic dark gradient — bottom-heavy */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/55 to-slate-950/10 z-[1]" />
              <div className={`absolute -right-10 -top-10 h-28 w-28 rounded-full bg-gradient-to-br ${item.tone} blur-3xl opacity-70 transition-all group-hover:opacity-100 z-[1]`} />
              {item.featured && (
                <div className="absolute right-3 top-3 z-10 inline-flex items-center gap-1 rounded-full bg-white/10 border border-white/15 backdrop-blur px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.15em] text-white">
                  ✨ Top
                </div>
              )}
              <div className="relative z-10 flex h-full flex-col justify-end">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 border border-white/15 backdrop-blur text-3xl">{item.emoji}</div>
                <p className="font-black text-white text-base leading-tight drop-shadow-lg">{item.title}</p>
                <p className="mt-1 text-xs font-bold text-white/70">{item.subtitle}</p>
                <div className="mt-3 inline-flex items-center gap-1.5 self-start rounded-full bg-white px-3.5 py-1.5 text-[11px] font-black text-slate-900 shadow-lg group-hover:shadow-[0_0_24px_rgba(255,255,255,0.35)] transition-all">
                  Buka <ArrowRight className="h-3 w-3" />
                </div>
              </div>
            </motion.div>
          </Link>
        );
        })}
      </motion.div>
    </div>
  );
}