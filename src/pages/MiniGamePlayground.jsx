import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Lock, Loader2, Sparkles } from 'lucide-react';
import AppHeader from '@/components/AppHeader';
import MiniGameMascot from '@/components/game/MiniGameMascot';
import MiniGameModeRenderer from '@/components/game/MiniGameModeRenderer';
import CinematicBackdrop from '@/components/game/CinematicBackdrop';
import { findMiniGame, findMiniCategory, MINI_GAME_CATEGORIES } from '@/lib/miniGameBlueprints';
import { useAuth } from '@/lib/AuthContext';
import { useSelectedChild } from '@/lib/SelectedChildContext';
import { base44 } from '@/api/base44Client';
import { getActiveTier, isGameIndexLocked } from '@/lib/tierAccess';
import { saveMiniGameProgress } from '@/lib/miniGameProgress';

const guideByMode = {
  memory: 'Buka 2 kad. Jika pasangan sama maksud, markah akan naik.',
  dragdrop: 'Pilih satu item, kemudian pilih kotak jawapan yang sepadan.',
  wordbuilder: 'Tekan suku kata/huruf mengikut susunan untuk bina perkataan sasaran.',
  sorting: 'Pilih item, kemudian masukkan ke kumpulan yang betul.',
  tilematch: 'Cari dan tekan 2 jubin yang menjadi pasangan.',
  story: 'Baca situasi dan pilih tindakan terbaik.',
  true_false: 'Baca ayat, kemudian pilih Betul atau Salah.',
  tracing: 'Tekan titik satu demi satu untuk latihan surih.',
  balloon_pop: 'Pop belon yang sama dengan sasaran sahaja.',
  falling_catch: 'Tangkap item yang sama dengan sasaran sahaja.',
  stacking: 'Tekan Tambah Blok sampai jumlah cukup.',
  sequence: 'Tekan pilihan mengikut turutan yang betul.',
  swipe_select: 'Baca perkataan, kemudian pilih kategori yang betul.',
  spin_wheel: 'Putar roda dan baca pilihan yang keluar.',
  picture_hunt: 'Cari gambar/emoji yang sepadan dengan perkataan sasaran.',
  hidden_object: 'Cari objek/emoji yang sepadan dengan sasaran.',
  typing_challenge: 'Taip perkataan sasaran dengan tepat.',
  mini_simulation: 'Pilih objek yang termasuk dalam kumpulan sasaran.',
  rhythm_tap: 'Tekan butang Tap Rentak untuk ikut bacaan satu demi satu.',
  connect_dots: 'Tekan simbol atau huruf mengikut turutan yang ditunjukkan.',
  maze: 'Gerakkan watak sampai ke bintang.',
  reaction_speed: 'Tekan Mula, tunggu arahan TAP, kemudian tekan dengan cepat.',
  coloring: 'Tekan ikon untuk mewarnakan semua gambar.',
};

export default function MiniGamePlayground() {
  const { categoryId, gameId } = useParams();
  const { user, isAuthenticated } = useAuth();
  const { selectedChild } = useSelectedChild() || {};
  const [userTier, setUserTier] = React.useState('free');
  const [tierLoaded, setTierLoaded] = React.useState(false);
  const [loadingGame, setLoadingGame] = React.useState(false);
  const { category, game: blueprintGame } = findMiniGame(categoryId, gameId);
  const game = blueprintGame;
  const gameData = game || {};
  const categoryOffset = Math.max(0, MINI_GAME_CATEGORIES.findIndex(item => item.id === category.id)) * 10;
  const blueprintIndex = Math.max(0, category.games.findIndex(item => item.id === gameId));
  const gameIndex = categoryOffset + blueprintIndex;
  const locked = tierLoaded && isGameIndexLocked({ index: gameIndex, tier: userTier, isAuthenticated });

  React.useEffect(() => {
    if (!user?.email) {
      // Guest user — tetap kira "loaded" supaya boleh check locked status
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
    difficulty: game.difficulty || gameData.difficulty,
    gameData: { ...game, mode: game.mode },
  };

  return (
    <div className="min-h-screen w-full overflow-x-hidden relative font-nunito bg-slate-950">
      {/* Latar sinematik gaya PS5 */}
      <CinematicBackdrop accent="#ec4899" accent2="#06b6d4" />

      {/* Floating sparkle decorations */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-32 left-6 text-2xl text-white/30 animate-float">✨</div>
        <div className="absolute top-44 right-10 text-xl text-yellow-300/40 animate-float" style={{ animationDelay: '1.2s' }}>⭐</div>
        <div className="absolute top-1/2 left-4 text-2xl text-pink-300/40 animate-float" style={{ animationDelay: '2.4s' }}>💫</div>
        <div className="absolute bottom-40 right-6 text-2xl text-cyan-300/35 animate-float" style={{ animationDelay: '3.1s' }}>✨</div>
        <div className="absolute bottom-24 left-10 text-xl text-yellow-300/40 animate-float" style={{ animationDelay: '4s' }}>⭐</div>
        <div className="absolute top-1/3 right-1/4 text-lg text-white/25 animate-float" style={{ animationDelay: '1.7s' }}>✨</div>
      </div>

      {/* Glow orbs */}
      <div className="fixed top-0 left-1/4 w-96 h-96 rounded-full opacity-30 pointer-events-none blur-3xl" style={{ background: 'radial-gradient(circle, #ec4899 0%, transparent 70%)' }} />
      <div className="fixed bottom-0 right-1/4 w-96 h-96 rounded-full opacity-25 pointer-events-none blur-3xl" style={{ background: 'radial-gradient(circle, #06b6d4 0%, transparent 70%)' }} />

      {/* Mini Game mascot — Panda, Kucing, Arnab */}
      <div className="hidden md:block fixed bottom-2 left-4 lg:left-8 z-0">
        <MiniGameMascot size={300} />
      </div>
      <div className="md:hidden fixed bottom-2 -right-2 z-0 opacity-90">
        <MiniGameMascot size={150} />
      </div>

      <AppHeader showBack={true} backTo={`/mini-games/${category.id}`} theme="dark" />

      <div className="relative max-w-lg mx-auto px-4 sm:px-6 pb-16 pt-20 md:pt-24">
        {/* Back button — glass on gradient */}
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
          <Link
            to={`/mini-games/${category.id}`}
            className="inline-flex items-center gap-2 mb-5 px-4 py-2.5 rounded-full font-black text-sm text-white transition-all hover:scale-[1.02]"
            style={{
              background: 'rgba(255,255,255,0.15)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255,255,255,0.25)',
              boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
            }}
          >
            <ArrowLeft className="w-4 h-4" /> {category.title}
          </Link>
        </motion.div>

        {/* Game header — glass card */}
        {!loadingGame && !locked && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-5 rounded-3xl p-4"
            style={{
              background: 'rgba(255,255,255,0.12)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.2)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
            }}
          >
            <div className="flex items-center gap-3">
              {/* Icon tile — vibrant glass */}
              <div
                className="flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center text-3xl"
                style={{
                  background: 'linear-gradient(135deg, rgba(236,72,153,0.35) 0%, rgba(168,85,247,0.35) 100%)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.25)',
                }}
              >
                {game.emoji || category.emoji}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-yellow-200 mb-0.5 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  {category.title}
                </p>
                <h1 className="text-base sm:text-lg font-black text-white leading-tight tracking-tight line-clamp-1">
                  {game.title}
                </h1>
              </div>
            </div>

            <p className="text-xs font-medium text-white/75 leading-relaxed mt-3 pl-1">
              {guideByMode[game.mode] || 'Mini Game'}
            </p>
          </motion.div>
        )}

        {loadingGame || !tierLoaded ? (
          <div className="flex justify-center py-10">
            <Loader2 className="w-7 h-7 animate-spin text-white/80" />
          </div>
        ) : locked ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-[2rem] p-8 text-center"
            style={{
              background: 'rgba(255,255,255,0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.3)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
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
            <p className="text-2xl font-black text-slate-900 mb-2 tracking-tight">Mini Game Terkunci</p>
            <p className="text-slate-500 font-medium text-sm mb-6">Naik taraf pakej untuk akses mini game ini.</p>
            <Link
              to="/"
              className="inline-flex rounded-full px-6 py-3 font-bold text-sm text-white transition-all hover:scale-[1.02] active:scale-95"
              style={{
                background: 'linear-gradient(135deg, #0F172A 0%, #334155 100%)',
                boxShadow: '0 8px 20px rgba(15,23,42,0.25)',
              }}
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