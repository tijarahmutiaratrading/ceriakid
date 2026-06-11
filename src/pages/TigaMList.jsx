import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import AppHeader from '@/components/AppHeader';
import TigaMGameCard from '@/components/game/TigaMGameCard';
import { findTigaMCategory, TIGA_M_CATEGORIES } from '@/lib/tigaMBlueprints';
import { useAuth } from '@/lib/AuthContext';
import { base44 } from '@/api/base44Client';
import { getActiveTier, isGameIndexLocked } from '@/lib/tierAccess';

export default function TigaMList() {
  const { categoryId } = useParams();
  const { user, isAuthenticated } = useAuth();
  const [userTier, setUserTier] = React.useState('free');
  const category = findTigaMCategory(categoryId);
  // Offset unik supaya locking konsisten merentas kategori 3M
  const categoryOffset = Math.max(0, TIGA_M_CATEGORIES.findIndex(c => c.id === category.id)) * 10;

  React.useEffect(() => {
    if (!user?.email) return;
    base44.entities.UserSubscription.filter({ email: user.email }).then(subs => {
      setUserTier(getActiveTier(subs?.[0]));
    });
  }, [user?.email]);

  return (
    <div className="min-h-screen w-full font-nunito">
      <AppHeader showBack={true} backTo="/3m" />

      <div className="relative max-w-7xl mx-auto page-px pb-16 pt-4">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <Link
            to="/3m"
            className="inline-flex items-center gap-2 mb-4 px-3.5 py-2 rounded-full bg-white text-slate-700 font-bold text-xs sm:text-sm shadow-sm hover:shadow-md transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Kembali ke 3M
          </Link>

          <div className={`rounded-3xl p-4 sm:p-5 shadow-md flex items-center gap-3 sm:gap-4 border border-white/40 bg-gradient-to-br ${category.color}`}>
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/25 backdrop-blur-md ring-1 ring-white/40 flex items-center justify-center text-4xl flex-shrink-0">
              {category.emoji}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl font-black text-white leading-tight drop-shadow-md">{category.title}</h1>
              <p className="text-white/90 text-xs sm:text-sm font-bold mt-0.5">{category.games.length} game · 10 pusingan setiap satu</p>
              <p className="text-white/85 text-xs sm:text-sm font-medium mt-1 line-clamp-2 drop-shadow-sm">{category.objective}</p>
            </div>
          </div>
        </motion.div>

        {/* Games grid — glass card style ikut Games Subjek */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
          {category.games.map((game, idx) => {
            const globalIdx = categoryOffset + idx;
            const locked = isGameIndexLocked({ index: globalIdx, tier: userTier, isAuthenticated });
            return (
              <TigaMGameCard
                key={game.id}
                game={game}
                idx={idx}
                emoji={category.emoji}
                locked={locked}
                to={`/3m/${category.id}/play/${game.id}`}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}