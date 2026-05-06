import React from 'react';
import { motion } from 'framer-motion';

export default function StorySlideVisual({ visual, emoji = '📖', title = '', compact = false }) {
  const art = visual || {};
  const bg = art.bg || 'from-yellow-200 via-pink-200 to-purple-300';
  const main = art.main || emoji;
  const side = art.side || ['✨', '⭐', '🌈'];

  return (
    <div className={`relative w-full h-full overflow-hidden bg-gradient-to-br ${bg}`}>
      <motion.div
        animate={{ y: [0, -10, 0], rotate: [-2, 2, -2] }}
        transition={{ duration: 4, repeat: Infinity }}
        className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 ${compact ? 'text-8xl' : 'text-[9rem] sm:text-[11rem]'} drop-shadow-2xl`}
      >
        {main}
      </motion.div>

      {side.map((item, index) => (
        <motion.div
          key={`${item}-${index}`}
          animate={{ y: [0, index % 2 ? 12 : -12, 0], scale: [1, 1.12, 1] }}
          transition={{ duration: 3 + index, repeat: Infinity, delay: index * 0.35 }}
          className={`absolute ${compact ? 'text-3xl' : 'text-5xl'} drop-shadow-lg`}
          style={{
            left: `${12 + (index * 27) % 72}%`,
            top: `${12 + (index * 19) % 68}%`,
          }}
        >
          {item}
        </motion.div>
      ))}

      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-white/80 to-transparent" />
      {title && !compact && (
        <div className="absolute left-4 right-4 bottom-4 text-center text-purple-900 font-black text-sm bg-white/65 rounded-2xl px-4 py-2 shadow-lg">
          {title}
        </div>
      )}
    </div>
  );
}