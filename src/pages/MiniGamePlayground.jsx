import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import AppHeader from '@/components/AppHeader';
import MiniGameModeRenderer from '@/components/game/MiniGameModeRenderer';
import { findMiniGame } from '@/lib/miniGameBlueprints';

const glassCard = { background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.4)' };

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
          <p className="text-white/85 text-sm font-bold mt-4 leading-relaxed">{game.instruction}</p>
        </motion.div>

        <MiniGameModeRenderer game={normalizedGame} />
      </div>
    </div>
  );
}