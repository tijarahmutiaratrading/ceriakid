import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw } from 'lucide-react';

/**
 * Pull-to-refresh wrapper untuk page lists.
 * Hanya aktif pada touch devices — desktop boleh F5.
 *
 * Usage:
 *   <PullToRefresh onRefresh={async () => await reloadData()}>
 *     {children}
 *   </PullToRefresh>
 */
const THRESHOLD = 70; // pixels untuk trigger refresh
const MAX_PULL = 120;

export default function PullToRefresh({ onRefresh, children, disabled = false }) {
  const [pullDistance, setPullDistance] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef(null);
  const containerRef = useRef(null);

  const handleTouchStart = useCallback((e) => {
    if (disabled || refreshing) return;
    // Hanya trigger kalau scrolled to top
    if (window.scrollY > 0) return;
    startY.current = e.touches[0].clientY;
  }, [disabled, refreshing]);

  const handleTouchMove = useCallback((e) => {
    if (disabled || refreshing || startY.current === null) return;
    if (window.scrollY > 0) {
      startY.current = null;
      setPullDistance(0);
      return;
    }
    const currentY = e.touches[0].clientY;
    const diff = currentY - startY.current;
    if (diff > 0) {
      // Dampen pull dengan resistance curve
      const damped = Math.min(MAX_PULL, diff * 0.5);
      setPullDistance(damped);
    }
  }, [disabled, refreshing]);

  const handleTouchEnd = useCallback(async () => {
    if (disabled || refreshing) return;
    startY.current = null;
    if (pullDistance >= THRESHOLD) {
      setRefreshing(true);
      setPullDistance(THRESHOLD);
      try {
        await onRefresh?.();
      } finally {
        setRefreshing(false);
        setPullDistance(0);
      }
    } else {
      setPullDistance(0);
    }
  }, [pullDistance, refreshing, onRefresh, disabled]);

  const progress = Math.min(1, pullDistance / THRESHOLD);

  return (
    <div
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{ touchAction: pullDistance > 0 ? 'none' : 'auto' }}
    >
      {/* Pull indicator */}
      <AnimatePresence>
        {(pullDistance > 0 || refreshing) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, y: pullDistance - 50 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.15 }}
            className="fixed top-0 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
          >
            <div
              className="w-12 h-12 rounded-full bg-white shadow-xl flex items-center justify-center"
              style={{ opacity: progress }}
            >
              <RefreshCw
                className={`w-5 h-5 text-purple-600 ${refreshing ? 'animate-spin' : ''}`}
                style={{ transform: refreshing ? undefined : `rotate(${progress * 360}deg)` }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        animate={{ y: pullDistance }}
        transition={{ type: 'spring', damping: 20, stiffness: 200 }}
      >
        {children}
      </motion.div>
    </div>
  );
}