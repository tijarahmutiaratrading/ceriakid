import React from 'react';
import { motion } from 'framer-motion';

export default function BBMEmptyState({ onReset }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="rounded-3xl p-10 text-center"
      style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.3)' }}
    >
      <p className="text-5xl mb-3">🔍</p>
      <p className="text-white font-black text-lg mb-2">Tiada BBM Dijumpai</p>
      <p className="text-white/60 text-sm mb-5">Cuba tukar penapis atau carian anda</p>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onReset}
        className="px-6 py-2.5 bg-white text-purple-600 rounded-full font-black text-sm shadow-lg"
      >
        Reset Penapis
      </motion.button>
    </motion.div>
  );
}