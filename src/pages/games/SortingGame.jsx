import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star } from 'lucide-react';
import AppHeader from '@/components/AppHeader';

const glassCard = { background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.4)' };

const ROUNDS = [
  { cats: [{ id: 'buah', label: 'Buah-Buahan', emoji: '🍎' }, { id: 'sayuran', label: 'Sayuran', emoji: '🥕' }], items: [{ id:1,emoji:'🍎',cat:'buah' },{ id:2,emoji:'🥕',cat:'sayuran' },{ id:3,emoji:'🍊',cat:'buah' },{ id:4,emoji:'🥬',cat:'sayuran' },{ id:5,emoji:'🍌',cat:'buah' },{ id:6,emoji:'🥦',cat:'sayuran' }] },
  { cats: [{ id: 'haiwan_air', label: 'Haiwan Air', emoji: '🐟' }, { id: 'haiwan_darat', label: 'Haiwan Darat', emoji: '🐘' }], items: [{ id:1,emoji:'🐟',cat:'haiwan_air' },{ id:2,emoji:'🐘',cat:'haiwan_darat' },{ id:3,emoji:'🐬',cat:'haiwan_air' },{ id:4,emoji:'🦁',cat:'haiwan_darat' },{ id:5,emoji:'🦈',cat:'haiwan_air' },{ id:6,emoji:'🐯',cat:'haiwan_darat' }] },
  { cats: [{ id: 'kenderaan_udara', label: 'Udara', emoji: '✈️' }, { id: 'kenderaan_darat', label: 'Darat', emoji: '🚗' }], items: [{ id:1,emoji:'✈️',cat:'kenderaan_udara' },{ id:2,emoji:'🚗',cat:'kenderaan_darat' },{ id:3,emoji:'🚁',cat:'kenderaan_udara' },{ id:4,emoji:'🚂',cat:'kenderaan_darat' },{ id:5,emoji:'🛸',cat:'kenderaan_udara' },{ id:6,emoji:'🚌',cat:'kenderaan_darat' }] },
  { cats: [{ id: 'pakaian', label: 'Pakaian', emoji: '👕' }, { id: 'makanan', label: 'Makanan', emoji: '🍔' }], items: [{ id:1,emoji:'👕',cat:'pakaian' },{ id:2,emoji:'🍔',cat:'makanan' },{ id:3,emoji:'👗',cat:'pakaian' },{ id:4,emoji:'🍕',cat:'makanan' },{ id:5,emoji:'👒',cat:'pakaian' },{ id:6,emoji:'🍜',cat:'makanan' }] },
  { cats: [{ id: 'alat_sekolah', label: 'Alat Sekolah', emoji: '📚' }, { id: 'sukan', label: 'Sukan', emoji: '⚽' }], items: [{ id:1,emoji:'📚',cat:'alat_sekolah' },{ id:2,emoji:'⚽',cat:'sukan' },{ id:3,emoji:'✏️',cat:'alat_sekolah' },{ id:4,emoji:'🏀',cat:'sukan' },{ id:5,emoji:'📐',cat:'alat_sekolah' },{ id:6,emoji:'🎾',cat:'sukan' }] },
];

export default function SortingGame() {
  const [round, setRound] = useState(0);
  const [items, setItems] = useState(() => [...ROUNDS[0].items].sort(() => Math.random() - 0.5));
  const [sorted, setSorted] = useState({});
  const [score, setScore] = useState(0);
  const [roundOver, setRoundOver] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [wrongCat, setWrongCat] = useState(null);
  const [correctFlash, setCorrectFlash] = useState(null);
  const [wrongCount, setWrongCount] = useState(0);

  const currentRound = ROUNDS[round];

  const handleDragStart = (e, item) => {
    e.dataTransfer.setData('itemId', item.id);
  };

  const handleDrop = (e, catId) => {
    e.preventDefault();
    const itemId = parseInt(e.dataTransfer.getData('itemId'));
    const item = items.find(i => i.id === itemId);
    if (!item) return;

    if (item.cat === catId) {
      // Correct
      const newSorted = { ...sorted, [catId]: [...(sorted[catId] || []), item] };
      const newItems = items.filter(i => i.id !== itemId);
      setSorted(newSorted);
      setItems(newItems);
      setScore(s => s + 10);
      setCorrectFlash(catId);
      setTimeout(() => setCorrectFlash(null), 700);
      if (newItems.length === 0) setTimeout(() => setRoundOver(true), 500);
    } else {
      // Wrong category
      setWrongCat(catId);
      setWrongCount(c => c + 1);
      setTimeout(() => setWrongCat(null), 700);
    }
  };

  const nextRound = () => {
    if (round + 1 >= ROUNDS.length) { setGameOver(true); }
    else {
      const r = round + 1;
      setRound(r);
      setItems([...ROUNDS[r].items].sort(() => Math.random() - 0.5));
      setSorted({});
      setRoundOver(false);
      setWrongCount(0);
    }
  };

  const totalItems = currentRound.items.length;
  const sortedCount = Object.values(sorted).flat().length;
  const stars = wrongCount === 0 ? 3 : wrongCount <= 2 ? 2 : 1;

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #667eea 0%, #f093fb 50%, #f5a623 100%)' }}>
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-orange-300 rounded-full mix-blend-multiply filter blur-3xl opacity-25 animate-pulse" />
      </div>
      <AppHeader showBack={true} backTo="/games-hub" />
      <div className="relative max-w-lg mx-auto px-4 pb-32 pt-8">

        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          className="mb-5 p-5 rounded-3xl flex items-center justify-between" style={glassCard}>
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-white/30 flex items-center justify-center text-3xl shadow-inner">🗂️</div>
            <div>
              <h1 className="text-xl font-black text-white">Isih Kategori</h1>
              <p className="text-white/70 text-xs">Pusingan {round + 1} / {ROUNDS.length}</p>
            </div>
          </div>
          <div className="text-2xl font-black text-white">{score} ⭐</div>
        </motion.div>

        <div className="flex gap-2 mb-3">
          {ROUNDS.map((_, i) => (
            <div key={i} className={`flex-1 h-2 rounded-full transition-all ${i < round ? 'bg-white' : i === round ? 'bg-white/70' : 'bg-white/20'}`} />
          ))}
        </div>

        {/* Progress indicator */}
        <div className="mb-3 rounded-2xl p-3 text-center" style={glassCard}>
          <p className="text-white/70 text-sm font-bold">{sortedCount} / {totalItems} disusun</p>
          <div className="w-full h-2 bg-white/20 rounded-full mt-1 overflow-hidden">
            <motion.div className="h-full bg-white rounded-full" animate={{ width: `${(sortedCount / totalItems) * 100}%` }} />
          </div>
        </div>

        {gameOver ? (
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
            className="rounded-3xl p-8 text-center" style={glassCard}>
            <p className="text-5xl mb-3">🏆</p>
            <h2 className="text-2xl font-black text-white mb-4">Tahniah! Semua Pusingan!</h2>
            <p className="text-yellow-300 text-3xl font-black mb-6">Skor: {score} ⭐</p>
            <motion.button whileTap={{ scale: 0.95 }} onClick={() => { setRound(0); setItems([...ROUNDS[0].items].sort(() => Math.random() - 0.5)); setSorted({}); setScore(0); setRoundOver(false); setGameOver(false); setWrongCount(0); }}
              className="px-6 py-3 bg-white text-purple-600 rounded-full font-black">Mula Semula</motion.button>
          </motion.div>
        ) : !roundOver ? (
          <>
            {/* Items to drag */}
            <AnimatePresence>
              {items.length > 0 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-3xl p-5 mb-4" style={glassCard}>
                  <p className="text-white/80 text-xs font-black uppercase tracking-wider mb-3">Seret ke kategori yang betul:</p>
                  <div className="grid grid-cols-3 gap-3">
                    <AnimatePresence>
                      {items.map(item => (
                        <motion.div
                          key={item.id}
                          layout
                          initial={{ opacity: 0, scale: 0.5 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.5 }}
                          draggable
                          onDragStart={(e) => handleDragStart(e, item)}
                          whileHover={{ scale: 1.15, y: -4 }}
                          className="text-4xl p-3 rounded-xl cursor-grab active:cursor-grabbing text-center"
                          style={{ background: 'rgba(255,255,255,0.25)', border: '2px solid rgba(255,255,255,0.4)' }}>
                          {item.emoji}
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Drop zones */}
            <div className="grid grid-cols-2 gap-3">
              {currentRound.cats.map(cat => {
                const isWrong = wrongCat === cat.id;
                const isCorrect = correctFlash === cat.id;
                return (
                  <motion.div
                    key={cat.id}
                    animate={isWrong ? { x: [-5, 5, -5, 5, 0] } : {}}
                    transition={{ duration: 0.3 }}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => handleDrop(e, cat.id)}
                    className="rounded-3xl p-4 min-h-44 border-4 border-dashed transition-all"
                    style={
                      isCorrect ? { background: 'rgba(52,211,153,0.3)', borderColor: 'rgba(52,211,153,0.8)' } :
                      isWrong ? { background: 'rgba(239,68,68,0.2)', borderColor: 'rgba(239,68,68,0.7)' } :
                      { background: 'rgba(255,255,255,0.15)', borderColor: 'rgba(255,255,255,0.3)' }
                    }>
                    <div className="text-center mb-3">
                      <p className="text-3xl mb-1">{cat.emoji}</p>
                      <p className="font-black text-white text-sm">{cat.label}</p>
                      {isWrong && <p className="text-red-200 text-xs mt-1 font-bold">❌ Salah!</p>}
                    </div>
                    <div className="space-y-2">
                      <AnimatePresence>
                        {(sorted[cat.id] || []).map(item => (
                          <motion.div
                            key={item.id}
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="text-2xl p-2 rounded-xl text-center bg-white/20">
                            {item.emoji}
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </>
        ) : (
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
            className="rounded-3xl p-8 text-center" style={glassCard}>
            <p className="text-5xl mb-3">🎉</p>
            <h2 className="text-2xl font-black text-white mb-3">Pusingan {round + 1} Selesai!</h2>
            <p className="text-white/70 mb-3">{wrongCount === 0 ? 'Sempurna! Tiada kesilapan! 🌟' : `${wrongCount} kesilapan`}</p>
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