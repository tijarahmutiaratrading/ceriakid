import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Volume2, RotateCcw } from 'lucide-react';
import { Link } from 'react-router-dom';
import AppHeader from '@/components/AppHeader';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';

export default function MemoryGame() {
  const { user } = useAuth();
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [moves, setMoves] = useState(0);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const gameData = [
    { id: 1, bm: 'Kucing', en: 'Cat', emoji: '🐱' },
    { id: 2, bm: 'Anjing', en: 'Dog', emoji: '🐶' },
    { id: 3, bm: 'Burung', en: 'Bird', emoji: '🐦' },
    { id: 4, bm: 'Ikan', en: 'Fish', emoji: '🐟' },
    { id: 5, bm: 'Gajah', en: 'Elephant', emoji: '🐘' },
    { id: 6, bm: 'Singa', en: 'Lion', emoji: '🦁' },
  ];

  useEffect(() => {
    initializeGame();
  }, []);

  const initializeGame = () => {
    const shuffled = [...gameData, ...gameData].sort(() => Math.random() - 0.5);
    setCards(shuffled.map((card, idx) => ({ ...card, index: idx })));
    setFlipped([]);
    setMatched([]);
    setMoves(0);
    setScore(0);
    setGameOver(false);
  };

  const toggleFlip = (index) => {
    if (flipped.includes(index) || matched.includes(index) || flipped.length === 2) return;
    
    const newFlipped = [...flipped, index];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(moves + 1);
      setTimeout(() => checkMatch(newFlipped), 600);
    }
  };

  const checkMatch = (flippedIndices) => {
    const [idx1, idx2] = flippedIndices;
    if (cards[idx1].id === cards[idx2].id) {
      setMatched([...matched, ...flippedIndices]);
      setScore(score + 10);
      if (matched.length + 2 === cards.length) {
        setGameOver(true);
      }
    }
    setFlipped([]);
  };

  const stars = Math.max(3 - Math.floor(moves / 6), 1);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-pink-100">
      <AppHeader showBack={true} backTo="/dashboard" title="Memory Game" />
      
      <div className="max-w-2xl mx-auto px-4 py-8 pb-24 pt-20">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-black text-gray-800">🧠 Permainan Ingatan</h1>
            <p className="text-sm text-gray-600 mt-1">Cari pasangan yang sama!</p>
          </div>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={initializeGame}
            className="p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-all"
          >
            <RotateCcw className="w-5 h-5 text-purple-600" />
          </motion.button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-white rounded-2xl p-4 text-center shadow-md">
            <p className="text-xs text-gray-500 font-bold">Langkah</p>
            <p className="text-2xl font-black text-purple-600">{moves}</p>
          </div>
          <div className="bg-white rounded-2xl p-4 text-center shadow-md">
            <p className="text-xs text-gray-500 font-bold">Skor</p>
            <p className="text-2xl font-black text-orange-500">{score}</p>
          </div>
          <div className="bg-white rounded-2xl p-4 text-center shadow-md">
            <p className="text-xs text-gray-500 font-bold">Bintang</p>
            <p className="text-2xl">{'⭐'.repeat(stars)}</p>
          </div>
        </div>

        {/* Game Grid */}
        {!gameOver ? (
          <div className="grid grid-cols-4 gap-3 mb-6">
            {cards.map((card, idx) => (
              <motion.button
                key={idx}
                whileTap={{ scale: 0.95 }}
                onClick={() => toggleFlip(idx)}
                className={`aspect-square rounded-2xl font-black text-3xl transition-all transform ${
                  flipped.includes(idx) || matched.includes(idx)
                    ? 'bg-white shadow-lg'
                    : 'bg-gradient-to-br from-purple-400 to-pink-400 shadow-md hover:shadow-lg'
                }`}
              >
                {flipped.includes(idx) || matched.includes(idx) ? card.emoji : '?'}
              </motion.button>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-8 text-center shadow-xl mb-6"
          >
            <p className="text-5xl mb-3">🎉</p>
            <h2 className="text-2xl font-black text-gray-800 mb-2">Tahniah!</h2>
            <p className="text-gray-600 mb-4">Selesai dalam {moves} langkah</p>
            <div className="flex justify-center gap-1 mb-6">
              {[...Array(stars)].map((_, i) => (
                <span key={i} className="text-3xl animate-bounce">⭐</span>
              ))}
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={initializeGame}
              className="px-6 py-3 bg-purple-600 text-white rounded-full font-black shadow-lg"
            >
              Ulang Permainan
            </motion.button>
          </motion.div>
        )}
      </div>
    </div>
  );
}