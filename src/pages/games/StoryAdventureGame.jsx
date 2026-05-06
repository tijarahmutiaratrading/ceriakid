import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import AppHeader from '@/components/AppHeader';

const glassCard = { background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.4)' };

const STORIES = [
  {
    title: '🏴‍☠️ Harta Karun',
    start: 'start',
    scenes: {
      start: { text: 'Anda mencari harta karun! Ada dua jalan di hadapan.', image: '🗺️', choices: [{ text: '🌳 Masuk ke hutan', next: 'forest' }, { text: '🏔️ Pendaki bukit', next: 'mountain' }] },
      forest: { text: 'Bertemu harimau dalam hutan!', image: '🐯', choices: [{ text: '🏃 Lari dengan cepat', next: 'win', correct: true }, { text: '💪 Melawan harimau', next: 'fail' }] },
      mountain: { text: 'Hujan lebat di atas bukit!', image: '⛈️', choices: [{ text: '🪨 Turun dengan hati-hati', next: 'win', correct: true }, { text: '⚡ Terus naik', next: 'fail' }] },
      win: { text: '🏆 Anda menemukan harta karun!', image: '💎', choices: [{ text: '🔄 Main lagi', next: 'start' }] },
      fail: { text: '😢 Anda terjebak dan kalah!', image: '😢', choices: [{ text: '🔄 Cuba lagi', next: 'start' }] },
    }
  },
  {
    title: '🚀 Angkasawan',
    start: 'start',
    scenes: {
      start: { text: 'Anda angkasawan! Roket anda hampir kehabisan bahan api.', image: '🚀', choices: [{ text: '🌙 Mendarat di bulan', next: 'moon' }, { text: '⭐ Cari bintang bahan api', next: 'star' }] },
      moon: { text: 'Di bulan ada alien! Apa yang anda buat?', image: '👽', choices: [{ text: '🤝 Beri salam', next: 'win', correct: true }, { text: '😱 Lari ketakutan', next: 'fail' }] },
      star: { text: 'Bintang terlalu panas! Bagaimana?', image: '⭐', choices: [{ text: '🛡️ Guna perisai panas', next: 'win', correct: true }, { text: '🚀 Terus mendekati', next: 'fail' }] },
      win: { text: '🎉 Berjaya! Anda selamat sampai ke bumi!', image: '🌍', choices: [{ text: '🔄 Main lagi', next: 'start' }] },
      fail: { text: '💥 Roket rosak! Misi gagal.', image: '💥', choices: [{ text: '🔄 Cuba lagi', next: 'start' }] },
    }
  },
  {
    title: '🌊 Penyelamat Lautan',
    start: 'start',
    scenes: {
      start: { text: 'Ikan paus terdampar di pantai! Anda perlu tolong.', image: '🐋', choices: [{ text: '🪣 Siram dengan air', next: 'water' }, { text: '🏊 Tarik ke laut', next: 'pull' }] },
      water: { text: 'Air tidak cukup! Perlukan lebih air.', image: '💧', choices: [{ text: '🚒 Panggil bomba', next: 'win', correct: true }, { text: '🧃 Guna air minum', next: 'fail' }] },
      pull: { text: 'Paus terlalu berat! Bagaimana?', image: '😓', choices: [{ text: '👥 Minta bantuan ramai', next: 'win', correct: true }, { text: '💪 Tarik sorang-sorang', next: 'fail' }] },
      win: { text: '🎊 Paus selamat kembali ke laut!', image: '🌊', choices: [{ text: '🔄 Main lagi', next: 'start' }] },
      fail: { text: '😢 Paus tidak sempat diselamatkan.', image: '😢', choices: [{ text: '🔄 Cuba lagi', next: 'start' }] },
    }
  },
  {
    title: '🏕️ Petualang Hutan',
    start: 'start',
    scenes: {
      start: { text: 'Anda tersesat dalam hutan. Hari pun semakin gelap.', image: '🌲', choices: [{ text: '🔥 Buat api unggun', next: 'fire' }, { text: '🏃 Lari cari jalan', next: 'run' }] },
      fire: { text: 'Api sudah menyala! Ada suara pelik berhampiran.', image: '🔥', choices: [{ text: '🔦 Periksa dengan cermat', next: 'win', correct: true }, { text: '😱 Lompat dalam semak', next: 'fail' }] },
      run: { text: 'Anda terjatuh dalam gelap!', image: '🌑', choices: [{ text: '🆘 Panggil bantuan', next: 'win', correct: true }, { text: '💤 Tidur di situ', next: 'fail' }] },
      win: { text: '🎉 Bantuan tiba! Anda selamat!', image: '🏕️', choices: [{ text: '🔄 Main lagi', next: 'start' }] },
      fail: { text: '😓 Anda tidak ditemui malam itu.', image: '😢', choices: [{ text: '🔄 Cuba lagi', next: 'start' }] },
    }
  },
  {
    title: '🏰 Puteri & Naga',
    start: 'start',
    scenes: {
      start: { text: 'Naga telah menawan puteri di menara! Anda kesatria yang gagah.', image: '🏰', choices: [{ text: '⚔️ Serang naga', next: 'attack' }, { text: '🎵 Nyanyi untuk naga', next: 'sing' }] },
      attack: { text: 'Naga terlalu kuat! Pedang anda patah.', image: '🐉', choices: [{ text: '🛡️ Guna perisai ajaib', next: 'win', correct: true }, { text: '😤 Terus melawan', next: 'fail' }] },
      sing: { text: 'Naga suka muzik! Dia mula menari.', image: '🎵', choices: [{ text: '🗝️ Ambil kunci semasa naga menari', next: 'win', correct: true }, { text: '📸 Ambil gambar sahaja', next: 'fail' }] },
      win: { text: '👑 Puteri bebas! Anda wira hari ini!', image: '👑', choices: [{ text: '🔄 Main lagi', next: 'start' }] },
      fail: { text: '😢 Puteri masih dalam menara.', image: '😢', choices: [{ text: '🔄 Cuba lagi', next: 'start' }] },
    }
  },
];

export default function StoryAdventureGame() {
  const [storyIdx, setStoryIdx] = useState(0);
  const [currentScene, setCurrentScene] = useState('start');
  const [score, setScore] = useState(0);
  const [storyDone, setStoryDone] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  const story = STORIES[storyIdx];
  const currentStory = story.scenes[currentScene];

  const handleChoice = (choice) => {
    if (choice.correct) setScore(s => s + 10);
    if (choice.next === 'start' && storyDone) return;
    setCurrentScene(choice.next);
    if (choice.next === 'win') setStoryDone(true);
  };

  const nextStory = () => {
    if (storyIdx + 1 >= STORIES.length) { setGameOver(true); }
    else { setStoryIdx(i => i + 1); setCurrentScene('start'); setStoryDone(false); }
  };

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #667eea 0%, #f093fb 50%, #f5a623 100%)' }}>
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-amber-300 rounded-full mix-blend-multiply filter blur-3xl opacity-25 animate-pulse" />
      </div>
      <AppHeader showBack={true} backTo="/games-hub" />
      <div className="relative max-w-lg mx-auto px-4 pb-32 pt-28 md:pt-32">
        <Link to="/mini-games/story" className="inline-flex items-center gap-2 mb-4 px-4 py-2.5 rounded-full bg-white/80 text-game-purple font-black text-sm shadow-lg hover:bg-white transition-all">
          <ArrowLeft className="w-4 h-4" /> Kembali ke mini games
        </Link>

        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          className="mb-5 p-5 rounded-3xl flex items-center justify-between" style={glassCard}>
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-white/30 flex items-center justify-center text-3xl shadow-inner">📖</div>
            <div>
              <h1 className="text-xl font-black text-white">{story.title}</h1>
              <p className="text-white/70 text-xs">Cerita {storyIdx + 1} / {STORIES.length}</p>
            </div>
          </div>
          <div className="text-2xl font-black text-white">{score} ⭐</div>
        </motion.div>

        <div className="flex gap-2 mb-4">
          {STORIES.map((_, i) => (
            <div key={i} className={`flex-1 h-2 rounded-full transition-all ${i < storyIdx ? 'bg-white' : i === storyIdx ? 'bg-white/70' : 'bg-white/20'}`} />
          ))}
        </div>

        {gameOver ? (
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
            className="rounded-3xl p-8 text-center" style={glassCard}>
            <p className="text-5xl mb-3">🏆</p>
            <h2 className="text-2xl font-black text-white mb-4">Semua Cerita Selesai!</h2>
            <p className="text-yellow-300 text-3xl font-black mb-6">Skor: {score} ⭐</p>
            <motion.button whileTap={{ scale: 0.95 }} onClick={() => { setStoryIdx(0); setCurrentScene('start'); setScore(0); setStoryDone(false); setGameOver(false); }}
              className="px-6 py-3 bg-white text-purple-600 rounded-full font-black">Mula Semula</motion.button>
          </motion.div>
        ) : (
          <>
            <motion.div key={currentScene} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="rounded-3xl p-8 mb-4" style={glassCard}>
              <div className="text-8xl text-center mb-6">{currentStory.image}</div>
              <p className="text-xl font-bold text-white text-center mb-8 leading-relaxed">{currentStory.text}</p>
              <div className="space-y-3">
                {currentStory.choices.map((choice, idx) => (
                  <motion.button key={idx} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                    onClick={() => handleChoice(choice)}
                    className="w-full p-4 bg-white text-purple-700 rounded-2xl font-black text-base shadow-lg">
                    {choice.text}
                  </motion.button>
                ))}
              </div>
            </motion.div>

            {storyDone && currentScene === 'win' && (
              <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                whileTap={{ scale: 0.95 }} onClick={nextStory}
                className="w-full py-4 bg-white text-purple-600 rounded-2xl font-black shadow-lg text-lg">
                {storyIdx + 1 >= STORIES.length ? 'Tamat! Lihat Skor 🏆' : 'Cerita Seterusnya →'}
              </motion.button>
            )}
          </>
        )}
      </div>
    </div>
  );
}