import React, { useState, useEffect } from 'react';
import { Volume2, Loader2 } from 'lucide-react';

export default function AudioPlayer({ text, language = 'ms-MY', autoplay = false }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handlePlayAudio = () => {
    if ('speechSynthesis' in window) {
      // Cancel any existing speech
      speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language;
      utterance.rate = 0.9;
      utterance.pitch = 1;

      utterance.onstart = () => {
        setIsSpeaking(true);
        setIsPlaying(true);
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        setIsPlaying(false);
      };

      utterance.onerror = () => {
        setIsSpeaking(false);
        setIsPlaying(false);
      };

      speechSynthesis.speak(utterance);
    }
  };

  useEffect(() => {
    if (autoplay && text) {
      handlePlayAudio();
    }
  }, [autoplay, text]);

  return (
    <button
      onClick={handlePlayAudio}
      disabled={isSpeaking}
      className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full font-black text-white text-sm transition-all active:scale-95 disabled:opacity-75"
      style={{
        background: isSpeaking
          ? 'linear-gradient(135deg, #06b6d4, #3b82f6)'
          : 'linear-gradient(135deg, rgba(59,130,246,0.35), rgba(6,182,212,0.35))',
        backdropFilter: 'blur(12px)',
        border: '1.5px solid rgba(255,255,255,0.4)',
        boxShadow: isSpeaking
          ? '0 6px 20px rgba(6,182,212,0.6), inset 0 1px 1px rgba(255,255,255,0.4)'
          : '0 4px 14px rgba(59,130,246,0.4), inset 0 1px 1px rgba(255,255,255,0.3)',
        textShadow: '0 1px 4px rgba(0,0,0,0.3)',
      }}
    >
      {isSpeaking ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          Dengar...
        </>
      ) : (
        <>
          <Volume2 className="w-4 h-4" />
          Dengar
        </>
      )}
    </button>
  );
}