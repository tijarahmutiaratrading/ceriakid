import React from 'react';
import { motion } from 'framer-motion';

/**
 * Mini Game Mascot — trio haiwan comel:
 * Panda (tengah, besar), Kucing oren (kiri, comel), Arnab pink (kanan, melompat).
 * Suasana playful, sesuai untuk mini games.
 */
export default function MiniGameMascot({ className = '', size = 240 }) {
  return (
    <motion.div
      className={`pointer-events-none select-none ${className}`}
      style={{ width: size, filter: 'drop-shadow(0 12px 28px rgba(0,0,0,0.4))' }}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <svg viewBox="0 0 360 260" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">

        {/* ===================== KUCING ORANGE (left, small) ===================== */}
        <motion.g
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <g transform="translate(15, 120)">
            {/* Tail — curly */}
            <path d="M78 60 Q95 50 92 28 Q88 20 80 24" stroke="#f97316" strokeWidth="9" strokeLinecap="round" fill="none" />
            <path d="M78 60 Q95 50 92 28 Q88 20 80 24" stroke="#fed7aa" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.6" />
            {/* Body */}
            <ellipse cx="50" cy="78" rx="34" ry="28" fill="#f97316" />
            {/* Belly */}
            <ellipse cx="50" cy="82" rx="20" ry="18" fill="#fed7aa" />
            {/* Body stripes */}
            <path d="M28 70 Q24 78 28 86 M72 70 Q76 78 72 86" stroke="#c2410c" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            {/* Front legs */}
            <ellipse cx="38" cy="104" rx="6" ry="8" fill="#f97316" />
            <ellipse cx="62" cy="104" rx="6" ry="8" fill="#f97316" />
            <ellipse cx="38" cy="108" rx="6" ry="3" fill="#fed7aa" />
            <ellipse cx="62" cy="108" rx="6" ry="3" fill="#fed7aa" />
            {/* Head */}
            <circle cx="50" cy="38" r="28" fill="#f97316" />
            {/* Inner face */}
            <ellipse cx="50" cy="44" rx="20" ry="16" fill="#fed7aa" />
            {/* Ears — triangle */}
            <path d="M24 22 L28 4 L40 18 Z" fill="#f97316" />
            <path d="M76 22 L72 4 L60 18 Z" fill="#f97316" />
            <path d="M28 18 L31 10 L36 16 Z" fill="#fda4af" />
            <path d="M72 18 L69 10 L64 16 Z" fill="#fda4af" />
            {/* Forehead stripes */}
            <path d="M40 18 Q42 14 44 18 M50 14 Q52 10 54 14 M58 18 Q60 14 62 18" stroke="#c2410c" strokeWidth="2" strokeLinecap="round" fill="none" />
            {/* Eyes — big sparkly */}
            <ellipse cx="40" cy="38" rx="5" ry="6" fill="#1f2937" />
            <ellipse cx="60" cy="38" rx="5" ry="6" fill="#1f2937" />
            <circle cx="41.5" cy="36" r="1.8" fill="#ffffff" />
            <circle cx="61.5" cy="36" r="1.8" fill="#ffffff" />
            <circle cx="39" cy="40" r="0.8" fill="#ffffff" />
            <circle cx="59" cy="40" r="0.8" fill="#ffffff" />
            {/* Nose — pink triangle */}
            <path d="M47 48 L53 48 L50 52 Z" fill="#ec4899" />
            {/* Mouth */}
            <path d="M50 52 L50 55 M50 55 Q46 58 44 56 M50 55 Q54 58 56 56" stroke="#1f2937" strokeWidth="1.8" strokeLinecap="round" fill="none" />
            {/* Whiskers */}
            <path d="M30 50 L20 48 M30 53 L20 54 M70 50 L80 48 M70 53 L80 54" stroke="#1f2937" strokeWidth="1.2" strokeLinecap="round" />
            {/* Cheeks */}
            <circle cx="32" cy="50" r="3.5" fill="#fca5a5" opacity="0.7" />
            <circle cx="68" cy="50" r="3.5" fill="#fca5a5" opacity="0.7" />
          </g>
        </motion.g>

        {/* ===================== PANDA (centre, biggest) ===================== */}
        <g transform="translate(125, 30)">
          {/* Legs */}
          <ellipse cx="50" cy="208" rx="14" ry="12" fill="#1f2937" />
          <ellipse cx="86" cy="208" rx="14" ry="12" fill="#1f2937" />
          {/* Foot pads */}
          <ellipse cx="50" cy="212" rx="9" ry="5" fill="#fca5a5" opacity="0.7" />
          <ellipse cx="86" cy="212" rx="9" ry="5" fill="#fca5a5" opacity="0.7" />

          {/* Body — round white */}
          <ellipse cx="68" cy="155" rx="46" ry="48" fill="#ffffff" />
          {/* Body shadow for depth */}
          <ellipse cx="68" cy="160" rx="38" ry="38" fill="#f8fafc" />

          {/* Left arm */}
          <ellipse cx="22" cy="150" rx="14" ry="22" fill="#1f2937" transform="rotate(-15 22 150)" />

          {/* Right arm — WAVING */}
          <motion.g
            style={{ originX: '110px', originY: '140px' }}
            animate={{ rotate: [0, -25, 8, -25, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, repeatDelay: 1.2, ease: 'easeInOut' }}
          >
            <ellipse cx="120" cy="120" rx="14" ry="24" fill="#1f2937" transform="rotate(28 120 120)" />
            {/* Paw */}
            <circle cx="138" cy="92" r="13" fill="#1f2937" />
            <circle cx="138" cy="94" r="7" fill="#fca5a5" opacity="0.6" />
            {/* Paw pads */}
            <circle cx="134" cy="89" r="2" fill="#0f172a" />
            <circle cx="142" cy="89" r="2" fill="#0f172a" />
            <circle cx="138" cy="86" r="2" fill="#0f172a" />
          </motion.g>

          {/* Head — big round */}
          <circle cx="68" cy="74" r="50" fill="#ffffff" />

          {/* Ears */}
          <circle cx="28" cy="36" r="16" fill="#1f2937" />
          <circle cx="108" cy="36" r="16" fill="#1f2937" />
          <circle cx="28" cy="38" r="9" fill="#374151" />
          <circle cx="108" cy="38" r="9" fill="#374151" />

          {/* Eye patches — iconic panda */}
          <ellipse cx="50" cy="72" rx="13" ry="16" fill="#1f2937" transform="rotate(-15 50 72)" />
          <ellipse cx="86" cy="72" rx="13" ry="16" fill="#1f2937" transform="rotate(15 86 72)" />

          {/* Eyes inside patches */}
          <circle cx="50" cy="74" r="6" fill="#ffffff" />
          <circle cx="86" cy="74" r="6" fill="#ffffff" />
          <circle cx="51" cy="75" r="4" fill="#1f2937" />
          <circle cx="87" cy="75" r="4" fill="#1f2937" />
          <circle cx="52.5" cy="73.5" r="1.5" fill="#ffffff" />
          <circle cx="88.5" cy="73.5" r="1.5" fill="#ffffff" />

          {/* Nose */}
          <ellipse cx="68" cy="92" rx="6" ry="5" fill="#1f2937" />
          <ellipse cx="67" cy="91" rx="2" ry="1.5" fill="#ffffff" opacity="0.6" />

          {/* Mouth — happy smile */}
          <path d="M68 97 L68 102" stroke="#1f2937" strokeWidth="2" strokeLinecap="round" />
          <path d="M68 102 Q60 110 54 106" stroke="#1f2937" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          <path d="M68 102 Q76 110 82 106" stroke="#1f2937" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          {/* Tongue */}
          <path d="M62 106 Q68 112 74 106 Q72 110 68 110 Q64 110 62 106 Z" fill="#ec4899" />

          {/* Cheeks */}
          <circle cx="36" cy="92" r="6" fill="#fca5a5" opacity="0.65" />
          <circle cx="100" cy="92" r="6" fill="#fca5a5" opacity="0.65" />

          {/* Bamboo leaf accent */}
          <ellipse cx="44" cy="160" rx="8" ry="3" fill="#22c55e" transform="rotate(-25 44 160)" />
          <ellipse cx="50" cy="155" rx="6" ry="2.5" fill="#16a34a" transform="rotate(-30 50 155)" />
        </g>

        {/* ===================== ARNAB PINK (right, hopping) ===================== */}
        <motion.g
          animate={{ y: [0, -12, 0] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
        >
          <g transform="translate(265, 95)">
            {/* Feet — big bunny feet */}
            <ellipse cx="30" cy="155" rx="14" ry="8" fill="#fda4af" />
            <ellipse cx="56" cy="155" rx="14" ry="8" fill="#fda4af" />
            <ellipse cx="30" cy="157" rx="6" ry="3" fill="#f9a8d4" />
            <ellipse cx="56" cy="157" rx="6" ry="3" fill="#f9a8d4" />

            {/* Body — round chubby */}
            <ellipse cx="43" cy="115" rx="32" ry="30" fill="#fda4af" />
            {/* Belly */}
            <ellipse cx="43" cy="120" rx="20" ry="20" fill="#fecdd3" />

            {/* Arms */}
            <ellipse cx="14" cy="118" rx="8" ry="14" fill="#fda4af" />
            <ellipse cx="72" cy="118" rx="8" ry="14" fill="#fda4af" />

            {/* Tail (fluffy ball) */}
            <circle cx="76" cy="118" r="7" fill="#ffffff" />
            <circle cx="76" cy="118" r="5" fill="#fce7f3" />

            {/* Head */}
            <circle cx="43" cy="58" r="30" fill="#fda4af" />

            {/* Long ears */}
            <ellipse cx="28" cy="20" rx="7" ry="22" fill="#fda4af" />
            <ellipse cx="58" cy="20" rx="7" ry="22" fill="#fda4af" />
            <ellipse cx="28" cy="22" rx="3.5" ry="16" fill="#fbcfe8" />
            <ellipse cx="58" cy="22" rx="3.5" ry="16" fill="#fbcfe8" />

            {/* Eyes — closed happy (^^) */}
            <path d="M30 56 Q34 50 38 56" stroke="#1f2937" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            <path d="M48 56 Q52 50 56 56" stroke="#1f2937" strokeWidth="2.5" strokeLinecap="round" fill="none" />

            {/* Nose */}
            <path d="M40 65 L46 65 L43 69 Z" fill="#ec4899" />

            {/* Mouth — y-shape */}
            <path d="M43 69 L43 72 M43 72 Q40 75 38 73 M43 72 Q46 75 48 73" stroke="#1f2937" strokeWidth="1.8" strokeLinecap="round" fill="none" />

            {/* Whiskers */}
            <path d="M28 67 L18 65 M28 70 L18 71 M58 67 L68 65 M58 70 L68 71" stroke="#1f2937" strokeWidth="1" strokeLinecap="round" />

            {/* Cheeks */}
            <circle cx="24" cy="64" r="4" fill="#ec4899" opacity="0.5" />
            <circle cx="62" cy="64" r="4" fill="#ec4899" opacity="0.5" />

            {/* Heart on chest */}
            <path d="M43 110 Q39 105 35 108 Q33 112 43 120 Q53 112 51 108 Q47 105 43 110 Z" fill="#ec4899" />
          </g>
        </motion.g>

      </svg>
    </motion.div>
  );
}