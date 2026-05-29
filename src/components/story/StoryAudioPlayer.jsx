import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Volume2, VolumeX, Music } from 'lucide-react';

const STORAGE_KEY = 'storyKidAudio';
const VOLUME = 0.35;

// Royalty-free kids song dari Pixabay (no attribution required)
// "Happy Kids" / cheerful sing-along untuk story time
const MUSIC_URL = 'https://media.base44.com/files/public/69f1c132ffcd7c660466eec5/4e3ebdaf9_UpbeatEventTripbyInfractionNoCopyrightMusicNeverLeave.mp3';

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

  // Setup audio element sekali sahaja
  useEffect(() => {
    if (!autoPlay) return;

    const audio = new Audio(MUSIC_URL);
    audio.loop = true;
    audio.volume = muted ? 0 : VOLUME;
    audio.preload = 'auto';
    audioRef.current = audio;

    let cleanupListeners = () => {};

    const tryPlay = async () => {
      try {
        await audio.play();
        setIsPlaying(true);
        setNeedsTap(false);
      } catch (e) {
        // Autoplay blocked — tunggu user interact
        setNeedsTap(true);
        const onInteract = async () => {
          cleanupListeners();
          try {
            await audio.play();
            setIsPlaying(true);
            setNeedsTap(false);
          } catch (e2) { /* ignore */ }
        };
        // Guna `pointerdown` (universal: mouse, touch, pen) + `keydown` sebagai fallback
        window.addEventListener('pointerdown', onInteract, { once: true });
        window.addEventListener('keydown', onInteract, { once: true });
        cleanupListeners = () => {
          window.removeEventListener('pointerdown', onInteract);
          window.removeEventListener('keydown', onInteract);
        };
      }
    };

    tryPlay();

    return () => {
      cleanupListeners();
      audio.pause();
      audio.src = '';
      audioRef.current = null;
      setIsPlaying(false);
    };
  }, [autoPlay]); // eslint-disable-line react-hooks/exhaustive-deps

  // Apply mute via volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = muted ? 0 : VOLUME;
    }
  }, [muted]);

  const toggleMute = async (e) => {
    // Stop the event bubbling up to canvas/parent pointer handlers (drawing canvas)
    // and prevent the global autoplay-unlock pointerdown from firing twice.
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    // If audio context is still locked (autoplay blocked), the first tap should
    // start playback instead of just toggling mute state.
    if (needsTap && audioRef.current) {
      try {
        await audioRef.current.play();
        setIsPlaying(true);
        setNeedsTap(false);
        setMuted(false);
      } catch (err) { /* ignore */ }
      return;
    }

    const next = !muted;
    setMuted(next);

    // Bila unmute, pastikan audio main
    if (!next && audioRef.current && audioRef.current.paused) {
      try {
        await audioRef.current.play();
        setIsPlaying(true);
      } catch (err) { /* ignore */ }
    }
  };

  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.92 }}
      onPointerDown={toggleMute}
      animate={needsTap ? { scale: [1, 1.1, 1] } : {}}
      transition={needsTap ? { duration: 1.2, repeat: Infinity } : {}}
      className="relative w-11 h-11 sm:w-10 sm:h-10 rounded-full text-slate-700 flex items-center justify-center ring-1 ring-black/5 hover:bg-white transition cursor-pointer touch-manipulation select-none"
      style={{
        background: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        touchAction: 'manipulation',
        WebkitTapHighlightColor: 'transparent',
      }}
      aria-label={muted ? 'Hidupkan muzik' : 'Senyapkan muzik'}
      title={needsTap ? 'Tap untuk hidupkan muzik' : (muted ? 'Hidupkan muzik' : 'Senyapkan muzik')}
    >
      {muted ? <VolumeX className="w-4 h-4" strokeWidth={2.5} /> : <Volume2 className="w-4 h-4" strokeWidth={2.5} />}

      {/* Playing pulse */}
      {isPlaying && !muted && (
        <motion.span
          animate={{ scale: [1, 1.4, 1], opacity: [0.4, 0, 0.4] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="absolute inset-0 rounded-full bg-pink-400/30 pointer-events-none"
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