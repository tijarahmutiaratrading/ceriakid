import React from 'react';
import { motion } from 'framer-motion';

/**
 * Floating SVG family mascots (parents + children) layered over the background.
 * Pure decoration — pointer-events disabled.
 */

// — SVG family characters (simple, friendly, cartoon style) —

const Dad = ({ className }) => (
  <svg viewBox="0 0 100 140" className={className} xmlns="http://www.w3.org/2000/svg">
    {/* head */}
    <circle cx="50" cy="28" r="18" fill="#fcd7b6" />
    {/* hair */}
    <path d="M32 26 Q32 12 50 12 Q68 12 68 26 Q60 20 50 22 Q40 20 32 26" fill="#3b2a1a" />
    {/* eyes */}
    <circle cx="43" cy="29" r="1.8" fill="#1f1f1f" />
    <circle cx="57" cy="29" r="1.8" fill="#1f1f1f" />
    {/* smile */}
    <path d="M44 37 Q50 41 56 37" stroke="#7a4a2a" strokeWidth="1.8" fill="none" strokeLinecap="round" />
    {/* body / shirt */}
    <path d="M28 60 Q28 50 38 48 L62 48 Q72 50 72 60 L72 95 L28 95 Z" fill="#3b82f6" />
    {/* pants */}
    <rect x="30" y="92" width="40" height="38" fill="#1e3a8a" rx="3" />
    {/* legs split */}
    <rect x="48" y="92" width="4" height="38" fill="#0f1f4a" />
  </svg>
);

const Mom = ({ className }) => (
  <svg viewBox="0 0 100 140" className={className} xmlns="http://www.w3.org/2000/svg">
    {/* head */}
    <circle cx="50" cy="28" r="18" fill="#fcd7b6" />
    {/* hair long */}
    <path d="M30 28 Q30 10 50 10 Q70 10 70 28 L72 55 Q68 50 66 45 L62 28 Q50 18 38 28 L34 45 Q32 50 28 55 Z" fill="#5b2a18" />
    {/* eyes */}
    <circle cx="43" cy="29" r="1.8" fill="#1f1f1f" />
    <circle cx="57" cy="29" r="1.8" fill="#1f1f1f" />
    {/* lips */}
    <path d="M45 38 Q50 41 55 38" stroke="#c2185b" strokeWidth="2" fill="none" strokeLinecap="round" />
    {/* dress */}
    <path d="M28 60 Q28 50 38 48 L62 48 Q72 50 72 60 L78 130 L22 130 Z" fill="#ec4899" />
    {/* collar */}
    <path d="M42 48 L50 56 L58 48" fill="#be185d" />
  </svg>
);

const Boy = ({ className }) => (
  <svg viewBox="0 0 100 140" className={className} xmlns="http://www.w3.org/2000/svg">
    {/* head */}
    <circle cx="50" cy="32" r="20" fill="#fcd7b6" />
    {/* hair */}
    <path d="M30 30 Q30 12 50 12 Q70 12 70 30 Q60 22 50 24 Q40 22 30 30" fill="#1f1209" />
    {/* eyes */}
    <circle cx="42" cy="33" r="2.2" fill="#1f1f1f" />
    <circle cx="58" cy="33" r="2.2" fill="#1f1f1f" />
    {/* big smile */}
    <path d="M42 42 Q50 48 58 42" stroke="#7a4a2a" strokeWidth="2" fill="none" strokeLinecap="round" />
    {/* tshirt */}
    <path d="M28 65 Q28 56 38 54 L62 54 Q72 56 72 65 L72 100 L28 100 Z" fill="#fbbf24" />
    {/* shorts */}
    <rect x="30" y="98" width="40" height="32" fill="#dc2626" rx="3" />
    <rect x="48" y="98" width="4" height="32" fill="#991b1b" />
  </svg>
);

const Girl = ({ className }) => (
  <svg viewBox="0 0 100 140" className={className} xmlns="http://www.w3.org/2000/svg">
    {/* pigtails behind */}
    <ellipse cx="28" cy="38" rx="8" ry="14" fill="#5b2a18" />
    <ellipse cx="72" cy="38" rx="8" ry="14" fill="#5b2a18" />
    {/* head */}
    <circle cx="50" cy="32" r="20" fill="#fcd7b6" />
    {/* fringe */}
    <path d="M30 30 Q30 12 50 12 Q70 12 70 30 Q60 24 50 26 Q40 24 30 30" fill="#5b2a18" />
    {/* bow */}
    <circle cx="50" cy="14" r="4" fill="#ec4899" />
    {/* eyes */}
    <circle cx="42" cy="33" r="2.2" fill="#1f1f1f" />
    <circle cx="58" cy="33" r="2.2" fill="#1f1f1f" />
    {/* smile */}
    <path d="M43 43 Q50 47 57 43" stroke="#c2185b" strokeWidth="2" fill="none" strokeLinecap="round" />
    {/* cheeks */}
    <circle cx="38" cy="40" r="2.5" fill="#f9a8d4" opacity="0.7" />
    <circle cx="62" cy="40" r="2.5" fill="#f9a8d4" opacity="0.7" />
    {/* dress */}
    <path d="M28 65 Q28 56 38 54 L62 54 Q72 56 72 65 L80 130 L20 130 Z" fill="#a855f7" />
  </svg>
);

const Toddler = ({ className }) => (
  <svg viewBox="0 0 100 140" className={className} xmlns="http://www.w3.org/2000/svg">
    {/* head — bigger relative to body */}
    <circle cx="50" cy="38" r="24" fill="#fcd7b6" />
    {/* hair */}
    <path d="M28 36 Q28 16 50 16 Q72 16 72 36 Q60 28 50 30 Q40 28 28 36" fill="#7a4a2a" />
    {/* eyes — big */}
    <circle cx="40" cy="40" r="2.8" fill="#1f1f1f" />
    <circle cx="60" cy="40" r="2.8" fill="#1f1f1f" />
    {/* mouth */}
    <ellipse cx="50" cy="50" rx="3" ry="2" fill="#c2185b" />
    {/* romper */}
    <path d="M30 72 Q30 64 40 62 L60 62 Q70 64 70 72 L70 120 L30 120 Z" fill="#22d3ee" />
    {/* button */}
    <circle cx="50" cy="90" r="2" fill="#0e7490" />
  </svg>
);

export default function MascotBackdrop() {
  const items = [
    { Comp: Dad,     top: '8%',  left: '4%',  size: 'w-20 md:w-28', delay: 0,   dur: 7 },
    { Comp: Mom,     top: '6%',  right: '5%', size: 'w-20 md:w-28', delay: 1.2, dur: 8 },
    { Comp: Boy,     top: '32%', left: '6%',  size: 'w-16 md:w-24', delay: 0.6, dur: 6 },
    { Comp: Girl,    top: '36%', right: '4%', size: 'w-16 md:w-24', delay: 2,   dur: 7 },
    { Comp: Toddler, top: '58%', left: '5%',  size: 'w-14 md:w-20', delay: 1.5, dur: 6 },
    { Comp: Boy,     top: '62%', right: '6%', size: 'w-16 md:w-24', delay: 0.8, dur: 8 },
    { Comp: Mom,     top: '82%', left: '4%',  size: 'w-20 md:w-28', delay: 2.4, dur: 7 },
    { Comp: Dad,     top: '84%', right: '5%', size: 'w-20 md:w-28', delay: 1,   dur: 8 },
  ];

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-[5] overflow-hidden">
      {items.map((item, i) => {
        const { Comp } = item;
        return (
          <motion.div
            key={i}
            className={`absolute ${item.size}`}
            style={{
              top: item.top,
              left: item.left,
              right: item.right,
              opacity: 0.45,
              filter: 'drop-shadow(0 6px 14px rgba(0,0,0,0.25))',
            }}
            animate={{
              y: [0, -14, 0],
              rotate: [0, 3, -3, 0],
            }}
            transition={{
              duration: item.dur,
              delay: item.delay,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <Comp className="w-full h-auto" />
          </motion.div>
        );
      })}
    </div>
  );
}