import React, { useState } from 'react';
import { motion } from 'framer-motion';
import AppHeader from '@/components/AppHeader';

const glassCard = { background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.4)' };

export default function SortingGame() {
  const [items, setItems] = useState([
    { id: 1, emoji: '🍎', category: 'buah' },
    { id: 2, emoji: '🥕', category: 'sayuran' },
    { id: 3, emoji: '🍊', category: 'buah' },
    { id: 4, emoji: '🥬', category: 'sayuran' },
    { id: 5, emoji: '🍌', category: 'buah' },
    { id: 6, emoji: '🥦', category: 'sayuran' },
  ].sort(() => Math.random() - 0.5));

  const [sorted, setSorted] = useState({ buah: [], sayuran: [] });
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const categories = [
    { id: 'buah', label: 'Buah-Buahan', emoji: '🍎' },
    { id: 'sayuran', label: 'Sayuran', emoji: '🥕' },
  ];

  const handleDragStart = (e, item) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('itemId', item.id);
  };

  const handleDrop = (e, categoryId) => {
    e.preventDefault();
    const itemId = parseInt(e.dataTransfer.getData('itemId'));
    const item = items.find(i => i.id === itemId);
    if (item && item.category === categoryId) {
      const newSorted = { ...sorted, [categoryId]: [...sorted[categoryId], item] };
      const newItems = items.filter(i => i.id !== itemId);
      setSorted(newSorted);
      setItems(newItems);
      setScore(score + 10);
      if (newItems.length === 0) setGameOver(true);
    }
  };

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #667eea 0%, #f093fb 50%, #f5a623 100%)' }}>
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-orange-300 rounded-full mix-blend-multiply filter blur-3xl opacity-25 animate-pulse" />
        <div className="absolute bottom-20 left-10 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl opacity-25 animate-pulse" style={{ animationDelay: '1s' }} />
      </div>
      <AppHeader showBack={true} backTo="/games-hub" />
      <div className="relative max-w-lg mx-auto px-4 pb-32 pt-8">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          className="mb-5 p-5 rounded-3xl flex items-center justify-between" style={glassCard}>
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-white/30 flex items-center justify-center text-3xl shadow-inner">🗂️</div>
            <div>
              <h1 className="text-xl font-black text-white">Isih Kategori</h1>
              <p className="text-white/70 text-xs">Seret ke kategori yang betul</p>
            </div>
          </div>
          <div className="text-2xl font-black text-white">{score} ⭐</div>
        </motion.div>

        {!gameOver ? (
          <>
            {/* Items */}
            <div className="rounded-3xl p-5 mb-4" style={glassCard}>
              <p className="text-white/80 text-xs font-black uppercase tracking-wider mb-3">Seret ke kategori:</p>
              <div className="grid grid-cols-3 gap-3">
                {items.map(item => (
                  <motion.div key={item.id} draggable onDragStart={(e) => handleDragStart(e, item)}
                    whileHover={{ scale: 1.1 }} className="text-4xl p-3 rounded-xl cursor-move text-center"
                    style={{ background: 'rgba(255,255,255,0.25)', border: '2px solid rgba(255,255,255,0.4)' }}>
                    {item.emoji}
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Drop Zones */}
            <div className="grid grid-cols-2 gap-3">
              {categories.map(cat => (
                <div key={cat.id} onDragOver={(e) => e.preventDefault()} onDrop={(e) => handleDrop(e, cat.id)}
                  className="rounded-3xl p-4 min-h-48 border-4 border-dashed border-white/30"
                  style={{ background: 'rgba(255,255,255,0.15)' }}>
                  <div className="text-center mb-3">
                    <p className="text-3xl mb-1">{cat.emoji}</p>
                    <p className="font-black text-white text-sm">{cat.label}</p>
                  </div>
                  <div className="space-y-2">
                    {sorted[cat.id].map(item => (
                      <motion.div key={item.id} initial={{ scale: 0 }} animate={{ scale: 1 }}
                        className="text-2xl p-2 rounded-xl text-center bg-white/20">
                        {item.emoji}
                      </motion.div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
            className="rounded-3xl p-8 text-center" style={glassCard}>
            <p className="text-5xl mb-3">🎉</p>
            <h2 className="text-2xl font-black text-white mb-4">Sempurna!</h2>
            <p className="text-white/70 mb-6">Semua item telah disihkan!</p>
            <motion.button whileHover={{ scale: 1.05 }} onClick={() => window.location.reload()}
              className="px-6 py-3 bg-white text-purple-600 rounded-full font-black">Ulang</motion.button>
          </motion.div>
        )}
      </div>
    </div>
  );
}