import React from 'react';
import { motion } from 'framer-motion';

export default function GameTutorial({ gameType, onComplete }) {
  const tutorials = {
    multiple_choice: {
      title: '📌 Pilih Jawapan Betul',
      steps: [
        '👀 Baca soalan dengan teliti',
        '🎯 Lihat 4 pilihan jawapan',
        '✋ Tap jawapan yang kamu rasa betul',
        '🎉 Betul dapat ⭐ bintang!',
      ],
    },
    letter_match: {
      title: '🔤 Padankan Huruf',
      steps: [
        '👀 Lihat huruf yang ditunjukkan',
        '🎯 Cari huruf yang sama',
        '✋ Tap pada pilihan yang betul',
        '🎉 Sempurna dapat ⭐ bintang!',
      ],
    },
    number_match: {
      title: '🔢 Padankan Angka',
      steps: [
        '👀 Hitung emoji di atas',
        '🎯 Pilih angka yang sama',
        '✋ Tap jawapan kamu',
        '🎉 Betul, bagus sekali!',
      ],
    },
    picture_quiz: {
      title: '🖼️ Teka Gambar',
      steps: [
        '👀 Lihat gambar dengan cermat',
        '🤔 Pikirkan apa itu?',
        '✋ Tap jawapan yang betul',
        '🎉 Tepat, pandai kamu!',
      ],
    },
    tracing: {
      title: '✏️ Lukis Bentuk',
      steps: [
        '👀 Lihat bentuk di atas',
        '✋ Sentuh & lukis mengikuti garis',
        '⭐ Semakin tepat semakin besar bintang',
        '🎉 Bagus, mari main lagi!',
      ],
    },
  };

  const tutorial = tutorials[gameType] || tutorials.multiple_choice;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-3xl p-8 max-w-sm mx-4 clay"
      >
        <h2 className="text-3xl font-black mb-6 text-center">{tutorial.title}</h2>

        <div className="space-y-4 mb-8">
          {tutorial.steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex items-start gap-4 bg-gradient-to-r from-game-yellow/20 to-game-pink/20 p-4 rounded-2xl"
            >
              <span className="text-2xl flex-shrink-0">{i + 1}</span>
              <p className="font-semibold text-gray-700">{step}</p>
            </motion.div>
          ))}
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onComplete}
          className="w-full py-4 bg-game-purple text-white rounded-2xl font-black text-lg"
        >
          Siap! Mari Main 🎮
        </motion.button>
      </motion.div>
    </div>
  );
}