import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play, ArrowLeft, Trophy, Volume2, Sparkles, Lock, Loader2 } from 'lucide-react';
import AppHeader from '@/components/AppHeader';
import { findMiniCategory, MINI_GAME_CATEGORIES } from '@/lib/miniGameBlueprints';
import { getCategoryIllustration } from '@/lib/miniCategoryIllustrations';
import { useAuth } from '@/lib/AuthContext';
import { base44 } from '@/api/base44Client';
import { getActiveTier, isGameIndexLocked } from '@/lib/tierAccess';

const modeLabels = {
  balloon_pop: 'Balloon Pop', tracing: 'Finger Tracing', dragdrop: 'Drag & Drop', falling_catch: 'Catch Falling Object', stacking: 'Object Stacking', sequence: 'Sequence Arrangement', wordbuilder: 'Build Word', swipe_select: 'Swipe Selection', spin_wheel: 'Spin Wheel', picture_hunt: 'Picture Hunt', typing_challenge: 'Typing Challenge', tilematch: 'Tile Match', sorting: 'Sorting Game', mini_simulation: 'Mini Simulation', true_false: 'True / False', memory: 'Memory Card Flip', rhythm_tap: 'Rhythm Tapping', connect_dots: 'Connect The Dots', maze: 'Maze', hidden_object: 'Hidden Object', reaction_speed: 'Reaction Speed', story: 'Story Choice', coloring: 'Coloring Activity'
};

export default function MiniGamesList() {
  const { type } = useParams();
  const { user, isAuthenticated } = useAuth();
  const [userTier, setUserTier] = React.useState('free');
  const [dbGames, setDbGames] = React.useState([]);
  const [loadingGames, setLoadingGames] = React.useState(true);
  const category = findMiniCategory(type);
  const categoryOffset = Math.max(0, MINI_GAME_CATEGORIES.findIndex(item => item.id === category.id)) * 10;

  // Soft pastel gradient palette — rotate per card
  const pastelPalette = [
    { bg: 'linear-gradient(135deg, #FFE5F1 0%, #F5D7FF 100%)', text: '#5B2A7A', accent: '#A855F7' }, // pink-lavender
    { bg: 'linear-gradient(135deg, #FFF1D6 0%, #FFD9D9 100%)', text: '#7A4A2A', accent: '#F97316' }, // peach
    { bg: 'linear-gradient(135deg, #FFE0CC 0%, #FFF1A8 100%)', text: '#7A5A1F', accent: '#EAB308' }, // warm yellow
    { bg: 'linear-gradient(135deg, #D6F5E5 0%, #C8EEDD 100%)', text: '#1F5A45', accent: '#10B981' }, // mint
    { bg: 'linear-gradient(135deg, #E5DEFF 0%, #D9E5FF 100%)', text: '#3D2A7A', accent: '#6366F1' }, // lavender-blue
    { bg: 'linear-gradient(135deg, #D6F0FF 0%, #FFE0F0 100%)', text: '#1F3D7A', accent: '#3B82F6' }, // sky-pink
    { bg: 'linear-gradient(135deg, #D9F0E8 0%, #E5E0FF 100%)', text: '#1F5A45', accent: '#14B8A6' }, // teal-lavender
    { bg: 'linear-gradient(135deg, #FFE0F0 0%, #E5DEFF 100%)', text: '#7A2A4A', accent: '#EC4899' }, // pink-purple
  ];

  React.useEffect(() => {
    if (!user?.email) return;
    base44.entities.UserSubscription.filter({ email: user.email }).then(subs => {
      setUserTier(getActiveTier(subs?.[0]));
    });
  }, [user?.email]);

  React.useEffect(() => {
    // All mini games now come from hand-crafted blueprints — instant load, no DB.
    setDbGames([]);
    setLoadingGames(false);
  }, [category.id]);

  // Always use blueprint games (10 per category, each with 10 rounds)
  const gamesToShow = category.games;

  return (
    <div className="min-h-screen w-full font-nunito rounded-2xl" style={{ background: '#FAF7FF' }}>
      <AppHeader showBack={true} backTo="/games-hub" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-32 pt-20 md:pt-24">
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-5 rounded-[1.75rem] p-5 sm:p-6"
          style={{
            background: 'linear-gradient(135deg, #FFD9EC 0%, #E0D4FF 45%, #C8E0FF 100%)',
            boxShadow: '0 10px 30px rgba(168,85,247,0.12)',
          }}
        >
          <Link to="/games-hub" className="inline-flex items-center gap-2 mb-4 px-3.5 py-2 rounded-full bg-white/85 text-slate-700 font-bold text-xs sm:text-sm shadow-sm hover:bg-white transition-all">
            <ArrowLeft className="w-3.5 h-3.5" /> Kembali ke kategori
          </Link>
          <div className="flex items-center gap-4">
            <div className="text-5xl" style={{ filter: 'drop-shadow(0 4px 8px rgba(168,85,247,0.2))' }}>{category.emoji}</div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-800 leading-tight">{category.title}</h1>
              <p className="text-slate-600 text-sm font-medium mt-1">{loadingGames ? 'Syncing games...' : `${gamesToShow.length} mini games`} · {category.objective}</p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-2 gap-4 md:gap-5">
          {loadingGames && <div className="col-span-2 flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-white" /></div>}
          {!loadingGames && gamesToShow.map((game, idx) => {
            const globalIdx = categoryOffset + idx;
            const locked = isGameIndexLocked({ index: globalIdx, tier: userTier, isAuthenticated });
            const CardWrapper = locked ? 'div' : Link;
            const playId = game.id;
            const data = game.gameData || game;
            const wrapperProps = locked ? {} : { to: `/mini-games/${category.id}/play/${playId}` };
            const palette = pastelPalette[idx % pastelPalette.length];
            return (
            <motion.div key={game.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.06 }} whileHover={!locked ? { y: -4 } : {}}>
              <CardWrapper
                {...wrapperProps}
                className={`relative block h-full p-5 transition-all ${locked ? 'opacity-70' : 'hover:-translate-y-1 hover:shadow-xl'}`}
                style={{
                  background: palette.bg,
                  borderRadius: '28px',
                  boxShadow: '0 6px 20px rgba(168,85,247,0.10)',
                  minHeight: '180px',
                }}
              >
                {/* Illustration — large, centered */}
                <div className="flex justify-center mb-4 mt-2">
                  {getCategoryIllustration(category.id) ? (
                    <img
                      src={getCategoryIllustration(category.id)}
                      alt={game.title}
                      className="w-24 h-24 sm:w-28 sm:h-28 object-contain rounded-2xl"
                      style={{ filter: 'drop-shadow(0 6px 12px rgba(0,0,0,0.18))' }}
                    />
                  ) : (
                    <div className="text-6xl sm:text-7xl" style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.15))' }}>{game.emoji}</div>
                  )}
                </div>

                {/* Title only */}
                <h2 className="text-center font-black text-sm sm:text-base leading-tight line-clamp-2 pr-10" style={{ color: palette.text }}>
                  {game.title}
                </h2>

                {/* Play button — bottom right corner */}
                <div className="absolute bottom-4 right-4 w-10 h-10 rounded-full bg-white/90 flex items-center justify-center shadow-md" style={{ color: palette.accent }}>
                  {locked ? <Lock className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                </div>
              </CardWrapper>
              {locked && <p className="mt-2 text-center text-xs font-bold text-slate-500">Naik taraf untuk akses mini game ini</p>}
            </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}