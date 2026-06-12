// Watak arcade dilukis penuh dengan kod canvas (vektor 3D-style, bukan emoji / gambar)
// Semua fungsi lukis berpusat di (0,0), saiz kotak ±35px

const E = (c, x, y, rx, ry, rot = 0) => { c.beginPath(); c.ellipse(x, y, rx, ry, rot, 0, Math.PI * 2); };
const rg = (c, x, y, r, c1, c2) => {
  const g = c.createRadialGradient(x - r * 0.4, y - r * 0.4, r * 0.15, x, y, r * 1.15);
  g.addColorStop(0, c1); g.addColorStop(1, c2);
  return g;
};

// ── FOX (pelari, menghadap kanan, kaki beranimasi) ──
export const drawFox = (c, f = 0, running = true) => {
  const t = running ? f * 0.45 : 0;
  const l1 = Math.sin(t) * 9, l2 = Math.sin(t + Math.PI) * 9;
  c.save();
  // Ekor gebu
  c.save();
  c.translate(-20, -6);
  c.rotate(-0.5 + Math.sin(f * 0.18) * 0.18);
  E(c, -10, 0, 14, 7); c.fillStyle = '#ea580c'; c.fill();
  E(c, -20, 0, 6.5, 5.5); c.fillStyle = '#fff7ed'; c.fill();
  c.restore();
  // Kaki (4, swing berselang)
  c.strokeStyle = '#c2410c'; c.lineCap = 'round'; c.lineWidth = 6;
  [[-12, l1], [-7, l2], [8, l2], [13, l1]].forEach(([x, sw]) => {
    c.beginPath(); c.moveTo(x, 4); c.lineTo(x + sw * 0.6, 16); c.stroke();
  });
  // Badan
  E(c, -2, -4, 21, 13, -0.08);
  c.fillStyle = rg(c, -2, -8, 22, '#fdba74', '#ea580c'); c.fill();
  // Perut putih
  E(c, 2, 2, 12, 7); c.fillStyle = '#fff7ed'; c.fill();
  // Kepala
  E(c, 17, -16, 12.5, 11);
  c.fillStyle = rg(c, 17, -19, 13, '#fdba74', '#f97316'); c.fill();
  // Telinga
  c.fillStyle = '#ea580c';
  c.beginPath(); c.moveTo(8, -22); c.lineTo(10, -36); c.lineTo(17, -25); c.closePath(); c.fill();
  c.beginPath(); c.moveTo(17, -25.5); c.lineTo(22, -37); c.lineTo(26, -24); c.closePath(); c.fill();
  c.fillStyle = '#7c2d12';
  c.beginPath(); c.moveTo(11, -26); c.lineTo(11.5, -32); c.lineTo(15.5, -26.5); c.closePath(); c.fill();
  // Muncung putih + hidung
  E(c, 25, -12, 7.5, 5.5, 0.15); c.fillStyle = '#fff7ed'; c.fill();
  E(c, 30.5, -13, 2.6, 2.1); c.fillStyle = '#1c1917'; c.fill();
  E(c, 29.8, -13.8, 0.8, 0.6); c.fillStyle = '#fff'; c.fill();
  // Mata besar Pixar
  E(c, 18, -18, 4.2, 4.8); c.fillStyle = '#fff'; c.fill();
  E(c, 19.2, -17.6, 2.4, 3); c.fillStyle = '#1c1917'; c.fill();
  E(c, 18.4, -19, 1, 1.1); c.fillStyle = '#fff'; c.fill();
  // Senyum
  c.strokeStyle = '#7c2d12'; c.lineWidth = 1.4;
  c.beginPath(); c.arc(26, -9.5, 3, 0.2, Math.PI - 0.6); c.stroke();
  c.restore();
};

// ── BIRD (menghadap kanan, sayap kepak) ──
export const drawBird = (c, f = 0, wing = 0) => {
  c.save();
  const flap = Math.sin(f * 0.5) * 0.4 + wing * 0.8;
  // Ekor
  c.fillStyle = '#ea580c';
  c.beginPath(); c.moveTo(-16, -2); c.lineTo(-30, -10); c.lineTo(-28, 2); c.closePath(); c.fill();
  // Badan bulat
  E(c, 0, 0, 19, 17);
  c.fillStyle = rg(c, 0, -5, 20, '#fde047', '#f59e0b'); c.fill();
  // Perut
  E(c, 4, 6, 11, 8); c.fillStyle = '#fef9c3'; c.fill();
  // Sayap (kepak)
  c.save(); c.translate(-4, -2); c.rotate(-0.3 - flap);
  E(c, -8, 0, 12, 6.5, 0.2); c.fillStyle = rg(c, -8, -2, 12, '#fbbf24', '#d97706'); c.fill();
  c.restore();
  // Paruh
  c.fillStyle = '#f97316';
  c.beginPath(); c.moveTo(16, -4); c.lineTo(28, -1); c.lineTo(16, 3); c.closePath(); c.fill();
  c.strokeStyle = '#c2410c'; c.lineWidth = 1;
  c.beginPath(); c.moveTo(16, -0.5); c.lineTo(26, -1); c.stroke();
  // Mata besar
  E(c, 9, -7, 5.5, 6); c.fillStyle = '#fff'; c.fill();
  E(c, 10.5, -6.5, 3, 3.6); c.fillStyle = '#1c1917'; c.fill();
  E(c, 9.6, -8.2, 1.2, 1.4); c.fillStyle = '#fff'; c.fill();
  // Kening
  c.strokeStyle = '#92400e'; c.lineWidth = 1.5;
  c.beginPath(); c.arc(8, -13, 4, Math.PI + 0.4, -0.4); c.stroke();
  // Jambul
  c.fillStyle = '#f59e0b';
  c.beginPath(); c.moveTo(-2, -15); c.quadraticCurveTo(-2, -24, 4, -22); c.quadraticCurveTo(0, -19, 1, -15); c.closePath(); c.fill();
  c.restore();
};

// ── RABBIT (depan, telinga goyang) ──
export const drawRabbit = (c, f = 0) => {
  c.save();
  const earW = Math.sin(f * 0.15) * 0.08;
  // Telinga
  [[-7, -0.18 + earW], [7, 0.18 - earW]].forEach(([x, rot]) => {
    c.save(); c.translate(x, -20); c.rotate(rot);
    E(c, 0, -12, 5.5, 14); c.fillStyle = rg(c, 0, -14, 12, '#ffffff', '#e2e8f0'); c.fill();
    E(c, 0, -11, 2.8, 9); c.fillStyle = '#fbcfe8'; c.fill();
    c.restore();
  });
  // Badan
  E(c, 0, 8, 15, 13);
  c.fillStyle = rg(c, 0, 4, 16, '#ffffff', '#cbd5e1'); c.fill();
  E(c, 0, 11, 9, 7.5); c.fillStyle = '#f8fafc'; c.fill();
  // Kaki
  E(c, -8, 19, 6, 3.5); c.fillStyle = '#e2e8f0'; c.fill();
  E(c, 8, 19, 6, 3.5); c.fillStyle = '#e2e8f0'; c.fill();
  // Kepala
  E(c, 0, -10, 14, 12.5);
  c.fillStyle = rg(c, 0, -14, 15, '#ffffff', '#dbe2ea'); c.fill();
  // Pipi pink
  E(c, -8.5, -5, 3, 2); c.fillStyle = '#fbcfe8'; c.fill();
  E(c, 8.5, -5, 3, 2); c.fillStyle = '#fbcfe8'; c.fill();
  // Mata besar
  [-5.5, 5.5].forEach((x) => {
    E(c, x, -11, 3.8, 4.4); c.fillStyle = '#fff'; c.fill();
    E(c, x + 0.5, -10.6, 2.3, 2.9); c.fillStyle = '#1e293b'; c.fill();
    E(c, x - 0.4, -12, 0.9, 1.1); c.fillStyle = '#fff'; c.fill();
  });
  // Hidung + mulut + gigi
  c.fillStyle = '#f472b6';
  c.beginPath(); c.moveTo(-2, -5.5); c.lineTo(2, -5.5); c.lineTo(0, -3); c.closePath(); c.fill();
  c.strokeStyle = '#94a3b8'; c.lineWidth = 1.2;
  c.beginPath(); c.moveTo(0, -3); c.lineTo(0, -1); c.stroke();
  c.fillStyle = '#fff'; c.fillRect(-2.5, -1.5, 5, 3.5);
  c.strokeStyle = '#cbd5e1'; c.beginPath(); c.moveTo(0, -1.5); c.lineTo(0, 2); c.stroke();
  c.restore();
};

// ── ROCKET (menghala atas, api beranimasi) ──
export const drawRocket = (c, f = 0) => {
  c.save();
  // Api ekzos (animated)
  const fl = 1 + Math.sin(f * 0.6) * 0.3;
  c.fillStyle = '#fb923c';
  c.beginPath(); c.moveTo(-5, 28); c.quadraticCurveTo(0, 28 + 15 * fl, 5, 28); c.closePath(); c.fill();
  c.fillStyle = '#fde047';
  c.beginPath(); c.moveTo(-2.5, 28); c.quadraticCurveTo(0, 28 + 9 * fl, 2.5, 28); c.closePath(); c.fill();
  // Sirip
  c.fillStyle = '#dc2626';
  c.beginPath(); c.moveTo(-12, 8); c.quadraticCurveTo(-24, 18, -20, 28); c.lineTo(-10, 20); c.closePath(); c.fill();
  c.beginPath(); c.moveTo(12, 8); c.quadraticCurveTo(24, 18, 20, 28); c.lineTo(10, 20); c.closePath(); c.fill();
  // Badan metalik
  const g = c.createLinearGradient(-13, 0, 13, 0);
  g.addColorStop(0, '#cbd5e1'); g.addColorStop(0.35, '#ffffff'); g.addColorStop(1, '#94a3b8');
  c.fillStyle = g;
  c.beginPath();
  c.moveTo(0, -32);
  c.quadraticCurveTo(14, -16, 13, 4);
  c.quadraticCurveTo(12, 18, 8, 24);
  c.lineTo(-8, 24);
  c.quadraticCurveTo(-12, 18, -13, 4);
  c.quadraticCurveTo(-14, -16, 0, -32);
  c.fill();
  // Muncung merah
  c.fillStyle = rg(c, -2, -22, 12, '#f87171', '#b91c1c');
  c.beginPath(); c.moveTo(0, -32); c.quadraticCurveTo(13, -18, 12.2, -10); c.quadraticCurveTo(0, -14, -12.2, -10); c.quadraticCurveTo(-13, -18, 0, -32); c.fill();
  // Tingkap kaca
  E(c, 0, -1, 7.5, 7.5); c.fillStyle = '#dc2626'; c.fill();
  E(c, 0, -1, 5.5, 5.5); c.fillStyle = rg(c, -2, -3, 6, '#bae6fd', '#0284c7'); c.fill();
  E(c, -2, -3.5, 1.8, 1.2, -0.6); c.fillStyle = 'rgba(255,255,255,0.85)'; c.fill();
  // Ekzos
  c.fillStyle = '#64748b';
  c.beginPath(); c.moveTo(-7, 24); c.lineTo(7, 24); c.lineTo(5, 28); c.lineTo(-5, 28); c.closePath(); c.fill();
  c.restore();
};

// ── RACE CAR (top-down, depan ke atas, mata comel pada cermin) ──
export const drawCar = (c) => {
  c.save();
  // Roda
  c.fillStyle = '#1e293b';
  [[-15, -14], [15, -14], [-15, 12], [15, 12]].forEach(([x, y]) => {
    c.beginPath(); c.roundRect(x - 4, y - 6, 8, 12, 3); c.fill();
  });
  // Badan merah berkilat
  const g = c.createLinearGradient(-14, 0, 14, 0);
  g.addColorStop(0, '#b91c1c'); g.addColorStop(0.4, '#f87171'); g.addColorStop(1, '#991b1b');
  c.fillStyle = g;
  c.beginPath();
  c.moveTo(0, -27);
  c.quadraticCurveTo(13, -24, 12, -8);
  c.lineTo(13, 14);
  c.quadraticCurveTo(13, 22, 0, 23);
  c.quadraticCurveTo(-13, 22, -13, 14);
  c.lineTo(-12, -8);
  c.quadraticCurveTo(-13, -24, 0, -27);
  c.fill();
  // Jalur lumba putih
  c.fillStyle = 'rgba(255,255,255,0.9)';
  c.fillRect(-3, -26, 6, 48);
  // Cermin depan dengan mata comel
  c.fillStyle = '#0ea5e9';
  c.beginPath(); c.roundRect(-9, -16, 18, 9, 4); c.fill();
  E(c, -4, -11.5, 2.5, 3); c.fillStyle = '#fff'; c.fill();
  E(c, 4, -11.5, 2.5, 3); c.fillStyle = '#fff'; c.fill();
  E(c, -3.5, -11, 1.4, 1.8); c.fillStyle = '#1e293b'; c.fill();
  E(c, 4.5, -11, 1.4, 1.8); c.fillStyle = '#1e293b'; c.fill();
  // Kokpit + topi keledar
  c.fillStyle = '#1e293b';
  c.beginPath(); c.roundRect(-8, -3, 16, 10, 4); c.fill();
  E(c, 0, 2, 3.5, 3.5); c.fillStyle = '#fbbf24'; c.fill();
  // Spoiler
  c.fillStyle = '#7f1d1d';
  c.beginPath(); c.roundRect(-14, 16, 28, 5, 2.5); c.fill();
  c.restore();
};

// ── BASKET (anyaman + kain berpetak) ──
export const drawBasket = (c) => {
  c.save();
  // Kain berpetak dalam
  c.fillStyle = '#ef4444';
  c.beginPath(); c.roundRect(-20, -18, 40, 8, 4); c.fill();
  c.fillStyle = '#fff';
  for (let i = -16; i < 20; i += 8) c.fillRect(i, -18, 4, 8);
  // Badan bakul
  const g = c.createLinearGradient(0, -14, 0, 18);
  g.addColorStop(0, '#d97706'); g.addColorStop(1, '#92400e');
  c.fillStyle = g;
  c.beginPath(); c.moveTo(-24, -12); c.lineTo(24, -12); c.lineTo(18, 18); c.lineTo(-18, 18); c.closePath(); c.fill();
  // Anyaman
  c.strokeStyle = 'rgba(120,53,15,0.55)'; c.lineWidth = 2;
  for (let y = -7; y < 18; y += 6) {
    c.beginPath(); c.moveTo(-23 + (y + 12) * 0.2, y); c.lineTo(23 - (y + 12) * 0.2, y); c.stroke();
  }
  for (let x = -18; x <= 18; x += 7) {
    c.beginPath(); c.moveTo(x * 1.25, -12); c.lineTo(x, 18); c.stroke();
  }
  // Bibir atas
  c.fillStyle = '#b45309';
  c.beginPath(); c.roundRect(-26, -15, 52, 7, 3.5); c.fill();
  c.fillStyle = 'rgba(255,255,255,0.25)';
  c.beginPath(); c.roundRect(-26, -15, 52, 3, 2); c.fill();
  c.restore();
};

// ── MOLE (dengan gogal, untuk Ketuk Ceria) ──
export const drawMole = (c, f = 0) => {
  c.save();
  c.translate(0, Math.sin(f * 0.2) * 1.5);
  // Badan
  E(c, 0, 10, 16, 14);
  c.fillStyle = rg(c, 0, 5, 17, '#a16207', '#713f12'); c.fill();
  // Tangan
  E(c, -14, 2, 5, 7, 0.5); c.fillStyle = '#854d0e'; c.fill();
  E(c, 14, 2, 5, 7, -0.5); c.fillStyle = '#854d0e'; c.fill();
  // Kepala
  E(c, 0, -8, 13.5, 12);
  c.fillStyle = rg(c, 0, -12, 14, '#ca8a04', '#854d0e'); c.fill();
  // Muka cerah
  E(c, 0, -4, 8.5, 7); c.fillStyle = '#fde68a'; c.fill();
  // Gogal
  c.strokeStyle = '#475569'; c.lineWidth = 2;
  E(c, -5, -10, 4.5, 4.5); c.fillStyle = '#e0f2fe'; c.fill(); c.stroke();
  E(c, 5, -10, 4.5, 4.5); c.fillStyle = '#e0f2fe'; c.fill(); c.stroke();
  c.beginPath(); c.moveTo(-0.5, -10); c.lineTo(0.5, -10); c.stroke();
  E(c, -4.5, -9.5, 2, 2.4); c.fillStyle = '#1e293b'; c.fill();
  E(c, 5.5, -9.5, 2, 2.4); c.fillStyle = '#1e293b'; c.fill();
  // Hidung pink + gigi
  E(c, 0, -4, 3, 2.3); c.fillStyle = '#f472b6'; c.fill();
  c.fillStyle = '#fff'; c.fillRect(-2, -1.5, 4, 4);
  c.restore();
};