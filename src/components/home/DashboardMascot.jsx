import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const MASCOT_URL = 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/934070eb4_ChatGPTImageJun42026at07_36_37AM.png';
const DISMISS_KEY = '__mascot_dismissed_session';

// Rotating tips/encouragement messages
const TIPS = [
  '👋 Hai! Jom main game hari ni!',
  '🌟 Anak hebat, teruskan belajar ya!',
  '🎯 Tanya Cikgu AI kalau soalan susah!',
  '🔥 5 minit sehari pun dah cukup!',
  '🏆 Tengok markah anak di Prestasi!',
  '🎨 Jom lukis di Studio Lukisan!',
  '💡 Belajar pagi lagi seronok tau!',
];

// Floating mascot helper — bottom-left of dashboard.
// Idle sway + periodic wave. Tap to show rotating tip. Dismissable for session.
export default function DashboardMascot() {
  const [dismissed, setDismissed] = useState(false);
  const [bubbleOpen, setBubbleOpen] = useState(false);
  const [tipIndex, setTipIndex] = useState(0);
  const [waveTrigger, setWaveTrigger] = useState(0);
  const waveTimerRef = useRef(null);

  // Restore dismiss state for this session + auto-greet after mount
  useEffect(() => {
    try {
      if (sessionStorage.getItem(DISMISS_KEY) === '1') {
        setDismissed(true);
        return;
      }
    } catch { /* ignore */ }
    // Auto-show first bubble after small delay (greeting)
    const greet = setTimeout(() => setBubbleOpen(true), 1500);
    return () => clearTimeout(greet);
  }, []);

  // Periodic wave + rotate tip + re-open bubble every 12s
  useEffect(() => {
    if (dismissed) return;
    waveTimerRef.current = setInterval(() => {
      setWaveTrigger((v) => v + 1);
      setTipIndex((i) => (i + 1) % TIPS.length);
      setBubbleOpen(true);
    }, 12000);
    return () => clearInterval(waveTimerRef.current);
  }, [dismissed]);

  // Auto-hide bubble after 6s
  useEffect(() => {
    if (!bubbleOpen) return;
    const t = setTimeout(() => setBubbleOpen(false), 6000);
    return () => clearTimeout(t);
  }, [bubbleOpen, tipIndex]);

  const handleTap = () => {
    setTipIndex((i) => (i + 1) % TIPS.length);
    setBubbleOpen(true);
  };

  const handleDismiss = (e) => {
    e.stopPropagation();
    try { sessionStorage.setItem(DISMISS_KEY, '1'); } catch { /* ignore */ }
    setDismissed(true);
  };

  if (dismissed) return null;

  return (
    <div className="fixed bottom-2 -right-3 sm:right-4 sm:bottom-4 z-50 pointer-events-none select-none">
      <div className="relative pointer-events-auto">
        {/* Speech bubble */}
        <AnimatePresence>
          {bubbleOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 360, damping: 24 }}
              className="absolute bottom-20 sm:bottom-20 right-[78%] w-24 sm:w-36 rounded-2xl shadow-2xl px-2 py-1 sm:px-2.5 sm:py-1.5"
              style={{ background: 'linear-gradient(135deg, #FDBA74, #FB923C)' }}
            >
              <p className="text-white text-[8px] sm:text-[10px] font-black leading-tight drop-shadow-sm line-clamp-2">{TIPS[tipIndex]}</p>
              {/* Tail — 2 small puff circles pointing toward mascot */}
              <div className="absolute -right-1.5 bottom-2 w-2.5 h-2.5 rounded-full" style={{ background: '#FB923C' }} />
              <div className="absolute -right-3 bottom-0.5 w-1.5 h-1.5 rounded-full" style={{ background: '#FB923C' }} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dismiss button (only on hover/touch) */}
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Sembunyi mascot"
          className="absolute -top-1 -left-1 z-10 w-6 h-6 rounded-full bg-slate-900/80 text-white flex items-center justify-center shadow-lg opacity-0 hover:opacity-100 focus:opacity-100 transition-opacity"
        >
          <X className="w-3.5 h-3.5" />
        </button>

        {/* Mascot — idle sway + wave on key change */}
        <motion.button
          type="button"
          onClick={handleTap}
          aria-label="Tap untuk tip"
          className="group relative block"
          animate={{
            y: [0, -6, 0],
            rotate: [0, -2, 2, 0],
          }}
          transition={{
            duration: 3.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
        >
          <motion.img
            key={waveTrigger}
            src={MASCOT_URL}
            alt="Mascot CeriaKid"
            className="w-28 h-28 sm:w-36 sm:h-36 lg:w-44 lg:h-44 object-contain drop-shadow-2xl"
            initial={{ rotate: 0 }}
            animate={{ rotate: [0, -12, 8, -6, 0] }}
            transition={{ duration: 1.2, ease: 'easeInOut' }}
            draggable={false}
          />
          {/* Soft glow under mascot */}
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-20 sm:w-24 h-2.5 sm:h-3 rounded-full bg-orange-400/30 blur-md" />
        </motion.button>
      </div>
    </div>
  );
}