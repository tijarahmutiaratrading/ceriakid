import React, { useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useLang } from '@/lib/LanguageContext';
import GameHeader from '@/components/game/GameHeader';
import FeedbackOverlay from '@/components/game/FeedbackOverlay';
import ScoreScreen from '@/components/game/ScoreScreen';
import GamePlayShell from '@/components/game/GamePlayShell';
import { letterQuestions, shuffleArray, calculateStars, saveScore } from '@/lib/gameData';

const TOTAL_QUESTIONS = 8;

function generateQuestion(questions, usedIndices) {
  const available = questions.filter((_, i) => !usedIndices.has(i));
  const pool = available.length > 0 ? available : questions;
  const correct = pool[Math.floor(Math.random() * pool.length)];
  const correctIdx = questions.indexOf(correct);

  // Generate 5 wrong options
  const others = questions.filter((q) => q.letter !== correct.letter);
  const wrongOptions = shuffleArray(others).slice(0, 5).map((q) => q.letter);
  const allOptions = shuffleArray([correct.letter, ...wrongOptions]);

  return { correct, options: allOptions, correctIdx };
}

export default function ABCGame() {
  const { t, lang } = useLang();
  const [state, setState] = useState(() => {
    const q = generateQuestion(letterQuestions, new Set());
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

  const handleAnswer = useCallback((letter) => {
    if (state.showFeedback) return;
    const correct = letter === state.question.correct.letter;
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
        const finalScore = prev.score;
        const stars = calculateStars(finalScore, TOTAL_QUESTIONS);
        saveScore('abc', finalScore, TOTAL_QUESTIONS, stars);
        return { ...prev, finished: true, showFeedback: false };
      }
      const newQ = generateQuestion(letterQuestions, prev.usedIndices);
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
    const q = generateQuestion(letterQuestions, new Set());
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
  const word = lang === 'bm' ? question.correct.wordBM : question.correct.wordEN;

  return (
    <GamePlayShell backTo="/games-hub" backLabel={t('abcGame')}>
      <GameHeader
        title={t('abcGame')}
        score={state.score}
        total={TOTAL_QUESTIONS}
        currentQ={state.currentQ + 1}
        totalQ={TOTAL_QUESTIONS}
      />

      {/* Question Card — glass */}
      <motion.div
        key={state.currentQ}
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        className="rounded-3xl p-6 text-center mb-6 bg-white/8 backdrop-blur-xl ring-1 ring-white/15 shadow-[0_8px_30px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.08)]"
      >
        <div className="text-7xl mb-3">{question.correct.emoji}</div>
        <p className="text-lg font-bold text-white/70 mb-1">
          {t('findLetter')} <span className="text-violet-300">"{question.correct.letter}"</span>
        </p>
        <p className="text-xl font-extrabold text-white">{word}</p>
      </motion.div>

      {/* Options Grid */}
      <div className="grid grid-cols-3 gap-3">
        {question.options.map((letter, i) => (
          <motion.button
            key={`${state.currentQ}-${letter}-${i}`}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.05 }}
            onClick={() => handleAnswer(letter)}
            className="rounded-2xl py-5 text-3xl font-black text-white bg-white/8 backdrop-blur-xl ring-1 ring-white/15 shadow-sm hover:bg-white/15 transition-colors"
          >
            {letter}
          </motion.button>
        ))}
      </div>

      <FeedbackOverlay
        show={state.showFeedback}
        isCorrect={state.isCorrect}
        message={state.feedbackMsg}
        onDone={handleFeedbackDone}
      />
    </GamePlayShell>
  );
}