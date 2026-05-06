import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2, Play, ArrowLeft } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import AppHeader from '@/components/AppHeader';
import { useAgeGroup } from '@/lib/AgeGroupContext';

const MINI_GAME_META = {
  memory: { emoji: '🧠', title: 'Permainan Ingatan', playPath: '/games/memory', color: 'from-purple-500 to-pink-500' },
  dragdrop: { emoji: '🎯', title: 'Padankan Huruf', playPath: '/games/dragdrop', color: 'from-blue-500 to-cyan-400' },
  wordbuilder: { emoji: '📝', title: 'Bentuk Perkataan', playPath: '/games/wordbuilder', color: 'from-green-500 to-emerald-400' },
  sorting: { emoji: '🗂️', title: 'Isih Kategori', playPath: '/games/sorting', color: 'from-orange-500 to-yellow-400' },
  tracing: { emoji: '✏️', title: 'Seni Menulis', playPath: '/games/tracing', color: 'from-violet-500 to-purple-500' },
  story: { emoji: '📖', title: 'Petualangan Cerita', playPath: '/games/story', color: 'from-amber-500 to-orange-400' },
  tilematch: { emoji: '🔢', title: 'Padankan 3 Sama', playPath: '/games/tilematch', color: 'from-pink-500 to-purple-500' },
  physics: { emoji: '🚀', title: 'Lontarkan Bola', playPath: '/games/physics', color: 'from-sky-500 to-blue-500' },
};

export default function MiniGamesList() {
  const { type } = useParams();
  const { ageGroup } = useAgeGroup() || { ageGroup: 'prasekolah' };
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const meta = MINI_GAME_META[type] || MINI_GAME_META.memory;

  useEffect(() => {
    const loadGames = async () => {
      setLoading(true);
      const data = await base44.entities.Game.filter({ category: type, isPublished: true });
      setGames((data || []).sort((a, b) => (a.order || 0) - (b.order || 0)));
      setLoading(false);
    };
    loadGames();
  }, [type, ageGroup]);

  return (
    <div className="min-h-screen font-nunito bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 relative overflow-hidden">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
        <div className="absolute top-1/3 -left-20 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
      </div>

      <AppHeader showBack={true} backTo="/games-hub" />

      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 pb-32 pt-28 md:pt-32">
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className={`mb-5 rounded-3xl p-5 bg-gradient-to-br ${meta.color} shadow-2xl`}>
          <Link to="/games-hub" className="inline-flex items-center gap-2 text-white/85 text-xs font-black mb-4">
            <ArrowLeft className="w-4 h-4" /> Kembali ke kategori
          </Link>
          <div className="flex items-center gap-4">
            <div className="text-5xl">{meta.emoji}</div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-white">{meta.title}</h1>
              <p className="text-white/80 text-sm font-bold">{games.length} games tersedia</p>
            </div>
          </div>
        </motion.div>

        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-white" /></div>
        ) : games.length === 0 ? (
          <div className="text-center py-16 rounded-3xl bg-white/10 border border-white/20">
            <p className="text-white/70 font-bold">Tiada game dalam kategori ini lagi.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {games.map((game, idx) => (
              <motion.div key={game.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}>
                <Link to={`${meta.playPath}?gameId=${game.id}`} className="block rounded-3xl p-4 bg-white/12 border border-white/20 hover:bg-white/18 transition-all shadow-xl">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center text-3xl flex-shrink-0">{game.emoji || meta.emoji}</div>
                    <div className="flex-1 min-w-0">
                      <h2 className="text-white font-black text-base truncate">{game.title || meta.title}</h2>
                      <p className="text-white/60 text-xs font-bold mt-1">{game.difficulty || 'easy'} · {game.totalQuestions || 1} aktiviti</p>
                    </div>
                    <div className="w-11 h-11 rounded-2xl bg-white text-purple-700 flex items-center justify-center shadow-lg flex-shrink-0">
                      <Play className="w-5 h-5 fill-current" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}