import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLang } from '@/lib/LanguageContext';

export default function GameHeader({ title, score, total, currentQ, totalQ, onPrevious }) {
  const { t } = useLang();

  return (
    <div className="flex items-center justify-between mb-6 px-2">
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={onPrevious}
        disabled={currentQ === 1}
        className="clay-button rounded-full w-12 h-12 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ArrowLeft className="w-6 h-6" />
      </motion.button>

      <div className="text-center">
        <h2 className="text-xl font-extrabold">{title}</h2>
        <p className="text-sm text-muted-foreground font-semibold">
          {t('question')} {currentQ} {t('of')} {totalQ}
        </p>
      </div>

      <div className="clay rounded-2xl px-4 py-2 text-center">
        <p className="text-xs text-muted-foreground font-bold">{t('score')}</p>
        <p className="text-xl font-black text-game-purple">{score}/{total}</p>
      </div>
    </div>
  );
}