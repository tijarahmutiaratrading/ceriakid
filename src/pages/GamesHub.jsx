import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, Loader2, Play, Lightbulb } from 'lucide-react';
import AppHeader from '@/components/AppHeader';
import { useAgeGroup } from '@/lib/AgeGroupContext';
import { MINI_GAME_CATEGORIES } from '@/lib/miniGameBlueprints';
import { getCategoryIllustration } from '@/lib/miniCategoryIllustrations';

const HERO_BG = 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/37dda3450_generated_image.png';
const MASCOT = 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/a960d864d_generated_image.png';

// Vibrant medallion colors per category — bright saturated, cartoon style
const medallionColors = {
  memory_master:    { ring: '#FFB800', inner: '#1E3A8A', glow: 'rgba(255,184,0,0.45)' },   // gold + deep blue
  logic_puzzles:    { ring: '#FFB800', inner: '#7C3AED', glow: 'rgba(124,58,237,0.45)' },  // gold + purple
  speed_focus:      { ring: '#FFB800', inner: '#EF4444', glow: 'rgba(239,68,68,0.45)' },   // gold + red
  pattern_genius:   { ring: '#FFB800', inner: '#F59E0B', glow: 'rgba(245,158,11,0.45)' },  // gold + amber
  maze_adventure:   { ring: '#FFB800', inner: '#16A34A', glow: 'rgba(22,163,74,0.45)' },   // gold + green
  creative_builder: { ring: '#FFB800', inner: '#0EA5E9', glow: 'rgba(14,165,233,0.45)' },  // gold + sky
  problem_solver:   { ring: '#FFB800', inner: '#6366F1', glow: 'rgba(99,102,241,0.45)' },  // gold + indigo
  brain_training:   { ring: '#FFB800', inner: '#DB2777', glow: 'rgba(219,39,119,0.45)' },  // gold + pink
};
const defaultMedallion = { ring: '#FFB800', inner: '#7C3AED', glow: 'rgba(124,58,237,0.45)' };

// Confetti pieces — fixed positions, animated
const CONFETTI = [
  { left: '5%', top: '15%', color: '#FF6B9D', rot: 25 },
  { left: '12%', top: '45%', color: '#FFD93D', rot: -15 },
  { left: '88%', top: '20%', color: '#6BCB77', rot: 40 },
  { left: '92%', top: '55%', color: '#4D96FF', rot: -25 },
  { left: '8%', top: '75%', color: '#FF9F45', rot: 15 },
  { left: '85%', top: '85%', color: '#FF6B9D', rot: -30 },
  { left: '50%', top: '5%', color: '#FFD93D', rot: 10 },
  { left: '20%', top: '92%', color: '#6BCB77', rot: -20 },
];

const STARS = [
  { left: '15%', top: '25%' },
  { left: '80%', top: '30%' },
  { left: '10%', top: '60%' },
  { left: '88%', top: '70%' },
  { left: '45%', top: '88%' },
];

export default function GamesHub() {
  const { ageGroup } = useAgeGroup() || { ageGroup: 'prasekolah' };

  const counts = React.useMemo(() => {
    const map = {};
    MINI_GAME_CATEGORIES.forEach(cat => {
      map[cat.id] = (cat.games || []).length;
    });
    return map;
  }, []);
  const loadingCounts = false;

  const totalGames = MINI_GAME_CATEGORIES.reduce((sum, category) => sum + (counts[category.id] ?? 0), 0);
  const visibleCategories = MINI_GAME_CATEGORIES.filter(category => (counts[category.id] ?? 0) > 0);

  return (
    <div
      className="min-h-screen w-full font-nunito rounded-2xl relative overflow-hidden"
      style={{
        background: `url(${HERO_BG})`,
        backgroundSize: 'cover',
        backgroundAttachment: 'fixed',
        backgroundPosition: 'center top',
      }}
    >
      <AppHeader showBack={true} backTo="/dashboard" />

      {/* Floating confetti & stars - ornamental */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {CONFETTI.map((c, i) => (
          <motion.div
            key={`c-${i}`}
            className="absolute w-3 h-4 rounded-sm"
            style={{ left: c.left, top: c.top, background: c.color, transform: `rotate(${c.rot}deg)` }}
            animate={{ y: [0, -12, 0], rotate: [c.rot, c.rot + 20, c.rot] }}
            transition={{ repeat: Infinity, duration: 3 + i * 0.3, ease: 'easeInOut' }}
          />
        ))}
        {STARS.map((s, i) => (
          <motion.div
            key={`s-${i}`}
            className="absolute text-yellow-400 text-2xl"
            style={{ left: s.left, top: s.top, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }}
            animate={{ scale: [1, 1.2, 1], rotate: [0, 15, 0] }}
            transition={{ repeat: Infinity, duration: 2.5 + i * 0.4, ease: 'easeInOut' }}
          >
            ⭐
          </motion.div>
        ))}
      </div>

      <div className="relative max-w-2xl mx-auto px-4 sm:px-6 pb-24 pt-20 md:pt-24">
        {/* HERO HEADER — Adventure landscape */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative mb-6 px-4 pt-4 pb-6 sm:pt-6 sm:pb-8"
        >
          {/* Title */}
          <div className="text-center mb-3">
            <h1
              className="text-3xl sm:text-4xl font-black text-slate-900 leading-tight"
              style={{ textShadow: '0 2px 4px rgba(255,255,255,0.6), 0 4px 12px rgba(0,0,0,0.1)' }}
            >
              🎮 Mini Games Hub
            </h1>
            <p
              className="text-slate-800 font-black text-xl sm:text-2xl leading-tight mt-0.5"
              style={{ textShadow: '0 2px 4px rgba(255,255,255,0.6)' }}
            >
              Genius Games
            </p>
          </div>

          {/* Back button + Stats + Mascot row */}
          <div className="flex items-center justify-between gap-3 mb-4">
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-white/95 text-slate-700 font-bold text-xs sm:text-sm shadow-md hover:bg-white transition-all"
              style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.12)' }}
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Dashboard
            </Link>

            {/* Stat star badges */}
            <div className="flex items-center gap-2">
              <div
                className="relative flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16"
                style={{
                  background: 'radial-gradient(circle, #FFD93D 0%, #FFB800 100%)',
                  clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
                  filter: 'drop-shadow(0 4px 8px rgba(255,184,0,0.5))',
                }}
              >
                <div className="text-center">
                  <div className="text-sm sm:text-base font-black text-amber-900 leading-none">8</div>
                  <div className="text-[8px] sm:text-[9px] font-black text-amber-900 leading-none">kategori</div>
                </div>
              </div>
              <div
                className="relative flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16"
                style={{
                  background: 'radial-gradient(circle, #FFD93D 0%, #FFB800 100%)',
                  clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
                  filter: 'drop-shadow(0 4px 8px rgba(255,184,0,0.5))',
                }}
              >
                <div className="text-center">
                  <div className="text-sm sm:text-base font-black text-amber-900 leading-none">{loadingCounts ? '...' : totalGames}</div>
                  <div className="text-[8px] sm:text-[9px] font-black text-amber-900 leading-none">games</div>
                </div>
              </div>
            </div>
          </div>

          {/* Mascot centered */}
          <motion.div
            className="flex justify-center mb-3"
            animate={{ y: [0, -8, 0] }}
            transition={{ repeat: Infinity, duration: 2.8, ease: 'easeInOut' }}
          >
            <img
              src={MASCOT}
              alt="Explorer"
              className="w-32 sm:w-40 h-auto object-contain"
              style={{
                filter: 'drop-shadow(0 8px 20px rgba(0,0,0,0.25))',
                mixBlendMode: 'multiply',
              }}
            />
          </motion.div>

          {/* Banner scroll tagline */}
          <div
            className="relative mx-auto max-w-md px-5 py-2.5 text-center"
            style={{
              background: 'linear-gradient(180deg, #F5E6B8 0%, #E8D49A 100%)',
              borderRadius: '8px',
              border: '2px solid #C4A464',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.6)',
              clipPath: 'polygon(0 0, 100% 0, 96% 50%, 100% 100%, 0 100%, 4% 50%)',
            }}
          >
            <p className="text-amber-900 text-xs sm:text-sm font-bold leading-snug">
              Fun first: balloon pop, maze, tracing, spin wheel, catching game, coloring, rhythm tap dan banyak lagi.
            </p>
          </div>
        </motion.div>

        {/* CATEGORY MEDALLION GRID */}
        <div className="grid grid-cols-2 gap-4 sm:gap-5 mb-6">
          {!loadingCounts && visibleCategories.length === 0 && (
            <div className="col-span-full p-6 rounded-3xl bg-white text-center shadow-sm">
              <p className="text-slate-800 font-black text-base">Tiada mini games lagi.</p>
              <p className="text-slate-500 text-sm font-bold mt-1">Sila jana mini games dari admin Games Generator.</p>
            </div>
          )}

          {visibleCategories.map((category, idx) => {
            const colors = medallionColors[category.id] || defaultMedallion;
            const count = counts[category.id] ?? 0;
            return (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, scale: 0.85, y: 16 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: idx * 0.06, type: 'spring', stiffness: 200 }}
                whileHover={{ y: -6, scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
              >
                <Link to={`/mini-games/${category.id}`} className="block">
                  <div className="relative">
                    {/* Medallion shape — shield-like rounded */}
                    <div
                      className="relative mx-auto"
                      style={{
                        width: '100%',
                        aspectRatio: '1 / 1.1',
                        background: `linear-gradient(180deg, ${colors.ring} 0%, #E89A00 100%)`,
                        borderRadius: '50% 50% 45% 45% / 55% 55% 45% 45%',
                        padding: '8px',
                        boxShadow: `0 8px 24px ${colors.glow}, 0 4px 8px rgba(0,0,0,0.2), inset 0 2px 4px rgba(255,255,255,0.4), inset 0 -3px 6px rgba(0,0,0,0.15)`,
                      }}
                    >
                      {/* Inner colored disc with illustration */}
                      <div
                        className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden"
                        style={{
                          background: `radial-gradient(circle at 30% 30%, ${colors.inner} 0%, ${colors.inner}DD 60%, ${colors.inner}99 100%)`,
                          borderRadius: '50% 50% 45% 45% / 55% 55% 45% 45%',
                          boxShadow: 'inset 0 4px 12px rgba(0,0,0,0.3), inset 0 -2px 6px rgba(255,255,255,0.15)',
                        }}
                      >
                        {/* Sparkle decorations inside */}
                        <span className="absolute top-2 right-3 text-yellow-200 text-xs opacity-80">✨</span>
                        <span className="absolute bottom-3 left-3 text-yellow-200 text-xs opacity-80">⭐</span>

                        {/* Illustration */}
                        {getCategoryIllustration(category.id) ? (
                          <img
                            src={getCategoryIllustration(category.id)}
                            alt={category.title}
                            className="w-3/5 h-3/5 object-contain"
                            style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.4))' }}
                          />
                        ) : (
                          <div className="text-5xl" style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.4))' }}>
                            {category.emoji}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Ribbon banner with title */}
                    <div
                      className="absolute left-1/2 -translate-x-1/2 px-3 py-1.5 min-w-[80%]"
                      style={{
                        bottom: '15%',
                        background: 'linear-gradient(180deg, #C92121 0%, #8B0F0F 100%)',
                        clipPath: 'polygon(0 0, 100% 0, 95% 50%, 100% 100%, 0 100%, 5% 50%)',
                        boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
                      }}
                    >
                      <p className="text-center text-white font-black text-xs sm:text-sm leading-tight whitespace-nowrap overflow-hidden text-ellipsis px-1"
                         style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>
                        {category.title}
                      </p>
                    </div>

                    {/* Play button — bottom center */}
                    <div className="absolute left-1/2 -translate-x-1/2 -bottom-2 w-9 h-9 rounded-full bg-white flex items-center justify-center"
                         style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.25), inset 0 -2px 0 rgba(0,0,0,0.1)' }}>
                      {loadingCounts ? (
                        <Loader2 className="w-4 h-4 animate-spin text-slate-600" />
                      ) : (
                        <Play className="w-4 h-4 text-slate-800 fill-slate-800 ml-0.5" />
                      )}
                    </div>
                  </div>

                  {/* Tagline below — on white pill for readability */}
                  <div className="mt-4 mx-auto max-w-[90%] bg-white/95 rounded-xl px-3 py-2 shadow-md backdrop-blur-sm">
                    <p className="text-center text-[11px] sm:text-xs font-bold text-slate-800 leading-snug line-clamp-2">
                      {category.objective}
                    </p>
                    <p className="text-center text-[10px] font-black text-amber-700 mt-0.5">
                      {count} pusingan · 3 tahap
                    </p>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* TIPS FOOTER */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="p-4 sm:p-5 rounded-2xl bg-white/95 border-2 border-amber-200"
          style={{ boxShadow: '0 6px 20px rgba(0,0,0,0.12)', backdropFilter: 'blur(6px)' }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb className="w-5 h-5 text-yellow-500" fill="#FCD34D" />
            <p className="text-slate-800 font-black text-base">Tips Ibu Bapa</p>
          </div>
          <p className="text-slate-600 text-sm font-medium leading-snug">
            Senarai ini kini sync terus dengan mini games yang telah dijana di Games Generator.
          </p>
        </motion.div>
      </div>
    </div>
  );
}