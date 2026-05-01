import React, { useState } from 'react';
import { motion } from 'framer-motion';
import AppHeader from '@/components/AppHeader';

const glassCard = { background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.4)' };

export default function StoryAdventureGame() {
  const story = {
    start: { text: '🏴‍☠️ Anda mencari harta karun! Di hadapan anda ada dua jalan.', image: '🗺️', choices: [{ text: '🌳 Masuk ke hutan', next: 'forest' }, { text: '🏔️ Pendaki bukit', next: 'mountain' }] },
    forest: { text: '🌲 Anda memasuki hutan gelap. Tiba-tiba bertemu harimau!', image: '🐯', choices: [{ text: '🏃 Lari dengan cepat', next: 'escape', correct: true }, { text: '💪 Melawan harimau', next: 'fail', correct: false }] },
    mountain: { text: '⛰️ Anda mendaki bukit tinggi. Langit menjadi gelap dan hujan deras!', image: '⛈️', choices: [{ text: '🪨 Turun dengan hati-hati', next: 'escape', correct: true }, { text: '⚡ Terus naik ke puncak', next: 'fail', correct: false }] },
    escape: { text: '✅ Anda selamat! Terus cari harta!', image: '🎉', choices: [{ text: '💎 Temukan harta karun!', next: 'win' }] },
    fail: { text: '❌ Anda terjebak dan kalah!', image: '😢', choices: [{ text: '🔄 Cuba lagi', next: 'start' }] },
    win: { text: '🏆 Anda menemukan harta karun! Selamat!', image: '💎', choices: [{ text: '🔄 Permainan Baru', next: 'start' }] },
  };

  const [currentScene, setCurrentScene] = useState('start');
  const [score, setScore] = useState(0);
  const currentStory = story[currentScene];

  const handleChoice = (choice) => {
    if (choice.correct) setScore(score + 10);
    setCurrentScene(choice.next);
  };

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #667eea 0%, #f093fb 50%, #f5a623 100%)' }}>
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-amber-300 rounded-full mix-blend-multiply filter blur-3xl opacity-25 animate-pulse" />
        <div className="absolute bottom-20 left-10 w-72 h-72 bg-orange-300 rounded-full mix-blend-multiply filter blur-3xl opacity-25 animate-pulse" style={{ animationDelay: '1s' }} />
      </div>
      <AppHeader showBack={true} backTo="/games-hub" />
      <div className="relative max-w-lg mx-auto px-4 pb-32 pt-8">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          className="mb-5 p-5 rounded-3xl flex items-center justify-between" style={glassCard}>
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-white/30 flex items-center justify-center text-3xl shadow-inner">📖</div>
            <div>
              <h1 className="text-xl font-black text-white">Petualangan Harta</h1>
              <p className="text-white/70 text-xs">Pilih jalan yang tepat!</p>
            </div>
          </div>
          <div className="text-2xl font-black text-white">{score} ⭐</div>
        </motion.div>

        <motion.div key={currentScene} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl p-8" style={glassCard}>
          <div className="text-8xl text-center mb-6">{currentStory.image}</div>
          <p className="text-xl font-bold text-white text-center mb-8 leading-relaxed">{currentStory.text}</p>
          <div className="space-y-3">
            {currentStory.choices.map((choice, idx) => (
              <motion.button key={idx} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                onClick={() => handleChoice(choice)}
                className="w-full p-4 bg-white text-purple-700 rounded-2xl font-black text-base shadow-lg hover:shadow-xl transition-all">
                {choice.text}
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}