import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import AppHeader from '@/components/AppHeader';
import { useAgeGroup } from '@/lib/AgeGroupContext';
import { MINI_GAME_CATEGORIES } from '@/lib/miniGameBlueprints';

const levelColors = {
  Mudah: 'bg-green-400/85 text-white',
  Sederhana: 'bg-yellow-400/85 text-white',
  Sukar: 'bg-red-400/85 text-white',
};

export default function GamesHub() {
  const { ageGroup } = useAgeGroup() || { ageGroup: 'prasekolah' };

  return (
    <div className="min-h-screen font-nunito bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 relative overflow-hidden">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
        <div className="absolute top-1/3 -left-20 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse" />
      </div>

      <AppHeader showBack={true} backTo="/dashboard" />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 pb-32 pt-28 md:pt-32">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6 p-5 rounded-3xl" style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.4)' }}>
          <Link to="/dashboard" className="inline-flex items-center gap-2 mb-4 px-4 py-2.5 rounded-full bg-white/80 text-game-purple font-black text-sm shadow-lg hover:bg-white transition-all">
            <ArrowLeft className="w-4 h-4" /> Kembali ke Dashboard
          </Link>
          <div className="flex items-center gap-3">
            <div className="text-5xl">🎮</div>
            <div className="flex-1">
              <h1 className="text-3xl font-black text-white leading-tight">Mini Games Hub</h1>
              <p className="text-white/70 text-sm font-semibold">
                {ageGroup === 'prasekolah' ? '🧒 Prasekolah' : '🎒 Sekolah Rendah'} · 8 kategori · 24 mini games unik
              </p>
            </div>
          </div>
          <div className="mt-4 rounded-2xl bg-white/15 border border-white/20 p-3">
            <p className="text-white text-sm font-black">Fun first: balloon pop, maze, tracing, spin wheel, catching game, coloring, rhythm tap dan banyak lagi.</p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          {MINI_GAME_CATEGORIES.map((category, idx) => (
            <motion.div key={category.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }} whileHover={{ scale: 1.03, y: -4 }} whileTap={{ scale: 0.97 }}>
              <Link to={`/mini-games/${category.id}`} className="block h-full">
                <div className={`bg-gradient-to-br ${category.color} rounded-3xl p-4 h-full shadow-lg`}>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="text-4xl">{category.emoji}</div>
                    <span className="text-xs px-2 py-1 rounded-full font-black bg-white/25 text-white">3 games</span>
                  </div>
                  <h3 className="text-white font-black text-lg leading-tight mb-1">{category.title}</h3>
                  <p className="text-white/85 text-xs font-bold leading-snug mb-3">{category.objective}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {category.games.map(game => <span key={game.id} className={`${levelColors[game.difficulty]} text-[10px] px-2 py-0.5 rounded-full font-black`}>{game.mode.replace('_', ' ')}</span>)}
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="p-5 rounded-3xl text-center" style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.3)' }}>
          <p className="text-white font-black text-base mb-1">💡 Tips Ibu Bapa</p>
          <p className="text-white/70 text-sm">Setiap kategori ada 3 pengalaman berbeza supaya anak tak rasa main game yang sama berulang-ulang.</p>
        </motion.div>
      </div>
    </div>
  );
}