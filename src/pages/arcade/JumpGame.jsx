import React, { useRef, useState, useEffect, useCallback } from 'react';
import ArcadeShell from '@/components/arcade/ArcadeShell';
import ArcadeGameOver from '@/components/arcade/ArcadeGameOver';
import { randomToken, getBest, saveBest } from '@/components/arcade/arcadeValues';
import { sfx, Particles, Pops, loadImage, drawCover } from '@/components/arcade/engine';
import { ARCADE_ART } from '@/components/arcade/arcadeArt';
import { drawRabbit } from '@/components/arcade/characters';
import CharacterCanvas from '@/components/arcade/CharacterCanvas';

const bgImg = loadImage(ARCADE_ART.jump);

const W = 400, H = 600;
const GRAVITY = 0.38;
const BOUNCE_V = -13;

export default function JumpGame() {
  const canvasRef = useRef(null);
  const stateRef = useRef(null);
  const rafRef = useRef(null);
  const [score, setScore] = useState(0);
  const [tokenCount, setTokenCount] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [best, setBest] = useState(() => getBest('jump'));
  const [started, setStarted] = useState(false);

  const makePlatforms = () => {
    const plats = [{ x: W / 2 - 35, y: H - 60, type: 'normal' }];
    for (let i = 1; i < 12; i++) {
      plats.push({ x: 20 + Math.random() * (W - 110), y: H - 60 - i * 70, type: Math.random() < 0.12 ? 'spring' : 'normal' });
    }
    return plats;
  };

  const initState = () => ({
    px: W / 2, py: H - 110, vx: 0, vy: 0, targetX: W / 2,
    platforms: makePlatforms(), pickups: [], collected: [],
    cameraY: 0, maxHeight: 0, dead: false, frame: 0, squash: 1,
    clouds: [...Array(4)].map((_, i) => ({ x: Math.random() * W, y: -i * 300 - 100 })),
    particles: new Particles(), pops: new Pops(),
  });

  const startGame = useCallback(() => {
    stateRef.current = initState();
    setScore(0); setTokenCount(0); setGameOver(false); setStarted(true);
  }, []);

  const moveTo = useCallback((e) => {
    const s = stateRef.current;
    const canvas = canvasRef.current;
    if (!s || !canvas) return;
    const rect = canvas.getBoundingClientRect();
    s.targetX = ((e.clientX - rect.left) / rect.width) * W;
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      const s = stateRef.current;
      if (!s) return;
      if (e.code === 'ArrowLeft') s.targetX = Math.max(20, s.targetX - 70);
      if (e.code === 'ArrowRight') s.targetX = Math.min(W - 20, s.targetX + 70);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    if (!stateRef.current) stateRef.current = initState();
    const c = canvasRef.current.getContext('2d');

    const loop = () => {
      const s = stateRef.current;
      c.setTransform(1, 0, 0, 1, 0, 0);
      c.clearRect(0, 0, W, H);

      // Sky: Pixar art + tint gelap bila makin tinggi (→ angkasa)
      const alt = Math.min(1, s.maxHeight / 6000);
      if (!drawCover(c, bgImg, W, H, Math.abs(s.cameraY) * 0.08)) {
        const grad = c.createLinearGradient(0, 0, 0, H);
        grad.addColorStop(0, alt > 0.7 ? '#1e1b4b' : '#7dd3fc');
        grad.addColorStop(1, alt > 0.7 ? '#4c1d95' : '#e0f2fe');
        c.fillStyle = grad;
        c.fillRect(0, 0, W, H);
      }
      if (alt > 0.3) {
        c.fillStyle = `rgba(30,27,75,${(alt - 0.3) * 0.8})`;
        c.fillRect(0, 0, W, H);
      }

      const moving = started && !s.dead;

      // Clouds (ikut camera)
      c.font = '40px serif';
      s.clouds.forEach((cl) => {
        const sy = cl.y - s.cameraY * 0.5;
        if (sy > H + 50) cl.y -= 1500;
        c.globalAlpha = 0.7;
        c.fillText(alt > 0.7 ? '✨' : '☁️', cl.x, ((sy % (H + 100)) + H + 100) % (H + 100) - 50);
        c.globalAlpha = 1;
      });

      if (moving) {
        s.frame++;
        // Horizontal — ikut pointer
        s.vx += (s.targetX - s.px) * 0.012;
        s.vx *= 0.88;
        s.px += s.vx;
        if (s.px < -15) s.px = W + 15;
        if (s.px > W + 15) s.px = -15;

        s.vy += GRAVITY;
        s.py += s.vy;
        s.squash += (1 - s.squash) * 0.12;

        // Platform bounce (hanya bila jatuh)
        if (s.vy > 0) {
          s.platforms.forEach((p) => {
            if (s.px > p.x - 12 && s.px < p.x + 82 && s.py + 20 > p.y && s.py + 20 < p.y + 18) {
              s.vy = p.type === 'spring' ? BOUNCE_V * 1.6 : BOUNCE_V;
              s.squash = 0.7;
              s.particles.burst(s.px, p.y, { count: 6, color: p.type === 'spring' ? '#f472b6' : '#86efac', speed: 3, gravity: 0.1 });
              if (p.type === 'spring') { s.pops.add(s.px, p.y - 25, 'BOING! 🌀', '#db2777', 18); sfx.powerup(); }
              else sfx.jump();
            }
          });
        }

        // Camera follow up
        const targetCam = s.py - 280;
        if (targetCam < s.cameraY) s.cameraY = targetCam;
        const height = Math.max(0, Math.floor((H - 110 - s.py) / 10));
        if (height > s.maxHeight) { s.maxHeight = height; setScore(height); }

        // Recycle platforms + spawn pickups
        s.platforms.forEach((p) => {
          if (p.y - s.cameraY > H + 30) {
            p.y -= 12 * 70;
            p.x = 20 + Math.random() * (W - 110);
            p.type = Math.random() < 0.14 ? 'spring' : 'normal';
            if (Math.random() < 0.18) {
              const kind = Math.random() < 0.6 ? 'coin' : 'token';
              s.pickups.push({ x: p.x + 35, y: p.y - 35, kind, token: kind === 'token' ? randomToken() : null });
            }
          }
        });

        // Pickups
        s.pickups = s.pickups.filter((pk) => {
          if (Math.hypot(pk.x - s.px, pk.y - s.py) < 32) {
            if (pk.kind === 'coin') {
              s.maxHeight += 15; setScore(s.maxHeight);
              s.particles.burst(pk.x, pk.y, { count: 6, color: '#fbbf24', speed: 3 });
              s.pops.add(pk.x, pk.y - 15, '+15 🪙', '#d97706', 15);
              sfx.coin();
            } else {
              s.collected.push(pk.token);
              s.maxHeight += 40; setScore(s.maxHeight);
              setTokenCount(s.collected.length);
              s.particles.burst(pk.x, pk.y, { count: 12, color: '#34d399', speed: 4 });
              s.pops.add(pk.x, pk.y - 18, `${pk.token.emoji} ${pk.token.name}!`, '#059669', 15);
              sfx.token();
            }
            return false;
          }
          return pk.y - s.cameraY < H + 40;
        });

        // Jatuh = mati
        if (s.py - s.cameraY > H + 40) {
          s.dead = true;
          sfx.die();
          setBest(saveBest('jump', s.maxHeight));
          setGameOver(true);
        }
      }

      // ── Render world (camera offset) ──
      c.save();
      c.translate(0, -s.cameraY);

      // Platforms
      s.platforms.forEach((p) => {
        c.fillStyle = p.type === 'spring' ? '#f9a8d4' : '#4ade80';
        c.beginPath(); c.roundRect(p.x, p.y, 70, 14, 7); c.fill();
        c.fillStyle = p.type === 'spring' ? '#ec4899' : '#16a34a';
        c.beginPath(); c.roundRect(p.x, p.y + 8, 70, 6, 3); c.fill();
        if (p.type === 'spring') { c.font = '16px serif'; c.textAlign = 'center'; c.fillText('🌀', p.x + 35, p.y - 4); }
      });

      // Pickups
      c.textAlign = 'center';
      s.pickups.forEach((pk) => {
        const bob = Math.sin((s.frame + pk.x) * 0.1) * 3;
        c.save(); c.translate(pk.x, pk.y + bob);
        if (pk.kind === 'coin') { c.font = '22px serif'; c.fillText('🪙', 0, 8); }
        else { c.shadowColor = '#34d399'; c.shadowBlur = 12; c.font = '26px serif'; c.fillText(pk.token.emoji, 0, 9); }
        c.restore();
      });

      // Player
      c.save();
      c.translate(s.px, s.py);
      c.scale(2 - s.squash, s.squash);
      if (s.vx < -0.5) c.scale(-1, 1);
      drawRabbit(c, s.frame);
      c.restore();

      s.particles.update(c);
      s.pops.update(c);
      c.restore();

      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [started, gameOver]);

  return (
    <ArcadeShell title="Lompat Awan" emoji="🐰" score={score} tokenCount={tokenCount}>
      <div
        className="absolute inset-0 flex items-center justify-center"
        onPointerDown={(e) => { if (!started) startGame(); moveTo(e); }}
        onPointerMove={moveTo}
      >
        <canvas ref={canvasRef} width={W} height={H} className="h-full w-auto max-w-full touch-none" />
        {!started && !gameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/60 backdrop-blur-sm pointer-events-none">
            <CharacterCanvas draw={drawRabbit} className="mb-3 drop-shadow-2xl" />
            <p className="text-white font-black text-2xl mb-2">Lompat Awan</p>
            <div className="text-white/80 font-bold text-xs text-center px-6 space-y-1">
              <p>👆 Gerakkan jari kiri-kanan = kemudi arnab</p>
              <p>🌀 Spring = lompat super tinggi!</p>
              <p>Lompat sampai angkasa! ✨</p>
            </div>
            <div className="mt-5 px-6 py-3 rounded-full bg-amber-300 text-slate-900 font-black animate-pulse">Tap untuk Mula!</div>
          </div>
        )}
      </div>
      {gameOver && <ArcadeGameOver score={score} best={best} tokens={stateRef.current?.collected || []} onRestart={startGame} />}
    </ArcadeShell>
  );
}