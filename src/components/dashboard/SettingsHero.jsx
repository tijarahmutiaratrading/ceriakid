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

      {/* Top-left: Avatar + nama + tier chip (sama macam hero dashboard) */}
      <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-20">
        <div className="flex items-center gap-3">
          {/* Avatar with upload */}
          <div className="relative flex-shrink-0">
            {avatarUrl && avatarUrl.includes('http') ? (
              <img
                src={avatarUrl}
                alt="Avatar"
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover ring-2 ring-white/40 shadow-xl"
              />
            ) : (
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-cyan-300 to-purple-400 ring-2 ring-white/40 shadow-xl flex items-center justify-center text-2xl text-white font-black">
                {(user?.full_name || 'U').charAt(0).toUpperCase()}
              </div>
            )}
            <label className="absolute -bottom-0.5 -right-0.5 w-7 h-7 bg-orange-500 rounded-full flex items-center justify-center cursor-pointer shadow-lg hover:bg-orange-600 transition-colors ring-2 ring-black/40">
              <input type="file" accept="image/*" onChange={onAvatarUpload} disabled={saving} className="hidden" />
              {saving ? <Loader className="w-3 h-3 text-white animate-spin" /> : <Upload className="w-3 h-3 text-white" />}
            </label>
          </div>

          {/* Name + tier chip */}
          <div className="flex flex-col items-start gap-1.5">
            <p className="text-white font-black text-sm sm:text-base drop-shadow-lg truncate max-w-[200px] sm:max-w-none">
              {user?.full_name || 'Pengguna'}
            </p>
            <div
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full border border-white/30 shadow-md shadow-black/5"
              style={{
                background: 'rgba(255,255,255,0.18)',
                backdropFilter: 'blur(14px)',
                WebkitBackdropFilter: 'blur(14px)',
              }}
            >
              {isFree ? (
                <Sparkles className="w-3 h-3 text-white flex-shrink-0" />
              ) : (
                <Crown className="w-3 h-3 text-yellow-300 flex-shrink-0" />
              )}
              <span className="text-white font-black text-[10px] drop-shadow leading-none">{tierLabel}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom-left: tagline + title */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="absolute inset-0 z-10 flex flex-col justify-end p-5 sm:p-8 md:p-10 max-w-2xl"
      >
        <p className="text-[#D4FF3D] font-black text-[10px] sm:text-xs tracking-[0.2em] mb-2 drop-shadow-lg">
          TETAPAN AKAUN
        </p>
        <h1 className="text-white font-black text-2xl sm:text-4xl md:text-5xl leading-tight mb-2 drop-shadow-2xl">
          Profil Saya
        </h1>
        <p className="text-white/80 text-xs sm:text-sm font-bold drop-shadow-md truncate">
          {user?.email}
        </p>
      </motion.div>
    </div>
  );
}