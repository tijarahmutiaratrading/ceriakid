import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { Star, RotateCcw, Home, Sparkles, Loader2 } from 'lucide-react';
import { useLang } from '@/lib/LanguageContext';

export default function ScoreScreen({ score, total, stars, onPlayAgain, onGenerateNew, isPremium }) {
  const { t } = useLang();

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

  return (
    <div className="min-h-screen bg-pattern flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 12 }}
        className="clay rounded-3xl p-8 max-w-sm w-full text-center"
      >
        <motion.div
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-5xl mb-2"
        >
          {stars >= 2 ? '🏆' : '🎮'}
        </motion.div>

        <h2 className="text-3xl font-black mb-1">{t('finish')}</h2>
        <p className="text-lg font-bold text-muted-foreground mb-6">
          {messages[stars]}
        </p>

        {/* Stars display */}
        <div className="flex justify-center gap-3 mb-6">
          {[1, 2, 3].map((i) => (
            <motion.div
              key={i}
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.3 + i * 0.2, type: 'spring', damping: 8 }}
            >
              <Star
                className={`w-14 h-14 ${
                  i <= stars
                    ? 'fill-game-yellow text-game-yellow drop-shadow-lg'
                    : 'text-gray-300'
                }`}
              />
            </motion.div>
          ))}
        </div>

        {/* Score */}
        <div className="clay rounded-2xl p-4 mb-6 inline-block">
          <p className="text-sm font-bold text-muted-foreground">{t('finalScore')}</p>
          <p className="text-4xl font-black text-game-purple">{score}/{total}</p>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 mb-3">
          <motion.button
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.03 }}
            onClick={onPlayAgain}
            className="flex-1 clay-button rounded-2xl py-3.5 px-5 bg-game-green/20 flex items-center justify-center gap-2 font-bold text-base"
          >
            <RotateCcw className="w-6 h-6" />
            {t('playAgain')}
          </motion.button>

          <Link to="/" className="flex-1">
            <motion.button
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.03 }}
              className="w-full clay-button rounded-2xl py-3.5 px-5 bg-game-blue/20 flex items-center justify-center gap-2 font-bold text-base"
            >
              <Home className="w-7 h-7" />
              {t('backToMenu')}
            </motion.button>
          </Link>
        </div>

        {/* AI Generate New Questions Button */}
        {isPremium ? (
          <motion.button
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.02 }}
            onClick={onGenerateNew}
            className="w-full py-3.5 px-5 rounded-2xl font-bold text-base flex items-center justify-center gap-2 text-white brand-gradient-br whitespace-nowrap"
          >
            <Sparkles className="w-5 h-5" /> Main Semula (Soalan Berbeza)
          </motion.button>
        ) : (
          <Link to="/#pricing">
            <motion.button
              whileTap={{ scale: 0.95 }}
              className="w-full py-3 px-6 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 text-gray-500 border-2 border-dashed border-gray-300"
            >
              <Sparkles className="w-4 h-4" /> 🔒 Jana Soalan Baru (Premium sahaja)
            </motion.button>
          </Link>
        )}
      </motion.div>
    </div>
  );
}