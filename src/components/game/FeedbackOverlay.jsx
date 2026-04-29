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
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
        >
          <motion.div
            initial={isCorrect ? { scale: 0, rotate: -20, y: 50 } : { scale: 0.5, rotate: 10, y: -20 }}
            animate={{ scale: 1, rotate: 0, y: 0 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={isCorrect ? { type: 'spring', damping: 10, mass: 0.8, stiffness: 200 } : { type: 'spring', damping: 15, stiffness: 150 }}
            className={`rounded-3xl p-8 text-center shadow-2xl ${
              isCorrect
                ? 'bg-gradient-to-br from-green-100 via-emerald-100 to-teal-100 border-2 border-green-400'
                : 'bg-gradient-to-br from-orange-100 via-amber-100 to-rose-100 border-2 border-orange-400'
            }`}
          >
            {/* Emoji with bounce animation */}
            <motion.div
              animate={isCorrect ? { y: [0, -15, 0] } : { rotate: [0, -5, 5, 0] }}
              transition={isCorrect ? { duration: 0.6, delay: 0.2 } : { duration: 0.5, delay: 0.2 }}
              className="text-7xl mb-4"
            >
              {isCorrect ? '🎉' : '💪'}
            </motion.div>

            {/* Message with fade-in */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              className={`text-3xl font-black ${isCorrect ? 'text-green-700' : 'text-orange-700'}`}
            >
              {message}
            </motion.p>

            {/* Correct answer bonus stars */}
            {isCorrect && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="flex justify-center gap-2 mt-4"
              >
                {[1, 2, 3].map((i) => (
                  <motion.span
                    key={i}
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.6 + i * 0.1, type: 'spring', damping: 10 }}
                    className="text-3xl"
                  >
                    ⭐
                  </motion.span>
                ))}
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}