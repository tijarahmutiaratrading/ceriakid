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
import { COGNITIVE_CATEGORIES, getMiniGameVariants } from '@/lib/miniGameBuilder';

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
  const categoryOffset = Math.max(0, MINI_GAME_CATEGORIES.findIndex(item => item.id === category.id)) * 3;

  // Pastel squircle palette — rotate per card
  const pastelPalette = [
    { bg: '#C7B8F5', text: '#3D2A7A', accent: '#7B5BE0' }, // lavender
    { bg: '#B8E5D4', text: '#1F5A45', accent: '#3FA882' }, // mint
    { bg: '#FFD4B8', text: '#7A3D1F', accent: '#E07A3F' }, // peach
    { bg: '#FFC7D9', text: '#7A2A4A', accent: '#E04F7A' }, // pink
    { bg: '#B8D4F5', text: '#1F3D7A', accent: '#3F7AE0' }, // blue
    { bg: '#F5E5B8', text: '#7A5A1F', accent: '#E0A83F' }, // yellow
  ];

  React.useEffect(() => {
    if (!user?.email) return;
    base44.entities.UserSubscription.filter({ email: user.email }).then(subs => {
      setUserTier(getActiveTier(subs?.[0]));
    });
  }, [user?.email]);

  const isCognitive = COGNITIVE_CATEGORIES.includes(category.id);

  React.useEffect(() => {
    if (isCognitive) {
      // Cognitive categories use template-based mini games — no DB fetch needed
      setDbGames([]);
      setLoadingGames(false);
      return;
    }
    setLoadingGames(true);
    base44.entities.Game.filter({ category: category.id }).then(games => {
      setDbGames((games || []).filter(game =>
        game.isPublished !== false &&
        (game.gameData?.miniGameBlueprint === true || game.gameData?.miniGameGenerated === true)
      ).sort((a, b) => (a.order || 0) - (b.order || 0)));
      setLoadingGames(false);
    });
  }, [category.id, isCognitive]);

  // For cognitive categories → show 6 variants (template-based, instant)
  // For other (legacy) categories → use DB games or blueprints
  const gamesToShow = isCognitive
    ? getMiniGameVariants(category.id, 6).map(v => ({
        id: v.id,
        title: v.title,
        emoji: category.emoji,
      }))
    : (dbGames.length > 0 ? dbGames : category.games);

  return (
    <div className="min-h-screen font-nunito relative overflow-hidden">
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
      </div>

      <AppHeader showBack={true} backTo="/games-hub" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-32 pt-20 md:pt-24">
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className={`mb-5 rounded-3xl p-5 bg-gradient-to-br ${category.color} shadow-2xl`}>
          <Link to="/games-hub" className="inline-flex items-center gap-2 text-white/85 text-xs font-black mb-4">
            <ArrowLeft className="w-4 h-4" /> Kembali ke kategori
          </Link>
          <div className="flex items-center gap-4">
            <div className="text-5xl">{category.emoji}</div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-white">{category.title}</h1>
              <p className="text-white/80 text-sm font-bold">{loadingGames ? 'Syncing games...' : `${gamesToShow.length} mini games`} · {category.objective}</p>
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
                className={`relative block h-full p-5 transition-all ${locked ? 'opacity-70' : 'hover:shadow-2xl'}`}
                style={{
                  background: palette.bg,
                  borderRadius: '36px',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
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
                <div className="absolute bottom-4 right-4 w-11 h-11 rounded-2xl bg-white flex items-center justify-center shadow-lg" style={{ color: palette.accent }}>
                  {locked ? <Lock className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current" />}
                </div>
              </CardWrapper>
              {locked && <p className="mt-2 text-center text-xs font-black text-yellow-200">Naik taraf untuk akses mini game ini</p>}
            </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}