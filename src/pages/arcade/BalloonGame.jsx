import React, { useRef, useState, useEffect, useCallback } from 'react';
import ArcadeShell from '@/components/arcade/ArcadeShell';
import ArcadeGameOver from '@/components/arcade/ArcadeGameOver';
import { randomToken, getBest, saveBest } from '@/components/arcade/arcadeValues';
import { sfx, Particles, Shaker, Pops, loadImage, drawCover, initHiDPI } from '@/components/arcade/engine';
import { ARCADE_ART } from '@/components/arcade/arcadeArt';

import { drawBomb, drawBalloon, drawVignette } from '@/components/arcade/props';

const bgImg = loadImage(ARCADE_ART.balloon);

const W = 400, H = 600;
const BALLOON_COLORS = ['#f87171', '#fb923c', '#fbbf24', '#4ade80', '#60a5fa', '#a78bfa', '#f472b6'];

export default function BalloonGame() {
  const canvasRef = useRef(null);
  const stateRef = useRef(null);
  const rafRef = useRef(null);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [tokenCount, setTokenCount] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [best, setBest] = useState(() => getBest('balloon'));
  const [started, setStarted] = useState(false);

  const initState = () => ({
    balloons: [], collected: [], score: 0, lives: 3, combo: 0,
    nextBalloon: 30, frame: 0, dead: false, level: 1,
    particles: new Particles(), shaker: new Shaker(), pops: new Pops(),
  });

  const startGame = useCallback(() => {
    stateRef.current = initState();
    setScore(0); setLives(3); setTokenCount(0); setGameOver(false); setStarted(true);
  }, []);

  const tap = useCallback((e) => {
    const s = stateRef.current;
    const canvas = canvasRef.current;
    if (!s || !canvas) return;
    if (!started) { startGame(); return; }
    if (s.dead) return;
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * W;
    const y = ((e.clientY - rect.top) / rect.height) * H;

    // Cari belon paling dekat dalam radius
    let hit = null, hitD = 45;
    s.balloons.forEach((b) => {
      const d = Math.hypot(b.x - x, b.y - y);
      if (d < hitD) { hit = b; hitD = d; }
    });
    if (!hit) return;
    hit.popped = true;

    if (hit.kind === 'bomb') {
      s.lives--; setLives(s.lives); s.combo = 0;
      s.particles.burst(hit.x, hit.y, { count: 20, color: '#ef4444', speed: 6 });
      s.particles.emoji(hit.x, hit.y, '💥', { count: 3, speed: 3 });
      s.pops.add(hit.x, hit.y - 25, 'BOOM! 💥', '#dc2626', 22);
      s.shaker.shake(14);
      sfx.hit();
      if (navigator.vibrate) navigator.vibrate(120);
      if (s.lives <= 0) {
        s.dead = true;
        sfx.die();
        setBest(saveBest('balloon', s.score));
        setGameOver(true);
      }
    } else if (hit.kind === 'token') {
      s.collected.push(hit.token);
      s.score += 30;
      setTokenCount(s.collected.length);
      s.particles.burst(hit.x, hit.y, { count: 14, color: '#34d399', speed: 4.5 });
      s.pops.add(hit.x, hit.y - 22, `${hit.token.emoji} ${hit.token.name}!`, '#059669', 16);
      sfx.token();
    } else {
      s.combo++;
      const mult = 1 + Math.floor(s.combo / 6);
      const pts = 10 * mult;
      s.score += pts;
      s.particles.burst(hit.x, hit.y, { count: 10, color: hit.color, speed: 4.5 });
      s.pops.add(hit.x, hit.y - 20, `+${pts}`, '#7c3aed', 17);
      if (s.combo % 6 === 0) { s.pops.add(W / 2, 200, `COMBO x${mult}! 🔥`, '#f59e0b', 26); sfx.combo(mult); }
      else sfx.coin();
    }
    setScore(s.score);
  }, [started, startGame]);

  useEffect(() => {
    if (!stateRef.current) stateRef.current = initState();
    const dpr = initHiDPI(canvasRef.current, W, H);
    const c = canvasRef.current.getContext('2d');

    const loop = () => {
      const s = stateRef.current;
      c.setTransform(dpr, 0, 0, dpr, 0, 0);
      c.clearRect(0, 0, W, H);
      s.shaker.apply(c);

      // Sky: Pixar carnival art
      if (!drawCover(c, bgImg, W, H, s.frame * 0.1)) {
        const grad = c.createLinearGradient(0, 0, 0, H);
        grad.addColorStop(0, '#7dd3fc'); grad.addColorStop(1, '#fef3c7');
        c.fillStyle = grad;
        c.fillRect(-20, -20, W + 40, H + 40);
      }

      const moving = started && !s.dead;

      if (moving) {
        s.frame++;
        s.level = 1 + Math.floor(s.score / 200);

        s.nextBalloon--;
        if (s.nextBalloon <= 0) {
          const r = Math.random();
          const kind = r < 0.68 ? 'good' : r < 0.88 ? 'bomb' : 'token';
          s.balloons.push({
            x: 40 + Math.random() * (W - 80), y: H + 50,
            v: 1.6 + Math.random() * 1.2 + s.level * 0.3,
            sway: Math.random() * Math.PI * 2,
            color: BALLOON_COLORS[Math.floor(Math.random() * BALLOON_COLORS.length)],
            kind, token: kind === 'token' ? randomToken() : null,
          });
          s.nextBalloon = Math.max(16, 40 - s.level * 4);
        }

        s.balloons = s.balloons.filter((b) => {
          if (b.popped) return false;
          b.y -= b.v;
          b.x += Math.sin(b.sway + s.frame * 0.04) * 0.8;
          if (b.y < -60) {
            if (b.kind === 'good') s.combo = 0; // terlepas belon baik
            return false;
          }
          return true;
        });
      }

      // ── Render balloons ──
      s.balloons.forEach((b) => {
        c.save();
        c.translate(b.x, b.y);
        // Tali
        c.strokeStyle = 'rgba(100,116,139,0.6)'; c.lineWidth = 1.5;
        c.beginPath(); c.moveTo(0, 28);
        c.quadraticCurveTo(6, 42, 0, 56);
        c.stroke();
        if (b.kind === 'bomb') {
          c.scale(1.25, 1.25);
          drawBomb(c, s.frame);
        } else {
          drawBalloon(c, b.color);
          if (b.kind === 'token') {
            c.shadowColor = '#34d399'; c.shadowBlur = 10;
            c.font = '22px serif'; c.textAlign = 'center';
            c.fillText(b.token.emoji, 0, 8);
          }
        }
        c.restore();
      });

      // HUD combo + level
      if (moving && s.combo > 2) {
        c.fillStyle = 'rgba(0,0,0,0.3)';
        c.beginPath(); c.roundRect(W / 2 - 60, 14, 120, 26, 13); c.fill();
        c.font = '900 14px Nunito, sans-serif'; c.fillStyle = '#fde047'; c.textAlign = 'center';
        c.fillText(`🔥 Combo ${s.combo}`, W / 2, 32);
      }
      c.fillStyle = 'rgba(0,0,0,0.3)';
      c.beginPath(); c.roundRect(10, 14, 80, 26, 13); c.fill();
      c.font = '900 13px Nunito, sans-serif'; c.fillStyle = '#fff'; c.textAlign = 'left';
      c.fillText(`Lvl ${s.level}`, 24, 32);

      drawVignette(c, W, H);
      s.particles.update(c);
      s.pops.update(c);

      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [started, gameOver]);

  return (
    <ArcadeShell title="Letup Belon" emoji="🎈" score={score} lives={lives} tokenCount={tokenCount}>
      <div className="absolute inset-0 flex items-center justify-center" onPointerDown={tap}>
        <canvas ref={canvasRef} width={W} height={H} className="h-full w-auto max-w-full touch-none" />
        {!started && !gameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/60 backdrop-blur-sm pointer-events-none">
            <div className="text-6xl mb-3 animate-bounce">🎈</div>
            <p className="text-white font-black text-2xl mb-2">Letup Belon</p>
            <div className="text-white/80 font-bold text-xs text-center px-6 space-y-1">
              <p>👆 Tap belon untuk letupkan!</p>
              <p>💣 JANGAN tap bom — hilang nyawa!</p>
              <p>🔥 Letup berturut = COMBO multiplier!</p>
            </div>
            <div className="mt-5 px-6 py-3 rounded-full bg-amber-300 text-slate-900 font-black animate-pulse">Tap untuk Mula!</div>
          </div>
        )}
      </div>
      {gameOver && <ArcadeGameOver score={score} best={best} tokens={stateRef.current?.collected || []} onRestart={startGame} />}
    </ArcadeShell>
  );
}