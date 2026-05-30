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
  gradient = 'from-purple-100 to-pink-100',
  iconColor = 'text-purple-500',
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="py-12 text-center px-4"
    >
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        className={`w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-4 shadow-lg`}
      >
        {Icon ? (
          <Icon className={`w-10 h-10 ${iconColor}`} strokeWidth={2.5} />
        ) : (
          <span className="text-4xl">{emoji || '✨'}</span>
        )}
      </motion.div>
      <p className="text-slate-800 font-black text-lg mb-2">{title}</p>
      {description && (
        <p className="text-slate-600 text-sm max-w-xs mx-auto leading-relaxed">{description}</p>
      )}
      {action && (
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          onClick={action.onClick}
          className="mt-5 inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-black text-sm shadow-lg hover:from-purple-600 hover:to-pink-600 transition-all"
        >
          {action.emoji && <span>{action.emoji}</span>}
          {action.label}
        </motion.button>
      )}
    </motion.div>
  );
}