import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

// ============================================================
// SATISFYING EFFECTS — kepuasan maksimum bila main mini games
// ============================================================
// 1. ScorePop — angka "+1" floating bila betul (juicy feedback)
// 2. StreakBadge — counter bila buat betul berturut-turut
// 3. fireRoundConfetti — confetti tengah skrin bila siap round
// 4. fireFinalCelebration — confetti besar dari 2 sisi bila habis game
// 5. triggerHaptic — vibrate device untuk feel
// ============================================================

export const triggerHaptic = (pattern = 30) => {
  try { if (navigator.vibrate) navigator.vibrate(pattern); } catch { /* ignore */ }
};

export const fireRoundConfetti = () => {
  try {
    confetti({
      particleCount: 70,
      spread: 75,
      origin: { y: 0.55 },
      colors: ['#F472B6', '#A855F7', '#FBBF24', '#22D3EE', '#34D399'],
      ticks: 120,
      gravity: 0.9,
      scalar: 1.05,
    });
  } catch { /* ignore */ }
};

// Big celebration — side cannons + center burst
export const fireFinalCelebration = () => {
  try {
    const duration = 1800;
    const end = Date.now() + duration;
    const colors = ['#F472B6', '#A855F7', '#FBBF24', '#22D3EE', '#34D399', '#FB923C'];

    // Side cannons
    (function frame() {
      confetti({ particleCount: 3, angle: 60, spread: 60, origin: { x: 0, y: 0.7 }, colors });
      confetti({ particleCount: 3, angle: 120, spread: 60, origin: { x: 1, y: 0.7 }, colors });
      if (Date.now() < end) requestAnimationFrame(frame);
    })();

    // Center burst (delayed)
    setTimeout(() => {
      confetti({ particleCount: 130, spread: 100, origin: { y: 0.55 }, colors, scalar: 1.2 });
    }, 200);

    setTimeout(() => {
      confetti({ particleCount: 80, spread: 120, startVelocity: 35, origin: { y: 0.5 }, colors, ticks: 200 });
    }, 600);
  } catch { /* ignore */ }
};

// ============================================================
// ScorePop — floating "+1 ⭐" bila betul
// ============================================================
export function ScorePop({ trigger }) {
  const [items, setItems] = useState([]);
  const idRef = useRef(0);

  useEffect(() => {
    if (!trigger) return;
    const id = ++idRef.current;
    setItems(prev => [...prev, { id }]);
    const t = setTimeout(() => {
      setItems(prev => prev.filter(i => i.id !== id));
    }, 1100);
    return () => clearTimeout(t);
  }, [trigger]);

  return (
    <div className="pointer-events-none fixed inset-0 z-[90] flex items-center justify-center">
      <AnimatePresence>
        {items.map((item) => (
          <motion.div
            key={item.id}
            initial={{ scale: 0.4, opacity: 0, y: 30 }}
            animate={{ scale: 1.2, opacity: 1, y: -40 }}
            exit={{ scale: 0.8, opacity: 0, y: -120 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="absolute text-5xl sm:text-6xl font-black"
            style={{
              color: '#FBBF24',
              textShadow: '0 4px 12px rgba(0,0,0,0.25), 0 0 30px rgba(251,191,36,0.6)',
              filter: 'drop-shadow(0 6px 16px rgba(251,191,36,0.4))',
            }}
          >
            +1 ⭐
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

// ============================================================
// StreakBadge — counter "🔥 3x" bila streak betul
// ============================================================
export function StreakBadge({ streak }) {
  return (
    <AnimatePresence>
      {streak >= 2 && (
        <motion.div
          key={streak}
          initial={{ scale: 0, rotate: -15, opacity: 0 }}
          animate={{ scale: 1, rotate: 0, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ type: 'spring', damping: 12, stiffness: 280 }}
          className="absolute -top-2 -right-2 z-10 px-2.5 py-1 rounded-full font-black text-xs text-white shadow-lg flex items-center gap-0.5"
          style={{
            background: 'linear-gradient(135deg, #F97316 0%, #EF4444 50%, #DC2626 100%)',
            boxShadow: '0 4px 12px rgba(239,68,68,0.5), 0 0 0 2px white',
          }}
        >
          <motion.span
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 1 }}
          >
            🔥
          </motion.span>
          <span>{streak}x</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ============================================================
// PulseGlow — soft glow di sekeliling element bila success
// ============================================================
export function PulseGlow({ active, color = '#34D399' }) {
  return (
    <AnimatePresence>
      {active && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: [0, 0.7, 0], scale: [0.9, 1.15, 1.3] }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
          className="absolute inset-0 rounded-[inherit] pointer-events-none"
          style={{ boxShadow: `0 0 40px 12px ${color}` }}
        />
      )}
    </AnimatePresence>
  );
}