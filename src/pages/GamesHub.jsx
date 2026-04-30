import React from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Zap, Brain, BookOpen, Copy, Gamepad2, Scroll, Rocket, Pen } from 'lucide-react';
import AppHeader from '@/components/AppHeader';
import { playSound } from '@/lib/soundManager';

export default function GamesHub() {
  const navigate = useNavigate();
  const games = [
    {
      id: 1,
      title: '🧠 Permainan Ingatan',
      description: 'Cari pasangan kad yang sama. Latih ingatan anda!',
      gameType: 'memory_game',
      icon: Brain,
      color: 'from-purple-400 to-pink-400',
      difficulty: '⭐ Mudah'
    },
    {
      id: 2,
      title: '🎯 Padankan Huruf',
      description: 'Seret huruf ke gambar yang betul. Belajar sambil bermain!',
      gameType: 'drag_drop',
      icon: Zap,
      color: 'from-blue-400 to-cyan-400',
      difficulty: '⭐⭐ Sederhana'
    },
    {
      id: 3,
      title: '📝 Bentuk Perkataan',
      description: 'Pilih huruf untuk bentuk perkataan. Susun dengan betul!',
      gameType: 'word_builder',
      icon: BookOpen,
      color: 'from-green-400 to-emerald-400',
      difficulty: '⭐⭐ Sederhana'
    },
    {
      id: 4,
      title: '🗂️ Isih Kategori',
      description: 'Seret item ke kategori yang betul. Pelajari pengelompokan!',
      gameType: 'shape_sort',
      icon: Copy,
      color: 'from-orange-400 to-yellow-400',
      difficulty: '⭐⭐ Sederhana'
    },
    {
      id: 5,
      title: '🎨 Padankan 3 Sama',
      description: 'Pilih 3 petak dengan nilai sama. Seperti Candy Crush!',
      gameType: 'pattern_fill',
      icon: Gamepad2,
      color: 'from-pink-400 to-purple-400',
      difficulty: '⭐⭐⭐ Sukar'
    },
    {
      id: 6,
      title: '📖 Petualangan Harta Karun',
      description: 'Pilih jalan yang tepat untuk cari harta. Cerita interaktif!',
      gameType: 'reading',
      icon: Scroll,
      color: 'from-amber-400 to-orange-400',
      difficulty: '⭐ Mudah'
    },
    {
      id: 7,
      title: '🎯 Lontarkan Bola',
      description: 'Atur kuasa & sudut untuk kena sasaran. Physics fun!',
      gameType: 'math_puzzle',
      icon: Rocket,
      color: 'from-sky-400 to-blue-400',
      difficulty: '⭐⭐⭐ Sukar'
    },
    {
      id: 8,
      title: '✏️ Seni Menulis',
      description: 'Lukis & sura huruf dengan garis panduan. Belajar menulis!',
      gameType: 'writing',
      icon: Pen,
      color: 'from-violet-400 to-purple-400',
      difficulty: '⭐⭐ Sederhana'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
      <AppHeader showBack={true} onBack={() => navigate(-1)} />
      
      <div className="max-w-5xl mx-auto px-4 py-8 pb-24 pt-20">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="flex items-center gap-3 mb-2">
            <span className="text-4xl">🎮</span>
            <h1 className="text-4xl font-black text-gray-800">Game Hub</h1>
          </div>
          <p className="text-gray-600 text-lg">8 permainan interaktif yang seru & mendidik. Pilih satu untuk bermula!</p>
        </motion.div>

        {/* Games Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {games.map((game, idx) => {
            const Icon = game.icon;
            return (
              <motion.div
                key={game.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                whileHover={{ y: -8 }}
                className="h-full"
              >
                <Link to={`/games-type/${game.gameType}`} onClick={() => playSound('click')} className="h-full block">
                  <div className={`bg-gradient-to-br ${game.color} rounded-3xl p-6 shadow-lg hover:shadow-2xl transition-all h-full flex flex-col justify-between text-white`}>
                    <div>
                      <div className="text-4xl mb-3">{game.title.split(' ')[0]}</div>
                      <h3 className="text-lg font-black mb-2">{game.title.split(' ').slice(1).join(' ')}</h3>
                      <p className="text-sm font-semibold opacity-90 leading-relaxed">{game.description}</p>
                    </div>
                    <div>
                      <div className="text-xs font-black opacity-80 mt-4 bg-white/20 w-fit px-3 py-1 rounded-full">
                        {game.difficulty}
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* Tips Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-8 shadow-lg border-2 border-orange-200"
        >
          <h2 className="text-2xl font-black text-gray-800 mb-4">💡 Petua Bermain:</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex gap-3">
              <span className="text-2xl">🏆</span>
              <div>
                <p className="font-bold text-gray-800">Dapatkan Bintang</p>
                <p className="text-sm text-gray-600">Setiap permainan memberi bintang berdasarkan prestasi!</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-2xl">⚡</span>
              <div>
                <p className="font-bold text-gray-800">Cepat & Tepat</p>
                <p className="text-sm text-gray-600">Semakin cepat & tepat, semakin banyak poin!</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-2xl">🎯</span>
              <div>
                <p className="font-bold text-gray-800">Ulang Permainan</p>
                <p className="text-sm text-gray-600">Boleh ulang banyak kali untuk tingkatkan skor!</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-2xl">📊</span>
              <div>
                <p className="font-bold text-gray-800">Pantau Kemajuan</p>
                <p className="text-sm text-gray-600">Dashboard ibu bapa boleh lihat semua pencapaian!</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}