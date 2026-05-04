import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, Star } from 'lucide-react';
import AppHeader from '@/components/AppHeader';

const glassCard = { background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.4)' };

// Safe math evaluation — no eval()
const calcValue = (expr) => {
  if (!expr.includes('+') && !expr.includes('-') && !expr.includes('×')) return parseInt(expr);
  if (expr.includes('+')) { const [a, b] = expr.split('+'); return parseInt(a) + parseInt(b); }
  if (expr.includes('-')) { const [a, b] = expr.split('-'); return parseInt(a) - parseInt(b); }
  if (expr.includes('×')) { const [a, b] = expr.split('×'); return parseInt(a) * parseInt(b); }
  return parseInt(expr);
};

const ALL_ROUNDS = [
  [{ id:1,value:'3' },{ id:2,value:'1+2' },{ id:3,value:'2' },{ id:4,value:'1+1' },{ id:5,value:'1' },{ id:6,value:'0+1' }],
  [{ id:1,value:'4' },{ id:2,value:'2+2' },{ id:3,value:'5' },{ id:4,value:'3+2' },{ id:5,value:'6' },{ id:6,value:'3+3' }],
  [{ id:1,value:'7' },{ id:2,value:'4+3' },{ id:3,value:'8' },{ id:4,value:'5+3' },{ id:5,value:'9' },{ id:6,value:'4+5' }],
  [{ id:1,value:'10' },{ id:2,value:'5+5' },{ id:3,value:'12' },{ id:4,value:'6+6' },{ id:5,value:'15' },{ id:6,value:'8+7' }],
  [{ id:1,value:'20' },{ id:2,value:'10+10' },{ id:3,value:'25' },{ id:4,value:'20+5' },{ id:5,value:'30' },{ id:6,value:'15+15' }],
  [{ id:1,value:'11' },{ id:2,value:'6+5' },{ id:3,value:'13' },{ id:4,value:'7+6' },{ id:5,value:'14' },{ id:6,value:'7+7' }],
  [{ id:1,value:'16' },{ id:2,value:'8+8' },{ id:3,value:'18' },{ id:4,value:'9+9' },{ id:5,value:'17' },{ id:6,value:'9+8' }],
  [{ id:1,value:'40' },{ id:2,value:'20+20' },{ id:3,value:'50' },{ id:4,value:'25+25' },{ id:5,value:'45' },{ id:6,value:'40+5' }],
];

function getRandomRounds() {
  return [...ALL_ROUNDS].sort(() => Math.random() - 0.5).slice(0, 5);
}

const ROUNDS = getRandomRounds();

export default function TileMatchGame() {
  const [round, setRound] = useState(0);
  const [grid, setGrid] = useState([]);
  const [selectedTiles, setSelectedTiles] = useState([]);
  const [score, setScore] = useState(0);
  const [roundOver, setRoundOver] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [flashResult, setFlashResult] = useState(null); // 'correct' | 'wrong'

  useEffect(() => { initRound(round); }, [round]);

  const initRound = (r) => {
    const newGrid = [...ROUNDS[r]].sort(() => Math.random() - 0.5).map((tile, idx) => ({ ...tile, gridId: idx, removed: false }));
    setGrid(newGrid);
    setSelectedTiles([]);
    setRoundOver(false);
    setFlashResult(null);
  };

  const handleTileClick = (tile) => {
    if (tile.removed || selectedTiles.find(t => t.gridId === tile.gridId)) return;
    if (selectedTiles.length >= 3) return;
    const newSelected = [...selectedTiles, tile];
    setSelectedTiles(newSelected);
    if (newSelected.length === 3) {
      setTimeout(() => checkMatch(newSelected), 400);
    }
  };

  const checkMatch = (tiles) => {
    // Use safe calcValue — no eval
    const values = tiles.map(t => calcValue(t.value));
    const allSame = values[0] === values[1] && values[1] === values[2];
    if (allSame) {
      setFlashResult('correct');
      const newGrid = grid.map(tile =>
        tiles.find(t => t.gridId === tile.gridId) ? { ...tile, removed: true } : tile
      );
      setGrid(newGrid);
      setScore(s => s + 30);
      setSelectedTiles([]);
      if (newGrid.filter(t => !t.removed).length === 0) {
        setTimeout(() => setRoundOver(true), 500);
      }
    } else {
      setFlashResult('wrong');
      setTimeout(() => setSelectedTiles([]), 500);
    }
    setTimeout(() => setFlashResult(null), 600);
  };

  const nextRound = () => {
    if (round + 1 >= ROUNDS.length) { setGameOver(true); } else { setRound(r => r + 1); }
  };

  const remaining = grid.filter(t => !t.removed).length;
  const stars = remaining === 0 ? 3 : remaining <= 2 ? 2 : 1;

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #667eea 0%, #f093fb 50%, #f5a623 100%)' }}>
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" />
      </div>
      <AppHeader showBack={true} backTo="/games-hub" />
      <div className="relative max-w-lg mx-auto px-4 pb-32 pt-8">

        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          className="mb-5 p-5 rounded-3xl flex items-center justify-between" style={glassCard}>
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-white/30 flex items-center justify-center text-3xl shadow-inner">🎨</div>
            <div>
              <h1 className="text-xl font-black text-white">Padankan 3 Sama</h1>
              <p className="text-white/70 text-xs">Pusingan {round + 1} / {ROUNDS.length}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xl font-black text-white">{score} ⭐</span>
            <motion.button whileTap={{ scale: 0.9 }} onClick={() => initRound(round)}
              className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center border border-white/30">
              <RotateCcw className="w-4 h-4 text-white" />
            </motion.button>
          </div>
        </motion.div>

        <div className="flex gap-2 mb-4">
          {ROUNDS.map((_, i) => (
            <div key={i} className={`flex-1 h-2 rounded-full transition-all ${i < round ? 'bg-white' : i === round ? 'bg-white/70' : 'bg-white/20'}`} />
          ))}
        </div>

        {/* Flash feedback */}
        <AnimatePresence>
          {flashResult && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 text-7xl pointer-events-none">
              {flashResult === 'correct' ? '✅' : '❌'}
            </motion.div>
          )}
        </AnimatePresence>

        {gameOver ? (
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
            className="rounded-3xl p-8 text-center" style={glassCard}>
            <p className="text-5xl mb-3">🏆</p>
            <h2 className="text-2xl font-black text-white mb-4">Tahniah! Semua Pusingan!</h2>
            <p className="text-yellow-300 text-3xl font-black mb-6">Skor: {score} ⭐</p>
            <motion.button whileTap={{ scale: 0.95 }} onClick={() => { const nr=getRandomRounds(); ROUNDS.length=0; nr.forEach(r=>ROUNDS.push(r)); setRound(0); setScore(0); setGameOver(false); }}
              className="px-6 py-3 bg-white text-purple-600 rounded-full font-black">Mula Semula</motion.button>
          </motion.div>
        ) : !roundOver ? (
          <div className="rounded-3xl p-6" style={glassCard}>
            <p className="text-white/70 text-xs font-bold text-center mb-2">Pilih 3 petak dengan nilai yang sama:</p>
            <p className="text-white/50 text-xs text-center mb-5">
              Dipilih: {selectedTiles.length}/3 {selectedTiles.length > 0 && `(${selectedTiles.map(t => calcValue(t.value)).join(', ')})`}
            </p>
            <div className="grid grid-cols-3 gap-4 mb-5">
              {grid.map((tile) => {
                const isSelected = !!selectedTiles.find(t => t.gridId === tile.gridId);
                return (
                  <motion.button
                    key={tile.gridId}
                    whileTap={{ scale: 0.92 }}
                    onClick={() => handleTileClick(tile)}
                    animate={isSelected ? { scale: 1.08 } : { scale: 1 }}
                    className={`aspect-square rounded-2xl font-black text-xl transition-all ${tile.removed ? 'invisible' : ''}`}
                    style={tile.removed ? {} : isSelected
                      ? { background: 'rgba(255,255,255,0.95)', color: '#7c3aed', boxShadow: '0 0 0 3px white' }
                      : { background: 'rgba(255,255,255,0.25)', border: '1px solid rgba(255,255,255,0.4)', color: 'white' }}>
                    {!tile.removed && tile.value}
                  </motion.button>
                );
              })}
            </div>
            {selectedTiles.length > 0 && (
              <motion.button whileHover={{ scale: 1.05 }} onClick={() => setSelectedTiles([])}
                className="w-full py-2 rounded-xl font-black text-white text-sm"
                style={{ background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.35)' }}>
                Batal Pilihan
              </motion.button>
            )}
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