import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Lightweight particle burst that erupts at the tap location.
// Listens to a custom 'answer-burst' window event so it works regardless of where the tap originated.
export default function AnswerBurst() {
  const [bursts, setBursts] = useState([]);

  useEffect(() => {
    const handler = (e) => {
      const { x, y, kind = 'correct' } = e.detail || {};
      if (x == null || y == null) return;
      const id = Date.now() + Math.random();
      const emojis = kind === 'correct'
        ? ['⭐', '✨', '💫', '🎉', '🌟', '💖']
        : ['💪', '🤔', '💭'];
      const particles = Array.from({ length: kind === 'correct' ? 12 : 5 }, (_, i) => ({
        id: i,
        emoji: emojis[Math.floor(Math.random() * emojis.length)],
        angle: (Math.PI * 2 * i) / (kind === 'correct' ? 12 : 5) + Math.random() * 0.5,
        distance: 70 + Math.random() * 60,
      }));
      setBursts((prev) => [...prev, { id, x, y, particles }]);
      setTimeout(() => setBursts((prev) => prev.filter((b) => b.id !== id)), 900);
    };
    window.addEventListener('answer-burst', handler);
    return () => window.removeEventListener('answer-burst', handler);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-[60]">
      <AnimatePresence>
        {bursts.map((b) => (
          <React.Fragment key={b.id}>
            {b.particles.map((p) => (
              <motion.span
                key={`${b.id}-${p.id}`}
                initial={{ x: b.x, y: b.y, scale: 0, opacity: 1 }}
                animate={{
                  x: b.x + Math.cos(p.angle) * p.distance,
                  y: b.y + Math.sin(p.angle) * p.distance,
                  scale: [0, 1.2, 0.8],
                  opacity: [1, 1, 0],
                }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="absolute text-2xl will-change-transform"
                style={{ left: 0, top: 0 }}
              >
                {p.emoji}
              </motion.span>
            ))}
          </React.Fragment>
        ))}
      </AnimatePresence>
    </div>
  );
}

// Helper to dispatch the burst from anywhere (e.g. after onAnswer)
export const triggerAnswerBurst = (x, y, kind = 'correct') => {
  window.dispatchEvent(new CustomEvent('answer-burst', { detail: { x, y, kind } }));
};