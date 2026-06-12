import React, { useRef, useState, useEffect, useCallback } from 'react';
import ArcadeShell from '@/components/arcade/ArcadeShell';
import ArcadeGameOver from '@/components/arcade/ArcadeGameOver';
import { randomToken, getBest, saveBest } from '@/components/arcade/arcadeValues';
import { sfx, Particles, Shaker, Pops, skyCycle, loadImage, drawCover, drawSprite } from '@/components/arcade/engine';
import { ARCADE_ART, ARCADE_SPRITES } from '@/components/arcade/arcadeArt';

const bgImg = loadImage(ARCADE_ART.flappy);
const birdImg = loadImage(ARCADE_SPRITES.bird);

const W = 400, H = 600;
const GRAVITY = 0.42;
const FLAP_V = -7.8;
const GAP = 170;
const PIPE_W = 64;
const BIRD_X = 90;

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
    birdY: H / 2, vy: 0, wing: 0,
    pipes: [], pickups: [], collected: [],
    score: 0, coins: 0, shield: false,
    nextPipe: 0, frame: 0, dead: false, deathSlow: 1,
    cityFar: [...Array(6)].map((_, i) => ({ x: i * 80, h: 60 + Math.random() * 80 })),
    cityNear: [...Array(5)].map((_, i) => ({ x: i * 100, h: 40 + Math.random() * 60 })),
    clouds: [...Array(3)].map(() => ({ x: Math.random() * W, y: 50 + Math.random() * 150 })),
    particles: new Particles(), shaker: new Shaker(), pops: new Pops(),
  });

  const startGame = useCallback(() => {
    stateRef.current = initState();
    setScore(0); setTokenCount(0); setGameOver(false); setStarted(true);
  }, []);

  const flap = useCallback(() => {
    const s = stateRef.current;
    if (!s || s.dead) return;
    if (!started) { startGame(); }
    const st = stateRef.current;
    st.vy = FLAP_V;
    st.wing = 1;
    st.particles.burst(BIRD_X - 10, st.birdY + 15, { count: 4, color: '#bae6fd', speed: 2.5, angle: Math.PI / 2, spread: 1, gravity: 0.05 });
    sfx.jump();
  }, [started, startGame]);

  useEffect(() => {
    const onKey = (e) => { if (e.code === 'Space' || e.code === 'ArrowUp') { e.preventDefault(); flap(); } };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [flap]);

  useEffect(() => {
    if (!stateRef.current) stateRef.current = initState();
    const c = canvasRef.current.getContext('2d');

    const loop = () => {
      const s = stateRef.current;
      c.setTransform(1, 0, 0, 1, 0, 0);
      c.clearRect(0, 0, W, H);
      s.shaker.apply(c);

      // ── SKY: Pixar art + day/night tint ──
      const cycle = (s.score / 15) % 4;
      if (!drawCover(c, bgImg, W, H, s.frame * 0.6)) {
        const [skyTop, skyBot] = skyCycle(cycle);
        const grad = c.createLinearGradient(0, 0, 0, H);
        grad.addColorStop(0, skyTop); grad.addColorStop(1, skyBot);
        c.fillStyle = grad;
        c.fillRect(-20, -20, W + 40, H + 40);
      }
      const phaseF = Math.floor(cycle);
      const isNight = phaseF === 2;
      if (phaseF === 1) { c.fillStyle = 'rgba(251,146,60,0.28)'; c.fillRect(-20, -20, W + 40, H + 40); }
      if (phaseF === 2) { c.fillStyle = 'rgba(15,23,42,0.55)'; c.fillRect(-20, -20, W + 40, H + 40); }
      if (phaseF === 3) { c.fillStyle = 'rgba(240,171,252,0.22)'; c.fillRect(-20, -20, W + 40, H + 40); }
      c.font = '34px serif';
      c.fillText(isNight ? '🌙' : '☀️', 335, 65);
      if (isNight) { c.font = '10px serif'; c.fillText('✦', 80, 60); c.fillText('✦', 200, 100); c.fillText('✦', 300, 45); }

      const moving = started && !s.dead;
      const speed = (Math.min(4.5, 2.8 + s.score / 30)) * s.deathSlow;

      // ── PARALLAX CITY ──
      c.fillStyle = isNight ? 'rgba(49,46,129,0.7)' : 'rgba(148,163,184,0.45)';
      s.cityFar.forEach((b) => {
        if (moving) { b.x -= speed * 0.15; if (b.x < -80) { b.x += 480; b.h = 60 + Math.random() * 80; } }
        c.fillRect(b.x, H - 60 - b.h, 60, b.h + 60);
        // tingkap
        if (isNight) {
          c.fillStyle = 'rgba(253,224,71,0.5)';
          c.fillRect(b.x + 12, H - 40 - b.h, 8, 8);
          c.fillRect(b.x + 34, H - 60 - b.h + 35, 8, 8);
          c.fillStyle = 'rgba(49,46,129,0.7)';
        }
      });
      c.fillStyle = isNight ? 'rgba(67,56,202,0.8)' : 'rgba(100,116,139,0.5)';
      s.cityNear.forEach((b) => {
        if (moving) { b.x -= speed * 0.35; if (b.x < -90) { b.x += 500; b.h = 40 + Math.random() * 60; } }
        c.fillRect(b.x, H - 30 - b.h, 75, b.h + 30);
      });
      // Clouds
      c.font = '32px serif';
      s.clouds.forEach((cl) => {
        if (moving) { cl.x -= speed * 0.5; if (cl.x < -50) { cl.x = W + 40; cl.y = 50 + Math.random() * 150; } }
        c.globalAlpha = 0.8; c.fillText('☁️', cl.x, cl.y); c.globalAlpha = 1;
      });

      if (moving) {
        s.frame++;
        if (s.wing > 0) s.wing -= 0.1;

        // Physics
        s.vy += GRAVITY;
        s.birdY += s.vy;
        if (s.birdY > H - 15 || s.birdY < 0) {
          if (s.shield) { s.shield = false; s.vy = FLAP_V; s.pops.add(BIRD_X, s.birdY, 'Shield! 🛡️', '#2563eb', 18); sfx.powerup(); }
          else { s.dead = true; s.shaker.shake(16); sfx.die(); }
        }

        // Spawn pipes + pickups
        s.nextPipe--;
        if (s.nextPipe <= 0) {
          const topH = 70 + Math.random() * (H - GAP - 220);
          s.pipes.push({ x: W, topH, passed: false });
          const r = Math.random();
          if (r < 0.35) {
            // barisan syiling dalam gap
            for (let i = 0; i < 3; i++) s.pickups.push({ x: W + PIPE_W / 2 + (i - 1) * 30, y: topH + GAP / 2, kind: 'coin' });
          } else if (r < 0.6) {
            s.pickups.push({ x: W + PIPE_W / 2, y: topH + GAP / 2, kind: 'token', token: randomToken() });
          } else if (r < 0.7) {
            s.pickups.push({ x: W + PIPE_W / 2, y: topH + GAP / 2, kind: 'shield' });
          }
          s.nextPipe = 100;
        }

        // Pipes — move + collide + score
        s.pipes = s.pipes.filter((p) => {
          p.x -= speed;
          if (p.x < BIRD_X + 18 && p.x + PIPE_W > BIRD_X - 18) {
            if (s.birdY - 15 < p.topH || s.birdY + 15 > p.topH + GAP) {
              if (s.shield) {
                s.shield = false;
                s.pops.add(BIRD_X, s.birdY - 30, 'Shield! 🛡️', '#2563eb', 18);
                s.particles.burst(BIRD_X, s.birdY, { count: 14, color: '#60a5fa', speed: 5 });
                s.shaker.shake(8);
                sfx.powerup();
                // tolak bird ke tengah gap supaya tak mati terus
                s.birdY = p.topH + GAP / 2; s.vy = 0;
              } else {
                s.dead = true;
                s.shaker.shake(16);
                s.particles.emoji(BIRD_X, s.birdY, '💫', { count: 6, speed: 4 });
                sfx.die();
              }
            }
          }
          if (!p.passed && p.x + PIPE_W < BIRD_X) {
            p.passed = true; s.score++;
            setScore(s.score);
            s.pops.add(BIRD_X + 40, s.birdY - 30, '+1', '#16a34a', 18);
            sfx.score();
          }
          return p.x > -PIPE_W - 20;
        });

        // Pickups
        s.pickups = s.pickups.filter((t) => {
          t.x -= speed;
          if (Math.abs(t.x - BIRD_X) < 28 && Math.abs(t.y - s.birdY) < 34) {
            if (t.kind === 'coin') {
              s.coins++; s.score += 1;
              setScore(s.score);
              s.particles.burst(t.x, t.y, { count: 6, color: '#fbbf24', speed: 3 });
              s.pops.add(t.x, t.y - 15, '+1 🪙', '#d97706', 15);
              sfx.coin();
            } else if (t.kind === 'token') {
              s.collected.push(t.token);
              s.score += 3;
              setScore(s.score);
              setTokenCount(s.collected.length);
              s.particles.burst(t.x, t.y, { count: 14, color: '#34d399', speed: 4 });
              s.pops.add(t.x, t.y - 18, `${t.token.emoji} ${t.token.name}!`, '#059669', 16);
              sfx.token();
            } else {
              s.shield = true;
              s.particles.burst(t.x, t.y, { count: 16, color: '#60a5fa', speed: 5 });
              s.pops.add(t.x, t.y - 18, '🛡️ Perisai!', '#2563eb', 18);
              sfx.powerup();
            }
            return false;
          }
          return t.x > -30;
        });
      } else if (s.dead && s.deathSlow > 0.05) {
        s.deathSlow *= 0.9;
        s.vy += GRAVITY; s.birdY = Math.min(H - 15, s.birdY + s.vy);
        s.frame++;
      }

      // ── PIPES render (pokok hijau dengan shading) ──
      s.pipes.forEach((p) => {
        const pipeGrad = c.createLinearGradient(p.x, 0, p.x + PIPE_W, 0);
        pipeGrad.addColorStop(0, '#15803d');
        pipeGrad.addColorStop(0.5, '#22c55e');
        pipeGrad.addColorStop(1, '#15803d');
        c.fillStyle = pipeGrad;
        c.fillRect(p.x, 0, PIPE_W, p.topH);
        c.fillRect(p.x, p.topH + GAP, PIPE_W, H - p.topH - GAP);
        c.fillStyle = '#166534';
        c.beginPath(); c.roundRect(p.x - 6, p.topH - 24, PIPE_W + 12, 24, 6); c.fill();
        c.beginPath(); c.roundRect(p.x - 6, p.topH + GAP, PIPE_W + 12, 24, 6); c.fill();
        // daun hiasan
        c.font = '18px serif';
        c.fillText('🍃', p.x + 8, p.topH - 28);
        c.fillText('🍃', p.x + PIPE_W - 8, p.topH + GAP + 40);
      });

      // ── PICKUPS render ──
      c.textAlign = 'center';
      s.pickups.forEach((t) => {
        const bob = Math.sin((s.frame + t.x) * 0.1) * 3;
        c.save();
        c.translate(t.x, t.y + bob);
        if (t.kind === 'coin') {
          const sc = Math.abs(Math.sin((s.frame + t.x) * 0.1));
          c.scale(0.4 + sc * 0.6, 1);
          c.font = '24px serif'; c.fillText('🪙', 0, 8);
        } else if (t.kind === 'token') {
          c.shadowColor = '#34d399'; c.shadowBlur = 14;
          c.font = '28px serif'; c.fillText(t.token.emoji, 0, 9);
        } else {
          c.shadowColor = '#60a5fa'; c.shadowBlur = 16;
          c.font = '28px serif'; c.fillText('🛡️', 0, 9);
        }
        c.restore();
      });

      // ── BIRD ──
      c.save();
      c.translate(BIRD_X, s.birdY);
      c.rotate(Math.max(-0.45, Math.min(0.8, s.vy * 0.06)));
      const wingScale = 1 + s.wing * 0.25;
      c.scale(wingScale, 2 - wingScale);
      if (s.shield) { c.shadowColor = '#60a5fa'; c.shadowBlur = 20; }
      if (!drawSprite(c, birdImg, 0, 0, 58)) {
        c.font = '40px serif';
        c.fillText('🐦', 0, 12);
      }
      c.restore();
      if (s.shield) {
        c.strokeStyle = 'rgba(96,165,250,0.7)'; c.lineWidth = 3;
        c.beginPath(); c.arc(BIRD_X, s.birdY, 34 + Math.sin(s.frame * 0.15) * 3, 0, Math.PI * 2); c.stroke();
        c.fillStyle = 'rgba(96,165,250,0.1)'; c.fill();
      }

      // HUD coins
      c.fillStyle = 'rgba(0,0,0,0.3)';
      c.beginPath(); c.roundRect(10, 14, 86, 26, 13); c.fill();
      c.font = '900 14px Nunito, sans-serif'; c.fillStyle = '#fff'; c.textAlign = 'left';
      c.fillText(`🪙 ${s.coins}`, 22, 32);

      s.particles.update(c);
      s.pops.update(c);

      if (s.dead && s.deathSlow <= 0.05 && !gameOver) {
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
            <img src={ARCADE_SPRITES.bird} alt="" className="w-28 h-28 object-contain mb-3 animate-bounce drop-shadow-2xl" />
            <p className="text-white font-black text-2xl mb-2">Burung Ceria</p>
            <div className="text-white/80 font-bold text-xs text-center px-6 space-y-1">
              <p>👆 Tap = terbang · Lalu celah pokok</p>
              <p>🪙 Kutip syiling · ⭐ Nilai murni dalam gap</p>
              <p>🛡️ Perisai selamatkan anda sekali!</p>
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