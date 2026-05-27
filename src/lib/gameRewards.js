// Game reward feedback engine — lightweight audio + haptic + combo tracking
// Designed to give kids that "addictive satisfying" feel like premium mobile games.

let _ctx = null;
const getCtx = () => {
  if (typeof window === 'undefined') return null;
  if (_ctx) return _ctx;
  try {
    _ctx = new (window.AudioContext || window.webkitAudioContext)();
  } catch (_) {
    return null;
  }
  if (_ctx.state === 'suspended') {
    const resume = () => { _ctx?.resume(); window.removeEventListener('pointerdown', resume); };
    window.addEventListener('pointerdown', resume, { once: true });
  }
  return _ctx;
};

const tone = ({ freq = 440, duration = 0.15, type = 'sine', volume = 0.18, attack = 0.005, release = 0.08, delay = 0 }) => {
  const ctx = getCtx();
  if (!ctx) return;
  const now = ctx.currentTime + delay;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, now);
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(volume, now + attack);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration + release);
  osc.connect(gain).connect(ctx.destination);
  osc.start(now);
  osc.stop(now + duration + release + 0.05);
};

// Haptic vibration (mobile only — silently ignored elsewhere)
export const haptic = (pattern = 15) => {
  try { navigator.vibrate?.(pattern); } catch (_) {}
};

// Rich correct-answer chord — scales pitch up with combo for escalating reward
export const playCorrectReward = (combo = 0) => {
  const base = 523.25; // C5
  const boost = Math.min(combo, 5) * 60;
  tone({ freq: base + boost, duration: 0.12, type: 'triangle', volume: 0.2, delay: 0 });
  tone({ freq: base * 1.25 + boost, duration: 0.14, type: 'triangle', volume: 0.15, delay: 0.05 });
  tone({ freq: base * 1.5 + boost, duration: 0.18, type: 'sine', volume: 0.15, delay: 0.1 });
  haptic(15);
};

// Gentle "no worries, try again" — descending soft tone, not punishing
export const playGentleWrong = () => {
  tone({ freq: 320, duration: 0.16, type: 'sine', volume: 0.14, delay: 0 });
  tone({ freq: 260, duration: 0.2, type: 'sine', volume: 0.14, delay: 0.08 });
  haptic([30, 60, 30]);
};

// Combo milestone fanfare (every 3, 5, 10 correct in a row)
export const playComboFanfare = (combo) => {
  const notes = combo >= 10
    ? [659, 784, 988, 1175, 1319]   // E5 B5 C6 D6 E6
    : combo >= 5
    ? [523, 659, 784, 1047]         // C5 E5 G5 C6
    : [523, 659, 784];              // C5 E5 G5
  notes.forEach((f, i) => {
    tone({ freq: f, duration: 0.16, type: 'triangle', volume: 0.18, delay: i * 0.08 });
  });
  haptic([20, 30, 20, 30, 40]);
};

// Game-complete victory jingle
export const playVictory = () => {
  const melody = [
    { f: 523, d: 0 },     // C5
    { f: 659, d: 0.12 },  // E5
    { f: 784, d: 0.24 },  // G5
    { f: 1047, d: 0.36 }, // C6
    { f: 1319, d: 0.48 }, // E6
  ];
  melody.forEach(({ f, d }) => {
    tone({ freq: f, duration: 0.2, type: 'triangle', volume: 0.22, delay: d });
  });
  haptic([40, 50, 40, 50, 80]);
};

// Button tap — UI feedback
export const playTap = () => {
  tone({ freq: 660, duration: 0.05, type: 'sine', volume: 0.1 });
  haptic(8);
};

// Combo encouragement messages
export const getComboMessage = (combo) => {
  if (combo >= 10) return { msg: '🔥 TIDAK DAPAT DIHALANG!', emoji: '🔥', size: 'mega' };
  if (combo >= 7) return { msg: '⚡ HEBAT GILER!', emoji: '⚡', size: 'large' };
  if (combo >= 5) return { msg: '🌟 SUPER STREAK!', emoji: '🌟', size: 'large' };
  if (combo >= 3) return { msg: '✨ Combo!', emoji: '✨', size: 'medium' };
  return null;
};