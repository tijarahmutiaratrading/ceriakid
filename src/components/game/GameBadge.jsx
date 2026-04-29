import React from 'react';
import { motion } from 'framer-motion';

const badgeConfigs = {
  new: { label: 'Baru', icon: '✨', color: 'from-purple-400 to-pink-500' },
  recommended: { label: 'Disarankan', icon: '⭐', color: 'from-yellow-400 to-orange-500' },
  challenge: { label: 'Cabaran Harian', icon: '🔥', color: 'from-red-400 to-orange-500' },
};

export default function GameBadge({ type }) {
  if (!type || !badgeConfigs[type]) return null;
  
  const config = badgeConfigs[type];

  return (
    <motion.span
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`inline-flex items-center gap-1 text-xs font-black px-2 py-1 rounded-full text-white bg-gradient-to-r ${config.color} shadow-md`}
    >
      {config.icon}
      {config.label}
    </motion.span>
  );
}