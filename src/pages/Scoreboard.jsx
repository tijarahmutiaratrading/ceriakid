import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Trash2, Trophy, BookOpen, Hash, Brain, Palette } from 'lucide-react';
import { useLang } from '@/lib/LanguageContext';
import { getScores, clearScores } from '@/lib/gameData';
import AppHeader from '@/components/AppHeader';

const gameIcons = {
  abc: { emoji: '🔤' },
  numbers: { emoji: '🔢' },
  quiz: { emoji: '🧩' },
  shapes: { emoji: '🎨' },
};

const gameNames = {
  bm: { abc: 'Huruf ABC', numbers: 'Nombor 123', quiz: 'Teka-teki Kuiz', shapes: 'Warna & Bentuk' },
  en: { abc: 'ABC Letters', numbers: 'Numbers 123', quiz: 'Quiz Puzzle', shapes: 'Colors & Shapes' },
};

export default function Scoreboard() {
  const { t, lang } = useLang();
  const [scores, setScores] = useState(getScores());

  const bestScores = useMemo(() => {
    const best = {};
    scores.forEach(s => {
      if (!best[s.gameType] || s.stars > best[s.gameType].stars) {
        best[s.gameType] = s;
      }
    });
    return best;
  }, [scores]);

  const totalStars = useMemo(() => {
    return scores.reduce((sum, s) => sum + s.stars, 0);
  }, [scores]);

  const handleClear = () => {
    clearScores();
    setScores([]);
  };

  const recentScores = [...scores].reverse().slice(0, 10);

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden font-nunito bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 relative">
      {/* Floating orbs background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none max-w-full">
        <div className="absolute -top-48 -right-40 md:-top-96 md:-right-96 w-[300px] h-[300px] md:w-[600px] md:h-[600px] bg-yellow-300/20 rounded-full mix-blend-screen filter blur-3xl animate-float" />
        <div className="absolute top-1/3 -left-32 md:top-1/2 md:-left-64 w-[250px] h-[250px] md:w-[500px] md:h-[500px] bg-cyan-300/15 rounded-full mix-blend-screen filter blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute -bottom-24 right-1/4 md:-bottom-32 md:right-1/3 w-[350px] h-[350px] md:w-[700px] md:h-[700px] bg-pink-300/10 rounded-full mix-blend-screen filter blur-3xl animate-float" style={{ animationDelay: '4s' }} />
      </div>

      <AppHeader showBack={true} backTo="/dashboard" />

      <div className="relative w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-32 pt-20 md:pt-24 overflow-x-hidden">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-5 p-5 rounded-3xl flex items-center justify-between"
          style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.4)' }}
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/30 flex items-center justify-center text-3xl shadow-inner flex-shrink-0">🏆</div>
            <div>
              <h1 className="text-2xl font-black text-white leading-tight">{t('scoreboard')}</h1>
              <p className="text-white/70 text-xs font-semibold mt-0.5">{scores.length} rekod permainan</p>
            </div>
          </div>
          {scores.length > 0 && (
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleClear}
              className="w-11 h-11 rounded-2xl flex items-center justify-center bg-red-500/20 hover:bg-red-500/40 transition-all border border-red-300/30"
            >
              <Trash2 className="w-4 h-4 text-red-300" />
            </motion.button>
          )}
        </motion.div>

        {scores.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl p-10 text-center"
            style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.3)' }}
          >
            <div className="text-5xl mb-4">🎮</div>
            <p className="text-white font-black text-lg mb-2">{t('noScores')}</p>
            <p className="text-white/60 text-sm">Main permainan untuk rekodkan skor!</p>
          </motion.div>
        ) : (
          <>
            {/* Total Stars */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.05 }}
              className="rounded-3xl p-6 text-center mb-5"
              style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.4)' }}
            >
              <p className="text-white/70 text-xs font-black uppercase tracking-wider mb-2">{t('totalStars')}</p>
              <div className="flex items-center justify-center gap-3">
                <span className="text-4xl">⭐</span>
                <span className="text-5xl font-black text-yellow-300">{totalStars}</span>
              </div>
            </motion.div>

            {/* Best Scores */}
            <p className="text-white/80 text-xs font-black uppercase tracking-wider mb-3 px-1">{t('best')} ⭐</p>
            <div className="grid grid-cols-2 gap-3 mb-5">
              {Object.entries(bestScores).map(([gameType, score], i) => {
                const gameInfo = gameIcons[gameType] || { emoji: '🎮' };
                return (
                  <motion.div
                    key={gameType}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className="rounded-2xl p-4"
                    style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.35)' }}
                  >
                    <div className="text-2xl mb-2">{gameInfo.emoji}</div>
                    <p className="text-white/70 text-xs font-bold mb-1">
                      {gameNames[lang]?.[gameType] || gameType}
                    </p>
                    <div className="flex items-center gap-0.5 mb-1">
                      {[1, 2, 3].map(s => (
                        <Star
                          key={s}
                          className={`w-4 h-4 ${s <= score.stars ? 'fill-yellow-300 text-yellow-300' : 'text-white/20'}`}
                        />
                      ))}
                    </div>
                    <p className="text-white font-black text-lg">{score.score}/{score.total}</p>
                  </motion.div>
                );
              })}
            </div>

            {/* Recent Scores */}
            <p className="text-white/80 text-xs font-black uppercase tracking-wider mb-3 px-1">{t('recent')} 📋</p>
            <div className="space-y-2">
              <AnimatePresence>
                {recentScores.map((score, i) => {
                  const gameInfo = gameIcons[score.gameType] || { emoji: '🎮' };
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="rounded-2xl px-4 py-3 flex items-center gap-3"
                      style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.3)' }}
                    >
                      <span className="text-2xl">{gameInfo.emoji}</span>
                      <div className="flex-1">
                        <p className="text-white text-sm font-bold">
                          {gameNames[lang]?.[score.gameType] || score.gameType}
                        </p>
                        <p className="text-white/50 text-xs">
                          {new Date(score.date).toLocaleDateString('ms-MY')}
                        </p>
                      </div>
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3].map(s => (
                          <Star
                            key={s}
                            className={`w-3.5 h-3.5 ${s <= score.stars ? 'fill-yellow-300 text-yellow-300' : 'text-white/20'}`}
                          />
                        ))}
                      </div>
                      <span className="text-white font-black text-sm">{score.score}/{score.total}</span>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </>
        )}
      </div>
    </div>
  );
}