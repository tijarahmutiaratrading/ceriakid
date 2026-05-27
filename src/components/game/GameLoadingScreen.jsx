import React from 'react';
import { motion } from 'framer-motion';

// Fun, friendly loading screen with a waving kid mascot built from inline SVG.
// Designed for short waits — feels playful, not boring like a spinner.
export default function GameLoadingScreen({ message = 'Menyediakan permainan...' }) {
  return (
    <div
      className="fixed inset-0 z-[9999] w-screen h-screen flex items-center justify-center overflow-hidden p-4"
      style={{ background: 'linear-gradient(135deg, #312e81 0%, #581c87 45%, #be185d 100%)' }}
    >
      {/* Glow orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full opacity-30 blur-3xl" style={{ background: 'radial-gradient(circle, #ec4899 0%, transparent 70%)' }} />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full opacity-25 blur-3xl" style={{ background: 'radial-gradient(circle, #06b6d4 0%, transparent 70%)' }} />

      {/* Floating sparkles */}
      {['✨', '⭐', '💫', '🌟', '✨', '⭐'].map((s, i) => (
        <motion.div
          key={i}
          className="absolute text-2xl pointer-events-none select-none"
          style={{
            top: `${15 + (i * 13) % 70}%`,
            left: `${10 + (i * 17) % 80}%`,
            color: ['#fde68a', '#fbcfe8', '#a5f3fc', '#fde68a', '#ddd6fe', '#fbcfe8'][i],
            opacity: 0.55,
          }}
          animate={{ y: [0, -16, 0], rotate: [0, 12, -12, 0] }}
          transition={{ duration: 3 + i * 0.4, repeat: Infinity, delay: i * 0.3, ease: 'easeInOut' }}
        >
          {s}
        </motion.div>
      ))}

      <div className="relative z-10 flex flex-col items-center gap-6">
        {/* Mascot — kid waving */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 14, stiffness: 220 }}
          className="relative"
        >
          {/* Shadow under mascot */}
          <motion.div
            className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-32 h-3 rounded-full bg-black/30 blur-md"
            animate={{ scaleX: [1, 0.85, 1], opacity: [0.4, 0.25, 0.4] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          />

          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          >
            <WavingKidMascot />
          </motion.div>
        </motion.div>

        {/* Speech bubble */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="relative px-5 py-3 rounded-2xl bg-white/95 shadow-2xl"
        >
          <p className="font-black text-base sm:text-lg text-slate-800 text-center">
            👋 Hai! Sekejap ya...
          </p>
          {/* Tail */}
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white/95 rotate-45" />
        </motion.div>

        {/* Loading message + dots */}
        <div className="flex items-center gap-2">
          <p className="text-white font-bold text-sm sm:text-base">{message}</p>
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                className="w-2 h-2 rounded-full bg-yellow-300"
                animate={{ scale: [1, 1.6, 1], opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2, ease: 'easeInOut' }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Cute kid mascot — round face, big smile, waving right hand
function WavingKidMascot() {
  return (
    <svg width="180" height="200" viewBox="0 0 180 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="skin" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fde2c5" />
          <stop offset="100%" stopColor="#f5c89a" />
        </linearGradient>
        <linearGradient id="shirt" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
        <linearGradient id="hair" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4a2c1a" />
          <stop offset="100%" stopColor="#2d1810" />
        </linearGradient>
      </defs>

      {/* Body / shirt */}
      <path d="M55 145 Q55 130 90 130 Q125 130 125 145 L130 195 L50 195 Z" fill="url(#shirt)" stroke="#92400e" strokeWidth="2" />

      {/* Shirt collar */}
      <path d="M75 130 Q90 138 105 130 L100 145 L80 145 Z" fill="#fff" stroke="#92400e" strokeWidth="1.5" />

      {/* Left arm (static, by side) */}
      <ellipse cx="48" cy="160" rx="9" ry="22" fill="url(#shirt)" stroke="#92400e" strokeWidth="2" />
      <circle cx="48" cy="180" r="9" fill="url(#skin)" stroke="#b45309" strokeWidth="1.5" />

      {/* Right arm WAVING — animated via SVG transform */}
      <g style={{ transformOrigin: '128px 138px' }}>
        <motion.g
          animate={{ rotate: [-15, 25, -15] }}
          transition={{ duration: 0.9, repeat: Infinity, ease: 'easeInOut' }}
          style={{ transformOrigin: '128px 138px' }}
        >
          <ellipse cx="138" cy="118" rx="9" ry="24" fill="url(#shirt)" stroke="#92400e" strokeWidth="2" />
          {/* Hand */}
          <circle cx="142" cy="96" r="11" fill="url(#skin)" stroke="#b45309" strokeWidth="1.5" />
          {/* Fingers hint */}
          <path d="M138 88 L138 92 M142 86 L142 90 M146 88 L146 92" stroke="#b45309" strokeWidth="1.2" strokeLinecap="round" />
        </motion.g>
      </g>

      {/* Head */}
      <circle cx="90" cy="78" r="42" fill="url(#skin)" stroke="#b45309" strokeWidth="2" />

      {/* Hair */}
      <path d="M50 70 Q48 40 90 38 Q132 40 130 70 Q128 55 115 52 Q105 60 90 56 Q75 60 65 52 Q52 55 50 70 Z" fill="url(#hair)" />

      {/* Cheeks blush */}
      <circle cx="65" cy="88" r="6" fill="#fda4af" opacity="0.55" />
      <circle cx="115" cy="88" r="6" fill="#fda4af" opacity="0.55" />

      {/* Eyes — closed happy arcs */}
      <motion.g
        animate={{ scaleY: [1, 0.1, 1] }}
        transition={{ duration: 3, repeat: Infinity, times: [0, 0.5, 1], ease: 'easeInOut' }}
        style={{ transformOrigin: '90px 78px' }}
      >
        <path d="M68 76 Q73 82 78 76" stroke="#1f2937" strokeWidth="3" strokeLinecap="round" fill="none" />
        <path d="M102 76 Q107 82 112 76" stroke="#1f2937" strokeWidth="3" strokeLinecap="round" fill="none" />
      </motion.g>

      {/* Mouth — big happy smile */}
      <path d="M75 96 Q90 110 105 96" stroke="#1f2937" strokeWidth="3" strokeLinecap="round" fill="#be185d" />
      {/* Tongue tip */}
      <path d="M82 102 Q90 106 98 102 Q95 105 90 105 Q85 105 82 102 Z" fill="#fb7185" />
    </svg>
  );
}