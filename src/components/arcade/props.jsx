// Props arcade — semua objek game dilukis vektor 3D-style (ganti emoji)
// Semua fungsi berpusat di (0,0)

const E = (c, x, y, rx, ry, rot = 0) => { c.beginPath(); c.ellipse(x, y, rx, ry, rot, 0, Math.PI * 2); };
const rg3 = (c, x, y, r, lit, mid, dark) => {
  const g = c.createRadialGradient(x - r * 0.4, y - r * 0.45, r * 0.08, x, y, r * 1.2);
  g.addColorStop(0, lit); g.addColorStop(0.55, mid); g.addColorStop(1, dark);
  return g;
};
const gloss = (c, x, y, rx, ry, rot = -0.5, a = 0.5) => {
  const g = c.createRadialGradient(x, y, 0, x, y, Math.max(rx, ry) * 1.4);
  g.addColorStop(0, `rgba(255,255,255,${a})`); g.addColorStop(1, 'rgba(255,255,255,0)');
  E(c, x, y, rx, ry, rot); c.fillStyle = g; c.fill();
};
const starPath = (c, r) => {
  c.beginPath();
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const rr = i % 2 ? r * 0.45 : r;
    if (i === 0) c.moveTo(Math.cos(a) * rr, Math.sin(a) * rr);
    else c.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
  }
  c.closePath();
};

// ── VIGNETTE — kedalaman sinematik pada setiap scene ──
export const drawVignette = (c, w, h) => {
  const g = c.createRadialGradient(w / 2, h / 2, h * 0.36, w / 2, h / 2, h * 0.78);
  g.addColorStop(0, 'rgba(0,0,0,0)');
  g.addColorStop(1, 'rgba(2,6,23,0.34)');
  c.fillStyle = g;
  c.fillRect(-30, -30, w + 60, h + 60);
};

// ── COIN emas berputar 3D ──
export const drawCoin = (c, f = 0, r = 11) => {
  const sq = 0.32 + Math.abs(Math.sin(f * 0.09)) * 0.68;
  c.save();
  c.scale(sq, 1);
  E(c, 0, 0, r, r);
  c.fillStyle = rg3(c, 0, -r * 0.3, r, '#fff7c2', '#fbbf24', '#9a5b07'); c.fill();
  c.strokeStyle = '#854d0e'; c.lineWidth = r * 0.16; c.stroke();
  E(c, 0, 0, r * 0.66, r * 0.66);
  c.strokeStyle = 'rgba(133,77,14,0.55)'; c.lineWidth = r * 0.1; c.stroke();
  starPath(c, r * 0.42);
  c.fillStyle = '#a16207'; c.fill();
  gloss(c, -r * 0.32, -r * 0.4, r * 0.4, r * 0.22, -0.6, 0.7);
  c.restore();
};

// ── TOKEN nilai murni — lencana emas bercahaya dengan emoji nilai ──
export const drawTokenBadge = (c, emoji, f = 0, r = 16) => {
  const pulse = 1 + Math.sin(f * 0.12) * 0.06;
  c.save();
  c.scale(pulse, pulse);
  const glow = c.createRadialGradient(0, 0, r * 0.4, 0, 0, r * 1.7);
  glow.addColorStop(0, 'rgba(52,211,153,0.45)'); glow.addColorStop(1, 'rgba(52,211,153,0)');
  E(c, 0, 0, r * 1.7, r * 1.7); c.fillStyle = glow; c.fill();
  E(c, 0, 0, r, r);
  c.fillStyle = rg3(c, 0, -r * 0.3, r, '#fef3c7', '#f59e0b', '#92400e'); c.fill();
  c.strokeStyle = '#78350f'; c.lineWidth = 1.6; c.stroke();
  E(c, 0, 0, r * 0.76, r * 0.76);
  c.fillStyle = rg3(c, 0, -r * 0.2, r * 0.76, '#ffffff', '#fef9c3', '#fcd34d'); c.fill();
  c.font = `${Math.round(r * 1.0)}px serif`; c.textAlign = 'center'; c.textBaseline = 'middle';
  c.fillText(emoji, 0, r * 0.08);
  c.textBaseline = 'alphabetic';
  gloss(c, -r * 0.35, -r * 0.45, r * 0.42, r * 0.2, -0.5, 0.6);
  c.restore();
};

// ── POWER-UP badge berkilat (shield/magnet/bolt/clock/heart/star/wide) ──
const POWER_BG = {
  shield: ['#bfdbfe', '#3b82f6', '#1e3a8a'],
  magnet: ['#fecaca', '#ef4444', '#7f1d1d'],
  boost: ['#fde68a', '#f59e0b', '#92400e'],
  bolt: ['#fde68a', '#f59e0b', '#92400e'],
  slow: ['#a5f3fc', '#06b6d4', '#155e75'],
  life: ['#fbcfe8', '#ec4899', '#831843'],
  star: ['#fef08a', '#eab308', '#854d0e'],
  wide: ['#ddd6fe', '#8b5cf6', '#4c1d95'],
};
export const drawPowerBadge = (c, kind, f = 0, r = 14) => {
  const [lit, mid, dark] = POWER_BG[kind] || POWER_BG.star;
  const pulse = 1 + Math.sin(f * 0.15) * 0.07;
  c.save();
  c.scale(pulse, pulse);
  const glow = c.createRadialGradient(0, 0, r * 0.4, 0, 0, r * 1.8);
  glow.addColorStop(0, `${mid}66`); glow.addColorStop(1, `${mid}00`);
  E(c, 0, 0, r * 1.8, r * 1.8); c.fillStyle = glow; c.fill();
  E(c, 0, 0, r, r);
  c.fillStyle = rg3(c, 0, -r * 0.3, r, lit, mid, dark); c.fill();
  c.strokeStyle = 'rgba(255,255,255,0.7)'; c.lineWidth = 1.6; c.stroke();
  // Ikon
  c.fillStyle = '#ffffff'; c.strokeStyle = '#ffffff';
  if (kind === 'shield') {
    c.beginPath(); c.moveTo(0, -7); c.quadraticCurveTo(6.5, -5.5, 6, -1);
    c.quadraticCurveTo(5.5, 4.5, 0, 7.5); c.quadraticCurveTo(-5.5, 4.5, -6, -1);
    c.quadraticCurveTo(-6.5, -5.5, 0, -7); c.fill();
    c.strokeStyle = mid; c.lineWidth = 1.4;
    c.beginPath(); c.moveTo(0, -5.5); c.lineTo(0, 5.5); c.stroke();
  } else if (kind === 'magnet') {
    c.lineWidth = 4; c.lineCap = 'butt';
    c.beginPath(); c.arc(0, -1, 5, Math.PI, 0); c.stroke();
    c.fillRect(-7, -1, 4, 6); c.fillRect(3, -1, 4, 6);
    c.fillStyle = dark; c.fillRect(-7, 3, 4, 3); c.fillRect(3, 3, 4, 3);
  } else if (kind === 'boost' || kind === 'bolt') {
    c.beginPath(); c.moveTo(2, -8); c.lineTo(-4.5, 1); c.lineTo(-0.5, 1);
    c.lineTo(-2, 8); c.lineTo(4.5, -1.5); c.lineTo(0.5, -1.5); c.closePath(); c.fill();
  } else if (kind === 'slow') {
    E(c, 0, 0, 6.2, 6.2); c.lineWidth = 2; c.stroke();
    c.lineWidth = 1.8; c.lineCap = 'round';
    c.beginPath(); c.moveTo(0, 0); c.lineTo(0, -4); c.stroke();
    c.beginPath(); c.moveTo(0, 0); c.lineTo(3, 1.5); c.stroke();
  } else if (kind === 'life') {
    c.beginPath(); c.moveTo(0, 6);
    c.bezierCurveTo(-8, -1, -4.5, -7.5, 0, -3);
    c.bezierCurveTo(4.5, -7.5, 8, -1, 0, 6); c.fill();
  } else if (kind === 'star') {
    starPath(c, 7); c.fill();
  } else if (kind === 'wide') {
    c.lineWidth = 2.4; c.lineCap = 'round';
    c.beginPath(); c.moveTo(-6.5, 0); c.lineTo(6.5, 0); c.stroke();
    c.beginPath(); c.moveTo(-4, -3.2); c.lineTo(-7, 0); c.lineTo(-4, 3.2); c.stroke();
    c.beginPath(); c.moveTo(4, -3.2); c.lineTo(7, 0); c.lineTo(4, 3.2); c.stroke();
  }
  gloss(c, -r * 0.35, -r * 0.45, r * 0.45, r * 0.22, -0.5, 0.55);
  c.restore();
};

// ── HALANGAN runner ──
export const drawRock = (c) => {
  c.beginPath();
  c.moveTo(-16, 12); c.lineTo(-14, -4); c.lineTo(-5, -13); c.lineTo(7, -11);
  c.lineTo(15, -2); c.lineTo(16, 12); c.closePath();
  c.fillStyle = rg3(c, -3, -6, 17, '#cbd5e1', '#64748b', '#1e293b'); c.fill();
  c.strokeStyle = 'rgba(15,23,42,0.45)'; c.lineWidth = 1.4; c.stroke();
  c.strokeStyle = 'rgba(15,23,42,0.3)'; c.lineWidth = 1;
  c.beginPath(); c.moveTo(-6, -10); c.lineTo(-2, -2); c.lineTo(-6, 6); c.stroke();
  c.beginPath(); c.moveTo(6, -8); c.lineTo(9, 2); c.stroke();
  gloss(c, -7, -8, 5, 2.5, -0.4, 0.4);
};
export const drawCactus = (c) => {
  const g = rg3(c, -2, -6, 16, '#86efac', '#16a34a', '#14532d');
  c.fillStyle = g;
  c.beginPath(); c.roundRect(-5, -16, 10, 30, 5); c.fill();
  c.beginPath(); c.roundRect(-15, -8, 8, 5, 2.5); c.fill();
  c.beginPath(); c.roundRect(-15, -14, 5, 11, 2.5); c.fill();
  c.beginPath(); c.roundRect(7, -4, 8, 5, 2.5); c.fill();
  c.beginPath(); c.roundRect(10, -11, 5, 12, 2.5); c.fill();
  c.strokeStyle = 'rgba(20,83,45,0.5)'; c.lineWidth = 1.2;
  c.beginPath(); c.roundRect(-5, -16, 10, 30, 5); c.stroke();
  c.strokeStyle = 'rgba(20,83,45,0.4)'; c.lineWidth = 1;
  c.beginPath(); c.moveTo(0, -13); c.lineTo(0, 11); c.stroke();
  c.fillStyle = 'rgba(255,255,255,0.7)';
  [[-3, -10], [3, -5], [-2, 2], [3, 7]].forEach(([x, y]) => { E(c, x, y, 0.8, 0.8); c.fill(); });
  E(c, 0, -17, 3, 2.4);
  c.fillStyle = rg3(c, 0, -18, 3, '#fbcfe8', '#ec4899', '#9d174d'); c.fill();
  gloss(c, -2.5, -10, 1.6, 6, 0.05, 0.45);
};
export const drawLog = (c) => {
  const g = c.createLinearGradient(0, -9, 0, 11);
  g.addColorStop(0, '#a16207'); g.addColorStop(0.45, '#854d0e'); g.addColorStop(1, '#3f2306');
  c.fillStyle = g;
  c.beginPath(); c.roundRect(-17, -9, 34, 20, 9); c.fill();
  c.strokeStyle = 'rgba(63,35,6,0.6)'; c.lineWidth = 1.2; c.stroke();
  E(c, 13, 1, 6, 9.5);
  c.fillStyle = rg3(c, 12, -1, 8, '#fde68a', '#d6a44a', '#92610a'); c.fill();
  c.strokeStyle = 'rgba(120,53,15,0.7)'; c.lineWidth = 1;
  E(c, 13, 1, 3.5, 6); c.stroke();
  E(c, 13, 1, 1.4, 2.6); c.fillStyle = '#92610a'; c.fill();
  c.strokeStyle = 'rgba(63,35,6,0.45)';
  c.beginPath(); c.moveTo(-15, -3); c.lineTo(4, -3); c.stroke();
  c.beginPath(); c.moveTo(-14, 4); c.lineTo(2, 4); c.stroke();
  gloss(c, -6, -6, 8, 2, 0.04, 0.3);
};
export const drawSpikeBall = (c, f = 0) => {
  c.save();
  c.rotate(f * 0.04);
  c.fillStyle = '#334155';
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4;
    c.save(); c.rotate(a);
    c.beginPath(); c.moveTo(-3.5, -10); c.lineTo(0, -17); c.lineTo(3.5, -10); c.closePath(); c.fill();
    c.restore();
  }
  E(c, 0, 0, 11, 11);
  c.fillStyle = rg3(c, 0, -3, 11, '#94a3b8', '#475569', '#0f172a'); c.fill();
  c.strokeStyle = 'rgba(15,23,42,0.6)'; c.lineWidth = 1.2; c.stroke();
  gloss(c, -3.5, -4, 3.5, 2, -0.5, 0.5);
  c.restore();
};

// ── ALAM ──
export const drawCloudProp = (c, scale = 1, a = 0.92) => {
  c.save();
  c.scale(scale, scale);
  c.globalAlpha = a;
  const blob = (x, y, r) => {
    E(c, x, y, r, r * 0.82);
    c.fillStyle = rg3(c, x, y - r * 0.4, r, '#ffffff', '#f1f5f9', '#cbd5e1'); c.fill();
  };
  blob(-13, 2, 9); blob(13, 2, 9); blob(0, -3, 12); blob(0, 4, 11);
  c.globalAlpha = a * 0.9;
  gloss(c, -4, -6, 8, 3.5, -0.15, 0.8);
  c.restore();
};
export const drawSun = (c, r = 17, f = 0) => {
  const glow = c.createRadialGradient(0, 0, r * 0.3, 0, 0, r * 2.4);
  glow.addColorStop(0, 'rgba(253,224,71,0.7)'); glow.addColorStop(1, 'rgba(253,224,71,0)');
  E(c, 0, 0, r * 2.4, r * 2.4); c.fillStyle = glow; c.fill();
  c.save(); c.rotate(f * 0.005);
  c.fillStyle = 'rgba(251,191,36,0.8)';
  for (let i = 0; i < 8; i++) {
    c.save(); c.rotate((i * Math.PI) / 4);
    c.beginPath(); c.moveTo(-2.5, -r - 2); c.lineTo(0, -r - 8); c.lineTo(2.5, -r - 2); c.closePath(); c.fill();
    c.restore();
  }
  c.restore();
  E(c, 0, 0, r, r);
  c.fillStyle = rg3(c, 0, -r * 0.3, r, '#fefce8', '#fde047', '#f59e0b'); c.fill();
  gloss(c, -r * 0.3, -r * 0.35, r * 0.4, r * 0.22, -0.5, 0.6);
};
export const drawMoon = (c, r = 15) => {
  const glow = c.createRadialGradient(0, 0, r * 0.3, 0, 0, r * 2.2);
  glow.addColorStop(0, 'rgba(226,232,240,0.5)'); glow.addColorStop(1, 'rgba(226,232,240,0)');
  E(c, 0, 0, r * 2.2, r * 2.2); c.fillStyle = glow; c.fill();
  E(c, 0, 0, r, r);
  c.fillStyle = rg3(c, 0, -r * 0.3, r, '#f8fafc', '#cbd5e1', '#64748b'); c.fill();
  c.fillStyle = 'rgba(100,116,139,0.4)';
  [[-4, -3, 3], [4, 2, 2.2], [-1, 6, 1.8], [6, -5, 1.6]].forEach(([x, y, rr]) => { E(c, x, y, rr, rr); c.fill(); });
  gloss(c, -r * 0.3, -r * 0.35, r * 0.4, r * 0.22, -0.5, 0.5);
};
export const drawTreeProp = (c, scale = 1) => {
  c.save();
  c.scale(scale, scale);
  E(c, 0, 26, 16, 3.5); c.fillStyle = 'rgba(15,23,42,0.18)'; c.fill();
  const tg = c.createLinearGradient(-4, 0, 4, 0);
  tg.addColorStop(0, '#92400e'); tg.addColorStop(0.5, '#713f12'); tg.addColorStop(1, '#451a03');
  c.fillStyle = tg;
  c.beginPath(); c.roundRect(-3.5, 6, 7, 20, 3); c.fill();
  const leaf = (x, y, r) => {
    E(c, x, y, r, r * 0.92);
    c.fillStyle = rg3(c, x - r * 0.2, y - r * 0.4, r, '#86efac', '#22c55e', '#14532d'); c.fill();
  };
  leaf(-9, -2, 10); leaf(9, -2, 10); leaf(0, -12, 12); leaf(0, 2, 11);
  gloss(c, -4, -14, 7, 3.5, -0.2, 0.4);
  c.restore();
};
export const drawPlanet = (c, r = 13, ringed = true) => {
  E(c, 0, 0, r, r);
  c.fillStyle = rg3(c, 0, -r * 0.3, r, ringed ? '#fed7aa' : '#bae6fd', ringed ? '#f97316' : '#0ea5e9', ringed ? '#7c2d12' : '#075985');
  c.fill();
  if (!ringed) {
    c.fillStyle = 'rgba(34,197,94,0.75)';
    E(c, -3, -2, 5, 3.5, 0.4); c.fill();
    E(c, 5, 4, 3.5, 2.5, -0.3); c.fill();
  }
  gloss(c, -r * 0.3, -r * 0.35, r * 0.4, r * 0.22, -0.5, 0.5);
  if (ringed) {
    c.save();
    c.rotate(-0.35);
    c.strokeStyle = 'rgba(253,230,138,0.85)'; c.lineWidth = 3;
    c.beginPath(); c.ellipse(0, 0, r * 1.65, r * 0.5, 0, 0, Math.PI * 2); c.stroke();
    c.strokeStyle = 'rgba(217,119,6,0.5)'; c.lineWidth = 1.4;
    c.beginPath(); c.ellipse(0, 0, r * 1.95, r * 0.62, 0, 0, Math.PI * 2); c.stroke();
    c.restore();
  }
};
export const drawAsteroidProp = (c, size = 34) => {
  const r = size / 2;
  const pts = [[1, 0], [0.7, 0.66], [0.05, 0.95], [-0.65, 0.7], [-0.98, 0.05], [-0.7, -0.62], [-0.08, -1], [0.68, -0.72]];
  c.beginPath();
  pts.forEach(([x, y], i) => { const v = 0.88 + (i % 3) * 0.09; (i ? c.lineTo : c.moveTo).call(c, x * r * v, y * r * v); });
  c.closePath();
  c.fillStyle = rg3(c, 0, -r * 0.3, r, '#a8a29e', '#57534e', '#1c1917'); c.fill();
  c.strokeStyle = 'rgba(12,10,9,0.55)'; c.lineWidth = 1.4; c.stroke();
  c.fillStyle = 'rgba(12,10,9,0.4)';
  [[-r * 0.3, -r * 0.2, r * 0.2], [r * 0.3, r * 0.25, r * 0.16], [0, r * 0.45, r * 0.12]].forEach(([x, y, rr]) => { E(c, x, y, rr, rr * 0.8); c.fill(); });
  gloss(c, -r * 0.35, -r * 0.4, r * 0.32, r * 0.16, -0.4, 0.35);
};
export const drawStarProp = (c, r = 12, f = 0) => {
  const glow = c.createRadialGradient(0, 0, r * 0.3, 0, 0, r * 1.9);
  glow.addColorStop(0, 'rgba(253,224,71,0.55)'); glow.addColorStop(1, 'rgba(253,224,71,0)');
  E(c, 0, 0, r * 1.9, r * 1.9); c.fillStyle = glow; c.fill();
  c.save();
  c.rotate(Math.sin(f * 0.06) * 0.18);
  starPath(c, r);
  c.fillStyle = rg3(c, 0, -r * 0.3, r, '#fefce8', '#facc15', '#a16207'); c.fill();
  c.strokeStyle = '#854d0e'; c.lineWidth = 1.2; c.stroke();
  gloss(c, -r * 0.25, -r * 0.3, r * 0.32, r * 0.18, -0.5, 0.6);
  c.restore();
};

// ── BAHAYA ──
export const drawBomb = (c, f = 0) => {
  E(c, 0, 3, 13, 13);
  c.fillStyle = rg3(c, -2, 0, 13, '#64748b', '#1e293b', '#020617'); c.fill();
  c.strokeStyle = 'rgba(2,6,23,0.6)'; c.lineWidth = 1.2; c.stroke();
  c.fillStyle = '#334155';
  c.beginPath(); c.roundRect(-4, -13, 8, 6, 2); c.fill();
  c.strokeStyle = '#94a3b8'; c.lineWidth = 2; c.lineCap = 'round';
  c.beginPath(); c.moveTo(0, -13); c.quadraticCurveTo(5, -19, 9, -17); c.stroke();
  const sp = 1 + Math.sin(f * 0.5) * 0.4;
  c.save(); c.translate(9, -17); c.scale(sp, sp);
  starPath(c, 4.5); c.fillStyle = '#fde047'; c.fill();
  starPath(c, 2.2); c.fillStyle = '#ffffff'; c.fill();
  c.restore();
  gloss(c, -4.5, -2, 4, 2.5, -0.5, 0.55);
};
export const drawTrash = (c) => {
  const g = c.createLinearGradient(-10, 0, 10, 0);
  g.addColorStop(0, '#475569'); g.addColorStop(0.5, '#94a3b8'); g.addColorStop(1, '#334155');
  c.fillStyle = g;
  c.beginPath(); c.moveTo(-10, -7); c.lineTo(10, -7); c.lineTo(8, 13); c.lineTo(-8, 13); c.closePath(); c.fill();
  c.strokeStyle = 'rgba(15,23,42,0.5)'; c.lineWidth = 1.1; c.stroke();
  c.strokeStyle = 'rgba(15,23,42,0.4)'; c.lineWidth = 1.4;
  [-4, 0, 4].forEach((x) => { c.beginPath(); c.moveTo(x, -4); c.lineTo(x * 0.85, 10); c.stroke(); });
  c.fillStyle = '#64748b';
  c.beginPath(); c.roundRect(-11.5, -10, 23, 4, 2); c.fill();
  c.strokeStyle = 'rgba(15,23,42,0.5)'; c.lineWidth = 1; c.stroke();
  c.fillStyle = '#64748b';
  c.beginPath(); c.roundRect(-3, -13, 6, 3.5, 1.5); c.fill();
  gloss(c, -5, -2, 2.5, 6, 0.06, 0.35);
};

// ── BUAH & ITEM (Tangkap Ceria / Ular) ──
export const drawFruit = (c, kind) => {
  if (kind === 'apple') {
    E(c, -4, 2, 8.5, 9); c.fillStyle = rg3(c, -6, -1, 9, '#fca5a5', '#dc2626', '#7f1d1d'); c.fill();
    E(c, 4, 2, 8.5, 9); c.fillStyle = rg3(c, 2, -1, 9, '#f87171', '#dc2626', '#7f1d1d'); c.fill();
    c.strokeStyle = '#713f12'; c.lineWidth = 2; c.lineCap = 'round';
    c.beginPath(); c.moveTo(0, -6); c.quadraticCurveTo(1, -11, 3, -13); c.stroke();
    E(c, 6, -11, 4.5, 2.2, 0.5); c.fillStyle = rg3(c, 5, -12, 4, '#86efac', '#16a34a', '#14532d'); c.fill();
    gloss(c, -6, -2, 3, 4, 0.2, 0.55);
  } else if (kind === 'banana') {
    c.fillStyle = rg3(c, 0, -4, 14, '#fef9c3', '#facc15', '#a16207');
    c.beginPath(); c.moveTo(-12, -6);
    c.quadraticCurveTo(-2, 11, 12, 4);
    c.quadraticCurveTo(13, 7, 11, 8);
    c.quadraticCurveTo(-6, 15, -15, -3);
    c.closePath(); c.fill();
    c.strokeStyle = 'rgba(133,77,14,0.5)'; c.lineWidth = 1.1; c.stroke();
    c.fillStyle = '#713f12';
    E(c, -13, -5, 2, 2.6, 0.5); c.fill();
    E(c, 12, 6, 1.8, 2, -0.4); c.fill();
    c.strokeStyle = 'rgba(133,77,14,0.4)'; c.lineWidth = 1;
    c.beginPath(); c.moveTo(-10, -2); c.quadraticCurveTo(-1, 9, 9, 5); c.stroke();
  } else if (kind === 'orange') {
    E(c, 0, 1, 10.5, 10.5);
    c.fillStyle = rg3(c, -2, -2, 11, '#fed7aa', '#f97316', '#9a3412'); c.fill();
    c.fillStyle = 'rgba(154,52,18,0.3)';
    [[-4, -2], [3, 4], [5, -4], [-2, 6], [0, -6]].forEach(([x, y]) => { E(c, x, y, 0.8, 0.8); c.fill(); });
    E(c, 3, -10, 4, 2, 0.4);
    c.fillStyle = rg3(c, 2, -11, 4, '#86efac', '#16a34a', '#14532d'); c.fill();
    gloss(c, -3.5, -3, 3.5, 2.2, -0.4, 0.5);
  } else if (kind === 'grape') {
    E(c, 2, -12, 4, 2, 0.4); c.fillStyle = rg3(c, 1, -13, 4, '#86efac', '#16a34a', '#14532d'); c.fill();
    [[0, -7], [-5.5, -3], [5.5, -3], [-3, 3], [3, 3], [0, 9]].forEach(([x, y]) => {
      E(c, x, y, 5.2, 5.2);
      c.fillStyle = rg3(c, x - 1.5, y - 1.5, 5.5, '#d8b4fe', '#9333ea', '#4c1d95'); c.fill();
      E(c, x - 1.6, y - 1.8, 1.3, 0.9, -0.5); c.fillStyle = 'rgba(255,255,255,0.55)'; c.fill();
    });
  } else if (kind === 'strawberry') {
    c.fillStyle = rg3(c, -2, -2, 11, '#fca5a5', '#e11d48', '#881337');
    c.beginPath(); c.moveTo(-10, -4);
    c.quadraticCurveTo(-10, 8, 0, 12);
    c.quadraticCurveTo(10, 8, 10, -4);
    c.quadraticCurveTo(5, -8, 0, -7);
    c.quadraticCurveTo(-5, -8, -10, -4);
    c.closePath(); c.fill();
    c.fillStyle = '#fde68a';
    [[-5, -1], [0, 2], [5, -1], [-3, 6], [3, 6], [0, -4]].forEach(([x, y]) => { E(c, x, y, 0.9, 1.3); c.fill(); });
    c.fillStyle = rg3(c, 0, -8, 6, '#86efac', '#16a34a', '#14532d');
    c.beginPath(); c.moveTo(-7, -5); c.lineTo(-2, -7); c.lineTo(0, -12); c.lineTo(2, -7); c.lineTo(7, -5); c.lineTo(0, -3.5); c.closePath(); c.fill();
    gloss(c, -4, 0, 2.5, 3.5, 0.2, 0.4);
  } else if (kind === 'milk') {
    const g = c.createLinearGradient(-8, 0, 8, 0);
    g.addColorStop(0, '#e2e8f0'); g.addColorStop(0.45, '#ffffff'); g.addColorStop(1, '#cbd5e1');
    c.fillStyle = g;
    c.beginPath(); c.moveTo(-8, -4); c.lineTo(8, -4); c.lineTo(8, 13); c.lineTo(-8, 13); c.closePath(); c.fill();
    c.fillStyle = '#bfdbfe';
    c.beginPath(); c.moveTo(-8, -4); c.lineTo(0, -12); c.lineTo(8, -4); c.closePath(); c.fill();
    c.strokeStyle = 'rgba(71,85,105,0.45)'; c.lineWidth = 1;
    c.beginPath(); c.moveTo(-8, -4); c.lineTo(8, -4); c.lineTo(8, 13); c.lineTo(-8, 13); c.closePath();
    c.moveTo(-8, -4); c.lineTo(0, -12); c.lineTo(8, -4); c.stroke();
    c.fillStyle = '#3b82f6';
    c.beginPath(); c.roundRect(-6, 1, 12, 7, 2); c.fill();
    c.fillStyle = '#ffffff'; c.font = '900 5.5px Nunito, sans-serif'; c.textAlign = 'center';
    c.fillText('SUSU', 0, 6);
  } else if (kind === 'book') {
    const g = c.createLinearGradient(-10, 0, 10, 0);
    g.addColorStop(0, '#1d4ed8'); g.addColorStop(0.5, '#3b82f6'); g.addColorStop(1, '#1e3a8a');
    c.fillStyle = g;
    c.beginPath(); c.roundRect(-10, -11, 20, 24, 2.5); c.fill();
    c.fillStyle = '#ffffff';
    c.beginPath(); c.roundRect(-8, -11, 16, 22, 1); c.fill();
    c.fillStyle = g;
    c.beginPath(); c.roundRect(-10, -11, 4, 24, 2); c.fill();
    c.strokeStyle = 'rgba(148,163,184,0.8)'; c.lineWidth = 1;
    [-6, -2, 2].forEach((y) => { c.beginPath(); c.moveTo(-4, y); c.lineTo(6, y); c.stroke(); });
    c.fillStyle = '#ef4444';
    c.beginPath(); c.moveTo(3, -11); c.lineTo(7, -11); c.lineTo(7, -4); c.lineTo(5, -6.5); c.lineTo(3, -4); c.closePath(); c.fill();
  } else if (kind === 'pencil') {
    c.save(); c.rotate(0.7);
    const g = c.createLinearGradient(0, -4, 0, 4);
    g.addColorStop(0, '#fde047'); g.addColorStop(0.5, '#facc15'); g.addColorStop(1, '#ca8a04');
    c.fillStyle = g; c.fillRect(-12, -4, 19, 8);
    c.strokeStyle = 'rgba(133,77,14,0.4)'; c.lineWidth = 0.8;
    c.beginPath(); c.moveTo(-12, -1.3); c.lineTo(7, -1.3); c.moveTo(-12, 1.3); c.lineTo(7, 1.3); c.stroke();
    c.fillStyle = '#fda4af';
    c.beginPath(); c.roundRect(-16, -4, 4, 8, 1.5); c.fill();
    c.fillStyle = '#94a3b8'; c.fillRect(-12.5, -4, 2, 8);
    c.fillStyle = '#fcd9b8';
    c.beginPath(); c.moveTo(7, -4); c.lineTo(14, 0); c.lineTo(7, 4); c.closePath(); c.fill();
    c.fillStyle = '#1e293b';
    c.beginPath(); c.moveTo(11.5, -1.4); c.lineTo(14, 0); c.lineTo(11.5, 1.4); c.closePath(); c.fill();
    c.restore();
  } else if (kind === 'ball') {
    E(c, 0, 0, 11, 11);
    c.fillStyle = rg3(c, -2, -3, 11, '#ffffff', '#e2e8f0', '#94a3b8'); c.fill();
    c.strokeStyle = 'rgba(30,41,59,0.4)'; c.lineWidth = 1; c.stroke();
    c.fillStyle = '#1e293b';
    c.save(); c.translate(0, -1);
    c.beginPath();
    for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + (i * 2 * Math.PI) / 5; (i ? c.lineTo : c.moveTo).call(c, Math.cos(a) * 4.5, Math.sin(a) * 4.5); }
    c.closePath(); c.fill();
    c.restore();
    c.strokeStyle = '#1e293b'; c.lineWidth = 1.6;
    [[-0.3, -9], [Math.PI * 0.37, 0], [Math.PI * 0.7, 0]].forEach(([a], i) => {
      c.beginPath();
      if (i === 0) { c.moveTo(0, -5.5); c.lineTo(0, -10.5); }
      else if (i === 1) { c.moveTo(4.2, -2); c.lineTo(9.5, -4); }
      else { c.moveTo(-4.2, -2); c.lineTo(-9.5, -4); }
      c.stroke();
    });
    gloss(c, -3.5, -4, 3.5, 2, -0.4, 0.6);
  }
};

// ── BELON 3D (Letup Belon) ──
export const drawBalloon = (c, color) => {
  E(c, 0, 2, 23, 29);
  c.fillStyle = 'rgba(2,6,23,0.12)'; c.fill();
  E(c, 0, 0, 24, 30);
  c.fillStyle = color; c.fill();
  const shade = c.createRadialGradient(-9, -12, 4, 0, 0, 34);
  shade.addColorStop(0, 'rgba(255,255,255,0.65)');
  shade.addColorStop(0.45, 'rgba(255,255,255,0.08)');
  shade.addColorStop(0.8, 'rgba(0,0,0,0.12)');
  shade.addColorStop(1, 'rgba(0,0,0,0.32)');
  E(c, 0, 0, 24, 30); c.fillStyle = shade; c.fill();
  E(c, -8, -11, 6.5, 10, -0.35);
  c.fillStyle = 'rgba(255,255,255,0.5)'; c.fill();
  E(c, -10, -16, 2.6, 4, -0.35);
  c.fillStyle = 'rgba(255,255,255,0.9)'; c.fill();
  c.fillStyle = color;
  c.beginPath(); c.moveTo(-5, 28); c.lineTo(5, 28); c.lineTo(0, 34); c.closePath(); c.fill();
  c.fillStyle = 'rgba(0,0,0,0.2)';
  c.beginPath(); c.moveTo(0, 28); c.lineTo(5, 28); c.lineTo(0, 34); c.closePath(); c.fill();
};

// ── KERETA MUSUH top-down (menghadap bawah) ──
export const drawEnemyCar = (c, color = '#3b82f6') => {
  E(c, 0, 1, 15, 24);
  c.fillStyle = 'rgba(2,6,23,0.25)'; c.fill();
  [[-13, -12], [13, -12], [-13, 11], [13, 11]].forEach(([x, y]) => {
    c.fillStyle = '#0f172a';
    c.beginPath(); c.roundRect(x - 3.8, y - 5.5, 7.6, 11, 3); c.fill();
    c.fillStyle = 'rgba(148,163,184,0.45)';
    c.fillRect(x - 2.8, y - 1, 5.6, 2);
  });
  const g = c.createLinearGradient(-12, 0, 12, 0);
  g.addColorStop(0, color); g.addColorStop(0.45, '#ffffff'); g.addColorStop(0.55, color); g.addColorStop(1, color);
  c.fillStyle = color;
  c.beginPath();
  c.moveTo(0, 24);
  c.quadraticCurveTo(11, 21, 10.5, 7);
  c.lineTo(11, -12);
  c.quadraticCurveTo(11, -19, 0, -20);
  c.quadraticCurveTo(-11, -19, -11, -12);
  c.lineTo(-10.5, 7);
  c.quadraticCurveTo(-11, 21, 0, 24);
  c.fill();
  const sh = c.createLinearGradient(-11, 0, 11, 0);
  sh.addColorStop(0, 'rgba(0,0,0,0.32)'); sh.addColorStop(0.3, 'rgba(255,255,255,0.28)');
  sh.addColorStop(0.5, 'rgba(255,255,255,0)'); sh.addColorStop(1, 'rgba(0,0,0,0.36)');
  c.fillStyle = sh;
  c.beginPath();
  c.moveTo(0, 24); c.quadraticCurveTo(11, 21, 10.5, 7); c.lineTo(11, -12);
  c.quadraticCurveTo(11, -19, 0, -20); c.quadraticCurveTo(-11, -19, -11, -12);
  c.lineTo(-10.5, 7); c.quadraticCurveTo(-11, 21, 0, 24);
  c.fill();
  c.strokeStyle = 'rgba(2,6,23,0.4)'; c.lineWidth = 1.1; c.stroke();
  // Cermin depan (bawah) & belakang (atas)
  c.fillStyle = rg3(c, 0, 13, 8, '#bae6fd', '#38bdf8', '#075985');
  c.beginPath(); c.roundRect(-7, 9, 14, 8, 3.5); c.fill();
  c.fillStyle = 'rgba(7,89,133,0.85)';
  c.beginPath(); c.roundRect(-7, -14, 14, 6, 3); c.fill();
  // Bumbung gloss
  gloss(c, -4, -2, 3, 7, 0.06, 0.4);
};

// ── TANAH gaya Wheely — rumput beralun + tanah berlapis + batu tertanam ──
export const drawGround = (c, w, top, h, scroll = 0, night = false) => {
  const grassH = 20;
  // Tanah (dirt) berlapis
  const dg = c.createLinearGradient(0, top, 0, top + Math.max(h, 60));
  if (night) { dg.addColorStop(0, '#475569'); dg.addColorStop(0.5, '#334155'); dg.addColorStop(1, '#1e293b'); }
  else { dg.addColorStop(0, '#a16207'); dg.addColorStop(0.4, '#7c4a12'); dg.addColorStop(1, '#451a03'); }
  c.fillStyle = dg;
  c.fillRect(-30, top, w + 60, h + 30);
  // Batu & kerikil tertanam (bergerak ikut scroll)
  const so = scroll % 96;
  for (let x = -so - 96; x < w + 96; x += 96) {
    c.fillStyle = night ? 'rgba(148,163,184,0.35)' : 'rgba(120,53,15,0.85)';
    E(c, x + 22, top + 36, 8, 5.5); c.fill();
    E(c, x + 70, top + 54, 5.5, 4); c.fill();
    c.fillStyle = night ? 'rgba(226,232,240,0.18)' : 'rgba(254,243,199,0.3)';
    E(c, x + 20, top + 34, 3.5, 2); c.fill();
    E(c, x + 48, top + 46, 3, 2.2); c.fill();
  }
  // Rumput beralun gaya Wheely (scalloped bumps)
  const bw = 26;
  const bo = scroll % bw;
  const gg = c.createLinearGradient(0, top - 8, 0, top + grassH);
  if (night) { gg.addColorStop(0, '#64748b'); gg.addColorStop(1, '#334155'); }
  else { gg.addColorStop(0, '#a3e635'); gg.addColorStop(0.5, '#65a30d'); gg.addColorStop(1, '#3f6212'); }
  c.fillStyle = gg;
  c.beginPath();
  c.moveTo(-30, top + grassH);
  c.lineTo(-30, top + 4);
  for (let x = -bo - bw; x < w + bw; x += bw) {
    c.quadraticCurveTo(x + bw / 2, top - 8, x + bw, top + 4);
  }
  c.lineTo(w + 30, top + grassH);
  c.closePath();
  c.fill();
  // Outline kartun gelap bawah rumput
  c.fillStyle = night ? 'rgba(15,23,42,0.55)' : 'rgba(54,83,20,0.9)';
  c.fillRect(-30, top + grassH - 3, w + 60, 3.5);
  // Rim highlight atas alun rumput
  c.strokeStyle = night ? 'rgba(203,213,225,0.4)' : 'rgba(236,252,203,0.85)';
  c.lineWidth = 2.5; c.lineCap = 'round';
  c.beginPath();
  for (let x = -bo - bw; x < w + bw; x += bw) {
    c.moveTo(x + 5, top + 1);
    c.quadraticCurveTo(x + bw / 2, top - 6, x + bw - 5, top + 1);
  }
  c.stroke();
  // Helai rumput menonjol
  c.strokeStyle = night ? '#94a3b8' : '#84cc16';
  c.lineWidth = 2;
  const to = scroll % 58;
  for (let x = -to - 58; x < w + 58; x += 58) {
    c.beginPath(); c.moveTo(x + 9, top + 1); c.quadraticCurveTo(x + 5, top - 9, x + 9, top - 13); c.stroke();
    c.beginPath(); c.moveTo(x + 14, top + 1); c.quadraticCurveTo(x + 17, top - 7, x + 14, top - 10); c.stroke();
  }
};

// ── TIANG/BATANG kartun (Flappy) — outline tebal + silinder 3D ──
export const drawPillar = (c, x, w, y0, y1) => {
  if (y1 <= y0) return;
  const g = c.createLinearGradient(x, 0, x + w, 0);
  g.addColorStop(0, '#14532d'); g.addColorStop(0.16, '#16a34a'); g.addColorStop(0.4, '#4ade80');
  g.addColorStop(0.65, '#22c55e'); g.addColorStop(1, '#14532d');
  c.fillStyle = g;
  c.beginPath(); c.roundRect(x, y0, w, y1 - y0, 5); c.fill();
  c.lineWidth = 3; c.strokeStyle = '#052e16'; c.stroke();
  // Jalur highlight kiri (kilauan silinder)
  c.fillStyle = 'rgba(236,252,203,0.5)';
  c.beginPath(); c.roundRect(x + 8, y0 + 8, 6, Math.max(0, y1 - y0 - 16), 3); c.fill();
  // Garis tekstur
  c.strokeStyle = 'rgba(5,46,22,0.25)'; c.lineWidth = 1.5;
  c.beginPath(); c.moveTo(x + w * 0.7, y0 + 6); c.lineTo(x + w * 0.7, y1 - 6); c.stroke();
};
export const drawPillarCap = (c, x, w, y) => {
  const g = c.createLinearGradient(x - 8, 0, x + w + 8, 0);
  g.addColorStop(0, '#14532d'); g.addColorStop(0.28, '#4ade80'); g.addColorStop(0.6, '#22c55e'); g.addColorStop(1, '#14532d');
  c.fillStyle = g;
  c.beginPath(); c.roundRect(x - 8, y, w + 16, 26, 9); c.fill();
  c.lineWidth = 3; c.strokeStyle = '#052e16'; c.stroke();
  c.fillStyle = 'rgba(236,252,203,0.55)';
  c.beginPath(); c.roundRect(x - 1, y + 4, w * 0.42, 5.5, 3); c.fill();
  // Daun kecil di tepi cap
  [[x - 6, y + 2], [x + w + 6, y + 22]].forEach(([lx, ly]) => {
    E(c, lx, ly, 6, 4, -0.4);
    c.fillStyle = rg3(c, lx - 2, ly - 2, 6, '#86efac', '#22c55e', '#14532d'); c.fill();
    c.strokeStyle = '#052e16'; c.lineWidth = 1.4; c.stroke();
  });
};

// ── JALAN RAYA litar lumba (Racer) — asphalt + kerb merah-putih ──
export const drawRoad = (c, x, w, H, off = 0) => {
  const g = c.createLinearGradient(x, 0, x + w, 0);
  g.addColorStop(0, '#1f2937'); g.addColorStop(0.5, '#4b5563'); g.addColorStop(1, '#1f2937');
  c.fillStyle = g;
  c.fillRect(x, -20, w, H + 40);
  // Tekstur bintik asphalt bergerak
  c.fillStyle = 'rgba(255,255,255,0.06)';
  const t = off % 60;
  for (let y = -60 + t; y < H + 40; y += 34) {
    for (let i = 0; i < 5; i++) {
      c.fillRect(x + 24 + ((i * 73 + Math.abs(y) * 7) % (w - 48)), y + (i * 11) % 28, 3, 3);
    }
  }
  // Kerb merah-putih bergerak (gaya litar)
  const kerbH = 28;
  const ko = off % (kerbH * 2);
  [x - 11, x + w + 1].forEach((kx) => {
    for (let y = -kerbH * 2 + ko; y < H + 40; y += kerbH * 2) {
      c.fillStyle = '#dc2626'; c.fillRect(kx, y, 10, kerbH);
      c.fillStyle = '#f8fafc'; c.fillRect(kx, y + kerbH, 10, kerbH);
    }
    c.fillStyle = 'rgba(2,6,23,0.4)';
    c.fillRect(kx < x ? kx + 8 : kx, -20, 2.5, H + 40);
  });
};

// ── SPRING platform (Lompat Awan) ──
export const drawSpring = (c, f = 0) => {
  const sq = 1 + Math.sin(f * 0.25) * 0.1;
  c.save();
  c.scale(1, sq);
  c.strokeStyle = '#db2777'; c.lineWidth = 2.6; c.lineCap = 'round';
  [0, -4, -8].forEach((y) => {
    c.beginPath(); c.ellipse(0, y, 7, 2.6, 0, 0, Math.PI * 2); c.stroke();
  });
  E(c, 0, -12, 8, 3);
  c.fillStyle = rg3(c, 0, -13, 8, '#fbcfe8', '#ec4899', '#9d174d'); c.fill();
  c.strokeStyle = 'rgba(157,23,77,0.5)'; c.lineWidth = 1; c.stroke();
  c.restore();
};