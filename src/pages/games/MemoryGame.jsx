import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { RotateCcw } from 'lucide-react';
import AppHeader from '@/components/AppHeader';

const glassCard = { background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.4)' };

const ROUNDS = [
  [{ id: 1, emoji: '🐱' }, { id: 2, emoji: '🐶' }, { id: 3, emoji: '🐦' }, { id: 4, emoji: '🐟' }, { id: 5, emoji: '🐘' }, { id: 6, emoji: '🦁' }],
  [{ id: 1, emoji: '🍎' }, { id: 2, emoji: '🍌' }, { id: 3, emoji: '🍊' }, { id: 4, emoji: '🍇' }, { id: 5, emoji: '🍓' }, { id: 6, emoji: '🍉' }],
  [{ id: 1, emoji: '🚗' }, { id: 2, emoji: '✈️' }, { id: 3, emoji: '🚢' }, { id: 4, emoji: '🚂' }, { id: 5, emoji: '🚁' }, { id: 6, emoji: '🛸' }],
  [{ id: 1, emoji: '⚽' }, { id: 2, emoji: '🏀' }, { id: 3, emoji: '🎾' }, { id: 4, emoji: '🏐' }, { id: 5, emoji: '🎱' }, { id: 6, emoji: '🏓' }],
  [{ id: 1, emoji: '🌸' }, { id: 2, emoji: '🌻' }, { id: 3, emoji: '🌹' }, { id: 4, emoji: '🌺' }, { id: 5, emoji: '🌼' }, { id: 6, emoji: '🍀' }],
];

export default function MemoryGame() {
  const [round, setRound] = useState(0);
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [moves, setMoves] = useState(0);
  const [score, setScore] = useState(0);
  const [roundOver, setRoundOver] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => { initRound(round); }, [round]);

  const initRound = (r) => {
    const data = ROUNDS[r];
    const shuffled = [...data, ...data].sort(() => Math.random() - 0.5);
    setCards(shuffled.map((card, idx) => ({ ...card, index: idx })));
    setFlipped([]); setMatched([]); setMoves(0); setRoundOver(false);
  };

  const toggleFlip = (index) => {
    if (flipped.includes(index) || matched.includes(index) || flipped.length === 2) return;
    const newFlipped = [...flipped, index];
    setFlipped(newFlipped);
    if (newFlipped.length === 2) { setMoves(m => m + 1); setTimeout(() => checkMatch(newFlipped), 600); }
  };

  const checkMatch = (flippedIndices) => {
    const [idx1, idx2] = flippedIndices;
    if (cards[idx1].id === cards[idx2].id) {
      const newMatched = [...matched, ...flippedIndices];
      setMatched(newMatched);
      setScore(s => s + 10);
      if (newMatched.length === cards.length) setRoundOver(true);
    }
    setFlipped([]);
  };

  const nextRound = () => {
    if (round + 1 >= ROUNDS.length) { setGameOver(true); } else { setRound(r => r + 1); }
  };

  const restartGame = () => { setRound(0); setScore(0); setGameOver(false); };

  const stars = Math.max(3 - Math.floor(moves / 6), 1);

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #667eea 0%, #f093fb 50%, #f5a623 100%)' }}>
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" />
        <div className="absolute top-1/3 -left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" style={{ animationDelay: '1s' }} />
      </div>
      <AppHeader showBack={true} backTo="/games-hub" />
      <div className="relative max-w-lg mx-auto px-4 pb-32 pt-8">

        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          className="mb-5 p-5 rounded-3xl flex items-center justify-between" style={glassCard}>
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-white/30 flex items-center justify-center text-3xl shadow-inner">🧠</div>
            <div>
              <h1 className="text-xl font-black text-white">Permainan Ingatan</h1>
              <p className="text-white/70 text-xs">Pusingan {round + 1} / {ROUNDS.length}</p>
            </div>
          </div>
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => initRound(round)}
            className="w-11 h-11 rounded-2xl bg-white/20 flex items-center justify-center border border-white/30">
            <RotateCcw className="w-5 h-5 text-white" />
          </motion.button>
        </motion.div>

        {/* Round progress */}
        <div className="flex gap-2 mb-4">
          {ROUNDS.map((_, i) => (
            <div key={i} className={`flex-1 h-2 rounded-full transition-all ${i < round ? 'bg-white' : i === round ? 'bg-white/70' : 'bg-white/20'}`} />
          ))}
        </div>

        <div className="grid grid-cols-3 gap-3 mb-4">
          {[{ label: 'Langkah', value: moves }, { label: 'Skor', value: score }, { label: 'Bintang', value: '⭐'.repeat(stars) }].map((s, i) => (
            <div key={i} className="rounded-2xl p-3 text-center" style={glassCard}>
              <p className="text-white/60 text-xs font-bold">{s.label}</p>
              <p className="text-xl font-black text-white">{s.value}</p>
            </div>
          ))}
        </div>

        {gameOver ? (
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
            className="rounded-3xl p-8 text-center" style={glassCard}>
            <p className="text-5xl mb-3">🏆</p>
            <h2 className="text-2xl font-black text-white mb-2">Tahniah! Semua Pusingan!</h2>
            <p className="text-yellow-300 text-3xl font-black mb-6">Skor: {score} ⭐</p>
            <motion.button whileTap={{ scale: 0.95 }} onClick={restartGame}
              className="px-6 py-3 bg-white text-purple-600 rounded-full font-black shadow-lg">Mula Semula</motion.button>
          </motion.div>
        ) : !roundOver ? (
          <div className="grid grid-cols-4 gap-3">
            {cards.map((card, idx) => (
              <motion.button key={idx} whileTap={{ scale: 0.95 }} onClick={() => toggleFlip(idx)}
                className={`aspect-square rounded-2xl font-black text-3xl transition-all`}
                style={flipped.includes(idx) || matched.includes(idx)
                  ? { background: 'white' }
                  : { background: 'rgba(255,255,255,0.25)', border: '1px solid rgba(255,255,255,0.4)' }}>
                {flipped.includes(idx) || matched.includes(idx) ? card.emoji : '?'}
              </motion.button>
            ))}
          </div>
        ) : (
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
            className="rounded-3xl p-8 text-center" style={glassCard}>
            <p className="text-5xl mb-3">🎉</p>
            <h2 className="text-2xl font-black text-white mb-2">Pusingan {round + 1} Selesai!</h2>
            <p className="text-white/70 mb-6">Selesai dalam {moves} langkah · {'⭐'.repeat(stars)}</p>
            <motion.button whileTap={{ scale: 0.95 }} onClick={nextRound}
              className="px-6 py-3 bg-white text-purple-600 rounded-full font-black shadow-lg">
              {round + 1 >= ROUNDS.length ? 'Tamat! Lihat Skor' : 'Pusingan Seterusnya →'}
            </motion.button>
          </motion.div>
        )}
      </div>
    </div>
  );
}