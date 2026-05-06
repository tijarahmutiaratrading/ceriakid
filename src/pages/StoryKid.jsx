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
    cover: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/f57f9479f_generated_image.png',
    moral: 'Sayangi haiwan dan bantu dengan cara selamat.',
    scenes: [
      { image: '🏫', text: 'Ali balik dari sekolah dan terdengar bunyi kucing kecil.', choices: [{ text: 'Cari bunyi itu', next: 1, star: true }, { text: 'Terus balik rumah', next: 2 }] },
      { image: '🐱', text: 'Ali nampak anak kucing tersepit di tepi longkang.', choices: [{ text: 'Panggil orang dewasa', next: 3, star: true }, { text: 'Tarik sendiri kuat-kuat', next: 2 }] },
      { image: '😟', text: 'Kucing masih takut. Ali belajar perlu minta bantuan.', choices: [{ text: 'Cuba semula', next: 0 }] },
      { image: '🥰', text: 'Kucing berjaya diselamatkan. Ali rasa sangat gembira!', choices: [{ text: 'Tamat cerita', next: 'end', star: true }] },
    ],
  },
  {
    id: 'misi-angkasa', title: 'Misi Angkasa Nia', emoji: '🚀', cover: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/3c03de7fd_generated_image.png', moral: 'Berani bertanya dan bekerjasama membawa kejayaan.',
    scenes: [
      { image: '🚀', text: 'Nia menaiki roket ke bulan. Tiba-tiba lampu merah menyala!', choices: [{ text: 'Semak peta bintang', next: 1, star: true }, { text: 'Tekan semua butang', next: 2 }] },
      { image: '🌙', text: 'Peta menunjukkan roket perlu mendarat perlahan di bulan.', choices: [{ text: 'Mendarat perlahan', next: 3, star: true }, { text: 'Turun laju', next: 2 }] },
      { image: '💫', text: 'Roket berpusing! Nia tarik nafas dan cuba fikir semula.', choices: [{ text: 'Cuba semula', next: 0 }] },
      { image: '👽', text: 'Nia bertemu alien comel yang memberi pelekat bintang.', choices: [{ text: 'Tamat cerita', next: 'end', star: true }] },
    ],
  },
  {
    id: 'hutan-bersih', title: 'Sara Jaga Hutan', emoji: '🌳', cover: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/7055e89d0_generated_image.png', moral: 'Jaga alam sekitar bermula dengan tindakan kecil.',
    scenes: [
      { image: '🌲', text: 'Sara pergi berkelah dan nampak sampah di tepi pokok.', choices: [{ text: 'Kutip dan buang dalam tong', next: 1, star: true }, { text: 'Biarkan sahaja', next: 2 }] },
      { image: '🦋', text: 'Rama-rama datang kerana kawasan sudah bersih.', choices: [{ text: 'Ajak kawan bersihkan lagi', next: 3, star: true }, { text: 'Balik terus', next: 3 }] },
      { image: '😢', text: 'Hutan jadi kotor dan haiwan sedih.', choices: [{ text: 'Cuba semula', next: 0 }] },
      { image: '🌈', text: 'Hutan kembali ceria dan semua orang seronok!', choices: [{ text: 'Tamat cerita', next: 'end', star: true }] },
    ],
  },
  {
    id: 'detektif-huruf', title: 'Detektif Huruf Aina', emoji: '🔎', cover: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/391ad2d64_generated_image.png', moral: 'Belajar membaca jadi seronok bila kita cuba perlahan-lahan.',
    scenes: [
      { image: '🔤', text: 'Aina jumpa kotak misteri dengan huruf A di atasnya.', choices: [{ text: 'Cari benda bermula A', next: 1, star: true }, { text: 'Tendang kotak', next: 2 }] },
      { image: '🍎', text: 'Aina jumpa epal! Epal bermula dengan huruf E.', choices: [{ text: 'Cari Ayam pula', next: 3, star: true }, { text: 'Pilih kereta', next: 2 }] },
      { image: '🤔', text: 'Pilihan itu belum tepat. Aina cuba dengar bunyi huruf.', choices: [{ text: 'Cuba semula', next: 0 }] },
      { image: '🐔', text: 'Aina jumpa ayam. Misteri huruf A berjaya diselesaikan!', choices: [{ text: 'Tamat cerita', next: 'end', star: true }] },
    ],
  },
  {
    id: 'pasar-buah', title: 'Bobo di Pasar Buah', emoji: '🍎', cover: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/713c12f6e_generated_image.png', moral: 'Mengira dan memilih makanan sihat itu penting.',
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
        .map(g => ({ id: g.id, title: g.title, emoji: g.emoji || '📖', cover: g.gameData.cover, moral: g.gameData.moral, scenes: g.gameData.scenes }));
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
            <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="p-5 rounded-[2rem] mb-5 overflow-hidden relative" style={cardStyle}>
              <div className="absolute -right-8 -top-8 w-28 h-28 bg-yellow-300/30 rounded-full blur-2xl" />
              <p className="text-yellow-200 text-xs font-black uppercase tracking-[0.2em] mb-2">Interactive Storybook</p>
              <h1 className="text-4xl font-black text-white leading-tight">Story Kid</h1>
              <p className="text-white/75 text-sm font-semibold mt-2">Pilih buku, baca halaman demi halaman, klik pilihan dan kumpul bintang.</p>
            </motion.div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {stories.map((item, idx) => (
                <motion.button key={item.id || idx} initial={{ opacity: 0, y: 18, rotate: -1 }} animate={{ opacity: 1, y: 0, rotate: 0 }} transition={{ delay: idx * 0.06 }} whileHover={{ y: -6, rotate: idx % 2 ? 1.5 : -1.5 }} whileTap={{ scale: 0.97 }} onClick={() => { setSelected(idx); resetStory(); }} className="group text-left">
                  <div className="rounded-[1.8rem] p-3 bg-white/20 shadow-2xl shadow-purple-950/30 border border-white/35">
                    <div className="relative aspect-[4/5] rounded-[1.35rem] overflow-hidden bg-gradient-to-br from-yellow-200 to-pink-200 shadow-inner">
                      {item.cover ? <img src={item.cover} alt={item.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" /> : <div className="w-full h-full flex items-center justify-center text-8xl">{item.emoji}</div>}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-white/10" />
                      <div className="absolute top-3 left-3 px-3 py-1 bg-white/85 rounded-full text-purple-700 text-xs font-black">{item.emoji} Story</div>
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <p className="text-white font-black text-xl leading-tight drop-shadow">{item.title}</p>
                        <p className="text-white/85 text-xs mt-1 line-clamp-2">{item.moral}</p>
                      </div>
                    </div>
                    <div className="mt-3 rounded-2xl bg-white text-purple-700 py-3 text-center font-black shadow-lg group-hover:bg-yellow-300 group-hover:text-yellow-950 transition-colors">Buka Buku →</div>
                  </div>
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
            <div className="mb-4 p-4 rounded-[2rem] flex items-center gap-3 shadow-2xl shadow-purple-950/20" style={cardStyle}>
              <button onClick={() => setSelected(null)} className="w-11 h-11 rounded-2xl bg-white/20 text-white font-black">←</button>
              <div className="text-4xl">{story.emoji}</div>
              <div className="flex-1 min-w-0">
                <h1 className="text-white font-black text-lg truncate">{story.title}</h1>
                <div className="h-2 bg-white/20 rounded-full mt-2 overflow-hidden"><div className="h-full bg-yellow-300 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} /></div>
              </div>
              <div className="text-yellow-300 font-black">{stars} ⭐</div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div key={sceneIndex} initial={{ opacity: 0, rotateY: 35, x: 40 }} animate={{ opacity: 1, rotateY: 0, x: 0 }} exit={{ opacity: 0, rotateY: -35, x: -40 }} transition={{ type: 'spring', stiffness: 120, damping: 18 }} className="rounded-[2rem] shadow-2xl shadow-purple-950/40 bg-amber-50 p-3" style={{ perspective: 1000 }}>
                <div className="rounded-[1.6rem] overflow-hidden border-4 border-white bg-white shadow-inner">
                  <div className="relative h-56 sm:h-72 bg-gradient-to-br from-yellow-100 to-pink-100 overflow-hidden">
                    {story.cover ? <img src={story.cover} alt={story.title} className="absolute inset-0 w-full h-full object-cover opacity-80" /> : null}
                    <div className="absolute inset-0 bg-gradient-to-t from-white via-white/30 to-transparent" />
                    <motion.div animate={{ y: [0, -8, 0], rotate: [0, 2, 0] }} transition={{ duration: 3, repeat: Infinity }} className="absolute inset-0 flex items-center justify-center text-8xl sm:text-9xl drop-shadow-2xl">{scene.image}</motion.div>
                    <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-white/85 text-purple-700 text-xs font-black">Halaman {Math.min(sceneIndex + 1, story.scenes.length)}</div>
                  </div>
                  <div className="p-5 bg-white">
                    <p className="text-slate-800 text-xl sm:text-2xl font-black text-center leading-relaxed mb-5">{scene.text}</p>
                    <div className="space-y-3">
                      {scene.choices.map((choice, idx) => (
                        <motion.button key={idx} whileHover={{ scale: 1.02, x: 4 }} whileTap={{ scale: 0.97 }} onClick={() => choose(choice)} className="w-full p-4 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-500 text-white font-black shadow-lg text-left border-2 border-white">
                          {choice.text}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </>
        )}
      </div>
    </div>
  );
}