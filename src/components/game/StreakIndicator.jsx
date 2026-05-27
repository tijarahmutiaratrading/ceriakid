import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame } from 'lucide-react';

export default function StreakIndicator({ streak = 0 }) {
  if (streak < 2) return null;

  const intensity = Math.min(streak / 10, 1);
  const color = streak >= 10 ? 'from-rose-500 to-orange-500'
    : streak >= 5 ? 'from-orange-500 to-amber-500'
    : 'from-amber-400 to-yellow-400';

  return (
    <AnimatePresence>
      <motion.div
        key={streak}
        initial={{ scale: 0, y: -10, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ type: 'spring', damping: 12, stiffness: 280 }}
        className={`fixed top-20 left-1/2 -translate-x-1/2 z-40 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r ${color} shadow-xl border-2 border-white/60`}
        style={{ boxShadow: `0 0 ${20 + intensity * 30}px hsla(35, 95%, 60%, ${0.4 + intensity * 0.4})` }}
      >
        <motion.div
          animate={{ rotate: [0, -10, 10, -5, 0], scale: [1, 1.15, 1] }}
          transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 0.3 }}
        >
          <Flame className="w-4 h-4 text-white drop-shadow" fill="white" />
        </motion.div>
        <span className="text-white font-black text-sm drop-shadow">
          {streak} berturut-turut!
        </span>
      </motion.div>
    </AnimatePresence>
  );
}