import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { Star, RotateCcw, Home, Sparkles, Loader2 } from 'lucide-react';
import { useLang } from '@/lib/LanguageContext';
import ReviewPromptModal from '@/components/game/ReviewPromptModal';

export default function ScoreScreen({ score, total, stars, onPlayAgain, onGenerateNew, isPremium }) {
  const { t } = useLang();
  const [showReviewPrompt, setShowReviewPrompt] = useState(false);

  // Track perfect scores — trigger review prompt selepas 5 kali 3-star
  useEffect(() => {
    if (stars < 3) return;
    const dismissed = localStorage.getItem('review_prompt_dismissed');
    if (dismissed) return;
    const current = parseInt(localStorage.getItem('perfect_scores_count') || '0', 10);
    const next = current + 1;
    localStorage.setItem('perfect_scores_count', String(next));
    if (next >= 5) {
      // Delay supaya confetti settle dulu
      const timer = setTimeout(() => setShowReviewPrompt(true), 2500);
      return () => clearTimeout(timer);
    }
  }, [stars]);

  useEffect(() => {
    if (stars < 2) return;

    const colors = ['#f59e0b', '#ec4899', '#3b82f6', '#10b981', '#8b5cf6', '#fbbf24'];
    const isPerfect = stars >= 3;

    // Initial BIG burst — celebrate first sight
    confetti({
      particleCount: isPerfect ? 200 : 100,
      spread: 90,
      origin: { y: 0.5 },
      colors,
      startVelocity: 45,
      scalar: isPerfect ? 1.3 : 1,
    });

    // Side cannons untuk perfect score sahaja — extra wow effect
    if (isPerfect) {
      setTimeout(() => {
        confetti({ particleCount: 80, angle: 60, spread: 55, origin: { x: 0, y: 0.7 }, colors });
        confetti({ particleCount: 80, angle: 120, spread: 55, origin: { x: 1, y: 0.7 }, colors });
      }, 250);
    }

    // Continuous sparkle rain
    const duration = isPerfect ? 3500 : 2000;
    const end = Date.now() + duration;
    const interval = setInterval(() => {
      if (Date.now() > end) return clearInterval(interval);
      confetti({
        particleCount: isPerfect ? 40 : 25,
        angle: Math.random() * 360,
        spread: 70,
        origin: { x: Math.random(), y: Math.random() * 0.5 },
        colors,
        scalar: Math.random() * 0.5 + 0.7,
      });
    }, 200);
    return () => clearInterval(interval);
  }, [stars]);

  const messages = [
    t('keepTrying'),
    t('keepTrying'),
    t('greatJob'),
    t('awesome'),
  ];

  const percentage = total > 0 ? Math.round((score / total) * 100) : 0;

  return (
    <div className="min-h-screen w-full overflow-x-hidden flex items-center justify-center p-4 sm:p-6 relative" style={{ background: '#fafafa' }}>
      {/* Subtle grid pattern — selari dengan GamePlayer */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.015]"
        style={{
          backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', damping: 16, stiffness: 220 }}
        className="relative w-full max-w-md sm:max-w-lg rounded-3xl p-6 sm:p-10 text-center"
        style={{
          background: 'rgba(255,255,255,0.7)',
          backdropFilter: 'blur(24px) saturate(160%)',
          WebkitBackdropFilter: 'blur(24px) saturate(160%)',
          border: '1px solid rgba(255,255,255,0.8)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.1)',
        }}
      >
        {/* Trophy badge */}
        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.15, type: 'spring', damping: 10 }}
          className="mx-auto mb-4 w-20 h-20 sm:w-24 sm:h-24 rounded-3xl flex items-center justify-center text-4xl sm:text-5xl brand-gradient-br shadow-lg"
        >
          {stars >= 2 ? '🏆' : '🎮'}
        </motion.div>

        <h2 className="text-2xl sm:text-4xl font-black text-slate-900 mb-1">{t('finish')}</h2>
        <p className="text-base sm:text-lg font-bold text-slate-500 mb-6">
          {messages[stars]}
        </p>

        {/* Stars display */}
        <div className="flex justify-center gap-2 sm:gap-4 mb-6">
          {[1, 2, 3].map((i) => (
            <motion.div
              key={i}
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.3 + i * 0.2, type: 'spring', damping: 8 }}
            >
              <Star
                className={`w-12 h-12 sm:w-16 sm:h-16 ${
                  i <= stars
                    ? 'fill-game-yellow text-game-yellow drop-shadow-lg'
                    : 'text-slate-200'
                }`}
              />
            </motion.div>
          ))}
        </div>

        {/* Score card */}
        <div className="rounded-2xl p-5 mb-6 bg-white/60 ring-1 ring-slate-200/80 shadow-sm">
          <p className="text-xs font-black uppercase tracking-[0.15em] text-slate-400 mb-1">{t('finalScore')}</p>
          <p className="text-4xl sm:text-5xl font-black text-brand-gradient tabular-nums leading-none">{score}<span className="text-slate-300">/{total}</span></p>
          {/* Progress */}
          <div className="w-full h-2 rounded-full bg-slate-200/70 mt-4 overflow-hidden">
            <motion.div
              className="h-full rounded-full brand-gradient"
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ delay: 0.5, duration: 0.6, ease: 'easeOut' }}
            />
          </div>
          <p className="text-xs font-bold text-slate-400 mt-2 tabular-nums">{percentage}%</p>
        </div>

        {/* Buttons */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          <motion.button
            whileTap={{ scale: 0.96 }}
            whileHover={{ scale: 1.03 }}
            onClick={onPlayAgain}
            className="rounded-2xl py-3.5 px-4 bg-white ring-1 ring-slate-200 shadow-sm hover:bg-slate-50 flex items-center justify-center gap-2 font-extrabold text-sm sm:text-base text-slate-700 transition-colors"
          >
            <RotateCcw className="w-5 h-5" />
            {t('playAgain')}
          </motion.button>

          <Link to="/" className="w-full">
            <motion.button
              whileTap={{ scale: 0.96 }}
              whileHover={{ scale: 1.03 }}
              className="w-full rounded-2xl py-3.5 px-4 bg-white ring-1 ring-slate-200 shadow-sm hover:bg-slate-50 flex items-center justify-center gap-2 font-extrabold text-sm sm:text-base text-slate-700 transition-colors"
            >
              <Home className="w-5 h-5" />
              {t('backToMenu')}
            </motion.button>
          </Link>
        </div>

        {/* Review prompt modal — appears selepas 5 perfect scores */}
        <ReviewPromptModal open={showReviewPrompt} onClose={() => setShowReviewPrompt(false)} />

        {/* AI Generate New Questions Button */}
        {isPremium ? (
          <motion.button
            whileTap={{ scale: 0.96 }}
            whileHover={{ scale: 1.02 }}
            onClick={onGenerateNew}
            className="w-full py-3.5 px-6 rounded-2xl font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 text-white brand-gradient-br shadow-lg"
          >
            <Sparkles className="w-5 h-5" /> 🔀 Main Semula (Soalan Berbeza)
          </motion.button>
        ) : (
          <Link to="/#pricing">
            <motion.button
              whileTap={{ scale: 0.96 }}
              className="w-full py-3 px-6 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 text-slate-400 border-2 border-dashed border-slate-300 hover:bg-slate-50 transition-colors"
            >
              <Sparkles className="w-4 h-4" /> 🔒 Jana Soalan Baru (Premium sahaja)
            </motion.button>
          </Link>
        )}
      </motion.div>
    </div>
  );
}