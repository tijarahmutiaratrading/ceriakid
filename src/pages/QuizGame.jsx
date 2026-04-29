import React, { useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useLang } from '@/lib/LanguageContext';
import GameHeader from '@/components/game/GameHeader';
import FeedbackOverlay from '@/components/game/FeedbackOverlay';
import ScoreScreen from '@/components/game/ScoreScreen';
import { quizQuestions, shuffleArray, calculateStars, saveScore } from '@/lib/gameData';

const TOTAL_QUESTIONS = 8;

const optionColors = [
  'from-amber-100 to-yellow-200',
  'from-sky-100 to-blue-200',
  'from-emerald-100 to-green-200',
  'from-pink-100 to-rose-200',
];

export default function QuizGame() {
  const { t, lang } = useLang();

  const questions = useMemo(() => {
    const pool = quizQuestions[lang] || quizQuestions.bm;
    return shuffleArray(pool).slice(0, TOTAL_QUESTIONS);
  }, [lang]);

  const [state, setState] = useState({
    currentQ: 0,
    score: 0,
    showFeedback: false,
    isCorrect: false,
    feedbackMsg: '',
    finished: false,
    selectedIdx: null,
  });

  const handleAnswer = useCallback((idx) => {
    if (state.showFeedback) return;
    const currentQuestion = questions[state.currentQ];
    const correct = idx === currentQuestion.answer;
    setState(prev => ({
      ...prev,
      showFeedback: true,
      isCorrect: correct,
      feedbackMsg: correct ? t('correct') : t('wrong'),
      score: correct ? prev.score + 1 : prev.score,
      selectedIdx: idx,
    }));
  }, [state.showFeedback, state.currentQ, questions, t]);

  const handleFeedbackDone = useCallback(() => {
    setState(prev => {
      const nextQ = prev.currentQ + 1;
      if (nextQ >= TOTAL_QUESTIONS) {
        const stars = calculateStars(prev.score, TOTAL_QUESTIONS);
        saveScore('quiz', prev.score, TOTAL_QUESTIONS, stars);
        return { ...prev, finished: true, showFeedback: false };
      }
      return {
        ...prev,
        currentQ: nextQ,
        showFeedback: false,
        selectedIdx: null,
      };
    });
  }, []);

  const handlePlayAgain = () => {
    setState({
      currentQ: 0,
      score: 0,
      showFeedback: false,
      isCorrect: false,
      feedbackMsg: '',
      finished: false,
      selectedIdx: null,
    });
  };

  if (state.finished) {
    return (
      <ScoreScreen
        score={state.score}
        total={TOTAL_QUESTIONS}
        stars={calculateStars(state.score, TOTAL_QUESTIONS)}
        onPlayAgain={handlePlayAgain}
      />
    );
  }

  const currentQuestion = questions[state.currentQ];

  return (
    <div className="min-h-screen bg-pattern">
      <div className="max-w-lg mx-auto px-4 py-6 pb-24">
        <GameHeader
          title={t('quizGame')}
          score={state.score}
          total={TOTAL_QUESTIONS}
          currentQ={state.currentQ + 1}
          totalQ={TOTAL_QUESTIONS}
        />

        {/* Question Card */}
        <motion.div
          key={state.currentQ}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="clay rounded-3xl p-6 text-center mb-6 bg-gradient-to-br from-sky-50 to-blue-100"
        >
          <div className="text-5xl mb-2">🧩</div>
          <p className="text-xl font-extrabold leading-relaxed">
            {currentQuestion.question}
          </p>
        </motion.div>

        {/* Options */}
        <div className="grid grid-cols-2 gap-3">
          {currentQuestion.options.map((option, i) => (
            <motion.button
              key={`${state.currentQ}-${i}`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.08 }}
              whileTap={{ scale: 0.93 }}
              whileHover={{ scale: 1.03 }}
              onClick={() => handleAnswer(i)}
              className={`clay-button rounded-2xl py-5 px-4 text-lg font-extrabold bg-gradient-to-br ${optionColors[i]} transition-all`}
            >
              {option}
            </motion.button>
          ))}
        </div>
      </div>

      <FeedbackOverlay
        show={state.showFeedback}
        isCorrect={state.isCorrect}
        message={state.feedbackMsg}
        onDone={handleFeedbackDone}
      />
    </div>
  );
}