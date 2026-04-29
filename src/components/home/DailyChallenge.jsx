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
      className="bg-gradient-to-r from-orange-400 to-red-500 rounded-3xl p-6 text-white mb-6 shadow-lg"
    >
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-5 h-5 text-yellow-300" />
            <span className="font-black text-sm">CABARAN HARIAN</span>
          </div>
          <h3 className="text-2xl font-black mb-1">
            {categoryEmojis[challenge.gameCategory]} Mainkan & Menang
          </h3>
          <p className="text-white/80 text-sm mb-4">
            Selesaikan cabaran hari ini untuk +{challenge.bonusReward} bonus poin! ⭐
          </p>
          <Link to={`/play/${challenge.gameCategory}/${challenge.gameIndex}`}>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white text-orange-600 px-6 py-2 rounded-full font-black flex items-center gap-2"
            >
              Ambil Cabaran <ArrowRight className="w-4 h-4" />
            </motion.button>
          </Link>
        </div>
        <div className="text-6xl">🎯</div>
      </div>
    </motion.div>
  );
}