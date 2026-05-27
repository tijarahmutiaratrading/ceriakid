import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, ChevronRight, Sparkles, Star, Zap } from 'lucide-react';
import AppHeader from '@/components/AppHeader';
import MiniGameMascot from '@/components/game/MiniGameMascot';
import { MINI_GAME_CATEGORIES } from '@/lib/miniGameBlueprints';
import { getCategoryIllustration } from '@/lib/miniCategoryIllustrations';

// Playful vibrant gradients per category — kuat, ceria, anak-anak suka
const categoryThemes = {
  memory_master:    { gradient: 'from-blue-400 via-indigo-500 to-purple-600',   glow: 'rgba(99,102,241,0.5)',  emoji: '🧠', tag: 'Memori', accent: '#A5B4FC' },
  logic_puzzles:    { gradient: 'from-purple-500 via-fuchsia-500 to-pink-500',  glow: 'rgba(168,85,247,0.5)',  emoji: '🧩', tag: 'Logik', accent: '#D8B4FE' },
  speed_focus:      { gradient: 'from-rose-500 via-red-500 to-orange-500',      glow: 'rgba(244,63,94,0.5)',   emoji: '⚡', tag: 'Pantas', accent: '#FCA5A5' },
  pattern_genius:   { gradient: 'from-amber-400 via-orange-500 to-red-500',     glow: 'rgba(251,146,60,0.5)',  emoji: '🎨', tag: 'Corak', accent: '#FCD34D' },
  maze_adventure:   { gradient: 'from-emerald-400 via-green-500 to-teal-600',   glow: 'rgba(16,185,129,0.5)',  emoji: '🗺️', tag: 'Jelajah', accent: '#6EE7B7' },
  creative_builder: { gradient: 'from-sky-400 via-cyan-500 to-blue-500',        glow: 'rgba(14,165,233,0.5)',  emoji: '🎭', tag: 'Kreatif', accent: '#7DD3FC' },
  problem_solver:   { gradient: 'from-indigo-500 via-blue-600 to-cyan-500',     glow: 'rgba(79,70,229,0.5)',   emoji: '💡', tag: 'Selesai', accent: '#A5B4FC' },
  brain_training:   { gradient: 'from-pink-500 via-rose-500 to-fuchsia-600',    glow: 'rgba(236,72,153,0.5)',  emoji: '🎯', tag: 'Latih', accent: '#F9A8D4' },
};

const defaultTheme = { gradient: 'from-slate-400 to-slate-600', glow: 'rgba(100,116,139,0.5)', emoji: '🎮', tag: 'Main', accent: '#CBD5E1' };

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
    <div
      className="min-h-screen w-full max-w-full overflow-x-hidden font-nunito relative"
      style={{
        background: 'linear-gradient(135deg, #312e81 0%, #581c87 45%, #be185d 100%)',
      }}
    >
      {/* Floating sparkles & stars */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-28 left-6 text-2xl text-white/30 animate-float">✨</div>
        <div className="absolute top-40 right-10 text-xl text-yellow-300/50 animate-float" style={{ animationDelay: '1.2s' }}>⭐</div>
        <div className="absolute top-1/3 left-1/4 text-lg text-pink-300/40 animate-float" style={{ animationDelay: '2s' }}>💫</div>
        <div className="absolute top-1/2 right-8 text-2xl text-cyan-300/40 animate-float" style={{ animationDelay: '2.6s' }}>✨</div>
        <div className="absolute bottom-40 left-10 text-xl text-yellow-300/50 animate-float" style={{ animationDelay: '3.5s' }}>⭐</div>
        <div className="absolute bottom-1/3 right-1/4 text-lg text-white/30 animate-float" style={{ animationDelay: '4.2s' }}>✨</div>
        <div className="absolute top-2/3 left-12 text-xl text-pink-300/40 animate-float" style={{ animationDelay: '5s' }}>💫</div>
      </div>

      {/* Glow orbs */}
      <div className="fixed top-0 left-1/4 w-96 h-96 rounded-full opacity-40 pointer-events-none blur-3xl" style={{ background: 'radial-gradient(circle, #ec4899 0%, transparent 70%)' }} />
      <div className="fixed bottom-0 right-1/4 w-96 h-96 rounded-full opacity-30 pointer-events-none blur-3xl" style={{ background: 'radial-gradient(circle, #06b6d4 0%, transparent 70%)' }} />
      <div className="fixed top-1/2 right-0 w-72 h-72 rounded-full opacity-25 pointer-events-none blur-3xl" style={{ background: 'radial-gradient(circle, #fbbf24 0%, transparent 70%)' }} />

      {/* Mascot trio */}
      <div className="hidden md:block fixed bottom-2 left-4 lg:left-8 z-0 opacity-90">
        <MiniGameMascot size={260} />
      </div>
      <div className="md:hidden fixed -bottom-2 -right-3 z-0 opacity-80">
        <MiniGameMascot size={140} />
      </div>

      <AppHeader showBack={true} backTo="/dashboard" />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-32 pt-20 md:pt-24">
        {/* Back button — glass on gradient */}
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 mb-5 px-4 py-2.5 rounded-full font-black text-sm text-white transition-all hover:scale-[1.02]"
            style={{
              background: 'rgba(255,255,255,0.15)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255,255,255,0.25)',
              boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
            }}
          >
            <ArrowLeft className="w-4 h-4" /> Kembali
          </Link>
        </motion.div>

        {/* Playful hero — vibrant glass card */}
        <motion.section
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 rounded-[2rem] p-5 sm:p-6 relative overflow-hidden"
          style={{
            background: 'rgba(255,255,255,0.12)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.25)',
            boxShadow: '0 12px 40px rgba(0,0,0,0.2)',
          }}
        >
          {/* Decorative bouncing emojis in hero */}
          <motion.div
            animate={{ y: [0, -8, 0], rotate: [0, 5, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="absolute top-3 right-4 text-4xl"
          >
            🎮
          </motion.div>
          <motion.div
            animate={{ y: [0, -6, 0], rotate: [0, -5, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
            className="absolute top-12 right-16 text-2xl opacity-70"
          >
            🌟
          </motion.div>

          <div className="relative">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-300/25 ring-1 ring-yellow-200/40 mb-3">
              <Sparkles className="w-3 h-3 text-yellow-200" />
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-yellow-100">Genius Mini Games</p>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black leading-[1.05] tracking-tight text-white mb-2">
              Jom Main & Belajar! 🚀
            </h1>
            <p className="text-white/85 text-sm sm:text-base font-bold max-w-lg leading-snug">
              Latih otak dengan permainan seronok — memori, logik, pantas dan banyak lagi!
            </p>

            {/* Playful stats badges */}
            <div className="flex flex-wrap gap-2 mt-4">
              {[
                { top: visibleCategories.length, bottom: 'Kategori', emoji: '📚', bg: 'from-pink-400 to-rose-500' },
                { top: totalGames, bottom: 'Games', emoji: '🎮', bg: 'from-cyan-400 to-blue-500' },
                { top: '3', bottom: 'Tahap', emoji: '⭐', bg: 'from-yellow-400 to-orange-500' },
              ].map((badge, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0, rotate: -10 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.2 + i * 0.1, type: 'spring', damping: 10 }}
                  className={`px-3 py-2 rounded-2xl bg-gradient-to-br ${badge.bg} text-white shadow-lg flex items-center gap-2`}
                  style={{ boxShadow: '0 6px 16px rgba(0,0,0,0.2)' }}
                >
                  <span className="text-lg">{badge.emoji}</span>
                  <div className="leading-tight">
                    <p className="font-black text-base">{badge.top}</p>
                    <p className="text-[9px] font-bold uppercase tracking-wider opacity-90">{badge.bottom}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Empty state */}
        {visibleCategories.length === 0 && (
          <div
            className="rounded-[2rem] p-10 text-center"
            style={{
              background: 'rgba(255,255,255,0.95)',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            }}
          >
            <motion.p
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-7xl mb-4"
            >
              🎮
            </motion.p>
            <h2 className="text-slate-900 font-black text-2xl mb-2">Belum ada mini games</h2>
            <p className="text-slate-500 text-sm font-bold">Sila tunggu kandungan baru!</p>
          </div>
        )}

        {/* Vibrant playful category grid */}
        {visibleCategories.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 mb-6">
            {visibleCategories.map((category, idx) => {
              const theme = categoryThemes[category.id] || defaultTheme;
              const count = counts[category.id] ?? 0;
              const illustration = getCategoryIllustration(category.id);

              return (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: idx * 0.06, type: 'spring', damping: 18 }}
                  whileHover={{ y: -6, scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <Link to={`/mini-games/${category.id}`} className="group block h-full">
                    <div
                      className="h-full rounded-[2rem] p-3 transition-all overflow-hidden relative"
                      style={{
                        background: 'rgba(255,255,255,0.95)',
                        backdropFilter: 'blur(20px)',
                        boxShadow: `0 12px 30px ${theme.glow}, 0 4px 12px rgba(0,0,0,0.1)`,
                        border: '1px solid rgba(255,255,255,0.4)',
                      }}
                    >
                      {/* Floating sparkle on card */}
                      <motion.div
                        animate={{ y: [0, -4, 0], opacity: [0.6, 1, 0.6] }}
                        transition={{ duration: 2, repeat: Infinity, delay: idx * 0.2 }}
                        className="absolute top-4 right-4 text-lg z-20 pointer-events-none"
                      >
                        ✨
                      </motion.div>

                      {/* Vibrant illustration tile */}
                      <div className={`relative h-44 rounded-[1.5rem] overflow-hidden bg-gradient-to-br ${theme.gradient}`}>
                        {/* Pattern overlay */}
                        <div className="absolute inset-0 opacity-20" style={{
                          backgroundImage: 'radial-gradient(circle at 20% 30%, white 0%, transparent 40%), radial-gradient(circle at 80% 70%, white 0%, transparent 40%)',
                        }} />

                        {illustration ? (
                          <img
                            src={illustration}
                            alt={category.title}
                            className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        ) : (
                          <motion.div
                            animate={{ scale: [1, 1.05, 1], rotate: [0, 3, -3, 0] }}
                            transition={{ duration: 4, repeat: Infinity }}
                            className="absolute inset-0 flex items-center justify-center text-7xl"
                            style={{ filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.25))' }}
                          >
                            {theme.emoji}
                          </motion.div>
                        )}

                        {/* Count badge — playful pill */}
                        <div
                          className="absolute top-3 left-3 px-3 py-1.5 rounded-full text-[11px] font-black text-white flex items-center gap-1.5"
                          style={{
                            background: 'rgba(0,0,0,0.4)',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(255,255,255,0.3)',
                          }}
                        >
                          <Zap className="w-3 h-3 text-yellow-300 fill-yellow-300" />
                          <span>{count} games</span>
                        </div>

                        {/* Tag at bottom */}
                        <div className="absolute bottom-3 left-3">
                          <div
                            className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider"
                            style={{
                              background: 'rgba(255,255,255,0.95)',
                              color: '#1e293b',
                            }}
                          >
                            {theme.tag}
                          </div>
                        </div>
                      </div>

                      {/* Card body */}
                      <div className="px-2 pt-4 pb-2">
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <h2 className="text-slate-900 font-black text-lg leading-tight">{category.title}</h2>
                          <motion.div
                            animate={{ x: [0, 4, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                            className="flex-shrink-0 mt-1"
                          >
                            <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-slate-700" />
                          </motion.div>
                        </div>
                        <p className="text-slate-600 text-xs font-bold leading-relaxed line-clamp-2">
                          {category.objective}
                        </p>
                      </div>

                      {/* Vibrant CTA pill */}
                      <div
                        className={`mt-3 mx-1 py-3 rounded-2xl bg-gradient-to-r ${theme.gradient} text-white text-center font-black text-sm shadow-lg group-hover:shadow-xl transition-all flex items-center justify-center gap-1.5`}
                        style={{ boxShadow: `0 6px 16px ${theme.glow}` }}
                      >
                        🎯 Jom Main!
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Playful tips card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-[1.5rem] p-5 relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(251,191,36,0.95) 0%, rgba(249,115,22,0.95) 100%)',
            boxShadow: '0 12px 30px rgba(251,146,60,0.4)',
            border: '1px solid rgba(255,255,255,0.3)',
          }}
        >
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="absolute -top-2 -right-2 text-7xl opacity-30"
          >
            💡
          </motion.div>
          <div className="flex items-start gap-3 relative">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 text-2xl"
              style={{
                background: 'rgba(255,255,255,0.35)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.5)',
              }}
            >
              💡
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/90 mb-1">Tips Ibu Bapa</p>
              <p className="text-white text-sm font-black leading-snug">
                Main 10-15 minit sehari untuk asah daya ingatan, fokus, dan kemahiran selesai masalah!
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}