import React, { useRef, useState, useEffect, useCallback } from 'react';
import ArcadeShell from '@/components/arcade/ArcadeShell';
import ArcadeGameOver from '@/components/arcade/ArcadeGameOver';
import { randomToken, getBest, saveBest } from '@/components/arcade/arcadeValues';

const W = 400, H = 600;
const GOOD = ['🍎', '🍌', '📚', '🥛', '🍊', '✏️'];
const BAD = ['🗑️', '🧨', '🦴', '👟'];

export default function CatchGame() {
  const canvasRef = useRef(null);
  const stateRef = useRef(null);
  const rafRef = useRef(null);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [tokenCount, setTokenCount] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [best, setBest] = useState(() => getBest('catch'));
  const [started, setStarted] = useState(false);

  const initState = () => ({
    basketX: W / 2,
    targetX: W / 2,
    items: [],
    collected: [],
    score: 0,
    lives: 3,
    nextItem: 40,
    speed: 2.5,
    frame: 0,
    dead: false,
    pops: [],
  });

  const startGame = useCallback(() => {
    stateRef.current = initState();
    setScore(0);
    setLives(3);
    setTokenCount(0);
    setGameOver(false);
    setStarted(true);
  }, []);

  // Pointer / keyboard control
  const moveTo = useCallback((clientX) => {
    const canvas = canvasRef.current;
    if (!canvas || !stateRef.current) return;
    const rect = canvas.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * W;
    stateRef.current.targetX = Math.max(40, Math.min(W - 40, x));
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      const s = stateRef.current;
      if (!s) return;
      if (e.code === 'ArrowLeft') s.targetX = Math.max(40, s.targetX - 55);
      if (e.code === 'ArrowRight') s.targetX = Math.min(W - 40, s.targetX + 55);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Game loop
  useEffect(() => {
    stateRef.current = initState();
    const ctx = canvasRef.current.getContext('2d');

    const loop = () => {
      const s = stateRef.current;
      ctx.clearRect(0, 0, W, H);

      // Background
      const grad = ctx.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, '#fbcfe8');
      grad.addColorStop(1, '#fef9c3');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);
      ctx.font = '28px serif';
      ctx.fillText('🌈', 30, 60);
      ctx.fillText('☀️', 340, 50);

      if (started && !s.dead) {
        s.frame++;
        s.speed = Math.min(7, 2.5 + s.score / 120);

        // Smooth basket follow
        s.basketX += (s.targetX - s.basketX) * 0.25;

        // Spawn items
        s.nextItem--;
        if (s.nextItem <= 0) {
          const r = Math.random();
          let item;
          if (r < 0.15) item = { kind: 'token', token: randomToken() };
          else if (r < 0.7) item = { kind: 'good', emoji: GOOD[Math.floor(Math.random() * GOOD.length)] };
          else item = { kind: 'bad', emoji: BAD[Math.floor(Math.random() * BAD.length)] };
          s.items.push({ ...item, x: 40 + Math.random() * (W - 80), y: -20, wobble: Math.random() * Math.PI * 2 });
          s.nextItem = Math.max(18, 45 - s.score / 15);
        }

        // Move + catch items
        s.items = s.items.filter((it) => {
          it.y += s.speed + (it.kind === 'bad' ? 1 : 0);
          it.x += Math.sin(it.wobble + s.frame * 0.05) * 0.8;

          // Catch zone
          if (it.y > 510 && it.y < 560 && Math.abs(it.x - s.basketX) < 48) {
            if (it.kind === 'bad') {
              s.lives--;
              setLives(s.lives);
              s.pops.push({ x: it.x, y: 520, text: '💥', t: 30 });
              if (s.lives <= 0) s.dead = true;
            } else if (it.kind === 'token') {
              s.collected.push(it.token);
              s.score += 25;
              setTokenCount(s.collected.length);
              s.pops.push({ x: it.x, y: 520, text: `+25 ${it.token.emoji}`, t: 35 });
            } else {
              s.score += 10;
              s.pops.push({ x: it.x, y: 520, text: '+10', t: 25 });
            }
            setScore(s.score);
            return false;
          }
          // Missed good item — tiada penalti, cuma hilang
          return it.y < H + 30;
        });
      }

      // Items
      ctx.textAlign = 'center';
      s.items.forEach((it) => {
        ctx.font = it.kind === 'token' ? '32px serif' : '34px serif';
        ctx.fillText(it.kind === 'token' ? it.token.emoji : it.emoji, it.x, it.y);
      });

      // Pops (feedback text)
      s.pops = s.pops.filter((p) => {
        p.t--; p.y -= 1.5;
        ctx.font = 'bold 20px Nunito, sans-serif';
        ctx.fillStyle = `rgba(124, 58, 237, ${p.t / 30})`;
        ctx.fillText(p.text, p.x, p.y);
        return p.t > 0;
      });

      // Basket
      ctx.font = '56px serif';
      ctx.fillText('🧺', s.basketX, 560);

      if (s.dead && !gameOver) {
        setBest(saveBest('catch', s.score));
        setGameOver(true);
      }

      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [started, gameOver]);

  return (
    <ArcadeShell title="Tangkap Ceria" emoji="🧺" score={score} lives={lives} tokenCount={tokenCount}>
      <div
        className="absolute inset-0 flex items-center justify-center"
        onPointerDown={(e) => { if (!started) startGame(); moveTo(e.clientX); }}
        onPointerMove={(e) => moveTo(e.clientX)}
      >
        <canvas ref={canvasRef} width={W} height={H} className="h-full w-auto max-w-full" />
        {!started && !gameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/60 backdrop-blur-sm pointer-events-none">
            <div className="text-6xl mb-3 animate-bounce">🧺</div>
            <p className="text-white font-black text-2xl mb-2">Tangkap Ceria</p>
            <p className="text-white/70 font-bold text-sm text-center px-8">Gerakkan bakul untuk tangkap benda baik 🍎📚<br />Elak benda buruk 🗑️ — 3 nyawa sahaja!</p>
            <div className="mt-5 px-6 py-3 rounded-full bg-amber-300 text-slate-900 font-black animate-pulse">Tap untuk Mula!</div>
          </div>
        )}
      </div>
      {gameOver && (
        <ArcadeGameOver score={score} best={best} tokens={stateRef.current?.collected || []} onRestart={startGame} />
      )}
    </ArcadeShell>
  );
}