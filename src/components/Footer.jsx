import React from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function Footer() {
  const location = useLocation();

  // Only show footer on landing page
  if (location.pathname !== '/landing') {
    return null;
  }

  return (
    <motion.footer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="bg-gradient-to-r from-game-purple/10 via-game-pink/10 to-game-blue/10 border-t border-game-purple/20 mt-12"
    >
      <div className="max-w-lg mx-auto px-4 py-6">
        <div className="flex items-center justify-center gap-2 mb-3">
          <span className="text-2xl">🎓</span>
          <span className="text-lg font-black bg-gradient-to-r from-game-purple to-game-pink bg-clip-text text-transparent">Jom Belajar</span>
        </div>
        <p className="text-xs text-center text-gray-600 mb-3">
          Belajar sambil bermain, berkembang setiap hari! 🌟
        </p>
        <div className="flex justify-center gap-2 mb-3 text-xs">
          <span>✨ Pembelajaran Menyenangkan</span>
          <span className="text-game-purple">•</span>
          <span>📈 Progres Nyata</span>
        </div>
        <p className="text-xs text-center text-gray-500">
          © 2026 Jom Belajar. Dibuat dengan ❤️ untuk anak-anak Malaysia
        </p>
      </div>
    </motion.footer>
  );
}