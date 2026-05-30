import React from 'react';
import { motion } from 'framer-motion';

/**
 * Reusable empty state untuk pages yang tiada data lagi.
 * Encourage user buat action pertama dengan illustration + CTA.
 *
 * Props:
 * - icon: Lucide icon component (optional)
 * - emoji: emoji fallback (kalau tak guna icon)
 * - title: tajuk utama
 * - description: penerangan ringkas
 * - action: { label, onClick } untuk CTA button (optional)
 * - gradient: tailwind gradient untuk icon bg (default purple-pink)
 */
export default function EmptyState({
  icon: Icon,
  emoji,
  title,
  description,
  action,
  variant = 'playful', // 'playful' (kid zone) | 'clean' (parent zone)
  gradient = 'from-purple-100 to-pink-100',
  iconColor = 'text-purple-500',
}) {
  const isClean = variant === 'clean';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={isClean ? 'py-12 text-center px-4' : 'py-12 text-center px-4'}
    >
      <motion.div
        animate={isClean ? { y: [0, -4, 0] } : { y: [0, -8, 0] }}
        transition={{ duration: isClean ? 3 : 2.5, repeat: Infinity, ease: 'easeInOut' }}
        className={
          isClean
            ? 'w-16 h-16 mx-auto rounded-2xl bg-slate-900 flex items-center justify-center mb-4'
            : `w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-4 shadow-lg`
        }
      >
        {Icon ? (
          <Icon className={isClean ? 'w-8 h-8 text-white' : `w-10 h-10 ${iconColor}`} strokeWidth={2} />
        ) : (
          <span className={isClean ? 'text-3xl' : 'text-4xl'} aria-hidden="true">{emoji || '✨'}</span>
        )}
      </motion.div>
      <p className={isClean ? 'text-slate-900 font-black text-lg mb-2' : 'text-slate-800 font-black text-lg mb-2'}>
        {title}
      </p>
      {description && (
        <p className={isClean ? 'text-slate-500 text-sm font-semibold max-w-md mx-auto leading-relaxed' : 'text-slate-600 text-sm max-w-xs mx-auto leading-relaxed'}>
          {description}
        </p>
      )}
      {action && (
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={action.onClick}
          className={
            isClean
              ? 'mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-sm transition-colors'
              : 'mt-5 inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-black text-sm shadow-lg hover:from-purple-600 hover:to-pink-600 transition-all'
          }
        >
          {action.emoji && <span aria-hidden="true">{action.emoji}</span>}
          {action.label}
        </motion.button>
      )}
    </motion.div>
  );
}