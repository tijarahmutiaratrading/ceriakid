import React, { useRef, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ArcadeShell from '@/components/arcade/ArcadeShell';
import ArcadeGameOver from '@/components/arcade/ArcadeGameOver';
import { randomToken, getBest, saveBest } from '@/components/arcade/arcadeValues';
import { sfx } from '@/components/arcade/engine';
import { ARCADE_ART } from '@/components/arcade/arcadeArt';

const GAME_TIME = 45;

export default function WhackGame() {
  const [holes, setHoles] = useState(Array(9).fill(null));
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_TIME);
  const [combo, setCombo] = useState(0);
  const [tokens, setTokens] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [best, setBest] = useState(() => getBest('whack'));
  const [started, setStarted] = useState(false);
  const [pop, setPop] = useState(null); // feedback {idx, text, color}
  const scoreRef = useRef(0);
  const tokensRef = useRef([]);

  const startGame = useCallback(() => {
    setHoles(Array(9).fill(null));
    setScore(0); scoreRef.current = 0;
    setTimeLeft(GAME_TIME); setCombo(0);
    setTokens([]); tokensRef.current = [];
    setGameOver(false); setStarted(true);
  }, []);

  // Timer
  useEffect(() => {
    if (!started || gameOver) return;
    const t = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setBest(saveBest('whack', scoreRef.current));
          setGameOver(true);
          sfx.die();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [started, gameOver]);

  // Spawn moles
  useEffect(() => {
    if (!started || gameOver) return;
    const elapsed = GAME_TIME - timeLeft;
    const spawnRate = Math.max(450, 850 - elapsed * 10);
    const t = setInterval(() => {
      setHoles((prev) => {
        const empty = prev.map((h, i) => (h === null ? i : -1)).filter((i) => i >= 0);
        if (empty.length === 0) return prev;
        const idx = empty[Math.floor(Math.random() * empty.length)];
        const r = Math.random();
        const mole = r < 0.62 ? { kind: 'good', emoji: ['🐹', '🐭', '🐿️'][Math.floor(Math.random() * 3)] }
          : r < 0.85 ? { kind: 'bad', emoji: '💣' }
          : { kind: 'token', token: randomToken() };
        const next = [...prev];
        next[idx] = { ...mole, id: Date.now() + idx };
        // Auto hide
        setTimeout(() => {
          setHoles((cur) => {
            if (cur[idx]?.id === next[idx].id) {
              const c2 = [...cur];
              c2[idx] = null;
              if (next[idx].kind === 'good') setCombo(0); // terlepas
              return c2;
            }
            return cur;
          });
        }, Math.max(650, 1300 - elapsed * 12));
        return next;
      });
    }, spawnRate);
    return () => clearInterval(t);
  }, [started, gameOver, timeLeft]);

  const whack = (idx) => {
    const mole = holes[idx];
    if (!mole || gameOver) return;
    setHoles((prev) => { const next = [...prev]; next[idx] = null; return next; });

    if (mole.kind === 'good') {
      setCombo((c) => {
        const nc = c + 1;
        const mult = 1 + Math.floor(nc / 5);
        const pts = 10 * mult;
        scoreRef.current += pts;
        setScore(scoreRef.current);
        setPop({ idx, text: `+${pts}`, color: 'text-green-600' });
        if (nc % 5 === 0) sfx.combo(mult); else sfx.coin();
        return nc;
      });
    } else if (mole.kind === 'bad') {
      scoreRef.current = Math.max(0, scoreRef.current - 20);
      setScore(scoreRef.current);
      setCombo(0);
      setPop({ idx, text: '-20 💥', color: 'text-red-600' });
      sfx.hit();
      if (navigator.vibrate) navigator.vibrate(100);
    } else {
      tokensRef.current = [...tokensRef.current, mole.token];
      setTokens(tokensRef.current);
      scoreRef.current += 30;
      setScore(scoreRef.current);
      setPop({ idx, text: `${mole.token.emoji} ${mole.token.name}!`, color: 'text-purple-600' });
      sfx.token();
    }
    setTimeout(() => setPop(null), 600);
  };

  return (
    <ArcadeShell title="Ketuk Ceria" emoji="🔨" score={score} tokenCount={tokens.length}>
      <div
        className="absolute inset-0 flex flex-col items-center justify-center p-4 bg-cover bg-center"
        style={{ backgroundImage: `url(${ARCADE_ART.whack})` }}
      >
        {started && !gameOver && (
          <div className="flex items-center gap-3 mb-5">
            <div className={`rounded-full px-4 py-1.5 font-black text-sm shadow ${timeLeft <= 10 ? 'bg-red-500 text-white animate-pulse' : 'bg-white text-slate-800'}`}>
              ⏱️ {timeLeft}s
            </div>
            {combo > 2 && (
              <div className="rounded-full bg-amber-400 px-4 py-1.5 font-black text-sm text-slate-900 shadow">
                🔥 Combo {combo} (x{1 + Math.floor(combo / 5)})
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-3 gap-3 sm:gap-4 w-full max-w-sm">
          {holes.map((mole, idx) => (
            <button
              key={idx}
              onPointerDown={() => whack(idx)}
              className="relative aspect-square rounded-3xl bg-gradient-to-b from-amber-700 to-amber-900 shadow-inner overflow-hidden active:scale-95 transition-transform"
            >
              {/* Lubang */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-4/5 h-1/3 rounded-[50%] bg-amber-950/80" />
              <AnimatePresence>
                {mole && (
                  <motion.div
                    key={mole.id}
                    initial={{ y: 60, scale: 0.6 }}
                    animate={{ y: 0, scale: 1 }}
                    exit={{ y: 60, scale: 0.6 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 26 }}
                    className="absolute inset-0 flex items-center justify-center pointer-events-none"
                  >
                    <span className={`text-5xl drop-shadow-lg ${mole.kind === 'token' ? 'animate-pulse' : ''}`}>
                      {mole.kind === 'token' ? mole.token.emoji : mole.emoji}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
              {pop?.idx === idx && (
                <motion.span
                  initial={{ opacity: 1, y: 0 }}
                  animate={{ opacity: 0, y: -30 }}
                  className={`absolute top-1 left-1/2 -translate-x-1/2 font-black text-sm whitespace-nowrap ${pop.color} pointer-events-none z-10`}
                >
                  {pop.text}
                </motion.span>
              )}
            </button>
          ))}
        </div>

        <p className="mt-5 rounded-full bg-white/85 backdrop-blur px-4 py-2 text-emerald-900 font-black text-xs text-center shadow">
          🐹 Ketuk = +10 · 💣 JANGAN ketuk bom! · ⭐ Nilai murni = +30
        </p>

        {!started && !gameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/60 backdrop-blur-sm" onPointerDown={startGame}>
            <div className="text-6xl mb-3 animate-bounce">🔨</div>
            <p className="text-white font-black text-2xl mb-2">Ketuk Ceria</p>
            <div className="text-white/80 font-bold text-xs text-center px-6 space-y-1">
              <p>🐹 Ketuk tikus secepat mungkin — 45 saat!</p>
              <p>💣 Jangan ketuk bom (-20)</p>
              <p>🔥 Ketuk berturut = COMBO multiplier!</p>
            </div>
            <div className="mt-5 px-6 py-3 rounded-full bg-amber-300 text-slate-900 font-black animate-pulse">Tap untuk Mula!</div>
          </div>
        )}
      </div>
      {gameOver && <ArcadeGameOver score={score} best={best} tokens={tokens} onRestart={startGame} />}
    </ArcadeShell>
  );
}