import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play, ArrowLeft, Trophy, Volume2, Sparkles, Lock, Loader2 } from 'lucide-react';
import AppHeader from '@/components/AppHeader';
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

  const gamesToShow = dbGames.length > 0 ? dbGames : category.games;

  return (
    <div className="min-h-screen font-nunito bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 relative overflow-hidden">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
        <div className="absolute top-1/3 -left-20 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
      </div>

      <AppHeader showBack={true} backTo="/games-hub" />

      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 pb-32 pt-28 md:pt-32">
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className={`mb-5 rounded-3xl p-5 bg-gradient-to-br ${category.color} shadow-2xl`}>
          <Link to="/games-hub" className="inline-flex items-center gap-2 text-white/85 text-xs font-black mb-4">
            <ArrowLeft className="w-4 h-4" /> Kembali ke kategori
          </Link>
          <div className="flex items-center gap-4">
            <div className="text-5xl">{category.emoji}</div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-white">{category.title}</h1>
              <p className="text-white/80 text-sm font-bold">{loadingGames ? 'Syncing games...' : `${gamesToShow.length} mini games`} · {category.objective}</p>
            </div>
          </div>
        </motion.div>

        <div className="space-y-3">
          {loadingGames && <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-white" /></div>}
          {!loadingGames && gamesToShow.map((game, idx) => {
            const globalIdx = categoryOffset + idx;
            const locked = isGameIndexLocked({ index: globalIdx, tier: userTier, isAuthenticated });
            const CardWrapper = locked ? 'div' : Link;
            const playId = game.id;
            const data = game.gameData || game;
            const wrapperProps = locked ? {} : { to: `/mini-games/${category.id}/play/${playId}` };
            return (
            <motion.div key={game.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.06 }}>
              <CardWrapper {...wrapperProps} className={`block rounded-3xl p-4 bg-white/12 border border-white/20 transition-all shadow-xl ${locked ? 'opacity-60' : 'hover:bg-white/18'}`}>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-3xl bg-white/20 flex items-center justify-center text-4xl flex-shrink-0">{game.emoji}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h2 className="text-white font-black text-base">{game.title}</h2>
                      <span className="px-2 py-0.5 rounded-full bg-white/20 text-white/85 text-[10px] font-black">{game.difficulty || data.difficulty || 'Mudah'}</span>
                    </div>
                    <p className="text-white/75 text-xs font-bold">{modeLabels[data.mode || data.playStyle] || data.mode || data.playStyle || game.type} · {data.objective || game.description || category.objective}</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className="inline-flex items-center gap-1 text-[10px] text-white/75 font-black"><Trophy className="w-3 h-3" /> {data.reward || `${game.totalQuestions || data.itemsPerSet || 4} round`}</span>
                      <span className="inline-flex items-center gap-1 text-[10px] text-white/75 font-black"><Volume2 className="w-3 h-3" /> sound</span>
                      <span className="inline-flex items-center gap-1 text-[10px] text-white/75 font-black"><Sparkles className="w-3 h-3" /> animasi</span>
                    </div>
                  </div>
                  <div className="w-11 h-11 rounded-2xl bg-white text-purple-700 flex items-center justify-center shadow-lg flex-shrink-0">
                    {locked ? <Lock className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current" />}
                  </div>
                </div>
              </CardWrapper>
              {locked && <p className="mt-2 text-center text-xs font-black text-yellow-200">Naik taraf untuk akses mini game ini</p>}
            </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}