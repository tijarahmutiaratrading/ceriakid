import React from 'react';
import { motion } from 'framer-motion';

/**
 * Family mascot — Ibu, Kakak (perempuan), Adik (lelaki).
 * Pure inline SVG, no background image. Ibu waves with her right hand.
 */
export default function CikguMascot({ className = '', size = 240 }) {
  return (
    <motion.div
      className={`pointer-events-none select-none ${className}`}
      style={{ width: size, filter: 'drop-shadow(0 12px 28px rgba(0,0,0,0.4))' }}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <svg viewBox="0 0 360 260" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">

        {/* ===================== ADIK LELAKI (left, smallest) ===================== */}
        <g transform="translate(10, 90)">
          {/* Legs */}
          <rect x="40" y="120" width="12" height="38" rx="4" fill="#1e40af" />
          <rect x="58" y="120" width="12" height="38" rx="4" fill="#1e40af" />
          {/* Shoes */}
          <ellipse cx="46" cy="160" rx="10" ry="4" fill="#111827" />
          <ellipse cx="64" cy="160" rx="10" ry="4" fill="#111827" />
          {/* Shirt — yellow t-shirt */}
          <path d="M22 70 Q22 56 36 54 L74 54 Q88 56 88 70 L88 122 Q88 128 82 128 L28 128 Q22 128 22 122 Z" fill="#facc15" />
          {/* Shirt stripe */}
          <rect x="22" y="92" width="66" height="6" fill="#f59e0b" />
          {/* Left arm */}
          <path d="M24 72 Q14 96 18 122 Q20 130 26 128 Q30 126 28 120 Q24 104 30 80 Z" fill="#facc15" />
          <circle cx="22" cy="126" r="6" fill="#fcd9b6" />
          {/* Right arm */}
          <path d="M86 72 Q96 96 92 122 Q90 130 84 128 Q80 126 82 120 Q86 104 80 80 Z" fill="#facc15" />
          <circle cx="88" cy="126" r="6" fill="#fcd9b6" />
          {/* Neck */}
          <rect x="50" y="48" width="10" height="8" fill="#fcd9b6" />
          {/* Head */}
          <ellipse cx="55" cy="32" rx="24" ry="25" fill="#fcd9b6" />
          {/* Hair — short boy hair */}
          <path d="M32 22 Q34 6 55 4 Q76 6 78 22 Q74 16 66 16 Q58 22 50 18 Q42 22 34 16 Q32 18 32 22 Z" fill="#1f2937" />
          {/* Ears */}
          <ellipse cx="32" cy="34" rx="3.5" ry="5" fill="#fcd9b6" />
          <ellipse cx="78" cy="34" rx="3.5" ry="5" fill="#fcd9b6" />
          {/* Eyes */}
          <ellipse cx="46" cy="34" rx="3" ry="4" fill="#1f2937" />
          <ellipse cx="64" cy="34" rx="3" ry="4" fill="#1f2937" />
          <circle cx="47" cy="32.5" r="1" fill="#ffffff" />
          <circle cx="65" cy="32.5" r="1" fill="#ffffff" />
          {/* Cheeks */}
          <circle cx="38" cy="44" r="3.5" fill="#fca5a5" opacity="0.6" />
          <circle cx="72" cy="44" r="3.5" fill="#fca5a5" opacity="0.6" />
          {/* Big smile — excited */}
          <path d="M44 48 Q55 58 66 48" stroke="#1f2937" strokeWidth="2.2" strokeLinecap="round" fill="none" />
        </g>

        {/* ===================== IBU (centre, tallest) ===================== */}
        <g transform="translate(120, 30)">
          {/* Legs (long dress so just bottom shows) */}
          <rect x="56" y="200" width="14" height="20" rx="4" fill="#fcd9b6" />
          <rect x="78" y="200" width="14" height="20" rx="4" fill="#fcd9b6" />
          {/* Shoes */}
          <ellipse cx="63" cy="220" rx="11" ry="5" fill="#7c2d12" />
          <ellipse cx="85" cy="220" rx="11" ry="5" fill="#7c2d12" />

          {/* Long baju kurung / dress — flares out */}
          <path d="M44 100 Q44 84 60 80 L88 80 Q104 84 104 100 L116 200 Q116 206 110 206 L38 206 Q32 206 32 200 Z" fill="#9333ea" />
          {/* Dress trim */}
          <path d="M34 200 L114 200" stroke="#fbbf24" strokeWidth="3" />
          {/* Subtle dress pattern dots */}
          <circle cx="56" cy="130" r="2" fill="#fbbf24" opacity="0.6" />
          <circle cx="80" cy="150" r="2" fill="#fbbf24" opacity="0.6" />
          <circle cx="64" cy="170" r="2" fill="#fbbf24" opacity="0.6" />
          <circle cx="92" cy="135" r="2" fill="#fbbf24" opacity="0.6" />

          {/* Left arm (resting on adik's shoulder area) */}
          <path d="M46 100 Q30 124 26 152 Q24 160 32 160 Q40 160 40 152 Q44 130 54 110 Z" fill="#9333ea" />
          <circle cx="28" cy="158" r="8" fill="#fcd9b6" />

          {/* Right arm — WAVING */}
          <motion.g
            style={{ originX: '102px', originY: '100px' }}
            animate={{ rotate: [0, -20, 6, -20, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, repeatDelay: 1.2, ease: 'easeInOut' }}
          >
            <path d="M102 100 Q126 76 138 42 Q140 32 130 28 Q120 26 116 36 Q106 66 92 86 Z" fill="#9333ea" />
            {/* Hand */}
            <circle cx="135" cy="34" r="11" fill="#fcd9b6" />
            {/* Finger lines */}
            <path d="M130 28 L133 24 M134 26 L137 22 M138 28 L141 24" stroke="#d4a574" strokeWidth="1.5" strokeLinecap="round" fill="none" />
          </motion.g>

          {/* Neck */}
          <rect x="66" y="68" width="16" height="14" fill="#fcd9b6" />

          {/* Head */}
          <ellipse cx="74" cy="46" rx="32" ry="34" fill="#fcd9b6" />

          {/* Tudung / hijab — covers head + drapes down */}
          <path d="M40 40 Q42 8 74 6 Q106 8 108 40 Q108 60 102 76 L102 110 Q92 116 74 116 Q56 116 46 110 L46 76 Q40 60 40 40 Z" fill="#6b21a8" />
          {/* Tudung face opening */}
          <ellipse cx="74" cy="50" rx="26" ry="28" fill="#fcd9b6" />
          {/* Tudung highlight */}
          <path d="M48 30 Q52 14 74 12 Q96 14 100 30" stroke="#a855f7" strokeWidth="2" fill="none" opacity="0.5" />

          {/* Eyes */}
          <ellipse cx="62" cy="50" rx="3.5" ry="4.5" fill="#1f2937" />
          <ellipse cx="86" cy="50" rx="3.5" ry="4.5" fill="#1f2937" />
          <circle cx="63" cy="48.5" r="1.3" fill="#ffffff" />
          <circle cx="87" cy="48.5" r="1.3" fill="#ffffff" />
          {/* Eyebrows */}
          <path d="M56 41 Q62 38 68 41" stroke="#1f2937" strokeWidth="2.2" strokeLinecap="round" fill="none" />
          <path d="M80 41 Q86 38 92 41" stroke="#1f2937" strokeWidth="2.2" strokeLinecap="round" fill="none" />
          {/* Cheeks */}
          <circle cx="52" cy="62" r="4.5" fill="#fca5a5" opacity="0.55" />
          <circle cx="96" cy="62" r="4.5" fill="#fca5a5" opacity="0.55" />
          {/* Lipstick smile */}
          <path d="M62 68 Q74 78 86 68" stroke="#be185d" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        </g>

        {/* ===================== KAKAK (right, medium) ===================== */}
        <g transform="translate(265, 70)">
          {/* Legs */}
          <rect x="32" y="140" width="11" height="40" rx="4" fill="#fcd9b6" />
          <rect x="48" y="140" width="11" height="40" rx="4" fill="#fcd9b6" />
          {/* Shoes */}
          <ellipse cx="37" cy="180" rx="9" ry="4" fill="#be185d" />
          <ellipse cx="53" cy="180" rx="9" ry="4" fill="#be185d" />
          {/* Skirt — flared pink */}
          <path d="M20 110 L70 110 L78 148 L12 148 Z" fill="#ec4899" />
          {/* Skirt fold lines */}
          <path d="M30 110 L26 148 M45 110 L45 148 M60 110 L64 148" stroke="#db2777" strokeWidth="1.5" opacity="0.5" />
          {/* Top — pink shirt */}
          <path d="M22 60 Q22 48 34 46 L56 46 Q68 48 68 60 L70 110 L20 110 Z" fill="#f9a8d4" />
          {/* Heart on shirt */}
          <path d="M45 70 Q41 66 37 70 Q35 74 45 82 Q55 74 53 70 Q49 66 45 70 Z" fill="#be185d" />
          {/* Left arm */}
          <path d="M24 62 Q14 88 16 116 Q18 124 24 122 Q28 120 26 114 Q22 96 30 70 Z" fill="#f9a8d4" />
          <circle cx="20" cy="120" r="6.5" fill="#fcd9b6" />
          {/* Right arm */}
          <path d="M66 62 Q76 88 74 116 Q72 124 66 122 Q62 120 64 114 Q68 96 60 70 Z" fill="#f9a8d4" />
          <circle cx="70" cy="120" r="6.5" fill="#fcd9b6" />
          {/* Neck */}
          <rect x="40" y="40" width="10" height="8" fill="#fcd9b6" />
          {/* Head */}
          <ellipse cx="45" cy="24" rx="26" ry="27" fill="#fcd9b6" />
          {/* Hair — long with bangs + ponytails */}
          <path d="M20 16 Q22 -4 45 -6 Q68 -4 70 16 L70 42 Q68 48 62 48 L62 32 Q56 28 50 30 Q44 24 38 30 Q32 28 28 32 L28 48 Q22 48 20 42 Z" fill="#1f2937" />
          {/* Side hair tufts (twin ponytail vibe) */}
          <ellipse cx="22" cy="36" rx="6" ry="12" fill="#1f2937" />
          <ellipse cx="68" cy="36" rx="6" ry="12" fill="#1f2937" />
          {/* Hair ribbons */}
          <circle cx="22" cy="22" r="3" fill="#ec4899" />
          <circle cx="68" cy="22" r="3" fill="#ec4899" />
          {/* Ears */}
          <ellipse cx="22" cy="28" rx="3" ry="4.5" fill="#fcd9b6" />
          <ellipse cx="68" cy="28" rx="3" ry="4.5" fill="#fcd9b6" />
          {/* Eyes */}
          <ellipse cx="36" cy="28" rx="3" ry="4" fill="#1f2937" />
          <ellipse cx="54" cy="28" rx="3" ry="4" fill="#1f2937" />
          <circle cx="37" cy="26.5" r="1.1" fill="#ffffff" />
          <circle cx="55" cy="26.5" r="1.1" fill="#ffffff" />
          {/* Eyelashes */}
          <path d="M33 24 L31 22 M39 24 L41 22" stroke="#1f2937" strokeWidth="1.2" strokeLinecap="round" />
          <path d="M51 24 L49 22 M57 24 L59 22" stroke="#1f2937" strokeWidth="1.2" strokeLinecap="round" />
          {/* Cheeks */}
          <circle cx="28" cy="38" r="4" fill="#fca5a5" opacity="0.6" />
          <circle cx="62" cy="38" r="4" fill="#fca5a5" opacity="0.6" />
          {/* Smile */}
          <path d="M36 42 Q45 50 54 42" stroke="#1f2937" strokeWidth="2.2" strokeLinecap="round" fill="none" />
        </g>
      </svg>
    </motion.div>
  );
}