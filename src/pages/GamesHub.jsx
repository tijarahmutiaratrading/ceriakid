import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, ChevronRight, Sparkles } from 'lucide-react';
import AppHeader from '@/components/AppHeader';
import { MINI_GAME_CATEGORIES } from '@/lib/miniGameBlueprints';
import { getCategoryIllustration } from '@/lib/miniCategoryIllustrations';

// Soft Apple-style accent tints per category — bg + ring + text accent
const categoryAccents = {
  memory_master:    { tint: 'bg-blue-50',    ring: 'ring-blue-100',    label: 'text-blue-600',    icon: 'from-blue-400/30 to-indigo-400/20' },
  logic_puzzles:    { tint: 'bg-purple-50',  ring: 'ring-purple-100',  label: 'text-purple-600',  icon: 'from-purple-400/30 to-violet-400/20' },
  speed_focus:      { tint: 'bg-rose-50',    ring: 'ring-rose-100',    label: 'text-rose-600',    icon: 'from-red-400/30 to-rose-400/20' },
  pattern_genius:   { tint: 'bg-amber-50',   ring: 'ring-amber-100',   label: 'text-amber-600',   icon: 'from-amber-400/30 to-orange-400/20' },
  maze_adventure:   { tint: 'bg-emerald-50', ring: 'ring-emerald-100', label: 'text-emerald-600', icon: 'from-green-400/30 to-emerald-400/20' },
  creative_builder: { tint: 'bg-sky-50',     ring: 'ring-sky-100',     label: 'text-sky-600',     icon: 'from-sky-400/30 to-cyan-400/20' },
  problem_solver:   { tint: 'bg-indigo-50',  ring: 'ring-indigo-100',  label: 'text-indigo-600',  icon: 'from-indigo-400/30 to-blue-400/20' },
  brain_training:   { tint: 'bg-pink-50',    ring: 'ring-pink-100',    label: 'text-pink-600',    icon: 'from-pink-400/30 to-fuchsia-400/20' },
};

const defaultAccent = { tint: 'bg-slate-50', ring: 'ring-slate-100', label: 'text-slate-600', icon: 'from-slate-300/30 to-slate-400/20' };

export default function GamesHub() {
  const counts = React.useMemo(() => {
    const map = {};
    MINI_GAME_CATEGORIES.forEach(cat => {
      map[cat.id] = (cat.games || []).length;
    });
    return map;
  }, []);

  const totalGames = MINI_GAME_CATEGORIES.reduce((sum, c) => sum + (counts[c.id] ?? 0), 0);
  const visibleCategories = MINI_GAME_CATEGORIES.filter(c => (counts[c.id] ?? 0) > 0);

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden font-nunito relative text-slate-900">
      {/* Soft white scrim background — Apple-clean */}
      <div aria-hidden="true" className="fixed inset-0 -z-10 pointer-events-none bg-gradient-to-b from-slate-50 via-white to-slate-50" />
      {/* Subtle ambient color orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none max-w-full">
        <div className="absolute -top-48 -right-40 md:-top-72 md:-right-72 w-[300px] h-[300px] md:w-[500px] md:h-[500px] bg-purple-200/30 rounded-full filter blur-3xl animate-float" />
        <div className="absolute top-1/3 -left-32 md:top-1/2 md:-left-48 w-[260px] h-[260px] md:w-[440px] md:h-[440px] bg-blue-200/25 rounded-full filter blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute -bottom-24 right-1/4 md:-bottom-32 md:right-1/3 w-[300px] h-[300px] md:w-[560px] md:h-[560px] bg-pink-200/20 rounded-full filter blur-3xl animate-float" style={{ animationDelay: '4s' }} />
      </div>

      <AppHeader showBack={true} backTo="/dashboard" />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-28 pt-20 md:pt-24">
        {/* Back link — Apple ghost button */}
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 mb-5 px-4 py-2 rounded-full bg-white/80 backdrop-blur-md text-slate-700 font-semibold text-sm ring-1 ring-black/5 hover:bg-white hover:scale-[1.02] transition-all shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" /> Kembali ke Dashboard
          </Link>
        </motion.div>

        {/* Apple-style hero — clean, minimal, with badge stats */}
        <motion.section
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5">
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-purple-600 mb-2">Genius Mini Games</p>
              <h1 className="text-4xl sm:text-5xl font-black leading-[1.05] tracking-tight text-slate-900">Mini Games Hub</h1>
              <p className="text-slate-600 text-base font-medium mt-2 max-w-lg">Latih minda dengan koleksi permainan otak — memori, logik, pantas dan kreatif.</p>
            </div>

            <div className="flex flex-wrap gap-2">
              {[
                { top: visibleCategories.length, bottom: 'Kategori' },
                { top: totalGames, bottom: 'Games' },
                { top: '3', bottom: 'Tahap' },
              ].map((badge, i) => (
                <div key={i} className="px-3.5 py-2 rounded-2xl bg-white/90 backdrop-blur-md ring-1 ring-black/5 text-center min-w-[78px]" style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
                  <p className="font-bold text-sm leading-tight text-slate-900">{badge.top}</p>
                  <p className="text-[10px] font-semibold uppercase tracking-wider mt-0.5 text-slate-400">{badge.bottom}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Empty state — Apple clean */}
        {visibleCategories.length === 0 && (
          <div className="rounded-[2rem] p-10 text-center bg-white/90 backdrop-blur-xl shadow-xl ring-1 ring-black/5">
            <p className="text-6xl mb-4">🎮</p>
            <h2 className="text-slate-900 font-black text-2xl mb-2">Belum ada mini games</h2>
            <p className="text-slate-500 text-sm font-medium">Sila jana mini games dari admin Games Generator.</p>
          </div>
        )}

        {/* Category grid — Apple-style cards */}
        {visibleCategories.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 mb-8">
            {visibleCategories.map((category, idx) => {
              const accent = categoryAccents[category.id] || defaultAccent;
              const count = counts[category.id] ?? 0;
              const illustration = getCategoryIllustration(category.id);

              return (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.04 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <Link to={`/mini-games/${category.id}`} className="group block h-full">
                    <div className="h-full rounded-[2rem] bg-white/95 backdrop-blur-xl ring-1 ring-black/5 p-3 shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all overflow-hidden">
                      {/* Illustration tile — soft tinted background */}
                      <div className={`relative h-40 rounded-[1.5rem] overflow-hidden ring-1 ring-black/5 ${accent.tint}`}>
                        {/* Soft gradient wash */}
                        <div className={`absolute inset-0 bg-gradient-to-br ${accent.icon}`} />
                        {illustration ? (
                          <img
                            src={illustration}
                            alt={category.title}
                            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center text-6xl">
                            {category.emoji}
                          </div>
                        )}
                        {/* Top-left tag */}
                        <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-md ring-1 ring-black/5 text-[10px] font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1">
                          <Sparkles className={`w-3 h-3 ${accent.label}`} />
                          <span>{count} pusingan</span>
                        </div>
                      </div>

                      {/* Card body */}
                      <div className="px-2 pt-4 pb-2">
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <h2 className="text-slate-900 font-black text-lg leading-tight">{category.title}</h2>
                          <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-slate-600 group-hover:translate-x-0.5 transition-all flex-shrink-0 mt-0.5" />
                        </div>
                        <p className="text-slate-500 text-xs font-medium leading-relaxed line-clamp-2">
                          {category.objective}
                        </p>
                      </div>

                      {/* CTA pill */}
                      <div className="mt-3 mx-1 py-3 rounded-2xl bg-slate-900 text-white text-center font-bold text-sm shadow-md group-hover:bg-slate-800 transition-all flex items-center justify-center gap-1.5">
                        Mula Main <ChevronRight className="w-4 h-4" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Tips card — Apple-style subtle */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-[1.5rem] p-5 bg-white/90 backdrop-blur-xl ring-1 ring-black/5 shadow-sm"
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 ring-1 ring-amber-100 flex items-center justify-center flex-shrink-0 text-xl">
              💡
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-amber-600 mb-1">Tips Ibu Bapa</p>
              <p className="text-slate-700 text-sm font-medium leading-relaxed">
                Mainkan bersama anak 10-15 minit sehari untuk membina daya ingatan, fokus dan kemahiran menyelesaikan masalah secara progresif.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}