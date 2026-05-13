import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function MiniFeedback({ feedback }) {
  return (
    <AnimatePresence>
      {feedback && (
        <motion.div
          initial={{ opacity: 0, scale: 0.75, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.85, y: -12 }}
          className="fixed inset-x-4 top-28 z-[80] mx-auto max-w-xs pointer-events-none"
        >
          <div className={`rounded-[2rem] px-5 py-4 text-center shadow-2xl border-4 border-white/70 ${feedback.type === 'correct' ? 'bg-emerald-400 text-white' : 'bg-rose-400 text-white'}`}>
            <p className="text-5xl mb-1">{feedback.type === 'correct' ? '🎉' : '💪'}</p>
            <p className="text-xl font-black">{feedback.type === 'correct' ? 'Betul!' : 'Cuba lagi!'}</p>
            <p className="text-xs font-bold text-white/85">{feedback.message}</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}