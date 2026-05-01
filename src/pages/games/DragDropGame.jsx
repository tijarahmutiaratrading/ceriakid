import React, { useState } from 'react';
import { motion } from 'framer-motion';
import AppHeader from '@/components/AppHeader';

const glassCard = { background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.4)' };

const ROUNDS = [
  [{ id: 1, letter: 'A', image: '🍎', label: 'Epal' }, { id: 2, letter: 'B', image: '🍌', label: 'Pisang' }, { id: 3, letter: 'K', image: '🐱', label: 'Kucing' }, { id: 4, letter: 'I', image: '🍦', label: 'Ais Krim' }],
  [{ id: 1, letter: 'R', image: '🌹', label: 'Ros' }, { id: 2, letter: 'M', image: '🌙', label: 'Bulan' }, { id: 3, letter: 'J', image: '🌟', label: 'Bintang' }, { id: 4, letter: 'H', image: '🏠', label: 'Rumah' }],
  [{ id: 1, letter: 'G', image: '🐘', label: 'Gajah' }, { id: 2, letter: 'S', image: '🦁', label: 'Singa' }, { id: 3, letter: 'N', image: '🐦', label: 'Burung' }, { id: 4, letter: 'D', image: '🐶', label: 'Anjing' }],
  [{ id: 1, letter: 'P', image: '🍑', label: 'Pic' }, { id: 2, letter: 'T', image: '🍅', label: 'Tomato' }, { id: 3, letter: 'L', image: '🍋', label: 'Lemon' }, { id: 4, letter: 'C', image: '🍒', label: 'Ceri' }],
  [{ id: 1, letter: 'O', image: '🚗', label: 'Oto' }, { id: 2, letter: 'K', image: '🚂', label: 'Kereta Api' }, { id: 3, letter: 'B', image: '✈️', label: 'Bas Udara' }, { id: 4, letter: 'J', image: '🚢', label: 'Jambatan Laut' }],
];

export default function DragDropGame() {
  const [round, setRound] = useState(0);
  const [matches, setMatches] = useState([]);
  const [score, setScore] = useState(0);
  const [roundOver, setRoundOver] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  const items = ROUNDS[round];

  const handleDrop = (itemId) => {
    if (matches.includes(itemId)) return;
    const newMatches = [...matches, itemId];
    setMatches(newMatches);
    setScore(s => s + 10);
    if (newMatches.length === items.length) setRoundOver(true);
  };

  const nextRound = () => {
    if (round + 1 >= ROUNDS.length) { setGameOver(true); } else { setRound(r => r + 1); setMatches([]); setRoundOver(false); }
  };

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #667eea 0%, #f093fb 50%, #f5a623 100%)' }}>
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" />
      </div>
      <AppHeader showBack={true} backTo="/games-hub" />
      <div className="relative max-w-lg mx-auto px-4 pb-32 pt-8">

        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          className="mb-5 p-5 rounded-3xl flex items-center justify-between" style={glassCard}>
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-white/30 flex items-center justify-center text-3xl shadow-inner">🎯</div>
            <div>
              <h1 className="text-xl font-black text-white">Padankan Huruf</h1>
              <p className="text-white/70 text-xs">Pusingan {round + 1} / {ROUNDS.length}</p>
            </div>
          </div>
          <div className="text-2xl font-black text-white">{score} ⭐</div>
        </motion.div>

        <div className="flex gap-2 mb-4">
          {ROUNDS.map((_, i) => (
            <div key={i} className={`flex-1 h-2 rounded-full transition-all ${i < round ? 'bg-white' : i === round ? 'bg-white/70' : 'bg-white/20'}`} />
          ))}
        </div>

        {gameOver ? (
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
            className="rounded-3xl p-8 text-center" style={glassCard}>
            <p className="text-5xl mb-3">🏆</p>
            <h2 className="text-2xl font-black text-white mb-4">Tahniah! Semua Pusingan!</h2>
            <p className="text-yellow-300 text-3xl font-black mb-6">Skor: {score} ⭐</p>
            <motion.button whileTap={{ scale: 0.95 }} onClick={() => { setRound(0); setScore(0); setMatches([]); setRoundOver(false); setGameOver(false); }}
              className="px-6 py-3 bg-white text-purple-600 rounded-full font-black">Mula Semula</motion.button>
          </motion.div>
        ) : !roundOver ? (
          <div className="space-y-4">
            <div className="rounded-3xl p-5" style={glassCard}>
              <p className="text-white/80 text-xs font-black uppercase tracking-wider mb-3">Seret huruf:</p>
              <div className="grid grid-cols-4 gap-3">
                {items.map(item => !matches.includes(item.id) && (
                  <motion.div key={item.id} draggable whileHover={{ scale: 1.05 }}
                    className="p-4 rounded-2xl text-center cursor-move"
                    style={{ background: 'rgba(255,255,255,0.25)', border: '2px solid rgba(255,255,255,0.5)' }}>
                    <div className="text-3xl font-black text-white">{item.letter}</div>
                  </motion.div>
                ))}
              </div>
            </div>
            <div className="space-y-3">
              {items.map(item => (
                <motion.div key={item.id}
                  className={`p-5 rounded-2xl border-4 border-dashed transition-all ${matches.includes(item.id) ? 'border-green-400/60' : 'border-white/30'}`}
                  style={matches.includes(item.id) ? { background: 'rgba(52,211,153,0.2)' } : { background: 'rgba(255,255,255,0.15)' }}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => handleDrop(item.id)}>
                  <div className="flex items-center gap-4">
                    <div className="text-5xl">{item.image}</div>
                    <div>
                      <p className="text-white/60 text-xs">Padankan dengan:</p>
                      <p className="text-lg font-black text-white">{item.label}</p>
                    </div>
                    {matches.includes(item.id) && <div className="ml-auto text-3xl">✅</div>}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ) : (
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
            className="rounded-3xl p-8 text-center" style={glassCard}>
            <p className="text-5xl mb-3">🎉</p>
            <h2 className="text-2xl font-black text-white mb-4">Pusingan {round + 1} Selesai!</h2>
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