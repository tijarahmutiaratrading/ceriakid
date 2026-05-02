import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronRight } from 'lucide-react';
import AppHeader from '@/components/AppHeader';

const gamesByLevel = {
  prasekolah: [
    { id: 1, emoji: '🧠', title: 'Permainan Ingatan', description: 'Cari pasangan kad yang sama!', path: '/games/memory', color: 'from-purple-500 to-pink-500', level: 'Mudah' },
    { id: 2, emoji: '🎯', title: 'Padankan Huruf', description: 'Seret huruf ke gambar yang betul.', path: '/games/dragdrop', color: 'from-blue-500 to-cyan-400', level: 'Mudah' },
    { id: 3, emoji: '📝', title: 'Bentuk Perkataan', description: 'Susun huruf untuk bina perkataan!', path: '/games/wordbuilder', color: 'from-green-500 to-emerald-400', level: 'Sederhana' },
    { id: 4, emoji: '🗂️', title: 'Isih Kategori', description: 'Seret item ke kategori yang betul.', path: '/games/sorting', color: 'from-orange-500 to-yellow-400', level: 'Sederhana' },
    { id: 6, emoji: '📖', title: 'Petualangan Harta', description: 'Pilih jalan yang tepat untuk cari harta!', path: '/games/story', color: 'from-amber-500 to-orange-400', level: 'Mudah' },
    { id: 8, emoji: '✏️', title: 'Seni Menulis', description: 'Lukis huruf dengan garis panduan!', path: '/games/tracing', color: 'from-violet-500 to-purple-500', level: 'Sederhana' },
  ],
};

const sekolahRendahByGradeAndSubject = {
  'darjah_1': {
    'bahasa_melayu': [
      { id: 2, emoji: '🎯', title: 'Padankan Huruf', description: 'Seret huruf ke gambar yang betul.', path: '/games/dragdrop', color: 'from-blue-500 to-cyan-400', level: 'Sederhana' },
      { id: 3, emoji: '📝', title: 'Bentuk Perkataan', description: 'Susun huruf untuk bina perkataan!', path: '/games/wordbuilder', color: 'from-green-500 to-emerald-400', level: 'Sederhana' },
    ],
    'english': [
      { id: 2, emoji: '🎯', title: 'Match Letters', description: 'Drag letters to pictures.', path: '/games/dragdrop', color: 'from-blue-500 to-cyan-400', level: 'Sederhana' },
    ],
    'mathematics': [
      { id: 4, emoji: '🗂️', title: 'Isih Kategori', description: 'Seret item ke kategori yang betul.', path: '/games/sorting', color: 'from-orange-500 to-yellow-400', level: 'Sederhana' },
    ],
  },
  'darjah_2': {
    'bahasa_melayu': [
      { id: 3, emoji: '📝', title: 'Bentuk Perkataan', description: 'Susun huruf untuk bina perkataan!', path: '/games/wordbuilder', color: 'from-green-500 to-emerald-400', level: 'Sederhana' },
      { id: 6, emoji: '📖', title: 'Petualangan Harta', description: 'Pilih jalan yang tepat untuk cari harta!', path: '/games/story', color: 'from-amber-500 to-orange-400', level: 'Mudah' },
    ],
    'mathematics': [
      { id: 5, emoji: '🎨', title: 'Padankan 3 Sama', description: 'Pilih 3 petak dengan nilai sama!', path: '/games/tilematch', color: 'from-pink-500 to-purple-500', level: 'Sukar' },
    ],
  },
  'darjah_3': {
    'mathematics': [
      { id: 5, emoji: '🎨', title: 'Padankan 3 Sama', description: 'Pilih 3 petak dengan nilai sama!', path: '/games/tilematch', color: 'from-pink-500 to-purple-500', level: 'Sukar' },
      { id: 7, emoji: '🚀', title: 'Lontarkan Bola', description: 'Atur kuasa & sudut untuk kena sasaran!', path: '/games/physics', color: 'from-sky-500 to-blue-500', level: 'Sukar' },
    ],
    'science': [
      { id: 7, emoji: '🚀', title: 'Lontarkan Bola', description: 'Atur kuasa & sudut untuk kena sasaran!', path: '/games/physics', color: 'from-sky-500 to-blue-500', level: 'Sukar' },
    ],
  },
};

const tips = [
  { emoji: '🏆', title: 'Dapatkan Bintang', desc: 'Setiap permainan memberi bintang berdasarkan prestasi!' },
  { emoji: '⚡', title: 'Cepat & Tepat', desc: 'Semakin cepat & tepat, semakin banyak poin!' },
  { emoji: '🎯', title: 'Ulang Permainan', desc: 'Boleh ulang banyak kali untuk tingkatkan skor!' },
  { emoji: '📊', title: 'Pantau Kemajuan', desc: 'Dashboard ibu bapa boleh lihat semua pencapaian!' },
];

export default function GamesHub() {
  const [expandedGrades, setExpandedGrades] = useState({});

  const GameCard = ({ game, idx }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.05 }}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
    >
      <Link to={game.path} className="block h-full">
        <div
          className={`bg-gradient-to-br ${game.color} rounded-3xl p-4 h-full flex flex-col justify-between shadow-lg`}
          style={{ minHeight: '130px' }}
        >
          <div>
            <div className="text-3xl mb-2">{game.emoji}</div>
            <h3 className="text-white font-black text-sm leading-tight mb-1">{game.title}</h3>
            <p className="text-white/80 text-xs font-semibold leading-snug">{game.description}</p>
          </div>
          <div className="mt-3">
            <div className="bg-white/20 rounded-full px-2.5 py-1 text-xs text-white font-black inline-block">
              {game.level}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );

  const subjectEmojis = {
    bahasa_melayu: '📚',
    english: '🌍',
    mathematics: '🔢',
    science: '🔬',
  };

  const subjectNames = {
    bahasa_melayu: 'Bahasa Melayu',
    english: 'English',
    mathematics: 'Matematik',
    science: 'Sains',
  };

  const gradeNames = {
    darjah_1: 'Darjah 1',
    darjah_2: 'Darjah 2',
    darjah_3: 'Darjah 3',
  };

  const toggleGrade = (grade) => {
    setExpandedGrades(prev => ({
      ...prev,
      [grade]: !prev[grade]
    }));
  };

  const renderSection = (title, emoji, games, delay) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="mb-8"
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="text-3xl">{emoji}</div>
        <h2 className="text-2xl font-black text-white">{title}</h2>
        <div className="flex-1 h-1 bg-gradient-to-r from-white/40 to-transparent rounded-full" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        {games.map((game, idx) => (
          <GameCard key={game.id} game={game} idx={idx} />
        ))}
      </div>
    </motion.div>
  );

  const renderSekolahRendahSection = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="mb-8"
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="text-3xl">🎒</div>
        <h2 className="text-2xl font-black text-white">Sekolah Rendah (Umur 7-12)</h2>
        <div className="flex-1 h-1 bg-gradient-to-r from-white/40 to-transparent rounded-full" />
      </div>
      
      <div className="space-y-3">
        {Object.entries(sekolahRendahByGradeAndSubject).map(([ grade, subjects ], gradeIdx) => (
          <motion.div
            key={grade}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + gradeIdx * 0.05 }}
            className="rounded-2xl overflow-hidden"
            style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)' }}
          >
            <button
              onClick={() => toggleGrade(grade)}
              className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/10 transition-all"
            >
              <span className="font-black text-white text-lg">{gradeNames[grade]}</span>
              {expandedGrades[grade] ? (
                <ChevronDown className="w-5 h-5 text-white" />
              ) : (
                <ChevronRight className="w-5 h-5 text-white" />
              )}
            </button>

            {expandedGrades[grade] && (
              <div className="px-4 py-3 border-t border-white/10 space-y-4">
                {Object.entries(subjects).map(([ subject, games ], subjIdx) => (
                  <div key={subject}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl">{subjectEmojis[subject]}</span>
                      <p className="text-sm font-black text-white/80 uppercase tracking-wide">{subjectNames[subject]}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {games.map((game, idx) => (
                        <GameCard key={game.id} game={game} idx={idx} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #667eea 0%, #f093fb 50%, #f5a623 100%)' }}>
      {/* Background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" />
        <div className="absolute top-1/3 -left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <AppHeader showBack={true} backTo="/dashboard" />

      <div className="relative max-w-2xl mx-auto px-4 pb-32 pt-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 p-5 rounded-3xl"
          style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.4)' }}
        >
          <div className="flex items-center gap-3">
            <div className="text-5xl">🎮</div>
            <div>
              <h1 className="text-3xl font-black text-white leading-tight">Game Hub</h1>
              <p className="text-white/70 text-sm font-semibold">Pilih kategori untuk bermain</p>
            </div>
          </div>
        </motion.div>

        {/* Prasekolah Section */}
        {renderSection('🧒 Prasekolah (Umur 4-6)', '🟢', gamesByLevel.prasekolah, 0.1)}

        {/* Sekolah Rendah Section - Expandable by Grade & Subject */}
        {renderSekolahRendahSection()}
      </div>
    </div>
  );
}