// Lightweight Web Audio engine for Drawing Studio.
// Plays satisfying micro-sounds without any external library or audio files.
// Sounds are tiny synthesized tones — kid-friendly and lag-free.

let ctx = null;
let enabled = true;
let lastDrawTone = 0;

const getCtx = () => {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  // Some browsers suspend the context until user gesture
  if (ctx.state === 'suspended') ctx.resume().catch(() => {});
  return ctx;
};

export const setDrawingSoundEnabled = (val) => { enabled = !!val; };
export const isDrawingSoundEnabled = () => enabled;

const playTone = ({ freq = 440, duration = 0.08, type = 'sine', gain = 0.08, attack = 0.005, release = 0.05 }) => {
  if (!enabled) return;
  const ac = getCtx();
  if (!ac) return;
  const now = ac.currentTime;
  const osc = ac.createOscillator();
  const g = ac.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  g.gain.setValueAtTime(0, now);
  g.gain.linearRampToValueAtTime(gain, now + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, now + duration + release);
  osc.connect(g).connect(ac.destination);
  osc.start(now);
  osc.stop(now + duration + release + 0.02);
};

// Soft draw tick — throttled so it doesn't spam. Pitch varies subtly by Y so it feels musical.
export const playDrawTick = (y = 0.5, color = '#000') => {
  if (!enabled) return;
  const now = performance.now();
  if (now - lastDrawTone < 55) return; // throttle ~18 Hz max
  lastDrawTone = now;
  // map y (0=top → 1=bottom) to a friendly pentatonic scale
  const scale = [392, 440, 523, 587, 659, 784]; // G, A, C, D, E, G
  const idx = Math.min(scale.length - 1, Math.max(0, Math.floor((1 - y) * scale.length)));
  const freq = scale[idx] * (0.95 + Math.random() * 0.1);
  // Hint from color hex — warm colors slightly brighter
  playTone({ freq, duration: 0.04, type: 'triangle', gain: 0.025, attack: 0.002, release: 0.04 });
};

export const playStamp = () => {
  if (!enabled) return;
  // little "pop"
  playTone({ freq: 880, duration: 0.05, type: 'sine', gain: 0.08 });
  setTimeout(() => playTone({ freq: 1320, duration: 0.06, type: 'triangle', gain: 0.06 }), 40);
};

export const playUndo = () => {
  if (!enabled) return;
  playTone({ freq: 520, duration: 0.07, type: 'sawtooth', gain: 0.05 });
  setTimeout(() => playTone({ freq: 360, duration: 0.08, type: 'sine', gain: 0.05 }), 60);
};

export const playClear = () => {
  if (!enabled) return;
  playTone({ freq: 220, duration: 0.12, type: 'sawtooth', gain: 0.06 });
};

export const playSaved = () => {
  if (!enabled) return;
  // happy little arpeggio
  const notes = [523, 659, 784, 1047]; // C E G C
  notes.forEach((n, i) => setTimeout(() => playTone({ freq: n, duration: 0.12, type: 'triangle', gain: 0.07 }), i * 90));
};

export const playTadaa = () => {
  if (!enabled) return;
  // celebration chord stab + sparkle
  const chord = [523, 659, 784];
  chord.forEach((n) => playTone({ freq: n, duration: 0.35, type: 'triangle', gain: 0.05, release: 0.25 }));
  setTimeout(() => {
    [1047, 1318, 1568].forEach((n, i) => setTimeout(() => playTone({ freq: n, duration: 0.18, type: 'sine', gain: 0.05 }), i * 70));
  }, 180);
};

export const playButtonTap = () => {
  if (!enabled) return;
  playTone({ freq: 660, duration: 0.04, type: 'sine', gain: 0.04 });
};