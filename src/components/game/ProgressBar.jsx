import React from 'react';
import { motion } from 'framer-motion';

export default function ProgressBar({ current, total, score }) {
  const percentage = (current / total) * 100;
  const messages = [
    'Satu lagi! 💪',
    'Setengah jalan! 🏃',
    'Hampir selesai! 🎯',
    'Langkah akhir! 🏁',
  ];

  const messageIndex = Math.min(messages.length - 1, Math.floor((current / total) * messages.length));

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6"
    >
      <div className="flex justify-between items-center mb-2 px-1">
        <span className="font-black text-white/90 text-sm" style={{ textShadow: '0 1px 4px rgba(0,0,0,0.3)' }}>
          Soalan {current} / {total}
        </span>
        <span className="text-sm font-black text-yellow-300 flex items-center gap-1" style={{ textShadow: '0 1px 4px rgba(0,0,0,0.3)' }}>
          ⭐ {score}/{total}
        </span>
      </div>

      <div
        className="w-full rounded-full h-3.5 overflow-hidden relative"
        style={{
          background: 'rgba(255,255,255,0.12)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255,255,255,0.2)',
          boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.2)',
        }}
      >
        <motion.div
          className="h-full rounded-full relative"
          style={{
            background: 'linear-gradient(90deg, #fbbf24, #ec4899, #8b5cf6)',
            boxShadow: '0 0 12px rgba(236,72,153,0.5), inset 0 1px 1px rgba(255,255,255,0.4)',
          }}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <div className="absolute inset-0 rounded-full opacity-50" style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.4), transparent)' }} />
          {/* Glow tip */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-white" style={{ boxShadow: '0 0 10px 3px rgba(255,255,255,0.8)' }} />
        </motion.div>
      </div>

      <motion.p
        key={messageIndex}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center text-sm font-black text-yellow-300 mt-2"
        style={{ textShadow: '0 1px 6px rgba(0,0,0,0.35)' }}
      >
        {messages[messageIndex]}
      </motion.p>
    </motion.div>
  );
}