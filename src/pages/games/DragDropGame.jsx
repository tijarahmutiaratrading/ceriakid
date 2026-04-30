import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import AppHeader from '@/components/AppHeader';

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
      setMatches([...matches, itemId]);
      setScore(score + 10);
      if (matches.length + 1 === items.length) {
        setGameOver(true);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-cyan-100">
      <AppHeader showBack={true} backTo="/dashboard" />
      
      <div className="max-w-2xl mx-auto px-4 py-8 pb-24 pt-20">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-black text-gray-800">🎯 Padankan Huruf</h1>
          <div className="text-2xl font-black text-blue-600">{score} ⭐</div>
        </div>

        {!gameOver ? (
          <div className="space-y-6">
            {/* Draggable Items */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <p className="text-sm font-bold text-gray-600 mb-4">Seret huruf ke gambar yang betul:</p>
              <div className="grid grid-cols-2 gap-4">
                {items.map(item => (
                  !matches.includes(item.id) && (
                    <motion.div
                      key={item.id}
                      draggable
                      onDragEnd={() => {}}
                      whileHover={{ scale: 1.05 }}
                      className="p-4 bg-blue-100 rounded-xl text-center cursor-move border-2 border-blue-300"
                    >
                      <div className="text-4xl font-black text-blue-600 mb-2">{item.letter}</div>
                    </motion.div>
                  )
                ))}
              </div>
            </div>

            {/* Drop Zones */}
            <div className="space-y-4">
              {items.map(item => (
                <motion.div
                  key={item.id}
                  className={`p-6 rounded-2xl border-4 border-dashed transition-all ${
                    matches.includes(item.id)
                      ? 'bg-green-100 border-green-400'
                      : 'bg-yellow-50 border-yellow-300 hover:border-yellow-400'
                  }`}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => handleDragEnd(null, { droppableId: `zone-${item.id}` }, { draggableId: item.id.toString() })}
                >
                  <div className="flex items-center gap-4">
                    <div className="text-6xl">{item.image}</div>
                    <div>
                      <p className="text-sm text-gray-500">Padankan dengan:</p>
                      <p className="text-xl font-black text-gray-800">{item.label}</p>
                    </div>
                    {matches.includes(item.id) && (
                      <div className="ml-auto text-4xl animate-bounce">✅</div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-8 text-center shadow-xl"
          >
            <p className="text-5xl mb-3">🎉</p>
            <h2 className="text-2xl font-black text-gray-800 mb-4">Sempurna!</h2>
            <p className="text-gray-600 mb-6">Anda mempadankan semua huruf dengan betul!</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-blue-600 text-white rounded-full font-black shadow-lg"
            >
              Ulang Permainan
            </motion.button>
          </motion.div>
        )}
      </div>
    </div>
  );
}