import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

/**
 * Sticky mobile CTA bar — appears after user scrolls past hero.
 * Always-visible "Pilih Pelan" button so parent never loses access to conversion point.
 */
export default function MobileStickyCTA({ onCTAClick }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show after 600px scroll (past hero), hide at very bottom (footer)
      const scrolled = window.scrollY;
      const nearBottom = window.innerHeight + scrolled >= document.body.offsetHeight - 200;
      setVisible(scrolled > 600 && !nearBottom);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 22, stiffness: 280 }}
          className="md:hidden fixed bottom-0 left-0 right-0 z-40 px-3 pb-3 pt-2 pointer-events-none"
          style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
        >
          <div
            className="pointer-events-auto max-w-md mx-auto flex items-center gap-2 p-2 rounded-2xl shadow-2xl"
            style={{
              background: 'rgba(15, 10, 30, 0.85)',
              backdropFilter: 'blur(20px) saturate(180%)',
              WebkitBackdropFilter: 'blur(20px) saturate(180%)',
              border: '1px solid rgba(255,255,255,0.15)',
              boxShadow: '0 -8px 30px rgba(0,0,0,0.4)',
            }}
          >
            <div className="flex-1 min-w-0 pl-2">
              <p className="text-[10px] font-bold text-amber-300 leading-none">DARI HANYA</p>
              <p className="text-white font-black text-base leading-tight">RM4.08/bulan</p>
            </div>
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={onCTAClick}
              className="flex items-center gap-1.5 px-5 py-3 rounded-xl font-black text-white text-sm shadow-lg flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #F97316, #EA580C)', boxShadow: '0 6px 20px rgba(234,88,12,0.5)' }}
            >
              Pilih Pelan <ArrowRight className="w-3.5 h-3.5" />
            </motion.button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}