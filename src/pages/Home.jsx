import React from 'react';
import { motion } from 'framer-motion';
import { useLang } from '@/lib/LanguageContext';
import LanguageToggle from '@/components/game/LanguageToggle';
import GameCard from '@/components/home/GameCard';

export default function Home() {
  const { t } = useLang();

  const games = [
    { to: '/abc', emoji: '🔤', title: t('abcGame'), desc: t('abcDesc'), color: 'yellow' },
    { to: '/numbers', emoji: '🔢', title: t('numberGame'), desc: t('numberDesc'), color: 'pink' },
    { to: '/quiz', emoji: '🧩', title: t('quizGame'), desc: t('quizDesc'), color: 'blue' },
    { to: '/shapes', emoji: '🎨', title: t('shapeGame'), desc: t('shapeDesc'), color: 'green' },
    { to: '/scoreboard', emoji: '🏆', title: t('scoreboard'), desc: t('scoreDesc'), color: 'purple' },
  ];

  return (
    <div className="min-h-screen bg-pattern">
      <div className="max-w-lg mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div />
          <LanguageToggle />
        </div>

        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <motion.div
            className="text-7xl mb-3"
            animate={{ y: [0, -8, 0] }}
            transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
          >
            🎓
          </motion.div>
          <h1 className="text-4xl font-black bg-gradient-to-r from-game-purple via-game-pink to-game-orange bg-clip-text text-transparent">
            {t('appTitle')}
          </h1>
          <p className="text-lg font-bold text-muted-foreground mt-1">
            {t('appSubtitle')}
          </p>
        </motion.div>

        {/* Game Selection */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-sm font-extrabold text-muted-foreground uppercase tracking-wider mb-4 px-1"
        >
          {t('selectGame')} ✨
        </motion.p>

        <div className="grid grid-cols-2 gap-4">
          {games.map((game, i) => (
            <GameCard key={game.to} {...game} index={i} />
          ))}
        </div>

        {/* Footer decorations */}
        <motion.div
          className="text-center mt-8 text-3xl"
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ repeat: Infinity, duration: 3 }}
        >
          🌈 ⭐ 🎈
        </motion.div>
      </div>
    </div>
  );
}