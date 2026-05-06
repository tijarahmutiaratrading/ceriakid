import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Loader2, Sparkles } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const STORY_KID_SEEDS = [
  {
    title: 'Ali Tolong Kucing', emoji: '🐱', moral: 'Sayangi haiwan dan bantu dengan cara selamat.',
    scenes: [
      { image: '🏫', text: 'Ali balik dari sekolah dan terdengar bunyi kucing kecil.', choices: [{ text: 'Cari bunyi itu', next: 1, star: true }, { text: 'Terus balik rumah', next: 2 }] },
      { image: '🐱', text: 'Ali nampak anak kucing tersepit di tepi longkang.', choices: [{ text: 'Panggil orang dewasa', next: 3, star: true }, { text: 'Tarik sendiri kuat-kuat', next: 2 }] },
      { image: '😟', text: 'Kucing masih takut. Ali belajar perlu minta bantuan.', choices: [{ text: 'Cuba semula', next: 0 }] },
      { image: '🥰', text: 'Kucing berjaya diselamatkan. Ali rasa sangat gembira!', choices: [{ text: 'Tamat cerita', next: 'end', star: true }] },
    ],
  },
  {
    title: 'Misi Angkasa Nia', emoji: '🚀', moral: 'Berani bertanya dan bekerjasama membawa kejayaan.',
    scenes: [
      { image: '🚀', text: 'Nia menaiki roket ke bulan. Tiba-tiba lampu merah menyala!', choices: [{ text: 'Semak peta bintang', next: 1, star: true }, { text: 'Tekan semua butang', next: 2 }] },
      { image: '🌙', text: 'Peta menunjukkan roket perlu mendarat perlahan di bulan.', choices: [{ text: 'Mendarat perlahan', next: 3, star: true }, { text: 'Turun laju', next: 2 }] },
      { image: '💫', text: 'Roket berpusing! Nia tarik nafas dan cuba fikir semula.', choices: [{ text: 'Cuba semula', next: 0 }] },
      { image: '👽', text: 'Nia bertemu alien comel yang memberi pelekat bintang.', choices: [{ text: 'Tamat cerita', next: 'end', star: true }] },
    ],
  },
  {
    title: 'Sara Jaga Hutan', emoji: '🌳', moral: 'Jaga alam sekitar bermula dengan tindakan kecil.',
    scenes: [
      { image: '🌲', text: 'Sara pergi berkelah dan nampak sampah di tepi pokok.', choices: [{ text: 'Kutip dan buang dalam tong', next: 1, star: true }, { text: 'Biarkan sahaja', next: 2 }] },
      { image: '🦋', text: 'Rama-rama datang kerana kawasan sudah bersih.', choices: [{ text: 'Ajak kawan bersihkan lagi', next: 3, star: true }, { text: 'Balik terus', next: 3 }] },
      { image: '😢', text: 'Hutan jadi kotor dan haiwan sedih.', choices: [{ text: 'Cuba semula', next: 0 }] },
      { image: '🌈', text: 'Hutan kembali ceria dan semua orang seronok!', choices: [{ text: 'Tamat cerita', next: 'end', star: true }] },
    ],
  },
  {
    title: 'Detektif Huruf Aina', emoji: '🔎', moral: 'Belajar membaca jadi seronok bila kita cuba perlahan-lahan.',
    scenes: [
      { image: '🔤', text: 'Aina jumpa kotak misteri dengan huruf A di atasnya.', choices: [{ text: 'Cari benda bermula A', next: 1, star: true }, { text: 'Tendang kotak', next: 2 }] },
      { image: '🍎', text: 'Aina jumpa epal! Sekarang Aina perlu cari benda bermula A.', choices: [{ text: 'Cari Ayam', next: 3, star: true }, { text: 'Pilih kereta', next: 2 }] },
      { image: '🤔', text: 'Pilihan itu belum tepat. Aina cuba dengar bunyi huruf.', choices: [{ text: 'Cuba semula', next: 0 }] },
      { image: '🐔', text: 'Aina jumpa ayam. Misteri huruf A berjaya diselesaikan!', choices: [{ text: 'Tamat cerita', next: 'end', star: true }] },
    ],
  },
  {
    title: 'Bobo di Pasar Buah', emoji: '🍎', moral: 'Mengira dan memilih makanan sihat itu penting.',
    scenes: [
      { image: '🧺', text: 'Bobo mahu beli 3 biji buah untuk ibu.', choices: [{ text: 'Kira buah satu-satu', next: 1, star: true }, { text: 'Ambil seberapa banyak', next: 2 }] },
      { image: '🍌', text: 'Bobo sudah ada 1 pisang. Perlu tambah berapa lagi?', choices: [{ text: 'Tambah 2 buah', next: 3, star: true }, { text: 'Tambah 5 buah', next: 2 }] },
      { image: '😅', text: 'Bilangan buah belum betul. Bobo cuba kira semula.', choices: [{ text: 'Cuba semula', next: 0 }] },
      { image: '🍎', text: 'Bobo berjaya beli 3 buah. Ibu sangat bangga!', choices: [{ text: 'Tamat cerita', next: 'end', star: true }] },
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