import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, RotateCcw } from 'lucide-react';
import AppHeader from '@/components/AppHeader';

const glassCard = { background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.4)' };

const ALL_WORD_SETS = [
  // Set A — Benda sekeliling
  [
    { word: 'RUMAH', hint: 'Tempat kita tinggal', emoji: '🏠' },
    { word: 'BUKU', hint: 'Kita baca ini', emoji: '📖' },
    { word: 'MEJA', hint: 'Kita letak benda di atasnya', emoji: '🪑' },
    { word: 'POKOK', hint: 'Tumbuhan besar di luar', emoji: '🌳' },
    { word: 'BUNGA', hint: 'Harum dan cantik', emoji: '🌸' },
  ],
  // Set B — Haiwan
  [
    { word: 'KUCING', hint: 'Haiwan peliharaan yang suka mengeong', emoji: '🐱' },
    { word: 'ANJING', hint: 'Sahabat manusia yang setia', emoji: '🐶' },
    { word: 'BURUNG', hint: 'Boleh terbang di langit', emoji: '🐦' },
    { word: 'KATAK', hint: 'Melompat dan suka air', emoji: '🐸' },
    { word: 'GAJAH', hint: 'Haiwan besar dengan belalai', emoji: '🐘' },
  ],
  // Set C — Makanan
  [
    { word: 'NASI', hint: 'Makanan utama orang Malaysia', emoji: '🍚' },
    { word: 'ROTI', hint: 'Untuk sarapan, boleh disapu', emoji: '🍞' },
    { word: 'EPAL', hint: 'Buah merah atau hijau', emoji: '🍎' },
    { word: 'PISANG', hint: 'Buah yang disukai monyet', emoji: '🍌' },
    { word: 'SUSU', hint: 'Minuman putih dari lembu', emoji: '🥛' },
  ],
  // Set D — Kenderaan
  [
    { word: 'KERETA', hint: 'Kenderaan beroda empat', emoji: '🚗' },
    { word: 'KAPAL', hint: 'Belayar di atas laut', emoji: '🚢' },
    { word: 'TREN', hint: 'Berjalan di atas landasan', emoji: '🚂' },
    { word: 'BAS', hint: 'Kenderaan awam yang besar', emoji: '🚌' },
    { word: 'BASIKAL', hint: 'Dua roda, kayuh sendiri', emoji: '🚲' },
  ],
  // Set E — Warna & Alam
  [
    { word: 'MERAH', hint: 'Warna api dan darah', emoji: '🔴' },
    { word: 'BIRU', hint: 'Warna langit dan laut', emoji: '💙' },
    { word: 'HIJAU', hint: 'Warna pokok dan rumput', emoji: '💚' },
    { word: 'KUNING', hint: 'Warna matahari yang cerah', emoji: '⭐' },
    { word: 'PUTIH', hint: 'Warna awan dan salji', emoji: '⬜' },
  ],
  // Set F — Sekolah
  [
    { word: 'PENSIL', hint: 'Alat tulis yang boleh dihapus', emoji: '✏️' },
    { word: 'KELAS', hint: 'Tempat belajar di sekolah', emoji: '🏫' },
    { word: 'CIKGU', hint: 'Orang yang mengajar', emoji: '👩‍🏫' },
    { word: 'PAPAN', hint: 'Cikgu tulis di sini', emoji: '📋' },
    { word: 'BEG', hint: 'Digunakan untuk bawa buku', emoji: '🎒' },
  ],
];

// Pick 3 random sets per session
function getRandomSets() {
  return [...ALL_WORD_SETS].sort(() => Math.random() - 0.5).slice(0, 3);
}

const WORD_SETS = getRandomSets();

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

export default function WordBuilderGame() {
  const [setIdx, setSetIdx] = useState(0);
  const [wordIdx, setWordIdx] = useState(0);
  const [userWord, setUserWord] = useState([]);
  const [score, setScore] = useState(0);
  const [message, setMessage] = useState('');
  const [setOver, setSetOver] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [wrongAttempts, setWrongAttempts] = useState(0);

  const words = WORD_SETS[setIdx];
  const currentWord = words[wordIdx];

  // Shuffle on mount and when word changes — stable per word
  const shuffledLetters = useMemo(() => {
    return shuffle(currentWord.word.split(''));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setIdx, wordIdx]);

  const handleLetterClick = (letter, clickIdx) => {
    // Track which specific index was clicked (handles duplicate letters)
    setUserWord(w => [...w, { letter, srcIdx: clickIdx }]);
  };

  const handleRemoveLetter = (idx) => {
    setUserWord(w => w.filter((_, i) => i !== idx));
  };

  const checkWord = () => {
    const formed = userWord.map(l => l.letter).join('');
    if (formed === currentWord.word) {
      setMessage('✅ Betul! Tahniah!');
      setScore(s => s + Math.max(20 - wrongAttempts * 3, 5));
      setTimeout(() => {
        setMessage('');
        setWrongAttempts(0);
        setUserWord([]);
        if (wordIdx + 1 >= words.length) {
          setSetOver(true);
        } else {
          setWordIdx(i => i + 1);
        }
      }, 1200);
    } else {
      setWrongAttempts(c => c + 1);
      setMessage('❌ Cuba lagi! Susun semula huruf-huruf ini.');
      setTimeout(() => setMessage(''), 2000);
    }
  };

  const nextSet = () => {
    if (setIdx + 1 >= WORD_SETS.length) {
      setGameOver(true);
    } else {
      setSetIdx(i => i + 1);
      setWordIdx(0);
      setUserWord([]);
      setSetOver(false);
      setWrongAttempts(0);
    }
  };

  // Track which indices of shuffledLetters are used
  const usedIndices = userWord.map(l => l.srcIdx);

  if (gameOver) return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #667eea 0%, #f093fb 50%, #f5a623 100%)' }}>
      <AppHeader showBack={true} backTo="/games-hub" />
      <div className="relative max-w-lg mx-auto px-4 pb-32 pt-28 md:pt-32">
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
          className="rounded-3xl p-8 text-center" style={glassCard}>
          <p className="text-5xl mb-3">🏆</p>
          <h2 className="text-2xl font-black text-white mb-2">Tahniah! Semua Selesai!</h2>
          <p className="text-yellow-300 text-3xl font-black mb-6">Skor: {score} ⭐</p>
          <motion.button whileTap={{ scale: 0.95 }} onClick={() => { setSetIdx(0); setWordIdx(0); setUserWord([]); setScore(0); setMessage(''); setSetOver(false); setGameOver(false); setWrongAttempts(0); }}
            className="px-6 py-3 bg-white text-purple-600 rounded-full font-black"
            onClick={() => { const s=getRandomSets(); WORD_SETS.length=0; s.forEach(x=>WORD_SETS.push(x)); setSetIdx(0); setWordIdx(0); setUserWord([]); setScore(0); setMessage(''); setSetOver(false); setGameOver(false); setWrongAttempts(0); }}>
            Mula Semula</motion.button>
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
      <div className="relative max-w-lg mx-auto px-4 pb-32 pt-28 md:pt-32">

        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          className="mb-5 p-5 rounded-3xl flex items-center justify-between" style={glassCard}>
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-white/30 flex items-center justify-center text-3xl shadow-inner">📝</div>
            <div>
              <h1 className="text-xl font-black text-white">Bentuk Perkataan</h1>
              <p className="text-white/70 text-xs">Set {setIdx + 1}/{WORD_SETS.length} · Perkataan {wordIdx + 1}/{words.length}</p>
            </div>
          </div>
          <div className="text-2xl font-black text-white">{score} ⭐</div>
        </motion.div>

        {/* Set progress */}
        <div className="flex gap-2 mb-4">
          {WORD_SETS.map((_, i) => (
            <div key={i} className={`flex-1 h-2 rounded-full transition-all ${i < setIdx ? 'bg-white' : i === setIdx ? 'bg-white/70' : 'bg-white/20'}`} />
          ))}
        </div>

        {setOver ? (
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
            className="rounded-3xl p-8 text-center" style={glassCard}>
            <p className="text-5xl mb-3">🎉</p>
            <h2 className="text-2xl font-black text-white mb-4">Set {setIdx + 1} Selesai!</h2>
            <motion.button whileTap={{ scale: 0.95 }} onClick={nextSet}
              className="px-6 py-3 bg-white text-purple-600 rounded-full font-black shadow-lg">
              {setIdx + 1 >= WORD_SETS.length ? 'Tamat! Lihat Skor 🏆' : 'Set Seterusnya →'}
            </motion.button>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {/* Word hint */}
            <motion.div key={`${setIdx}-${wordIdx}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="rounded-3xl p-6 text-center" style={glassCard}>
              <div className="text-6xl mb-3">{currentWord.emoji}</div>
              <p className="text-white font-bold mb-1">💡 {currentWord.hint}</p>
              <p className="text-white/50 text-xs">{currentWord.word.length} huruf</p>
            </motion.div>

            {/* User word area */}
            <div className="rounded-3xl p-5" style={glassCard}>
              <p className="text-white/70 text-xs font-black uppercase tracking-wider mb-2">Perkataan Anda:</p>
              <div className="flex gap-2 flex-wrap min-h-14 items-center p-2 rounded-2xl" style={{ background: 'rgba(255,255,255,0.1)' }}>
                {userWord.length === 0 ? <p className="text-white/40 text-sm w-full text-center">Pilih huruf di bawah...</p> :
                  userWord.map((item, idx) => (
                    <motion.button key={idx} initial={{ scale: 0 }} animate={{ scale: 1 }}
                      onClick={() => handleRemoveLetter(idx)} whileHover={{ scale: 1.15 }}
                      className="w-12 h-12 bg-white text-purple-600 rounded-xl font-black text-lg shadow-lg">
                      {item.letter}
                    </motion.button>
                  ))}
              </div>
            </div>

            {/* Available letters */}
            <div className="rounded-3xl p-5" style={glassCard}>
              <p className="text-white/70 text-xs font-black uppercase tracking-wider mb-3">Pilih huruf:</p>
              <div className="grid grid-cols-5 gap-2">
                {shuffledLetters.map((letter, idx) => {
                  const isUsed = usedIndices.includes(idx);
                  return (
                    <motion.button key={idx} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.92 }}
                      onClick={() => !isUsed && handleLetterClick(letter, idx)}
                      disabled={isUsed}
                      className="aspect-square rounded-xl font-black text-xl text-white transition-all disabled:opacity-25"
                      style={{ background: isUsed ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.3)', border: '1px solid rgba(255,255,255,0.4)' }}>
                      {letter}
                    </motion.button>
                  );
                })}
              </div>
            </div>

            <AnimatePresence>
              {message && (
                <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="text-center text-lg font-black text-white">{message}</motion.div>
              )}
            </AnimatePresence>

            <div className="flex gap-3">
              <motion.button whileTap={{ scale: 0.95 }} onClick={() => setUserWord([])}
                className="flex-1 py-3 rounded-2xl font-black text-white flex items-center justify-center gap-2"
                style={{ background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.35)' }}>
                <RotateCcw className="w-4 h-4" /> Kosongkan
              </motion.button>
              <motion.button whileTap={{ scale: 0.95 }} onClick={checkWord}
                disabled={userWord.length === 0}
                className="flex-1 py-3 bg-white text-purple-600 rounded-2xl font-black shadow-lg disabled:opacity-40">
                Semak ✓
              </motion.button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}