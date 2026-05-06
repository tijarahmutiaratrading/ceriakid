import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Loader2, Sparkles } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export const STORY_KID_SEEDS = [
  {
    title: 'Ali Tolong Kucing', emoji: '🐱', moral: 'Sayangi haiwan dan bantu dengan cara selamat.',
    scenes: [
      { image: '🏫', text: 'Ali balik dari sekolah dan terdengar bunyi kucing kecil.', choices: [{ text: 'Cari bunyi itu', next: 1, star: true }, { text: 'Terus balik rumah', next: 2 }] },
      { image: '🐱', text: 'Ali nampak anak kucing tersepit di tepi longkang.', choices: [{ text: 'Panggil orang dewasa', next: 3, star: true }, { text: 'Tarik sendiri kuat-kuat', next: 2 }] },
      { image: '😟', text: 'Kucing masih takut. Ali belajar perlu minta bantuan.', choices: [{ text: 'Cari cikgu berdekatan', next: 4, star: true }, { text: 'Cuba semula dari awal', next: 0 }] },
      { image: '👩‍🏫', text: 'Cikgu datang membawa kotak kecil dan tuala lembut.', choices: [{ text: 'Pegang kotak dengan hati-hati', next: 5, star: true }, { text: 'Buat bunyi kuat', next: 2 }] },
      { image: '🤫', text: 'Ali bercakap perlahan supaya anak kucing tidak takut.', choices: [{ text: 'Berikan ruang selamat', next: 6, star: true }, { text: 'Kejar kucing itu', next: 2 }] },
      { image: '📦', text: 'Anak kucing masuk ke dalam kotak dan mula bertenang.', choices: [{ text: 'Bawa ke tempat teduh', next: 7, star: true }, { text: 'Tinggalkan di situ', next: 2 }] },
      { image: '🏫', text: 'Ali dan cikgu mencari pemilik kucing di sekitar sekolah.', choices: [{ text: 'Tanya pengawal sekolah', next: 8, star: true }, { text: 'Balik tanpa bertanya', next: 2 }] },
      { image: '👮', text: 'Pengawal kenal kucing itu dan memanggil pemiliknya.', choices: [{ text: 'Tunggu dengan sabar', next: 9, star: true }, { text: 'Pergi bermain', next: 2 }] },
      { image: '🥰', text: 'Pemilik kucing datang mengucapkan terima kasih kepada Ali.', choices: [{ text: 'Tamat cerita', next: 'end', star: true }] }
    ],
  },
  {
    title: 'Misi Angkasa Nia', emoji: '🚀', moral: 'Berani bertanya dan bekerjasama membawa kejayaan.',
    scenes: [
      { image: '🚀', text: 'Nia menaiki roket ke bulan. Tiba-tiba lampu merah menyala!', choices: [{ text: 'Semak peta bintang', next: 1, star: true }, { text: 'Tekan semua butang', next: 2 }] },
      { image: '🌙', text: 'Peta menunjukkan roket perlu mendarat perlahan di bulan.', choices: [{ text: 'Mendarat perlahan', next: 3, star: true }, { text: 'Turun laju', next: 2 }] },
      { image: '💫', text: 'Roket berpusing! Nia tarik nafas dan cuba fikir semula.', choices: [{ text: 'Hubungi pusat kawalan', next: 4, star: true }, { text: 'Cuba semula dari awal', next: 0 }] },
      { image: '📡', text: 'Pusat kawalan meminta Nia membaca arahan dengan tenang.', choices: [{ text: 'Baca satu persatu', next: 5, star: true }, { text: 'Abaikan arahan', next: 2 }] },
      { image: '🔵', text: 'Nia jumpa butang brek roket berwarna biru.', choices: [{ text: 'Tekan perlahan', next: 6, star: true }, { text: 'Tekan semua butang', next: 2 }] },
      { image: '🛰️', text: 'Roket kembali stabil dan bulan semakin dekat.', choices: [{ text: 'Pakai tali keselamatan', next: 7, star: true }, { text: 'Berdiri di tingkap', next: 2 }] },
      { image: '🌕', text: 'Nia melihat kawah bulan dan memilih tempat mendarat yang rata.', choices: [{ text: 'Pilih kawasan rata', next: 8, star: true }, { text: 'Pilih kawasan berbatu', next: 2 }] },
      { image: '👽', text: 'Roket mendarat lembut. Alien kecil melambai dengan gembira.', choices: [{ text: 'Sapa dengan ramah', next: 9, star: true }, { text: 'Menjerit kuat', next: 2 }] },
      { image: '⭐', text: 'Alien memberi pelekat bintang kerana Nia berani bekerjasama.', choices: [{ text: 'Tamat cerita', next: 'end', star: true }] }
    ],
  },
  {
    title: 'Sara Jaga Hutan', emoji: '🌳', moral: 'Jaga alam sekitar bermula dengan tindakan kecil.',
    scenes: [
      { image: '🌲', text: 'Sara pergi berkelah dan nampak sampah di tepi pokok.', choices: [{ text: 'Kutip dan buang dalam tong', next: 1, star: true }, { text: 'Biarkan sahaja', next: 2 }] },
      { image: '🦋', text: 'Rama-rama datang kerana kawasan sudah bersih.', choices: [{ text: 'Ajak kawan bersihkan lagi', next: 3, star: true }, { text: 'Balik terus', next: 3 }] },
      { image: '😢', text: 'Hutan jadi kotor dan haiwan sedih.', choices: [{ text: 'Ambil beg sampah', next: 4, star: true }, { text: 'Cuba semula dari awal', next: 0 }] },
      { image: '🧤', text: 'Sara memakai sarung tangan sebelum mengutip sampah.', choices: [{ text: 'Kutip plastik dahulu', next: 5, star: true }, { text: 'Pegang kaca tajam', next: 2 }] },
      { image: '♻️', text: 'Sara asingkan botol plastik dan kertas untuk dikitar semula.', choices: [{ text: 'Asingkan dengan betul', next: 6, star: true }, { text: 'Campur semua sampah', next: 2 }] },
      { image: '👫', text: 'Kawan-kawan Sara datang membantu membersihkan kawasan berkelah.', choices: [{ text: 'Beri tugas kepada semua', next: 7, star: true }, { text: 'Buat sendiri sahaja', next: 2 }] },
      { image: '🌱', text: 'Mereka menanam pokok kecil di tepi laluan hutan.', choices: [{ text: 'Siram pokok', next: 8, star: true }, { text: 'Pijak pokok', next: 2 }] },
      { image: '🐦', text: 'Burung dan rama-rama kembali kerana hutan sudah bersih.', choices: [{ text: 'Nikmati hutan bersih', next: 9, star: true }, { text: 'Buang sampah lagi', next: 2 }] },
      { image: '🌈', text: 'Hutan kembali ceria dan semua orang seronok!', choices: [{ text: 'Tamat cerita', next: 'end', star: true }] }
    ],
  },
  {
    title: 'Detektif Huruf Aina', emoji: '🔎', moral: 'Belajar membaca jadi seronok bila kita cuba perlahan-lahan.',
    scenes: [
      { image: '🔤', text: 'Aina jumpa kotak misteri dengan huruf A di atasnya.', choices: [{ text: 'Cari benda bermula A', next: 1, star: true }, { text: 'Tendang kotak', next: 2 }] },
      { image: '🍎', text: 'Aina jumpa epal! Sekarang Aina perlu cari benda bermula A.', choices: [{ text: 'Cari Ayam', next: 3, star: true }, { text: 'Pilih kereta', next: 2 }] },
      { image: '🤔', text: 'Pilihan itu belum tepat. Aina cuba dengar bunyi huruf.', choices: [{ text: 'Dengar bunyi A', next: 4, star: true }, { text: 'Cuba semula dari awal', next: 0 }] },
      { image: '🗣️', text: 'Aina menyebut A... A... Ayam dengan perlahan.', choices: [{ text: 'Cari gambar ayam', next: 5, star: true }, { text: 'Cari gambar kereta', next: 2 }] },
      { image: '🔠', text: 'Dalam kotak ada kad huruf besar A dan huruf kecil a.', choices: [{ text: 'Padankan A dengan a', next: 6, star: true }, { text: 'Buang kad itu', next: 2 }] },
      { image: '☁️', text: 'Aina jumpa kad awan. Awan juga bermula dengan A.', choices: [{ text: 'Sebut Awan', next: 7, star: true }, { text: 'Sebut Bola', next: 2 }] },
      { image: '✨', text: 'Kotak misteri bersinar apabila Aina sebut tiga perkataan A.', choices: [{ text: 'Buka kotak', next: 8, star: true }, { text: 'Tutup mata', next: 2 }] },
      { image: '🏅', text: 'Di dalam kotak ada lencana Detektif Huruf untuk Aina.', choices: [{ text: 'Pakai lencana', next: 9, star: true }, { text: 'Sorok lencana', next: 2 }] },
      { image: '🐔', text: 'Aina jumpa ayam. Misteri huruf A berjaya diselesaikan!', choices: [{ text: 'Tamat cerita', next: 'end', star: true }] }
    ],
  },
  {
    title: 'Bobo di Pasar Buah', emoji: '🍎', moral: 'Mengira dan memilih makanan sihat itu penting.',
    scenes: [
      { image: '🧺', text: 'Bobo mahu beli 3 biji buah untuk ibu.', choices: [{ text: 'Kira buah satu-satu', next: 1, star: true }, { text: 'Ambil seberapa banyak', next: 2 }] },
      { image: '🍌', text: 'Bobo sudah ada 1 pisang. Perlu tambah berapa lagi?', choices: [{ text: 'Tambah 2 buah', next: 3, star: true }, { text: 'Tambah 5 buah', next: 2 }] },
      { image: '😅', text: 'Bilangan buah belum betul. Bobo cuba kira semula.', choices: [{ text: 'Kira dengan jari', next: 4, star: true }, { text: 'Cuba semula dari awal', next: 0 }] },
      { image: '☝️', text: 'Bobo tunjuk satu jari untuk pisang yang sudah dipilih.', choices: [{ text: 'Tambah satu epal', next: 5, star: true }, { text: 'Ambil 10 buah', next: 2 }] },
      { image: '🍏', text: 'Sekarang Bobo ada 2 buah: satu pisang dan satu epal.', choices: [{ text: 'Tambah satu oren', next: 6, star: true }, { text: 'Berhenti di sini', next: 2 }] },
      { image: '🍊', text: 'Bobo mengira: satu, dua, tiga. Cukup 3 buah!', choices: [{ text: 'Letak dalam bakul', next: 7, star: true }, { text: 'Buang satu buah', next: 2 }] },
      { image: '🧾', text: 'Penjual buah tersenyum dan memberi resit kepada Bobo.', choices: [{ text: 'Ucap terima kasih', next: 8, star: true }, { text: 'Lari tanpa bayar', next: 2 }] },
      { image: '🏡', text: 'Bobo membawa buah pulang dengan berhati-hati.', choices: [{ text: 'Serah kepada ibu', next: 9, star: true }, { text: 'Makan semua sendiri', next: 2 }] },
      { image: '🍎', text: 'Bobo berjaya beli 3 buah. Ibu sangat bangga!', choices: [{ text: 'Tamat cerita', next: 'end', star: true }] }
    ],
  },
];

export default function StoryKidGenerator({ onToast }) {
  const [loading, setLoading] = useState(false);

  const seedStories = async () => {
    setLoading(true);
    for (let i = 0; i < STORY_KID_SEEDS.length; i++) {
      const story = STORY_KID_SEEDS[i];
      await base44.entities.Game.create({
        title: story.title,
        description: story.moral,
        type: 'story_adventure',
        category: 'story',
        ageGroup: 'prasekolah',
        difficulty: 'easy',
        tier: 'free',
        emoji: story.emoji,
        totalQuestions: story.scenes.length,
        gameData: { storyKid: true, moral: story.moral, scenes: story.scenes },
        isPublished: true,
        status: 'ready',
        order: i,
      });
    }
    setLoading(false);
    onToast?.('✅ 5 Story Kid berjaya ditambah!');
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 rounded-[2rem] shadow-2xl shadow-black/20" style={{ background: 'linear-gradient(135deg, rgba(251,191,36,0.18), rgba(236,72,153,0.14))', backdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.22)' }}>
      <div className="flex items-center gap-4 mb-5">
        <div className="w-14 h-14 rounded-3xl bg-white/20 flex items-center justify-center text-3xl">📖</div>
        <div>
          <h2 className="font-black text-white text-2xl">Story Kid Generator</h2>
          <p className="text-white/65 text-sm">Tambah 5 cerita interaktif awal untuk kanak-kanak.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
        {STORY_KID_SEEDS.map((story) => (
          <div key={story.title} className="p-4 rounded-2xl bg-white/10 border border-white/10">
            <p className="text-3xl mb-2">{story.emoji}</p>
            <p className="text-white font-black text-sm">{story.title}</p>
            <p className="text-white/55 text-xs mt-1">{story.moral}</p>
          </div>
        ))}
      </div>

      <button onClick={seedStories} disabled={loading} className="w-full py-4 rounded-2xl bg-white text-purple-700 font-black shadow-xl flex items-center justify-center gap-2 disabled:opacity-60">
        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
        {loading ? 'Menambah cerita...' : 'Tambah 5 Story Kid'}
      </button>

      <Link to="/story-kid" className="mt-3 w-full py-3 rounded-2xl bg-white/10 text-white font-black border border-white/15 flex items-center justify-center gap-2">
        <BookOpen className="w-4 h-4" /> Preview Story Kid
      </Link>
    </motion.div>
  );
}