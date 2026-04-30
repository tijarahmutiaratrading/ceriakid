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
      className={`flex items-center justify-center gap-2 px-5 py-3 sm:px-4 sm:py-2 rounded-lg font-semibold transition-all text-sm sm:text-base ${
        isSpeaking
          ? 'bg-blue-500 text-white scale-105'
          : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
      } disabled:opacity-75 active:scale-95`}
    >
      {isSpeaking ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          Dengar...
        </>
      ) : (
        <>
          <Volume2 className="w-4 h-4" />
          🔊 Dengar
        </>
      )}
    </button>
  );
}