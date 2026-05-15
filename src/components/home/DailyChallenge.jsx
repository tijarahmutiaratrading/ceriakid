import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Zap, ArrowRight } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function DailyChallenge({ ageGroup }) {
  const [challenge, setChallenge] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTodayChallenge();
  }, [ageGroup]);

  const loadTodayChallenge = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const challenges = await base44.entities.DailyChallenge.filter({
        challengeDate: today,
        ageGroup: ageGroup,
      });

      if (challenges.length === 0) {
        // Create random challenge for today
        const categories = ['bahasa_melayu', 'english', 'mathematics', 'science', 'jawi'];
        const randomCategory = categories[Math.floor(Math.random() * categories.length)];
        const randomIndex = Math.floor(Math.random() * 10);

        const newChallenge = await base44.entities.DailyChallenge.create({
          challengeDate: today,
          gameCategory: randomCategory,
          gameIndex: randomIndex,
          bonusReward: 50,
          ageGroup: ageGroup,
        });
        setChallenge(newChallenge);
      } else {
        setChallenge(challenges[0]);
      }
    } catch (error) {
      console.error('Failed to load challenge:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !challenge) return null;

  const categoryEmojis = {
    bahasa_melayu: '🇲🇾',
    english: '🇬🇧',
    mathematics: '🔢',
    science: '🔬',
    jawi: '🕌',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3 }}
      className="relative overflow-hidden rounded-[1.75rem] border border-white/25 bg-gradient-to-br from-orange-400/90 via-red-500/85 to-pink-500/85 p-5 md:p-6 text-white shadow-2xl shadow-red-950/30 backdrop-blur-2xl transform-gpu [clip-path:inset(0_round_1.75rem)]"
    >
      {/* Animated rings around target */}
      <motion.div
        aria-hidden
        animate={{ scale: [1, 1.4, 1], opacity: [0.4, 0, 0.4] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeOut' }}
        className="absolute right-6 top-1/2 -translate-y-1/2 h-24 w-24 rounded-full border-2 border-white/60"
      />
      <motion.div
        aria-hidden
        animate={{ scale: [1, 1.6, 1], opacity: [0.3, 0, 0.3] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeOut', delay: 0.6 }}
        className="absolute right-6 top-1/2 -translate-y-1/2 h-24 w-24 rounded-full border-2 border-yellow-300/60"
      />
      <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-white/25 blur-2xl" />
      <div className="absolute -left-10 -bottom-10 h-32 w-32 rounded-full bg-yellow-300/30 blur-2xl" />

      {/* Shimmer */}
      <motion.div
        aria-hidden
        initial={{ x: '-150%' }}
        animate={{ x: '200%' }}
        transition={{ duration: 3, repeat: Infinity, repeatDelay: 4, ease: 'easeInOut' }}
        className="pointer-events-none absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/25 to-transparent skew-x-12"
      />

      <div className="relative z-10 flex items-center justify-between gap-4">
        <div className="min-w-0">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/20 backdrop-blur-sm px-3 py-1 ring-1 ring-white/30 mb-3">
            <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1.2, repeat: Infinity }}>
              <Zap className="w-4 h-4 text-yellow-300 drop-shadow" fill="currentColor" />
            </motion.div>
            <span className="font-black text-[11px] uppercase tracking-wider">Cabaran Harian</span>
          </div>
          <h3 className="text-2xl md:text-3xl font-black mb-1 drop-shadow-md leading-tight">
            {categoryEmojis[challenge.gameCategory]} Mainkan & Menang!
          </h3>
          <p className="text-white/95 text-sm font-bold mb-4 drop-shadow">
            Selesaikan untuk dapat <span className="rounded-md bg-yellow-300 px-1.5 py-0.5 text-orange-700">+{challenge.bonusReward} poin</span> ⭐
          </p>
          <Link to={`/play/${challenge.gameCategory}/${challenge.gameIndex}`}>
            <motion.button
              whileHover={{ scale: 1.05, gap: '0.75rem' }}
              whileTap={{ scale: 0.95 }}
              className="bg-white text-orange-600 px-5 py-2.5 rounded-full font-black text-sm flex items-center gap-2 shadow-xl ring-2 ring-white/50 hover:ring-yellow-300"
            >
              Mula Cabaran <ArrowRight className="w-4 h-4" />
            </motion.button>
          </Link>
        </div>
        <motion.div
          animate={{ rotate: [0, 8, -8, 0], scale: [1, 1.08, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className="text-6xl md:text-7xl drop-shadow-2xl relative z-10"
        >
          🎯
        </motion.div>
      </div>
    </motion.div>
  );
}