import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star } from 'lucide-react';
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
  const [matches, setMatches] = useState({});  // { targetId: letterId }
  const [score, setScore] = useState(0);
  const [roundOver, setRoundOver] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [wrongTarget, setWrongTarget] = useState(null); // id of wrong drop target
  const [correctFlash, setCorrectFlash] = useState(null);
  const dragItem = useRef(null);

  const items = ROUNDS[round];
  const correctMatches = Object.keys(matches).filter(targetId => {
    const item = items.find(i => i.id === parseInt(targetId));
    return item && matches[targetId] === item.id;
  });

  const handleDragStart = (itemId) => {
    dragItem.current = itemId;
  };

  const handleDrop = (e, targetId) => {
    e.preventDefault();
    const droppedLetterId = dragItem.current;
    if (!droppedLetterId) return;

    // Check if target already correctly matched
    if (matches[targetId]) return;

    // Verify correct match: the dragged letter must belong to this target
    const targetItem = items.find(i => i.id === targetId);
    const draggedItem = items.find(i => i.id === droppedLetterId);

    if (targetItem && draggedItem && draggedItem.id === targetItem.id) {
      // Correct!
      const newMatches = { ...matches, [targetId]: droppedLetterId };
      setMatches(newMatches);
      setScore(s => s + 20);
      setCorrectFlash(targetId);
      setTimeout(() => setCorrectFlash(null), 800);
      if (Object.keys(newMatches).length === items.length) {
        setTimeout(() => setRoundOver(true), 500);
      }
    } else {
      // Wrong drop — flash red
      setWrongTarget(targetId);
      setTimeout(() => setWrongTarget(null), 700);
    }
    dragItem.current = null;
  };

  const nextRound = () => {
    if (round + 1 >= ROUNDS.length) { setGameOver(true); }
    else { setRound(r => r + 1); setMatches({}); setRoundOver(false); }
  };

  const unmatched = items.filter(item => !Object.values(matches).includes(item.id));
  const stars = correctMatches.length === items.length ? 3 : correctMatches.length >= items.length * 0.7 ? 2 : 1;

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
            <motion.button whileTap={{ scale: 0.95 }} onClick={() => { setRound(0); setScore(0); setMatches({}); setRoundOver(false); setGameOver(false); }}
              className="px-6 py-3 bg-white text-purple-600 rounded-full font-black">Mula Semula</motion.button>
          </motion.div>
        ) : !roundOver ? (
          <div className="space-y-4">
            {/* Draggable letters */}
            <div className="rounded-3xl p-5" style={glassCard}>
              <p className="text-white/80 text-xs font-black uppercase tracking-wider mb-3">Seret huruf ke gambar yang betul:</p>
              <div className="flex gap-3 flex-wrap">
                {unmatched.map(item => (
                  <motion.div
                    key={item.id}
                    draggable
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onDragStart={() => handleDragStart(item.id)}
                    className="p-4 rounded-2xl text-center cursor-grab active:cursor-grabbing min-w-[60px]"
                    style={{ background: 'rgba(255,255,255,0.35)', border: '2px solid rgba(255,255,255,0.6)' }}>
                    <div className="text-3xl font-black text-white">{item.letter}</div>
                    <div className="text-xs text-white/70 mt-1">{item.letter}</div>
                  </motion.div>
                ))}
                {unmatched.length === 0 && (
                  <p className="text-white/60 text-sm">Semua huruf dah dipadankan! 🎉</p>
                )}
              </div>
            </div>

            {/* Drop targets */}
            <div className="space-y-3">
              {items.map(item => {
                const isMatched = !!matches[item.id];
                const isWrong = wrongTarget === item.id;
                const isCorrectFlashing = correctFlash === item.id;
                return (
                  <motion.div
                    key={item.id}
                    animate={isWrong ? { x: [-6, 6, -6, 6, 0] } : {}}
                    transition={{ duration: 0.3 }}
                    className={`p-4 rounded-2xl border-4 border-dashed transition-all`}
                    style={
                      isCorrectFlashing ? { background: 'rgba(52,211,153,0.5)', borderColor: 'rgba(52,211,153,0.9)' } :
                      isMatched ? { background: 'rgba(52,211,153,0.2)', borderColor: 'rgba(52,211,153,0.6)' } :
                      isWrong ? { background: 'rgba(239,68,68,0.2)', borderColor: 'rgba(239,68,68,0.6)' } :
                      { background: 'rgba(255,255,255,0.15)', borderColor: 'rgba(255,255,255,0.3)' }
                    }
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => handleDrop(e, item.id)}>
                    <div className="flex items-center gap-4">
                      <div className="text-5xl">{item.image}</div>
                      <div className="flex-1">
                        <p className="text-white/60 text-xs">Padankan huruf untuk:</p>
                        <p className="text-lg font-black text-white">{item.label}</p>
                      </div>
                      {isMatched ? (
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-3xl">✅</motion.div>
                      ) : (
                        <div className="w-12 h-12 rounded-xl border-2 border-dashed border-white/40 flex items-center justify-center">
                          <span className="text-white/30 text-xs">?</span>
                        </div>
                      )}
                    </div>
                    {isWrong && (
                      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-200 text-xs font-bold mt-2">
                        ❌ Salah! Cuba huruf lain.
                      </motion.p>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>
        ) : (
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
            className="rounded-3xl p-8 text-center" style={glassCard}>
            <p className="text-5xl mb-3">🎉</p>
            <h2 className="text-2xl font-black text-white mb-3">Pusingan {round + 1} Selesai!</h2>
            <div className="flex justify-center gap-1 mb-6">
              {[1, 2, 3].map(i => <Star key={i} className={`w-8 h-8 ${i <= stars ? 'text-yellow-300 fill-yellow-300' : 'text-white/30'}`} />)}
            </div>
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