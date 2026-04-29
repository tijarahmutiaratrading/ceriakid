import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export default function AchievementBadges({ badges = [] }) {
  const [unlockedBadges, setUnlockedBadges] = useState(badges);
  const [visibleIndex, setVisibleIndex] = useState(0);

  useEffect(() => {
    if (badges.length > 0) {
      setUnlockedBadges(badges);
      setVisibleIndex(0);
    }
  }, [badges]);

  if (unlockedBadges.length === 0) return null;

  const currentBadge = unlockedBadges[visibleIndex];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        className="fixed inset-0 flex items-center justify-center z-50 bg-black/40"
        onClick={() => setVisibleIndex(Math.min(visibleIndex + 1, unlockedBadges.length - 1))}
      >
        <motion.div
          className="bg-white rounded-3xl p-8 max-w-sm shadow-2xl text-center relative"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => setVisibleIndex(Math.min(visibleIndex + 1, unlockedBadges.length - 1))}
            className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>

          <motion.div
            animate={{ rotate: [0, -10, 10, 0], scale: [1, 1.2, 1] }}
            transition={{ duration: 0.6 }}
            className="text-7xl mb-4"
          >
            {currentBadge.badgeEmoji}
          </motion.div>

          <h3 className="text-2xl font-black text-gray-900 mb-2">
            🎉 Tahniah! 🎉
          </h3>
          <p className="text-xl font-bold text-game-purple mb-1">
            {currentBadge.badgeName}
          </p>
          <p className="text-sm text-gray-600 mb-6">
            Badge baru sudah dibuka!
          </p>

          <div className="flex justify-center gap-1 mb-4">
            {unlockedBadges.map((_, i) => (
              <div
                key={i}
                className={`h-2 w-2 rounded-full ${
                  i === visibleIndex ? 'bg-game-purple' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setVisibleIndex(Math.min(visibleIndex + 1, unlockedBadges.length - 1))}
            className="w-full py-3 bg-game-orange text-white rounded-full font-black"
          >
            {visibleIndex < unlockedBadges.length - 1 ? 'Badge Seterusnya' : 'Tutup'}
          </motion.button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}