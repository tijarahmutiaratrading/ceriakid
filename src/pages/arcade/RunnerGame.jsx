import React, { useRef, useState, useEffect, useCallback } from 'react';
import ArcadeShell from '@/components/arcade/ArcadeShell';
import ArcadeGameOver from '@/components/arcade/ArcadeGameOver';
import { randomToken, getBest, saveBest } from '@/components/arcade/arcadeValues';
import { sfx, Particles, Shaker, Pops, skyCycle, loadImage, drawCover, drawSprite } from '@/components/arcade/engine';
import { ARCADE_ART, ARCADE_SPRITES } from '@/components/arcade/arcadeArt';

const bgImg = loadImage(ARCADE_ART.runner);
const foxImg = loadImage(ARCADE_SPRITES.fox);

const W = 400, H = 600;
const GROUND_Y = 470;
const GRAVITY = 0.85;
const JUMP_V = -16.5;
const PLAYER_X = 70;
const OBSTACLES = [
  { emoji: '🪨', w: 30 }, { emoji: '🌵', w: 26 }, { emoji: '🪵', w: 34 }, { emoji: '🦔', w: 28 },
];
const POWERUPS = [
  { kind: 'shield', emoji: '🛡️' },
  { kind: 'magnet', emoji: '🧲' },
  { kind: 'boost', emoji: '⚡' },
];

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
    playerY: GROUND_Y, vy: 0, jumping: false, canDouble: false, flip: 0,
    squash: 1, speed: 6, distance: 0, coins: 0, combo: 0, comboTimer: 0,
    obstacles: [], pickups: [], collected: [],
    shield: false, magnet: 0, boost: 0,
    nextObstacle: 80, nextPickup: 100, frame: 0, dead: false, deathSlow: 1,
    // parallax layers
    clouds: [...Array(4)].map(() => ({ x: Math.random() * W, y: 40 + Math.random() * 120, s: 0.6 + Math.random() * 0.8 })),
    mountains: [...Array(3)].map((_, i) => ({ x: i * 180 })),
    hills: [...Array(4)].map((_, i) => ({ x: i * 140 })),
    trees: [...Array(3)].map((_, i) => ({ x: i * 200 + 80, e: ['🌳', '🌴', '🌲'][i % 3] })),
    particles: new Particles(), shaker: new Shaker(), pops: new Pops(),
  });

  const startGame = useCallback(() => {
    stateRef.current = initState();
    setScore(0); setTokenCount(0); setGameOver(false); setStarted(true);
  }, []);

  const jump = useCallback(() => {
    const s = stateRef.current;
    if (!s || s.dead) return;
    if (!started) { startGame(); return; }
    if (!s.jumping) {
      s.vy = JUMP_V; s.jumping = true; s.canDouble = true; s.squash = 1.3;
      s.particles.burst(PLAYER_X, GROUND_Y + 35, { count: 8, color: '#d6b88a', speed: 3, angle: Math.PI, spread: 1.2, gravity: 0.1 });
      sfx.jump();
    } else if (s.canDouble) {
      s.vy = JUMP_V * 0.88; s.canDouble = false; s.flip = 1;
      s.particles.burst(PLAYER_X, s.playerY + 20, { count: 10, color: '#a78bfa', speed: 3.5 });
      sfx.jump();
    }
  }, [started, startGame]);

  useEffect(() => {
    const onKey = (e) => { if (e.code === 'Space' || e.code === 'ArrowUp') { e.preventDefault(); jump(); } };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [jump]);

  useEffect(() => {
    if (!stateRef.current) stateRef.current = initState();
    const c = canvasRef.current.getContext('2d');

    const spawnCoinArc = (s) => {
      const baseY = GROUND_Y - 50 - Math.random() * 130;
      const n = 4 + Math.floor(Math.random() * 3);
      for (let i = 0; i < n; i++) {
        const arcY = baseY - Math.sin((i / (n - 1)) * Math.PI) * 45;
        s.pickups.push({ x: W + 30 + i * 38, y: arcY, kind: 'coin' });
      }
    };

    const loop = () => {
      const s = stateRef.current;
      c.setTransform(1, 0, 0, 1, 0, 0);
      c.clearRect(0, 0, W, H);
      s.shaker.apply(c);

      // ── SKY: Pixar art background + day/night tint ──
      const cycle = (s.distance / 1500) % 4;
      if (!drawCover(c, bgImg, W, H, s.distance * 2)) {
        const [skyTop, skyBot] = skyCycle(cycle);
        const grad = c.createLinearGradient(0, 0, 0, H);
        grad.addColorStop(0, skyTop); grad.addColorStop(1, skyBot);
        c.fillStyle = grad;
        c.fillRect(-20, -20, W + 40, H + 40);
      }
      const phase = Math.floor(cycle);
      const isNight = phase === 2;
      if (phase === 1) { c.fillStyle = 'rgba(251,146,60,0.28)'; c.fillRect(-20, -20, W + 40, H + 40); }
      if (phase === 2) { c.fillStyle = 'rgba(15,23,42,0.55)'; c.fillRect(-20, -20, W + 40, H + 40); }
      if (phase === 3) { c.fillStyle = 'rgba(240,171,252,0.22)'; c.fillRect(-20, -20, W + 40, H + 40); }
      c.font = '36px serif';
      c.fillText(isNight ? '🌙' : '☀️', 330, 70);
      if (isNight) { c.font = '10px serif'; c.fillText('✦', 60, 50); c.fillText('✦', 150, 90); c.fillText('✦', 250, 40); }

      const moving = started && !s.dead;
      const spd = s.speed * s.deathSlow * (s.boost > 0 ? 1.6 : 1);

      // ── PARALLAX ──
      // Clouds
      c.font = '34px serif';
      s.clouds.forEach((cl) => {
        if (moving) { cl.x -= spd * 0.25 * cl.s; if (cl.x < -50) { cl.x = W + 40; cl.y = 40 + Math.random() * 120; } }
        c.globalAlpha = 0.85;
        c.fillText('☁️', cl.x, cl.y);
        c.globalAlpha = 1;
      });
      // Trees (dekat)
      c.font = '44px serif';
      s.trees.forEach((t) => {
        if (moving) { t.x -= spd * 0.7; if (t.x < -60) t.x += 660; }
        c.fillText(t.e, t.x, GROUND_Y + 30);
      });

      // ── GROUND tiles ──
      c.fillStyle = isNight ? '#1e293b' : '#92622a';
      c.fillRect(-20, GROUND_Y + 38, W + 40, H - GROUND_Y);
      c.fillStyle = isNight ? '#334155' : '#65a30d';
      c.fillRect(-20, GROUND_Y + 38, W + 40, 12);
      // grass tufts bergerak
      c.fillStyle = isNight ? '#475569' : '#84cc16';
      const tileOff = (s.distance * 10) % 40;
      for (let x = -tileOff; x < W; x += 40) {
        c.fillRect(x, GROUND_Y + 38, 20, 5);
      }

      if (moving) {
        s.frame++;
        s.distance += spd * 0.1;
        s.speed = Math.min(13, 6 + s.distance / 250);
        if (s.boost > 0) s.boost--;
        if (s.magnet > 0) s.magnet--;
        if (s.comboTimer > 0) s.comboTimer--; else s.combo = 0;

        // Physics
        s.vy += GRAVITY;
        s.playerY += s.vy;
        if (s.flip > 0) s.flip += 0.25;
        if (s.playerY >= GROUND_Y) {
          if (s.jumping) { s.squash = 0.75; s.particles.burst(PLAYER_X, GROUND_Y + 35, { count: 5, color: '#d6b88a', speed: 2, gravity: 0.08 }); }
          s.playerY = GROUND_Y; s.vy = 0; s.jumping = false; s.flip = 0;
        }
        s.squash += (1 - s.squash) * 0.15;

        // Spawn obstacles
        s.nextObstacle--;
        if (s.nextObstacle <= 0) {
          const ob = OBSTACLES[Math.floor(Math.random() * OBSTACLES.length)];
          s.obstacles.push({ x: W + 30, ...ob });
          // kadang2 double obstacle bila laju
          if (s.speed > 9 && Math.random() < 0.3) s.obstacles.push({ x: W + 75, ...OBSTACLES[0] });
          s.nextObstacle = 65 + Math.random() * 75 - Math.min(35, s.distance / 40);
        }
        // Spawn pickups (coins arc / token / powerup)
        s.nextPickup--;
        if (s.nextPickup <= 0) {
          const r = Math.random();
          if (r < 0.55) spawnCoinArc(s);
          else if (r < 0.85) s.pickups.push({ x: W + 30, y: GROUND_Y - 60 - Math.random() * 120, kind: 'token', token: randomToken() });
          else s.pickups.push({ x: W + 30, y: GROUND_Y - 70 - Math.random() * 90, kind: 'power', power: POWERUPS[Math.floor(Math.random() * POWERUPS.length)] });
          s.nextPickup = 120 + Math.random() * 100;
        }

        // Obstacles — move + collide
        s.obstacles = s.obstacles.filter((o) => {
          o.x -= spd;
          if (Math.abs(o.x - PLAYER_X) < o.w && s.playerY > GROUND_Y - 44 && s.boost <= 0) {
            if (s.shield) {
              s.shield = false;
              s.particles.burst(o.x, GROUND_Y, { count: 16, color: '#60a5fa', speed: 5 });
              s.pops.add(PLAYER_X, s.playerY - 40, 'Shield! 🛡️', '#2563eb');
              s.shaker.shake(8);
              sfx.powerup();
              return false;
            }
            s.dead = true;
            s.shaker.shake(18);
            s.particles.emoji(PLAYER_X, s.playerY, '💫', { count: 8, speed: 4 });
            sfx.die();
          }
          return o.x > -50;
        });

        // Pickups — move + magnet + collect
        s.pickups = s.pickups.filter((p) => {
          p.x -= spd;
          if (s.magnet > 0 && p.kind === 'coin') {
            const dx = PLAYER_X - p.x, dy = s.playerY - p.y;
            const d = Math.hypot(dx, dy);
            if (d < 160) { p.x += dx / d * 7; p.y += dy / d * 7; }
          }
          const hit = Math.abs(p.x - PLAYER_X) < 32 && Math.abs(p.y - s.playerY) < 45;
          if (hit) {
            if (p.kind === 'coin') {
              s.combo++; s.comboTimer = 90;
              const mult = Math.min(5, 1 + Math.floor(s.combo / 5));
              s.coins++; s.distance += 10 * mult;
              s.particles.burst(p.x, p.y, { count: 6, color: '#fbbf24', speed: 3 });
              if (s.combo % 5 === 0) { s.pops.add(p.x, p.y - 20, `COMBO x${mult}!`, '#f59e0b', 22); sfx.combo(mult); }
              else sfx.coin();
            } else if (p.kind === 'token') {
              s.collected.push(p.token);
              s.distance += 60;
              setTokenCount(s.collected.length);
              s.particles.burst(p.x, p.y, { count: 14, color: '#34d399', speed: 4 });
              s.pops.add(p.x, p.y - 22, `${p.token.emoji} ${p.token.name}!`, '#059669', 18);
              sfx.token();
            } else {
              const pw = p.power;
              if (pw.kind === 'shield') { s.shield = true; s.pops.add(p.x, p.y - 20, '🛡️ Perisai!', '#2563eb', 20); }
              if (pw.kind === 'magnet') { s.magnet = 360; s.pops.add(p.x, p.y - 20, '🧲 Magnet!', '#dc2626', 20); }
              if (pw.kind === 'boost') { s.boost = 180; s.pops.add(p.x, p.y - 20, '⚡ Laju + Kebal!', '#d97706', 20); }
              s.particles.burst(p.x, p.y, { count: 18, color: '#a78bfa', speed: 5 });
              sfx.powerup();
            }
            return false;
          }
          return p.x > -40;
        });

        setScore(Math.floor(s.distance));
      } else if (s.dead && s.deathSlow > 0.05) {
        s.deathSlow *= 0.92; // slow-mo bila mati
        s.frame++;
      }

      // ── PICKUPS render ──
      c.textAlign = 'center';
      s.pickups.forEach((p) => {
        const bob = Math.sin((s.frame + p.x) * 0.08) * 4;
        if (p.kind === 'coin') {
          // syiling berputar (scale-x)
          const sc = Math.abs(Math.sin((s.frame + p.x) * 0.1));
          c.save(); c.translate(p.x, p.y + bob); c.scale(0.4 + sc * 0.6, 1);
          c.font = '26px serif'; c.fillText('🪙', 0, 8); c.restore();
        } else if (p.kind === 'token') {
          c.save(); c.translate(p.x, p.y + bob);
          c.shadowColor = '#34d399'; c.shadowBlur = 14;
          c.font = '30px serif'; c.fillText(p.token.emoji, 0, 8);
          c.restore();
        } else {
          c.save(); c.translate(p.x, p.y + bob);
          c.shadowColor = '#a78bfa'; c.shadowBlur = 16;
          c.font = '32px serif'; c.fillText(p.power.emoji, 0, 8);
          c.restore();
        }
      });

      // ── OBSTACLES ──
      c.font = '38px serif';
      s.obstacles.forEach((o) => c.fillText(o.emoji, o.x, GROUND_Y + 32));

      // ── PLAYER ──
      const bounce = !s.jumping && moving ? Math.abs(Math.sin(s.frame * 0.35)) * -4 : 0;
      c.save();
      c.translate(PLAYER_X, s.playerY + 28 + bounce);
      if (s.flip > 0) c.rotate(-s.flip * 1.2);
      // Boost trail
      if (s.boost > 0) { c.shadowColor = '#fbbf24'; c.shadowBlur = 25; }
      if (foxImg.complete && foxImg.naturalWidth) {
        c.scale(2 - s.squash, s.squash);
        drawSprite(c, foxImg, 0, -20, 68);
      } else {
        c.scale(-1 * (2 - s.squash), s.squash);
        c.font = '46px serif';
        c.fillText('🦊', 0, 0);
      }
      c.restore();
      // Shield bubble
      if (s.shield) {
        c.strokeStyle = 'rgba(96,165,250,0.8)'; c.lineWidth = 3;
        c.beginPath(); c.arc(PLAYER_X, s.playerY + 12, 38 + Math.sin(s.frame * 0.15) * 3, 0, Math.PI * 2); c.stroke();
        c.fillStyle = 'rgba(96,165,250,0.12)'; c.fill();
      }
      // Magnet aura
      if (s.magnet > 0) {
        c.strokeStyle = `rgba(248,113,113,${0.3 + Math.sin(s.frame * 0.3) * 0.2})`;
        c.setLineDash([6, 6]); c.lineWidth = 2;
        c.beginPath(); c.arc(PLAYER_X, s.playerY + 12, 60, 0, Math.PI * 2); c.stroke();
        c.setLineDash([]);
      }
      // Speed lines bila boost
      if (s.boost > 0 && s.frame % 3 === 0) {
        s.particles.burst(PLAYER_X - 25, s.playerY + Math.random() * 30, { count: 2, color: '#fde047', speed: 6, angle: Math.PI, spread: 0.3, gravity: 0 });
      }

      // ── HUD canvas: combo bar + coins ──
      if (moving && s.combo > 1) {
        c.fillStyle = 'rgba(0,0,0,0.35)';
        c.beginPath(); c.roundRect(W / 2 - 60, 14, 120, 26, 13); c.fill();
        c.font = '900 14px Nunito, sans-serif'; c.fillStyle = '#fde047'; c.textAlign = 'center';
        c.fillText(`🔥 Combo ${s.combo}`, W / 2, 32);
      }
      c.fillStyle = 'rgba(0,0,0,0.35)';
      c.beginPath(); c.roundRect(10, 14, 86, 26, 13); c.fill();
      c.font = '900 14px Nunito, sans-serif'; c.fillStyle = '#fff'; c.textAlign = 'left';
      c.fillText(`🪙 ${s.coins}`, 22, 32);

      s.particles.update(c);
      s.pops.update(c);

      if (s.dead && s.deathSlow <= 0.05 && !gameOver) {
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
        <canvas ref={canvasRef} width={W} height={H} className="h-full w-auto max-w-full" />
        {!started && !gameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/60 backdrop-blur-sm pointer-events-none">
            <img src={ARCADE_SPRITES.fox} alt="" className="w-28 h-28 object-contain mb-3 animate-bounce drop-shadow-2xl" />
            <p className="text-white font-black text-2xl mb-2">Lari Si Comel</p>
            <div className="text-white/80 font-bold text-xs text-center px-6 space-y-1">
              <p>👆 Tap = lompat · Tap 2x = lompat berganda</p>
              <p>🪙 Kutip syiling untuk COMBO · ⭐ Kutip nilai murni</p>
              <p>🛡️ Perisai · 🧲 Magnet · ⚡ Boost kebal!</p>
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