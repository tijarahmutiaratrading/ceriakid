import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import AppHeader from '@/components/AppHeader';
import ArcadeCategoryCard from '@/components/game/ArcadeCategoryCard';
import { useAgeGroup } from '@/lib/AgeGroupContext';
import { MINI_GAME_CATEGORIES } from '@/lib/miniGameBlueprints';
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
    const loadCounts = async () => {
      setLoadingCounts(true);
      const results = await Promise.all(
        MINI_GAME_CATEGORIES.map(category => base44.entities.Game.filter({ category: category.id }))
      );
      const nextCounts = {};
      results.forEach((games, index) => {
        nextCounts[MINI_GAME_CATEGORIES[index].id] = games.filter(game =>
          game.isPublished !== false &&
          (game.gameData?.miniGameBlueprint === true || game.gameData?.miniGameGenerated === true)
        ).length;
      });
      setCounts(nextCounts);
      setLoadingCounts(false);
    };

    loadCounts();
  }, []);

  const totalGames = MINI_GAME_CATEGORIES.reduce((sum, category) => sum + (counts[category.id] ?? category.games.length), 0);

  return (
    <div className="min-h-screen font-nunito bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 relative overflow-hidden">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
        <div className="absolute top-1/3 -left-20 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse" />
      </div>

      <AppHeader showBack={true} backTo="/dashboard" />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 pb-32 pt-28 md:pt-32">
        <motion.div initial={{ opacity: 0, y: -20, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} className="relative mb-6 overflow-hidden rounded-[2rem] border border-white/25 bg-slate-950/55 p-5 shadow-2xl shadow-black/30 backdrop-blur-2xl">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(34,211,238,0.35),transparent_26%),radial-gradient(circle_at_85%_10%,rgba(244,114,182,0.35),transparent_24%),radial-gradient(circle_at_50%_100%,rgba(250,204,21,0.22),transparent_30%)]" />
          <div className="relative">
            <Link to="/dashboard" className="inline-flex items-center gap-2 mb-4 px-4 py-2.5 rounded-full bg-white/90 text-game-purple font-black text-sm shadow-lg hover:bg-white transition-all">
              <ArrowLeft className="w-4 h-4" /> Kembali ke Dashboard
            </Link>
            <div className="flex items-center gap-4">
              <motion.div animate={{ y: [0, -8, 0], rotate: [0, 4, 0] }} transition={{ repeat: Infinity, duration: 4 }} className="flex h-20 w-20 items-center justify-center rounded-[1.75rem] bg-white/18 text-6xl shadow-xl ring-1 ring-white/25">🎮</motion.div>
              <div className="flex-1">
                <p className="text-[11px] font-black uppercase tracking-[0.24em] text-cyan-100/80">Arcade Games Portal</p>
                <h1 className="text-3xl sm:text-4xl font-black text-white leading-tight drop-shadow">Genius Mini Games</h1>
                <p className="text-white/72 text-sm font-semibold">
                  8 kategori · {loadingCounts ? 'syncing...' : `${totalGames} games`} · play cepat, animasi kaya, reward arcade
                </p>
              </div>
            </div>
            <div className="mt-5 grid grid-cols-3 gap-2">
              {['3D Cards', 'Combo', 'Fast Play'].map(item => <div key={item} className="rounded-2xl bg-white/12 px-3 py-2 text-center text-xs font-black text-white ring-1 ring-white/15">{item}</div>)}
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {MINI_GAME_CATEGORIES.map((category, idx) => (
            <ArcadeCategoryCard
              key={category.id}
              category={category}
              index={idx}
              count={counts[category.id] ?? category.games.length}
              loading={loadingCounts}
            />
          ))}
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="p-5 rounded-3xl text-center" style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.3)' }}>
          <p className="text-white font-black text-base mb-1">💡 Tips Ibu Bapa</p>
          <p className="text-white/70 text-sm">Senarai ini kini sync terus dengan mini games yang telah dijana di Games Generator.</p>
        </motion.div>
      </div>
    </div>
  );
}