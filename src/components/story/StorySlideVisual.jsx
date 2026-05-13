import React from 'react';
import { motion } from 'framer-motion';

export default function StorySlideVisual({ visual, emoji = '📖', title = '', compact = false }) {
  const art = visual || {};
  const bg = art.bg || 'from-yellow-200 via-pink-200 to-purple-300';
  const main = art.main || emoji;
  const side = art.side || ['✨', '⭐', '🌈'];

  return (
    <div className={`relative w-full h-full overflow-hidden bg-gradient-to-br ${bg}`}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_35%_20%,rgba(255,255,255,0.55),transparent_32%)]" />
      <motion.div
        animate={{ y: [0, -12, 0], rotate: [-2, 2, -2], scale: [1, 1.04, 1] }}
        transition={{ duration: 4, repeat: Infinity }}
        className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 ${compact ? 'text-8xl' : 'text-[9rem] sm:text-[12rem]'} drop-shadow-2xl`}
      >
        {main}
      </motion.div>

      {side.map((item, index) => (
        <motion.div
          key={`${item}-${index}`}
          animate={{ y: [0, index % 2 ? 14 : -14, 0], scale: [1, 1.16, 1], rotate: [0, index % 2 ? 8 : -8, 0] }}
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

      <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-white/85 via-white/25 to-transparent" />
      {title && !compact && (
        <div className="absolute left-4 right-4 bottom-4 text-center text-purple-900 font-black text-sm sm:text-base bg-white/75 backdrop-blur-md rounded-2xl px-4 py-2.5 shadow-lg border border-white/60">
          {title}
        </div>
      )}
    </div>
  );
}