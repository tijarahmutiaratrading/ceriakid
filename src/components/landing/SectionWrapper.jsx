import React from 'react';
import { motion } from 'framer-motion';

/**
 * Section wrapper with multiple visual variants for visual rhythm across the landing page.
 * Each variant has its own mood while staying cohesive.
 */
const VARIANTS = {
  // Deep dark — hero-like
  dark: {
    bg: 'bg-gradient-to-br from-indigo-950 via-purple-900 to-slate-950',
    blobs: (
      <>
        <div className="absolute top-10 -left-32 w-96 h-96 rounded-full bg-pink-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 -right-32 w-96 h-96 rounded-full bg-orange-500/10 blur-3xl pointer-events-none" />
      </>
    ),
    badgeBg: 'bg-white/10 border-white/20',
    badgeText: 'text-white/90',
    title: 'text-white',
    accent: 'bg-gradient-to-r from-orange-300 via-pink-300 to-yellow-300 bg-clip-text text-transparent',
    subtitle: 'text-white/70',
  },

  // ALARM / problem section — warm red/orange tones
  alarm: {
    bg: 'bg-gradient-to-br from-rose-950 via-red-900 to-orange-950',
    blobs: (
      <>
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-red-500/15 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full bg-orange-500/15 blur-3xl pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(239,68,68,0.08),transparent_70%)]" />
      </>
    ),
    badgeBg: 'bg-red-500/15 border-red-300/30',
    badgeText: 'text-red-100',
    title: 'text-white',
    accent: 'bg-gradient-to-r from-yellow-200 via-orange-300 to-red-300 bg-clip-text text-transparent',
    subtitle: 'text-rose-100/75',
  },

  // SOLUTION — bright optimistic teal/emerald
  bright: {
    bg: 'bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50',
    blobs: (
      <>
        <div className="absolute top-10 -left-20 w-80 h-80 rounded-full bg-emerald-300/30 blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 -right-20 w-80 h-80 rounded-full bg-cyan-300/30 blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 right-1/3 w-64 h-64 rounded-full bg-yellow-200/40 blur-3xl pointer-events-none" />
      </>
    ),
    badgeBg: 'bg-emerald-500/10 border-emerald-400/30',
    badgeText: 'text-emerald-700',
    title: 'text-slate-900',
    accent: 'bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-600 bg-clip-text text-transparent',
    subtitle: 'text-slate-600',
  },

  // CREAM warm — like a friendly notebook
  cream: {
    bg: 'bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50',
    blobs: (
      <>
        <div className="absolute top-10 -left-20 w-80 h-80 rounded-full bg-orange-300/30 blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 -right-20 w-80 h-80 rounded-full bg-yellow-300/30 blur-3xl pointer-events-none" />
        <div className="absolute top-0 left-1/2 w-px h-full bg-gradient-to-b from-transparent via-orange-200/30 to-transparent pointer-events-none" />
      </>
    ),
    badgeBg: 'bg-orange-500/10 border-orange-400/30',
    badgeText: 'text-orange-700',
    title: 'text-slate-900',
    accent: 'bg-gradient-to-r from-orange-600 via-pink-500 to-red-500 bg-clip-text text-transparent',
    subtitle: 'text-slate-600',
  },

  // VIBRANT purple/pink — fun & playful
  vibrant: {
    bg: 'bg-gradient-to-br from-fuchsia-900 via-purple-800 to-indigo-900',
    blobs: (
      <>
        <div className="absolute top-10 left-10 w-80 h-80 rounded-full bg-pink-400/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-80 h-80 rounded-full bg-violet-400/20 blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-fuchsia-500/10 blur-3xl pointer-events-none" />
      </>
    ),
    badgeBg: 'bg-white/15 border-white/25',
    badgeText: 'text-white',
    title: 'text-white',
    accent: 'bg-gradient-to-r from-yellow-200 via-pink-200 to-violet-200 bg-clip-text text-transparent',
    subtitle: 'text-white/75',
  },

  // SOFT sky — calm & trustworthy
  sky: {
    bg: 'bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50',
    blobs: (
      <>
        <div className="absolute top-10 -left-20 w-80 h-80 rounded-full bg-sky-300/30 blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 -right-20 w-80 h-80 rounded-full bg-indigo-300/30 blur-3xl pointer-events-none" />
      </>
    ),
    badgeBg: 'bg-blue-500/10 border-blue-400/30',
    badgeText: 'text-blue-700',
    title: 'text-slate-900',
    accent: 'bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 bg-clip-text text-transparent',
    subtitle: 'text-slate-600',
  },

  // MIDNIGHT — premium pricing feel
  midnight: {
    bg: 'bg-gradient-to-b from-slate-950 via-indigo-950 to-slate-950',
    blobs: (
      <>
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-purple-500/15 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full bg-indigo-500/15 blur-3xl pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(168,85,247,0.1),transparent_60%)]" />
      </>
    ),
    badgeBg: 'bg-yellow-400/10 border-yellow-300/30',
    badgeText: 'text-yellow-200',
    title: 'text-white',
    accent: 'bg-gradient-to-r from-yellow-300 via-amber-300 to-yellow-200 bg-clip-text text-transparent',
    subtitle: 'text-white/70',
  },
};

export default function SectionWrapper({
  id,
  badge,
  badgeIcon = '✨',
  title,
  titleAccent,
  subtitle,
  children,
  variant = 'dark',
  className = '',
}) {
  const v = VARIANTS[variant] || VARIANTS.dark;

  return (
    <section id={id} className={`relative overflow-hidden py-16 md:py-24 px-5 sm:px-8 ${v.bg} ${className}`}>
      {v.blobs}

      <div className="relative z-10 max-w-6xl mx-auto">
        {(badge || title) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12 md:mb-14"
          >
            {badge && (
              <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border backdrop-blur-md mb-5 ${v.badgeBg}`}>
                <span>{badgeIcon}</span>
                <span className={`text-xs sm:text-sm font-bold ${v.badgeText}`}>{badge}</span>
              </div>
            )}
            {title && (
              <h2 className={`text-3xl sm:text-4xl md:text-5xl font-black leading-[1.1] tracking-tight mb-4 ${v.title}`}>
                {title}{' '}
                {titleAccent && <span className={v.accent}>{titleAccent}</span>}
              </h2>
            )}
            {subtitle && (
              <p className={`text-base sm:text-lg max-w-2xl mx-auto leading-relaxed ${v.subtitle}`}>{subtitle}</p>
            )}
          </motion.div>
        )}

        {children}
      </div>
    </section>
  );
}