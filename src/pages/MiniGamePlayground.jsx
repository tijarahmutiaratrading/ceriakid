import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Lock, Loader2 } from 'lucide-react';
import AppHeader from '@/components/AppHeader';
import MiniGameModeRenderer from '@/components/game/MiniGameModeRenderer';
import { findMiniGame, MINI_GAME_CATEGORIES } from '@/lib/miniGameBlueprints';
import { useAuth } from '@/lib/AuthContext';
import { base44 } from '@/api/base44Client';
import { getActiveTier, isGameIndexLocked } from '@/lib/tierAccess';

const glassCard = { background: 'rgba(15,23,42,0.72)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.35)' };

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
  const [userTier, setUserTier] = React.useState('free');
  const [dbGame, setDbGame] = React.useState(null);
  const [loadingGame, setLoadingGame] = React.useState(true);
  const { category, game: blueprintGame } = findMiniGame(categoryId, gameId);
  const game = dbGame || blueprintGame;
  const gameData = game?.gameData || game || {};
  const categoryOffset = Math.max(0, MINI_GAME_CATEGORIES.findIndex(item => item.id === category.id)) * 3;
  const blueprintIndex = Math.max(0, category.games.findIndex(item => item.id === gameId));
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
    base44.entities.Game.filter({ category: category.id }).then(games => {
      const found = (games || []).find(item => item.id === gameId);
      setDbGame(found || null);
      setLoadingGame(false);
    });
  }, [category.id, gameId]);

  const normalizedGame = {
    title: game.title,
    emoji: game.emoji || category.emoji,
    type: gameData.mode || gameData.playStyle || game.type,
    category: category.id,
    difficulty: game.difficulty || gameData.difficulty,
    gameData: { ...gameData, mode: gameData.mode || gameData.playStyle || game.type },
  };

  return (
    <div className="min-h-screen font-nunito bg-[radial-gradient(circle_at_top_left,#22d3ee_0%,transparent_24%),radial-gradient(circle_at_top_right,#f472b6_0%,transparent_26%),linear-gradient(135deg,#0f172a_0%,#4c1d95_48%,#831843_100%)] relative overflow-hidden">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
        <div className="absolute top-1/3 -left-20 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
      </div>
      <AppHeader showBack={true} backTo={`/mini-games/${category.id}`} />
      <div className="relative max-w-lg mx-auto px-4 pb-32 pt-28 md:pt-32">
        <Link to={`/mini-games/${category.id}`} className="inline-flex items-center gap-1.5 mb-3 px-3 py-2 rounded-full bg-white/80 text-game-purple font-black text-xs shadow-lg hover:bg-white transition-all">
          <ArrowLeft className="w-4 h-4" /> Kembali ke {category.title}
        </Link>

        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="mb-5 p-5 rounded-3xl" style={glassCard}>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/30 flex items-center justify-center text-3xl shadow-inner">{game.emoji}</div>
            <div className="min-w-0">
              <h1 className="text-xl font-black text-white leading-tight">{game.title}</h1>
              <p className="text-white/70 text-xs font-bold mt-1">{gameData.objective || game.description || category.objective} · {game.difficulty || gameData.difficulty || 'Mudah'}</p>
            </div>
          </div>
          <p className="text-white text-sm font-bold mt-4 leading-relaxed">{gameData.instruction || 'Ikut arahan dan pilih jawapan yang betul.'}</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="mb-5 rounded-3xl bg-white p-4 text-slate-900 shadow-2xl border-4 border-white/70">
          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-purple-700 mb-1">Cara Main Ringkas</p>
          <p className="text-base font-black leading-snug">{guideByMode[gameData.mode || gameData.playStyle] || 'Ikut arahan, pilih jawapan yang paling sesuai, dan lihat popup Betul/Cuba lagi.'}</p>
          <p className="text-xs font-bold text-slate-600 mt-2">Untuk ibu bapa: game ini latih {(gameData.objective || game.description || category.objective)?.toLowerCase() || 'kemahiran asas'}.</p>
        </motion.div>

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
          <MiniGameModeRenderer game={normalizedGame} />
        )}
      </div>
    </div>
  );
}