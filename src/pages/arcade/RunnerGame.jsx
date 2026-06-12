import React, { useRef, useState, useEffect, useCallback } from 'react';
import ArcadeShell from '@/components/arcade/ArcadeShell';
import ArcadeGameOver from '@/components/arcade/ArcadeGameOver';
import { randomToken, getBest, saveBest } from '@/components/arcade/arcadeValues';

const W = 400, H = 600;
const GROUND_Y = 480;
const GRAVITY = 0.9;
const JUMP_V = -17;
const OBSTACLES = ['🪨', '🌵', '🪵', '🦔'];

export default function RunnerGame() {
  const canvasRef = useRef(null);
  const stateRef = useRef(null);
  const rafRef = useRef(null);
  const [score, setScore] = useState(0);
  const [tokenCount, setTokenCount] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [best, setBest] = useState(() => getBest('runner'));
  const [started, setStarted] = useState(false);

  const initState = () => ({
    playerY: GROUND_Y,
    vy: 0,
    jumping: false,
    canDouble: false,
    speed: 6,
    distance: 0,
    obstacles: [],
    tokens: [],
    collected: [],
    clouds: [{ x: 80, y: 90 }, { x: 250, y: 150 }, { x: 360, y: 60 }],
    nextObstacle: 60,
    nextToken: 140,
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

  const jump = useCallback(() => {
    const s = stateRef.current;
    if (!s || s.dead) return;
    if (!started) { startGame(); return; }
    if (!s.jumping) {
      s.vy = JUMP_V; s.jumping = true; s.canDouble = true;
    } else if (s.canDouble) {
      s.vy = JUMP_V * 0.85; s.canDouble = false;
    }
  }, [started, startGame]);

  // Controls
  useEffect(() => {
    const onKey = (e) => { if (e.code === 'Space' || e.code === 'ArrowUp') { e.preventDefault(); jump(); } };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [jump]);

  // Game loop
  useEffect(() => {
    stateRef.current = initState();
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const loop = () => {
      const s = stateRef.current;
      ctx.clearRect(0, 0, W, H);

      // Sky
      const grad = ctx.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, '#7dd3fc');
      grad.addColorStop(0.7, '#fef3c7');
      grad.addColorStop(1, '#86efac');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);

      // Clouds
      ctx.font = '40px serif';
      s.clouds.forEach((c) => {
        ctx.fillText('☁️', c.x, c.y);
        if (started && !s.dead) { c.x -= 0.5; if (c.x < -50) c.x = W + 30; }
      });

      // Ground
      ctx.fillStyle = '#65a30d';
      ctx.fillRect(0, GROUND_Y + 38, W, H - GROUND_Y);
      ctx.fillStyle = '#84cc16';
      ctx.fillRect(0, GROUND_Y + 38, W, 8);

      if (started && !s.dead) {
        s.frame++;
        s.distance += s.speed * 0.1;
        s.speed = Math.min(13, 6 + s.distance / 200);

        // Physics
        s.vy += GRAVITY;
        s.playerY += s.vy;
        if (s.playerY >= GROUND_Y) { s.playerY = GROUND_Y; s.vy = 0; s.jumping = false; }

        // Spawn obstacles
        s.nextObstacle--;
        if (s.nextObstacle <= 0) {
          s.obstacles.push({ x: W + 30, emoji: OBSTACLES[Math.floor(Math.random() * OBSTACLES.length)] });
          s.nextObstacle = 70 + Math.random() * 80 - Math.min(40, s.distance / 30);
        }
        // Spawn tokens
        s.nextToken--;
        if (s.nextToken <= 0) {
          s.tokens.push({ x: W + 30, y: GROUND_Y - 60 - Math.random() * 120, token: randomToken() });
          s.nextToken = 160 + Math.random() * 120;
        }

        // Move + collide obstacles
        s.obstacles = s.obstacles.filter((o) => {
          o.x -= s.speed;
          if (Math.abs(o.x - 70) < 28 && s.playerY > GROUND_Y - 42) s.dead = true;
          return o.x > -40;
        });
        // Move + collect tokens
        s.tokens = s.tokens.filter((t) => {
          t.x -= s.speed;
          if (Math.abs(t.x - 70) < 32 && Math.abs(t.y - s.playerY) < 45) {
            s.collected.push(t.token);
            s.distance += 50;
            setTokenCount(s.collected.length);
            return false;
          }
          return t.x > -40;
        });

        setScore(Math.floor(s.distance));
      }

      // Tokens
      ctx.font = '30px serif';
      ctx.textAlign = 'center';
      s.tokens.forEach((t) => ctx.fillText(t.token.emoji, t.x, t.y));

      // Obstacles
      ctx.font = '38px serif';
      s.obstacles.forEach((o) => ctx.fillText(o.emoji, o.x, GROUND_Y + 32));

      // Player (run bounce animation)
      const bounce = !s.jumping && started && !s.dead ? Math.sin(s.frame * 0.4) * 3 : 0;
      ctx.font = '44px serif';
      ctx.save();
      ctx.translate(70, s.playerY + 30 + bounce);
      ctx.scale(-1, 1);
      ctx.fillText('🦊', 0, 0);
      ctx.restore();

      if (s.dead && !gameOver) {
        const finalScore = Math.floor(s.distance);
        setBest(saveBest('runner', finalScore));
        setGameOver(true);
      }

      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [started, gameOver]);

  return (
    <ArcadeShell title="Lari Si Comel" emoji="🏃" score={score} tokenCount={tokenCount}>
      <div className="absolute inset-0 flex items-center justify-center" onPointerDown={jump}>
        <canvas ref={canvasRef} width={W} height={H} className="h-full w-auto max-w-full rounded-none" />
        {!started && !gameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/60 backdrop-blur-sm pointer-events-none">
            <div className="text-6xl mb-3 animate-bounce">🦊</div>
            <p className="text-white font-black text-2xl mb-2">Lari Si Comel</p>
            <p className="text-white/70 font-bold text-sm text-center px-8">Tap untuk lompat (tap 2x = lompat tinggi!)<br />Elak halangan & kutip nilai murni ⭐</p>
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