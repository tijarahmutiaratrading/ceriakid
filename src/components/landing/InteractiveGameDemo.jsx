import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function InteractiveGameDemo() {
  const [gameStarted, setGameStarted] = useState(false);
  const [currentQ, setCurrentQ] = useState(0);
  const [score, setScore] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const questions = [
    {
      emoji: '🍎',
      question: 'Ini apa?',
      options: ['Epal', 'Oren', 'Pisang'],
      correct: 0,
    },
    {
      emoji: '🐱',
      question: 'Hewan apa ni?',
      options: ['Anjing', 'Kucing', 'Arnab'],
      correct: 1,
    },
    {
      emoji: '🔵',
      question: 'Warna apa?',
      options: ['Merah', 'Biru', 'Hijau'],
      correct: 1,
    },
  ];

  const handleAnswer = (idx) => {
    const correct = idx === questions[currentQ].correct;
    setIsCorrect(correct);
    setShowFeedback(true);

    if (correct) {
      setScore(score + 1);
    }

    setTimeout(() => {
      if (currentQ < questions.length - 1) {
        setCurrentQ(currentQ + 1);
        setShowFeedback(false);
      } else {
        // Game complete
        setTimeout(() => {
          setGameStarted(false);
          setCurrentQ(0);
          setScore(0);
        }, 2000);
      }
    }, 1500);
  };



  return (
    <div className="rounded-3xl overflow-hidden shadow-xl bg-gradient-to-br from-game-yellow via-game-pink to-game-blue min-h-[320px] flex items-center justify-center relative py-8 px-4">
      <AnimatePresence mode="wait">
        {showFeedback ? (
          <motion.div
            key="feedback"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            className="text-center"
          >
            <div className="text-7xl mb-3 animate-bounce">
              {isCorrect ? '🎉' : '😅'}
            </div>
            <p className="text-2xl font-black text-white">
              {isCorrect ? 'Betul! 🌟' : 'Hampir!'}
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="question"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center w-full max-w-sm mx-auto"
          >
            <p className="text-white text-sm font-bold mb-3">
              Soalan {currentQ + 1}/{questions.length}
            </p>
            <div className="text-6xl mb-4">{questions[currentQ].emoji}</div>
            <p className="text-white text-xl font-black mb-5">
              {questions[currentQ].question}
            </p>
            <div className="grid grid-cols-3 gap-3">
              {questions[currentQ].options.map((option, idx) => (
                <motion.button
                  key={idx}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleAnswer(idx)}
                  className="py-3 bg-white text-gray-800 rounded-2xl font-bold text-sm shadow-lg"
                >
                  {option}
                </motion.button>
              ))}
            </div>
            <p className="text-white text-xs font-bold mt-4 opacity-75">
              ✨ Anak-anak suka permainan macam ni!
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}