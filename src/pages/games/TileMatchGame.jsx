import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { RotateCcw } from 'lucide-react';
import AppHeader from '@/components/AppHeader';

export default function TileMatchGame() {
  const [grid, setGrid] = useState([]);
  const [selectedTiles, setSelectedTiles] = useState([]);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const tileData = [
    { id: 1, value: '3', type: 'number' },
    { id: 2, value: '1+2', type: 'number' },
    { id: 3, value: '2', type: 'number' },
    { id: 4, value: '1+1', type: 'number' },
    { id: 5, value: '1', type: 'number' },
    { id: 6, value: '0+1', type: 'number' },
  ];

  useEffect(() => {
    initializeGame();
  }, []);

  const initializeGame = () => {
    const newGrid = [...tileData].sort(() => Math.random() - 0.5).map((tile, idx) => ({
      ...tile,
      gridId: idx,
      removed: false
    }));
    setGrid(newGrid);
    setSelectedTiles([]);
    setScore(0);
    setGameOver(false);
  };

  const handleTileClick = (tile) => {
    if (tile.removed || selectedTiles.find(t => t.gridId === tile.gridId)) return;

    const newSelected = [...selectedTiles, tile];
    setSelectedTiles(newSelected);

    if (newSelected.length === 3) {
      setTimeout(() => checkMatch(newSelected), 500);
    }
  };

  const checkMatch = (tiles) => {
    const values = tiles.map(t => {
      if (t.type === 'number') {
        return eval(t.value);
      }
      return t.value;
    });

    if (values[0] === values[1] && values[1] === values[2]) {
      setGrid(grid.map(tile => 
        tiles.find(t => t.gridId === tile.gridId) 
          ? { ...tile, removed: true }
          : tile
      ));
      setScore(score + 30);
      setSelectedTiles([]);

      const remaining = grid.filter(t => !tiles.find(sel => sel.gridId === t.gridId) && !t.removed);
      if (remaining.length === 0) {
        setGameOver(true);
      }
    } else {
      setSelectedTiles([]);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 to-purple-100">
      <AppHeader showBack={true} backTo="/dashboard" />
      
      <div className="max-w-2xl mx-auto px-4 py-8 pb-24 pt-20">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-black text-gray-800">🎨 Padankan 3 Sama</h1>
          <div className="text-2xl font-black text-pink-600">{score} ⭐</div>
        </div>

        {!gameOver ? (
          <div className="bg-white rounded-3xl p-8 shadow-xl">
            <p className="text-sm font-bold text-gray-600 mb-6 text-center">Pilih 3 petak dengan nilai sama:</p>
            <div className="grid grid-cols-3 gap-4 mb-6">
              {grid.map((tile) => (
                <motion.button
                  key={tile.gridId}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleTileClick(tile)}
                  className={`aspect-square rounded-2xl font-black text-xl transition-all ${
                    tile.removed
                      ? 'invisible'
                      : selectedTiles.find(t => t.gridId === tile.gridId)
                      ? 'bg-pink-500 text-white shadow-lg'
                      : 'bg-gradient-to-br from-pink-300 to-purple-300 text-gray-800 hover:shadow-lg'
                  }`}
                >
                  {!tile.removed && tile.value}
                </motion.button>
              ))}
            </div>

            {selectedTiles.length > 0 && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={() => setSelectedTiles([])}
                className="w-full py-2 bg-gray-200 text-gray-800 rounded-xl font-black"
              >
                Batal Pilihan
              </motion.button>
            )}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-8 text-center shadow-xl"
          >
            <p className="text-5xl mb-3">🎉</p>
            <h2 className="text-2xl font-black text-gray-800 mb-4">Luar Biasa!</h2>
            <p className="text-gray-600 mb-6">Anda telah menyelesaikan semua padanan!</p>
            <p className="text-3xl font-black text-pink-600 mb-6">Skor: {score} ⭐</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={initializeGame}
              className="px-6 py-3 bg-pink-600 text-white rounded-full font-black"
            >
              Ulang
            </motion.button>
          </motion.div>
        )}
      </div>
    </div>
  );
}