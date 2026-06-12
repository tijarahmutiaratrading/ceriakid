// Arcade engine — sound effects, particles, screen shake (shared semua games)

// ── SOUND (WebAudio — tiada fail audio diperlukan) ──
let audioCtx = null;
let muted = false;
const ctx = () => {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
};

const tone = (freq, dur, type = 'sine', vol = 0.15, slide = 0) => {
  if (muted) return;
  try {
    const ac = ctx();
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ac.currentTime);
    if (slide) osc.frequency.exponentialRampToValueAtTime(Math.max(40, freq + slide), ac.currentTime + dur);
    gain.gain.setValueAtTime(vol, ac.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + dur);
    osc.connect(gain).connect(ac.destination);
    osc.start();
    osc.stop(ac.currentTime + dur);
  } catch { /* audio unavailable */ }
};

export const sfx = {
  jump: () => tone(380, 0.15, 'square', 0.08, 240),
  coin: () => { tone(880, 0.08, 'square', 0.08); setTimeout(() => tone(1320, 0.12, 'square', 0.08), 60); },
  token: () => { tone(660, 0.1, 'triangle', 0.12); setTimeout(() => tone(880, 0.1, 'triangle', 0.12), 80); setTimeout(() => tone(1100, 0.15, 'triangle', 0.12), 160); },
  hit: () => tone(160, 0.3, 'sawtooth', 0.18, -100),
  powerup: () => { [520, 660, 780, 1040].forEach((f, i) => setTimeout(() => tone(f, 0.12, 'square', 0.08), i * 70)); },
  combo: (lvl) => tone(440 + lvl * 110, 0.1, 'square', 0.09),
  die: () => { tone(300, 0.2, 'sawtooth', 0.15, -150); setTimeout(() => tone(200, 0.4, 'sawtooth', 0.15, -120), 150); },
  score: () => tone(740, 0.08, 'sine', 0.08),
};

export const setMuted = (m) => { muted = m; };
export const isMuted = () => muted;

// ── PARTICLES ──
export class Particles {
  constructor() { this.list = []; }
  burst(x, y, { count = 10, color = '#fbbf24', speed = 4, size = 4, gravity = 0.15, life = 35, spread = Math.PI * 2, angle = 0 } = {}) {
    for (let i = 0; i < count; i++) {
      const a = angle + (Math.random() - 0.5) * spread;
      const v = speed * (0.4 + Math.random() * 0.6);
      this.list.push({
        x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v,
        size: size * (0.5 + Math.random() * 0.5), color, gravity,
        life, maxLife: life,
      });
    }
  }
  emoji(x, y, char, { count = 5, speed = 3, life = 40 } = {}) {
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      this.list.push({
        x, y, vx: Math.cos(a) * speed * Math.random(), vy: Math.sin(a) * speed * Math.random() - 2,
        char, gravity: 0.12, life, maxLife: life, size: 14 + Math.random() * 10,
      });
    }
  }
  update(c) {
    this.list = this.list.filter((p) => {
      p.x += p.vx; p.y += p.vy; p.vy += p.gravity; p.life--;
      const alpha = p.life / p.maxLife;
      if (p.char) {
        c.globalAlpha = alpha;
        c.font = `${p.size}px serif`;
        c.fillText(p.char, p.x, p.y);
        c.globalAlpha = 1;
      } else {
        c.fillStyle = p.color;
        c.globalAlpha = alpha;
        c.beginPath();
        c.arc(p.x, p.y, p.size * alpha, 0, Math.PI * 2);
        c.fill();
        c.globalAlpha = 1;
      }
      return p.life > 0;
    });
  }
}

// ── SCREEN SHAKE ──
export class Shaker {
  constructor() { this.mag = 0; }
  shake(m) { this.mag = Math.max(this.mag, m); }
  apply(c) {
    if (this.mag > 0.3) {
      c.translate((Math.random() - 0.5) * this.mag, (Math.random() - 0.5) * this.mag);
      this.mag *= 0.88;
    } else this.mag = 0;
  }
}

// ── FLOATING TEXT POPS ──
export class Pops {
  constructor() { this.list = []; }
  add(x, y, text, color = '#7c3aed', size = 20) {
    this.list.push({ x, y, text, color, size, t: 40 });
  }
  update(c) {
    this.list = this.list.filter((p) => {
      p.t--; p.y -= 1.4;
      c.font = `900 ${p.size}px Nunito, sans-serif`;
      c.fillStyle = p.color;
      c.globalAlpha = Math.min(1, p.t / 20);
      c.textAlign = 'center';
      c.strokeStyle = 'rgba(255,255,255,0.8)';
      c.lineWidth = 3;
      c.strokeText(p.text, p.x, p.y);
      c.fillText(p.text, p.x, p.y);
      c.globalAlpha = 1;
      return p.t > 0;
    });
  }
}

// ── BACKGROUND IMAGE (Pixar art) ──
const imgCache = {};
export const loadImage = (url) => {
  if (!imgCache[url]) {
    const i = new Image();
    i.crossOrigin = 'anonymous';
    i.src = url;
    imgCache[url] = i;
  }
  return imgCache[url];
};

// Lukis gambar cover penuh canvas dengan parallax offset (ping-pong supaya tiada seam)
export const drawCover = (c, img, w, h, offX = 0) => {
  if (!img?.complete || !img.naturalWidth) return false;
  const scale = Math.max((w * 1.4) / img.naturalWidth, h / img.naturalHeight);
  const dw = img.naturalWidth * scale, dh = img.naturalHeight * scale;
  const maxOff = Math.max(0, dw - w);
  let ox = maxOff ? Math.abs(offX) % (maxOff * 2) : 0;
  if (ox > maxOff) ox = maxOff * 2 - ox;
  c.drawImage(img, -ox, (h - dh) / 2, dw, dh);
  return true;
};

// Lerp warna langit ikut progress (day → sunset → night → day)
export const skyCycle = (t) => {
  const phases = [
    ['#7dd3fc', '#e0f2fe'], // siang
    ['#fb923c', '#fde68a'], // senja
    ['#1e1b4b', '#4c1d95'], // malam
    ['#f0abfc', '#bae6fd'], // subuh
  ];
  const idx = Math.floor(t) % 4;
  return phases[idx];
};