import React from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function Footer() {
  const location = useLocation();

  // Don't show footer on landing & pricing
  if (location.pathname === '/landing' || location.pathname === '/pricing') {
    return null;
  }

  return (
    <motion.footer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="bg-gradient-to-t from-game-purple/5 to-transparent border-t border-game-purple/10 mt-12"
    >
      <div className="max-w-lg mx-auto px-4 py-8 text-center text-sm text-gray-600">
        <p className="font-semibold mb-2">🎓 Jom Belajar</p>
        <p className="text-xs mb-4">Platform pembelajaran interaktif untuk anak-anak</p>
        <p className="text-xs text-gray-500">
          © 2026 Jom Belajar. Semua hak terpelihara. ❤️
        </p>
      </div>
    </motion.footer>
  );
}