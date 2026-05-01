import React, { useState } from 'react';
import { motion } from 'framer-motion';
import AppHeader from '@/components/AppHeader';

const glassCard = { background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.4)' };

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

  const handleLetterClick = (letter) => setUserWord([...userWord, letter]);
  const handleRemoveLetter = (idx) => setUserWord(userWord.filter((_, i) => i !== idx));

  const checkWord = () => {
    if (userWord.join('') === currentWord.word) {
      setMessage('✅ Betul!');
      setScore(score + 20);
      setCompleted([...completed, currentWordIdx]);
      setTimeout(() => {
        if (currentWordIdx < words.length - 1) { setCurrentWordIdx(currentWordIdx + 1); setUserWord([]); setMessage(''); }
      }, 1000);
    } else {
      setMessage('❌ Cuba lagi!');
      setTimeout(() => setMessage(''), 2000);
    }
  };

  const reset = () => { setUserWord([]); setMessage(''); };

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #667eea 0%, #f093fb 50%, #f5a623 100%)' }}>
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-green-300 rounded-full mix-blend-multiply filter blur-3xl opacity-25 animate-pulse" />
        <div className="absolute bottom-20 left-10 w-72 h-72 bg-emerald-300 rounded-full mix-blend-multiply filter blur-3xl opacity-25 animate-pulse" style={{ animationDelay: '1s' }} />
      </div>
      <AppHeader showBack={true} backTo="/games-hub" />
      <div className="relative max-w-lg mx-auto px-4 pb-32 pt-8">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          className="mb-5 p-5 rounded-3xl flex items-center justify-between" style={glassCard}>
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-white/30 flex items-center justify-center text-3xl shadow-inner">📝</div>
            <div>
              <h1 className="text-xl font-black text-white">Bentuk Perkataan</h1>
              <p className="text-white/70 text-xs">Susun huruf membina perkataan!</p>
            </div>
          </div>
          <div className="text-2xl font-black text-white">{score} ⭐</div>
        </motion.div>

        {completed.length === words.length ? (
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
            className="rounded-3xl p-8 text-center" style={glassCard}>
            <p className="text-5xl mb-3">🎉</p>
            <h2 className="text-2xl font-black text-white mb-2">Selesai!</h2>
            <p className="text-white/70 mb-4">Semua perkataan telah diselesaikan!</p>
            <p className="text-3xl font-black text-yellow-300 mb-6">Total: {score} ⭐</p>
            <motion.button whileHover={{ scale: 1.05 }} onClick={() => window.location.reload()}
              className="px-6 py-3 bg-white text-purple-600 rounded-full font-black">Ulang</motion.button>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {/* Word Info */}
            <div className="rounded-3xl p-6 text-center" style={glassCard}>
              <div className="text-6xl mb-3">{currentWord.emoji}</div>
              <p className="text-white/60 text-xs font-bold mb-1">Perkataan {currentWordIdx + 1} / {words.length}</p>
              <p className="text-white font-bold">💡 {currentWord.hint}</p>
            </div>

            {/* User's Word */}
            <div className="rounded-3xl p-5" style={glassCard}>
              <p className="text-white/70 text-xs font-black uppercase tracking-wider mb-2">Perkataan Anda:</p>
              <div className="flex gap-2 flex-wrap min-h-12 items-center p-2 rounded-2xl" style={{ background: 'rgba(255,255,255,0.1)' }}>
                {userWord.length === 0 ? (
                  <p className="text-white/40 text-sm">Pilih huruf di bawah...</p>
                ) : (
                  userWord.map((letter, idx) => (
                    <motion.button key={idx} onClick={() => handleRemoveLetter(idx)} whileHover={{ scale: 1.1 }}
                      className="w-12 h-12 bg-white text-purple-600 rounded-xl font-black text-lg shadow-lg">
                      {letter}
                    </motion.button>
                  ))
                )}
              </div>
            </div>

            {/* Letter Grid */}
            <div className="rounded-3xl p-5" style={glassCard}>
              <p className="text-white/70 text-xs font-black uppercase tracking-wider mb-3">Pilih huruf:</p>
              <div className="grid grid-cols-4 gap-3">
                {shuffledLetters.map((letter, idx) => (
                  <motion.button key={idx} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    onClick={() => handleLetterClick(letter)}
                    disabled={userWord.filter(l => l === letter).length >= currentWord.word.split('').filter(l => l === letter).length}
                    className="w-full aspect-square rounded-xl font-black text-xl text-white disabled:opacity-30"
                    style={{ background: 'rgba(255,255,255,0.25)', border: '1px solid rgba(255,255,255,0.4)' }}>
                    {letter}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Message */}
            {message && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="text-center text-xl font-black text-white">{message}</motion.div>
            )}

            {/* Buttons */}
            <div className="flex gap-3">
              <motion.button whileTap={{ scale: 0.95 }} onClick={reset}
                className="flex-1 py-3 rounded-2xl font-black text-white"
                style={{ background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.35)' }}>
                Kosongkan
              </motion.button>
              <motion.button whileTap={{ scale: 0.95 }} onClick={checkWord}
                className="flex-1 py-3 bg-white text-purple-600 rounded-2xl font-black shadow-lg">
                Semak ✓
              </motion.button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}