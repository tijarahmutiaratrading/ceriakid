import React from 'react';
import { motion } from 'framer-motion';
import { Upload, Loader, Crown, Sparkles, AlertCircle } from 'lucide-react';

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
 * Settings hero — gaya Apple Fitness:
 * - Full-bleed image background
 * - Dark gradient overlay
 * - Avatar + nama + tier chip di bottom-left
 * - Upload avatar button
 */
export default function SettingsHero({ user, avatarUrl, userTier, saving, onAvatarUpload }) {
  const tier = userTier || 'free';
  const tierLabel = TIER_LABELS[tier] || 'Percuma';
  const isFree = tier === 'free';

  return (
    <div className="relative w-full rounded-[2rem] overflow-hidden shadow-2xl shadow-black/40 aspect-[4/5] sm:aspect-[16/8] md:aspect-[16/7] max-h-[420px] sm:max-h-[440px]">
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
            'linear-gradient(180deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.1) 30%, rgba(0,0,0,0.5) 65%, rgba(0,0,0,0.9) 100%)',
        }}
      />
      <div
        className="absolute inset-0 hidden sm:block"
        style={{
          background:
            'linear-gradient(90deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.55) 35%, rgba(0,0,0,0.15) 70%, rgba(0,0,0,0) 100%), linear-gradient(180deg, rgba(0,0,0,0) 50%, rgba(0,0,0,0.5) 100%)',
        }}
      />

      {/* Top-left tagline */}
      <div className="absolute top-5 left-5 sm:top-7 sm:left-8 z-10">
        <p className="text-[#D4FF3D] font-black text-[10px] sm:text-xs tracking-[0.2em] drop-shadow-lg">
          TETAPAN AKAUN
        </p>
      </div>

      {/* Content bottom-left */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="absolute inset-x-0 bottom-0 z-10 p-5 sm:p-8 md:p-10"
      >
        <div className="flex items-end gap-4">
          {/* Avatar with upload */}
          <div className="relative flex-shrink-0">
            {avatarUrl && avatarUrl.includes('http') ? (
              <img
                src={avatarUrl}
                alt="Avatar"
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover ring-4 ring-white/40 shadow-2xl"
              />
            ) : (
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white/30 ring-4 ring-white/40 shadow-2xl flex items-center justify-center text-5xl">
                🐱
              </div>
            )}
            <label className="absolute -bottom-1 -right-1 w-9 h-9 bg-orange-500 rounded-full flex items-center justify-center cursor-pointer shadow-lg hover:bg-orange-600 transition-colors ring-2 ring-black/40">
              <input type="file" accept="image/*" onChange={onAvatarUpload} disabled={saving} className="hidden" />
              {saving ? <Loader className="w-4 h-4 text-white animate-spin" /> : <Upload className="w-4 h-4 text-white" />}
            </label>
          </div>

          {/* Name + chip */}
          <div className="min-w-0 flex-1 pb-1">
            <h1 className="text-white font-black text-xl sm:text-3xl md:text-4xl leading-tight drop-shadow-2xl truncate">
              {user?.full_name || 'Pengguna'}
            </h1>
            <p className="text-white/80 text-xs sm:text-sm font-bold mt-1 drop-shadow-md truncate">
              {user?.email}
            </p>

            {/* Tier chip */}
            <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
              <div
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/30 shadow-md"
                style={{
                  background: 'rgba(255,255,255,0.18)',
                  backdropFilter: 'blur(14px)',
                  WebkitBackdropFilter: 'blur(14px)',
                }}
              >
                {isFree ? (
                  <Sparkles className="w-3.5 h-3.5 text-white" />
                ) : (
                  <Crown className="w-3.5 h-3.5 text-yellow-300" />
                )}
                <span className="text-white font-black text-xs drop-shadow">{tierLabel}</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}