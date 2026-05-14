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
          <div className={`relative overflow-hidden rounded-[2rem] px-5 py-4 text-center shadow-2xl border-4 border-white/75 ${feedback.type === 'correct' ? 'bg-gradient-to-br from-emerald-300 via-cyan-400 to-blue-500 text-white' : 'bg-gradient-to-br from-rose-300 via-pink-500 to-purple-600 text-white'}`}>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_15%,rgba(255,255,255,0.55),transparent_28%)]" />
            <div className="relative">
              <p className="text-5xl mb-1 drop-shadow-lg">{feedback.type === 'correct' ? '🏆' : '💫'}</p>
              <p className="text-xl font-black drop-shadow">{feedback.type === 'correct' ? 'Combo Betul!' : 'Cuba Power Move!'}</p>
              <p className="text-xs font-bold text-white/90">{feedback.message}</p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}