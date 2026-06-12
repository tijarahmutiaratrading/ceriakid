import React from 'react';
import { motion } from 'framer-motion';

export default function ProgressBar({ current, total, score, dark = false }) {
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
        <span className={`font-bold text-xs ${dark ? 'text-white/50' : 'text-slate-400'}`}>
          Soalan {current} / {total}
        </span>
        <span className={`text-xs font-bold flex items-center gap-1 tabular-nums ${dark ? 'text-white/60' : 'text-slate-500'}`}>
          ⭐ {score}/{total}
        </span>
      </div>

      <div className={`w-full rounded-full h-2.5 overflow-hidden relative ${dark ? 'bg-white/10' : 'bg-slate-200/70'}`}>
        <motion.div
          className="h-full rounded-full brand-gradient"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>

      <motion.p
        key={messageIndex}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`text-center text-xs font-bold mt-2 ${dark ? 'text-white/45' : 'text-slate-400'}`}
      >
        {messages[messageIndex]}
      </motion.p>
    </motion.div>
  );
}