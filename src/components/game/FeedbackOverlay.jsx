import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

export default function FeedbackOverlay({ isCorrect, show, message, onDone }) {
  useEffect(() => {
    if (show && isCorrect) {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#f59e0b', '#ec4899', '#3b82f6', '#10b981', '#8b5cf6'],
      });
    }
  }, [show, isCorrect]);

  useEffect(() => {
    if (show) {
      const timer = setTimeout(onDone, isCorrect ? 1200 : 1000);
      return () => clearTimeout(timer);
    }
  }, [show, isCorrect, onDone]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0 }}
            transition={{ type: 'spring', damping: 12 }}
            className={`rounded-3xl p-8 text-center ${
              isCorrect
                ? 'bg-gradient-to-br from-green-100 to-emerald-200'
                : 'bg-gradient-to-br from-orange-100 to-amber-200'
            } clay`}
          >
            <div className="text-6xl mb-3">
              {isCorrect ? '🎉' : '🤔'}
            </div>
            <p className="text-2xl font-black">
              {message}
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}