import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Lock, Loader2, Sparkles, Clock } from 'lucide-react';
import AppHeader from '@/components/AppHeader';
import CikguMascot from '@/components/game/CikguMascot';
import MiniGameModeRenderer from '@/components/game/MiniGameModeRenderer';
import { findTigaMGame, findTigaMCategory } from '@/lib/tigaMBlueprints';
import { useAuth } from '@/lib/AuthContext';
import { useSelectedChild } from '@/lib/SelectedChildContext';
import { base44 } from '@/api/base44Client';
import { getActiveTier, isGameIndexLocked } from '@/lib/tierAccess';
import { saveMiniGameProgress } from '@/lib/miniGameProgress';

export default function TigaMPlayground() {
  const { categoryId, gameId } = useParams();
  const { user, isAuthenticated } = useAuth();
  const { selectedChild } = useSelectedChild() || {};
  const [userTier, setUserTier] = React.useState('free');
  const [tierLoaded, setTierLoaded] = React.useState(false);
  const { category, game } = findTigaMGame(categoryId, gameId);
  // Setiap kategori 3M = satu bucket sendiri (ikut Games Subjek), tanpa offset.
  const gameIndex = Math.max(0, category.games.findIndex(g => g.id === gameId));
  const locked = tierLoaded && isGameIndexLocked({ index: gameIndex, tier: userTier, isAuthenticated });

  React.useEffect(() => {
    if (!user?.email) {
      if (isAuthenticated === false) setTierLoaded(true);
      return;
    }
    base44.entities.UserSubscription.filter({ email: user.email }).then(subs => {
      setUserTier(getActiveTier(subs?.[0]));
      setTierLoaded(true);
    }).catch(() => setTierLoaded(true));
  }, [user?.email, isAuthenticated]);

  const normalizedGame = {
    title: game.title,
    emoji: game.emoji || category.emoji,
    type: game.mode,
    category: category.id,
    difficulty: game.difficulty,
    gameData: { ...game, mode: game.mode },
  };

  return (
    <div className="min-h-screen w-full overflow-x-hidden relative font-nunito bg-slate-950">
      {/* Latar sinematik PS5 — gelap dengan glow halus */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute -top-40 -right-32 w-[300px] h-[300px] md:w-[500px] md:h-[500px] bg-violet-600/20 rounded-full filter blur-3xl" />
        <div className="absolute top-1/3 -left-28 w-[250px] h-[250px] md:w-[440px] md:h-[440px] bg-cyan-500/12 rounded-full filter blur-3xl" />
        <div className="absolute -bottom-24 right-1/4 w-[280px] h-[280px] md:w-[440px] md:h-[440px] bg-fuchsia-500/12 rounded-full filter blur-3xl" />
      </div>

      {/* Family mascot — Ibu, Kakak, Adik */}
      <div className="hidden lg:block fixed bottom-2 left-8 z-0">
        <CikguMascot size={300} />
      </div>
      <div className="hidden sm:block lg:hidden fixed bottom-2 left-4 z-0 opacity-90">
        <CikguMascot size={220} />
      </div>
      <div className="sm:hidden fixed bottom-2 left-2 z-0 opacity-90">
        <CikguMascot size={150} />
      </div>

      <AppHeader showBack={true} backTo={`/3m/${category.id}`} />

      <div className="relative max-w-lg mx-auto px-4 md:px-6 pb-12 md:pb-40 pt-24 md:pt-32">
        {/* Back link */}
        <div className="flex items-center justify-between gap-2 mb-4">
          <Link
            to={`/3m/${category.id}`}
            className="inline-flex items-center gap-1.5 text-sm font-bold text-white/70 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> {category.title}
          </Link>
        </div>

        {/* Game header — light glass card */}
        {!locked && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-5 rounded-3xl p-4 bg-white/8 backdrop-blur-xl ring-1 ring-white/15 shadow-[0_8px_30px_rgba(0,0,0,0.4),0_0_50px_-10px_rgba(139,92,246,0.4),inset_0_1px_0_rgba(255,255,255,0.08)]"
          >
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center text-3xl bg-gradient-to-br from-violet-500/30 to-pink-500/30 ring-1 ring-white/20">
                {game.emoji || category.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-violet-300 mb-0.5 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  {category.title}
                </p>
                <h1 className="text-base sm:text-lg font-black text-white leading-tight tracking-tight line-clamp-1">
                  {game.title}
                </h1>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-white/50 flex-shrink-0">
                <Clock className="w-3.5 h-3.5" />
                10
              </div>
            </div>
            <p className="text-xs font-medium text-white/60 leading-relaxed mt-3 pl-1">
              {game.objective || 'Mini Game'}
            </p>
          </motion.div>
        )}

        {!tierLoaded ? (
          <div className="flex justify-center py-10">
            <Loader2 className="w-7 h-7 animate-spin text-purple-500" />
          </div>
        ) : locked ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-[2rem] p-8 text-center"
            style={{
              background: 'rgba(255,255,255,0.06)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.15)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
            }}
          >
            <div
              className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-3xl"
              style={{
                background: 'linear-gradient(135deg, #A855F7 0%, #EC4899 100%)',
                boxShadow: '0 12px 28px rgba(168,85,247,0.35)',
              }}
            >
              <Lock className="h-9 w-9 text-white" />
            </div>
            <p className="text-2xl font-black text-white mb-2 tracking-tight">Game Terkunci</p>
            <p className="text-white/60 font-medium text-sm mb-6">Naik taraf pakej untuk akses game ini.</p>
            <Link
              to="/"
              className="inline-flex rounded-full px-6 py-3 font-bold text-sm text-slate-900 bg-white transition-all hover:scale-[1.02] active:scale-95"
            >
              Lihat Pakej
            </Link>
          </motion.div>
        ) : (
          <MiniGameModeRenderer
            game={normalizedGame}
            onComplete={({ score, total }) => {
              saveMiniGameProgress({
                user,
                childName: selectedChild?.name || user?.full_name || 'Anak',
                categoryId: category.id,
                gameId,
                gameTitle: game.title,
                score,
                total,
              });
            }}
          />
        )}
      </div>
    </div>
  );
}