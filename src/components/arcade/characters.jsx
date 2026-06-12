// Watak arcade dilukis penuh dengan kod canvas — vektor 3D-style sebenar
// Teknik: gradient 3-stop (lit→mid→shadow), specular gloss, rim light, outline & contact shadow
// Semua fungsi lukis berpusat di (0,0), saiz kotak ±35px

const E = (c, x, y, rx, ry, rot = 0) => { c.beginPath(); c.ellipse(x, y, rx, ry, rot, 0, Math.PI * 2); };

// Radial gradient 3-stop: cahaya atas-kiri → warna asal → bayang bawah-kanan
const rg3 = (c, x, y, r, lit, mid, dark) => {
  const g = c.createRadialGradient(x - r * 0.45, y - r * 0.5, r * 0.08, x, y, r * 1.25);
  g.addColorStop(0, lit); g.addColorStop(0.55, mid); g.addColorStop(1, dark);
  return g;
};

// Specular gloss — kilauan putih lembut (rupa permukaan licin 3D)
const gloss = (c, x, y, rx, ry, rot = -0.5, a = 0.5) => {
  const g = c.createRadialGradient(x, y, 0, x, y, Math.max(rx, ry) * 1.4);
  g.addColorStop(0, `rgba(255,255,255,${a})`);
  g.addColorStop(1, 'rgba(255,255,255,0)');
  E(c, x, y, rx, ry, rot);
  c.fillStyle = g; c.fill();
};

// Contact shadow lembut di bawah watak
const groundShadow = (c, y, rx, a = 0.22) => {
  const g = c.createRadialGradient(0, y, 0, 0, y, rx);
  g.addColorStop(0, `rgba(15,23,42,${a})`);
  g.addColorStop(1, 'rgba(15,23,42,0)');
  E(c, 0, y, rx, rx * 0.22);
  c.fillStyle = g; c.fill();
};

// ── FOX (pelari, menghadap kanan, kaki beranimasi) ──
export const drawFox = (c, f = 0, running = true) => {
  const t = running ? f * 0.45 : 0;
  const l1 = Math.sin(t) * 9, l2 = Math.sin(t + Math.PI) * 9;
  c.save();
  groundShadow(c, 18, 30);
  // Ekor gebu
  c.save();
  c.translate(-20, -6);
  c.rotate(-0.5 + Math.sin(f * 0.18) * 0.18);
  E(c, -10, 0, 14, 7);
  c.fillStyle = rg3(c, -10, -2, 14, '#fdba74', '#ea580c', '#9a3412'); c.fill();
  E(c, -20, 0, 6.5, 5.5);
  c.fillStyle = rg3(c, -21, -1, 6, '#ffffff', '#fff7ed', '#fcd9b8'); c.fill();
  gloss(c, -10, -3, 7, 2.5, -0.3, 0.35);
  c.restore();
  // Kaki (4, swing berselang) — gradient cylinder
  c.lineCap = 'round'; c.lineWidth = 6.5;
  [[-12, l1], [-7, l2], [8, l2], [13, l1]].forEach(([x, sw]) => {
    const lg = c.createLinearGradient(x - 3, 4, x + 3, 4);
    lg.addColorStop(0, '#ea580c'); lg.addColorStop(0.5, '#c2410c'); lg.addColorStop(1, '#7c2d12');
    c.strokeStyle = lg;
    c.beginPath(); c.moveTo(x, 4); c.lineTo(x + sw * 0.6, 16); c.stroke();
  });
  // Badan
  E(c, -2, -4, 21, 13, -0.08);
  c.fillStyle = rg3(c, -2, -9, 22, '#ffd9a8', '#f97316', '#b13403'); c.fill();
  c.strokeStyle = 'rgba(124,45,18,0.35)'; c.lineWidth = 1.3; c.stroke();
  // Rim light bawah (pantulan ambien)
  c.strokeStyle = 'rgba(255,237,213,0.5)'; c.lineWidth = 2;
  c.beginPath(); c.ellipse(-2, -4, 19.5, 11.5, -0.08, Math.PI * 0.25, Math.PI * 0.75); c.stroke();
  // Perut putih
  E(c, 2, 2, 12, 7);
  c.fillStyle = rg3(c, 2, 0, 12, '#ffffff', '#fff7ed', '#fcd9b8'); c.fill();
  // Gloss badan
  gloss(c, -8, -12, 11, 4.5, -0.25, 0.45);
  // Kepala
  E(c, 17, -16, 12.5, 11);
  c.fillStyle = rg3(c, 17, -20, 13, '#ffd9a8', '#f97316', '#c2410c'); c.fill();
  c.strokeStyle = 'rgba(124,45,18,0.35)'; c.lineWidth = 1.3; c.stroke();
  // Telinga
  const earG = rg3(c, 15, -30, 12, '#fb923c', '#ea580c', '#9a3412');
  c.fillStyle = earG;
  c.beginPath(); c.moveTo(8, -22); c.lineTo(10, -36); c.lineTo(17, -25); c.closePath(); c.fill();
  c.strokeStyle = 'rgba(124,45,18,0.4)'; c.lineWidth = 1; c.stroke();
  c.fillStyle = earG;
  c.beginPath(); c.moveTo(17, -25.5); c.lineTo(22, -37); c.lineTo(26, -24); c.closePath(); c.fill();
  c.stroke();
  c.fillStyle = '#7c2d12';
  c.beginPath(); c.moveTo(11, -26); c.lineTo(11.5, -32); c.lineTo(15.5, -26.5); c.closePath(); c.fill();
  // Muncung putih + hidung berkilat
  E(c, 25, -12, 7.5, 5.5, 0.15);
  c.fillStyle = rg3(c, 24, -14, 7, '#ffffff', '#fff7ed', '#fcd9b8'); c.fill();
  E(c, 30.5, -13, 2.8, 2.3);
  c.fillStyle = rg3(c, 30, -14, 3, '#57534e', '#1c1917', '#000000'); c.fill();
  E(c, 29.7, -14, 1, 0.7); c.fillStyle = 'rgba(255,255,255,0.9)'; c.fill();
  // Mata besar Pixar dengan iris
  E(c, 18, -18, 4.4, 5);
  c.fillStyle = '#ffffff'; c.fill();
  c.strokeStyle = 'rgba(124,45,18,0.25)'; c.lineWidth = 0.8; c.stroke();
  E(c, 19.2, -17.6, 2.9, 3.4); c.fillStyle = '#92400e'; c.fill();
  E(c, 19.4, -17.4, 1.9, 2.3); c.fillStyle = '#1c1917'; c.fill();
  E(c, 18.4, -19.2, 1.1, 1.2); c.fillStyle = '#ffffff'; c.fill();
  E(c, 20.2, -16.2, 0.5, 0.5); c.fillStyle = 'rgba(255,255,255,0.7)'; c.fill();
  // Gloss kepala
  gloss(c, 13, -22, 6, 3, -0.4, 0.5);
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
  const tailG = rg3(c, -24, -4, 10, '#fb923c', '#ea580c', '#9a3412');
  c.fillStyle = tailG;
  c.beginPath(); c.moveTo(-16, -2); c.lineTo(-30, -10); c.lineTo(-28, 2); c.closePath(); c.fill();
  c.strokeStyle = 'rgba(146,64,14,0.4)'; c.lineWidth = 1; c.stroke();
  // Badan bulat
  E(c, 0, 0, 19, 17);
  c.fillStyle = rg3(c, 0, -6, 20, '#fef9c3', '#fbbf24', '#c2700b'); c.fill();
  c.strokeStyle = 'rgba(146,64,14,0.35)'; c.lineWidth = 1.3; c.stroke();
  // Rim light bawah
  c.strokeStyle = 'rgba(254,243,199,0.55)'; c.lineWidth = 2;
  c.beginPath(); c.ellipse(0, 0, 17.5, 15.5, 0, Math.PI * 0.3, Math.PI * 0.7); c.stroke();
  // Perut
  E(c, 4, 6, 11, 8);
  c.fillStyle = rg3(c, 4, 4, 11, '#fffbeb', '#fef3c7', '#fde68a'); c.fill();
  // Sayap (kepak) — berbulu
  c.save(); c.translate(-4, -2); c.rotate(-0.3 - flap);
  E(c, -8, 0, 12, 6.5, 0.2);
  c.fillStyle = rg3(c, -8, -2, 12, '#fcd34d', '#f59e0b', '#b45309'); c.fill();
  c.strokeStyle = 'rgba(146,64,14,0.4)'; c.lineWidth = 1; c.stroke();
  // Garis bulu sayap
  c.strokeStyle = 'rgba(146,64,14,0.35)'; c.lineWidth = 1;
  c.beginPath(); c.moveTo(-14, -2); c.quadraticCurveTo(-8, 1, -2, 1); c.stroke();
  c.beginPath(); c.moveTo(-16, 1); c.quadraticCurveTo(-9, 4, -3, 3.5); c.stroke();
  gloss(c, -10, -3, 6, 2, 0.2, 0.4);
  c.restore();
  // Paruh berkilat
  const beakG = c.createLinearGradient(16, -5, 16, 4);
  beakG.addColorStop(0, '#fb923c'); beakG.addColorStop(1, '#c2410c');
  c.fillStyle = beakG;
  c.beginPath(); c.moveTo(16, -4); c.lineTo(28, -1); c.lineTo(16, 3); c.closePath(); c.fill();
  c.strokeStyle = 'rgba(124,45,18,0.5)'; c.lineWidth = 1; c.stroke();
  c.beginPath(); c.moveTo(16, -0.5); c.lineTo(26, -1); c.stroke();
  // Mata besar dengan iris
  E(c, 9, -7, 5.5, 6);
  c.fillStyle = '#ffffff'; c.fill();
  c.strokeStyle = 'rgba(146,64,14,0.25)'; c.lineWidth = 0.8; c.stroke();
  E(c, 10.5, -6.5, 3.4, 4); c.fillStyle = '#7c3aed'; c.fill();
  E(c, 10.7, -6.3, 2.2, 2.7); c.fillStyle = '#1c1917'; c.fill();
  E(c, 9.6, -8.4, 1.3, 1.5); c.fillStyle = '#ffffff'; c.fill();
  E(c, 11.6, -5, 0.6, 0.6); c.fillStyle = 'rgba(255,255,255,0.7)'; c.fill();
  // Kening
  c.strokeStyle = '#92400e'; c.lineWidth = 1.5;
  c.beginPath(); c.arc(8, -13, 4, Math.PI + 0.4, -0.4); c.stroke();
  // Jambul
  c.fillStyle = rg3(c, 0, -20, 6, '#fcd34d', '#f59e0b', '#b45309');
  c.beginPath(); c.moveTo(-2, -15); c.quadraticCurveTo(-2, -24, 4, -22); c.quadraticCurveTo(0, -19, 1, -15); c.closePath(); c.fill();
  // Gloss badan
  gloss(c, -5, -8, 9, 4, -0.35, 0.5);
  c.restore();
};

// ── RABBIT (depan, telinga goyang) ──
export const drawRabbit = (c, f = 0) => {
  c.save();
  groundShadow(c, 23, 24);
  const earW = Math.sin(f * 0.15) * 0.08;
  // Telinga
  [[-7, -0.18 + earW], [7, 0.18 - earW]].forEach(([x, rot]) => {
    c.save(); c.translate(x, -20); c.rotate(rot);
    E(c, 0, -12, 5.5, 14);
    c.fillStyle = rg3(c, -1, -16, 13, '#ffffff', '#eef2f7', '#b9c6d6'); c.fill();
    c.strokeStyle = 'rgba(100,116,139,0.35)'; c.lineWidth = 1.1; c.stroke();
    E(c, 0, -11, 2.8, 9);
    c.fillStyle = rg3(c, 0, -13, 8, '#fce7f3', '#fbcfe8', '#f190c0'); c.fill();
    gloss(c, -2, -18, 2.5, 5, 0.1, 0.5);
    c.restore();
  });
  // Badan
  E(c, 0, 8, 15, 13);
  c.fillStyle = rg3(c, 0, 3, 16, '#ffffff', '#eef2f7', '#aebfd2'); c.fill();
  c.strokeStyle = 'rgba(100,116,139,0.35)'; c.lineWidth = 1.3; c.stroke();
  E(c, 0, 11, 9, 7.5);
  c.fillStyle = rg3(c, 0, 9, 9, '#ffffff', '#f8fafc', '#dde5ee'); c.fill();
  // Kaki
  [[-8, 19], [8, 19]].forEach(([x, y]) => {
    E(c, x, y, 6, 3.5);
    c.fillStyle = rg3(c, x, y - 1, 6, '#ffffff', '#e2e8f0', '#b9c6d6'); c.fill();
    c.strokeStyle = 'rgba(100,116,139,0.3)'; c.lineWidth = 1; c.stroke();
  });
  // Kepala
  E(c, 0, -10, 14, 12.5);
  c.fillStyle = rg3(c, -1, -15, 15, '#ffffff', '#f0f4f9', '#b4c2d3'); c.fill();
  c.strokeStyle = 'rgba(100,116,139,0.35)'; c.lineWidth = 1.3; c.stroke();
  // Rim light
  c.strokeStyle = 'rgba(255,255,255,0.7)'; c.lineWidth = 1.6;
  c.beginPath(); c.ellipse(0, -10, 12.5, 11, 0, Math.PI * 1.15, Math.PI * 1.85); c.stroke();
  // Pipi pink
  E(c, -8.5, -5, 3, 2); c.fillStyle = 'rgba(251,207,232,0.85)'; c.fill();
  E(c, 8.5, -5, 3, 2); c.fillStyle = 'rgba(251,207,232,0.85)'; c.fill();
  // Mata besar dengan iris
  [-5.5, 5.5].forEach((x) => {
    E(c, x, -11, 3.9, 4.5);
    c.fillStyle = '#ffffff'; c.fill();
    c.strokeStyle = 'rgba(100,116,139,0.3)'; c.lineWidth = 0.8; c.stroke();
    E(c, x + 0.5, -10.6, 2.6, 3.2); c.fillStyle = '#3b82f6'; c.fill();
    E(c, x + 0.6, -10.4, 1.7, 2.2); c.fillStyle = '#1e293b'; c.fill();
    E(c, x - 0.5, -12.2, 1, 1.2); c.fillStyle = '#ffffff'; c.fill();
    E(c, x + 1.4, -9.2, 0.5, 0.5); c.fillStyle = 'rgba(255,255,255,0.7)'; c.fill();
  });
  // Hidung + mulut + gigi
  c.fillStyle = rg3(c, 0, -5, 3, '#f9a8d4', '#f472b6', '#db2777');
  c.beginPath(); c.moveTo(-2.2, -5.5); c.lineTo(2.2, -5.5); c.lineTo(0, -2.8); c.closePath(); c.fill();
  c.strokeStyle = '#94a3b8'; c.lineWidth = 1.2;
  c.beginPath(); c.moveTo(0, -2.8); c.lineTo(0, -1); c.stroke();
  c.fillStyle = '#ffffff'; c.fillRect(-2.5, -1.5, 5, 3.5);
  c.strokeStyle = 'rgba(148,163,184,0.7)'; c.lineWidth = 0.8;
  c.strokeRect(-2.5, -1.5, 5, 3.5);
  c.beginPath(); c.moveTo(0, -1.5); c.lineTo(0, 2); c.stroke();
  // Gloss kepala
  gloss(c, -5, -16, 6, 3.5, -0.4, 0.55);
  c.restore();
};

// ── ROCKET (menghala atas, api beranimasi) ──
export const drawRocket = (c, f = 0) => {
  c.save();
  // Api ekzos (animated, 3 lapis)
  const fl = 1 + Math.sin(f * 0.6) * 0.3;
  c.fillStyle = 'rgba(251,146,60,0.5)';
  c.beginPath(); c.moveTo(-6.5, 28); c.quadraticCurveTo(0, 28 + 19 * fl, 6.5, 28); c.closePath(); c.fill();
  c.fillStyle = '#fb923c';
  c.beginPath(); c.moveTo(-5, 28); c.quadraticCurveTo(0, 28 + 14 * fl, 5, 28); c.closePath(); c.fill();
  c.fillStyle = '#fde047';
  c.beginPath(); c.moveTo(-2.8, 28); c.quadraticCurveTo(0, 28 + 8.5 * fl, 2.8, 28); c.closePath(); c.fill();
  c.fillStyle = 'rgba(255,255,255,0.85)';
  c.beginPath(); c.moveTo(-1.2, 28); c.quadraticCurveTo(0, 28 + 4 * fl, 1.2, 28); c.closePath(); c.fill();
  // Sirip dengan gradient
  const finG = c.createLinearGradient(-24, 14, 0, 14);
  finG.addColorStop(0, '#7f1d1d'); finG.addColorStop(1, '#ef4444');
  c.fillStyle = finG;
  c.beginPath(); c.moveTo(-12, 8); c.quadraticCurveTo(-24, 18, -20, 28); c.lineTo(-10, 20); c.closePath(); c.fill();
  c.strokeStyle = 'rgba(127,29,29,0.5)'; c.lineWidth = 1; c.stroke();
  const finG2 = c.createLinearGradient(0, 14, 24, 14);
  finG2.addColorStop(0, '#f87171'); finG2.addColorStop(1, '#991b1b');
  c.fillStyle = finG2;
  c.beginPath(); c.moveTo(12, 8); c.quadraticCurveTo(24, 18, 20, 28); c.lineTo(10, 20); c.closePath(); c.fill();
  c.stroke();
  // Badan metalik (5-stop chrome)
  const g = c.createLinearGradient(-13, 0, 13, 0);
  g.addColorStop(0, '#7c8aa0'); g.addColorStop(0.2, '#e8edf3'); g.addColorStop(0.42, '#ffffff');
  g.addColorStop(0.7, '#b9c4d2'); g.addColorStop(1, '#6b7a8f');
  c.fillStyle = g;
  c.beginPath();
  c.moveTo(0, -32);
  c.quadraticCurveTo(14, -16, 13, 4);
  c.quadraticCurveTo(12, 18, 8, 24);
  c.lineTo(-8, 24);
  c.quadraticCurveTo(-12, 18, -13, 4);
  c.quadraticCurveTo(-14, -16, 0, -32);
  c.fill();
  c.strokeStyle = 'rgba(71,85,105,0.45)'; c.lineWidth = 1.2; c.stroke();
  // Panel line
  c.strokeStyle = 'rgba(100,116,139,0.4)'; c.lineWidth = 1;
  c.beginPath(); c.moveTo(-12.5, 8); c.quadraticCurveTo(0, 11, 12.5, 8); c.stroke();
  // Muncung merah berkilat
  c.fillStyle = rg3(c, -3, -24, 13, '#fca5a5', '#ef4444', '#991b1b');
  c.beginPath(); c.moveTo(0, -32); c.quadraticCurveTo(13, -18, 12.2, -10); c.quadraticCurveTo(0, -14, -12.2, -10); c.quadraticCurveTo(-13, -18, 0, -32); c.fill();
  c.strokeStyle = 'rgba(127,29,29,0.4)'; c.lineWidth = 1; c.stroke();
  gloss(c, -4, -24, 4, 7, 0.5, 0.5);
  // Tingkap kaca dalam ring merah
  E(c, 0, -1, 7.8, 7.8);
  c.fillStyle = rg3(c, -1, -2, 8, '#f87171', '#dc2626', '#7f1d1d'); c.fill();
  E(c, 0, -1, 5.6, 5.6);
  c.fillStyle = rg3(c, -1.5, -3, 6, '#e0f2fe', '#38bdf8', '#075985'); c.fill();
  // Pantulan kaca dua lapis
  E(c, -2, -3.5, 2, 1.3, -0.6); c.fillStyle = 'rgba(255,255,255,0.9)'; c.fill();
  c.strokeStyle = 'rgba(255,255,255,0.5)'; c.lineWidth = 1;
  c.beginPath(); c.arc(0, -1, 4.2, Math.PI * 0.7, Math.PI * 1.2); c.stroke();
  // Ekzos
  const exG = c.createLinearGradient(-7, 26, 7, 26);
  exG.addColorStop(0, '#334155'); exG.addColorStop(0.5, '#94a3b8'); exG.addColorStop(1, '#1e293b');
  c.fillStyle = exG;
  c.beginPath(); c.moveTo(-7, 24); c.lineTo(7, 24); c.lineTo(5, 28); c.lineTo(-5, 28); c.closePath(); c.fill();
  // Gloss badan menegak
  gloss(c, -5, -4, 2.5, 14, 0.06, 0.55);
  c.restore();
};

// ── RACE CAR (top-down, depan ke atas, mata comel pada cermin) ──
export const drawCar = (c) => {
  c.save();
  // Bayang bawah kereta
  E(c, 0, 0, 17, 26);
  c.fillStyle = 'rgba(15,23,42,0.25)'; c.fill();
  // Roda dengan rim
  [[-15, -14], [15, -14], [-15, 12], [15, 12]].forEach(([x, y]) => {
    c.fillStyle = '#0f172a';
    c.beginPath(); c.roundRect(x - 4.5, y - 6.5, 9, 13, 3.5); c.fill();
    const tg = c.createLinearGradient(x - 4, y, x + 4, y);
    tg.addColorStop(0, '#475569'); tg.addColorStop(0.5, '#1e293b'); tg.addColorStop(1, '#475569');
    c.fillStyle = tg;
    c.beginPath(); c.roundRect(x - 3.5, y - 5.5, 7, 11, 3); c.fill();
    c.fillStyle = 'rgba(148,163,184,0.5)';
    c.fillRect(x - 3.5, y - 1, 7, 2);
  });
  // Badan merah berkilat (5-stop)
  const g = c.createLinearGradient(-14, 0, 14, 0);
  g.addColorStop(0, '#7f1d1d'); g.addColorStop(0.22, '#ef4444'); g.addColorStop(0.45, '#fda4a4');
  g.addColorStop(0.7, '#dc2626'); g.addColorStop(1, '#7f1d1d');
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
  c.strokeStyle = 'rgba(69,10,10,0.5)'; c.lineWidth = 1.2; c.stroke();
  // Jalur lumba putih dengan shading
  const sg = c.createLinearGradient(-3, 0, 3, 0);
  sg.addColorStop(0, '#cbd5e1'); sg.addColorStop(0.5, '#ffffff'); sg.addColorStop(1, '#cbd5e1');
  c.fillStyle = sg;
  c.fillRect(-3, -26, 6, 48);
  // Cermin depan kaca dengan mata comel
  c.fillStyle = rg3(c, -2, -13, 10, '#bae6fd', '#0ea5e9', '#075985');
  c.beginPath(); c.roundRect(-9, -16, 18, 9, 4); c.fill();
  c.strokeStyle = 'rgba(7,89,133,0.5)'; c.lineWidth = 1; c.stroke();
  E(c, -4, -11.5, 2.6, 3.1); c.fillStyle = '#ffffff'; c.fill();
  E(c, 4, -11.5, 2.6, 3.1); c.fillStyle = '#ffffff'; c.fill();
  E(c, -3.5, -11, 1.5, 1.9); c.fillStyle = '#1e293b'; c.fill();
  E(c, 4.5, -11, 1.5, 1.9); c.fillStyle = '#1e293b'; c.fill();
  E(c, -4.1, -12, 0.6, 0.7); c.fillStyle = '#ffffff'; c.fill();
  E(c, 3.9, -12, 0.6, 0.7); c.fillStyle = '#ffffff'; c.fill();
  // Kokpit + topi keledar berkilat
  c.fillStyle = rg3(c, 0, 0, 9, '#475569', '#1e293b', '#0f172a');
  c.beginPath(); c.roundRect(-8, -3, 16, 10, 4); c.fill();
  E(c, 0, 2, 3.8, 3.8);
  c.fillStyle = rg3(c, -1, 1, 4, '#fde68a', '#fbbf24', '#b45309'); c.fill();
  E(c, -1.2, 0.8, 1.2, 0.9, -0.5); c.fillStyle = 'rgba(255,255,255,0.8)'; c.fill();
  // Spoiler
  const spG = c.createLinearGradient(0, 16, 0, 21);
  spG.addColorStop(0, '#b91c1c'); spG.addColorStop(1, '#450a0a');
  c.fillStyle = spG;
  c.beginPath(); c.roundRect(-14, 16, 28, 5, 2.5); c.fill();
  // Gloss badan (pantulan langit)
  gloss(c, -7, -18, 3, 9, 0.15, 0.4);
  c.restore();
};

// ── BASKET (anyaman + kain berpetak) ──
export const drawBasket = (c) => {
  c.save();
  groundShadow(c, 20, 30, 0.18);
  // Kain berpetak dalam
  c.fillStyle = '#dc2626';
  c.beginPath(); c.roundRect(-20, -18, 40, 8, 4); c.fill();
  c.fillStyle = '#fef2f2';
  for (let i = -16; i < 20; i += 8) c.fillRect(i, -18, 4, 8);
  c.fillStyle = 'rgba(0,0,0,0.15)';
  c.fillRect(-20, -12, 40, 2);
  // Badan bakul
  const g = c.createLinearGradient(0, -14, 0, 18);
  g.addColorStop(0, '#e8930c'); g.addColorStop(0.5, '#b45309'); g.addColorStop(1, '#713f12');
  c.fillStyle = g;
  c.beginPath(); c.moveTo(-24, -12); c.lineTo(24, -12); c.lineTo(18, 18); c.lineTo(-18, 18); c.closePath(); c.fill();
  // Anyaman dengan highlight & shadow per jalur
  for (let y = -7; y < 18; y += 6) {
    const inset = (y + 12) * 0.2;
    c.strokeStyle = 'rgba(120,53,15,0.6)'; c.lineWidth = 2;
    c.beginPath(); c.moveTo(-23 + inset, y); c.lineTo(23 - inset, y); c.stroke();
    c.strokeStyle = 'rgba(253,230,138,0.35)'; c.lineWidth = 1;
    c.beginPath(); c.moveTo(-23 + inset, y - 1.5); c.lineTo(23 - inset, y - 1.5); c.stroke();
  }
  for (let x = -18; x <= 18; x += 7) {
    c.strokeStyle = 'rgba(120,53,15,0.5)'; c.lineWidth = 2;
    c.beginPath(); c.moveTo(x * 1.25, -12); c.lineTo(x, 18); c.stroke();
  }
  // Side shading (bentuk 3D melengkung)
  const sideG = c.createLinearGradient(-24, 0, 24, 0);
  sideG.addColorStop(0, 'rgba(69,26,3,0.4)'); sideG.addColorStop(0.25, 'rgba(0,0,0,0)');
  sideG.addColorStop(0.75, 'rgba(0,0,0,0)'); sideG.addColorStop(1, 'rgba(69,26,3,0.4)');
  c.fillStyle = sideG;
  c.beginPath(); c.moveTo(-24, -12); c.lineTo(24, -12); c.lineTo(18, 18); c.lineTo(-18, 18); c.closePath(); c.fill();
  // Bibir atas berkilat
  const rimG = c.createLinearGradient(0, -15, 0, -8);
  rimG.addColorStop(0, '#e8930c'); rimG.addColorStop(0.5, '#92400e'); rimG.addColorStop(1, '#713f12');
  c.fillStyle = rimG;
  c.beginPath(); c.roundRect(-26, -15, 52, 7, 3.5); c.fill();
  c.strokeStyle = 'rgba(69,26,3,0.5)'; c.lineWidth = 1; c.stroke();
  c.fillStyle = 'rgba(255,237,213,0.45)';
  c.beginPath(); c.roundRect(-25, -14.5, 50, 2.5, 1.5); c.fill();
  c.restore();
};

// ── MOLE (dengan gogal, untuk Ketuk Ceria) ──
export const drawMole = (c, f = 0) => {
  c.save();
  c.translate(0, Math.sin(f * 0.2) * 1.5);
  // Badan
  E(c, 0, 10, 16, 14);
  c.fillStyle = rg3(c, 0, 4, 17, '#d8a23a', '#92610a', '#52300a'); c.fill();
  c.strokeStyle = 'rgba(69,26,3,0.4)'; c.lineWidth = 1.2; c.stroke();
  // Tangan
  [[-14, 0.5], [14, -0.5]].forEach(([x, rot]) => {
    E(c, x, 2, 5, 7, rot);
    c.fillStyle = rg3(c, x, 0, 6, '#b97e16', '#854d0e', '#52300a'); c.fill();
    c.strokeStyle = 'rgba(69,26,3,0.35)'; c.lineWidth = 1; c.stroke();
  });
  // Kepala
  E(c, 0, -8, 13.5, 12);
  c.fillStyle = rg3(c, -1, -13, 14, '#e3b04b', '#a16207', '#5c3a0a'); c.fill();
  c.strokeStyle = 'rgba(69,26,3,0.4)'; c.lineWidth = 1.2; c.stroke();
  // Rim light
  c.strokeStyle = 'rgba(253,230,138,0.4)'; c.lineWidth = 1.5;
  c.beginPath(); c.ellipse(0, -8, 12, 10.5, 0, Math.PI * 1.15, Math.PI * 1.85); c.stroke();
  // Muka cerah
  E(c, 0, -4, 8.5, 7);
  c.fillStyle = rg3(c, 0, -6, 8, '#fef3c7', '#fde68a', '#f5c842'); c.fill();
  // Gogal kaca berkilat
  [[-5, 0], [5, 0]].forEach(([x]) => {
    E(c, x, -10, 4.7, 4.7);
    c.fillStyle = rg3(c, x - 1, -11.5, 5, '#f0f9ff', '#bae6fd', '#60a5fa'); c.fill();
    c.strokeStyle = '#475569'; c.lineWidth = 2; c.stroke();
    E(c, x + 0.5, -9.5, 2.1, 2.5); c.fillStyle = '#1e293b'; c.fill();
    E(c, x - 1, -11.3, 1, 1.1); c.fillStyle = 'rgba(255,255,255,0.95)'; c.fill();
  });
  c.strokeStyle = '#475569'; c.lineWidth = 2;
  c.beginPath(); c.moveTo(-0.5, -10); c.lineTo(0.5, -10); c.stroke();
  // Hidung pink berkilat + gigi
  E(c, 0, -4, 3.1, 2.4);
  c.fillStyle = rg3(c, -0.5, -4.8, 3, '#fbcfe8', '#f472b6', '#be185d'); c.fill();
  E(c, -0.8, -4.8, 0.9, 0.6); c.fillStyle = 'rgba(255,255,255,0.85)'; c.fill();
  c.fillStyle = '#ffffff'; c.fillRect(-2, -1.5, 4, 4);
  c.strokeStyle = 'rgba(148,163,184,0.6)'; c.lineWidth = 0.8; c.strokeRect(-2, -1.5, 4, 4);
  // Gloss kepala
  gloss(c, -4, -14, 5, 3, -0.4, 0.4);
  c.restore();
};