import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, Loader2, Play, Lightbulb } from 'lucide-react';
import AppHeader from '@/components/AppHeader';
import { useAgeGroup } from '@/lib/AgeGroupContext';
import { MINI_GAME_CATEGORIES } from '@/lib/miniGameBlueprints';
import { getCategoryIllustration } from '@/lib/miniCategoryIllustrations';

// Pastel gradient palette per category — soft, breathable
const cardPalettes = {
  memory_master:    { bg: 'linear-gradient(135deg, #FFE5F1 0%, #F5D7FF 100%)', icon: 'linear-gradient(135deg, #FFC1DE 0%, #F0AEFF 100%)' },
  logic_puzzles:    { bg: 'linear-gradient(135deg, #FFF1D6 0%, #FFD9D9 100%)', icon: 'linear-gradient(135deg, #FFE0A8 0%, #FFB8B8 100%)' },
  speed_focus:      { bg: 'linear-gradient(135deg, #FFE0CC 0%, #FFF1A8 100%)', icon: 'linear-gradient(135deg, #FFCAB0 0%, #FFE585 100%)' },
  pattern_genius:   { bg: 'linear-gradient(135deg, #D6F5E5 0%, #C8EEDD 100%)', icon: 'linear-gradient(135deg, #B8E8D2 0%, #9FDDC2 100%)' },
  maze_adventure:   { bg: 'linear-gradient(135deg, #E5DEFF 0%, #D9E5FF 100%)', icon: 'linear-gradient(135deg, #C9BEFF 0%, #B5C9FF 100%)' },
  creative_builder: { bg: 'linear-gradient(135deg, #D6F0FF 0%, #FFE0F0 100%)', icon: 'linear-gradient(135deg, #B0DDFF 0%, #FFC1DE 100%)' },
  problem_solver:   { bg: 'linear-gradient(135deg, #D9F0E8 0%, #E5E0FF 100%)', icon: 'linear-gradient(135deg, #B8E5D2 0%, #C9BEFF 100%)' },
  brain_training:   { bg: 'linear-gradient(135deg, #FFE0F0 0%, #E5DEFF 100%)', icon: 'linear-gradient(135deg, #FFC1DE 0%, #C9BEFF 100%)' },
};

const defaultPalette = { bg: 'linear-gradient(135deg, #F5E5FF 0%, #E5D4FF 100%)', icon: 'linear-gradient(135deg, #E0C8FF 0%, #CAB0FF 100%)' };

export default function GamesHub() {
  const { ageGroup } = useAgeGroup() || { ageGroup: 'prasekolah' };

  // Counts come directly from hand-crafted blueprints (lib/miniGames/*.js).
  // Each category has games.length entries — no DB fetch needed.
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
    <div className="min-h-screen w-full font-nunito rounded-2xl" style={{ background: '#FAF7FF' }}>
      <AppHeader showBack={true} backTo="/dashboard" />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 pb-24 pt-20 md:pt-24">
        {/* HERO HEADER — soft pastel gradient */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative mb-5 p-5 sm:p-6 rounded-[1.75rem] overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #FFD9EC 0%, #E0D4FF 45%, #C8E0FF 100%)',
            boxShadow: '0 10px 30px rgba(168,85,247,0.12)',
          }}
        >
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 mb-4 px-3.5 py-2 rounded-full bg-white/85 text-slate-700 font-bold text-xs sm:text-sm shadow-sm hover:bg-white transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Kembali ke Dashboard
          </Link>

          <div className="relative flex items-start gap-3">
            {/* Mascot */}
            <div className="hidden xs:block flex-shrink-0">
              <img
                src="https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/c0ad02d9e_ChatGPTImageMay12026at12_29_37PM.png"
                alt="CeriaKid"
                className="w-16 h-16 sm:w-20 sm:h-20 object-contain"
                style={{ filter: 'drop-shadow(0 4px 12px rgba(168,85,247,0.25))' }}
              />
            </div>

            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-800 leading-tight">
                🎮 Mini Games Hub
              </h1>
              <p className="text-slate-700 font-black text-lg sm:text-xl leading-tight">
                Genius Games
              </p>

              {/* Stat pill */}
              <div className="inline-flex items-center gap-2 mt-3 px-4 py-1.5 rounded-full bg-white/80 shadow-sm">
                <span className="text-slate-700 font-bold text-xs sm:text-sm">8 kategori</span>
                <span className="text-slate-400">│</span>
                <span className="text-slate-700 font-bold text-xs sm:text-sm">
                  {loadingCounts ? 'syncing...' : `${totalGames} games`}
                </span>
              </div>

              <p className="text-slate-600 text-xs sm:text-sm font-medium mt-3 leading-snug">
                Fun first: balloon pop, maze, tracing, spin wheel, catching game, coloring, rhythm tap dan banyak lagi.
              </p>
            </div>
          </div>
        </motion.div>

        {/* CATEGORY GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
          {!loadingCounts && visibleCategories.length === 0 && (
            <div className="col-span-full p-6 rounded-3xl bg-white text-center shadow-sm">
              <p className="text-slate-800 font-black text-base">Tiada mini games lagi.</p>
              <p className="text-slate-500 text-sm font-bold mt-1">Sila jana mini games dari admin Games Generator.</p>
            </div>
          )}

          {visibleCategories.map((category, idx) => {
            const palette = cardPalettes[category.id] || defaultPalette;
            const count = counts[category.id] ?? 0;
            return (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
                whileHover={{ y: -3 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link to={`/mini-games/${category.id}`} className="block h-full">
                  <div
                    className="relative rounded-[1.5rem] p-4 h-full overflow-hidden"
                    style={{
                      background: palette.bg,
                      boxShadow: '0 6px 20px rgba(168,85,247,0.08)',
                    }}
                  >
                    {/* Badge top-right */}
                    <span className="absolute top-3 right-3 text-[11px] px-2.5 py-1 rounded-full font-black bg-white text-slate-700 shadow-sm">
                      {loadingCounts ? <Loader2 className="w-3 h-3 animate-spin inline" /> : `${count} games`}
                    </span>

                    {/* Top row: illustration + title/objective */}
                    <div className="flex items-start gap-3 mb-4 pr-16">
                      <div
                        className="flex-shrink-0 w-16 h-16 sm:w-[72px] sm:h-[72px] rounded-2xl flex items-center justify-center overflow-hidden"
                        style={{ background: palette.icon }}
                      >
                        {getCategoryIllustration(category.id) ? (
                          <img
                            src={getCategoryIllustration(category.id)}
                            alt={category.title}
                            className="w-full h-full object-contain p-1"
                          />
                        ) : (
                          <div className="text-4xl">{category.emoji}</div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0 pt-0.5">
                        <h3 className="text-slate-800 font-black text-base sm:text-lg leading-tight mb-1">
                          {category.title}
                        </h3>
                        <p className="text-slate-600 text-xs sm:text-[13px] font-medium leading-snug line-clamp-2">
                          {category.objective}
                        </p>
                      </div>
                    </div>

                    {/* Summary row bottom */}
                    <div className="flex items-center justify-between pt-3 border-t border-white/60">
                      <span className="text-slate-600 text-xs sm:text-sm font-bold">
                        10 pusingan · 3 tahap kesukaran
                      </span>
                      <div className="flex-shrink-0 w-7 h-7 rounded-full bg-white/80 flex items-center justify-center shadow-sm">
                        <Play className="w-3.5 h-3.5 text-slate-700 fill-slate-700 ml-0.5" />
                      </div>
                    </div>
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
          transition={{ delay: 0.3 }}
          className="p-4 sm:p-5 rounded-2xl bg-white border-2 border-purple-100"
          style={{ boxShadow: '0 4px 16px rgba(168,85,247,0.06)' }}
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