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

  const handleStart = () => {
    setGameStarted(true);
    setScore(0);
    setCurrentQ(0);
  };

  return (
    <div className="rounded-3xl overflow-hidden shadow-xl bg-gradient-to-br from-game-yellow via-game-pink to-game-blue aspect-video flex items-center justify-center relative">
      <AnimatePresence mode="wait">
        {!gameStarted ? (
          <motion.div
            key="start"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="text-center"
          >
            <div className="text-7xl mb-6 animate-bounce">🎮</div>
            <p className="text-2xl font-black text-white mb-6">Coba Permainan!</p>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleStart}
              className="px-8 py-3 bg-white text-game-orange rounded-full font-black text-lg shadow-lg"
            >
              Mulai Bermain ✨
            </motion.button>
          </motion.div>
        ) : showFeedback ? (
          <motion.div
            key="feedback"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            className="text-center"
          >
            <div className="text-9xl mb-4 animate-bounce">
              {isCorrect ? '🎉' : '😅'}
            </div>
            <p className="text-3xl font-black text-white">
              {isCorrect ? 'Betul!' : 'Hampir!'}
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="question"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center w-full px-8"
          >
            <p className="text-white text-sm font-bold mb-4">
              Soalan {currentQ + 1}/{questions.length}
            </p>
            <div className="text-8xl mb-8">{questions[currentQ].emoji}</div>
            <p className="text-white text-2xl font-black mb-8">
              {questions[currentQ].question}
            </p>
            <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
              {questions[currentQ].options.map((option, idx) => (
                <motion.button
                  key={idx}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleAnswer(idx)}
                  className="py-4 bg-white text-gray-800 rounded-2xl font-bold text-sm shadow-lg hover:shadow-xl"
                >
                  {option}
                </motion.button>
              ))}
            </div>
            <p className="text-white text-xs font-bold mt-6 opacity-75">
              ✨ Senang je! Anak-anak suka permainan macam ni.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}