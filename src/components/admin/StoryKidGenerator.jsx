import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, CheckCircle2, Loader2, RefreshCw, Sparkles } from 'lucide-react';
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
  {
    title: 'Mimi Kongsi Mainan', emoji: '🧸', moral: 'Berkongsi membuatkan semua orang gembira.',
    scenes: [
      { image: '🧸', text: 'Mimi membawa beruang mainan baharu ke tadika.', choices: [{ text: 'Tunjuk kepada kawan', next: 1, star: true }, { text: 'Sorok mainan', next: 2 }] },
      { image: '👧', text: 'Lina ingin memegang beruang itu sebentar.', choices: [{ text: 'Beri giliran', next: 3, star: true }, { text: 'Kata tidak selamanya', next: 2 }] },
      { image: '😔', text: 'Lina sedih kerana tidak dapat bermain bersama.', choices: [{ text: 'Fikir semula', next: 4, star: true }, { text: 'Terus bermain sendiri', next: 0 }] },
      { image: '⏰', text: 'Cikgu cadang semua orang bermain ikut giliran.', choices: [{ text: 'Setuju ikut giliran', next: 5, star: true }, { text: 'Rebut mainan', next: 2 }] },
      { image: '😊', text: 'Mimi memberi Lina bermain selama lima minit.', choices: [{ text: 'Tunggu dengan sabar', next: 6, star: true }, { text: 'Tarik semula', next: 2 }] },
      { image: '🎈', text: 'Lina tersenyum dan menjaga mainan Mimi dengan baik.', choices: [{ text: 'Ucap terima kasih', next: 7, star: true }, { text: 'Marah Lina', next: 2 }] },
      { image: '👫', text: 'Kawan-kawan lain juga mahu bermain bersama.', choices: [{ text: 'Buat kumpulan kecil', next: 8, star: true }, { text: 'Halau kawan', next: 2 }] },
      { image: '🌟', text: 'Mereka mencipta cerita beruang yang sangat lucu.', choices: [{ text: 'Main bersama', next: 9, star: true }, { text: 'Main seorang diri', next: 2 }] },
      { image: '🥰', text: 'Mimi belajar mainan lebih seronok apabila dikongsi.', choices: [{ text: 'Tamat cerita', next: 'end', star: true }] }
    ],
  },
  {
    title: 'Rafi Berani Minta Maaf', emoji: '🙏', moral: 'Berani meminta maaf ialah sikap yang baik.',
    scenes: [
      { image: '⚽', text: 'Rafi bermain bola dan tidak sengaja terkena pasu kecil.', choices: [{ text: 'Berhenti bermain', next: 1, star: true }, { text: 'Lari cepat', next: 2 }] },
      { image: '🏺', text: 'Pasu itu retak sedikit dan Rafi berasa takut.', choices: [{ text: 'Beritahu ibu', next: 3, star: true }, { text: 'Sembunyikan pasu', next: 2 }] },
      { image: '😟', text: 'Rafi rasa tidak tenang kerana belum bercakap benar.', choices: [{ text: 'Tarik nafas', next: 4, star: true }, { text: 'Terus rahsiakan', next: 0 }] },
      { image: '👩', text: 'Ibu mendengar cerita Rafi dengan tenang.', choices: [{ text: 'Minta maaf', next: 5, star: true }, { text: 'Salahkan kucing', next: 2 }] },
      { image: '🧹', text: 'Ibu kata keselamatan lebih penting daripada barang.', choices: [{ text: 'Tolong kemas', next: 6, star: true }, { text: 'Tinggalkan ibu', next: 2 }] },
      { image: '🧽', text: 'Rafi membantu mengemas serpihan kecil dengan berhati-hati.', choices: [{ text: 'Pakai sarung tangan', next: 7, star: true }, { text: 'Pegang dengan tangan kosong', next: 2 }] },
      { image: '💬', text: 'Ibu memuji Rafi kerana bercakap benar.', choices: [{ text: 'Janji main di luar', next: 8, star: true }, { text: 'Ulang kesilapan', next: 2 }] },
      { image: '🌳', text: 'Rafi bermain bola di halaman yang lebih selamat.', choices: [{ text: 'Ikut peraturan', next: 9, star: true }, { text: 'Tendang ke rumah', next: 2 }] },
      { image: '💖', text: 'Rafi lega kerana meminta maaf dan bercakap benar.', choices: [{ text: 'Tamat cerita', next: 'end', star: true }] }
    ],
  },
  {
    title: 'Lili Simpan Air', emoji: '💧', moral: 'Jimat air membantu menjaga bumi.',
    scenes: [
      { image: '🚰', text: 'Lili memberus gigi sambil paip air terbuka.', choices: [{ text: 'Tutup paip', next: 1, star: true }, { text: 'Biarkan air mengalir', next: 2 }] },
      { image: '💧', text: 'Ayah menerangkan air bersih perlu dijimatkan.', choices: [{ text: 'Dengar nasihat ayah', next: 3, star: true }, { text: 'Abaikan ayah', next: 2 }] },
      { image: '😮', text: 'Air mengalir banyak dan Lili sedar itu membazir.', choices: [{ text: 'Cuba semula', next: 4, star: true }, { text: 'Terus membazir', next: 0 }] },
      { image: '🪥', text: 'Lili mengisi air dalam cawan kecil untuk berkumur.', choices: [{ text: 'Guna cawan', next: 5, star: true }, { text: 'Buka paip kuat', next: 2 }] },
      { image: '🌱', text: 'Di taman, Lili nampak pokok perlukan air juga.', choices: [{ text: 'Siram secukupnya', next: 6, star: true }, { text: 'Siram terlalu banyak', next: 2 }] },
      { image: '🪣', text: 'Lili mengumpul air hujan dalam baldi kecil.', choices: [{ text: 'Guna untuk pokok', next: 7, star: true }, { text: 'Buang air itu', next: 2 }] },
      { image: '👨‍👩‍👧', text: 'Keluarga Lili membuat poster jimat air.', choices: [{ text: 'Tampal poster', next: 8, star: true }, { text: 'Koyak poster', next: 2 }] },
      { image: '🏫', text: 'Lili berkongsi tip jimat air dengan kawan sekolah.', choices: [{ text: 'Ajak kawan ikut', next: 9, star: true }, { text: 'Simpan sendiri', next: 2 }] },
      { image: '🌍', text: 'Lili gembira kerana dapat membantu menjaga bumi.', choices: [{ text: 'Tamat cerita', next: 'end', star: true }] }
    ],
  },
  {
    title: 'Omar Susun Buku', emoji: '📚', moral: 'Menjaga barang dan mengemas menjadikan belajar lebih mudah.',
    scenes: [
      { image: '📚', text: 'Buku Omar berselerak di atas meja dan lantai.', choices: [{ text: 'Mula mengemas', next: 1, star: true }, { text: 'Biarkan bersepah', next: 2 }] },
      { image: '🔤', text: 'Omar ingin susun buku ikut warna dan saiz.', choices: [{ text: 'Asingkan dahulu', next: 3, star: true }, { text: 'Campak semua', next: 2 }] },
      { image: '😵', text: 'Meja yang bersepah membuat Omar susah cari pensel.', choices: [{ text: 'Kemas perlahan-lahan', next: 4, star: true }, { text: 'Tambah sepah lagi', next: 0 }] },
      { image: '🟥', text: 'Omar kumpul buku merah di satu tempat.', choices: [{ text: 'Cari buku biru', next: 5, star: true }, { text: 'Sorok buku', next: 2 }] },
      { image: '🟦', text: 'Buku biru pula diletakkan di sebelah buku merah.', choices: [{ text: 'Susun ikut saiz', next: 6, star: true }, { text: 'Letak terbalik semua', next: 2 }] },
      { image: '📏', text: 'Buku besar diletakkan di bawah supaya rak lebih stabil.', choices: [{ text: 'Letak buku kecil atas', next: 7, star: true }, { text: 'Letak berat di atas', next: 2 }] },
      { image: '✏️', text: 'Omar jumpa pensel yang hilang di bawah buku.', choices: [{ text: 'Simpan dalam bekas', next: 8, star: true }, { text: 'Buang pensel', next: 2 }] },
      { image: '🧼', text: 'Meja Omar kini bersih dan mudah digunakan.', choices: [{ text: 'Baca buku', next: 9, star: true }, { text: 'Sepahkan semula', next: 2 }] },
      { image: '😊', text: 'Omar senang hati kerana ruang belajarnya kemas.', choices: [{ text: 'Tamat cerita', next: 'end', star: true }] }
    ],
  },
  {
    title: 'Tara Tolong Nenek', emoji: '👵', moral: 'Menolong keluarga ialah amalan mulia.',
    scenes: [
      { image: '🏠', text: 'Tara melihat nenek membawa beg yang berat.', choices: [{ text: 'Tawarkan bantuan', next: 1, star: true }, { text: 'Buat tidak nampak', next: 2 }] },
      { image: '🛍️', text: 'Nenek tersenyum dan memberi beg yang ringan kepada Tara.', choices: [{ text: 'Pegang baik-baik', next: 3, star: true }, { text: 'Tarik semua beg', next: 2 }] },
      { image: '😔', text: 'Nenek nampak letih apabila tiada siapa membantu.', choices: [{ text: 'Pergi bantu nenek', next: 4, star: true }, { text: 'Terus bermain', next: 0 }] },
      { image: '🚪', text: 'Tara membuka pintu supaya nenek mudah masuk.', choices: [{ text: 'Tahan pintu', next: 5, star: true }, { text: 'Tutup pintu cepat', next: 2 }] },
      { image: '🍵', text: 'Nenek duduk dan Tara ingin menyediakan air kosong.', choices: [{ text: 'Ambil gelas', next: 6, star: true }, { text: 'Main air', next: 2 }] },
      { image: '🥛', text: 'Tara membawa gelas air dengan dua tangan.', choices: [{ text: 'Berjalan perlahan', next: 7, star: true }, { text: 'Berlari laju', next: 2 }] },
      { image: '💬', text: 'Nenek mengucapkan terima kasih kepada Tara.', choices: [{ text: 'Senyum kepada nenek', next: 8, star: true }, { text: 'Minta hadiah', next: 2 }] },
      { image: '🧺', text: 'Tara membantu menyusun barang dapur bersama nenek.', choices: [{ text: 'Susun di tempat betul', next: 9, star: true }, { text: 'Letak merata-rata', next: 2 }] },
      { image: '❤️', text: 'Nenek bangga kerana Tara suka menolong keluarga.', choices: [{ text: 'Tamat cerita', next: 'end', star: true }] }
    ],
  },
];

const STORYBOOK_STYLE_REFERENCE = 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/580d3db6a_IMG_0482.jpeg';

const buildStoryImagePrompt = (story, scene, index, type = 'scene') => {
  const sceneText = scene?.text || story.moral;
  return `Create a premium kids storybook illustration like a polished Canva children's book: bright magical forest/book-page style, cute expressive child character, friendly animals where relevant, cinematic warm sunlight, rich colorful background, glossy 3D cartoon digital painting, professional printed storybook quality, clean composition, child-safe, high detail.
Story title: ${story.title}.
Scene ${index + 1}: ${sceneText}
Moral/theme: ${story.moral}.
${type === 'cover' ? 'Make it a vertical front book cover illustration with the main character centered and strong storybook cover composition.' : 'Make it a full-page inner storybook illustration with clear action, emotion, and room at the bottom for app text overlay.'}
Important: illustration only, no readable words, no letters, no watermark, no logo, no UI, no speech bubbles.`;
};

const generateStorybookImages = async (story, scenes, setGenerationStatus) => {
  setGenerationStatus(`Generating cover: ${story.title}`);
  const coverResult = await base44.integrations.Core.GenerateImage({
    prompt: buildStoryImagePrompt(story, scenes[0], 0, 'cover'),
    existing_image_urls: [STORYBOOK_STYLE_REFERENCE],
  });

  const illustratedScenes = [];
  for (let index = 0; index < scenes.length; index++) {
    setGenerationStatus(`Generating slide ${index + 1}/${scenes.length}: ${story.title}`);
    const result = await base44.integrations.Core.GenerateImage({
      prompt: buildStoryImagePrompt(story, scenes[index], index, 'scene'),
      existing_image_urls: [STORYBOOK_STYLE_REFERENCE],
    });
    illustratedScenes.push({ ...scenes[index], imageUrl: result.url });
  }

  return { cover: coverResult.url, scenes: illustratedScenes };
};

const STORY_VISUAL_STYLES = [
  { bg: 'from-sky-200 via-cyan-100 to-emerald-200', side: ['☁️', '🌈', '✨'] },
  { bg: 'from-amber-200 via-orange-100 to-pink-200', side: ['🌸', '⭐', '🦋'] },
  { bg: 'from-lime-200 via-green-100 to-teal-200', side: ['🌿', '🍃', '🌼'] },
  { bg: 'from-violet-200 via-fuchsia-100 to-rose-200', side: ['💫', '🌟', '🎈'] },
  { bg: 'from-blue-200 via-indigo-100 to-purple-200', side: ['🌙', '⭐', '☄️'] },
  { bg: 'from-yellow-200 via-amber-100 to-red-200', side: ['☀️', '🍀', '✨'] },
];

const buildSlideVisual = (story, scene, index) => {
  const style = STORY_VISUAL_STYLES[index % STORY_VISUAL_STYLES.length];
  return {
    ...style,
    main: scene.image || story.emoji || '📖',
    caption: scene.text,
  };
};

const prepareStoryScenes = (story, targetSlideCount) => {
  const requestedCount = Math.max(3, Math.min(12, Number(targetSlideCount) || 10));
  const baseScenes = story.scenes.map(scene => ({ ...scene, choices: scene.choices.map(choice => ({ ...choice })) }));
  const finalScene = baseScenes[baseScenes.length - 1];
  const middleScenes = baseScenes.slice(0, -1);
  const scenes = middleScenes.slice(0, Math.max(1, requestedCount - 1));

  while (scenes.length < requestedCount - 1) {
    scenes.push({
      image: story.emoji,
      text: `${story.title} hampir selesai. Mari ingat semula pengajaran cerita ini.`,
      choices: [{ text: 'Teruskan cerita', next: scenes.length + 1, star: true }],
    });
  }

  scenes.push({ ...finalScene, choices: [{ text: 'Tamat cerita', next: 'end', star: true }] });

  return scenes.map((scene, index) => ({
    ...scene,
    slideVisual: buildSlideVisual(story, scene, index),
    choices: scene.choices.map(choice => ({
      ...choice,
      next: choice.next === 'end' ? 'end' : Math.min(Number(choice.next) || index + 1, scenes.length - 1),
    })),
  }));
};

export default function StoryKidGenerator({ onToast }) {
  const [loading, setLoading] = useState(false);
  const [storyCount, setStoryCount] = useState(5);
  const [slideCount, setSlideCount] = useState(10);
  const [generatedStories, setGeneratedStories] = useState([]);
  const [loadingQueue, setLoadingQueue] = useState(false);

  const loadGeneratedStories = async () => {
    setLoadingQueue(true);
    const tasks = await base44.entities.GameTask.list('-created_date', 50);
    setGeneratedStories(tasks.filter(task => task.subject === 'storykid'));
    setLoadingQueue(false);
  };

  useEffect(() => {
    loadGeneratedStories();
  }, []);

  const seedStories = async () => {
    setLoading(true);
    const selectedStories = STORY_KID_SEEDS.slice(0, Math.max(1, Math.min(STORY_KID_SEEDS.length, Number(storyCount) || 5)));
    for (let i = 0; i < selectedStories.length; i++) {
      const story = selectedStories[i];
      const scenes = prepareStoryScenes(story, slideCount);
      await base44.entities.GameTask.create({
        taskName: `Story Kid: ${story.title}`,
        ageGroup: 'prasekolah',
        subject: 'storykid',
        gamesCount: scenes.length + 1,
        questionsPerGame: scenes.length,
        status: 'pending',
        errorMessage: JSON.stringify({
          story: { title: story.title, emoji: story.emoji, moral: story.moral },
          scenes,
          order: i,
          cover: '',
          generatedScenes: [],
        }),
      });
    }
    await loadGeneratedStories();
    setLoading(false);
    onToast?.(`✅ ${selectedStories.length} Story Kid masuk task queue. Boleh tutup browser, ia akan jalan di background.`);
  };

  const clearCompletedTasks = async () => {
    const completed = generatedStories.filter(task => task.status === 'completed');
    for (const task of completed) {
      await base44.entities.GameTask.delete(task.id);
    }
    await loadGeneratedStories();
    onToast?.(`✅ ${completed.length} completed Story Kid task dipadam`);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-3 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] shadow-2xl shadow-black/20" style={{ background: 'linear-gradient(135deg, rgba(251,191,36,0.18), rgba(236,72,153,0.14))', backdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.22)' }}>
      <div className="flex items-start gap-3 sm:gap-4 mb-5">
        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl sm:rounded-3xl bg-white/20 flex items-center justify-center text-2xl sm:text-3xl flex-shrink-0">📖</div>
        <div className="min-w-0">
          <h2 className="font-black text-white text-xl sm:text-2xl leading-tight">Story Kid Generator</h2>
          <p className="text-white/65 text-xs sm:text-sm mt-1 leading-snug">Tambah cerita interaktif awal untuk kanak-kanak.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-5">
        <div>
          <label className="text-white/70 text-xs font-black uppercase tracking-wider block mb-2">Jumlah Story</label>
          <input
            type="number"
            min="1"
            max={STORY_KID_SEEDS.length}
            value={storyCount}
            onChange={(e) => setStoryCount(e.target.value)}
            className="w-full p-3 sm:p-4 rounded-2xl bg-white/10 text-white border border-white/20 font-black text-xl sm:text-2xl text-center outline-none focus:bg-white/15"
          />
        </div>
        <div>
          <label className="text-white/70 text-xs font-black uppercase tracking-wider block mb-2">Slide / Story</label>
          <input
            type="number"
            min="3"
            max="12"
            value={slideCount}
            onChange={(e) => setSlideCount(e.target.value)}
            className="w-full p-3 sm:p-4 rounded-2xl bg-white/10 text-white border border-white/20 font-black text-xl sm:text-2xl text-center outline-none focus:bg-white/15"
          />
        </div>
      </div>

      <div className="mb-5 rounded-2xl bg-white/10 border border-white/10 p-3 text-center">
        <p className="text-white/60 text-xs font-semibold">Akan dijana</p>
        <p className="text-white font-black text-base sm:text-lg leading-snug">{Math.max(1, Math.min(STORY_KID_SEEDS.length, Number(storyCount) || 5))} story × {Math.max(3, Math.min(12, Number(slideCount) || 10))} slide</p>
      </div>

      <button onClick={seedStories} disabled={loading} className="w-full py-3.5 sm:py-4 rounded-2xl bg-white text-purple-700 font-black shadow-xl flex items-center justify-center gap-2 disabled:opacity-60 text-sm sm:text-base">
        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
        {loading ? 'Masukkan ke queue...' : 'Tambah Story ke Queue'}
      </button>

      <Link to="/story-kid" className="mt-3 w-full py-3 rounded-2xl bg-white/10 text-white font-black border border-white/15 flex items-center justify-center gap-2 text-sm sm:text-base">
        <BookOpen className="w-4 h-4" /> Preview Story Kid
      </Link>
    </motion.div>
  );
}