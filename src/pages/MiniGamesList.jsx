import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play, ArrowLeft, Lock, Loader2 } from 'lucide-react';
import AppHeader from '@/components/AppHeader';
import { findMiniCategory, MINI_GAME_CATEGORIES } from '@/lib/miniGameBlueprints';
import { getCategoryIllustration } from '@/lib/miniCategoryIllustrations';
import { useAuth } from '@/lib/AuthContext';
import { base44 } from '@/api/base44Client';
import { getActiveTier, isGameIndexLocked } from '@/lib/tierAccess';

export default function MiniGamesList() {
  const { type } = useParams();
  const { user, isAuthenticated } = useAuth();
  const [userTier, setUserTier] = React.useState('free');
  const [loadingGames, setLoadingGames] = React.useState(true);
  const category = findMiniCategory(type);
  const categoryOffset = Math.max(0, MINI_GAME_CATEGORIES.findIndex(item => item.id === category.id)) * 10;

  React.useEffect(() => {
    if (!user?.email) return;
    base44.entities.UserSubscription.filter({ email: user.email }).then(subs => {
      setUserTier(getActiveTier(subs?.[0]));
    });
  }, [user?.email]);

  React.useEffect(() => {
    setLoadingGames(false);
  }, [category.id]);

  const gamesToShow = category.games;
  const illustration = getCategoryIllustration(category.id);

  return (
    <div className="min-h-screen w-full font-nunito">
      <AppHeader showBack={true} backTo="/games-hub" />

      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 pb-24 pt-4">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <Link
            to="/games-hub"
            className="inline-flex items-center gap-2 mb-4 px-3.5 py-2 rounded-full bg-white text-slate-700 font-bold text-xs sm:text-sm shadow-sm hover:shadow-md transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Kembali ke kategori
          </Link>

          <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-md flex items-center gap-3 sm:gap-4 border border-slate-100">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-game-purple to-game-pink flex items-center justify-center overflow-hidden flex-shrink-0">
              {illustration ? (
                <img src={illustration} alt={category.title} className="w-full h-full object-cover" />
              ) : (
                <span className="text-4xl">{category.emoji}</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">{category.title}</h1>
              <p className="text-slate-500 text-xs sm:text-sm font-bold mt-0.5">
                {loadingGames ? 'Syncing...' : `${gamesToShow.length} pusingan`} · 3 tahap kesukaran
              </p>
              <p className="text-slate-600 text-xs sm:text-sm font-medium mt-1 line-clamp-2">
                {category.objective}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Games grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {loadingGames && (
            <div className="col-span-full flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-game-purple" />
            </div>
          )}

          {!loadingGames && gamesToShow.map((game, idx) => {
            const globalIdx = categoryOffset + idx;
            const locked = isGameIndexLocked({ index: globalIdx, tier: userTier, isAuthenticated });
            const CardWrapper = locked ? 'div' : Link;
            const wrapperProps = locked ? {} : { to: `/mini-games/${category.id}/play/${game.id}` };

            return (
              <motion.div
                key={game.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
                whileHover={!locked ? { y: -3 } : {}}
                whileTap={!locked ? { scale: 0.98 } : {}}
              >
                <CardWrapper {...wrapperProps} className={`block ${locked ? 'cursor-not-allowed' : ''}`}>
                  <div className={`bg-white rounded-2xl shadow-md hover:shadow-lg transition-all overflow-hidden border border-slate-100 ${locked ? 'opacity-70' : ''}`}>
                    <div className="flex items-center gap-3 p-3 sm:p-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-game-purple/15 to-game-pink/15 flex items-center justify-center flex-shrink-0 relative">
                        <span className="text-2xl">{game.emoji || category.emoji}</span>
                        <div className="absolute -top-1.5 -left-1.5 w-5 h-5 rounded-full bg-amber-400 flex items-center justify-center shadow-sm">
                          <span className="text-amber-900 font-black text-[10px]">{idx + 1}</span>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-slate-900 font-black text-sm sm:text-base leading-tight line-clamp-1">{game.title}</p>
                        <p className="text-slate-500 text-xs font-medium mt-0.5 line-clamp-1">
                          {game.objective || 'Cabaran menarik menanti!'}
                        </p>
                      </div>
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${locked ? 'bg-slate-200' : 'bg-game-purple text-white'}`}>
                        {locked ? (
                          <Lock className="w-4 h-4 text-slate-500" />
                        ) : (
                          <Play className="w-4 h-4 fill-white ml-0.5" />
                        )}
                      </div>
                    </div>
                    {locked && (
                      <div className="px-3 pb-3">
                        <p className="text-center text-[10px] font-black text-white bg-game-purple rounded-full px-2 py-1">
                          🔒 Naik taraf untuk akses
                        </p>
                      </div>
                    )}
                  </div>
                </CardWrapper>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}