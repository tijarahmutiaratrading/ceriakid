import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame } from 'lucide-react';

export default function StreakIndicator({ streak = 0 }) {
  if (streak < 2) return null;

  const intensity = Math.min(streak / 10, 1);

  return (
    <AnimatePresence>
      <motion.div
        key={streak}
        initial={{ scale: 0, y: -10, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ type: 'spring', damping: 12, stiffness: 280 }}
        className="fixed left-1/2 -translate-x-1/2 z-[60] inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full brand-gradient shadow-xl border-2 border-white/60 pointer-events-none"
        style={{
          top: 'calc(env(safe-area-inset-top) + 4.5rem)',
          boxShadow: `0 0 ${20 + intensity * 30}px hsla(35, 95%, 60%, ${0.4 + intensity * 0.4})`,
        }}
      >
        <motion.div
          animate={{ rotate: [0, -10, 10, -5, 0], scale: [1, 1.15, 1] }}
          transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 0.3 }}
        >
          <Flame className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white drop-shadow" fill="white" />
        </motion.div>
        <span className="text-white font-black text-xs sm:text-sm drop-shadow whitespace-nowrap">
          {streak} berturut-turut!
        </span>
      </motion.div>
    </AnimatePresence>
  );
}