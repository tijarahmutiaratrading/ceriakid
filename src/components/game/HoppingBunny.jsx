import React from 'react';
import { motion } from 'framer-motion';

// Cute SVG bunny — hops across the screen
function BunnySVG({ size = 80 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none">
      {/* Shadow under bunny */}
      <ellipse cx="60" cy="108" rx="22" ry="4" fill="rgba(0,0,0,0.25)" />

      {/* Body */}
      <ellipse cx="60" cy="78" rx="28" ry="24" fill="#FCE7F3" stroke="#F9A8D4" strokeWidth="2" />

      {/* Belly */}
      <ellipse cx="60" cy="84" rx="18" ry="14" fill="#FFFFFF" />

      {/* Head */}
      <ellipse cx="60" cy="50" rx="22" ry="20" fill="#FCE7F3" stroke="#F9A8D4" strokeWidth="2" />

      {/* Left ear */}
      <ellipse cx="48" cy="22" rx="6" ry="18" fill="#FCE7F3" stroke="#F9A8D4" strokeWidth="2" transform="rotate(-12 48 22)" />
      <ellipse cx="48" cy="24" rx="3" ry="12" fill="#FBCFE8" transform="rotate(-12 48 24)" />

      {/* Right ear */}
      <ellipse cx="72" cy="22" rx="6" ry="18" fill="#FCE7F3" stroke="#F9A8D4" strokeWidth="2" transform="rotate(12 72 22)" />
      <ellipse cx="72" cy="24" rx="3" ry="12" fill="#FBCFE8" transform="rotate(12 72 24)" />

      {/* Eyes */}
      <ellipse cx="52" cy="50" rx="3" ry="4" fill="#1F2937" />
      <ellipse cx="68" cy="50" rx="3" ry="4" fill="#1F2937" />
      <circle cx="53" cy="48.5" r="1" fill="#FFFFFF" />
      <circle cx="69" cy="48.5" r="1" fill="#FFFFFF" />

      {/* Cheeks */}
      <circle cx="46" cy="58" r="3" fill="#FBA5C5" opacity="0.6" />
      <circle cx="74" cy="58" r="3" fill="#FBA5C5" opacity="0.6" />

      {/* Nose */}
      <path d="M58 56 Q60 58 62 56 Q60 60 58 56" fill="#F87171" />

      {/* Mouth */}
      <path d="M56 62 Q60 65 64 62" stroke="#1F2937" strokeWidth="1.5" fill="none" strokeLinecap="round" />

      {/* Feet */}
      <ellipse cx="48" cy="100" rx="8" ry="5" fill="#FBCFE8" stroke="#F9A8D4" strokeWidth="1.5" />
      <ellipse cx="72" cy="100" rx="8" ry="5" fill="#FBCFE8" stroke="#F9A8D4" strokeWidth="1.5" />
    </svg>
  );
}

// Single hopping bunny that moves across the screen
function HoppingBunny({ startX = '5%', endX = '95%', y = '70%', delay = 0, duration = 8, size = 60, flip = false }) {
  return (
    <motion.div
      className="fixed pointer-events-none"
      style={{ top: y, zIndex: 1 }}
      initial={{ left: startX, opacity: 0 }}
      animate={{
        left: [startX, endX, endX],
        opacity: [0, 1, 1, 0],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        repeatDelay: 3,
        times: [0, 0.1, 0.9, 1],
        ease: 'linear',
      }}
    >
      {/* Vertical hop bounce */}
      <motion.div
        animate={{ y: [0, -40, 0, -25, 0, -40, 0, -25, 0] }}
        transition={{
          duration,
          delay,
          repeat: Infinity,
          repeatDelay: 3,
          ease: 'easeInOut',
        }}
        style={{ transform: flip ? 'scaleX(-1)' : 'none' }}
      >
        <BunnySVG size={size} />
      </motion.div>
    </motion.div>
  );
}

// Stationary bunny that just hops in place
function IdleBunny({ left, top, delay = 0, size = 50 }) {
  return (
    <motion.div
      className="fixed pointer-events-none"
      style={{ left, top, zIndex: 1 }}
      animate={{ y: [0, -20, 0] }}
      transition={{ duration: 1.6, delay, repeat: Infinity, ease: 'easeInOut' }}
    >
      <BunnySVG size={size} />
    </motion.div>
  );
}

export default function HoppingBunnies() {
  return (
    <>
      {/* Hopping bunnies crossing screen */}
      <HoppingBunny startX="-10%" endX="110%" y="62%" delay={0} duration={10} size={70} />
      <HoppingBunny startX="110%" endX="-10%" y="78%" delay={4} duration={12} size={55} flip />

      {/* Idle bouncing bunnies — corners */}
      <IdleBunny left="6%" top="35%" delay={0.2} size={45} />
      <IdleBunny left="88%" top="42%" delay={0.8} size={50} />
      <IdleBunny left="4%" top="86%" delay={1.4} size={40} />
    </>
  );
}