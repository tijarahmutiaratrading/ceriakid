import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, Lightbulb, ChevronRight } from 'lucide-react';
import AppHeader from '@/components/AppHeader';
import { MINI_GAME_CATEGORIES } from '@/lib/miniGameBlueprints';
import { getCategoryIllustration } from '@/lib/miniCategoryIllustrations';

const categoryGradients = {
  memory_master:    'from-blue-500 to-indigo-600',
  logic_puzzles:    'from-purple-500 to-violet-600',
  speed_focus:      'from-red-500 to-rose-600',
  pattern_genius:   'from-amber-500 to-orange-600',
  maze_adventure:   'from-green-500 to-emerald-600',
  creative_builder: 'from-sky-500 to-cyan-600',
  problem_solver:   'from-indigo-500 to-blue-600',
  brain_training:   'from-pink-500 to-fuchsia-600',
};

const HERO_BG = 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/3f4216218_generated_image.png';

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
    <div className="min-h-screen w-full font-nunito">
      <AppHeader showBack={true} backTo="/dashboard" />

      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 pb-24 pt-20 md:pt-24">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 mb-4 px-3.5 py-2 rounded-full bg-white text-slate-700 font-bold text-xs sm:text-sm shadow-sm hover:shadow-md transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Dashboard
          </Link>

          <div className="bg-gradient-to-br from-game-purple to-game-pink rounded-3xl p-5 sm:p-6 text-white shadow-xl">
            <h1 className="text-2xl sm:text-3xl font-black leading-tight">🎮 Mini Games Hub</h1>
            <p className="text-white/90 font-bold text-sm sm:text-base mt-1">Genius Games — latih minda dengan cara yang seronok!</p>
            <div className="mt-4 flex gap-3">
              <div className="flex-1 bg-white/20 rounded-2xl p-3 backdrop-blur-sm">
                <p className="text-white/70 text-xs font-bold">Kategori</p>
                <p className="text-2xl font-black">{visibleCategories.length}</p>
              </div>
              <div className="flex-1 bg-white/20 rounded-2xl p-3 backdrop-blur-sm">
                <p className="text-white/70 text-xs font-bold">Jumlah Games</p>
                <p className="text-2xl font-black">{totalGames}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Category grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6">
          {visibleCategories.length === 0 && (
            <div className="col-span-full p-6 rounded-2xl bg-white text-center shadow-sm">
              <p className="text-slate-800 font-black text-base">Tiada mini games lagi.</p>
              <p className="text-slate-500 text-sm font-bold mt-1">Sila jana mini games dari admin Games Generator.</p>
            </div>
          )}

          {visibleCategories.map((category, idx) => {
            const gradient = categoryGradients[category.id] || 'from-game-purple to-game-pink';
            const count = counts[category.id] ?? 0;
            const illustration = getCategoryIllustration(category.id);

            return (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link to={`/mini-games/${category.id}`} className="block">
                  <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all overflow-hidden border border-slate-100">
                    <div className={`bg-gradient-to-br ${gradient} p-4 flex items-center gap-3`}>
                      <div className="w-14 h-14 rounded-2xl bg-white/25 backdrop-blur-sm flex items-center justify-center overflow-hidden flex-shrink-0">
                        {illustration ? (
                          <img src={illustration} alt={category.title} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-3xl">{category.emoji}</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-black text-base sm:text-lg leading-tight">{category.title}</p>
                        <p className="text-white/85 text-xs font-bold mt-0.5">{count} pusingan · 3 tahap</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-white/80 flex-shrink-0" />
                    </div>
                    <div className="p-3 sm:p-4">
                      <p className="text-slate-600 text-xs sm:text-sm font-medium leading-snug line-clamp-2">
                        {category.objective}
                      </p>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* Tips footer */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-4 sm:p-5 rounded-2xl bg-amber-50 border-2 border-amber-200"
        >
          <div className="flex items-center gap-2 mb-1.5">
            <Lightbulb className="w-5 h-5 text-amber-500" fill="#FCD34D" />
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