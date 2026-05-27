import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Music, Play, Pause, Volume2, VolumeX, ChevronUp, ChevronDown } from 'lucide-react';

// Royalty-free ambient/lullaby tracks (Pixabay CDN — no attribution required)
const TRACKS = [
  { id: 'lullaby', name: 'Lullaby Lembut', emoji: '🌙', url: 'https://cdn.pixabay.com/audio/2022/10/30/audio_347111d2b8.mp3' },
  { id: 'fairytale', name: 'Cerita Dongeng', emoji: '✨', url: 'https://cdn.pixabay.com/audio/2023/09/05/audio_168a3e22d4.mp3' },
  { id: 'adventure', name: 'Pengembaraan', emoji: '🚀', url: 'https://cdn.pixabay.com/audio/2024/02/05/audio_d0eb6cce95.mp3' },
];

const STORAGE_KEY = 'storyKidAudio';

export default function StoryAudioPlayer({ autoPlay = true }) {
  const audioRef = useRef(null);
  const [trackId, setTrackId] = useState('lullaby');
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.4);
  const [expanded, setExpanded] = useState(false);
  const [muted, setMuted] = useState(false);

  // Load saved preferences
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      if (saved.trackId) setTrackId(saved.trackId);
      if (typeof saved.volume === 'number') setVolume(saved.volume);
      if (typeof saved.muted === 'boolean') setMuted(saved.muted);
    } catch (e) { /* ignore */ }
  }, []);

  // Persist preferences
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ trackId, volume, muted }));
    } catch (e) { /* ignore */ }
  }, [trackId, volume, muted]);

  // Apply volume / mute to audio
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = muted ? 0 : volume;
    }
  }, [volume, muted]);

  // Try autoplay on mount — fallback: wait for first user interaction
  useEffect(() => {
    if (!autoPlay) return;
    const tryPlay = async () => {
      try {
        await audioRef.current?.play();
        setIsPlaying(true);
      } catch (e) {
        // Browser blocked autoplay — wait for any user click
        const startOnInteract = async () => {
          try {
            await audioRef.current?.play();
            setIsPlaying(true);
          } catch (err) { /* ignore */ }
          window.removeEventListener('click', startOnInteract);
          window.removeEventListener('touchstart', startOnInteract);
        };
        window.addEventListener('click', startOnInteract, { once: true });
        window.addEventListener('touchstart', startOnInteract, { once: true });
      }
    };
    tryPlay();
    return () => {
      audioRef.current?.pause();
    };
  }, [autoPlay]);

  // Reload audio when track changes
  useEffect(() => {
    if (audioRef.current && isPlaying) {
      audioRef.current.load();
      audioRef.current.play().catch(() => setIsPlaying(false));
    }
  }, [trackId]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggle = async () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      try {
        await audioRef.current.play();
        setIsPlaying(true);
      } catch (e) { /* ignore */ }
    }
  };

  const currentTrack = TRACKS.find(t => t.id === trackId) || TRACKS[0];

  return (
    <>
      <audio ref={audioRef} src={currentTrack.url} loop preload="auto" />

      <div className="relative z-40">
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="absolute top-full right-0 mt-2 w-64 rounded-3xl p-4 bg-white/95 backdrop-blur-xl shadow-2xl border border-white/60"
            >
              <div className="flex items-center justify-between mb-3">
                <p className="text-purple-800 font-black text-sm flex items-center gap-1.5">
                  <Music className="w-4 h-4" /> Muzik Latar
                </p>
                <button onClick={() => setExpanded(false)} className="text-purple-400 hover:text-purple-700">
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>

              {/* Track picker */}
              <div className="space-y-1.5 mb-3">
                {TRACKS.map(t => (
                  <button
                    key={t.id}
                    onClick={() => setTrackId(t.id)}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-black transition-all ${
                      trackId === t.id
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md'
                        : 'bg-purple-50 text-purple-700 hover:bg-purple-100'
                    }`}
                  >
                    <span className="text-base">{t.emoji}</span>
                    <span className="flex-1 text-left">{t.name}</span>
                    {trackId === t.id && isPlaying && (
                      <span className="text-[10px] opacity-80">▶ Main</span>
                    )}
                  </button>
                ))}
              </div>

              {/* Volume */}
              <div className="flex items-center gap-2">
                <button onClick={() => setMuted(m => !m)} className="text-purple-600 hover:text-purple-800 flex-shrink-0">
                  {muted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={muted ? 0 : volume}
                  onChange={(e) => { setVolume(parseFloat(e.target.value)); setMuted(false); }}
                  className="flex-1 accent-purple-600"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating button */}
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={() => setExpanded(e => !e)}
          className="relative w-11 h-11 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg flex items-center justify-center border-2 border-white/40"
        >
          {isPlaying ? (
            <Music className="w-5 h-5 animate-pulse" />
          ) : (
            <Music className="w-5 h-5 opacity-70" />
          )}
          <button
            onClick={(e) => { e.stopPropagation(); toggle(); }}
            className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-white text-purple-700 shadow-md flex items-center justify-center border border-purple-200"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <Pause className="w-2.5 h-2.5" /> : <Play className="w-2.5 h-2.5 ml-0.5" />}
          </button>
        </motion.button>
      </div>
    </>
  );
}