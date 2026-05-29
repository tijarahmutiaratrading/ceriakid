import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Gift } from 'lucide-react';
import { trackPixelEvent } from '@/lib/pixel';
import { genEventID } from '@/lib/fbTracking';

// Exit-intent popup — detect mouse leave window OR mobile back gesture.
// Hanya tunjuk SEKALI per session.
export default function ExitIntentPopup({ onCTA }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem('exit_intent_shown')) return;

    // Disable on touch devices (tablet/phone) — iOS/Android simulate fake mouseleave
    // events during momentum scrolling which causes the popup (and its scrollToPricing
    // CTA) to auto-trigger and jump the page back to top.
    const isTouchDevice = (
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0 ||
      window.matchMedia('(hover: none)').matches
    );
    if (isTouchDevice) return;

    let timer;
    const handleMouseLeave = (e) => {
      // Hanya trigger kalau mouse keluar dari TOP window (cursor menuju ke close/URL bar)
      if (e.clientY <= 0 && !sessionStorage.getItem('exit_intent_shown')) {
        sessionStorage.setItem('exit_intent_shown', '1');
        setShow(true);
        trackPixelEvent('ViewContent', { content_name: 'exit_intent_popup' }, genEventID('ViewContent'));
      }
    };

    // Tunggu 15 saat sebelum aktifkan supaya tak terlalu agresif
    timer = setTimeout(() => {
      document.addEventListener('mouseleave', handleMouseLeave);
    }, 15000);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  const handleClaim = () => {
    setShow(false);
    onCTA?.();
  };

  return (
    <AnimatePresence>
      {show && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShow(false)}
            className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            transition={{ type: 'spring', damping: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[201] w-[92%] max-w-md"
          >
            <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500">
              <button
                type="button"
                onClick={() => setShow(false)}
                className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="px-6 py-8 text-center">
                <motion.div
                  animate={{ rotate: [0, -10, 10, -10, 0] }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="inline-flex w-16 h-16 rounded-2xl bg-yellow-300 items-center justify-center mb-4 shadow-lg"
                >
                  <Gift className="w-9 h-9 text-purple-900" />
                </motion.div>
                <p className="text-yellow-300 text-xs font-black uppercase tracking-widest mb-2">Tunggu! Jangan pergi dulu</p>
                <h2 className="text-white font-black text-2xl leading-tight mb-3">
                  Cuba <span className="bg-yellow-300 text-purple-900 px-2 rounded-lg">50 kredit AI PERCUMA</span>
                </h2>
                <p className="text-white/90 text-sm mb-5 leading-relaxed">
                  Langgan pelan <strong>Keluarga</strong> sekarang & dapat Cikgu AI percuma. Bayar sekali, guna setahun penuh!
                </p>
                <button
                  type="button"
                  onClick={handleClaim}
                  className="w-full py-3.5 rounded-2xl bg-yellow-300 hover:bg-yellow-200 text-purple-900 font-black text-base shadow-xl shadow-yellow-500/40 transition-all"
                >
                  🎁 Tuntut Bonus Sekarang
                </button>
                <p className="text-white/70 text-xs mt-3">✓ Setup 2 minit  •  ✓ Tanpa iklan  •  ✓ Boleh offline</p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}