import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useLang } from '@/lib/LanguageContext';

export default function GameHeader({ title, score, total, currentQ, totalQ, onPrevious }) {
  const { t } = useLang();

  return (
    <div className="flex items-center justify-between gap-3 mb-5 px-1 sm:px-2">
      <motion.button
        whileTap={{ scale: 0.92 }}
        onClick={onPrevious}
        disabled={currentQ === 1}
        className="rounded-xl w-11 h-11 flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed transition-all flex-shrink-0 bg-white/10 text-white ring-1 ring-white/15 shadow-sm hover:bg-white/20"
      >
        <ArrowLeft className="w-5 h-5" />
      </motion.button>

      <div className="text-center min-w-0 flex-1">
        <h2 className="text-base sm:text-xl font-black leading-tight break-words text-white">
          {title}
        </h2>
        <p className="text-xs sm:text-sm text-white/50 font-semibold mt-0.5">
          {t('question')} {currentQ} {t('of')} {totalQ}
        </p>
      </div>

      <div className="rounded-xl px-3.5 py-2 text-center flex-shrink-0 brand-gradient-br">
        <p style={{ color: 'rgba(255,255,255,0.6)' }} className="text-[9px] font-black uppercase tracking-[0.15em]">{t('score')}</p>
        <p style={{ color: '#ffffff' }} className="text-lg font-black tabular-nums leading-tight">
          {score}/{total}
        </p>
      </div>
    </div>
  );
}