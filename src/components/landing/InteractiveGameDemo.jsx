import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function InteractiveGameDemo() {
  const [currentQ, setCurrentQ] = useState(0);
  const [score, setScore] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const questions = [
    {
      emoji: '🍎',
      subject: 'Bahasa Melayu',
      question: 'Ini buah apa?',
      options: ['Epal', 'Oren', 'Pisang', 'Anggur'],
      correct: 0,
    },
    {
      emoji: '🐱',
      subject: 'English',
      question: 'What animal is this?',
      options: ['Dog', 'Cat', 'Rabbit', 'Bird'],
      correct: 1,
    },
    {
      emoji: '五',
      subject: 'Mandarin',
      question: '这个数字是多少？',
      options: ['三', '五', '七', '九'],
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
        // Game complete - reset
        setTimeout(() => {
          setCurrentQ(0);
          setScore(0);
        }, 2000);
      }
    }, 1500);
  };



  return (
    <div className="rounded-[2rem] overflow-hidden shadow-2xl bg-gradient-to-br from-game-yellow via-game-pink to-game-blue min-h-[350px] flex items-center justify-center relative py-8 px-4 ring-4 ring-white/20">
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between text-white/90 text-xs font-black">
        <span className="bg-white/20 backdrop-blur px-3 py-1 rounded-full">Live Demo</span>
        <span className="bg-white/20 backdrop-blur px-3 py-1 rounded-full">Score {score}/{questions.length}</span>
      </div>
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
            <p className="text-white text-sm font-bold mb-2">
              Soalan {currentQ + 1}/{questions.length}
            </p>
            <p className="inline-block bg-white/25 text-white text-xs font-black px-3 py-1 rounded-full mb-3">
              {questions[currentQ].subject}
            </p>
            <div className="text-6xl mb-4">{questions[currentQ].emoji}</div>
            <p className="text-white text-xl font-black mb-5">
              {questions[currentQ].question}
            </p>
            <div className="grid grid-cols-2 gap-3">
              {questions[currentQ].options.map((option, idx) => (
                <motion.button
                  key={idx}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleAnswer(idx)}
                  className="min-h-11 py-3 bg-white text-gray-800 rounded-2xl font-bold text-sm shadow-lg"
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