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
import { COGNITIVE_CATEGORIES, buildMiniGameFromKSSR } from '@/lib/miniGameBuilder';

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
  const [dbGame, setDbGame] = React.useState(null);
  const [kssrGameData, setKssrGameData] = React.useState(null);
  const [loadingGame, setLoadingGame] = React.useState(true);
  const isCognitive = COGNITIVE_CATEGORIES.includes(categoryId);
  const category = isCognitive ? findMiniCategory(categoryId) : findMiniGame(categoryId, gameId).category;
  const blueprintGame = isCognitive ? null : findMiniGame(categoryId, gameId).game;
  // For cognitive: extract variant from gameId (format: "{categoryId}-v{n}")
  const variantNum = isCognitive ? (parseInt(gameId?.split('-v')[1]) || 1) : 1;
  const game = isCognitive
    ? { title: `${category.title} · Cabaran #${variantNum}`, emoji: category.emoji, gameData: kssrGameData }
    : (dbGame || blueprintGame);
  const gameData = game?.gameData || game || {};
  const categoryOffset = Math.max(0, MINI_GAME_CATEGORIES.findIndex(item => item.id === category.id)) * 3;
  const blueprintIndex = isCognitive ? (variantNum - 1) : Math.max(0, category.games.findIndex(item => item.id === gameId));
  const gameIndex = categoryOffset + (dbGame ? Number(dbGame.order || 0) : blueprintIndex);
  const locked = isGameIndexLocked({ index: gameIndex, tier: userTier, isAuthenticated });

  React.useEffect(() => {
    if (!user?.email) return;
    base44.entities.UserSubscription.filter({ email: user.email }).then(subs => {
      setUserTier(getActiveTier(subs?.[0]));
    });
  }, [user?.email]);

  React.useEffect(() => {
    setLoadingGame(true);
    if (isCognitive) {
      // Build from KSSR Subject Games (template-based, clean content)
      buildMiniGameFromKSSR(categoryId, variantNum).then(data => {
        setKssrGameData(data);
        setLoadingGame(false);
      });
      return;
    }
    base44.entities.Game.filter({ category: category.id }).then(games => {
      const found = (games || []).find(item => item.id === gameId);
      setDbGame(found || null);
      setLoadingGame(false);
    });
  }, [category.id, gameId, isCognitive, categoryId, variantNum]);

  const normalizedGame = {
    title: game.title,
    emoji: game.emoji || category.emoji,
    type: gameData.mode || gameData.playStyle || game.type,
    category: category.id,
    difficulty: game.difficulty || gameData.difficulty,
    gameData: { ...gameData, mode: gameData.mode || gameData.playStyle || game.type },
  };

  return (
    <div className="min-h-screen font-nunito relative overflow-hidden" style={{ background: 'linear-gradient(180deg, #B5D8B0 0%, #A8CFA3 50%, #9FCFA5 100%)' }}>
      {/* Decorative organic shapes */}
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
        <svg className="absolute bottom-32 left-16 w-24 h-24 opacity-45" viewBox="0 0 100 100">
          <ellipse cx="50" cy="50" rx="30" ry="20" fill="#8FBC82" />
          <ellipse cx="40" cy="45" rx="20" ry="14" fill="#A0C893" />
        </svg>
      </div>
      <AppHeader showBack={true} backTo={`/mini-games/${category.id}`} />
      <div className="relative max-w-lg mx-auto px-4 pb-32 pt-28 md:pt-32">
        <Link to={`/mini-games/${category.id}`} className="inline-flex items-center gap-2 mb-4 px-4 py-2.5 rounded-2xl font-black text-sm shadow-lg hover:shadow-xl transition-all" style={{ background: 'linear-gradient(135deg, #A67B5B 0%, #8B5A3C 100%)', color: '#FDF6E3', border: '2px solid #6B4423' }}>
          <ArrowLeft className="w-4 h-4" /> Kembali ke {category.title}
        </Link>

        {loadingGame ? (
          <div className="flex justify-center py-10"><Loader2 className="w-7 h-7 animate-spin text-white" /></div>
        ) : locked ? (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl bg-white p-8 text-center shadow-2xl">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-100 text-purple-700">
              <Lock className="h-8 w-8" />
            </div>
            <p className="text-2xl font-black text-slate-900 mb-2">Mini Game Terkunci</p>
            <p className="text-slate-600 font-bold mb-5">Naik taraf pakej untuk akses mini game ini.</p>
            <Link to="/" className="inline-flex rounded-2xl bg-purple-600 px-5 py-3 font-black text-white">Lihat Pakej</Link>
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