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
      className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full text-white/90 text-xs font-bold bg-white/10 hover:bg-white/15 border border-white/20 disabled:opacity-60"
    >
      {isSpeaking ? (
        <>
          <Loader2 className="w-3 h-3 animate-spin" />
          Dengar...
        </>
      ) : (
        <>
          <Volume2 className="w-3 h-3" />
          Dengar
        </>
      )}
    </button>
  );
}