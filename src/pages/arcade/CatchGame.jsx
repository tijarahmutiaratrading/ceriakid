import React, { useRef, useState, useEffect, useCallback } from 'react';
import ArcadeShell from '@/components/arcade/ArcadeShell';
import ArcadeGameOver from '@/components/arcade/ArcadeGameOver';
import { randomToken, getBest, saveBest } from '@/components/arcade/arcadeValues';
import { sfx, Particles, Shaker, Pops, loadImage, drawCover, initHiDPI } from '@/components/arcade/engine';
import { ARCADE_ART } from '@/components/arcade/arcadeArt';
import { drawBasket } from '@/components/arcade/characters';
import CharacterCanvas from '@/components/arcade/CharacterCanvas';
import { drawFruit, drawTokenBadge, drawPowerBadge, drawBomb, drawTrash, drawSun, drawVignette } from '@/components/arcade/props';

const bgImg = loadImage(ARCADE_ART.catch);

const W = 400, H = 600;
const GOOD = ['apple', 'banana', 'book', 'milk', 'orange', 'pencil', 'grape', 'ball'];
const BAD = ['trash', 'bomb'];
const POWERUPS = [
  { kind: 'slow', emoji: '⏰' },
  { kind: 'life', emoji: '❤️' },
  { kind: 'star', emoji: '🌟' },
];

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
    basketX: W / 2, targetX: W / 2, tilt: 0,
    items: [], collected: [], score: 0, lives: 3, level: 1,
    combo: 0, fever: 0, slow: 0, star: 0,
    nextItem: 40, frame: 0, dead: false, levelBanner: 0,
    bgBubbles: [...Array(8)].map(() => ({ x: Math.random() * W, y: Math.random() * H, r: 8 + Math.random() * 22, v: 0.3 + Math.random() * 0.5 })),
    particles: new Particles(), shaker: new Shaker(), pops: new Pops(),
  });

  const startGame = useCallback(() => {
    stateRef.current = initState();
    setScore(0); setLives(3); setTokenCount(0); setGameOver(false); setStarted(true);
  }, []);

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
      if (e.code === 'ArrowLeft') s.targetX = Math.max(40, s.targetX - 60);
      if (e.code === 'ArrowRight') s.targetX = Math.min(W - 40, s.targetX + 60);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
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

      // ── BACKGROUND: Pixar art + fever rainbow overlay ──
      if (!drawCover(c, bgImg, W, H, s.frame * 0.15)) {
        const grad = c.createLinearGradient(0, 0, 0, H);
        grad.addColorStop(0, '#fbcfe8'); grad.addColorStop(1, '#fef9c3');
        c.fillStyle = grad;
        c.fillRect(-20, -20, W + 40, H + 40);
      }
      if (s.fever > 0) {
        const hue = (s.frame * 3) % 360;
        c.fillStyle = `hsla(${hue}, 90%, 70%, 0.32)`;
        c.fillRect(-20, -20, W + 40, H + 40);
      }

      // Bubbles latar
      s.bgBubbles.forEach((b) => {
        b.y -= b.v;
        if (b.y < -30) { b.y = H + 30; b.x = Math.random() * W; }
        c.fillStyle = 'rgba(255,255,255,0.25)';
        c.beginPath(); c.arc(b.x, b.y, b.r, 0, Math.PI * 2); c.fill();
      });
      c.save(); c.translate(345, 50); drawSun(c, 15, s.frame); c.restore();

      const moving = started && !s.dead;
      const slowMult = s.slow > 0 ? 0.45 : 1;

      if (moving) {
        s.frame++;
        if (s.fever > 0) s.fever--;
        if (s.slow > 0) s.slow--;
        if (s.star > 0) s.star--;
        if (s.levelBanner > 0) s.levelBanner--;

        const newLevel = 1 + Math.floor(s.score / 150);
        if (newLevel > s.level) {
          s.level = newLevel; s.levelBanner = 90;
          s.pops.add(W / 2, 200, `LEVEL ${s.level}! 🚀`, '#7c3aed', 30);
          sfx.powerup();
        }

        const fallSpeed = (2.5 + s.level * 0.7) * slowMult;

        // Smooth basket + tilt
        const dx = s.targetX - s.basketX;
        s.basketX += dx * 0.25;
        s.tilt = Math.max(-0.3, Math.min(0.3, dx * 0.01));

        // Spawn
        s.nextItem--;
        if (s.nextItem <= 0) {
          const r = Math.random();
          let item;
          if (r < 0.1) item = { kind: 'token', token: randomToken() };
          else if (r < 0.16) item = { kind: 'power', power: POWERUPS[Math.floor(Math.random() * POWERUPS.length)] };
          else if (r < 0.68) item = { kind: 'good', fruit: GOOD[Math.floor(Math.random() * GOOD.length)] };
          else item = { kind: 'bad', bad: BAD[Math.floor(Math.random() * BAD.length)] };
          s.items.push({ ...item, x: 40 + Math.random() * (W - 80), y: -25, wobble: Math.random() * Math.PI * 2, spin: 0 });
          s.nextItem = Math.max(14, 42 - s.level * 3);
        }

        // Move + catch
        s.items = s.items.filter((it) => {
          it.y += fallSpeed + (it.kind === 'bad' ? 1 : 0);
          it.x += Math.sin(it.wobble + s.frame * 0.05) * 0.9;
          it.spin += 0.05;
          // Star power: magnet semua item baik
          if (s.star > 0 && it.kind !== 'bad') {
            const ddx = s.basketX - it.x, ddy = 535 - it.y;
            const d = Math.hypot(ddx, ddy);
            if (d < 220) { it.x += ddx / d * 5; it.y += ddy / d * 3; }
          }

          if (it.y > 505 && it.y < 565 && Math.abs(it.x - s.basketX) < 50) {
            if (it.kind === 'bad') {
              if (s.star > 0) {
                // Star = kebal, musnahkan
                s.particles.burst(it.x, 530, { count: 10, color: '#fde047', speed: 4 });
                s.pops.add(it.x, 510, 'ZAP! ⚡', '#d97706', 18);
                sfx.coin();
                return false;
              }
              s.lives--; s.combo = 0; s.fever = 0;
              setLives(s.lives);
              s.particles.burst(it.x, 530, { count: 16, color: '#ef4444', speed: 5 });
              s.pops.add(it.x, 505, 'Aduh! 💥', '#dc2626', 22);
              s.shaker.shake(14);
              sfx.hit();
              if (s.lives <= 0) { s.dead = true; sfx.die(); }
            } else if (it.kind === 'token') {
              s.collected.push(it.token);
              s.score += 30;
              setTokenCount(s.collected.length);
              s.particles.burst(it.x, 530, { count: 14, color: '#34d399', speed: 4 });
              s.pops.add(it.x, 500, `${it.token.emoji} ${it.token.name}!`, '#059669', 17);
              sfx.token();
            } else if (it.kind === 'power') {
              const pw = it.power;
              if (pw.kind === 'slow') { s.slow = 300; s.pops.add(it.x, 500, '⏰ Masa Perlahan!', '#0891b2', 18); }
              if (pw.kind === 'life') { s.lives = Math.min(3, s.lives + 1); setLives(s.lives); s.pops.add(it.x, 500, '❤️ +1 Nyawa!', '#dc2626', 18); }
              if (pw.kind === 'star') { s.star = 300; s.pops.add(it.x, 500, '🌟 Super Star!', '#d97706', 18); }
              s.particles.burst(it.x, 530, { count: 18, color: '#a78bfa', speed: 5 });
              sfx.powerup();
            } else {
              s.combo++;
              const mult = s.fever > 0 ? 2 : 1;
              const pts = 10 * mult;
              s.score += pts;
              s.particles.burst(it.x, 530, { count: 7, color: s.fever > 0 ? '#f0abfc' : '#fbbf24', speed: 3.5 });
              s.pops.add(it.x, 505, `+${pts}`, s.fever > 0 ? '#c026d3' : '#7c3aed', 18);
              if (s.combo > 0 && s.combo % 8 === 0) {
                s.fever = 360;
                s.pops.add(W / 2, 250, 'FEVER MODE! 🔥✨', '#db2777', 28);
                sfx.powerup();
              } else sfx.coin();
            }
            setScore(s.score);
            return false;
          }
          if (it.y > H + 30 && it.kind === 'good') s.combo = 0; // terlepas = combo reset
          return it.y < H + 30;
        });
      }

      // ── ITEMS render ──
      c.textAlign = 'center';
      s.items.forEach((it) => {
        c.save();
        c.translate(it.x, it.y);
        if (it.kind === 'bad') {
          c.rotate(Math.sin(it.spin * 3) * 0.3);
          (it.bad === 'bomb' ? drawBomb : drawTrash)(c, s.frame);
        } else if (it.kind === 'token') {
          drawTokenBadge(c, it.token.emoji, s.frame + it.x);
        } else if (it.kind === 'power') {
          drawPowerBadge(c, it.power.kind, s.frame + it.x, 15);
        } else {
          c.rotate(Math.sin(it.spin) * 0.2);
          c.scale(1.25, 1.25);
          drawFruit(c, it.fruit);
        }
        c.restore();
      });

      // ── BASKET ──
      c.save();
      c.translate(s.basketX, 545);
      c.rotate(s.tilt);
      if (s.star > 0) { c.shadowColor = '#fde047'; c.shadowBlur = 25; }
      c.translate(0, -28);
      c.scale(1.35, 1.35);
      drawBasket(c);
      c.restore();
      if (s.star > 0) {
        c.strokeStyle = `rgba(253,224,71,${0.4 + Math.sin(s.frame * 0.3) * 0.3})`;
        c.lineWidth = 3;
        c.beginPath(); c.arc(s.basketX, 530, 50, 0, Math.PI * 2); c.stroke();
      }

      // ── HUD: combo + level ──
      if (s.combo > 2) {
        c.fillStyle = 'rgba(0,0,0,0.3)';
        c.beginPath(); c.roundRect(W / 2 - 65, 14, 130, 26, 13); c.fill();
        c.font = '900 14px Nunito, sans-serif'; c.fillStyle = s.fever > 0 ? '#f0abfc' : '#fde047'; c.textAlign = 'center';
        c.fillText(s.fever > 0 ? `🔥 FEVER x2!` : `🔥 Combo ${s.combo}`, W / 2, 32);
      }
      c.fillStyle = 'rgba(0,0,0,0.3)';
      c.beginPath(); c.roundRect(10, 14, 80, 26, 13); c.fill();
      c.font = '900 13px Nunito, sans-serif'; c.fillStyle = '#fff'; c.textAlign = 'left';
      c.fillText(`Lvl ${s.level}`, 24, 32);
      if (s.slow > 0) { c.font = '20px serif'; c.fillText('⏰', W - 40, 34); }

      drawVignette(c, W, H);
      s.particles.update(c);
      s.pops.update(c);

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
            <CharacterCanvas draw={drawBasket} className="mb-3 drop-shadow-2xl" />
            <p className="text-white font-black text-2xl mb-2">Tangkap Ceria</p>
            <div className="text-white/80 font-bold text-xs text-center px-6 space-y-1">
              <p>👆 Gerakkan jari = gerak bakul</p>
              <p>🍎 Tangkap 8 berturut = FEVER x2! 🔥</p>
              <p>⏰ Slow · ❤️ Nyawa · 🌟 Super Star kebal!</p>
            </div>
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