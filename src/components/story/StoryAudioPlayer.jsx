import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Volume2, VolumeX } from 'lucide-react';

const TRACK_URL = 'https://cdn.pixabay.com/audio/2022/10/30/audio_347111d2b8.mp3';
const STORAGE_KEY = 'storyKidAudio';
const VOLUME = 0.4;

export default function StoryAudioPlayer({ autoPlay = true }) {
  const audioRef = useRef(null);
  const [muted, setMuted] = useState(false);

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

  // Apply mute to audio
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = muted ? 0 : VOLUME;
    }
  }, [muted]);

  // Autoplay on mount — fallback: wait for first user interaction
  useEffect(() => {
    if (!autoPlay) return;
    const tryPlay = async () => {
      try {
        await audioRef.current?.play();
      } catch (e) {
        const startOnInteract = async () => {
          try { await audioRef.current?.play(); } catch (err) { /* ignore */ }
          window.removeEventListener('click', startOnInteract);
          window.removeEventListener('touchstart', startOnInteract);
        };
        window.addEventListener('click', startOnInteract, { once: true });
        window.addEventListener('touchstart', startOnInteract, { once: true });
      }
    };
    tryPlay();
    return () => { audioRef.current?.pause(); };
  }, [autoPlay]);

  return (
    <>
      <audio ref={audioRef} src={TRACK_URL} loop preload="auto" />
      <motion.button
        whileTap={{ scale: 0.92 }}
        onClick={() => setMuted(m => !m)}
        className="w-11 h-11 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg flex items-center justify-center border-2 border-white/40"
        title={muted ? 'Hidupkan muzik' : 'Senyapkan muzik'}
      >
        {muted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
      </motion.button>
    </>
  );
}