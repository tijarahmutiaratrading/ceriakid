import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import AppHeader from '@/components/AppHeader';
import { useAgeGroup } from '@/lib/AgeGroupContext';
import { MINI_GAME_CATEGORIES } from '@/lib/miniGameBlueprints';
import { getCategoryIllustration } from '@/lib/miniCategoryIllustrations';
import { base44 } from '@/api/base44Client';

const levelColors = {
  Mudah: 'bg-green-400/85 text-white',
  Sederhana: 'bg-yellow-400/85 text-white',
  Sukar: 'bg-red-400/85 text-white',
};

export default function GamesHub() {
  const { ageGroup } = useAgeGroup() || { ageGroup: 'prasekolah' };
  const [counts, setCounts] = React.useState({});
  const [loadingCounts, setLoadingCounts] = React.useState(true);

  React.useEffect(() => {
    let cancelled = false;
    const loadCounts = async () => {
      setLoadingCounts(true);
      try {
        const results = await Promise.all(
          MINI_GAME_CATEGORIES.map(category =>
            base44.entities.Game.filter({ category: category.id }).catch(() => [])
          )
        );
        if (cancelled) return;
        const nextCounts = {};
        results.forEach((games, index) => {
          nextCounts[MINI_GAME_CATEGORIES[index].id] = (games || []).filter(game =>
            game.isPublished !== false &&
            (game.gameData?.miniGameBlueprint === true || game.gameData?.miniGameGenerated === true)
          ).length;
        });
        setCounts(nextCounts);
      } finally {
        if (!cancelled) setLoadingCounts(false);
      }
    };

    loadCounts();
    return () => { cancelled = true; };
  }, []);

  const totalGames = MINI_GAME_CATEGORIES.reduce((sum, category) => sum + (counts[category.id] ?? 0), 0);

  return (
    <div className="min-h-screen font-nunito relative overflow-hidden" style={{ background: 'linear-gradient(180deg, #B5D8B0 0%, #A8CFA3 50%, #9FCFA5 100%)' }}>
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <svg className="absolute -top-20 -right-20 w-[28rem] h-[28rem] opacity-50" viewBox="0 0 400 400" fill="none">
          <path d="M200 50 Q 320 80, 350 200 T 200 350 Q 80 320, 50 200 T 200 50 Z" fill="#C8E0BF" />
        </svg>
        <svg className="absolute top-1/3 -left-32 w-96 h-96 opacity-40" viewBox="0 0 400 400" fill="none">
          <path d="M200 60 Q 310 90, 340 210 T 190 340 Q 70 310, 60 190 T 200 60 Z" fill="#BBDDB3" />
        </svg>
        <svg className="absolute bottom-10 right-10 w-40 h-40 opacity-60" viewBox="0 0 100 100">
          <path d="M50 10 Q 70 30, 60 55 Q 50 80, 40 55 Q 30 30, 50 10 Z" fill="#7BAB6E" />
          <path d="M30 40 Q 45 50, 40 70 Q 35 85, 25 70 Q 20 55, 30 40 Z" fill="#8FBC82" />
        </svg>
        <svg className="absolute top-32 left-8 w-28 h-28 opacity-50" viewBox="0 0 100 100">
          <path d="M50 15 Q 68 35, 58 60 Q 48 80, 42 60 Q 32 35, 50 15 Z" fill="#7BAB6E" />
        </svg>
      </div>

      <AppHeader showBack={true} backTo="/dashboard" />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-8 lg:px-12 pb-32 pt-20 md:pt-24">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6 p-5 rounded-3xl" style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.4)' }}>
          <Link to="/dashboard" className="inline-flex items-center gap-2 mb-4 px-4 py-2.5 rounded-full bg-white/80 text-game-purple font-black text-sm shadow-lg hover:bg-white transition-all">
            <ArrowLeft className="w-4 h-4" /> Kembali ke Dashboard
          </Link>
          <div className="flex items-center gap-3">
            <div className="text-5xl">🎮</div>
            <div className="flex-1">
              <h1 className="text-3xl font-black text-white leading-tight">Mini Games Hub</h1>
              <p className="text-white/90 text-sm font-bold">
                Genius Games · 8 kategori · {loadingCounts ? 'syncing...' : `${totalGames} games`}
              </p>
            </div>
          </div>
          <div className="mt-4 rounded-2xl bg-white/15 border border-white/20 p-3">
            <p className="text-white text-sm font-black">Fun first: balloon pop, maze, tracing, spin wheel, catching game, coloring, rhythm tap dan banyak lagi.</p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          {MINI_GAME_CATEGORIES.map((category, idx) => (
            <motion.div key={category.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }} whileHover={{ scale: 1.03, y: -4 }} whileTap={{ scale: 0.97 }}>
              <Link to={`/mini-games/${category.id}`} className="block h-full">
                <div className={`bg-gradient-to-br ${category.color} rounded-3xl p-4 h-full shadow-lg`}>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    {getCategoryIllustration(category.id) ? (
                      <img
                        src={getCategoryIllustration(category.id)}
                        alt={category.title}
                        className="w-16 h-16 object-contain rounded-xl"
                        style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))' }}
                      />
                    ) : (
                      <div className="text-4xl">{category.emoji}</div>
                    )}
                    <span className="text-xs px-2 py-1 rounded-full font-black bg-white text-purple-900 shadow-md">
                      {loadingCounts ? <Loader2 className="w-3 h-3 animate-spin" /> : `${counts[category.id] ?? 0} games`}
                    </span>
                  </div>
                  <h3 className="text-white font-black text-lg leading-tight mb-1">{category.title}</h3>
                  <p className="text-white text-xs font-bold leading-snug mb-3 drop-shadow">{category.objective}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {category.games.map(game => <span key={game.id} className={`${levelColors[game.difficulty]} text-[10px] px-2 py-0.5 rounded-full font-black`}>{game.mode.replace('_', ' ')}</span>)}
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="p-5 rounded-3xl text-center" style={{ background: 'rgba(15,23,42,0.55)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.35)' }}>
          <p className="text-white font-black text-base mb-1">💡 Tips Ibu Bapa</p>
          <p className="text-white/90 text-sm font-bold">Senarai ini kini sync terus dengan mini games yang telah dijana di Games Generator.</p>
        </motion.div>
      </div>
    </div>
  );
}