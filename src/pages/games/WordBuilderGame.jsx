import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { RotateCcw, Volume2 } from 'lucide-react';
import AppHeader from '@/components/AppHeader';

export default function WordBuilderGame() {
  const words = [
    { word: 'KAMAR', hint: 'Tempat tidur berada di sini', emoji: '🛏️' },
    { word: 'RUMAH', hint: 'Tempat kita tinggal', emoji: '🏠' },
    { word: 'SEKOLAH', hint: 'Kita belajar di sini', emoji: '🎓' },
  ];

  const [currentWordIdx, setCurrentWordIdx] = useState(0);
  const [userWord, setUserWord] = useState([]);
  const [score, setScore] = useState(0);
  const [message, setMessage] = useState('');
  const [completed, setCompleted] = useState([]);

  const currentWord = words[currentWordIdx];
  const shuffledLetters = currentWord.word.split('').sort(() => Math.random() - 0.5);

  const handleLetterClick = (letter) => {
    setUserWord([...userWord, letter]);
  };

  const handleRemoveLetter = (idx) => {
    setUserWord(userWord.filter((_, i) => i !== idx));
  };

  const checkWord = () => {
    if (userWord.join('') === currentWord.word) {
      setMessage('✅ Betul!');
      setScore(score + 20);
      setCompleted([...completed, currentWordIdx]);
      setTimeout(() => {
        if (currentWordIdx < words.length - 1) {
          setCurrentWordIdx(currentWordIdx + 1);
          setUserWord([]);
          setMessage('');
        }
      }, 1000);
    } else {
      setMessage('❌ Cuba lagi!');
      setTimeout(() => setMessage(''), 2000);
    }
  };

  const reset = () => {
    setUserWord([]);
    setMessage('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 to-emerald-100">
      <AppHeader showBack={true} backTo="/dashboard" />
      
      <div className="max-w-2xl mx-auto px-4 py-8 pb-24 pt-20">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-black text-gray-800">📝 Bentuk Perkataan</h1>
          <div className="text-2xl font-black text-green-600">{score} ⭐</div>
        </div>

        {completed.length === words.length ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-8 text-center shadow-xl"
          >
            <p className="text-5xl mb-3">🎉</p>
            <h2 className="text-2xl font-black text-gray-800 mb-2">Selesai!</h2>
            <p className="text-gray-600 mb-6">Anda telah menyelesaikan semua perkataan!</p>
            <p className="text-3xl font-black text-green-600 mb-6">Total Skor: {score} ⭐</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-green-600 text-white rounded-full font-black"
            >
              Ulang
            </motion.button>
          </motion.div>
        ) : (
          <div className="bg-white rounded-3xl p-8 shadow-xl">
            {/* Word Info */}
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">{currentWord.emoji}</div>
              <p className="text-sm text-gray-500 font-bold mb-2">
                Perkataan {currentWordIdx + 1} daripada {words.length}
              </p>
              <p className="text-lg text-gray-600">💡 {currentWord.hint}</p>
            </div>

            {/* User's Word */}
            <div className="mb-8 p-4 bg-green-50 rounded-2xl border-2 border-green-300">
              <p className="text-xs text-gray-500 font-bold mb-2">Perkataan Anda:</p>
              <div className="flex gap-2 flex-wrap min-h-12 items-center">
                {userWord.length === 0 ? (
                  <p className="text-gray-400">Seret huruf di sini...</p>
                ) : (
                  userWord.map((letter, idx) => (
                    <motion.button
                      key={idx}
                      onClick={() => handleRemoveLetter(idx)}
                      whileHover={{ scale: 1.1 }}
                      className="w-12 h-12 bg-green-500 text-white rounded-xl font-black text-lg"
                    >
                      {letter}
                    </motion.button>
                  ))
                )}
              </div>
            </div>

            {/* Letters to Choose */}
            <div className="mb-6">
              <p className="text-xs text-gray-500 font-bold mb-3">Pilih huruf:</p>
              <div className="grid grid-cols-4 gap-3">
                {shuffledLetters.map((letter, idx) => (
                  <motion.button
                    key={idx}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleLetterClick(letter)}
                    disabled={userWord.filter(l => l === letter).length >= currentWord.word.split('').filter(l => l === letter).length}
                    className="w-full aspect-square bg-gradient-to-br from-green-400 to-emerald-500 text-white rounded-xl font-black text-xl disabled:opacity-40"
                  >
                    {letter}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Message */}
            {message && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center mb-4 text-lg font-black"
              >
                {message}
              </motion.div>
            )}

            {/* Buttons */}
            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={reset}
                className="flex-1 py-3 bg-gray-200 text-gray-800 rounded-xl font-black"
              >
                Kosongkan
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={checkWord}
                className="flex-1 py-3 bg-green-600 text-white rounded-xl font-black"
              >
                Semak
              </motion.button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}