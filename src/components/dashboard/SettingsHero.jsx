import React from 'react';
import { motion } from 'framer-motion';
import { Pencil, Loader, Crown, Sparkles, Star, Heart } from 'lucide-react';

const TIER_LABELS = {
  free: 'Percuma',
  asas: 'Asas',
  standard: 'Standard',
  keluarga: 'Keluarga',
  premium: 'Premium',
  pro: 'Pro',
};

const HERO_IMAGE = 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/092310156_generated_image.png';
const HERO_IMAGE_MOBILE = 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/0489544af_generated_image.png';

/**
 * Settings hero — gaya Apple Fitness dengan hiasan premium:
 * - Floating sparkles & glowing orbs
 * - Gradient ring berkilau pada avatar
 * - Glow effect untuk premium tiers
 */
export default function SettingsHero({ user, avatarUrl, userTier, saving, onEditAvatar }) {
  const tier = userTier || 'free';
  const tierLabel = TIER_LABELS[tier] || 'Percuma';
  const isFree = tier === 'free';
  const isPremium = ['keluarga', 'premium', 'pro', 'standard'].includes(tier);

  return (
    <div className="relative w-full rounded-[2rem] overflow-hidden shadow-2xl shadow-purple-950/50 aspect-[4/5] sm:aspect-[16/8] md:aspect-[16/7] max-h-[420px] sm:max-h-[440px]">
      {/* Background image */}
      <img
        src={HERO_IMAGE_MOBILE}
        alt="Profile"
        className="absolute inset-0 w-full h-full object-cover sm:hidden"
      />
      <img
        src={HERO_IMAGE}
        alt="Profile"
        className="absolute inset-0 w-full h-full object-cover hidden sm:block"
      />

      {/* Dark gradient overlay */}
      <div
        className="absolute inset-0 sm:hidden"
        style={{
          background:
            'linear-gradient(180deg, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.15) 30%, rgba(0,0,0,0.5) 65%, rgba(0,0,0,0.9) 100%)',
        }}
      />
      <div
        className="absolute inset-0 hidden sm:block"
        style={{
          background:
            'linear-gradient(90deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.55) 35%, rgba(0,0,0,0.15) 70%, rgba(0,0,0,0) 100%), linear-gradient(180deg, rgba(0,0,0,0) 50%, rgba(0,0,0,0.5) 100%)',
        }}
      />

      {/* Colored glow orbs — bagi rasa magical */}
      <motion.div
        animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.6, 0.4] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -top-20 -right-16 w-56 h-56 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(251,191,36,0.5) 0%, transparent 70%)' }}
      />
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.55, 0.3] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
        className="absolute top-1/3 -left-20 w-64 h-64 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(236,72,153,0.45) 0%, transparent 70%)' }}
      />
      <motion.div
        animate={{ scale: [1, 1.1, 1], opacity: [0.25, 0.5, 0.25] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
        className="absolute -bottom-16 right-1/4 w-72 h-72 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(168,85,247,0.4) 0%, transparent 70%)' }}
      />

      {/* Floating sparkles decoration */}
      <motion.div
        animate={{ y: [0, -8, 0], rotate: [0, 12, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-8 right-8 sm:top-10 sm:right-12 z-10 pointer-events-none"
      >
        <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-300 drop-shadow-[0_0_8px_rgba(253,224,71,0.8)]" />
      </motion.div>
      <motion.div
        animate={{ y: [0, -6, 0], rotate: [0, -15, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        className="absolute top-20 right-20 sm:top-24 sm:right-32 z-10 pointer-events-none"
      >
        <Star className="w-3 h-3 sm:w-4 sm:h-4 text-pink-300 fill-pink-300 drop-shadow-[0_0_6px_rgba(249,168,212,0.8)]" />
      </motion.div>
      <motion.div
        animate={{ y: [0, -10, 0], rotate: [0, 8, 0] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
        className="absolute top-32 right-10 sm:top-40 sm:right-20 z-10 pointer-events-none"
      >
        <Heart className="w-3 h-3 sm:w-4 sm:h-4 text-rose-300 fill-rose-300 drop-shadow-[0_0_6px_rgba(253,164,175,0.8)]" />
      </motion.div>
      <motion.div
        animate={{ y: [0, -7, 0], rotate: [0, -10, 0] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        className="absolute bottom-24 right-6 sm:bottom-32 sm:right-16 z-10 pointer-events-none"
      >
        <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-300 drop-shadow-[0_0_6px_rgba(103,232,249,0.8)]" />
      </motion.div>

      {/* Top-left: Avatar + nama + tier chip */}
      <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-20">
        <div className="flex items-center gap-3">
          {/* Avatar dengan gradient ring berkilau */}
          <div className="relative flex-shrink-0">
            {/* Animated gradient ring */}
            {isPremium && (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                className="absolute -inset-1 rounded-full opacity-90"
                style={{
                  background: 'conic-gradient(from 0deg, #fbbf24, #f472b6, #a78bfa, #67e8f9, #fbbf24)',
                }}
              />
            )}
            <div className="relative">
              {avatarUrl && avatarUrl.includes('http') ? (
                <img
                  src={avatarUrl}
                  alt="Avatar"
                  className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover ring-2 ring-white/60 shadow-2xl"
                />
              ) : (
                <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-cyan-300 via-purple-400 to-pink-400 ring-2 ring-white/60 shadow-2xl flex items-center justify-center text-2xl text-white font-black">
                  {(user?.full_name || 'U').charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={onEditAvatar}
              disabled={saving}
              aria-label="Tukar gambar profil"
              className="absolute -bottom-0.5 -right-0.5 w-7 h-7 bg-gradient-to-br from-orange-400 to-pink-500 rounded-full flex items-center justify-center cursor-pointer shadow-xl shadow-orange-500/50 hover:scale-110 transition-transform ring-2 ring-white/80 z-10"
            >
              {saving ? <Loader className="w-3 h-3 text-white animate-spin" /> : <Pencil className="w-3 h-3 text-white" />}
            </button>
          </div>

          {/* Name + tier chip */}
          <div className="flex flex-col items-start gap-1.5">
            <p className="text-white font-black text-sm sm:text-base drop-shadow-lg truncate max-w-[200px] sm:max-w-none">
              {user?.full_name || 'Pengguna'}
            </p>
            <div
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full border shadow-md shadow-black/20"
              style={{
                background: isPremium
                  ? 'linear-gradient(135deg, rgba(251,191,36,0.35), rgba(236,72,153,0.35))'
                  : 'rgba(255,255,255,0.18)',
                borderColor: isPremium ? 'rgba(253,224,71,0.5)' : 'rgba(255,255,255,0.3)',
                backdropFilter: 'blur(14px)',
                WebkitBackdropFilter: 'blur(14px)',
              }}
            >
              {isFree ? (
                <Sparkles className="w-3 h-3 text-white flex-shrink-0" />
              ) : (
                <Crown className="w-3 h-3 text-yellow-300 flex-shrink-0 drop-shadow-[0_0_4px_rgba(253,224,71,0.8)]" />
              )}
              <span className="text-white font-black text-[10px] drop-shadow leading-none">{tierLabel}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom-left: tagline + title (animated) */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="absolute inset-0 z-10 flex flex-col justify-end p-5 sm:p-8 md:p-10 max-w-2xl"
      >
        <div className="flex items-center gap-2 mb-2">
          <div className="h-0.5 w-6 bg-[#D4FF3D] rounded-full" />
          <p className="text-[#D4FF3D] font-black text-[10px] sm:text-xs tracking-[0.2em] drop-shadow-lg">
            TETAPAN AKAUN
          </p>
        </div>
        <h1 className="text-white font-black text-2xl sm:text-4xl md:text-5xl leading-tight mb-2 drop-shadow-2xl">
          Profil Saya
          <motion.span
            animate={{ rotate: [0, 14, -8, 14, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            className="inline-block ml-2"
          >
            ✨
          </motion.span>
        </h1>
        <p className="text-white/85 text-xs sm:text-sm font-bold drop-shadow-md truncate">
          {user?.email}
        </p>
      </motion.div>
    </div>
  );
}