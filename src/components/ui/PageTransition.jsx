import React from 'react';
import { motion } from 'framer-motion';
import { useSafeLocation } from '@/hooks/useSafeLocation';

/**
 * Smooth fade transition antara routes — fix flash putih masa lazy-load.
 * Light (150ms) supaya feel snappy, tak laggy.
 * Respects prefers-reduced-motion automatically via framer-motion.
 */
export default function PageTransition({ children }) {
  const location = useSafeLocation();
  return (
    <motion.div
      key={location.pathname}
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}