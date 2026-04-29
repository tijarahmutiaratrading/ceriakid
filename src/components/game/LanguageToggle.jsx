import React from 'react';
import { motion } from 'framer-motion';
import { useLang } from '@/lib/LanguageContext';

export default function LanguageToggle() {
  const langContext = useLang();
  
  if (!langContext) {
    return null;
  }
  
  const { lang, toggleLang } = langContext;

  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      whileHover={{ scale: 1.05 }}
      onClick={toggleLang}
      className="clay-button rounded-full px-4 py-2 flex items-center gap-2 text-sm font-bold"
    >
      <span className="text-lg">{lang === 'bm' ? '🇲🇾' : '🇬🇧'}</span>
      <span>{lang === 'bm' ? 'BM' : 'EN'}</span>
    </motion.button>
  );
}