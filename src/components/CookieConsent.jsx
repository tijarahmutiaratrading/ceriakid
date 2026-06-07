import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

const CONSENT_KEY = 'cookie_consent_accepted';

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const accepted = localStorage.getItem(CONSENT_KEY);
    if (!accepted) {
      // Delay supaya tidak terganggu first paint
      const timer = setTimeout(() => setVisible(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const accept = () => {
    localStorage.setItem(CONSENT_KEY, '1');
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 320, damping: 30 }}
          className="fixed bottom-0 left-0 right-0 z-[200] p-3 sm:p-4"
          style={{ pointerEvents: 'none' }}
        >
          <div
            className="max-w-2xl mx-auto rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 shadow-2xl"
            style={{
              background: 'rgba(15,10,30,0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.12)',
              pointerEvents: 'auto',
            }}
          >
            <div className="flex-1 min-w-0">
              <p className="text-white font-black text-sm mb-0.5">🍪 Kami guna cookies</p>
              <p className="text-white/65 text-xs leading-snug">
                CeriaKid menggunakan cookies dan Facebook Pixel untuk meningkatkan pengalaman anda dan analisis penggunaan, selaras dengan{' '}
                <Link to="/privacy" className="text-purple-300 underline hover:text-white">Dasar Privasi</Link>{' '}
                kami (PDPA Malaysia).
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={accept}
                className="px-5 py-2 rounded-full bg-purple-500 hover:bg-purple-400 text-white font-black text-sm transition-colors shadow-lg"
              >
                Faham & Setuju
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}