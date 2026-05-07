import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, RotateCcw, Star } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import AppHeader from '@/components/AppHeader';
import MemoryCard from '@/components/games/MemoryCard';

const glassCard = { background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.4)' };

const FALLBACK_ROUNDS = [
  [
    { id: 'a', label: 'RM1', side: 'value' }, { id: 'a', label: 'Pensil', side: 'item' },
    { id: 'b', label: 'RM2', side: 'value' }, { id: 'b', label: 'Pemadam', side: 'item' },
    { id: 'c', label: 'RM5', side: 'value' }, { id: 'c', label: 'Buku Nota', side: 'item' },
    { id: 'd', label: 'RM10', side: 'value' }, { id: 'd', label: 'Set Warna', side: 'item' },
  ],
  [
    { id: 'a', label: 'Kata Nama', side: 'value' }, { id: 'a', label: 'Meja', side: 'item' },
    { id: 'b', label: 'Kata Kerja', side: 'value' }, { id: 'b', label: 'Makan', side: 'item' },
    { id: 'c', label: 'Kata Adjektif', side: 'value' }, { id: 'c', label: 'Cantik', side: 'item' },
    { id: 'd', label: 'Kata Arah', side: 'value' }, { id: 'd', label: 'Atas', side: 'item' },
  ],
];

function getRandomRounds() {
  return [...FALLBACK_ROUNDS].sort(() => Math.random() - 0.5);
}

function buildRoundsFromGame(game) {
  const pairs = game?.gameData?.pairs;
  if (!Array.isArray(pairs) || pairs.length === 0) return null;

  const round = pairs.slice(0, 6).flatMap((pair, index) => {
    const left = Array.isArray(pair) ? pair[0] : pair?.left;
    const right = Array.isArray(pair) ? pair[1] : pair?.right;
    return [
      { id: String(index), label: String(left || ''), side: 'value' },
      { id: String(index), label: String(right || ''), side: 'item' },
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
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #667eea 0%, #f093fb 50%, #f5a623 100%)' }}>
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" />
        <div className="absolute top-1/3 -left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" style={{ animationDelay: '1s' }} />
      </div>
      <AppHeader showBack={true} backTo="/games-hub" />
      <div className="relative max-w-lg mx-auto px-4 pb-32 pt-28 md:pt-32">
        <Link to="/mini-games/memory" className="inline-flex items-center gap-1.5 mb-3 px-3 py-2 rounded-full bg-white/80 text-game-purple font-black text-xs shadow-lg hover:bg-white transition-all sm:gap-2 sm:mb-4 sm:px-4 sm:py-2.5 sm:text-sm">
          <ArrowLeft className="w-4 h-4" /> Kembali ke mini games
        </Link>

        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          className="mb-5 p-5 rounded-3xl flex items-center justify-between" style={glassCard}>
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-white/30 flex items-center justify-center text-3xl shadow-inner">🧠</div>
            <div>
              <h1 className="text-xl font-black text-white line-clamp-2">{gameTitle}</h1>
              <p className="text-white/70 text-xs">Pusingan {round + 1} / {rounds.length}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xl font-black text-white">{score} ⭐</span>
            <motion.button whileTap={{ scale: 0.9 }} onClick={() => initRound(round)}
              className="w-11 h-11 rounded-2xl bg-white/20 flex items-center justify-center border border-white/30">
              <RotateCcw className="w-5 h-5 text-white" />
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
          <div className="grid grid-cols-4 gap-3">
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