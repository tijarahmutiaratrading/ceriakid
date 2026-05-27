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
        className="rounded-full w-12 h-12 flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed transition-all flex-shrink-0"
        style={{
          background: 'rgba(255,255,255,0.15)',
          backdropFilter: 'blur(16px)',
          border: '1.5px solid rgba(255,255,255,0.3)',
          boxShadow: '0 4px 16px rgba(0,0,0,0.2), inset 0 1px 1px rgba(255,255,255,0.3)',
          color: 'white',
        }}
      >
        <ArrowLeft className="w-5 h-5" />
      </motion.button>

      <div className="text-center min-w-0 flex-1">
        <h2 className="text-base sm:text-xl font-black leading-tight break-words text-white"
          style={{ textShadow: '0 2px 8px rgba(0,0,0,0.35)' }}
        >
          {title}
        </h2>
        <p className="text-xs sm:text-sm text-white/70 font-semibold mt-0.5">
          {t('question')} {currentQ} {t('of')} {totalQ}
        </p>
      </div>

      <div
        className="rounded-2xl px-3 sm:px-4 py-2 text-center flex-shrink-0"
        style={{
          background: 'linear-gradient(135deg, rgba(251,191,36,0.25), rgba(236,72,153,0.25))',
          backdropFilter: 'blur(16px)',
          border: '1.5px solid rgba(255,255,255,0.35)',
          boxShadow: '0 4px 16px rgba(236,72,153,0.25), inset 0 1px 1px rgba(255,255,255,0.4)',
        }}
      >
        <p className="text-[10px] text-white/80 font-black uppercase tracking-wider">{t('score')}</p>
        <p className="text-xl font-black text-white" style={{ textShadow: '0 2px 6px rgba(0,0,0,0.3)' }}>
          {score}/{total}
        </p>
      </div>
    </div>
  );
}