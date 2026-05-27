import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Volume2, VolumeX, Music } from 'lucide-react';

const STORAGE_KEY = 'storyKidAudio';
const VOLUME = 0.12;

// Melodi lullaby ceria — frekuensi nota dalam Hz (C major scale)
// C4=261.63, D4=293.66, E4=329.63, F4=349.23, G4=392, A4=440, B4=493.88, C5=523.25
const MELODY = [
  { freq: 392.00, dur: 0.4 }, // G
  { freq: 440.00, dur: 0.4 }, // A
  { freq: 523.25, dur: 0.5 }, // C5
  { freq: 440.00, dur: 0.4 }, // A
  { freq: 392.00, dur: 0.4 }, // G
  { freq: 349.23, dur: 0.5 }, // F
  { freq: 329.63, dur: 0.4 }, // E
  { freq: 293.66, dur: 0.4 }, // D
  { freq: 329.63, dur: 0.5 }, // E
  { freq: 349.23, dur: 0.4 }, // F
  { freq: 392.00, dur: 0.6 }, // G (longer)
  { freq: 0, dur: 0.3 },      // rest
];

export default function StoryAudioPlayer({ autoPlay = true }) {
  const ctxRef = useRef(null);
  const gainRef = useRef(null);
  const timeoutRef = useRef(null);
  const stoppedRef = useRef(false);
  const [muted, setMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [needsTap, setNeedsTap] = useState(false);

  // Load saved mute preference
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      if (typeof saved.muted === 'boolean') setMuted(saved.muted);
    } catch (e) { /* ignore */ }
  }, []);

  // Persist mute preference
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ muted }));
    } catch (e) { /* ignore */ }
  }, [muted]);

  // Apply mute via gain node
  useEffect(() => {
    if (gainRef.current && ctxRef.current) {
      gainRef.current.gain.setTargetAtTime(muted ? 0 : VOLUME, ctxRef.current.currentTime, 0.05);
    }
  }, [muted]);

  const playNote = (freq, dur, startTime) => {
    const ctx = ctxRef.current;
    if (!ctx || freq === 0) return;

    const osc = ctx.createOscillator();
    const noteGain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.value = freq;

    // Soft envelope — fade in/out untuk elak click sounds
    noteGain.gain.setValueAtTime(0, startTime);
    noteGain.gain.linearRampToValueAtTime(1, startTime + 0.04);
    noteGain.gain.linearRampToValueAtTime(1, startTime + dur - 0.08);
    noteGain.gain.linearRampToValueAtTime(0, startTime + dur);

    osc.connect(noteGain);
    noteGain.connect(gainRef.current);
    osc.start(startTime);
    osc.stop(startTime + dur);
  };

  const playMelodyLoop = () => {
    if (stoppedRef.current) return;
    const ctx = ctxRef.current;
    if (!ctx) return;

    let cursor = ctx.currentTime + 0.05;
    MELODY.forEach(({ freq, dur }) => {
      playNote(freq, dur, cursor);
      cursor += dur;
    });

    // Schedule next loop
    const totalDur = MELODY.reduce((s, n) => s + n.dur, 0);
    timeoutRef.current = setTimeout(playMelodyLoop, totalDur * 1000);
  };

  const startAudio = async () => {
    try {
      if (!ctxRef.current) {
        const Ctx = window.AudioContext || window.webkitAudioContext;
        if (!Ctx) return false;
        ctxRef.current = new Ctx();
        gainRef.current = ctxRef.current.createGain();
        gainRef.current.gain.value = muted ? 0 : VOLUME;
        gainRef.current.connect(ctxRef.current.destination);
      }

      // Resume context (often suspended sampai user interact)
      if (ctxRef.current.state === 'suspended') {
        await ctxRef.current.resume();
      }

      if (ctxRef.current.state === 'running') {
        stoppedRef.current = false;
        setIsPlaying(true);
        setNeedsTap(false);
        playMelodyLoop();
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  };

  // Autoplay logic — cuba terus, kalau gagal tunggu user click
  useEffect(() => {
    if (!autoPlay) return;

    let cancelled = false;

    const tryStart = async () => {
      const ok = await startAudio();
      if (!ok && !cancelled) {
        setNeedsTap(true);
        const onInteract = async () => {
          window.removeEventListener('click', onInteract);
          window.removeEventListener('touchstart', onInteract);
          window.removeEventListener('keydown', onInteract);
          await startAudio();
        };
        window.addEventListener('click', onInteract, { once: true });
        window.addEventListener('touchstart', onInteract, { once: true });
        window.addEventListener('keydown', onInteract, { once: true });
      }
    };

    tryStart();

    return () => {
      cancelled = true;
      stoppedRef.current = true;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (ctxRef.current) {
        try { ctxRef.current.close(); } catch (e) { /* ignore */ }
        ctxRef.current = null;
        gainRef.current = null;
      }
      setIsPlaying(false);
    };
  }, [autoPlay]);

  const toggleMute = async () => {
    const next = !muted;
    setMuted(next);

    // Bila unmute, pastikan audio context aktif
    if (!next && ctxRef.current?.state === 'suspended') {
      await ctxRef.current.resume();
    }
    if (!next && !ctxRef.current) {
      await startAudio();
    }
  };

  return (
    <motion.button
      whileTap={{ scale: 0.92 }}
      onClick={toggleMute}
      animate={needsTap ? { scale: [1, 1.1, 1] } : {}}
      transition={needsTap ? { duration: 1.2, repeat: Infinity } : {}}
      className={`relative w-11 h-11 rounded-2xl text-white shadow-lg flex items-center justify-center border-2 border-white/40 ${
        muted
          ? 'bg-gradient-to-br from-slate-500 to-slate-700'
          : 'bg-gradient-to-br from-purple-500 to-pink-500'
      }`}
      title={needsTap ? 'Tap untuk hidupkan muzik' : (muted ? 'Hidupkan muzik' : 'Senyapkan muzik')}
    >
      {muted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}

      {/* Playing pulse */}
      {isPlaying && !muted && (
        <motion.span
          animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="absolute inset-0 rounded-2xl bg-pink-400/40 pointer-events-none"
        />
      )}

      {/* "Tap!" hint bubble */}
      {needsTap && (
        <motion.span
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute -bottom-7 right-0 px-2 py-0.5 rounded-full bg-yellow-300 text-yellow-900 text-[10px] font-black whitespace-nowrap shadow-lg"
        >
          <Music className="w-2.5 h-2.5 inline mr-0.5" /> Tap!
        </motion.span>
      )}
    </motion.button>
  );
}