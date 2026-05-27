import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Volume2, VolumeX, Music } from 'lucide-react';

// Reliable royalty-free children's music — hosted on base44 CDN
const TRACK_URL = 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_1718e49b56.mp3?filename=kids-game-gaming-background-music-068.mp3';
const FALLBACK_URL = 'https://cdn.pixabay.com/download/audio/2023/06/19/audio_d57b9e7c10.mp3?filename=happy-children-111912.mp3';
const STORAGE_KEY = 'storyKidAudio';
const VOLUME = 0.35;

export default function StoryAudioPlayer({ autoPlay = true }) {
  const audioRef = useRef(null);
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

  // Apply volume/mute to audio
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = muted ? 0 : VOLUME;
      audioRef.current.muted = muted;
    }
  }, [muted]);

  // Autoplay logic
  useEffect(() => {
    if (!autoPlay) return;
    const audio = audioRef.current;
    if (!audio) return;

    const handlePlay = () => { setIsPlaying(true); setNeedsTap(false); };
    const handlePause = () => setIsPlaying(false);
    const handleError = () => {
      // Try fallback URL if primary fails
      if (audio.src !== FALLBACK_URL) {
        audio.src = FALLBACK_URL;
        audio.load();
        tryPlay();
      }
    };

    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('error', handleError);

    const tryPlay = async () => {
      try {
        await audio.play();
        setNeedsTap(false);
      } catch (e) {
        // Autoplay blocked — show tap indicator + wait for any interaction
        setNeedsTap(true);
        const startOnInteract = async () => {
          try {
            await audio.play();
            setNeedsTap(false);
          } catch (err) { /* ignore */ }
          window.removeEventListener('click', startOnInteract);
          window.removeEventListener('touchstart', startOnInteract);
          window.removeEventListener('keydown', startOnInteract);
        };
        window.addEventListener('click', startOnInteract, { once: true });
        window.addEventListener('touchstart', startOnInteract, { once: true });
        window.addEventListener('keydown', startOnInteract, { once: true });
      }
    };

    tryPlay();

    return () => {
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('error', handleError);
      audio.pause();
    };
  }, [autoPlay]);

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;

    const next = !muted;
    setMuted(next);

    // Bila unmute, pastikan audio tengah main
    if (!next && audio.paused) {
      audio.play().catch(() => setNeedsTap(true));
    }
  };

  return (
    <>
      <audio ref={audioRef} src={TRACK_URL} loop preload="auto" crossOrigin="anonymous" />
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

        {/* Playing pulse indicator */}
        {isPlaying && !muted && (
          <motion.span
            animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="absolute inset-0 rounded-2xl bg-pink-400/40 pointer-events-none"
          />
        )}

        {/* "Tap me" hint bubble bila autoplay blocked */}
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
    </>
  );
}