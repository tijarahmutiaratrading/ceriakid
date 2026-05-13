import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import AppHeader from '@/components/AppHeader';
import MiniGameModeRenderer from '@/components/game/MiniGameModeRenderer';
import { findMiniGame } from '@/lib/miniGameBlueprints';

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
  connect_dots: 'Tekan nombor/huruf mengikut turutan.',
  maze: 'Gerakkan watak sampai ke bintang.',
  reaction_speed: 'Tekan Mula, tunggu arahan TAP, kemudian tekan dengan cepat.',
  coloring: 'Tekan ikon untuk mewarnakan semua gambar.',
};

export default function MiniGamePlayground() {
  const { categoryId, gameId } = useParams();
  const { category, game } = findMiniGame(categoryId, gameId);

  const normalizedGame = {
    title: game.title,
    emoji: game.emoji,
    type: game.mode,
    category: category.id,
    difficulty: game.difficulty,
    gameData: { ...game, mode: game.mode },
  };

  return (
    <div className="min-h-screen font-nunito bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 relative overflow-hidden">
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
              <p className="text-white/70 text-xs font-bold mt-1">{game.objective} · {game.difficulty}</p>
            </div>
          </div>
          <p className="text-white text-sm font-bold mt-4 leading-relaxed">{game.instruction}</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="mb-5 rounded-3xl bg-white p-4 text-slate-900 shadow-2xl border-4 border-white/70">
          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-purple-700 mb-1">Cara Main Ringkas</p>
          <p className="text-base font-black leading-snug">{guideByMode[game.mode] || 'Ikut arahan, pilih jawapan yang paling sesuai, dan lihat popup Betul/Cuba lagi.'}</p>
          <p className="text-xs font-bold text-slate-600 mt-2">Untuk ibu bapa: game ini latih {game.objective?.toLowerCase() || 'kemahiran asas'}.</p>
        </motion.div>

        <MiniGameModeRenderer game={normalizedGame} />
      </div>
    </div>
  );
}