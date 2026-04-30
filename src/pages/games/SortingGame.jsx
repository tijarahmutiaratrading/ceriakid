import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { RotateCcw } from 'lucide-react';
import AppHeader from '@/components/AppHeader';

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
    { id: 'buah', label: 'Buah-Buahan', emoji: '🍎', color: 'from-red-100 to-red-200' },
    { id: 'sayuran', label: 'Sayuran', emoji: '🥕', color: 'from-orange-100 to-orange-200' },
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
      setSorted({
        ...sorted,
        [categoryId]: [...sorted[categoryId], item]
      });
      setItems(items.filter(i => i.id !== itemId));
      setScore(score + 10);

      if (items.length === 1) {
        setGameOver(true);
      }
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-100 to-yellow-100">
      <AppHeader showBack={true} backTo="/dashboard" />
      
      <div className="max-w-2xl mx-auto px-4 py-8 pb-24 pt-20">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-black text-gray-800">🗂️ Isih Kategori</h1>
          <div className="text-2xl font-black text-orange-600">{score} ⭐</div>
        </div>

        {!gameOver ? (
          <>
            {/* Items to Sort */}
            <div className="bg-white rounded-2xl p-6 shadow-lg mb-6">
              <p className="text-sm font-bold text-gray-600 mb-4">Seret ke kategori yang betul:</p>
              <div className="grid grid-cols-3 gap-3">
                {items.map(item => (
                  <motion.div
                    key={item.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, item)}
                    whileHover={{ scale: 1.1 }}
                    className="text-4xl p-3 bg-yellow-100 rounded-xl cursor-move border-2 border-yellow-300 text-center"
                  >
                    {item.emoji}
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Drop Zones */}
            <div className="grid grid-cols-2 gap-4">
              {categories.map(cat => (
                <motion.div
                  key={cat.id}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, cat.id)}
                  className={`p-6 rounded-2xl border-4 border-dashed min-h-64 bg-gradient-to-br ${cat.color} border-gray-300`}
                >
                  <div className="text-center mb-4">
                    <p className="text-4xl mb-2">{cat.emoji}</p>
                    <p className="font-black text-gray-800">{cat.label}</p>
                  </div>
                  <div className="space-y-2">
                    {sorted[cat.id].map(item => (
                      <motion.div
                        key={item.id}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="text-3xl p-3 bg-white rounded-xl text-center shadow-md"
                      >
                        {item.emoji}
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-8 text-center shadow-xl"
          >
            <p className="text-5xl mb-3">🎉</p>
            <h2 className="text-2xl font-black text-gray-800 mb-4">Sempurna!</h2>
            <p className="text-gray-600 mb-6">Semua item telah disihkan dengan betul!</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-orange-600 text-white rounded-full font-black"
            >
              Ulang
            </motion.button>
          </motion.div>
        )}
      </div>
    </div>
  );
}