import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, RotateCcw, Star } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import AppHeader from '@/components/AppHeader';
import MemoryCard from '@/components/games/MemoryCard';
import MemoryCandyDecor from '@/components/games/MemoryCandyDecor';

const glassCard = { background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.4)' };

const FALLBACK_ROUNDS = [
  [
    { id: 'a', label: '🐱', side: 'value', visualStyle: 'emoji' }, { id: 'a', label: '🐱', side: 'item', visualStyle: 'emoji' },
    { id: 'b', label: '🍎', side: 'value', visualStyle: 'emoji' }, { id: 'b', label: '🍎', side: 'item', visualStyle: 'emoji' },
    { id: 'c', label: '🚗', side: 'value', visualStyle: 'emoji' }, { id: 'c', label: '🚗', side: 'item', visualStyle: 'emoji' },
    { id: 'd', label: '⚽', side: 'value', visualStyle: 'emoji' }, { id: 'd', label: '⚽', side: 'item', visualStyle: 'emoji' },
  ],
  [
    { id: 'a', label: 'Ada 2 bintang', side: 'value', visualStyle: 'difference' }, { id: 'a', label: 'Ada 3 bintang', side: 'item', visualStyle: 'difference' },
    { id: 'b', label: 'Pokok kecil', side: 'value', visualStyle: 'difference' }, { id: 'b', label: 'Pokok besar', side: 'item', visualStyle: 'difference' },
    { id: 'c', label: 'Bola merah', side: 'value', visualStyle: 'difference' }, { id: 'c', label: 'Bola biru', side: 'item', visualStyle: 'difference' },
    { id: 'd', label: 'Rumah satu pintu', side: 'value', visualStyle: 'difference' }, { id: 'd', label: 'Rumah dua pintu', side: 'item', visualStyle: 'difference' },
  ],
  [
    { id: 'a', label: 'Bayang bulat', side: 'value', visualStyle: 'shadow' }, { id: 'a', label: 'Bola', side: 'item', visualStyle: 'shadow' },
    { id: 'b', label: 'Bayang panjang', side: 'value', visualStyle: 'shadow' }, { id: 'b', label: 'Pensil', side: 'item', visualStyle: 'shadow' },
    { id: 'c', label: 'Bayang kotak', side: 'value', visualStyle: 'shadow' }, { id: 'c', label: 'Buku', side: 'item', visualStyle: 'shadow' },
    { id: 'd', label: 'Bayang segi tiga', side: 'value', visualStyle: 'shadow' }, { id: 'd', label: 'Kon', side: 'item', visualStyle: 'shadow' },
  ],
];

function getRandomRounds() {
  return [...FALLBACK_ROUNDS].sort(() => Math.random() - 0.5);
}

function buildRoundsFromGame(game) {
  const pairs = game?.gameData?.pairs;
  if (!Array.isArray(pairs) || pairs.length === 0) return null;

  const style = game?.gameData?.visualStyle || (game?.order % 3 === 0 ? 'emoji' : game?.order % 3 === 1 ? 'difference' : 'shadow');
  const round = pairs.slice(0, 6).flatMap((pair, index) => {
    const left = Array.isArray(pair) ? pair[0] : pair?.left;
    const right = Array.isArray(pair) ? pair[1] : pair?.right;
    return [
      { id: String(index), label: String(left || ''), side: 'value', visualStyle: style },
      { id: String(index), label: String(right || ''), side: 'item', visualStyle: style },
    ];
  }).filter(card => card.label.trim());

  return round.length >= 4 ? [round] : null;
}

export default function MemoryGame() {
  const [rounds, setRounds] = useState(() => getRandomRounds());
  const [gameTitle, setGameTitle] = useState('Permainan Ingatan');
  const [round, setRound] = useState(0);
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState(new Set());
  const [moves, setMoves] = useState(0);
  const [score, setScore] = useState(0);
  const [roundOver, setRoundOver] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [feedback, setFeedback] = useState(null); // 'match' | 'nomatch'
  const isChecking = useRef(false);

  useEffect(() => {
    const loadSelectedGame = async () => {
      const gameId = new URLSearchParams(window.location.search).get('gameId');
      if (!gameId) return;
      const matches = await base44.entities.Game.filter({ id: gameId });
      const game = matches?.[0];
      const generatedRounds = buildRoundsFromGame(game);
      if (generatedRounds) {
        setGameTitle(game.title || 'Permainan Ingatan');
        setRounds(generatedRounds);
        initRound(0, generatedRounds);
      }
    };
    loadSelectedGame();
  }, []);

  useEffect(() => { initRound(round); }, [round, rounds]);

  const initRound = (r, sourceRounds = rounds) => {
    const data = sourceRounds[r] || sourceRounds[0] || [];
    const shuffled = [...data].sort(() => Math.random() - 0.5);
    setCards(shuffled.map((card, idx) => ({ ...card, index: idx })));
    setFlipped([]);
    setMatched(new Set());
    setMoves(0);
    setRoundOver(false);
    setFeedback(null);
    isChecking.current = false;
  };

  const toggleFlip = (index) => {
    if (isChecking.current) return;
    if (flipped.includes(index) || matched.has(index)) return;
    if (flipped.length >= 2) return;

    const newFlipped = [...flipped, index];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      isChecking.current = true;
      setMoves(m => m + 1);
      setTimeout(() => checkMatch(newFlipped), 700);
    }
  };

  const checkMatch = (flippedIndices) => {
    const [idx1, idx2] = flippedIndices;
    // Use functional updates to avoid stale closures
    setCards(prevCards => {
      const c1 = prevCards[idx1];
      const c2 = prevCards[idx2];
      if (c1.id === c2.id) {
        setFeedback('match');
        setScore(s => s + 10);
        setMatched(prev => {
          const next = new Set(prev);
          next.add(idx1);
          next.add(idx2);
          if (next.size === prevCards.length) {
            setTimeout(() => setRoundOver(true), 400);
          }
          return next;
        });
        setTimeout(() => setFeedback(null), 600);
      } else {
        setFeedback('nomatch');
        setTimeout(() => setFeedback(null), 600);
      }
      setFlipped([]);
      isChecking.current = false;
      return prevCards;
    });
  };

  const nextRound = () => {
    if (round + 1 >= rounds.length) { setGameOver(true); } else { setRound(r => r + 1); }
  };

  const restartGame = () => {
    const nextRounds = gameTitle === 'Permainan Ingatan' ? getRandomRounds() : rounds;
    setRounds(nextRounds);
    setRound(0);
    setScore(0);
    setGameOver(false);
    initRound(0, nextRounds);
  };

  const stars = Math.max(3 - Math.floor(moves / 5), 1);

  return (
    <div className="min-h-screen overflow-hidden" style={{ background: 'radial-gradient(circle at 20% 10%, #d946ef 0%, transparent 28%), linear-gradient(135deg, #5b008f 0%, #8a00c4 55%, #4a007a 100%)' }}>
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-4 rounded-[2rem] border-2 border-dashed border-white/70" />
        <div className="absolute top-28 right-10 text-white text-3xl animate-pulse">✦</div>
        <div className="absolute bottom-24 left-8 text-yellow-200 text-4xl animate-pulse">✧</div>
        <div className="absolute top-1/3 left-5 text-pink-200 text-2xl">✦</div>
      </div>
      <AppHeader showBack={true} backTo="/games-hub" />
      <MemoryCandyDecor />
      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 pb-32 pt-28 md:pt-32">
        <Link to="/mini-games/memory" className="inline-flex items-center gap-1.5 mb-3 px-3 py-2 rounded-full bg-white/80 text-game-purple font-black text-xs shadow-lg hover:bg-white transition-all sm:gap-2 sm:mb-4 sm:px-4 sm:py-2.5 sm:text-sm">
          <ArrowLeft className="w-4 h-4" /> Kembali ke mini games
        </Link>

        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          className="mb-5 p-4 sm:p-5 rounded-[2rem] flex items-center justify-between bg-white/10 border-2 border-dashed border-white/70 shadow-2xl">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center text-3xl shadow-inner flex-shrink-0">🧠</div>
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-black text-white line-clamp-2">{gameTitle}</h1>
              <p className="text-white/80 text-xs sm:text-sm font-bold truncate">Memory Game · Pusingan {round + 1}/{rounds.length}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-lg sm:text-xl font-black text-yellow-200">{score} ⭐</span>
            <motion.button whileTap={{ scale: 0.9 }} onClick={() => initRound(round)}
              className="w-11 h-11 rounded-2xl bg-white text-purple-700 flex items-center justify-center border-2 border-white shadow-lg">
              <RotateCcw className="w-5 h-5" />
            </motion.button>
          </div>
        </motion.div>

        {/* Round progress */}
        <div className="flex gap-2 mb-4">
          {rounds.map((_, i) => (
            <div key={i} className={`flex-1 h-2 rounded-full transition-all ${i < round ? 'bg-white' : i === round ? 'bg-white/70' : 'bg-white/20'}`} />
          ))}
        </div>

        <div className="grid grid-cols-3 gap-3 mb-4">
          {[{ label: 'Langkah', value: moves }, { label: 'Skor', value: score }, { label: 'Bintang', value: '⭐'.repeat(stars) }].map((s, i) => (
            <div key={i} className="rounded-2xl p-3 text-center" style={glassCard}>
              <p className="text-white/60 text-xs font-bold">{s.label}</p>
              <p className="text-xl font-black text-white">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Feedback flash */}
        <AnimatePresence>
          {feedback && (
            <motion.div
              initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
              className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 text-6xl pointer-events-none`}>
              {feedback === 'match' ? '✅' : '❌'}
            </motion.div>
          )}
        </AnimatePresence>

        {gameOver ? (
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
            className="rounded-3xl p-8 text-center" style={glassCard}>
            <p className="text-5xl mb-3">🏆</p>
            <h2 className="text-2xl font-black text-white mb-2">Tahniah! Semua Pusingan!</h2>
            <p className="text-yellow-300 text-3xl font-black mb-6">Skor: {score} ⭐</p>
            <motion.button whileTap={{ scale: 0.95 }} onClick={restartGame}
              className="px-6 py-3 bg-white text-purple-600 rounded-full font-black shadow-lg">Mula Semula</motion.button>
          </motion.div>
        ) : !roundOver ? (
          <div className="rounded-[2rem] p-3 sm:p-5 bg-purple-950/35 border-2 border-dashed border-white/70 shadow-2xl">
            <div className="grid grid-cols-4 gap-2.5 sm:gap-4">
            {cards.map((card, idx) => {
              const isFlipped = flipped.includes(idx) || matched.has(idx);
              return (
                <MemoryCard
                  key={idx}
                  card={card}
                  isFlipped={isFlipped}
                  isMatched={matched.has(idx)}
                  onClick={() => toggleFlip(idx)}
                />
              );
            })}
            </div>
          </div>
        ) : (
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
            className="rounded-3xl p-8 text-center" style={glassCard}>
            <p className="text-5xl mb-3">🎉</p>
            <h2 className="text-2xl font-black text-white mb-2">Pusingan {round + 1} Selesai!</h2>
            <p className="text-white/70 mb-3">Selesai dalam {moves} langkah</p>
            <div className="flex justify-center gap-1 mb-6">
              {[1, 2, 3].map(i => (
                <Star key={i} className={`w-8 h-8 ${i <= stars ? 'text-yellow-300 fill-yellow-300' : 'text-white/30'}`} />
              ))}
            </div>
            <motion.button whileTap={{ scale: 0.95 }} onClick={nextRound}
              className="px-6 py-3 bg-white text-purple-600 rounded-full font-black shadow-lg">
              {round + 1 >= rounds.length ? 'Tamat! Lihat Skor' : 'Pusingan Seterusnya →'}
            </motion.button>
          </motion.div>
        )}
      </div>
    </div>
  );
}