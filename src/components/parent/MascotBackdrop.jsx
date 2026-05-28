import React from 'react';
import { motion } from 'framer-motion';

/**
 * One family group standing together holding hands — fixed at bottom of viewport.
 * Pure decoration — pointer-events disabled.
 */

export default function MascotBackdrop() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-x-0 bottom-0 -z-[5] flex justify-center overflow-hidden">
      <motion.div
        className="w-full max-w-3xl px-4"
        style={{ opacity: 0.55, filter: 'drop-shadow(0 8px 20px rgba(0,0,0,0.3))' }}
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
      >
        <svg viewBox="0 0 600 200" className="w-full h-auto" xmlns="http://www.w3.org/2000/svg">
          {/* ===== Connecting hands line (held hands) ===== */}
          <path
            d="M 95 130 Q 145 122 195 128 Q 245 132 295 130 Q 345 128 395 132 Q 445 128 495 130"
            stroke="#fcd7b6"
            strokeWidth="6"
            strokeLinecap="round"
            fill="none"
          />

          {/* ===== DAD (leftmost, tallest) ===== */}
          <g transform="translate(60, 30)">
            {/* head */}
            <circle cx="35" cy="22" r="16" fill="#fcd7b6" />
            {/* hair */}
            <path d="M19 22 Q19 8 35 8 Q51 8 51 22 Q44 16 35 18 Q26 16 19 22" fill="#3b2a1a" />
            {/* eyes */}
            <circle cx="29" cy="24" r="1.5" fill="#1f1f1f" />
            <circle cx="41" cy="24" r="1.5" fill="#1f1f1f" />
            {/* smile */}
            <path d="M30 31 Q35 34 40 31" stroke="#7a4a2a" strokeWidth="1.5" fill="none" strokeLinecap="round" />
            {/* shirt */}
            <path d="M16 50 Q16 42 25 40 L45 40 Q54 42 54 50 L54 95 L16 95 Z" fill="#3b82f6" />
            {/* pants */}
            <rect x="18" y="92" width="34" height="40" fill="#1e3a8a" rx="2" />
            <rect x="33" y="92" width="3" height="40" fill="#0f1f4a" />
            {/* arms (extended to hold hands) */}
            <path d="M16 55 Q5 75 12 100" stroke="#fcd7b6" strokeWidth="7" fill="none" strokeLinecap="round" />
            <path d="M54 55 Q65 70 70 100" stroke="#fcd7b6" strokeWidth="7" fill="none" strokeLinecap="round" />
          </g>

          {/* ===== BOY ===== */}
          <g transform="translate(150, 55)">
            {/* head */}
            <circle cx="30" cy="20" r="14" fill="#fcd7b6" />
            {/* hair */}
            <path d="M16 20 Q16 6 30 6 Q44 6 44 20 Q37 14 30 16 Q23 14 16 20" fill="#1f1209" />
            {/* eyes */}
            <circle cx="25" cy="22" r="1.6" fill="#1f1f1f" />
            <circle cx="35" cy="22" r="1.6" fill="#1f1f1f" />
            {/* smile */}
            <path d="M25 29 Q30 33 35 29" stroke="#7a4a2a" strokeWidth="1.5" fill="none" strokeLinecap="round" />
            {/* tshirt */}
            <path d="M14 45 Q14 38 22 36 L38 36 Q46 38 46 45 L46 78 L14 78 Z" fill="#fbbf24" />
            {/* shorts */}
            <rect x="15" y="75" width="30" height="28" fill="#dc2626" rx="2" />
            <rect x="28" y="75" width="3" height="28" fill="#991b1b" />
            {/* arms */}
            <path d="M14 50 Q4 65 8 78" stroke="#fcd7b6" strokeWidth="6" fill="none" strokeLinecap="round" />
            <path d="M46 50 Q56 65 52 78" stroke="#fcd7b6" strokeWidth="6" fill="none" strokeLinecap="round" />
          </g>

          {/* ===== TODDLER (middle, shortest) ===== */}
          <g transform="translate(245, 75)">
            {/* head — proportionally big */}
            <circle cx="28" cy="22" r="17" fill="#fcd7b6" />
            {/* hair */}
            <path d="M11 22 Q11 5 28 5 Q45 5 45 22 Q36 14 28 16 Q20 14 11 22" fill="#7a4a2a" />
            {/* eyes */}
            <circle cx="22" cy="24" r="1.8" fill="#1f1f1f" />
            <circle cx="34" cy="24" r="1.8" fill="#1f1f1f" />
            {/* mouth */}
            <ellipse cx="28" cy="32" rx="2.2" ry="1.5" fill="#c2185b" />
            {/* romper */}
            <path d="M12 52 Q12 45 20 43 L36 43 Q44 45 44 52 L44 85 L12 85 Z" fill="#22d3ee" />
            <circle cx="28" cy="65" r="1.8" fill="#0e7490" />
            {/* arms */}
            <path d="M12 56 Q3 68 5 80" stroke="#fcd7b6" strokeWidth="5.5" fill="none" strokeLinecap="round" />
            <path d="M44 56 Q53 68 51 80" stroke="#fcd7b6" strokeWidth="5.5" fill="none" strokeLinecap="round" />
          </g>

          {/* ===== GIRL ===== */}
          <g transform="translate(335, 55)">
            {/* pigtails */}
            <ellipse cx="14" cy="26" rx="6" ry="11" fill="#5b2a18" />
            <ellipse cx="46" cy="26" rx="6" ry="11" fill="#5b2a18" />
            {/* head */}
            <circle cx="30" cy="22" r="14" fill="#fcd7b6" />
            {/* fringe */}
            <path d="M16 22 Q16 8 30 8 Q44 8 44 22 Q37 18 30 19 Q23 18 16 22" fill="#5b2a18" />
            {/* bow */}
            <circle cx="30" cy="10" r="3" fill="#ec4899" />
            {/* eyes */}
            <circle cx="25" cy="24" r="1.6" fill="#1f1f1f" />
            <circle cx="35" cy="24" r="1.6" fill="#1f1f1f" />
            {/* smile */}
            <path d="M26 30 Q30 33 34 30" stroke="#c2185b" strokeWidth="1.5" fill="none" strokeLinecap="round" />
            {/* cheeks */}
            <circle cx="22" cy="28" r="1.8" fill="#f9a8d4" opacity="0.7" />
            <circle cx="38" cy="28" r="1.8" fill="#f9a8d4" opacity="0.7" />
            {/* dress */}
            <path d="M14 47 Q14 40 22 38 L38 38 Q46 40 46 47 L52 105 L8 105 Z" fill="#a855f7" />
            {/* arms */}
            <path d="M14 52 Q4 65 8 78" stroke="#fcd7b6" strokeWidth="6" fill="none" strokeLinecap="round" />
            <path d="M46 52 Q56 65 52 78" stroke="#fcd7b6" strokeWidth="6" fill="none" strokeLinecap="round" />
          </g>

          {/* ===== MOM (rightmost) ===== */}
          <g transform="translate(450, 30)">
            {/* head */}
            <circle cx="35" cy="22" r="16" fill="#fcd7b6" />
            {/* long hair */}
            <path d="M17 22 Q17 6 35 6 Q53 6 53 22 L55 50 Q52 45 50 40 L46 22 Q35 14 24 22 L20 40 Q18 45 15 50 Z" fill="#5b2a18" />
            {/* eyes */}
            <circle cx="29" cy="24" r="1.5" fill="#1f1f1f" />
            <circle cx="41" cy="24" r="1.5" fill="#1f1f1f" />
            {/* lips */}
            <path d="M31 31 Q35 34 39 31" stroke="#c2185b" strokeWidth="1.7" fill="none" strokeLinecap="round" />
            {/* dress */}
            <path d="M16 50 Q16 42 25 40 L45 40 Q54 42 54 50 L60 132 L10 132 Z" fill="#ec4899" />
            {/* collar */}
            <path d="M29 40 L35 46 L41 40" fill="#be185d" />
            {/* arms */}
            <path d="M16 55 Q5 75 12 100" stroke="#fcd7b6" strokeWidth="7" fill="none" strokeLinecap="round" />
            <path d="M54 55 Q65 70 70 100" stroke="#fcd7b6" strokeWidth="7" fill="none" strokeLinecap="round" />
          </g>

          {/* ===== Ground line / shadow ===== */}
          <ellipse cx="300" cy="190" rx="240" ry="6" fill="rgba(0,0,0,0.2)" />
        </svg>
      </motion.div>
    </div>
  );
}