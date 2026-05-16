import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Lock, X, Sparkles } from 'lucide-react';

export default function UpgradeLockModal({ open, onClose, gameTitle }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/75 backdrop-blur-md p-4"
        >
          <motion.div
            initial={{ scale: 0.9, y: 30 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 30 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-sm rounded-3xl bg-gradient-to-br from-purple-600 via-fuchsia-600 to-pink-600 p-6 shadow-2xl border border-white/30"
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="Tutup"
              className="absolute top-3 right-3 w-11 h-11 flex items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center">
              <div className="inline-flex w-20 h-20 items-center justify-center rounded-full bg-white/20 mb-4 shadow-inner">
                <Lock className="w-9 h-9 text-yellow-200" />
              </div>
              <h2 className="text-2xl font-black text-white mb-2 leading-tight">
                Permainan Premium 🔒
              </h2>
              {gameTitle && (
                <p className="text-white/90 text-sm font-bold mb-3 line-clamp-2">"{gameTitle}"</p>
              )}
              <p className="text-white/90 text-sm font-semibold mb-6 leading-relaxed">
                Naik taraf pelan untuk akses 100+ permainan KSPK & KSSR yang lengkap untuk anak anda.
              </p>

              <Link to="/#pricing" onClick={onClose}>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="w-full min-h-12 px-6 py-3 bg-yellow-300 text-purple-900 rounded-2xl font-black shadow-xl inline-flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-5 h-5" /> Lihat Pelan Sekarang
                </motion.button>
              </Link>

              <button
                type="button"
                onClick={onClose}
                className="mt-3 text-white/80 text-xs font-bold hover:text-white min-h-11 px-4"
              >
                Mungkin nanti
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}