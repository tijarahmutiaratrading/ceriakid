import React from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';

/**
 * Mobile-only FAB — sticky bottom-right.
 * Tujuan: quick action button untuk page panjang (Tambah anak, dll).
 */
export default function FloatingActionButton({
  onClick,
  label = 'Tambah',
  icon: Icon = Plus,
  show = true,
}) {
  if (!show) return null;

  return (
    <motion.button
      type="button"
      onClick={onClick}
      initial={{ opacity: 0, scale: 0.6, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.6 }}
      transition={{ type: 'spring', damping: 18, stiffness: 220 }}
      whileTap={{ scale: 0.92 }}
      aria-label={label}
      className="sm:hidden fixed bottom-6 right-4 z-50 flex items-center gap-2 pl-4 pr-5 py-3 rounded-full text-white font-black text-sm bg-slate-900 hover:bg-slate-800 shadow-xl shadow-slate-900/30 ring-1 ring-slate-700/50 transition-colors"
    >
      <Icon className="w-4 h-4" strokeWidth={2.5} />
      <span>{label}</span>
    </motion.button>
  );
}