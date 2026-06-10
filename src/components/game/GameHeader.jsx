import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useLang } from '@/lib/LanguageContext';

export default function GameHeader({ title, score, total, currentQ, totalQ, onPrevious }) {
  const { t } = useLang();

  return (
    <div className="flex items-center justify-between gap-3 mb-5 px-1 sm:px-2">
      <motion.button
        whileTap={{ scale: 0.9 }}
        whileHover={{ scale: 1.05 }}
        onClick={onPrevious}
        disabled={currentQ === 1}
        className="rounded-full w-12 h-12 flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed transition-all flex-shrink-0 bg-white text-game-purple border border-slate-200 shadow-sm hover:bg-slate-50"
      >
        <ArrowLeft className="w-5 h-5" />
      </motion.button>

      <div className="text-center min-w-0 flex-1">
        <h2 className="text-base sm:text-xl font-black leading-tight break-words text-slate-800">
          {title}
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 font-semibold mt-0.5">
          {t('question')} {currentQ} {t('of')} {totalQ}
        </p>
      </div>

      <div className="rounded-2xl px-3 sm:px-4 py-2 text-center flex-shrink-0 brand-gradient">
        <p className="text-[10px] text-white/90 font-black uppercase tracking-wider">{t('score')}</p>
        <p className="text-xl font-black text-white">
          {score}/{total}
        </p>
      </div>
    </div>
  );
}