import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import AppHeader from '@/components/AppHeader';

const glassCard = { background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.4)' };

const ALL_WORDS = [
  { word: 'KAMAR', hint: 'Tempat tidur berada di sini', emoji: '🛏️' },
  { word: 'RUMAH', hint: 'Tempat kita tinggal', emoji: '🏠' },
  { word: 'SEKOLAH', hint: 'Kita belajar di sini', emoji: '🎓' },
  { word: 'POKOK', hint: 'Tumbuhan besar di luar', emoji: '🌳' },
  { word: 'BUNGA', hint: 'Harum dan cantik', emoji: '🌸' },
];

export default function WordBuilderGame() {
  const [currentWordIdx, setCurrentWordIdx] = useState(0);
  const [userWord, setUserWord] = useState([]);
  const [score, setScore] = useState(0);
  const [message, setMessage] = useState('');
  const [gameOver, setGameOver] = useState(false);

  const currentWord = ALL_WORDS[currentWordIdx];
  const shuffledLetters = useMemo(() => currentWord.word.split('').sort(() => Math.random() - 0.5), [currentWordIdx]);

  const handleLetterClick = (letter) => setUserWord(w => [...w, letter]);
  const handleRemoveLetter = (idx) => setUserWord(w => w.filter((_, i) => i !== idx));

  const checkWord = () => {
    if (userWord.join('') === currentWord.word) {
      setMessage('✅ Betul!');
      setScore(s => s + 20);
      setTimeout(() => {
        if (currentWordIdx + 1 >= ALL_WORDS.length) { setGameOver(true); } 
        else { setCurrentWordIdx(i => i + 1); setUserWord([]); setMessage(''); }
      }, 1000);
    } else {
      setMessage('❌ Cuba lagi!');
      setTimeout(() => setMessage(''), 2000);
    }
  };

  if (gameOver) return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #667eea 0%, #f093fb 50%, #f5a623 100%)' }}>
      <AppHeader showBack={true} backTo="/games-hub" />
      <div className="relative max-w-lg mx-auto px-4 pb-32 pt-8">
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
          className="rounded-3xl p-8 text-center" style={glassCard}>
          <p className="text-5xl mb-3">🏆</p>
          <h2 className="text-2xl font-black text-white mb-2">Tahniah! Semua Selesai!</h2>
          <p className="text-yellow-300 text-3xl font-black mb-6">Skor: {score} ⭐</p>
          <motion.button whileTap={{ scale: 0.95 }} onClick={() => { setCurrentWordIdx(0); setUserWord([]); setScore(0); setMessage(''); setGameOver(false); }}
            className="px-6 py-3 bg-white text-purple-600 rounded-full font-black">Mula Semula</motion.button>
        </motion.div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #667eea 0%, #f093fb 50%, #f5a623 100%)' }}>
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-green-300 rounded-full mix-blend-multiply filter blur-3xl opacity-25 animate-pulse" />
      </div>
      <AppHeader showBack={true} backTo="/games-hub" />
      <div className="relative max-w-lg mx-auto px-4 pb-32 pt-8">

        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          className="mb-5 p-5 rounded-3xl flex items-center justify-between" style={glassCard}>
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-white/30 flex items-center justify-center text-3xl shadow-inner">📝</div>
            <div>
              <h1 className="text-xl font-black text-white">Bentuk Perkataan</h1>
              <p className="text-white/70 text-xs">Perkataan {currentWordIdx + 1} / {ALL_WORDS.length}</p>
            </div>
          </div>
          <div className="text-2xl font-black text-white">{score} ⭐</div>
        </motion.div>

        <div className="flex gap-2 mb-4">
          {ALL_WORDS.map((_, i) => (
            <div key={i} className={`flex-1 h-2 rounded-full transition-all ${i < currentWordIdx ? 'bg-white' : i === currentWordIdx ? 'bg-white/70' : 'bg-white/20'}`} />
          ))}
        </div>

        <div className="space-y-4">
          <div className="rounded-3xl p-6 text-center" style={glassCard}>
            <div className="text-6xl mb-3">{currentWord.emoji}</div>
            <p className="text-white font-bold">💡 {currentWord.hint}</p>
          </div>

          <div className="rounded-3xl p-5" style={glassCard}>
            <p className="text-white/70 text-xs font-black uppercase tracking-wider mb-2">Perkataan Anda:</p>
            <div className="flex gap-2 flex-wrap min-h-12 items-center p-2 rounded-2xl" style={{ background: 'rgba(255,255,255,0.1)' }}>
              {userWord.length === 0 ? <p className="text-white/40 text-sm">Pilih huruf...</p> :
                userWord.map((letter, idx) => (
                  <motion.button key={idx} onClick={() => handleRemoveLetter(idx)} whileHover={{ scale: 1.1 }}
                    className="w-12 h-12 bg-white text-purple-600 rounded-xl font-black text-lg shadow-lg">
                    {letter}
                  </motion.button>
                ))}
            </div>
          </div>

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

          {message && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center text-xl font-black text-white">{message}</motion.div>}

          <div className="flex gap-3">
            <motion.button whileTap={{ scale: 0.95 }} onClick={() => setUserWord([])}
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
      </div>
    </div>
  );
}