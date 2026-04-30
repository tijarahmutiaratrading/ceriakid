import React, { useState } from 'react';
import { motion } from 'framer-motion';
import AppHeader from '@/components/AppHeader';

export default function StoryAdventureGame() {
  const story = {
    start: {
      text: '🏴‍☠️ Anda mencari harta karun! Di hadapan anda ada dua jalan.',
      image: '🗺️',
      choices: [
        { text: '🌳 Masuk ke hutan', next: 'forest' },
        { text: '🏔️ Pendaki bukit', next: 'mountain' }
      ]
    },
    forest: {
      text: '🌲 Anda memasuki hutan gelap. Tiba-tiba bertemu harimau!',
      image: '🐯',
      choices: [
        { text: '🏃 Lari dengan cepat', next: 'escape', correct: true },
        { text: '💪 Melawan harimau', next: 'fail', correct: false }
      ]
    },
    mountain: {
      text: '⛰️ Anda mendaki bukit tinggi. Langit menjadi gelap dan hujan deras!',
      image: '⛈️',
      choices: [
        { text: '🪨 Turun dengan hati-hati', next: 'escape', correct: true },
        { text: '⚡ Terus naik ke puncak', next: 'fail', correct: false }
      ]
    },
    escape: {
      text: '✅ Anda selamat! Terus cari harta!',
      image: '🎉',
      choices: [
        { text: '💎 Temukan harta karun!', next: 'win' }
      ]
    },
    fail: {
      text: '❌ Anda terjebak dan kalah!',
      image: '😢',
      choices: [
        { text: '🔄 Coba lagi', next: 'start' }
      ]
    },
    win: {
      text: '🏆 Anda menemukan harta karun! Selamat!',
      image: '💎',
      choices: [
        { text: '🔄 Permainan Baru', next: 'start' }
      ]
    }
  };

  const [currentScene, setCurrentScene] = useState('start');
  const [score, setScore] = useState(0);
  const currentStory = story[currentScene];

  const handleChoice = (choice) => {
    if (choice.correct) setScore(score + 10);
    setCurrentScene(choice.next);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-100 to-orange-100">
      <AppHeader showBack={true} backTo="/dashboard" />
      
      <div className="max-w-2xl mx-auto px-4 py-8 pb-24 pt-20">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-black text-gray-800">📖 Petualangan Harta Karun</h1>
          <div className="text-2xl font-black text-orange-600">{score} ⭐</div>
        </div>

        <motion.div
          key={currentScene}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-8 shadow-xl"
        >
          {/* Story Image */}
          <div className="text-8xl text-center mb-6">{currentStory.image}</div>

          {/* Story Text */}
          <p className="text-xl font-bold text-gray-800 text-center mb-8 leading-relaxed">
            {currentStory.text}
          </p>

          {/* Choices */}
          <div className="space-y-3">
            {currentStory.choices.map((choice, idx) => (
              <motion.button
                key={idx}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => handleChoice(choice)}
                className="w-full p-4 bg-gradient-to-r from-amber-400 to-orange-400 text-white rounded-xl font-black text-lg shadow-lg hover:shadow-xl transition-all"
              >
                {choice.text}
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}