import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Zap, ArrowRight, CheckCircle2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { useSelectedChild } from '@/lib/SelectedChildContext';

export default function DailyChallenge({ ageGroup }) {
  const { user } = useAuth() || {};
  const { selectedChild } = useSelectedChild() || {};
  const [challenge, setChallenge] = useState(null);
  const [completed, setCompleted] = useState(false);
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

      // Check completion status
      const activeChallenge = challenges[0];
      if (activeChallenge && user?.email) {
        const childName = selectedChild?.name || user.full_name || 'Default';
        const gameKey = `${ageGroup}-${activeChallenge.gameCategory}-${activeChallenge.gameIndex}`;
        const progress = await base44.entities.ChildGameProgress.filter({
          userEmail: user.email,
          childName,
          gameType: gameKey,
        });
        const todayStart = new Date(today + 'T00:00:00').getTime();
        const playedToday = progress.some(p => p.lastPlayedDate && new Date(p.lastPlayedDate).getTime() >= todayStart);
        setCompleted(playedToday);
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

  const gradientClass = completed
    ? 'from-emerald-400/85 via-teal-400/75 to-cyan-400/70 shadow-emerald-300/30'
    : 'from-yellow-400/90 via-amber-400/80 to-pink-400/80 shadow-pink-300/30';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative overflow-hidden rounded-[2rem] border border-white/40 bg-gradient-to-r ${gradientClass} p-5 md:p-6 text-white shadow-lg backdrop-blur-2xl transform-gpu [clip-path:inset(0_round_2rem)]`}
    >
      <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-white/15 blur-2xl" />
      <div className="relative z-10 flex items-center justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-2">
            {completed ? <CheckCircle2 className="w-5 h-5 text-yellow-200" /> : <Zap className="w-5 h-5 text-yellow-200" />}
            <span className="font-black text-sm tracking-wide">{completed ? 'CABARAN SELESAI ✓' : 'CABARAN HARIAN'}</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black mb-1" style={{ textShadow: '0 2px 6px rgba(0,0,0,0.35)' }}>
            {categoryEmojis[challenge.gameCategory]} {completed ? 'Syabas, Hebat!' : 'Mainkan & Menang'}
          </h3>
          <p className="text-white text-sm font-bold mb-4" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.4)' }}>
            {completed
              ? `Anda dah selesaikan cabaran hari ini. Datang balik esok untuk cabaran baru! 🌟`
              : `Selesaikan cabaran hari ini untuk +${challenge.bonusReward} bonus poin! ⭐`}
          </p>
          <Link to={`/play/${challenge.gameCategory}/${challenge.gameIndex}`}>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`min-h-12 px-6 py-3 rounded-full font-black flex items-center gap-2 shadow-lg shadow-white/40 hover:shadow-lg ${completed ? 'bg-white/95 text-emerald-700' : 'bg-white/95 text-orange-600'}`}
            >
              {completed ? 'Main Sekali Lagi' : 'Ambil Cabaran'} <ArrowRight className="w-4 h-4" />
            </motion.button>
          </Link>
        </div>
        <div className="text-5xl sm:text-6xl flex-shrink-0">{completed ? '🏆' : '🎯'}</div>
      </div>
    </motion.div>
  );
}