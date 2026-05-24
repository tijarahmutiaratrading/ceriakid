import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Lock, Loader2 } from 'lucide-react';
import AppHeader from '@/components/AppHeader';
import MiniGameModeRenderer from '@/components/game/MiniGameModeRenderer';
import { findMiniGame, findMiniCategory, MINI_GAME_CATEGORIES } from '@/lib/miniGameBlueprints';
import { useAuth } from '@/lib/AuthContext';
import { useSelectedChild } from '@/lib/SelectedChildContext';
import { base44 } from '@/api/base44Client';
import { getActiveTier, isGameIndexLocked } from '@/lib/tierAccess';
import { saveMiniGameProgress } from '@/lib/miniGameProgress';

const glassCard = { background: 'rgba(255,255,255,0.78)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.8)', boxShadow: '0 18px 45px rgba(168,85,247,0.18)' };

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
  const [loadingGame, setLoadingGame] = React.useState(false);
  const { category, game: blueprintGame } = findMiniGame(categoryId, gameId);
  const game = blueprintGame;
  const gameData = game || {};
  const categoryOffset = Math.max(0, MINI_GAME_CATEGORIES.findIndex(item => item.id === category.id)) * 10;
  const blueprintIndex = Math.max(0, category.games.findIndex(item => item.id === gameId));
  const gameIndex = categoryOffset + blueprintIndex;
  const locked = isGameIndexLocked({ index: gameIndex, tier: userTier, isAuthenticated });

  React.useEffect(() => {
    if (!user?.email) return;
    base44.entities.UserSubscription.filter({ email: user.email }).then(subs => {
      setUserTier(getActiveTier(subs?.[0]));
    });
  }, [user?.email]);

  const normalizedGame = {
    title: game.title,
    emoji: game.emoji || category.emoji,
    type: game.mode,
    category: category.id,
    difficulty: game.difficulty || gameData.difficulty,
    gameData: { ...game, mode: game.mode },
  };

  return (
    <div
      className="min-h-screen w-full font-nunito relative overflow-hidden rounded-2xl"
      style={{
        background: 'url(https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/37dda3450_generated_image.png)',
        backgroundSize: 'cover',
        backgroundAttachment: 'fixed',
        backgroundPosition: 'center top',
      }}
    >
      {/* Animated cartoon adventure background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Floating confetti */}
        {[
          { left: '5%', top: '12%', color: '#FF6B9D', rot: 25 },
          { left: '90%', top: '18%', color: '#FFD93D', rot: -15 },
          { left: '8%', top: '40%', color: '#6BCB77', rot: 40 },
          { left: '92%', top: '50%', color: '#4D96FF', rot: -25 },
          { left: '6%', top: '72%', color: '#FF9F45', rot: 15 },
          { left: '88%', top: '80%', color: '#FF6B9D', rot: -30 },
        ].map((c, i) => (
          <motion.div
            key={`c-${i}`}
            className="absolute w-3 h-4 rounded-sm"
            style={{ left: c.left, top: c.top, background: c.color, transform: `rotate(${c.rot}deg)` }}
            animate={{ y: [0, -14, 0], rotate: [c.rot, c.rot + 25, c.rot] }}
            transition={{ repeat: Infinity, duration: 3 + i * 0.3, ease: 'easeInOut' }}
          />
        ))}

        {/* Floating stars */}
        {[
          { left: '15%', top: '25%' },
          { left: '82%', top: '35%' },
          { left: '12%', top: '60%' },
          { left: '85%', top: '65%' },
        ].map((s, i) => (
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
      <AppHeader showBack={true} backTo={`/mini-games/${category.id}`} />
      <div className="relative max-w-lg mx-auto px-4 pb-32 pt-20 md:pt-24">
        {/* Back button */}
        <Link
          to={`/mini-games/${category.id}`}
          className="inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-full font-bold text-sm text-slate-700 bg-white/95 shadow-md hover:bg-white hover:-translate-y-0.5 active:scale-95 transition-all"
          style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Kembali ke {category.title}
        </Link>

        {/* Game header card — cartoon adventure style */}
        {!loadingGame && !locked && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 rounded-3xl p-4 flex items-center gap-3"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,250,235,0.95) 100%)',
              border: '3px solid #FFB800',
              boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
            }}
          >
            {/* Mini medallion */}
            <div
              className="flex-shrink-0 w-14 h-14"
              style={{
                background: 'linear-gradient(180deg, #FFB800 0%, #E89A00 100%)',
                borderRadius: '50%',
                padding: '4px',
                boxShadow: '0 4px 12px rgba(255,184,0,0.4)',
              }}
            >
              <div
                className="w-full h-full flex items-center justify-center text-2xl"
                style={{
                  background: 'radial-gradient(circle, #7C3AED 0%, #5B21B6 100%)',
                  borderRadius: '50%',
                  boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.3)',
                }}
              >
                <span style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.4))' }}>{game.emoji || category.emoji}</span>
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <h1 className="text-base sm:text-lg font-black text-slate-900 leading-tight line-clamp-1">
                {game.title}
              </h1>
              <p className="text-xs font-bold text-amber-700 mt-0.5">
                {category.title} · {guideByMode[game.mode] || 'Mini Game'}
              </p>
            </div>
          </motion.div>
        )}

        {loadingGame ? (
          <div className="flex justify-center py-10"><Loader2 className="w-7 h-7 animate-spin text-white" /></div>
        ) : locked ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl p-8 text-center"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(255,250,235,0.98) 100%)',
              border: '3px solid #FFB800',
              boxShadow: '0 12px 32px rgba(0,0,0,0.2)',
            }}
          >
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full"
                 style={{
                   background: 'linear-gradient(180deg, #FFB800 0%, #E89A00 100%)',
                   padding: '6px',
                   boxShadow: '0 8px 20px rgba(255,184,0,0.4)',
                 }}>
              <div className="w-full h-full rounded-full flex items-center justify-center"
                   style={{ background: 'radial-gradient(circle, #7C3AED 0%, #5B21B6 100%)' }}>
                <Lock className="h-8 w-8 text-white" />
              </div>
            </div>
            <p className="text-2xl font-black text-slate-900 mb-2">Mini Game Terkunci</p>
            <p className="text-slate-600 font-bold mb-5">Naik taraf pakej untuk akses mini game ini.</p>
            <Link
              to="/"
              className="inline-flex rounded-full px-6 py-3 font-black text-white"
              style={{
                background: 'linear-gradient(180deg, #C92121 0%, #8B0F0F 100%)',
                boxShadow: '0 6px 16px rgba(201,33,33,0.4)',
                textShadow: '0 1px 2px rgba(0,0,0,0.3)',
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