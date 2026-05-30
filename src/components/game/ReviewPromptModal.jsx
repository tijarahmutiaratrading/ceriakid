import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, X, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

/**
 * App review prompt — appear selepas user dapat 5 perfect scores (3-star).
 * Track dalam localStorage supaya tak ganggu user yang dah respond.
 *
 * - Kalau pilih 4-5 star → arah ke Contact page untuk testimoni
 * - Kalau pilih 1-3 star → arah ke Contact page untuk feedback
 *
 * Usage:
 *   <ReviewPromptModal open={shouldShow} onClose={handleClose} />
 *
 * Trigger logic (parent handles):
 *   const perfectCount = parseInt(localStorage.getItem('perfect_scores_count') || '0');
 *   const dismissed = localStorage.getItem('review_prompt_dismissed');
 *   if (perfectCount >= 5 && !dismissed) showPrompt();
 */
export default function ReviewPromptModal({ open, onClose }) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);

  const handleClose = () => {
    localStorage.setItem('review_prompt_dismissed', '1');
    onClose?.();
  };

  const handleSubmit = () => {
    if (rating === 0) return;
    localStorage.setItem('review_prompt_dismissed', '1');
    localStorage.setItem('review_prompt_rating', String(rating));
    onClose?.();
    // Direct navigate ke contact page dengan rating sebagai context
    window.location.href = `/contact?rating=${rating}`;
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] bg-black/60 backdrop-blur-sm"
            onClick={handleClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            transition={{ type: 'spring', damping: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[301] w-[92%] max-w-md"
          >
            <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-white">
              <button
                type="button"
                onClick={handleClose}
                aria-label="Tutup tetingkap penilaian"
                className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="px-6 py-8 text-center">
                <motion.div
                  animate={{ scale: [1, 1.15, 1] }}
                  transition={{ duration: 0.8, repeat: Infinity, repeatDelay: 1.5 }}
                  className="inline-flex w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-500 items-center justify-center mb-4 shadow-xl"
                >
                  <Heart className="w-8 h-8 text-white fill-white" />
                </motion.div>

                <p className="text-pink-600 text-xs font-black uppercase tracking-widest mb-2">
                  Anak anda dah jadi juara! 🏆
                </p>
                <h2 className="text-slate-900 font-black text-2xl leading-tight mb-2">
                  Suka tak guna CeriaKid?
                </h2>
                <p className="text-slate-600 text-sm mb-6 leading-relaxed">
                  Maklum balas anda penting untuk kami tambah baik. Rate experience anda:
                </p>

                {/* Star rating */}
                <div className="flex justify-center gap-2 mb-6">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setRating(i)}
                      onMouseEnter={() => setHoverRating(i)}
                      onMouseLeave={() => setHoverRating(0)}
                      aria-label={`Beri ${i} bintang`}
                      className="p-1 transition-transform hover:scale-110 active:scale-95"
                    >
                      <Star
                        className={`w-10 h-10 transition-colors ${
                          i <= (hoverRating || rating)
                            ? 'fill-amber-400 text-amber-400 drop-shadow-md'
                            : 'text-slate-300'
                        }`}
                        strokeWidth={2}
                      />
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={rating === 0}
                  className={`w-full py-3.5 rounded-2xl font-black text-base shadow-xl transition-all ${
                    rating === 0
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-pink-500 to-rose-500 text-white hover:from-pink-600 hover:to-rose-600 shadow-pink-500/40'
                  }`}
                >
                  {rating === 0 ? '⭐ Pilih rating dulu' : rating >= 4 ? '💖 Hantar Maklum Balas' : '📝 Beritahu Kami'}
                </button>

                <button
                  type="button"
                  onClick={handleClose}
                  className="w-full mt-2 py-2 text-slate-500 hover:text-slate-700 text-sm font-bold"
                >
                  Nanti sahaja
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}