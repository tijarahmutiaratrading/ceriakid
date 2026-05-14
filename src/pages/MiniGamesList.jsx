import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Loader2, Search } from 'lucide-react';
import AppHeader from '@/components/AppHeader';
import ArcadeGameCard from '@/components/game/ArcadeGameCard';
import { findMiniCategory, MINI_GAME_CATEGORIES } from '@/lib/miniGameBlueprints';
import { useAuth } from '@/lib/AuthContext';
import { base44 } from '@/api/base44Client';
import { getActiveTier, isGameIndexLocked } from '@/lib/tierAccess';

const modeLabels = {
  balloon_pop: 'Balloon Pop', tracing: 'Finger Tracing', dragdrop: 'Drag & Drop', falling_catch: 'Catch Falling Object', stacking: 'Object Stacking', sequence: 'Sequence Arrangement', wordbuilder: 'Build Word', swipe_select: 'Swipe Selection', spin_wheel: 'Spin Wheel', picture_hunt: 'Picture Hunt', typing_challenge: 'Typing Challenge', tilematch: 'Tile Match', sorting: 'Sorting Game', mini_simulation: 'Mini Simulation', true_false: 'True / False', memory: 'Memory Card Flip', rhythm_tap: 'Rhythm Tapping', connect_dots: 'Connect The Dots', maze: 'Maze', hidden_object: 'Hidden Object', reaction_speed: 'Reaction Speed', story: 'Story Choice', coloring: 'Coloring Activity'
};

export default function MiniGamesList() {
  const { type } = useParams();
  const { user, isAuthenticated } = useAuth();
  const [userTier, setUserTier] = React.useState('free');
  const [dbGames, setDbGames] = React.useState([]);
  const [loadingGames, setLoadingGames] = React.useState(true);
  const [search, setSearch] = React.useState('');
  const category = findMiniCategory(type);
  const categoryOffset = Math.max(0, MINI_GAME_CATEGORIES.findIndex(item => item.id === category.id)) * 3;

  React.useEffect(() => {
    if (!user?.email) return;
    base44.entities.UserSubscription.filter({ email: user.email }).then(subs => {
      setUserTier(getActiveTier(subs?.[0]));
    });
  }, [user?.email]);

  React.useEffect(() => {
    setLoadingGames(true);
    base44.entities.Game.filter({ category: category.id }).then(games => {
      setDbGames((games || []).filter(game =>
        game.isPublished !== false &&
        (game.gameData?.miniGameBlueprint === true || game.gameData?.miniGameGenerated === true)
      ).sort((a, b) => (a.order || 0) - (b.order || 0)));
      setLoadingGames(false);
    });
  }, [category.id]);

  const gamesToShow = (dbGames.length > 0 ? dbGames : category.games).filter(game => {
    const data = game.gameData || game;
    const text = `${game.title || ''} ${data.mode || ''} ${data.objective || game.description || ''}`.toLowerCase();
    return text.includes(search.toLowerCase());
  });

  return (
    <div className="min-h-screen font-nunito bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 relative overflow-hidden">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
        <div className="absolute top-1/3 -left-20 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
      </div>

      <AppHeader showBack={true} backTo="/games-hub" />

      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 pb-32 pt-28 md:pt-32">
        <motion.div initial={{ opacity: 0, y: -16, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} className="relative mb-5 overflow-hidden rounded-[2rem] border border-white/25 bg-slate-950/55 p-5 shadow-2xl shadow-black/30 backdrop-blur-2xl">
          <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-70`} />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(255,255,255,0.48),transparent_25%),radial-gradient(circle_at_80%_100%,rgba(0,0,0,0.36),transparent_35%)]" />
          <div className="relative">
            <Link to="/games-hub" className="inline-flex items-center gap-2 text-white/90 text-xs font-black mb-4">
              <ArrowLeft className="w-4 h-4" /> Kembali ke kategori
            </Link>
            <div className="flex items-center gap-4">
              <motion.div animate={{ y: [0, -7, 0], rotate: [0, 4, 0] }} transition={{ repeat: Infinity, duration: 4 }} className="flex h-20 w-20 items-center justify-center rounded-[1.75rem] bg-white/22 text-6xl shadow-xl ring-1 ring-white/25">{category.emoji}</motion.div>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-black uppercase tracking-[0.22em] text-white/70">Arcade Channel</p>
                <h1 className="text-2xl sm:text-4xl font-black text-white drop-shadow">{category.title}</h1>
                <p className="text-white/82 text-sm font-bold">{loadingGames ? 'Syncing games...' : `${gamesToShow.length} mini games`} · {category.objective}</p>
              </div>
            </div>
            <div className="relative mt-5">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/55" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Cari game arcade..."
                className="w-full rounded-2xl border border-white/20 bg-white/14 py-3 pl-11 pr-4 text-sm font-black text-white placeholder:text-white/55 shadow-inner outline-none"
              />
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {loadingGames && <div className="col-span-full flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-white" /></div>}
          {!loadingGames && gamesToShow.map((game, idx) => {
            const globalIdx = categoryOffset + idx;
            const locked = isGameIndexLocked({ index: globalIdx, tier: userTier, isAuthenticated });
            const playId = game.id;
            const data = game.gameData || game;
            return (
              <ArcadeGameCard
                key={game.id}
                game={game}
                data={data}
                category={category}
                locked={locked}
                to={`/mini-games/${category.id}/play/${playId}`}
                index={idx}
                modeLabel={modeLabels[data.mode || data.playStyle] || data.mode || data.playStyle || game.type}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}