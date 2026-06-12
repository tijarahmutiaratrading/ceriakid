import React, { useRef, useState, useEffect, useCallback } from 'react';
import ArcadeShell from '@/components/arcade/ArcadeShell';
import ArcadeGameOver from '@/components/arcade/ArcadeGameOver';
import { randomToken, getBest, saveBest } from '@/components/arcade/arcadeValues';

const W = 400, H = 600;
const GRAVITY = 0.45;
const FLAP_V = -8;
const GAP = 175;
const PIPE_W = 64;

export default function FlappyGame() {
  const canvasRef = useRef(null);
  const stateRef = useRef(null);
  const rafRef = useRef(null);
  const [score, setScore] = useState(0);
  const [tokenCount, setTokenCount] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [best, setBest] = useState(() => getBest('flappy'));
  const [started, setStarted] = useState(false);

  const initState = () => ({
    birdY: H / 2,
    vy: 0,
    pipes: [],
    tokens: [],
    collected: [],
    score: 0,
    nextPipe: 0,
    frame: 0,
    dead: false,
  });

  const startGame = useCallback(() => {
    stateRef.current = initState();
    setScore(0);
    setTokenCount(0);
    setGameOver(false);
    setStarted(true);
  }, []);

  const flap = useCallback(() => {
    const s = stateRef.current;
    if (!s || s.dead) return;
    if (!started) { startGame(); }
    if (stateRef.current) stateRef.current.vy = FLAP_V;
  }, [started, startGame]);

  useEffect(() => {
    const onKey = (e) => { if (e.code === 'Space' || e.code === 'ArrowUp') { e.preventDefault(); flap(); } };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [flap]);

  useEffect(() => {
    stateRef.current = initState();
    const ctx = canvasRef.current.getContext('2d');

    const drawPipe = (x, topH) => {
      // Pokok-style pipes
      ctx.fillStyle = '#16a34a';
      ctx.fillRect(x, 0, PIPE_W, topH);
      ctx.fillRect(x, topH + GAP, PIPE_W, H - topH - GAP);
      ctx.fillStyle = '#15803d';
      ctx.fillRect(x - 5, topH - 22, PIPE_W + 10, 22);
      ctx.fillRect(x - 5, topH + GAP, PIPE_W + 10, 22);
    };

    const loop = () => {
      const s = stateRef.current;
      ctx.clearRect(0, 0, W, H);

      // Sky
      const grad = ctx.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, '#bae6fd');
      grad.addColorStop(1, '#e0f2fe');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);
      ctx.font = '34px serif';
      ctx.fillText('☁️', 60 - (s.frame * 0.3) % 500, 100);
      ctx.fillText('☁️', 480 - (s.frame * 0.3) % 500, 200);

      if (started && !s.dead) {
        s.frame++;
        const speed = Math.min(4.5, 2.8 + s.score / 25);

        // Physics
        s.vy += GRAVITY;
        s.birdY += s.vy;
        if (s.birdY > H - 20 || s.birdY < 0) s.dead = true;

        // Spawn pipes
        s.nextPipe--;
        if (s.nextPipe <= 0) {
          const topH = 70 + Math.random() * (H - GAP - 200);
          s.pipes.push({ x: W, topH, passed: false });
          // 40% chance token tengah gap
          if (Math.random() < 0.4) {
            s.tokens.push({ x: W + PIPE_W / 2, y: topH + GAP / 2, token: randomToken() });
          }
          s.nextPipe = 105;
        }

        // Move pipes + collide
        s.pipes = s.pipes.filter((p) => {
          p.x -= speed;
          const birdX = 90;
          if (p.x < birdX + 18 && p.x + PIPE_W > birdX - 18) {
            if (s.birdY - 16 < p.topH || s.birdY + 16 > p.topH + GAP) s.dead = true;
          }
          if (!p.passed && p.x + PIPE_W < birdX) {
            p.passed = true;
            s.score++;
            setScore(s.score);
          }
          return p.x > -PIPE_W - 20;
        });

        // Tokens
        s.tokens = s.tokens.filter((t) => {
          t.x -= speed;
          if (Math.abs(t.x - 90) < 30 && Math.abs(t.y - s.birdY) < 35) {
            s.collected.push(t.token);
            s.score += 3;
            setScore(s.score);
            setTokenCount(s.collected.length);
            return false;
          }
          return t.x > -30;
        });
      }

      // Pipes
      s.pipes.forEach((p) => drawPipe(p.x, p.topH));

      // Tokens
      ctx.font = '28px serif';
      ctx.textAlign = 'center';
      s.tokens.forEach((t) => ctx.fillText(t.token.emoji, t.x, t.y + 10));

      // Bird (tilt ikut velocity)
      ctx.save();
      ctx.translate(90, s.birdY);
      ctx.rotate(Math.max(-0.5, Math.min(0.7, s.vy * 0.06)));
      ctx.font = '40px serif';
      ctx.fillText('🐦', 0, 12);
      ctx.restore();

      if (s.dead && !gameOver) {
        setBest(saveBest('flappy', s.score));
        setGameOver(true);
      }

      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [started, gameOver]);

  return (
    <ArcadeShell title="Burung Ceria" emoji="🐦" score={score} tokenCount={tokenCount}>
      <div className="absolute inset-0 flex items-center justify-center" onPointerDown={flap}>
        <canvas ref={canvasRef} width={W} height={H} className="h-full w-auto max-w-full" />
        {!started && !gameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/60 backdrop-blur-sm pointer-events-none">
            <div className="text-6xl mb-3 animate-bounce">🐦</div>
            <p className="text-white font-black text-2xl mb-2">Burung Ceria</p>
            <p className="text-white/70 font-bold text-sm text-center px-8">Tap untuk terbang!<br />Lalu celah pokok & kutip nilai murni ⭐</p>
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