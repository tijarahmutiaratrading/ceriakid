import React, { useRef, useState, useEffect, useCallback } from 'react';
import ArcadeShell from '@/components/arcade/ArcadeShell';
import ArcadeGameOver from '@/components/arcade/ArcadeGameOver';
import { randomToken, getBest, saveBest } from '@/components/arcade/arcadeValues';
import { sfx, Particles, Shaker, Pops, loadImage, drawCover, initHiDPI } from '@/components/arcade/engine';
import { ARCADE_ART } from '@/components/arcade/arcadeArt';
import { drawRocket } from '@/components/arcade/characters';
import CharacterCanvas from '@/components/arcade/CharacterCanvas';
import { drawAsteroidProp, drawStarProp, drawTokenBadge, drawPowerBadge, drawPlanet, drawVignette } from '@/components/arcade/props';

const bgImg = loadImage(ARCADE_ART.space);

const W = 400, H = 600;

export default function SpaceGame() {
  const canvasRef = useRef(null);
  const stateRef = useRef(null);
  const rafRef = useRef(null);
  const [score, setScore] = useState(0);
  const [tokenCount, setTokenCount] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [best, setBest] = useState(() => getBest('space'));
  const [started, setStarted] = useState(false);

  const initState = () => ({
    shipX: W / 2, shipY: H - 100, targetX: W / 2, targetY: H - 100,
    asteroids: [], pickups: [], collected: [], score: 0, shield: false,
    nextAst: 30, nextPick: 80, frame: 0, dead: false, deathSlow: 1,
    stars: [...Array(40)].map(() => ({ x: Math.random() * W, y: Math.random() * H, s: Math.random() * 2 + 0.5 })),
    particles: new Particles(), shaker: new Shaker(), pops: new Pops(),
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
    s.targetX = Math.max(25, Math.min(W - 25, ((e.clientX - rect.left) / rect.width) * W));
    s.targetY = Math.max(H / 2, Math.min(H - 40, ((e.clientY - rect.top) / rect.height) * H));
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

      // Angkasa: Pixar nebula background
      if (!drawCover(c, bgImg, W, H, s.frame * 0.2)) {
        const grad = c.createLinearGradient(0, 0, 0, H);
        grad.addColorStop(0, '#0f172a'); grad.addColorStop(1, '#312e81');
        c.fillStyle = grad;
        c.fillRect(-20, -20, W + 40, H + 40);
      }

      const moving = started && !s.dead;
      const spd = (3 + s.score / 400) * s.deathSlow;

      // Starfield
      s.stars.forEach((st) => {
        if (moving || s.dead) { st.y += st.s * spd * 0.6; if (st.y > H) { st.y = -5; st.x = Math.random() * W; } }
        c.fillStyle = `rgba(255,255,255,${0.3 + st.s * 0.25})`;
        c.fillRect(st.x, st.y, st.s, st.s * 3);
      });
      c.save(); c.translate(340, 80); drawPlanet(c, 12, true); c.restore();
      c.save(); c.translate(40, 140); drawPlanet(c, 10, false); c.restore();

      if (moving) {
        s.frame++;
        s.score += 1;
        s.shipX += (s.targetX - s.shipX) * 0.18;
        s.shipY += (s.targetY - s.shipY) * 0.18;

        // Engine flame trail
        if (s.frame % 2 === 0) s.particles.burst(s.shipX, s.shipY + 24, { count: 2, color: '#fb923c', speed: 2, angle: Math.PI / 2, spread: 0.6, gravity: -0.02, life: 18 });

        s.nextAst--;
        if (s.nextAst <= 0) {
          s.asteroids.push({ x: 25 + Math.random() * (W - 50), y: -30, v: 3 + Math.random() * 2.5 + s.score / 800, rot: 0, rv: (Math.random() - 0.5) * 0.15, size: 28 + Math.random() * 16 });
          s.nextAst = Math.max(12, 32 - s.score / 200);
        }
        s.nextPick--;
        if (s.nextPick <= 0) {
          const r = Math.random();
          const kind = r < 0.6 ? 'star' : r < 0.88 ? 'token' : 'shield';
          s.pickups.push({ x: 30 + Math.random() * (W - 60), y: -25, v: 2.8, kind, token: kind === 'token' ? randomToken() : null });
          s.nextPick = 70 + Math.random() * 60;
        }

        s.asteroids = s.asteroids.filter((a) => {
          a.y += a.v * s.deathSlow; a.rot += a.rv;
          if (Math.hypot(a.x - s.shipX, a.y - s.shipY) < a.size * 0.55 + 16) {
            if (s.shield) {
              s.shield = false;
              s.particles.burst(a.x, a.y, { count: 16, color: '#60a5fa', speed: 5 });
              s.pops.add(s.shipX, s.shipY - 35, 'Shield! 🛡️', '#60a5fa', 18);
              s.shaker.shake(10); sfx.powerup();
              return false;
            }
            s.dead = true; s.shaker.shake(20);
            s.particles.burst(s.shipX, s.shipY, { count: 30, color: '#f97316', speed: 6 });
            s.particles.emoji(s.shipX, s.shipY, '💥', { count: 5, speed: 3 });
            sfx.die();
          }
          return a.y < H + 50;
        });

        s.pickups = s.pickups.filter((p) => {
          p.y += p.v * s.deathSlow;
          if (Math.hypot(p.x - s.shipX, p.y - s.shipY) < 34) {
            if (p.kind === 'star') {
              s.score += 50;
              s.particles.burst(p.x, p.y, { count: 8, color: '#fde047', speed: 3.5 });
              s.pops.add(p.x, p.y - 15, '+50 ⭐', '#fde047', 17);
              sfx.coin();
            } else if (p.kind === 'token') {
              s.collected.push(p.token);
              s.score += 100;
              setTokenCount(s.collected.length);
              s.particles.burst(p.x, p.y, { count: 14, color: '#34d399', speed: 4 });
              s.pops.add(p.x, p.y - 18, `${p.token.emoji} ${p.token.name}!`, '#34d399', 16);
              sfx.token();
            } else {
              s.shield = true;
              s.pops.add(p.x, p.y - 18, '🛡️ Perisai!', '#60a5fa', 18);
              s.particles.burst(p.x, p.y, { count: 16, color: '#60a5fa', speed: 5 });
              sfx.powerup();
            }
            return false;
          }
          return p.y < H + 30;
        });

        setScore(s.score);
      } else if (s.dead && s.deathSlow > 0.05) {
        s.deathSlow *= 0.92; s.frame++;
      }

      // Render asteroids
      c.textAlign = 'center';
      s.asteroids.forEach((a) => {
        c.save(); c.translate(a.x, a.y); c.rotate(a.rot);
        drawAsteroidProp(c, a.size * 1.1);
        c.restore();
      });
      // Render pickups
      s.pickups.forEach((p) => {
        c.save(); c.translate(p.x, p.y);
        if (p.kind === 'star') drawStarProp(c, 12, s.frame + p.x);
        else if (p.kind === 'token') drawTokenBadge(c, p.token.emoji, s.frame + p.x);
        else drawPowerBadge(c, 'shield', s.frame + p.x);
        c.restore();
      });

      // Ship
      if (!s.dead) {
        c.save();
        c.translate(s.shipX, s.shipY);
        c.rotate((s.targetX - s.shipX) * 0.008);
        if (s.shield) { c.shadowColor = '#60a5fa'; c.shadowBlur = 20; }
        drawRocket(c, s.frame);
        c.restore();
        if (s.shield) {
          c.strokeStyle = 'rgba(96,165,250,0.7)'; c.lineWidth = 3;
          c.beginPath(); c.arc(s.shipX, s.shipY, 34 + Math.sin(s.frame * 0.15) * 3, 0, Math.PI * 2); c.stroke();
        }
      }

      drawVignette(c, W, H);
      s.particles.update(c);
      s.pops.update(c);

      if (s.dead && s.deathSlow <= 0.05 && !gameOver) {
        setBest(saveBest('space', s.score));
        setGameOver(true);
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [started, gameOver]);

  return (
    <ArcadeShell title="Angkasa Ceria" emoji="🚀" score={score} tokenCount={tokenCount}>
      <div
        className="absolute inset-0 flex items-center justify-center"
        onPointerDown={(e) => { if (!started) startGame(); moveTo(e); }}
        onPointerMove={moveTo}
      >
        <canvas ref={canvasRef} width={W} height={H} className="h-full w-auto max-w-full touch-none" />
        {!started && !gameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/60 backdrop-blur-sm pointer-events-none">
            <CharacterCanvas draw={drawRocket} className="mb-3 drop-shadow-2xl" />
            <p className="text-white font-black text-2xl mb-2">Angkasa Ceria</p>
            <div className="text-white/80 font-bold text-xs text-center px-6 space-y-1">
              <p>👆 Gerakkan jari = kemudi roket</p>
              <p>☄️ Elak asteroid · ⭐ Kutip bintang +50</p>
              <p>🛡️ Perisai selamatkan anda sekali!</p>
            </div>
            <div className="mt-5 px-6 py-3 rounded-full bg-amber-300 text-slate-900 font-black animate-pulse">Tap untuk Mula!</div>
          </div>
        )}
      </div>
      {gameOver && <ArcadeGameOver score={score} best={best} tokens={stateRef.current?.collected || []} onRestart={startGame} />}
    </ArcadeShell>
  );
}