import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useLang } from '@/lib/LanguageContext';
import GameHeader from '@/components/game/GameHeader';
import FeedbackOverlay from '@/components/game/FeedbackOverlay';
import ScoreScreen from '@/components/game/ScoreScreen';
import { numberQuestions, shuffleArray, calculateStars, saveScore } from '@/lib/gameData';

const TOTAL_QUESTIONS = 8;

function generateQuestion(questions, usedIndices) {
  const available = questions.filter((_, i) => !usedIndices.has(i));
  const pool = available.length > 0 ? available : questions;
  const correct = pool[Math.floor(Math.random() * pool.length)];
  const correctIdx = questions.indexOf(correct);

  const others = questions.filter((q) => q.number !== correct.number);
  const wrongOptions = shuffleArray(others).slice(0, 5).map((q) => q.number);
  const allOptions = shuffleArray([correct.number, ...wrongOptions]);

  return { correct, options: allOptions, correctIdx };
}

export default function NumberGame() {
  const { t } = useLang();
  const [state, setState] = useState(() => {
    const q = generateQuestion(numberQuestions, new Set());
    return {
      currentQ: 0,
      score: 0,
      usedIndices: new Set([q.correctIdx]),
      question: q,
      showFeedback: false,
      isCorrect: false,
      feedbackMsg: '',
      finished: false,
    };
  });

  const handleAnswer = useCallback((num) => {
    if (state.showFeedback) return;
    const correct = num === state.question.correct.number;
    setState(prev => ({
      ...prev,
      showFeedback: true,
      isCorrect: correct,
      feedbackMsg: correct ? t('correct') : t('wrong'),
      score: correct ? prev.score + 1 : prev.score,
    }));
  }, [state.showFeedback, state.question, t]);

  const handleFeedbackDone = useCallback(() => {
    setState(prev => {
      const nextQ = prev.currentQ + 1;
      if (nextQ >= TOTAL_QUESTIONS) {
        const stars = calculateStars(prev.score, TOTAL_QUESTIONS);
        saveScore('numbers', prev.score, TOTAL_QUESTIONS, stars);
        return { ...prev, finished: true, showFeedback: false };
      }
      const newQ = generateQuestion(numberQuestions, prev.usedIndices);
      const newUsed = new Set(prev.usedIndices);
      newUsed.add(newQ.correctIdx);
      return {
        ...prev,
        currentQ: nextQ,
        question: newQ,
        usedIndices: newUsed,
        showFeedback: false,
      };
    });
  }, []);

  const handlePlayAgain = () => {
    const q = generateQuestion(numberQuestions, new Set());
    setState({
      currentQ: 0,
      score: 0,
      usedIndices: new Set([q.correctIdx]),
      question: q,
      showFeedback: false,
      isCorrect: false,
      feedbackMsg: '',
      finished: false,
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

  const { question } = state;
  const countDisplay = Array(question.correct.number).fill(question.correct.countEmoji).join(' ');

  return (
    <div className="min-h-screen bg-pattern">
      <div className="max-w-lg mx-auto px-4 py-6">
        <GameHeader
          title={t('numberGame')}
          score={state.score}
          total={TOTAL_QUESTIONS}
          currentQ={state.currentQ + 1}
          totalQ={TOTAL_QUESTIONS}
        />

        {/* Question Card */}
        <motion.div
          key={state.currentQ}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          className="clay rounded-3xl p-6 text-center mb-6 bg-gradient-to-br from-pink-50 to-rose-100"
        >
          <p className="text-lg font-bold text-muted-foreground mb-3">
            {t('findNumber')} <span className="text-game-pink font-black">❓</span>
          </p>
          <div className="text-4xl leading-relaxed mb-2 flex flex-wrap justify-center gap-1">
            {countDisplay}
          </div>
          <p className="text-sm font-semibold text-muted-foreground">
            ({t('tapCorrectNumber')})
          </p>
        </motion.div>

        {/* Options Grid */}
        <div className="grid grid-cols-3 gap-3">
          {question.options.map((num, i) => (
            <motion.button
              key={`${state.currentQ}-${num}-${i}`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              whileTap={{ scale: 0.9 }}
              whileHover={{ scale: 1.05 }}
              onClick={() => handleAnswer(num)}
              className="clay-button rounded-2xl py-5 text-3xl font-black bg-white/60 hover:bg-white/80 transition-colors"
            >
              {num}
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