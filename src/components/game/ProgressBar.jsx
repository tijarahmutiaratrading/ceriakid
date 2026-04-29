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
  
  const messageIndex = Math.floor((current / total) * messages.length);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6"
    >
      <div className="flex justify-between items-center mb-2">
        <span className="font-black text-gray-700">Soalan {current} daripada {total}</span>
        <span className="text-sm font-bold text-game-orange">⭐ {score}/{total}</span>
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-game-orange to-game-pink rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
      
      <motion.p
        key={messageIndex}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center text-sm font-bold text-game-purple mt-2"
      >
        {messages[messageIndex]}
      </motion.p>
    </motion.div>
  );
}