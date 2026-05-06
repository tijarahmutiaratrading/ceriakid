import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, RotateCcw, Star } from 'lucide-react';
import AppHeader from '@/components/AppHeader';
import { base44 } from '@/api/base44Client';

const SAMPLE_STORIES = [
  {
    id: 'ali-kucing',
    title: 'Ali Tolong Kucing',
    emoji: '🐱',
    moral: 'Sayangi haiwan dan bantu dengan cara selamat.',
    scenes: [
      { image: '🏫', text: 'Ali balik dari sekolah dan terdengar bunyi kucing kecil.', choices: [{ text: 'Cari bunyi itu', next: 1, star: true }, { text: 'Terus balik rumah', next: 2 }] },
      { image: '🐱', text: 'Ali nampak anak kucing tersepit di tepi longkang.', choices: [{ text: 'Panggil orang dewasa', next: 3, star: true }, { text: 'Tarik sendiri kuat-kuat', next: 2 }] },
      { image: '😟', text: 'Kucing masih takut. Ali belajar perlu minta bantuan.', choices: [{ text: 'Cuba semula', next: 0 }] },
      { image: '🥰', text: 'Kucing berjaya diselamatkan. Ali rasa sangat gembira!', choices: [{ text: 'Tamat cerita', next: 'end', star: true }] },
    ],
  },
  {
    id: 'misi-angkasa', title: 'Misi Angkasa Nia', emoji: '🚀', moral: 'Berani bertanya dan bekerjasama membawa kejayaan.',
    scenes: [
      { image: '🚀', text: 'Nia menaiki roket ke bulan. Tiba-tiba lampu merah menyala!', choices: [{ text: 'Semak peta bintang', next: 1, star: true }, { text: 'Tekan semua butang', next: 2 }] },
      { image: '🌙', text: 'Peta menunjukkan roket perlu mendarat perlahan di bulan.', choices: [{ text: 'Mendarat perlahan', next: 3, star: true }, { text: 'Turun laju', next: 2 }] },
      { image: '💫', text: 'Roket berpusing! Nia tarik nafas dan cuba fikir semula.', choices: [{ text: 'Cuba semula', next: 0 }] },
      { image: '👽', text: 'Nia bertemu alien comel yang memberi pelekat bintang.', choices: [{ text: 'Tamat cerita', next: 'end', star: true }] },
    ],
  },
  {
    id: 'hutan-bersih', title: 'Sara Jaga Hutan', emoji: '🌳', moral: 'Jaga alam sekitar bermula dengan tindakan kecil.',
    scenes: [
      { image: '🌲', text: 'Sara pergi berkelah dan nampak sampah di tepi pokok.', choices: [{ text: 'Kutip dan buang dalam tong', next: 1, star: true }, { text: 'Biarkan sahaja', next: 2 }] },
      { image: '🦋', text: 'Rama-rama datang kerana kawasan sudah bersih.', choices: [{ text: 'Ajak kawan bersihkan lagi', next: 3, star: true }, { text: 'Balik terus', next: 3 }] },
      { image: '😢', text: 'Hutan jadi kotor dan haiwan sedih.', choices: [{ text: 'Cuba semula', next: 0 }] },
      { image: '🌈', text: 'Hutan kembali ceria dan semua orang seronok!', choices: [{ text: 'Tamat cerita', next: 'end', star: true }] },
    ],
  },
  {
    id: 'detektif-huruf', title: 'Detektif Huruf Aina', emoji: '🔎', moral: 'Belajar membaca jadi seronok bila kita cuba perlahan-lahan.',
    scenes: [
      { image: '🔤', text: 'Aina jumpa kotak misteri dengan huruf A di atasnya.', choices: [{ text: 'Cari benda bermula A', next: 1, star: true }, { text: 'Tendang kotak', next: 2 }] },
      { image: '🍎', text: 'Aina jumpa epal! Epal bermula dengan huruf E.', choices: [{ text: 'Cari Ayam pula', next: 3, star: true }, { text: 'Pilih kereta', next: 2 }] },
      { image: '🤔', text: 'Pilihan itu belum tepat. Aina cuba dengar bunyi huruf.', choices: [{ text: 'Cuba semula', next: 0 }] },
      { image: '🐔', text: 'Aina jumpa ayam. Misteri huruf A berjaya diselesaikan!', choices: [{ text: 'Tamat cerita', next: 'end', star: true }] },
    ],
  },
  {
    id: 'pasar-buah', title: 'Bobo di Pasar Buah', emoji: '🍎', moral: 'Mengira dan memilih makanan sihat itu penting.',
    scenes: [
      { image: '🧺', text: 'Bobo mahu beli 3 biji buah untuk ibu.', choices: [{ text: 'Kira buah satu-satu', next: 1, star: true }, { text: 'Ambil seberapa banyak', next: 2 }] },
      { image: '🍌', text: 'Bobo sudah ada 1 pisang. Perlu tambah berapa lagi?', choices: [{ text: 'Tambah 2 buah', next: 3, star: true }, { text: 'Tambah 5 buah', next: 2 }] },
      { image: '😅', text: 'Bilangan buah belum betul. Bobo cuba kira semula.', choices: [{ text: 'Cuba semula', next: 0 }] },
      { image: '🍎', text: 'Bobo berjaya beli 3 buah. Ibu sangat bangga!', choices: [{ text: 'Tamat cerita', next: 'end', star: true }] },
    ],
  },
];

const cardStyle = { background: 'rgba(255,255,255,0.22)', backdropFilter: 'blur(22px)', border: '1px solid rgba(255,255,255,0.38)' };

export default function StoryKid() {
  const [stories, setStories] = useState(SAMPLE_STORIES);
  const [selected, setSelected] = useState(null);
  const [sceneIndex, setSceneIndex] = useState(0);
  const [stars, setStars] = useState(0);

  useEffect(() => {
    base44.entities.Game.filter({ category: 'story', isPublished: true }).then((items) => {
      const storyKids = items
        .filter(g => g.gameData?.storyKid === true && Array.isArray(g.gameData?.scenes))
        .map(g => ({ id: g.id, title: g.title, emoji: g.emoji || '📖', moral: g.gameData.moral, scenes: g.gameData.scenes }));
      if (storyKids.length > 0) setStories(storyKids);
    });
  }, []);

  const story = selected !== null ? stories[selected] : null;
  const scene = story?.scenes?.[sceneIndex];
  const progress = useMemo(() => story ? ((sceneIndex + 1) / story.scenes.length) * 100 : 0, [story, sceneIndex]);

  const choose = (choice) => {
    if (choice.star) setStars(s => s + 1);
    if (choice.next === 'end') setSceneIndex(story.scenes.length);
    else setSceneIndex(choice.next);
  };

  const resetStory = () => { setSceneIndex(0); setStars(0); };

  return (
    <div className="min-h-screen font-nunito bg-gradient-to-br from-sky-900 via-purple-900 to-pink-900 relative overflow-hidden">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-20 w-80 h-80 bg-yellow-300 rounded-full blur-3xl opacity-20 animate-pulse" />
        <div className="absolute bottom-10 -left-24 w-80 h-80 bg-cyan-300 rounded-full blur-3xl opacity-20 animate-pulse" />
      </div>
      <AppHeader showBack={true} backTo="/dashboard" />
      <div className="relative max-w-2xl mx-auto px-4 pb-32 pt-28 md:pt-32">
        <Link to="/dashboard" className="inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-full bg-white/85 text-purple-700 font-black text-sm shadow-lg"><ArrowLeft className="w-4 h-4" /> Dashboard</Link>

        {!story ? (
          <>
            <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="p-5 rounded-3xl mb-5" style={cardStyle}>
              <p className="text-5xl mb-3">📖</p>
              <h1 className="text-3xl font-black text-white">Story Kid</h1>
              <p className="text-white/75 text-sm font-semibold">Cerita interaktif — klik pilihan, kumpul bintang, belajar nilai baik.</p>
            </motion.div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {stories.map((item, idx) => (
                <motion.button key={item.id || idx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.04 }} whileTap={{ scale: 0.97 }} onClick={() => { setSelected(idx); resetStory(); }} className="p-4 rounded-3xl text-left shadow-xl" style={cardStyle}>
                  <div className="text-5xl mb-3">{item.emoji}</div>
                  <p className="text-white font-black text-lg leading-tight">{item.title}</p>
                  <p className="text-white/65 text-xs mt-2 line-clamp-2">{item.moral}</p>
                  <p className="text-yellow-300 text-xs font-black mt-3">Mula baca →</p>
                </motion.button>
              ))}
            </div>
          </>
        ) : sceneIndex >= story.scenes.length ? (
          <motion.div initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} className="p-7 rounded-3xl text-center" style={cardStyle}>
            <p className="text-7xl mb-4">🏆</p>
            <h2 className="text-2xl font-black text-white mb-2">Cerita Selesai!</h2>
            <p className="text-yellow-300 font-black text-xl mb-3">{stars} <Star className="inline w-5 h-5 fill-current" /> dikumpul</p>
            <p className="text-white/80 text-sm mb-6"><b>Moral:</b> {story.moral}</p>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={resetStory} className="py-3 rounded-2xl bg-white text-purple-700 font-black flex items-center justify-center gap-2"><RotateCcw className="w-4 h-4" /> Ulang</button>
              <button onClick={() => setSelected(null)} className="py-3 rounded-2xl bg-yellow-300 text-yellow-900 font-black">Cerita Lain</button>
            </div>
          </motion.div>
        ) : (
          <>
            <div className="mb-4 p-4 rounded-3xl flex items-center gap-3" style={cardStyle}>
              <div className="text-4xl">{story.emoji}</div>
              <div className="flex-1 min-w-0">
                <h1 className="text-white font-black text-lg truncate">{story.title}</h1>
                <div className="h-2 bg-white/20 rounded-full mt-2 overflow-hidden"><div className="h-full bg-yellow-300 rounded-full" style={{ width: `${progress}%` }} /></div>
              </div>
              <div className="text-yellow-300 font-black">{stars} ⭐</div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div key={sceneIndex} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} className="p-6 rounded-3xl shadow-2xl" style={cardStyle}>
                <div className="text-8xl text-center mb-5">{scene.image}</div>
                <p className="text-white text-xl font-black text-center leading-relaxed mb-6">{scene.text}</p>
                <div className="space-y-3">
                  {scene.choices.map((choice, idx) => (
                    <motion.button key={idx} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={() => choose(choice)} className="w-full p-4 rounded-2xl bg-white text-purple-700 font-black shadow-lg text-left">
                      {choice.text}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </>
        )}
      </div>
    </div>
  );
}