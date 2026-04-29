// Sound manager for game feedback effects

const audioContext = typeof window !== 'undefined' ? new (window.AudioContext || window.webkitAudioContext)() : null;

export const playSound = (type) => {
  if (!audioContext) return;

  const now = audioContext.currentTime;
  const duration = type === 'correct' ? 0.4 : 0.3;

  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();

  oscillator.connect(gain);
  gain.connect(audioContext.destination);

  if (type === 'correct') {
    // Success: ascending tones
    oscillator.frequency.setValueAtTime(523.25, now); // C5
    oscillator.frequency.setValueAtTime(659.25, now + 0.15); // E5
    oscillator.frequency.setValueAtTime(783.99, now + 0.3); // G5
  } else if (type === 'wrong') {
    // Error: descending tone
    oscillator.frequency.setValueAtTime(349.23, now); // F4
    oscillator.frequency.setValueAtTime(261.63, now + 0.15); // C4
  } else if (type === 'click') {
    // Subtle click
    oscillator.frequency.setValueAtTime(800, now);
    gain.gain.setValueAtTime(0.1, now);
  } else if (type === 'complete') {
    // Completion: cheerful chord
    oscillator.frequency.setValueAtTime(523.25, now);
    oscillator.frequency.setValueAtTime(659.25, now + 0.1);
    oscillator.frequency.setValueAtTime(783.99, now + 0.2);
  }

  gain.gain.setValueAtTime(type === 'click' ? 0.1 : 0.3, now);
  gain.gain.exponentialRampToValueAtTime(0.01, now + duration);

  oscillator.start(now);
  oscillator.stop(now + duration);
};

export const speakText = (text, language = 'ms-MY') => {
  if (!('speechSynthesis' in window)) return;

  speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = language;
  utterance.rate = 0.9;
  utterance.pitch = 1;

  speechSynthesis.speak(utterance);
};

export default { playSound, speakText };