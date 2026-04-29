import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { RotateCcw, Home, Share2, Trophy } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const stars = (score, total) => {
  const percentage = (score / total) * 100;
  if (percentage === 100) return 3;
  if (percentage >= 70) return 2;
  if (percentage >= 50) return 1;
  return 0;
};

export default function ScoreScreen({ score, total, stars: starCount, onPlayAgain }) {
  const [shareUrl, setShareUrl] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setShareUrl(window.location.href);
    }
  }, []);

  const percentage = Math.round((score / total) * 100);
  const messages = {
    0: '💪 Bagus! Coba lagi untuk dapat bintang!',
    1: '⭐ Hebat! Kau dapat 1 bintang!',
    2: '⭐⭐ Luar biasa! Kau dapat 2 bintang!',
    3: '⭐⭐⭐ Sempurna! Kau dapat 3 bintang!',
  };

  const handleShareScore = async () => {
    const text = `🎓 Aku dapat ${starCount}⭐ dalam permainan di Jom Belajar! Score: ${score}/${total} 🎮\n\nIkut aku belajar sambil bermain!`;
    try {
      const encodedText = encodeURIComponent(text);
      window.open(`https://wa.me/?text=${encodedText}`, '_blank');
      
      // Track event
      if (window.fbq) {
        window.fbq('track', 'Share', { value: starCount, currency: 'POINTS' });
      }
    } catch (e) {
      console.error('Share failed:', e);
    }
  };

  return (
    <div className="min-h-screen bg-pattern flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.8, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', damping: 15 }}
        className="clay rounded-3xl p-8 max-w-sm w-full text-center"
      >
        {/* Stars Animation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex justify-center gap-2 mb-6"
        >
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0, rotate: -180 }}
              animate={i < starCount ? { scale: 1, rotate: 0 } : { scale: 0.5, opacity: 0.3 }}
              transition={{ delay: 0.3 + i * 0.2 }}
              className="text-5xl"
            >
              ⭐
            </motion.div>
          ))}
        </motion.div>

        {/* Score */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <p className="text-6xl font-black text-game-purple mb-2">{score}/{total}</p>
          <p className="text-3xl font-black text-game-orange mb-4">{percentage}%</p>
          <p className="text-lg font-bold text-gray-700 mb-8">{messages[starCount]}</p>
        </motion.div>

        {/* Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="space-y-3"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onPlayAgain}
            className="w-full clay-button rounded-2xl py-4 px-6 font-black text-lg text-gray-800 flex items-center justify-center gap-2 hover:shadow-lg transition-all"
          >
            <RotateCcw className="w-5 h-5" />
            Main Lagi
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleShareScore}
            className="w-full bg-gradient-to-r from-green-400 to-green-500 text-white rounded-2xl py-4 px-6 font-black text-lg flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all"
          >
            <Share2 className="w-5 h-5" />
            Kongsi ke WhatsApp
          </motion.button>

          <Link to="/" className="block">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full bg-gradient-to-r from-game-purple to-purple-600 text-white rounded-2xl py-4 px-6 font-black text-lg flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all"
            >
              <Home className="w-5 h-5" />
              Balik ke Rumah
            </motion.button>
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}