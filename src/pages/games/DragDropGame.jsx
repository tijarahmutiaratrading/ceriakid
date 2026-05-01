import React, { useState } from 'react';
import { motion } from 'framer-motion';
import AppHeader from '@/components/AppHeader';

const glassCard = { background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.4)' };

export default function DragDropGame() {
  const [matches, setMatches] = useState([]);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const items = [
    { id: 1, letter: 'A', image: '🍎', label: 'Epal' },
    { id: 2, letter: 'B', image: '🍌', label: 'Pisang' },
    { id: 3, letter: 'K', image: '🐱', label: 'Kucing' },
    { id: 4, letter: 'I', image: '🍦', label: 'Ais Krim' },
  ];

  const handleDragEnd = (source, destination, draggable) => {
    if (!destination) return;
    const itemId = parseInt(draggable.draggableId);
    const targetZone = destination.droppableId;
    if (targetZone === `zone-${itemId}` && !matches.includes(itemId)) {
      const newMatches = [...matches, itemId];
      setMatches(newMatches);
      setScore(score + 10);
      if (newMatches.length === items.length) setGameOver(true);
    }
  };

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #667eea 0%, #f093fb 50%, #f5a623 100%)' }}>
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" />
        <div className="absolute bottom-20 left-10 w-72 h-72 bg-cyan-300 rounded-full mix-blend-multiply filter blur-3xl opacity-25 animate-pulse" style={{ animationDelay: '1s' }} />
      </div>
      <AppHeader showBack={true} backTo="/games-hub" />
      <div className="relative max-w-lg mx-auto px-4 pb-32 pt-8">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          className="mb-5 p-5 rounded-3xl flex items-center justify-between" style={glassCard}>
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-white/30 flex items-center justify-center text-3xl shadow-inner">🎯</div>
            <div>
              <h1 className="text-xl font-black text-white">Padankan Huruf</h1>
              <p className="text-white/70 text-xs">Seret huruf ke gambar yang betul</p>
            </div>
          </div>
          <div className="text-2xl font-black text-white">{score} ⭐</div>
        </motion.div>

        {!gameOver ? (
          <div className="space-y-4">
            {/* Draggable Letters */}
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

            {/* Drop Zones */}
            <div className="space-y-3">
              {items.map(item => (
                <motion.div key={item.id}
                  className={`p-5 rounded-2xl border-4 border-dashed transition-all ${
                    matches.includes(item.id) ? 'border-green-400/60' : 'border-white/30 hover:border-white/50'
                  }`}
                  style={matches.includes(item.id)
                    ? { background: 'rgba(52,211,153,0.2)' }
                    : { background: 'rgba(255,255,255,0.15)' }
                  }
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => handleDragEnd(null, { droppableId: `zone-${item.id}` }, { draggableId: item.id.toString() })}>
                  <div className="flex items-center gap-4">
                    <div className="text-5xl">{item.image}</div>
                    <div>
                      <p className="text-white/60 text-xs">Padankan dengan:</p>
                      <p className="text-lg font-black text-white">{item.label}</p>
                    </div>
                    {matches.includes(item.id) && <div className="ml-auto text-3xl animate-bounce">✅</div>}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ) : (
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
            className="rounded-3xl p-8 text-center" style={glassCard}>
            <p className="text-5xl mb-3">🎉</p>
            <h2 className="text-2xl font-black text-white mb-4">Sempurna!</h2>
            <p className="text-white/70 mb-6">Anda memadankan semua huruf dengan betul!</p>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-white text-purple-600 rounded-full font-black shadow-lg">
              Ulang Permainan
            </motion.button>
          </motion.div>
        )}
      </div>
    </div>
  );
}