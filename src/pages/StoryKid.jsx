import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, RotateCcw, Star, BookOpen, Sparkles, Trophy, ChevronRight } from 'lucide-react';
import AppHeader from '@/components/AppHeader';
import StorySlideVisual from '@/components/story/StorySlideVisual';
import StoryAudioPlayer from '@/components/story/StoryAudioPlayer';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { useSelectedChild } from '@/lib/SelectedChildContext';
import { saveActivityProgress } from '@/lib/activityProgress';

const SAMPLE_STORIES = [
  {
    id: 'ali-kucing',
    title: 'Ali Tolong Kucing',
    emoji: '🐱',
    cover: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/f57f9479f_generated_image.png',
    moral: 'Sayangi haiwan dan bantu dengan cara selamat.',
    scenes: [
      { imageUrl: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/0a97ddf90_generated_image.png', text: 'Ali balik dari sekolah dan terdengar bunyi kucing kecil.', choices: [{ text: 'Cari bunyi itu', next: 1, star: true }, { text: 'Terus balik rumah', next: 2 }] },
      { imageUrl: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/3ff2b9379_generated_image.png', text: 'Ali nampak anak kucing tersepit di tepi longkang.', choices: [{ text: 'Panggil orang dewasa', next: 3, star: true }, { text: 'Tarik sendiri kuat-kuat', next: 2 }] },
      { imageUrl: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/fdbdb4e85_generated_image.png', text: 'Kucing masih takut. Ali belajar perlu minta bantuan.', choices: [{ text: 'Cari cikgu berdekatan', next: 4, star: true }, { text: 'Cuba semula dari awal', next: 0 }] },
      { imageUrl: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/f4b720a6a_generated_image.png', text: 'Cikgu datang membawa kotak kecil dan tuala lembut.', choices: [{ text: 'Pegang kotak dengan hati-hati', next: 5, star: true }, { text: 'Buat bunyi kuat', next: 2 }] },
      { imageUrl: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/0a97ddf90_generated_image.png', text: 'Ali bercakap perlahan supaya anak kucing tidak takut.', choices: [{ text: 'Berikan ruang selamat', next: 6, star: true }, { text: 'Kejar kucing itu', next: 2 }] },
      { imageUrl: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/3ff2b9379_generated_image.png', text: 'Anak kucing masuk ke dalam kotak dan mula bertenang.', choices: [{ text: 'Bawa ke tempat teduh', next: 7, star: true }, { text: 'Tinggalkan di situ', next: 2 }] },
      { imageUrl: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/fdbdb4e85_generated_image.png', text: 'Ali dan cikgu mencari pemilik kucing di sekitar sekolah.', choices: [{ text: 'Tanya pengawal sekolah', next: 8, star: true }, { text: 'Balik tanpa bertanya', next: 2 }] },
      { imageUrl: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/f4b720a6a_generated_image.png', text: 'Pengawal kenal kucing itu dan memanggil pemiliknya.', choices: [{ text: 'Tunggu dengan sabar', next: 9, star: true }, { text: 'Pergi bermain', next: 2 }] },
      { imageUrl: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/f57f9479f_generated_image.png', text: 'Pemilik kucing datang mengucapkan terima kasih kepada Ali.', choices: [{ text: 'Tamat cerita', next: 'end', star: true }] },
    ],
  },
  {
    id: 'misi-angkasa', title: 'Misi Angkasa Nia', emoji: '🚀', cover: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/3c03de7fd_generated_image.png', moral: 'Berani bertanya dan bekerjasama membawa kejayaan.',
    scenes: [
      { imageUrl: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/44f9e58a4_generated_image.png', text: 'Nia menaiki roket ke bulan. Tiba-tiba lampu merah menyala!', choices: [{ text: 'Semak peta bintang', next: 1, star: true }, { text: 'Tekan semua butang', next: 2 }] },
      { imageUrl: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/d52325143_generated_image.png', text: 'Peta menunjukkan roket perlu mendarat perlahan di bulan.', choices: [{ text: 'Mendarat perlahan', next: 3, star: true }, { text: 'Turun laju', next: 2 }] },
      { imageUrl: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/cc832417c_generated_image.png', text: 'Roket berpusing! Nia tarik nafas dan cuba fikir semula.', choices: [{ text: 'Hubungi pusat kawalan', next: 4, star: true }, { text: 'Cuba semula dari awal', next: 0 }] },
      { imageUrl: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/4721af2f6_generated_image.png', text: 'Pusat kawalan meminta Nia membaca arahan dengan tenang.', choices: [{ text: 'Baca satu persatu', next: 5, star: true }, { text: 'Abaikan arahan', next: 2 }] },
      { imageUrl: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/44f9e58a4_generated_image.png', text: 'Nia jumpa butang brek roket berwarna biru.', choices: [{ text: 'Tekan perlahan', next: 6, star: true }, { text: 'Tekan semua butang', next: 2 }] },
      { imageUrl: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/d52325143_generated_image.png', text: 'Roket kembali stabil dan bulan semakin dekat.', choices: [{ text: 'Pakai tali keselamatan', next: 7, star: true }, { text: 'Berdiri di tingkap', next: 2 }] },
      { imageUrl: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/cc832417c_generated_image.png', text: 'Nia melihat kawah bulan dan memilih tempat mendarat yang rata.', choices: [{ text: 'Pilih kawasan rata', next: 8, star: true }, { text: 'Pilih kawasan berbatu', next: 2 }] },
      { imageUrl: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/4721af2f6_generated_image.png', text: 'Roket mendarat lembut. Alien kecil melambai dengan gembira.', choices: [{ text: 'Sapa dengan ramah', next: 9, star: true }, { text: 'Menjerit kuat', next: 2 }] },
      { imageUrl: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/3c03de7fd_generated_image.png', text: 'Alien memberi pelekat bintang kerana Nia berani bekerjasama.', choices: [{ text: 'Tamat cerita', next: 'end', star: true }] }
    ],
  },
  {
    id: 'hutan-bersih', title: 'Sara Jaga Hutan', emoji: '🌳', cover: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/7055e89d0_generated_image.png', moral: 'Jaga alam sekitar bermula dengan tindakan kecil.',
    scenes: [
      { imageUrl: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/32fd99f2b_generated_image.png', text: 'Sara pergi berkelah dan nampak sampah di tepi pokok.', choices: [{ text: 'Kutip dan buang dalam tong', next: 1, star: true }, { text: 'Biarkan sahaja', next: 2 }] },
      { imageUrl: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/e0c33c071_generated_image.png', text: 'Rama-rama datang kerana kawasan sudah bersih.', choices: [{ text: 'Ajak kawan bersihkan lagi', next: 3, star: true }, { text: 'Balik terus', next: 3 }] },
      { imageUrl: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/247d767b8_generated_image.png', text: 'Hutan jadi kotor dan haiwan sedih.', choices: [{ text: 'Ambil beg sampah', next: 4, star: true }, { text: 'Cuba semula dari awal', next: 0 }] },
      { imageUrl: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/e2865e747_generated_image.png', text: 'Sara memakai sarung tangan sebelum mengutip sampah.', choices: [{ text: 'Kutip plastik dahulu', next: 5, star: true }, { text: 'Pegang kaca tajam', next: 2 }] },
      { imageUrl: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/32fd99f2b_generated_image.png', text: 'Sara asingkan botol plastik dan kertas untuk dikitar semula.', choices: [{ text: 'Asingkan dengan betul', next: 6, star: true }, { text: 'Campur semua sampah', next: 2 }] },
      { imageUrl: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/e0c33c071_generated_image.png', text: 'Kawan-kawan Sara datang membantu membersihkan kawasan berkelah.', choices: [{ text: 'Beri tugas kepada semua', next: 7, star: true }, { text: 'Buat sendiri sahaja', next: 2 }] },
      { imageUrl: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/247d767b8_generated_image.png', text: 'Mereka menanam pokok kecil di tepi laluan hutan.', choices: [{ text: 'Siram pokok', next: 8, star: true }, { text: 'Pijak pokok', next: 2 }] },
      { imageUrl: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/e2865e747_generated_image.png', text: 'Burung dan rama-rama kembali kerana hutan sudah bersih.', choices: [{ text: 'Nikmati hutan bersih', next: 9, star: true }, { text: 'Buang sampah lagi', next: 2 }] },
      { imageUrl: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/7055e89d0_generated_image.png', text: 'Hutan kembali ceria dan semua orang seronok!', choices: [{ text: 'Tamat cerita', next: 'end', star: true }] }
    ],
  },
  {
    id: 'detektif-huruf', title: 'Detektif Huruf Aina', emoji: '🔎', cover: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/391ad2d64_generated_image.png', moral: 'Belajar membaca jadi seronok bila kita cuba perlahan-lahan.',
    scenes: [
      { imageUrl: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/3e8bf81ab_generated_image.png', text: 'Aina jumpa kotak misteri dengan huruf A di atasnya.', choices: [{ text: 'Cari benda bermula A', next: 1, star: true }, { text: 'Tendang kotak', next: 2 }] },
      { imageUrl: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/923e639a7_generated_image.png', text: 'Aina jumpa epal! Sekarang Aina perlu cari benda bermula A.', choices: [{ text: 'Cari Ayam pula', next: 3, star: true }, { text: 'Pilih kereta', next: 2 }] },
      { imageUrl: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/301eea039_generated_image.png', text: 'Pilihan itu belum tepat. Aina cuba dengar bunyi huruf.', choices: [{ text: 'Dengar bunyi A', next: 4, star: true }, { text: 'Cuba semula dari awal', next: 0 }] },
      { imageUrl: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/e8decdec5_generated_image.png', text: 'Aina menyebut A... A... Ayam dengan perlahan.', choices: [{ text: 'Cari gambar ayam', next: 5, star: true }, { text: 'Cari gambar kereta', next: 2 }] },
      { imageUrl: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/3e8bf81ab_generated_image.png', text: 'Dalam kotak ada kad huruf besar A dan huruf kecil a.', choices: [{ text: 'Padankan A dengan a', next: 6, star: true }, { text: 'Buang kad itu', next: 2 }] },
      { imageUrl: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/923e639a7_generated_image.png', text: 'Aina jumpa kad awan. Awan juga bermula dengan A.', choices: [{ text: 'Sebut Awan', next: 7, star: true }, { text: 'Sebut Bola', next: 2 }] },
      { imageUrl: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/301eea039_generated_image.png', text: 'Kotak misteri bersinar apabila Aina sebut tiga perkataan A.', choices: [{ text: 'Buka kotak', next: 8, star: true }, { text: 'Tutup mata', next: 2 }] },
      { imageUrl: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/e8decdec5_generated_image.png', text: 'Di dalam kotak ada lencana Detektif Huruf untuk Aina.', choices: [{ text: 'Pakai lencana', next: 9, star: true }, { text: 'Sorok lencana', next: 2 }] },
      { imageUrl: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/391ad2d64_generated_image.png', text: 'Aina jumpa ayam. Misteri huruf A berjaya diselesaikan!', choices: [{ text: 'Tamat cerita', next: 'end', star: true }] }
    ],
  },
  {
    id: 'pasar-buah', title: 'Bobo di Pasar Buah', emoji: '🍎', cover: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/713c12f6e_generated_image.png', moral: 'Mengira dan memilih makanan sihat itu penting.',
    scenes: [
      { imageUrl: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/230eb2846_generated_image.png', text: 'Bobo mahu beli 3 biji buah untuk ibu.', choices: [{ text: 'Kira buah satu-satu', next: 1, star: true }, { text: 'Ambil seberapa banyak', next: 2 }] },
      { imageUrl: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/3a3fc73b2_generated_image.png', text: 'Bobo sudah ada 1 pisang. Perlu tambah berapa lagi?', choices: [{ text: 'Tambah 2 buah', next: 3, star: true }, { text: 'Tambah 5 buah', next: 2 }] },
      { imageUrl: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/6653fd8e0_generated_image.png', text: 'Bilangan buah belum betul. Bobo cuba kira semula.', choices: [{ text: 'Kira dengan jari', next: 4, star: true }, { text: 'Cuba semula dari awal', next: 0 }] },
      { imageUrl: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/aa9c6088e_generated_image.png', text: 'Bobo tunjuk satu jari untuk pisang yang sudah dipilih.', choices: [{ text: 'Tambah satu epal', next: 5, star: true }, { text: 'Ambil 10 buah', next: 2 }] },
      { imageUrl: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/230eb2846_generated_image.png', text: 'Sekarang Bobo ada 2 buah: satu pisang dan satu epal.', choices: [{ text: 'Tambah satu oren', next: 6, star: true }, { text: 'Berhenti di sini', next: 2 }] },
      { imageUrl: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/3a3fc73b2_generated_image.png', text: 'Bobo mengira: satu, dua, tiga. Cukup 3 buah!', choices: [{ text: 'Letak dalam bakul', next: 7, star: true }, { text: 'Buang satu buah', next: 2 }] },
      { imageUrl: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/6653fd8e0_generated_image.png', text: 'Penjual buah tersenyum dan memberi resit kepada Bobo.', choices: [{ text: 'Ucap terima kasih', next: 8, star: true }, { text: 'Lari tanpa bayar', next: 2 }] },
      { imageUrl: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/aa9c6088e_generated_image.png', text: 'Bobo membawa buah pulang dengan berhati-hati.', choices: [{ text: 'Serah kepada ibu', next: 9, star: true }, { text: 'Makan semua sendiri', next: 2 }] },
      { imageUrl: 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/713c12f6e_generated_image.png', text: 'Bobo berjaya beli 3 buah. Ibu sangat bangga!', choices: [{ text: 'Tamat cerita', next: 'end', star: true }] }
    ],
  },
];

const cardStyle = { background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(26px)', border: '1px solid rgba(255,255,255,0.34)', boxShadow: '0 24px 70px rgba(31, 16, 92, 0.25)' };

const formatDatabaseStory = (game) => ({
  id: game.id,
  title: game.title,
  emoji: game.emoji || '📖',
  cover: game.gameData?.cover || game.cover || '',
  moral: game.gameData?.moral || game.description || 'Cerita interaktif',
  scenes: (game.gameData?.scenes || []).map((scene) => ({
    ...scene,
    imageUrl: scene.imageUrl || scene.image_url || '',
    image: scene.image || game.emoji || '📖',
    slideVisual: scene.slideVisual || null,
    choices: scene.choices || [],
  })),
});

export default function StoryKid() {
  const { user } = useAuth() || {};
  const { selectedChild } = useSelectedChild() || {};
  const [stories, setStories] = useState([]);
  const [selected, setSelected] = useState(null);
  const [sceneIndex, setSceneIndex] = useState(0);
  const [stars, setStars] = useState(0);
  const trackedRef = useRef(null); // ensure we track only once per story session

  useEffect(() => {
    const loadStories = async () => {
      try {
        const dbStories = await base44.entities.Game.filter({ type: 'story_adventure', category: 'story', ageGroup: 'prasekolah', isPublished: true }, 'order');
        const storyKidStories = dbStories
          .filter(game => game.gameData?.storyKid && game.gameData?.scenes?.length)
          .map(formatDatabaseStory);
        // Fallback ke SAMPLE_STORIES kalau database kosong
        setStories(storyKidStories.length > 0 ? storyKidStories : SAMPLE_STORIES);
      } catch (e) {
        setStories(SAMPLE_STORIES);
      }
    };

    loadStories();
  }, []);

  const story = selected !== null ? stories[selected] : null;
  const scene = story?.scenes?.[sceneIndex];
  const progress = useMemo(() => story ? ((sceneIndex + 1) / story.scenes.length) * 100 : 0, [story, sceneIndex]);

  const choose = (choice) => {
    if (choice.star) setStars(s => s + 1);
    if (choice.next === 'end') setSceneIndex(story.scenes.length);
    else setSceneIndex(choice.next);
  };

  const resetStory = () => { setSceneIndex(0); setStars(0); trackedRef.current = null; };

  // Track to ParentDashboard when story is completed (sceneIndex === total scenes).
  // Stars dikira ikut bilangan pilihan baik yang user buat:
  //  - >= 6 stars → 3 stars (excellent)
  //  - >= 3 stars → 2 stars (good)
  //  - else → 1 star (completed)
  useEffect(() => {
    if (!story || sceneIndex < story.scenes.length) return;
    const sessionKey = `${story.id}-${selected}`;
    if (trackedRef.current === sessionKey) return;
    trackedRef.current = sessionKey;
    const earnedStars = stars >= 6 ? 3 : stars >= 3 ? 2 : 1;
    saveActivityProgress({
      user,
      childName: selectedChild?.name,
      category: 'story_kid',
      activityId: story.id,
      activityTitle: `Cerita: ${story.title}`,
      stars: earnedStars,
    }).catch(() => {});
  }, [sceneIndex, story, selected, stars, user, selectedChild]);

  return (
    <div
      className="min-h-screen w-full max-w-full overflow-x-hidden font-nunito relative text-slate-900"
      style={{
        background: story && sceneIndex < (story?.scenes?.length || 0)
          ? undefined
          : 'linear-gradient(180deg, #fef9f3 0%, #fef3c7 30%, #fbcfe8 70%, #c7d2fe 100%)',
      }}
    >
      {/* Floating pastel clouds — only on listing/end page (not during fullscreen story) */}
      {(!story || sceneIndex >= (story?.scenes?.length || 0)) && (
        <div className="fixed inset-0 overflow-hidden pointer-events-none max-w-full">
          <div className="absolute top-20 -left-20 w-72 h-72 rounded-full blur-3xl opacity-50" style={{ background: '#fef3c7' }} />
          <div className="absolute top-1/3 -right-20 w-80 h-80 rounded-full blur-3xl opacity-40" style={{ background: '#fbcfe8' }} />
          <div className="absolute bottom-40 left-1/4 w-72 h-72 rounded-full blur-3xl opacity-40" style={{ background: '#c7d2fe' }} />
        </div>
      )}

      {!story && <AppHeader showBack={true} backTo="/dashboard" />}

      <div className={`relative w-full ${story && sceneIndex < (story?.scenes?.length || 0) ? '' : 'max-w-4xl mx-auto px-4 sm:px-8 lg:px-12 pb-28 pt-20 sm:pt-4'} overflow-x-hidden`}>
        {!story && (
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 mb-5 px-4 py-2 rounded-full text-slate-700 font-black text-sm transition-all"
            style={{ background: 'rgba(255,255,255,0.9)', boxShadow: '0 3px 0 #fde68a' }}
          >
            <ArrowLeft className="w-4 h-4" strokeWidth={3} /> Kembali ke Dashboard
          </Link>
        )}

        {!story ? (
          <>
            {/* Playful CeriaKid hero — pastel candy gradient */}
            <motion.section
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative mb-8 rounded-[2rem] p-6 sm:p-7 overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, #fef3c7 0%, #fbcfe8 50%, #c7d2fe 100%)',
                boxShadow: '0 10px 30px rgba(251, 207, 232, 0.4), inset 0 2px 0 rgba(255,255,255,0.6)',
              }}
            >
              <motion.div animate={{ y: [0, -8, 0], rotate: [0, 5, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }} className="absolute top-4 right-6 text-3xl opacity-70">📖</motion.div>
              <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 1 }} className="absolute top-12 right-20 text-2xl opacity-60">✨</motion.div>
              <div className="absolute bottom-2 left-4 text-2xl opacity-40">⭐</div>

              <div className="relative flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">
                <div className="min-w-0">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full mb-2" style={{ background: 'rgba(255,255,255,0.7)' }}>
                    <span className="text-[10px] font-black uppercase tracking-wider text-pink-700">📖 Interactive Storytime</span>
                  </div>
                  <h1 className="text-3xl sm:text-4xl font-black leading-[1.05] tracking-tight text-slate-800">Story Kid 💕</h1>
                  <p className="text-slate-600 text-sm sm:text-base font-bold mt-2 max-w-lg">Pilih cerita, baca bersama anak dan kumpul bintang melalui pilihan yang baik ✨</p>
                </div>

                <div className="grid grid-cols-3 lg:flex lg:flex-wrap gap-2 w-full lg:w-auto">
                  {[
                    { top: stories.length, bottom: 'Cerita', color: '#f9a8d4' },
                    { top: '⭐', bottom: 'Bintang', color: '#fcd34d' },
                    { top: '🎨', bottom: 'Pixar', color: '#93c5fd' },
                  ].map((badge, i) => (
                    <div
                      key={i}
                      className="px-3.5 py-2 rounded-2xl text-center lg:min-w-[78px]"
                      style={{ background: 'rgba(255,255,255,0.85)', boxShadow: `0 3px 0 ${badge.color}` }}
                    >
                      <p className="font-black text-sm leading-tight text-slate-800 truncate">{badge.top}</p>
                      <p className="text-[10px] font-black uppercase tracking-wider mt-0.5 text-slate-500">{badge.bottom}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.section>

            {stories.length === 0 ? (
              <div
                className="rounded-[2rem] p-10 text-center"
                style={{
                  background: 'linear-gradient(135deg, #ffffff 0%, #fef9f3 100%)',
                  boxShadow: '0 8px 20px rgba(251, 207, 232, 0.25), 0 0 0 2px rgba(251, 207, 232, 0.3)',
                }}
              >
                <motion.p animate={{ y: [0, -8, 0] }} transition={{ duration: 2.5, repeat: Infinity }} className="text-6xl mb-4">📭</motion.p>
                <h2 className="text-slate-800 font-black text-2xl mb-2">Belum ada Story Kid</h2>
                <p className="text-slate-500 text-sm font-bold">Cerita yang dipadam di management tidak akan muncul di sini 💔</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {stories.map((item, idx) => (
                  <motion.button
                    key={item.id || idx}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{
                      opacity: 1,
                      y: [0, -6, 0, 4, 0],
                      rotate: [0, -0.8, 0, 0.8, 0],
                    }}
                    transition={{
                      opacity: { delay: idx * 0.04, duration: 0.4 },
                      y: { duration: 4 + (idx % 3) * 0.5, repeat: Infinity, ease: 'easeInOut', delay: idx * 0.25 },
                      rotate: { duration: 5 + (idx % 3) * 0.4, repeat: Infinity, ease: 'easeInOut', delay: idx * 0.3 },
                    }}
                    whileTap={{ scale: 0.97, y: 2 }}
                    whileHover={{ scale: 1.03, y: -8 }}
                    onClick={() => { setSelected(idx); resetStory(); }}
                    className="group text-left rounded-[2rem] p-3 overflow-hidden transition-all"
                    style={{
                      background: 'linear-gradient(135deg, #ffffff 0%, #fef9f3 100%)',
                      boxShadow: '0 8px 20px rgba(251, 207, 232, 0.3), 0 0 0 2px rgba(251, 207, 232, 0.4)',
                    }}
                  >
                    <div
                      className="h-52 rounded-[1.5rem] overflow-hidden mb-4"
                      style={{ background: 'linear-gradient(135deg, #fef3c7 0%, #fbcfe8 100%)' }}
                    >
                      {item.cover ? (
                        <img src={item.cover} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <StorySlideVisual visual={item.scenes?.[0]?.slideVisual} emoji={item.emoji} compact />
                      )}
                    </div>
                    <div className="flex items-start gap-3 px-2">
                      <div
                        className="w-11 h-11 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                        style={{ background: 'linear-gradient(135deg, #fbcfe8 0%, #f9a8d4 100%)', boxShadow: '0 3px 0 #f472b6' }}
                      >
                        {item.emoji}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h2 className="text-slate-800 font-black text-lg leading-tight">{item.title}</h2>
                        <p className="text-slate-500 text-xs font-bold mt-1 line-clamp-2">{item.moral}</p>
                      </div>
                    </div>
                    <div
                      className="mt-4 mx-1 py-3 rounded-full text-white text-center font-black text-sm flex items-center justify-center gap-1.5"
                      style={{ background: 'linear-gradient(135deg, #f472b6 0%, #ec4899 100%)', boxShadow: '0 4px 0 #db2777, 0 6px 14px rgba(236, 72, 153, 0.3)' }}
                    >
                      Baca Cerita <ChevronRight className="w-4 h-4" strokeWidth={3} />
                    </div>
                  </motion.button>
                ))}
              </div>
            )}
          </>
        ) : sceneIndex >= story.scenes.length ? (
          <div
            className="fixed inset-0 z-40 flex items-center justify-center p-4"
            style={{
              backgroundImage: 'url(https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/b16329ff6_generated_image.png)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-white/50 via-white/65 to-white/80 backdrop-blur-sm" />
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="relative max-w-xl w-full rounded-[2rem] bg-white/95 backdrop-blur-2xl p-7 text-center shadow-2xl ring-1 ring-black/5"
            >
              <div className="text-7xl mb-3">🏆</div>
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-purple-600 mb-1">Tahniah!</p>
              <h2 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">Cerita Selesai</h2>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-100 text-yellow-700 font-black text-lg mb-5 ring-1 ring-yellow-200">
                <Star className="w-5 h-5 fill-yellow-500 text-yellow-500" /> {stars} bintang dikumpul
              </div>
              <div className="rounded-2xl bg-slate-50 p-5 mb-6 ring-1 ring-black/5">
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.18em] mb-2">Moral cerita</p>
                <p className="text-slate-900 text-base font-bold leading-relaxed">{story.moral}</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button onClick={resetStory} className="py-3.5 rounded-2xl bg-slate-100 text-slate-800 font-bold text-sm hover:bg-slate-200 transition-all flex items-center justify-center gap-2">
                  <RotateCcw className="w-4 h-4" /> Baca Semula
                </button>
                <button onClick={() => setSelected(null)} className="py-3.5 rounded-2xl bg-slate-900 text-white font-bold text-sm hover:bg-slate-800 transition-all">
                  Cerita Lain
                </button>
              </div>
            </motion.div>
          </div>
        ) : (
          <div className="fixed inset-0 z-40 bg-black overflow-hidden">
            {/* Persistent audio player — duduk tepat antara title bar dan bintang (kira dari kanan: padding 12-16 + bintang ~70px + gap) */}
            <div className="absolute top-3 sm:top-4 right-[5.5rem] sm:right-24 z-[60] h-11 flex items-center">
              <StoryAudioPlayer autoPlay={!!story} />
            </div>
            <AnimatePresence mode="wait">
              <motion.div key={sceneIndex} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }} className="absolute inset-0">
                {/* Fullscreen image — with subtle 3D Ken Burns motion */}
                {scene.imageUrl ? (
                  <motion.img
                    src={scene.imageUrl}
                    alt={scene.text}
                    className="absolute inset-0 w-full h-full object-cover"
                    initial={{ scale: 1.08, x: 0, y: 0 }}
                    animate={{
                      scale: [1.08, 1.18, 1.12, 1.08],
                      x: [0, -12, 8, 0],
                      y: [0, 6, -8, 0],
                    }}
                    transition={{
                      duration: 18,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  />
                ) : (
                  <div className="absolute inset-0">
                    <StorySlideVisual visual={scene.slideVisual} emoji={scene.image || story.emoji} title={story.title} />
                  </div>
                )}

                {/* Dark gradient overlays for readability */}
                <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black/70 to-transparent pointer-events-none" />
                <div className="absolute inset-x-0 bottom-0 h-[55%] bg-gradient-to-t from-black/85 via-black/60 to-transparent pointer-events-none" />

                {/* Top bar — back + title + progress + stars + music */}
                <div className="absolute top-0 left-0 right-0 p-3 sm:p-4 flex items-center gap-2 sm:gap-3 z-10">
                  <button onClick={() => setSelected(null)} className="w-11 h-11 rounded-2xl bg-white/95 text-purple-700 font-black shadow-lg flex items-center justify-center flex-shrink-0">←</button>
                  <div className="flex-1 min-w-0 rounded-2xl bg-black/40 backdrop-blur-md px-3 py-2 border border-white/20">
                    <h1 className="text-white font-black text-sm sm:text-base truncate drop-shadow">{story.title}</h1>
                    <div className="h-1.5 bg-white/20 rounded-full mt-1.5 overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-yellow-300 to-pink-400 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
                    </div>
                  </div>
                  {/* Spacer for persistent audio player rendered outside AnimatePresence — extra width for gap */}
                  <div className="w-14 h-11 flex-shrink-0" aria-hidden="true" />
                  <div className="px-3 py-2 rounded-2xl bg-yellow-300 text-yellow-950 font-black text-sm shadow-lg flex-shrink-0">{stars} ⭐</div>
                </div>

                {/* Page counter */}
                <div className="absolute top-20 left-3 sm:left-4 z-10 px-3 py-1.5 rounded-full bg-white/90 text-purple-700 text-xs font-black shadow">
                  Halaman {Math.min(sceneIndex + 1, story.scenes.length)} / {story.scenes.length}
                </div>

                {/* Bottom: text + choices overlay */}
                <div className="absolute bottom-6 sm:bottom-10 left-0 right-0 p-2 sm:p-3 z-10 max-h-[50vh] overflow-y-auto">
                  <div className="max-w-2xl mx-auto flex flex-col items-center">
                    {/* Text card — gaya buku cerita / parchment cream */}
                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="relative inline-block max-w-full rounded-2xl px-4 py-2.5 sm:px-5 sm:py-3 mb-2"
                      style={{
                        background: 'linear-gradient(180deg, #FFF8E7 0%, #FCEBC8 100%)',
                        border: '2px solid #C8956A',
                        boxShadow: '0 8px 20px rgba(0,0,0,0.35), inset 0 0 0 1px #FFF8E7',
                      }}
                    >
                      {/* Sudut hiasan kecil */}
                      <span className="absolute top-1 left-1 text-amber-700/60 text-[9px]">✦</span>
                      <span className="absolute top-1 right-1 text-amber-700/60 text-[9px]">✦</span>
                      <span className="absolute bottom-1 left-1 text-amber-700/60 text-[9px]">✦</span>
                      <span className="absolute bottom-1 right-1 text-amber-700/60 text-[9px]">✦</span>
                      <p className="text-amber-950 text-base sm:text-lg font-bold text-center leading-relaxed" style={{ fontFamily: 'Georgia, serif' }}>
                        {scene.text}
                      </p>
                    </motion.div>

                    {/* Choices — gaya butang kayu dongeng dengan warna bertukar-tukar */}
                    <div className="flex flex-wrap gap-1.5 sm:gap-2 justify-center">
                      {scene.choices.map((choice, idx) => {
                        const palettes = [
                          { bg: 'linear-gradient(180deg, #FBBF24 0%, #D97706 100%)', border: '#92400E', text: '#FFFBEB' },
                          { bg: 'linear-gradient(180deg, #34D399 0%, #047857 100%)', border: '#064E3B', text: '#ECFDF5' },
                          { bg: 'linear-gradient(180deg, #60A5FA 0%, #1D4ED8 100%)', border: '#1E3A8A', text: '#EFF6FF' },
                          { bg: 'linear-gradient(180deg, #F472B6 0%, #BE185D 100%)', border: '#831843', text: '#FDF2F8' },
                        ];
                        const palette = palettes[idx % palettes.length];
                        return (
                          <motion.button
                            key={idx}
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.3 + idx * 0.08 }}
                            whileTap={{ scale: 0.96, y: 2 }}
                            whileHover={{ y: -2 }}
                            onClick={() => choose(choice)}
                            className="px-3 py-2.5 sm:px-3.5 sm:py-3 rounded-xl font-bold inline-flex items-center gap-2 transition-all text-sm sm:text-base"
                            style={{
                              background: palette.bg,
                              border: `2px solid ${palette.border}`,
                              color: palette.text,
                              boxShadow: `0 4px 0 ${palette.border}, 0 8px 16px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.3)`,
                              textShadow: '0 1px 2px rgba(0,0,0,0.4)',
                            }}
                          >
                            <span className="text-left leading-tight">{choice.text}</span>
                            <span className="w-7 h-7 rounded-lg bg-white/30 flex items-center justify-center flex-shrink-0 text-base" style={{ border: `1.5px solid ${palette.border}` }}>→</span>
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}