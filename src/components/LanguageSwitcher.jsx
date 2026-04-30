import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, ChevronDown } from 'lucide-react';
import { useLang } from '@/lib/LanguageContext';

const languages = [
  { code: 'bm', name: 'Bahasa Melayu', flag: '🇲🇾' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'zh', name: '中文 (Simplified)', flag: '🇨🇳' },
  { code: 'ta', name: 'தமிழ்', flag: '🇮🇳' },
];

export default function LanguageSwitcher() {
  const { lang, setLanguage } = useLang();
  const [isOpen, setIsOpen] = useState(false);

  const currentLang = languages.find(l => l.code === lang);

  return (
    <div className="relative z-50">
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-8 h-8 bg-white border border-game-purple/30 rounded-full hover:border-game-purple transition-all shadow-sm text-lg"
      >
        {currentLang?.flag}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0"
            />
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className="absolute bottom-full mb-2 right-0 bg-white border-2 border-game-purple/20 rounded-2xl shadow-lg overflow-hidden w-56"
            >
              {languages.map(l => (
                <motion.button
                  key={l.code}
                  whileHover={{ x: 4 }}
                  onClick={() => {
                    setLanguage(l.code);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-4 py-3 flex items-center gap-3 font-bold text-sm transition-all ${
                    lang === l.code
                      ? 'bg-game-purple text-white'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span className="text-lg">{l.flag}</span>
                  <span>{l.name}</span>
                </motion.button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}