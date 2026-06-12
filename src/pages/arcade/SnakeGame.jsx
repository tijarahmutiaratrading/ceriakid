import React, { useRef, useState, useEffect, useCallback } from 'react';
import ArcadeShell from '@/components/arcade/ArcadeShell';
import ArcadeGameOver from '@/components/arcade/ArcadeGameOver';
import { randomToken, getBest, saveBest } from '@/components/arcade/arcadeValues';
import { sfx, Particles, Shaker, Pops } from '@/components/arcade/engine';

const W = 400, H = 600;
const CELL = 25;
const COLS = W / CELL; // 16
const ROWS = H / CELL; // 24
const FOODS = ['🍎', '🍌', '🍇', '🍊', '🍓'];

export default function SnakeGame() {
  const canvasRef = useRef(null);
  const stateRef = useRef(null);
  const rafRef = useRef(null);
  const touchStart = useRef(null);
  const [score, setScore] = useState(0);
  const [tokenCount, setTokenCount] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [best, setBest] = useState(() => getBest('snake'));
  const [started, setStarted] = useState(false);

  const randCell = (snake) => {
    let p;
    do {
      p = { x: Math.floor(Math.random() * COLS), y: 2 + Math.floor(Math.random() * (ROWS - 4)) };
    } while (snake.some((s) => s.x === p.x && s.y === p.y));
    return p;
  };

  const initState = () => {
    const snake = [{ x: 8, y: 12 }, { x: 7, y: 12 }, { x: 6, y: 12 }];
    return {
      snake, dir: { x: 1, y: 0 }, nextDir: { x: 1, y: 0 },
      food: { ...randCell(snake), emoji: FOODS[0], kind: 'food' },
      collected: [], score: 0, eaten: 0, frame: 0, tick: 0, speed: 9, dead: false,
      particles: new Particles(), shaker: new Shaker(), pops: new Pops(),
    };
  };

  const startGame = useCallback(() => {
    stateRef.current = initState();
    setScore(0); setTokenCount(0); setGameOver(false); setStarted(true);
  }, []);

  const setDir = useCallback((dx, dy) => {
    const s = stateRef.current;
    if (!s || s.dead) return;
    if (dx === -s.dir.x && dy === -s.dir.y) return; // tak boleh patah balik
    s.nextDir = { x: dx, y: dy };
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.code === 'ArrowUp') { e.preventDefault(); setDir(0, -1); }
      if (e.code === 'ArrowDown') { e.preventDefault(); setDir(0, 1); }
      if (e.code === 'ArrowLeft') setDir(-1, 0);
      if (e.code === 'ArrowRight') setDir(1, 0);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [setDir]);

  useEffect(() => {
    if (!stateRef.current) stateRef.current = initState();
    const c = canvasRef.current.getContext('2d');

    const loop = () => {
      const s = stateRef.current;
      c.setTransform(1, 0, 0, 1, 0, 0);
      c.clearRect(0, 0, W, H);
      s.shaker.apply(c);

      // Padang rumput checkerboard
      for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < COLS; x++) {
          c.fillStyle = (x + y) % 2 === 0 ? '#a3e635' : '#84cc16';
          c.fillRect(x * CELL, y * CELL, CELL, CELL);
        }
      }

      const moving = started && !s.dead;

      if (moving) {
        s.frame++;
        s.tick++;
        if (s.tick >= s.speed) {
          s.tick = 0;
          s.dir = s.nextDir;
          const head = { x: s.snake[0].x + s.dir.x, y: s.snake[0].y + s.dir.y };

          // Langgar dinding / diri sendiri
          if (head.x < 0 || head.x >= COLS || head.y < 0 || head.y >= ROWS ||
              s.snake.some((seg) => seg.x === head.x && seg.y === head.y)) {
            s.dead = true;
            s.shaker.shake(14);
            s.particles.emoji(s.snake[0].x * CELL + 12, s.snake[0].y * CELL + 12, '💫', { count: 6, speed: 3 });
            sfx.die();
          } else {
            s.snake.unshift(head);
            if (head.x === s.food.x && head.y === s.food.y) {
              const fx = s.food.x * CELL + CELL / 2, fy = s.food.y * CELL + CELL / 2;
              if (s.food.kind === 'token') {
                s.collected.push(s.food.token);
                s.score += 50;
                setTokenCount(s.collected.length);
                s.pops.add(fx, fy - 18, `${s.food.token.emoji} ${s.food.token.name}!`, '#7c3aed', 15);
                s.particles.burst(fx, fy, { count: 14, color: '#a78bfa', speed: 4 });
                sfx.token();
              } else {
                s.score += 10;
                s.eaten++;
                s.pops.add(fx, fy - 15, '+10', '#16a34a', 16);
                s.particles.burst(fx, fy, { count: 8, color: '#f87171', speed: 3.5 });
                sfx.coin();
              }
              setScore(s.score);
              s.speed = Math.max(4, 9 - Math.floor(s.eaten / 5));
              // Makanan baru — setiap 4 makan, token muncul
              if ((s.eaten + 1) % 4 === 0) {
                s.food = { ...randCell(s.snake), kind: 'token', token: randomToken() };
              } else {
                s.food = { ...randCell(s.snake), kind: 'food', emoji: FOODS[Math.floor(Math.random() * FOODS.length)] };
              }
            } else {
              s.snake.pop();
            }
          }
        }
      }

      // ── Render snake ──
      s.snake.forEach((seg, i) => {
        const isHead = i === 0;
        const t = i / s.snake.length;
        c.fillStyle = isHead ? '#7c3aed' : `hsl(${270 - t * 40}, 60%, ${52 + t * 15}%)`;
        const pad = isHead ? 1 : 2;
        c.beginPath();
        c.roundRect(seg.x * CELL + pad, seg.y * CELL + pad, CELL - pad * 2, CELL - pad * 2, isHead ? 9 : 7);
        c.fill();
        if (isHead) {
          // Mata
          c.fillStyle = '#fff';
          const ex = s.dir.x * 4, ey = s.dir.y * 4;
          c.beginPath(); c.arc(seg.x * CELL + 8 + ex, seg.y * CELL + 9 + ey, 3.5, 0, Math.PI * 2); c.fill();
          c.beginPath(); c.arc(seg.x * CELL + 17 + ex, seg.y * CELL + 9 + ey, 3.5, 0, Math.PI * 2); c.fill();
          c.fillStyle = '#1e1b4b';
          c.beginPath(); c.arc(seg.x * CELL + 8 + ex * 1.3, seg.y * CELL + 9 + ey * 1.3, 1.8, 0, Math.PI * 2); c.fill();
          c.beginPath(); c.arc(seg.x * CELL + 17 + ex * 1.3, seg.y * CELL + 9 + ey * 1.3, 1.8, 0, Math.PI * 2); c.fill();
        }
      });

      // Food
      const bob = Math.sin(s.frame * 0.12) * 2;
      c.save();
      c.translate(s.food.x * CELL + CELL / 2, s.food.y * CELL + CELL / 2 + bob);
      if (s.food.kind === 'token') { c.shadowColor = '#a78bfa'; c.shadowBlur = 14; }
      c.font = '22px serif'; c.textAlign = 'center';
      c.fillText(s.food.kind === 'token' ? s.food.token.emoji : s.food.emoji, 0, 8);
      c.restore();

      s.particles.update(c);
      s.pops.update(c);

      if (s.dead && !gameOver) {
        setBest(saveBest('snake', s.score));
        setGameOver(true);
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [started, gameOver]);

  // Swipe controls
  const onPointerDown = (e) => {
    if (!started) { startGame(); return; }
    touchStart.current = { x: e.clientX, y: e.clientY };
  };
  const onPointerUp = (e) => {
    if (!touchStart.current) return;
    const dx = e.clientX - touchStart.current.x;
    const dy = e.clientY - touchStart.current.y;
    touchStart.current = null;
    if (Math.abs(dx) < 15 && Math.abs(dy) < 15) return;
    if (Math.abs(dx) > Math.abs(dy)) setDir(dx > 0 ? 1 : -1, 0);
    else setDir(0, dy > 0 ? 1 : -1);
  };

  return (
    <ArcadeShell title="Ular Ceria" emoji="🐍" score={score} tokenCount={tokenCount}>
      <div
        className="absolute inset-0 flex items-center justify-center"
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
      >
        <canvas ref={canvasRef} width={W} height={H} className="h-full w-auto max-w-full touch-none" />
        {!started && !gameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/60 backdrop-blur-sm pointer-events-none">
            <div className="text-6xl mb-3 animate-bounce">🐍</div>
            <p className="text-white font-black text-2xl mb-2">Ular Ceria</p>
            <div className="text-white/80 font-bold text-xs text-center px-6 space-y-1">
              <p>👆 Swipe atas/bawah/kiri/kanan = arah ular</p>
              <p>🍎 Makan buah = panjang & laju!</p>
              <p>⭐ Setiap 4 buah, nilai murni muncul!</p>
            </div>
            <div className="mt-5 px-6 py-3 rounded-full bg-amber-300 text-slate-900 font-black animate-pulse">Tap untuk Mula!</div>
          </div>
        )}
      </div>
      {gameOver && <ArcadeGameOver score={score} best={best} tokens={stateRef.current?.collected || []} onRestart={startGame} />}
    </ArcadeShell>
  );
}