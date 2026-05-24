import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play, ArrowLeft, Lock, Loader2 } from 'lucide-react';
import AppHeader from '@/components/AppHeader';
import { findMiniCategory, MINI_GAME_CATEGORIES } from '@/lib/miniGameBlueprints';
import { getCategoryIllustration } from '@/lib/miniCategoryIllustrations';
import { useAuth } from '@/lib/AuthContext';
import { base44 } from '@/api/base44Client';
import { getActiveTier, isGameIndexLocked } from '@/lib/tierAccess';

const HERO_BG = 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/37dda3450_generated_image.png';

// Vibrant cartoon palette — rotate per card
const cardColors = [
  { ring: '#FFB800', inner: '#1E3A8A', glow: 'rgba(30,58,138,0.45)' },     // gold + deep blue
  { ring: '#FFB800', inner: '#7C3AED', glow: 'rgba(124,58,237,0.45)' },    // gold + purple
  { ring: '#FFB800', inner: '#EF4444', glow: 'rgba(239,68,68,0.45)' },     // gold + red
  { ring: '#FFB800', inner: '#F59E0B', glow: 'rgba(245,158,11,0.45)' },    // gold + amber
  { ring: '#FFB800', inner: '#16A34A', glow: 'rgba(22,163,74,0.45)' },     // gold + green
  { ring: '#FFB800', inner: '#0EA5E9', glow: 'rgba(14,165,233,0.45)' },    // gold + sky
  { ring: '#FFB800', inner: '#6366F1', glow: 'rgba(99,102,241,0.45)' },    // gold + indigo
  { ring: '#FFB800', inner: '#DB2777', glow: 'rgba(219,39,119,0.45)' },    // gold + pink
  { ring: '#FFB800', inner: '#0891B2', glow: 'rgba(8,145,178,0.45)' },     // gold + teal
  { ring: '#FFB800', inner: '#C026D3', glow: 'rgba(192,38,211,0.45)' },    // gold + fuchsia
];

const CONFETTI = [
  { left: '5%', top: '12%', color: '#FF6B9D', rot: 25 },
  { left: '90%', top: '18%', color: '#FFD93D', rot: -15 },
  { left: '10%', top: '50%', color: '#6BCB77', rot: 40 },
  { left: '92%', top: '60%', color: '#4D96FF', rot: -25 },
  { left: '8%', top: '85%', color: '#FF9F45', rot: 15 },
  { left: '88%', top: '90%', color: '#FF6B9D', rot: -30 },
];

export default function MiniGamesList() {
  const { type } = useParams();
  const { user, isAuthenticated } = useAuth();
  const [userTier, setUserTier] = React.useState('free');
  const [dbGames, setDbGames] = React.useState([]);
  const [loadingGames, setLoadingGames] = React.useState(true);
  const category = findMiniCategory(type);
  const categoryOffset = Math.max(0, MINI_GAME_CATEGORIES.findIndex(item => item.id === category.id)) * 10;

  React.useEffect(() => {
    if (!user?.email) return;
    base44.entities.UserSubscription.filter({ email: user.email }).then(subs => {
      setUserTier(getActiveTier(subs?.[0]));
    });
  }, [user?.email]);

  React.useEffect(() => {
    setDbGames([]);
    setLoadingGames(false);
  }, [category.id]);

  const gamesToShow = category.games;

  return (
    <div
      className="min-h-screen w-full font-nunito rounded-2xl relative overflow-hidden"
      style={{
        background: `url(${HERO_BG})`,
        backgroundSize: 'cover',
        backgroundAttachment: 'fixed',
        backgroundPosition: 'center top',
      }}
    >
      <AppHeader showBack={true} backTo="/games-hub" />

      {/* Floating confetti */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {CONFETTI.map((c, i) => (
          <motion.div
            key={`c-${i}`}
            className="absolute w-3 h-4 rounded-sm"
            style={{ left: c.left, top: c.top, background: c.color, transform: `rotate(${c.rot}deg)` }}
            animate={{ y: [0, -12, 0], rotate: [c.rot, c.rot + 20, c.rot] }}
            transition={{ repeat: Infinity, duration: 3 + i * 0.3, ease: 'easeInOut' }}
          />
        ))}
      </div>

      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 pb-32 pt-20 md:pt-24">
        {/* HERO HEADER */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <Link
            to="/games-hub"
            className="inline-flex items-center gap-2 mb-4 px-3.5 py-2 rounded-full bg-white/95 text-slate-700 font-bold text-xs sm:text-sm shadow-md hover:bg-white transition-all"
            style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.12)' }}
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Kembali ke kategori
          </Link>

          {/* Title card */}
          <div
            className="relative rounded-3xl p-5 sm:p-6 flex items-center gap-4"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.92) 0%, rgba(255,250,235,0.92) 100%)',
              boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
              border: '3px solid #FFB800',
            }}
          >
            {/* Medallion mini */}
            <div
              className="flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24"
              style={{
                background: `linear-gradient(180deg, #FFB800 0%, #E89A00 100%)`,
                borderRadius: '50%',
                padding: '6px',
                boxShadow: '0 6px 16px rgba(255,184,0,0.4), inset 0 2px 4px rgba(255,255,255,0.4)',
              }}
            >
              <div
                className="w-full h-full flex items-center justify-center overflow-hidden"
                style={{
                  background: 'radial-gradient(circle, #7C3AED 0%, #5B21B6 100%)',
                  borderRadius: '50%',
                  boxShadow: 'inset 0 3px 8px rgba(0,0,0,0.3)',
                }}
              >
                {getCategoryIllustration(category.id) ? (
                  <img
                    src={getCategoryIllustration(category.id)}
                    alt={category.title}
                    className="w-3/4 h-3/4 object-contain"
                    style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.4))' }}
                  />
                ) : (
                  <div className="text-4xl">{category.emoji}</div>
                )}
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight"
                  style={{ textShadow: '0 1px 2px rgba(255,255,255,0.5)' }}>
                {category.title}
              </h1>
              <p className="text-amber-700 text-sm sm:text-base font-bold mt-1">
                {loadingGames ? 'Syncing...' : `${gamesToShow.length} pusingan`} · 3 tahap kesukaran
              </p>
              <p className="text-slate-600 text-xs sm:text-sm font-medium mt-1 line-clamp-2">
                {category.objective}
              </p>
            </div>
          </div>
        </motion.div>

        {/* GAMES GRID — medallion style */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-5">
          {loadingGames && (
            <div className="col-span-full flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-white" />
            </div>
          )}

          {!loadingGames && gamesToShow.map((game, idx) => {
            const globalIdx = categoryOffset + idx;
            const locked = isGameIndexLocked({ index: globalIdx, tier: userTier, isAuthenticated });
            const CardWrapper = locked ? 'div' : Link;
            const playId = game.id;
            const wrapperProps = locked ? {} : { to: `/mini-games/${category.id}/play/${playId}` };
            const colors = cardColors[idx % cardColors.length];

            return (
              <motion.div
                key={game.id}
                initial={{ opacity: 0, scale: 0.85, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: idx * 0.05, type: 'spring', stiffness: 200 }}
                whileHover={!locked ? { y: -6, scale: 1.04 } : {}}
                whileTap={!locked ? { scale: 0.96 } : {}}
              >
                <CardWrapper {...wrapperProps} className={`block ${locked ? 'opacity-70 cursor-not-allowed' : ''}`}>
                  <div className="relative">
                    {/* Medallion */}
                    <div
                      className="relative mx-auto"
                      style={{
                        width: '100%',
                        aspectRatio: '1 / 1.1',
                        background: `linear-gradient(180deg, ${colors.ring} 0%, #E89A00 100%)`,
                        borderRadius: '50% 50% 45% 45% / 55% 55% 45% 45%',
                        padding: '7px',
                        boxShadow: `0 8px 20px ${colors.glow}, 0 4px 8px rgba(0,0,0,0.2), inset 0 2px 4px rgba(255,255,255,0.4), inset 0 -3px 6px rgba(0,0,0,0.15)`,
                      }}
                    >
                      <div
                        className="relative w-full h-full flex items-center justify-center overflow-hidden"
                        style={{
                          background: `radial-gradient(circle at 30% 30%, ${colors.inner} 0%, ${colors.inner}DD 60%, ${colors.inner}99 100%)`,
                          borderRadius: '50% 50% 45% 45% / 55% 55% 45% 45%',
                          boxShadow: 'inset 0 4px 10px rgba(0,0,0,0.3)',
                        }}
                      >
                        <span className="absolute top-2 right-3 text-yellow-200 text-xs opacity-80">✨</span>
                        <span className="absolute bottom-3 left-3 text-yellow-200 text-xs opacity-80">⭐</span>

                        {getCategoryIllustration(category.id) ? (
                          <img
                            src={getCategoryIllustration(category.id)}
                            alt={game.title}
                            className="w-3/5 h-3/5 object-contain"
                            style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.4))' }}
                          />
                        ) : (
                          <div className="text-5xl" style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.4))' }}>
                            {game.emoji}
                          </div>
                        )}

                        {/* Round number badge */}
                        <div className="absolute top-2 left-2 w-7 h-7 rounded-full bg-yellow-400 flex items-center justify-center"
                             style={{ boxShadow: '0 2px 6px rgba(0,0,0,0.3), inset 0 -2px 0 rgba(0,0,0,0.15)' }}>
                          <span className="text-amber-900 font-black text-xs">{idx + 1}</span>
                        </div>
                      </div>
                    </div>

                    {/* Ribbon title */}
                    <div
                      className="absolute left-1/2 -translate-x-1/2 px-2 py-1 min-w-[85%]"
                      style={{
                        bottom: '12%',
                        background: locked
                          ? 'linear-gradient(180deg, #6B7280 0%, #374151 100%)'
                          : 'linear-gradient(180deg, #C92121 0%, #8B0F0F 100%)',
                        clipPath: 'polygon(0 0, 100% 0, 95% 50%, 100% 100%, 0 100%, 5% 50%)',
                        boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
                      }}
                    >
                      <p className="text-center text-white font-black text-[11px] sm:text-xs leading-tight line-clamp-1 px-2"
                         style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>
                        {game.title}
                      </p>
                    </div>

                    {/* Play / Lock button */}
                    <div className="absolute left-1/2 -translate-x-1/2 -bottom-2 w-10 h-10 rounded-full bg-white flex items-center justify-center"
                         style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.25), inset 0 -2px 0 rgba(0,0,0,0.1)' }}>
                      {locked ? (
                        <Lock className="w-4 h-4 text-slate-600" />
                      ) : (
                        <Play className="w-4 h-4 text-slate-800 fill-slate-800 ml-0.5" />
                      )}
                    </div>
                  </div>

                  {/* Bottom info pill */}
                  <div className="mt-4 mx-auto max-w-[95%] bg-white/95 rounded-xl px-2.5 py-1.5 shadow-md backdrop-blur-sm">
                    <p className="text-center text-[10px] sm:text-[11px] font-bold text-slate-700 line-clamp-1">
                      {game.objective || 'Cabaran menarik menanti!'}
                    </p>
                  </div>

                  {locked && (
                    <p className="mt-2 text-center text-[10px] font-black text-white bg-purple-600/80 rounded-full px-2 py-1">
                      🔒 Naik taraf
                    </p>
                  )}
                </CardWrapper>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}