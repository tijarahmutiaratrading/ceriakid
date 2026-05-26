import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Flame } from 'lucide-react';

/**
 * Top-of-page urgency banner. Dismissible. Sticks for the session.
 * Creates mild social proof + urgency without being spammy.
 */
export default function UrgencyBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const dismissed = sessionStorage.getItem('urgency_dismissed');
    if (!dismissed) setVisible(true);
  }, []);

  const dismiss = () => {
    sessionStorage.setItem('urgency_dismissed', '1');
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="relative z-30 overflow-hidden"
          style={{ background: 'linear-gradient(90deg, #DC2626, #EA580C, #DC2626)' }}
        >
          <div className="px-4 py-2 flex items-center justify-center gap-2 text-white text-xs sm:text-sm font-black text-center">
            <Flame className="w-4 h-4 flex-shrink-0 animate-pulse" />
            <span>🎉 <span className="hidden sm:inline">Promosi Pelancaran — </span>200+ keluarga dah daftar minggu ni. Jom sertai!</span>
            <button onClick={dismiss} className="ml-2 p-1 hover:bg-white/20 rounded-full flex-shrink-0 transition-colors" aria-label="Tutup">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}