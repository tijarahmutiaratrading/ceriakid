import React from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Gamepad2, Loader2 } from 'lucide-react';
import { findMiniCategory, MINI_GAME_CATEGORIES } from '@/lib/miniGameBlueprints';
import { getCategoryIllustration } from '@/lib/miniCategoryIllustrations';
import { useAuth } from '@/lib/AuthContext';
import { base44 } from '@/api/base44Client';
import { getActiveTier, isGameIndexLocked } from '@/lib/tierAccess';
import CinematicShowcase from '@/components/hub/CinematicShowcase';
import CinematicRail from '@/components/hub/CinematicRail';
import CinematicTips from '@/components/hub/CinematicTips';
import { getGameArt } from '@/lib/gameArtPool';

export default function MiniGamesList() {
  const { type } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [userTier, setUserTier] = React.useState('free');
  const [loadingGames, setLoadingGames] = React.useState(true);
  const [selectedIdx, setSelectedIdx] = React.useState(0);
  const category = findMiniCategory(type);
  const categoryOffset = Math.max(0, MINI_GAME_CATEGORIES.findIndex(item => item.id === category.id)) * 10;

  React.useEffect(() => {
    if (!user?.email) return;
    base44.entities.UserSubscription.filter({ email: user.email }).then(subs => {
      setUserTier(getActiveTier(subs?.[0]));
    });
  }, [user?.email]);

  React.useEffect(() => {
    setLoadingGames(false);
    setSelectedIdx(0);
  }, [category.id]);

  const gamesToShow = category.games;
  const illustration = getCategoryIllustration(category.id);

  // Bina item untuk showcase + rail
  const items = gamesToShow.map((game, idx) => {
    const globalIdx = categoryOffset + idx;
    const locked = isGameIndexLocked({ index: globalIdx, tier: userTier, isAuthenticated });
    const gameArt = getGameArt(idx);
    return {
      key: game.id,
      title: game.title,
      desc: game.objective || 'Cabaran menarik menanti!',
      emoji: game.emoji || category.emoji,
      art: gameArt.art,
      accent: gameArt.accent,
      badge: locked ? '🔒 Premium' : category.title,
      metaChips: [`🎯 Pusingan ${idx + 1}`, '⭐ 3 tahap kesukaran'],
      locked,
      gameId: game.id,
    };
  });

  const safeIdx = Math.min(selectedIdx, items.length - 1);
  const item = items[safeIdx];

  const handlePlay = () => {
    if (!item) return;
    if (item.locked) navigate('/settings');
    else navigate(`/mini-games/${category.id}/play/${item.gameId}`);
  };

  return (
    <div className="min-h-screen w-full font-nunito bg-slate-950">
      {/* Latar sinematik blur */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0" style={{ background: `radial-gradient(circle at 30% 20%, ${item?.accent || '#7c3aed'}33, transparent 55%), #0a0a12` }} />
      </div>

      <div className="relative max-w-7xl mx-auto page-px pb-24 pt-4">
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-6">
          <Link
            to="/games-hub"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-white/10 text-white font-bold text-xs sm:text-sm hover:bg-white/20 transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Kembali ke kategori
          </Link>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3.5 py-2 text-xs font-black text-white">
            <Gamepad2 className="w-4 h-4" /> MINI GAMES
          </div>
        </motion.div>

        {loadingGames || !item ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-7 h-7 animate-spin text-white/60" />
          </div>
        ) : (
          <>
            <CinematicShowcase
              item={item}
              playLabel={item.locked ? '🔒 Buka dengan Langganan' : 'Main Sekarang'}
              onPlay={handlePlay}
            />
            <div className="mt-8 sm:mt-12">
              <div className="flex items-center gap-2 mb-1">
                {illustration && <img src={illustration} alt="" className="w-6 h-6 rounded-md object-cover" />}
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">
                  {category.title} · {safeIdx + 1}/{items.length}
                </p>
              </div>
              <CinematicRail items={items} selected={safeIdx} onSelect={setSelectedIdx} onActivate={handlePlay} />
            </div>
            <CinematicTips />
          </>
        )}
      </div>
    </div>
  );
}