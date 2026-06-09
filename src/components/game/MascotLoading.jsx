import React from 'react';
import { motion } from 'framer-motion';

// Inline (non-overlay) mascot loading — render dalam content area, bukan fixed fullscreen.
// Guna mascot sama macam GameLoadingScreen tapi tak overlay supaya tak jadi double loading.
export default function MascotLoading({ message = 'Tunggu sebentar...' }) {
  return (
    <div className="relative flex flex-col items-center justify-center gap-5 py-16 min-h-[55vh]">
      {/* Floating sparkles */}
      {['✨', '⭐', '💫', '🌟'].map((s, i) => (
        <motion.div
          key={i}
          className="absolute text-xl pointer-events-none select-none opacity-50"
          style={{ top: `${15 + (i * 18) % 60}%`, left: `${15 + (i * 21) % 70}%` }}
          animate={{ y: [0, -14, 0], rotate: [0, 12, -12, 0] }}
          transition={{ duration: 3 + i * 0.4, repeat: Infinity, delay: i * 0.3, ease: 'easeInOut' }}
        >
          {s}
        </motion.div>
      ))}

      {/* Mascot */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 14, stiffness: 220 }}
        className="relative z-10"
      >
        <motion.div
          className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-24 h-3 rounded-full bg-black/20 blur-md"
          animate={{ scaleX: [1, 0.85, 1], opacity: [0.35, 0.2, 0.35] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          animate={{ y: [0, -10, 0], rotate: [0, -3, 3, 0] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
        >
          <img
            src="https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/934070eb4_ChatGPTImageJun42026at07_36_37AM.png"
            alt="CeriaKid Mascot"
            className="w-32 h-32 sm:w-36 sm:h-36 object-contain drop-shadow-2xl select-none"
            draggable={false}
          />
        </motion.div>
      </motion.div>

      {/* Message + dots */}
      <div className="relative z-10 flex items-center gap-2">
        <p className="text-slate-700 font-bold text-sm sm:text-base">{message}</p>
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="w-2 h-2 rounded-full bg-purple-500"
              animate={{ scale: [1, 1.6, 1], opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2, ease: 'easeInOut' }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}