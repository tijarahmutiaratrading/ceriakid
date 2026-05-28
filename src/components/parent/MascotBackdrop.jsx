import React from 'react';
import { motion } from 'framer-motion';

/**
 * Floating cartoon mascots & decorative emojis layered over the dark background.
 * Pure decoration — pointer-events disabled, low opacity for subtle vibe.
 */
export default function MascotBackdrop() {
  const items = [
    { emoji: '🦊', size: 'text-7xl md:text-8xl', top: '6%', left: '4%', delay: 0, dur: 7 },
    { emoji: '🐻', size: 'text-6xl md:text-7xl', top: '12%', right: '6%', delay: 1.2, dur: 8 },
    { emoji: '⭐', size: 'text-4xl md:text-5xl', top: '28%', left: '12%', delay: 0.6, dur: 5 },
    { emoji: '🚀', size: 'text-6xl md:text-7xl', top: '38%', right: '4%', delay: 2, dur: 9 },
    { emoji: '📚', size: 'text-5xl md:text-6xl', top: '50%', left: '3%', delay: 1.5, dur: 7 },
    { emoji: '🌙', size: 'text-5xl md:text-6xl', top: '60%', right: '10%', delay: 0.8, dur: 6 },
    { emoji: '🎨', size: 'text-5xl md:text-6xl', top: '72%', left: '8%', delay: 2.4, dur: 8 },
    { emoji: '🦄', size: 'text-6xl md:text-7xl', top: '82%', right: '5%', delay: 1, dur: 7 },
    { emoji: '✨', size: 'text-3xl md:text-4xl', top: '20%', left: '45%', delay: 0.3, dur: 4 },
    { emoji: '🌟', size: 'text-3xl md:text-4xl', top: '55%', left: '48%', delay: 1.8, dur: 5 },
    { emoji: '🪐', size: 'text-5xl md:text-6xl', top: '90%', left: '40%', delay: 2.2, dur: 8 },
  ];

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-[5] overflow-hidden">
      {items.map((item, i) => (
        <motion.div
          key={i}
          className={`absolute ${item.size} select-none drop-shadow-2xl`}
          style={{
            top: item.top,
            left: item.left,
            right: item.right,
            opacity: 0.28,
            filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.4))',
          }}
          animate={{
            y: [0, -18, 0],
            rotate: [0, 5, -5, 0],
          }}
          transition={{
            duration: item.dur,
            delay: item.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          {item.emoji}
        </motion.div>
      ))}
    </div>
  );
}