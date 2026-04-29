import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, Star, Trash2, Trophy, BookOpen, Hash, Brain, Palette } from 'lucide-react';
import { useLang } from '@/lib/LanguageContext';
import { getScores, clearScores } from '@/lib/gameData';

const gameIcons = {
  abc: { icon: BookOpen, emoji: '🔤', color: 'bg-amber-100 text-amber-700' },
  numbers: { icon: Hash, emoji: '🔢', color: 'bg-pink-100 text-pink-700' },
  quiz: { icon: Brain, emoji: '🧩', color: 'bg-sky-100 text-sky-700' },
  shapes: { icon: Palette, emoji: '🎨', color: 'bg-emerald-100 text-emerald-700' },
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
    <div className="min-h-screen bg-pattern">
      <div className="max-w-lg mx-auto px-4 py-6 pb-24">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Link to="/">
            <motion.button
              whileTap={{ scale: 0.9 }}
              className="clay-button rounded-full w-12 h-12 flex items-center justify-center"
            >
              <ArrowLeft className="w-6 h-6" />
            </motion.button>
          </Link>
          <h1 className="text-2xl font-extrabold flex items-center gap-2">
            <Trophy className="w-7 h-7 text-game-yellow" />
            {t('scoreboard')}
          </h1>
          {scores.length > 0 && (
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleClear}
              className="clay-button rounded-full w-12 h-12 flex items-center justify-center text-destructive"
            >
              <Trash2 className="w-5 h-5" />
            </motion.button>
          )}
        </div>

        {scores.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="clay rounded-3xl p-8 text-center"
          >
            <div className="text-5xl mb-4">🎮</div>
            <p className="text-lg font-bold text-muted-foreground">{t('noScores')}</p>
          </motion.div>
        ) : (
          <>
            {/* Total Stars */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="clay rounded-3xl p-6 text-center mb-6 bg-gradient-to-br from-amber-50 to-yellow-100"
            >
              <p className="text-sm font-bold text-muted-foreground mb-1">{t('totalStars')}</p>
              <div className="flex items-center justify-center gap-2">
                <Star className="w-8 h-8 fill-game-yellow text-game-yellow" />
                <span className="text-4xl font-black text-game-yellow">{totalStars}</span>
              </div>
            </motion.div>

            {/* Best Scores */}
            <h3 className="text-sm font-extrabold text-muted-foreground uppercase tracking-wider mb-3 px-1">
              {t('best')} ⭐
            </h3>
            <div className="grid grid-cols-2 gap-3 mb-6">
              {Object.entries(bestScores).map(([gameType, score], i) => {
                const gameInfo = gameIcons[gameType];
                return (
                  <motion.div
                    key={gameType}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className={`clay rounded-2xl p-4 ${gameInfo.color}`}
                  >
                    <div className="text-2xl mb-1">{gameInfo.emoji}</div>
                    <p className="text-xs font-bold opacity-70">
                      {gameNames[lang]?.[gameType] || gameType}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      {[1, 2, 3].map(s => (
                        <Star
                          key={s}
                          className={`w-4 h-4 ${s <= score.stars ? 'fill-game-yellow text-game-yellow' : 'text-gray-300'}`}
                        />
                      ))}
                    </div>
                    <p className="text-lg font-black mt-1">{score.score}/{score.total}</p>
                  </motion.div>
                );
              })}
            </div>

            {/* Recent Scores */}
            <h3 className="text-sm font-extrabold text-muted-foreground uppercase tracking-wider mb-3 px-1">
              {t('recent')} 📋
            </h3>
            <div className="space-y-2">
              <AnimatePresence>
                {recentScores.map((score, i) => {
                  const gameInfo = gameIcons[score.gameType];
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="clay rounded-2xl px-4 py-3 flex items-center gap-3"
                    >
                      <span className="text-2xl">{gameInfo?.emoji}</span>
                      <div className="flex-1">
                        <p className="text-sm font-extrabold">
                          {gameNames[lang]?.[score.gameType] || score.gameType}
                        </p>
                        <p className="text-xs text-muted-foreground font-semibold">
                          {new Date(score.date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3].map(s => (
                          <Star
                            key={s}
                            className={`w-3.5 h-3.5 ${s <= score.stars ? 'fill-game-yellow text-game-yellow' : 'text-gray-300'}`}
                          />
                        ))}
                      </div>
                      <span className="text-sm font-black">{score.score}/{score.total}</span>
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