import React from 'react';
import { motion } from 'framer-motion';

/**
 * Cikgu Firdaus mascot — pure inline SVG so it's always crisp and never has
 * a background. Right arm waves via framer-motion rotation.
 */
export default function CikguMascot({ className = '', size = 200 }) {
  return (
    <motion.div
      className={`pointer-events-none select-none ${className}`}
      style={{ width: size, filter: 'drop-shadow(0 10px 24px rgba(0,0,0,0.35))' }}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <svg viewBox="0 0 200 260" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
        {/* Legs */}
        <rect x="78" y="200" width="18" height="50" rx="6" fill="#1f2937" />
        <rect x="104" y="200" width="18" height="50" rx="6" fill="#1f2937" />
        {/* Shoes */}
        <ellipse cx="87" cy="252" rx="14" ry="6" fill="#111827" />
        <ellipse cx="113" cy="252" rx="14" ry="6" fill="#111827" />

        {/* Body / shirt */}
        <path d="M60 130 Q60 110 80 108 L120 108 Q140 110 140 130 L140 205 Q140 212 132 212 L68 212 Q60 212 60 205 Z" fill="#3b82f6" />
        {/* Shirt collar */}
        <path d="M88 108 L100 122 L112 108 Z" fill="#1e3a8a" />
        {/* Buttons */}
        <circle cx="100" cy="140" r="2.5" fill="#1e3a8a" />
        <circle cx="100" cy="158" r="2.5" fill="#1e3a8a" />
        <circle cx="100" cy="176" r="2.5" fill="#1e3a8a" />

        {/* Left arm (static, holding side) */}
        <path d="M62 134 Q50 160 56 195 Q58 205 66 202 Q72 200 70 192 Q66 170 74 142 Z" fill="#3b82f6" />
        <circle cx="62" cy="200" r="9" fill="#fcd9b6" />

        {/* Right arm — WAVING (animated) */}
        <motion.g
          style={{ originX: '138px', originY: '128px' }}
          animate={{ rotate: [0, -18, 8, -18, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, repeatDelay: 1.2, ease: 'easeInOut' }}
        >
          <path d="M138 128 Q160 110 170 78 Q172 70 164 66 Q156 64 152 72 Q142 100 130 118 Z" fill="#3b82f6" />
          {/* Hand */}
          <circle cx="167" cy="70" r="11" fill="#fcd9b6" />
          {/* Tiny finger lines */}
          <path d="M163 64 L167 60 M167 62 L171 58 M171 64 L174 60" stroke="#d4a574" strokeWidth="1.5" strokeLinecap="round" fill="none" />
        </motion.g>

        {/* Neck */}
        <rect x="92" y="98" width="16" height="14" fill="#fcd9b6" />

        {/* Head */}
        <ellipse cx="100" cy="76" rx="34" ry="36" fill="#fcd9b6" />
        {/* Hair */}
        <path d="M68 60 Q70 38 100 32 Q130 38 132 60 Q128 50 118 48 Q108 56 100 52 Q92 56 82 48 Q72 50 68 60 Z" fill="#1f2937" />
        {/* Ears */}
        <ellipse cx="66" cy="78" rx="5" ry="7" fill="#fcd9b6" />
        <ellipse cx="134" cy="78" rx="5" ry="7" fill="#fcd9b6" />

        {/* Eyes */}
        <ellipse cx="88" cy="78" rx="4" ry="5" fill="#1f2937" />
        <ellipse cx="112" cy="78" rx="4" ry="5" fill="#1f2937" />
        {/* Eye sparkle */}
        <circle cx="89" cy="76" r="1.4" fill="#ffffff" />
        <circle cx="113" cy="76" r="1.4" fill="#ffffff" />
        {/* Eyebrows */}
        <path d="M82 68 Q88 65 94 68" stroke="#1f2937" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        <path d="M106 68 Q112 65 118 68" stroke="#1f2937" strokeWidth="2.5" strokeLinecap="round" fill="none" />

        {/* Cheeks */}
        <circle cx="78" cy="90" r="5" fill="#fca5a5" opacity="0.55" />
        <circle cx="122" cy="90" r="5" fill="#fca5a5" opacity="0.55" />

        {/* Smile */}
        <path d="M86 96 Q100 108 114 96" stroke="#1f2937" strokeWidth="2.8" strokeLinecap="round" fill="none" />
      </svg>
    </motion.div>
  );
}