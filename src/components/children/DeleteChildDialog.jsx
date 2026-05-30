import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, X, AlertTriangle } from 'lucide-react';

/**
 * Custom confirm dialog untuk padam profil anak.
 * Lebih reliable dari window.confirm() yang kadang diblock di PWA / mobile browsers.
 */
export default function DeleteChildDialog({ open, child, onConfirm, onCancel }) {
  return (
    <AnimatePresence>
      {open && child && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onCancel}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 20, opacity: 0 }}
            transition={{ type: 'spring', damping: 22 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-3xl p-6 relative"
            style={{
              background: 'linear-gradient(135deg, #ffffff 0%, #fef9f3 100%)',
              boxShadow: '0 20px 50px rgba(0,0,0,0.25)',
            }}
          >
            <button
              type="button"
              onClick={onCancel}
              aria-label="Tutup"
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600"
            >
              <X className="w-4 h-4" strokeWidth={2.5} />
            </button>

            <div className="flex flex-col items-center text-center">
              <div
                className="w-16 h-16 rounded-3xl flex items-center justify-center mb-3"
                style={{ background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)', boxShadow: '0 4px 0 #fca5a5' }}
              >
                <AlertTriangle className="w-8 h-8 text-rose-600" strokeWidth={2.5} />
              </div>
              <h2 className="text-slate-800 font-black text-lg">Padam profil ini?</h2>
              <p className="text-slate-600 text-sm font-bold mt-2">
                Profil <span className="text-rose-600">"{child.name}"</span> akan dipadam.
              </p>
              <p className="text-slate-500 text-xs font-semibold mt-1">
                Progress pembelajaran kekal dalam sistem tetapi profil tidak akan kelihatan lagi.
              </p>
            </div>

            <div className="flex gap-3 mt-5">
              <motion.button
                type="button"
                whileTap={{ scale: 0.96, y: 2 }}
                onClick={onCancel}
                className="flex-1 rounded-full py-3 font-black text-sm text-slate-700"
                style={{ background: '#fef9f3', boxShadow: '0 3px 0 #fde68a' }}
              >
                Batal
              </motion.button>
              <motion.button
                type="button"
                whileTap={{ scale: 0.96, y: 2 }}
                onClick={onConfirm}
                className="flex-1 rounded-full py-3 font-black text-sm text-white flex items-center justify-center gap-1.5"
                style={{ background: 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)', boxShadow: '0 4px 0 #be123c' }}
              >
                <Trash2 className="w-4 h-4" strokeWidth={3} />
                Padam
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}