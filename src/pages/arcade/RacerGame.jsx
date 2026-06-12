import React, { useRef, useState, useEffect, useCallback } from 'react';
import ArcadeShell from '@/components/arcade/ArcadeShell';
import ArcadeGameOver from '@/components/arcade/ArcadeGameOver';
import { randomToken, getBest, saveBest } from '@/components/arcade/arcadeValues';
import { sfx, Particles, Shaker, Pops, loadImage, drawCover, initHiDPI } from '@/components/arcade/engine';
import { ARCADE_ART } from '@/components/arcade/arcadeArt';
import { drawCar } from '@/components/arcade/characters';
import CharacterCanvas from '@/components/arcade/CharacterCanvas';
import { drawEnemyCar, drawCoin, drawTokenBadge, drawPowerBadge, drawTreeProp, drawVignette } from '@/components/arcade/props';

const bgImg = loadImage(ARCADE_ART.racer);

const W = 400, H = 600;
const LANES = [100, 200, 300];
const CAR_Y = 480;
const ENEMIES = ['#3b82f6', '#22c55e', '#eab308', '#a855f7', '#06b6d4'];

export default function RacerGame() {
  const canvasRef = useRef(null);
  const stateRef = useRef(null);
  const rafRef = useRef(null);
  const [score, setScore] = useState(0);
  const [tokenCount, setTokenCount] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [best, setBest] = useState(() => getBest('racer'));
  const [started, setStarted] = useState(false);

  const initState = () => ({
    lane: 1, carX: LANES[1], enemies: [], pickups: [], collected: [],
    distance: 0, coins: 0, shield: false, boost: 0,
    nextEnemy: 50, nextPick: 90, frame: 0, dead: false, deathSlow: 1, roadOff: 0,
    trees: [...Array(6)].map((_, i) => ({ y: i * 120, side: i % 2 })),
    particles: new Particles(), shaker: new Shaker(), pops: new Pops(),
  });

  const startGame = useCallback(() => {
    stateRef.current = initState();
    setScore(0); setTokenCount(0); setGameOver(false); setStarted(true);
  }, []);

  const steer = useCallback((dir) => {
    const s = stateRef.current;
    if (!s || s.dead) return;
    s.lane = Math.max(0, Math.min(2, s.lane + dir));
    sfx.score();
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.code === 'ArrowLeft') steer(-1);
      if (e.code === 'ArrowRight') steer(1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [steer]);

  useEffect(() => {
    if (!stateRef.current) stateRef.current = initState();
    const dpr = initHiDPI(canvasRef.current, W, H);
    const c = canvasRef.current.getContext('2d');

    const loop = () => {
      const s = stateRef.current;
      c.setTransform(dpr, 0, 0, dpr, 0, 0);
      c.clearRect(0, 0, W, H);
      s.shaker.apply(c);

      // Tepi jalan: Pixar countryside art
      if (!drawCover(c, bgImg, W, H, 0)) {
        c.fillStyle = '#4d7c0f';
        c.fillRect(-20, -20, W + 40, H + 40);
      }
      // Jalan
      c.fillStyle = '#374151';
      c.fillRect(50, -20, 300, H + 40);
      // Garisan tepi
      c.fillStyle = '#fbbf24';
      c.fillRect(52, -20, 6, H + 40);
      c.fillRect(342, -20, 6, H + 40);

      const moving = started && !s.dead;
      const spd = (6 + s.distance / 300) * s.deathSlow * (s.boost > 0 ? 1.5 : 1);

      // Garisan lorong bergerak
      s.roadOff = (s.roadOff + (moving || s.dead ? spd : 0)) % 60;
      c.fillStyle = '#e5e7eb';
      for (let y = -60 + s.roadOff; y < H; y += 60) {
        c.fillRect(147, y, 6, 32);
        c.fillRect(247, y, 6, 32);
      }
      // Pokok tepi jalan
      c.textAlign = 'center';
      s.trees.forEach((t) => {
        if (moving || s.dead) { t.y += spd * 0.8; if (t.y > H + 40) { t.y = -60; t.side = Math.random() < 0.5 ? 0 : 1; } }
        c.save(); c.translate(t.side === 0 ? 25 : W - 25, t.y);
        drawTreeProp(c, 0.8);
        c.restore();
      });

      if (moving) {
        s.frame++;
        s.distance += spd * 0.1;
        if (s.boost > 0) s.boost--;
        s.carX += (LANES[s.lane] - s.carX) * 0.25;

        // Spawn musuh
        s.nextEnemy--;
        if (s.nextEnemy <= 0) {
          const lane = Math.floor(Math.random() * 3);
          s.enemies.push({ lane, x: LANES[lane], y: -50, color: ENEMIES[Math.floor(Math.random() * ENEMIES.length)], v: 0.55 + Math.random() * 0.2 });
          // double bila laju
          if (s.distance > 300 && Math.random() < 0.4) {
            const lane2 = (lane + 1 + Math.floor(Math.random() * 2)) % 3;
            s.enemies.push({ lane: lane2, x: LANES[lane2], y: -160, color: ENEMIES[Math.floor(Math.random() * ENEMIES.length)], v: 0.55 });
          }
          s.nextEnemy = Math.max(28, 60 - s.distance / 50);
        }
        // Spawn pickups
        s.nextPick--;
        if (s.nextPick <= 0) {
          const lane = Math.floor(Math.random() * 3);
          const r = Math.random();
          const kind = r < 0.55 ? 'coin' : r < 0.8 ? 'token' : r < 0.92 ? 'shield' : 'boost';
          s.pickups.push({ x: LANES[lane], y: -40, kind, token: kind === 'token' ? randomToken() : null });
          s.nextPick = 70 + Math.random() * 70;
        }

        // Musuh
        s.enemies = s.enemies.filter((en) => {
          en.y += spd * en.v;
          if (Math.abs(en.x - s.carX) < 48 && Math.abs(en.y - CAR_Y) < 56) {
            if (s.boost > 0) {
              s.particles.burst(en.x, en.y, { count: 14, color: '#fde047', speed: 5 });
              s.pops.add(en.x, en.y - 25, 'BOOM! ⚡', '#d97706', 18);
              s.shaker.shake(6); sfx.coin();
              return false;
            }
            if (s.shield) {
              s.shield = false;
              s.particles.burst(en.x, en.y, { count: 16, color: '#60a5fa', speed: 5 });
              s.pops.add(s.carX, CAR_Y - 50, 'Shield! 🛡️', '#60a5fa', 18);
              s.shaker.shake(10); sfx.powerup();
              return false;
            }
            s.dead = true;
            s.shaker.shake(20);
            s.particles.burst(s.carX, CAR_Y, { count: 26, color: '#f97316', speed: 6 });
            s.particles.emoji(s.carX, CAR_Y, '💥', { count: 4, speed: 3 });
            sfx.die();
          }
          return en.y < H + 60;
        });

        // Pickups
        s.pickups = s.pickups.filter((p) => {
          p.y += spd * 0.7;
          if (Math.abs(p.x - s.carX) < 44 && Math.abs(p.y - CAR_Y) < 50) {
            if (p.kind === 'coin') {
              s.coins++; s.distance += 15;
              s.particles.burst(p.x, p.y, { count: 6, color: '#fbbf24', speed: 3 });
              s.pops.add(p.x, p.y - 15, '+🪙', '#d97706', 16);
              sfx.coin();
            } else if (p.kind === 'token') {
              s.collected.push(p.token);
              s.distance += 50;
              setTokenCount(s.collected.length);
              s.particles.burst(p.x, p.y, { count: 14, color: '#34d399', speed: 4 });
              s.pops.add(p.x, p.y - 18, `${p.token.emoji} ${p.token.name}!`, '#34d399', 16);
              sfx.token();
            } else if (p.kind === 'shield') {
              s.shield = true;
              s.pops.add(p.x, p.y - 18, '🛡️ Perisai!', '#60a5fa', 18);
              sfx.powerup();
            } else {
              s.boost = 180;
              s.pops.add(p.x, p.y - 18, '⚡ NITRO!', '#d97706', 20);
              sfx.powerup();
            }
            return false;
          }
          return p.y < H + 40;
        });

        setScore(Math.floor(s.distance));
      } else if (s.dead && s.deathSlow > 0.05) {
        s.deathSlow *= 0.92; s.frame++;
      }

      // ── Render musuh (menghadap bawah) ──
      s.enemies.forEach((en) => {
        c.save(); c.translate(en.x, en.y);
        c.scale(1.15, 1.15);
        drawEnemyCar(c, en.color);
        c.restore();
      });
      // Pickups
      s.pickups.forEach((p) => {
        const bob = Math.sin((s.frame + p.y) * 0.1) * 3;
        c.save(); c.translate(p.x, p.y + bob);
        if (p.kind === 'coin') drawCoin(c, s.frame + p.y);
        else if (p.kind === 'token') drawTokenBadge(c, p.token.emoji, s.frame + p.y);
        else if (p.kind === 'shield') drawPowerBadge(c, 'shield', s.frame + p.y);
        else drawPowerBadge(c, 'boost', s.frame + p.y);
        c.restore();
      });

      // Kereta player
      if (!s.dead || s.deathSlow > 0.3) {
        c.save();
        c.translate(s.carX, CAR_Y);
        c.rotate((LANES[s.lane] - s.carX) * 0.004);
        if (s.boost > 0) { c.shadowColor = '#fde047'; c.shadowBlur = 22; }
        else if (s.shield) { c.shadowColor = '#60a5fa'; c.shadowBlur = 18; }
        c.scale(1.3, 1.3);
        drawCar(c);
        c.restore();
        // Ekzos
        if (moving && s.frame % 3 === 0) {
          s.particles.burst(s.carX, CAR_Y + 30, { count: 2, color: s.boost > 0 ? '#fde047' : '#9ca3af', speed: 2, angle: Math.PI / 2, spread: 0.5, gravity: 0, life: 15 });
        }
        if (s.shield) {
          c.strokeStyle = 'rgba(96,165,250,0.7)'; c.lineWidth = 3;
          c.beginPath(); c.arc(s.carX, CAR_Y, 42, 0, Math.PI * 2); c.stroke();
        }
      }

      // HUD coins
      c.fillStyle = 'rgba(0,0,0,0.35)';
      c.beginPath(); c.roundRect(10, 14, 86, 26, 13); c.fill();
      c.font = '900 14px Nunito, sans-serif'; c.fillStyle = '#fff'; c.textAlign = 'left';
      c.fillText(`🪙 ${s.coins}`, 22, 32);
      if (s.boost > 0) { c.font = '900 13px Nunito, sans-serif'; c.fillStyle = '#fde047'; c.textAlign = 'center'; c.fillText('⚡ NITRO KEBAL!', W / 2, 32); }

      drawVignette(c, W, H);
      s.particles.update(c);
      s.pops.update(c);

      if (s.dead && s.deathSlow <= 0.05 && !gameOver) {
        setBest(saveBest('racer', Math.floor(s.distance)));
        setGameOver(true);
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [started, gameOver]);

  return (
    <ArcadeShell title="Pelumba Ceria" emoji="🏎️" score={score} tokenCount={tokenCount}>
      <div
        className="absolute inset-0 flex items-center justify-center"
        onPointerDown={(e) => {
          if (!started) { startGame(); return; }
          const rect = e.currentTarget.getBoundingClientRect();
          steer(e.clientX - rect.left < rect.width / 2 ? -1 : 1);
        }}
      >
        <canvas ref={canvasRef} width={W} height={H} className="h-full w-auto max-w-full touch-none" />
        {!started && !gameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/60 backdrop-blur-sm pointer-events-none">
            <CharacterCanvas draw={drawCar} className="mb-3 drop-shadow-2xl" />
            <p className="text-white font-black text-2xl mb-2">Pelumba Ceria</p>
            <div className="text-white/80 font-bold text-xs text-center px-6 space-y-1">
              <p>👆 Tap kiri/kanan skrin = tukar lorong</p>
              <p>🚗 Elak kereta lain · 🪙 Kutip syiling</p>
              <p>🛡️ Perisai · ⚡ Nitro kebal & rempuh!</p>
            </div>
            <div className="mt-5 px-6 py-3 rounded-full bg-amber-300 text-slate-900 font-black animate-pulse">Tap untuk Mula!</div>
          </div>
        )}
      </div>
      {gameOver && <ArcadeGameOver score={score} best={best} tokens={stateRef.current?.collected || []} onRestart={startGame} />}
    </ArcadeShell>
  );
}