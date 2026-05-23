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
    <div className="min-h-screen w-full font-nunito relative overflow-hidden rounded-2xl" style={{ background: 'linear-gradient(180deg, #FFF1F8 0%, #F0E5FF 50%, #E0F0FF 100%)' }}>
      {/* Animated playful background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Soft sun glow */}
        <motion.div
          animate={{ scale: [1, 1.08, 1], opacity: [0.55, 0.8, 0.55] }}
          transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
          className="absolute -top-24 -right-24 w-[26rem] h-[26rem] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(255,236,150,0.85) 0%, rgba(255,200,120,0) 70%)' }}
        />

        {/* Floating clouds */}
        {[
          { top: '12%', size: 'w-28 h-12', delay: 0, range: 30 },
          { top: '28%', size: 'w-20 h-10', delay: 1.5, range: 24 },
          { top: '62%', size: 'w-32 h-14', delay: 0.6, range: 36 },
          { top: '80%', size: 'w-24 h-10', delay: 2.2, range: 22 },
        ].map((cloud, i) => (
          <motion.div
            key={`cloud-${i}`}
            initial={{ x: '-20%' }}
            animate={{ x: ['-20%', '120%'] }}
            transition={{ repeat: Infinity, duration: 22 + i * 4, ease: 'linear', delay: cloud.delay }}
            className={`absolute ${cloud.size} bg-white/80 rounded-full blur-sm`}
            style={{ top: cloud.top }}
          />
        ))}

        {/* Floating bubbles / sparkles */}
        {['✨','⭐','🎈','🌈','💫','🎀','🌟','🪄'].map((bit, i) => (
          <motion.span
            key={`bit-${i}`}
            className="absolute text-3xl"
            style={{ left: `${(i * 13 + 6) % 92}%`, top: `${(i * 19 + 12) % 78}%` }}
            animate={{ y: [0, -18, 0], rotate: [0, 12, -12, 0], opacity: [0.5, 1, 0.5] }}
            transition={{ repeat: Infinity, duration: 4 + i * 0.5, ease: 'easeInOut', delay: i * 0.3 }}
          >
            {bit}
          </motion.span>
        ))}

        {/* Bottom wave */}
        <svg className="absolute bottom-0 left-0 w-full h-32" viewBox="0 0 1440 200" preserveAspectRatio="none">
          <path d="M0,100 C320,160 720,40 1080,100 C1280,140 1380,100 1440,90 L1440,200 L0,200 Z" fill="rgba(255,255,255,0.55)" />
          <path d="M0,140 C360,200 720,80 1100,140 C1300,170 1380,150 1440,140 L1440,200 L0,200 Z" fill="rgba(255,255,255,0.4)" />
        </svg>

        {/* CeriaKid mascot — waving from bottom-right */}
        <motion.div
          className="absolute bottom-2 right-3 sm:right-6 z-10"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ repeat: Infinity, duration: 2.4, ease: 'easeInOut' }}
            className="relative"
          >
            <img
              src="https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/c0ad02d9e_ChatGPTImageMay12026at12_29_37PM.png"
              alt="CeriaKid Mascot"
              className="w-24 sm:w-28 h-auto rounded-3xl shadow-2xl ring-4 ring-white/80"
            />
            <motion.div
              className="absolute -top-3 -left-4 bg-white px-3 py-1.5 rounded-2xl shadow-lg ring-2 ring-pink-200 text-xs font-black text-purple-700 whitespace-nowrap"
              animate={{ rotate: [-4, 4, -4], scale: [1, 1.06, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              Jom main! 👋
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
      <AppHeader showBack={true} backTo={`/mini-games/${category.id}`} />
      <div className="relative max-w-lg mx-auto px-4 pb-32 pt-28 md:pt-32">
        <Link
          to={`/mini-games/${category.id}`}
          className="inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-full font-bold text-sm text-slate-700 bg-white/90 shadow-sm hover:bg-white hover:-translate-y-0.5 active:scale-95 transition-all"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Kembali ke {category.title}
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