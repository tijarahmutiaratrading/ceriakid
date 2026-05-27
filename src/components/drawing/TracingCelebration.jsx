import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Full-screen celebration overlay shown when a child completes a tracing exercise.
// Big star count + animated bounce + replay/next CTAs.
export default function TracingCelebration({ open, accuracy, shapeLabel, onReplay, onNext, onClose }) {
  if (!open) return null;
  const stars = accuracy >= 90 ? 3 : accuracy >= 75 ? 2 : accuracy >= 60 ? 1 : 0;
  const headline = accuracy >= 90 ? 'Sempurna! 🌟'
    : accuracy >= 75 ? 'Hebat sekali! ✨'
    : accuracy >= 60 ? 'Bagus! Cuba sekali lagi 💪'
    : 'Cuba sekali lagi ya! 💪';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[120] flex items-center justify-center p-4"
        style={{ background: 'radial-gradient(ellipse at center, rgba(124,58,237,0.55), rgba(0,0,0,0.7))' }}
      >
        <motion.div
          initial={{ scale: 0.6, rotate: -6, opacity: 0 }}
          animate={{ scale: 1, rotate: 0, opacity: 1 }}
          exit={{ scale: 0.7, opacity: 0 }}
          transition={{ type: 'spring', damping: 14, stiffness: 200 }}
          className="relative max-w-md w-full rounded-[2.5rem] bg-gradient-to-br from-yellow-300 via-pink-400 to-purple-500 p-1 shadow-2xl"
        >
          <div className="rounded-[2.3rem] bg-white p-6 sm:p-8 text-center">
            <p className="text-purple-500 text-xs font-black uppercase tracking-[0.25em] mb-1">Tracing siap</p>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-800">{shapeLabel}</h2>

            <div className="flex justify-center gap-2 my-5">
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  initial={{ scale: 0, rotate: -180, opacity: 0 }}
                  animate={{ scale: i < stars ? 1.1 : 0.7, rotate: 0, opacity: 1 }}
                  transition={{ delay: 0.25 + i * 0.15, type: 'spring', damping: 8, stiffness: 240 }}
                  className="text-5xl sm:text-6xl"
                  style={{ filter: i < stars ? 'drop-shadow(0 4px 14px rgba(250,204,21,0.7))' : 'grayscale(1) opacity(0.35)' }}
                >
                  ⭐
                </motion.span>
              ))}
            </div>

            <p className="text-xl sm:text-2xl font-black text-slate-800">{headline}</p>
            <p className="text-slate-500 font-bold text-sm mt-1">Ketepatan: <span className="text-purple-600">{accuracy}%</span></p>

            <div className="grid grid-cols-2 gap-3 mt-6">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={onReplay}
                className="py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-sm transition-colors"
              >
                🔁 Cuba Lagi
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={onNext}
                className="py-3 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-black text-sm shadow-lg"
              >
                ➡️ Seterusnya
              </motion.button>
            </div>

            <button
              onClick={onClose}
              className="mt-3 text-slate-400 hover:text-slate-600 text-xs font-bold underline"
            >
              Tutup
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}