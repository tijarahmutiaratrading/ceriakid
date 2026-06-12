import React, { useRef, useState, useEffect, useCallback } from 'react';
import ArcadeShell from '@/components/arcade/ArcadeShell';
import ArcadeGameOver from '@/components/arcade/ArcadeGameOver';
import { randomToken, getBest, saveBest } from '@/components/arcade/arcadeValues';
import { sfx, Particles, Shaker, Pops, loadImage, drawCover, initHiDPI } from '@/components/arcade/engine';
import { ARCADE_ART } from '@/components/arcade/arcadeArt';

const bgImg = loadImage(ARCADE_ART.brick);

const W = 400, H = 600;
const COLORS = ['#f87171', '#fb923c', '#fbbf24', '#4ade80', '#60a5fa', '#a78bfa'];

export default function BrickGame() {
  const canvasRef = useRef(null);
  const stateRef = useRef(null);
  const rafRef = useRef(null);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [tokenCount, setTokenCount] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [best, setBest] = useState(() => getBest('brick'));
  const [started, setStarted] = useState(false);

  const makeBricks = (level) => {
    const bricks = [];
    const rows = Math.min(7, 4 + level);
    for (let r = 0; r < rows; r++) {
      for (let col = 0; col < 7; col++) {
        bricks.push({
          x: 14 + col * 54, y: 60 + r * 26, w: 48, h: 20,
          color: COLORS[r % COLORS.length],
          special: Math.random() < 0.1 ? (Math.random() < 0.5 ? 'token' : 'wide') : null,
        });
      }
    }
    return bricks;
  };

  const initState = () => ({
    paddleX: W / 2, paddleW: 90, ballX: W / 2, ballY: H - 120,
    vx: 3.2, vy: -4.4, launched: false,
    bricks: makeBricks(1), drops: [], collected: [],
    score: 0, lives: 3, level: 1, wideTimer: 0, frame: 0, dead: false,
    particles: new Particles(), shaker: new Shaker(), pops: new Pops(),
  });

  const startGame = useCallback(() => {
    stateRef.current = initState();
    setScore(0); setLives(3); setTokenCount(0); setGameOver(false); setStarted(true);
  }, []);

  const moveTo = useCallback((e) => {
    const s = stateRef.current;
    const canvas = canvasRef.current;
    if (!s || !canvas) return;
    const rect = canvas.getBoundingClientRect();
    s.paddleX = Math.max(s.paddleW / 2, Math.min(W - s.paddleW / 2, ((e.clientX - rect.left) / rect.width) * W));
  }, []);

  useEffect(() => {
    if (!stateRef.current) stateRef.current = initState();
    const dpr = initHiDPI(canvasRef.current, W, H);
    const c = canvasRef.current.getContext('2d');

    const loop = () => {
      const s = stateRef.current;
      c.setTransform(dpr, 0, 0, dpr, 0, 0);
      c.clearRect(0, 0, W, H);
      s.shaker.apply(c);

      if (!drawCover(c, bgImg, W, H, 0)) {
        const grad = c.createLinearGradient(0, 0, 0, H);
        grad.addColorStop(0, '#1e1b4b'); grad.addColorStop(1, '#4c1d95');
        c.fillStyle = grad;
        c.fillRect(-20, -20, W + 40, H + 40);
      }
      // Overlay gelap supaya blok & bola jelas
      c.fillStyle = 'rgba(15,23,42,0.45)';
      c.fillRect(-20, -20, W + 40, H + 40);

      const moving = started && !s.dead;

      if (moving) {
        s.frame++;
        if (s.wideTimer > 0) { s.wideTimer--; if (s.wideTimer === 0) s.paddleW = 90; }
        const speedMult = 1 + s.level * 0.08;

        if (!s.launched) {
          s.ballX = s.paddleX; s.ballY = H - 76;
        } else {
          s.ballX += s.vx * speedMult;
          s.ballY += s.vy * speedMult;

          if (s.ballX < 8 || s.ballX > W - 8) { s.vx *= -1; sfx.score(); }
          if (s.ballY < 8) { s.vy *= -1; sfx.score(); }

          // Paddle hit
          if (s.ballY > H - 72 && s.ballY < H - 52 && Math.abs(s.ballX - s.paddleX) < s.paddleW / 2 + 8 && s.vy > 0) {
            s.vy = -Math.abs(s.vy);
            s.vx = ((s.ballX - s.paddleX) / (s.paddleW / 2)) * 4.5;
            s.particles.burst(s.ballX, H - 64, { count: 5, color: '#e9d5ff', speed: 2.5 });
            sfx.jump();
          }

          // Brick hits
          for (const b of s.bricks) {
            if (s.ballX > b.x - 8 && s.ballX < b.x + b.w + 8 && s.ballY > b.y - 8 && s.ballY < b.y + b.h + 8) {
              b.hit = true;
              s.vy *= -1;
              s.score += 10;
              s.particles.burst(b.x + b.w / 2, b.y + b.h / 2, { count: 10, color: b.color, speed: 4 });
              s.pops.add(b.x + b.w / 2, b.y, '+10', '#fff', 14);
              if (b.special) s.drops.push({ x: b.x + b.w / 2, y: b.y, kind: b.special, token: b.special === 'token' ? randomToken() : null });
              s.shaker.shake(3);
              sfx.coin();
              break;
            }
          }
          s.bricks = s.bricks.filter((b) => !b.hit);

          // Level clear
          if (s.bricks.length === 0) {
            s.level++;
            s.score += 100;
            s.bricks = makeBricks(s.level);
            s.launched = false;
            s.pops.add(W / 2, H / 2, `LEVEL ${s.level}! 🚀`, '#fde047', 30);
            sfx.powerup();
          }

          // Bola jatuh
          if (s.ballY > H + 20) {
            s.lives--; setLives(s.lives);
            s.shaker.shake(10);
            sfx.hit();
            if (s.lives <= 0) {
              s.dead = true;
              sfx.die();
            } else {
              s.launched = false;
              s.vx = 3.2; s.vy = -4.4;
            }
          }
        }

        // Drops jatuh
        s.drops = s.drops.filter((d) => {
          d.y += 3;
          if (d.y > H - 80 && d.y < H - 48 && Math.abs(d.x - s.paddleX) < s.paddleW / 2 + 14) {
            if (d.kind === 'token') {
              s.collected.push(d.token);
              s.score += 50;
              setTokenCount(s.collected.length);
              s.pops.add(d.x, d.y - 20, `${d.token.emoji} ${d.token.name}!`, '#34d399', 16);
              sfx.token();
            } else {
              s.paddleW = 140; s.wideTimer = 480;
              s.pops.add(d.x, d.y - 20, '↔️ Paddle Besar!', '#fde047', 17);
              sfx.powerup();
            }
            s.particles.burst(d.x, d.y, { count: 12, color: '#a78bfa', speed: 4 });
            return false;
          }
          return d.y < H + 20;
        });

        setScore(s.score);
      }

      // ── Render bricks ──
      s.bricks.forEach((b) => {
        c.fillStyle = b.color;
        c.beginPath(); c.roundRect(b.x, b.y, b.w, b.h, 5); c.fill();
        c.fillStyle = 'rgba(255,255,255,0.3)';
        c.beginPath(); c.roundRect(b.x, b.y, b.w, 7, 5); c.fill();
        if (b.special) { c.font = '12px serif'; c.textAlign = 'center'; c.fillText(b.special === 'token' ? '⭐' : '↔️', b.x + b.w / 2, b.y + 15); }
      });

      // Drops
      c.textAlign = 'center';
      s.drops.forEach((d) => {
        c.save(); c.translate(d.x, d.y);
        c.shadowColor = '#a78bfa'; c.shadowBlur = 12;
        c.font = '24px serif';
        c.fillText(d.kind === 'token' ? d.token.emoji : '↔️', 0, 8);
        c.restore();
      });

      // Paddle
      const pGrad = c.createLinearGradient(s.paddleX - s.paddleW / 2, 0, s.paddleX + s.paddleW / 2, 0);
      pGrad.addColorStop(0, '#ec4899'); pGrad.addColorStop(0.5, '#f9a8d4'); pGrad.addColorStop(1, '#ec4899');
      c.fillStyle = pGrad;
      c.beginPath(); c.roundRect(s.paddleX - s.paddleW / 2, H - 64, s.paddleW, 14, 7); c.fill();

      // Ball
      if (!s.dead) {
        c.shadowColor = '#fde047'; c.shadowBlur = 14;
        c.fillStyle = '#fef08a';
        c.beginPath(); c.arc(s.ballX, s.ballY, 8, 0, Math.PI * 2); c.fill();
        c.shadowBlur = 0;
      }

      // HUD level
      c.fillStyle = 'rgba(255,255,255,0.15)';
      c.beginPath(); c.roundRect(10, 14, 80, 26, 13); c.fill();
      c.font = '900 13px Nunito, sans-serif'; c.fillStyle = '#fff'; c.textAlign = 'left';
      c.fillText(`Lvl ${s.level}`, 24, 32);

      if (moving && !s.launched) {
        c.font = '900 15px Nunito, sans-serif'; c.fillStyle = '#fde047'; c.textAlign = 'center';
        c.fillText('Tap untuk lancar bola! 👆', W / 2, H / 2 + 60);
      }

      s.particles.update(c);
      s.pops.update(c);

      if (s.dead && !gameOver) {
        setBest(saveBest('brick', s.score));
        setGameOver(true);
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [started, gameOver]);

  return (
    <ArcadeShell title="Pecah Blok" emoji="🧱" score={score} lives={lives} tokenCount={tokenCount}>
      <div
        className="absolute inset-0 flex items-center justify-center"
        onPointerDown={(e) => {
          if (!started) { startGame(); return; }
          const s = stateRef.current;
          if (s && !s.launched && !s.dead) s.launched = true;
          moveTo(e);
        }}
        onPointerMove={moveTo}
      >
        <canvas ref={canvasRef} width={W} height={H} className="h-full w-auto max-w-full touch-none" />
        {!started && !gameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/60 backdrop-blur-sm pointer-events-none">
            <div className="text-6xl mb-3 animate-bounce">🧱</div>
            <p className="text-white font-black text-2xl mb-2">Pecah Blok</p>
            <div className="text-white/80 font-bold text-xs text-center px-6 space-y-1">
              <p>👆 Gerakkan jari = gerak paddle</p>
              <p>🧱 Pecahkan semua blok untuk naik level!</p>
              <p>⭐ Blok khas jatuhkan nilai murni & power-up</p>
            </div>
            <div className="mt-5 px-6 py-3 rounded-full bg-amber-300 text-slate-900 font-black animate-pulse">Tap untuk Mula!</div>
          </div>
        )}
      </div>
      {gameOver && <ArcadeGameOver score={score} best={best} tokens={stateRef.current?.collected || []} onRestart={startGame} />}
    </ArcadeShell>
  );
}