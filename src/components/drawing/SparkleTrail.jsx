import React, { useEffect, useState, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

// Lightweight sparkle particles that follow the active drawing pointer.
// Spawns at most ~8 sparkles per second to keep things cheap on mobile.
// Caller passes the "isActive" flag (true while pointer is down on the canvas)
// and a containerRef for relative positioning if needed.
const SPARKLES = ['✨', '⭐', '💫', '🌟', '🎈'];

export default function SparkleTrail({ enabled = true }) {
  const [particles, setParticles] = useState([]);
  const lastSpawn = useRef(0);

  useEffect(() => {
    if (!enabled) return;
    const handlePointer = (e) => {
      // Only show sparkles when pointer is pressed (drawing)
      if (e.buttons === 0 && e.pointerType !== 'touch') return;
      const now = performance.now();
      if (now - lastSpawn.current < 90) return; // throttle
      lastSpawn.current = now;

      const id = `sp_${now}_${Math.random().toString(36).slice(2, 6)}`;
      const emoji = SPARKLES[Math.floor(Math.random() * SPARKLES.length)];
      const drift = (Math.random() - 0.5) * 60;
      setParticles((prev) => [
        ...prev.slice(-12),
        { id, x: e.clientX, y: e.clientY, emoji, drift },
      ]);
      // auto-cleanup
      setTimeout(() => {
        setParticles((prev) => prev.filter((p) => p.id !== id));
      }, 900);
    };

    window.addEventListener('pointermove', handlePointer);
    return () => window.removeEventListener('pointermove', handlePointer);
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[105] overflow-hidden">
      <AnimatePresence>
        {particles.map((p) => (
          <motion.span
            key={p.id}
            initial={{ opacity: 0.95, scale: 0.6, x: p.x, y: p.y }}
            animate={{ opacity: 0, scale: 1.5, x: p.x + p.drift, y: p.y - 60 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.85, ease: 'easeOut' }}
            className="absolute text-xl select-none"
            style={{ left: -10, top: -10 }}
          >
            {p.emoji}
          </motion.span>
        ))}
      </AnimatePresence>
    </div>
  );
}