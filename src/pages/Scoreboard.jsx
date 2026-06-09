import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Trash2, Trophy, BookOpen, Hash, Brain, Palette, Gamepad2, History, Award } from 'lucide-react';
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
    <div className="min-h-screen w-full max-w-full overflow-x-hidden font-nunito relative">
      <AppHeader showBack={true} backTo="/dashboard" />

      <div className="relative w-full max-w-5xl mx-auto px-4 sm:px-6 pb-32 pt-4 overflow-x-hidden">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-5 p-5 rounded-3xl flex items-center justify-between"
          style={{ background: 'linear-gradient(135deg, rgba(15,23,42,0.85), rgba(88,28,135,0.78))', backdropFilter: 'blur(22px)', border: '1px solid rgba(255,255,255,0.18)' }}
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg flex-shrink-0">
              <Trophy className="w-7 h-7 text-white" strokeWidth={2.5} fill="white" />
            </div>
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
            style={{ background: 'linear-gradient(135deg, rgba(15,23,42,0.85), rgba(88,28,135,0.78))', backdropFilter: 'blur(22px)', border: '1px solid rgba(255,255,255,0.18)' }}
          >
            <div className="w-16 h-16 mx-auto rounded-2xl bg-white/15 flex items-center justify-center mb-4 shadow-inner border border-white/20">
              <Gamepad2 className="w-8 h-8 text-white/70" strokeWidth={2.5} />
            </div>
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
              style={{ background: 'linear-gradient(135deg, rgba(15,23,42,0.85), rgba(88,28,135,0.78))', backdropFilter: 'blur(22px)', border: '1px solid rgba(255,255,255,0.18)' }}
            >
              <p className="text-white/70 text-xs font-black uppercase tracking-wider mb-2">{t('totalStars')}</p>
              <div className="flex items-center justify-center gap-3">
                <Star className="w-10 h-10 text-yellow-300" fill="currentColor" strokeWidth={1.5} />
                <span className="text-5xl font-black text-yellow-300">{totalStars}</span>
              </div>
            </motion.div>

            {/* Best Scores */}
            <div className="flex items-center gap-2 mb-3 px-1">
              <Award className="w-3.5 h-3.5 text-yellow-300" strokeWidth={3} />
              <p className="text-white/80 text-xs font-black uppercase tracking-wider">{t('best')}</p>
            </div>
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
                    style={{ background: 'linear-gradient(135deg, rgba(15,23,42,0.78), rgba(88,28,135,0.7))', backdropFilter: 'blur(22px)', border: '1px solid rgba(255,255,255,0.18)' }}
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
            <div className="flex items-center gap-2 mb-3 px-1">
              <History className="w-3.5 h-3.5 text-cyan-300" strokeWidth={3} />
              <p className="text-white/80 text-xs font-black uppercase tracking-wider">{t('recent')}</p>
            </div>
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
                      style={{ background: 'linear-gradient(135deg, rgba(15,23,42,0.78), rgba(88,28,135,0.7))', backdropFilter: 'blur(22px)', border: '1px solid rgba(255,255,255,0.18)' }}
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