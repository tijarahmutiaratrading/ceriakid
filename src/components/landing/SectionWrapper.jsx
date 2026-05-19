import React from 'react';
import { motion } from 'framer-motion';

/**
 * Consistent dark-gradient section wrapper to match hero design language.
 * Provides glow blobs, badge, gradient headline, and subtitle.
 */
export default function SectionWrapper({
  id,
  badge,
  badgeIcon = '✨',
  title,
  titleAccent,
  subtitle,
  children,
  variant = 'dark', // 'dark' | 'darker'
  className = '',
}) {
  const bgClass = variant === 'darker'
    ? 'bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950'
    : 'bg-gradient-to-br from-indigo-950 via-purple-900 to-slate-950';

  return (
    <section id={id} className={`relative overflow-hidden py-16 md:py-24 px-5 sm:px-8 ${bgClass} ${className}`}>
      {/* Decorative glow blobs */}
      <div className="absolute top-10 -left-32 w-96 h-96 rounded-full bg-pink-500/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 -right-32 w-96 h-96 rounded-full bg-orange-500/10 blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-purple-500/5 blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto">
        {(badge || title) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12 md:mb-14"
          >
            {badge && (
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-md mb-5">
                <span>{badgeIcon}</span>
                <span className="text-white/90 text-xs sm:text-sm font-bold">{badge}</span>
              </div>
            )}
            {title && (
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black leading-[1.1] text-white tracking-tight mb-4">
                {title}{' '}
                {titleAccent && (
                  <span className="bg-gradient-to-r from-orange-300 via-pink-300 to-yellow-300 bg-clip-text text-transparent">
                    {titleAccent}
                  </span>
                )}
              </h2>
            )}
            {subtitle && (
              <p className="text-base sm:text-lg text-white/70 max-w-2xl mx-auto leading-relaxed">{subtitle}</p>
            )}
          </motion.div>
        )}

        {children}
      </div>
    </section>
  );
}