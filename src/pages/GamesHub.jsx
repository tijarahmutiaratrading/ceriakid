import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Zap, Brain, BookOpen, Copy, Gamepad2, Scroll, Rocket, Pen } from 'lucide-react';
import AppHeader from '@/components/AppHeader';

const games = [
  {
    id: 1,
    emoji: '🧠',
    title: 'Permainan Ingatan',
    description: 'Cari pasangan kad yang sama. Latih ingatan!',
    path: '/games/memory',
    color: 'from-purple-500 to-pink-500',
    difficulty: 'Mudah',
    diffStars: 1,
  },
  {
    id: 2,
    emoji: '🎯',
    title: 'Padankan Huruf',
    description: 'Seret huruf ke gambar yang betul.',
    path: '/games/dragdrop',
    color: 'from-blue-500 to-cyan-400',
    difficulty: 'Sederhana',
    diffStars: 2,
  },
  {
    id: 3,
    emoji: '📝',
    title: 'Bentuk Perkataan',
    description: 'Susun huruf untuk bina perkataan yang betul!',
    path: '/games/wordbuilder',
    color: 'from-green-500 to-emerald-400',
    difficulty: 'Sederhana',
    diffStars: 2,
  },
  {
    id: 4,
    emoji: '🗂️',
    title: 'Isih Kategori',
    description: 'Seret item ke kategori yang betul.',
    path: '/games/sorting',
    color: 'from-orange-500 to-yellow-400',
    difficulty: 'Sederhana',
    diffStars: 2,
  },
  {
    id: 5,
    emoji: '🎨',
    title: 'Padankan 3 Sama',
    description: 'Pilih 3 petak dengan nilai sama. Macam Candy Crush!',
    path: '/games/tilematch',
    color: 'from-pink-500 to-purple-500',
    difficulty: 'Sukar',
    diffStars: 3,
  },
  {
    id: 6,
    emoji: '📖',
    title: 'Petualangan Harta',
    description: 'Pilih jalan yang tepat untuk cari harta!',
    path: '/games/story',
    color: 'from-amber-500 to-orange-400',
    difficulty: 'Mudah',
    diffStars: 1,
  },
  {
    id: 7,
    emoji: '🚀',
    title: 'Lontarkan Bola',
    description: 'Atur kuasa & sudut untuk kena sasaran!',
    path: '/games/physics',
    color: 'from-sky-500 to-blue-500',
    difficulty: 'Sukar',
    diffStars: 3,
  },
  {
    id: 8,
    emoji: '✏️',
    title: 'Seni Menulis',
    description: 'Lukis huruf dengan garis panduan. Belajar menulis!',
    path: '/games/tracing',
    color: 'from-violet-500 to-purple-500',
    difficulty: 'Sederhana',
    diffStars: 2,
  },
];

const tips = [
  { emoji: '🏆', title: 'Dapatkan Bintang', desc: 'Setiap permainan memberi bintang berdasarkan prestasi!' },
  { emoji: '⚡', title: 'Cepat & Tepat', desc: 'Semakin cepat & tepat, semakin banyak poin!' },
  { emoji: '🎯', title: 'Ulang Permainan', desc: 'Boleh ulang banyak kali untuk tingkatkan skor!' },
  { emoji: '📊', title: 'Pantau Kemajuan', desc: 'Dashboard ibu bapa boleh lihat semua pencapaian!' },
];

export default function GamesHub() {
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
          className="mb-6 p-5 rounded-3xl"
          style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.4)' }}
        >
          <div className="flex items-center gap-3">
            <div className="text-5xl">🎮</div>
            <div>
              <h1 className="text-3xl font-black text-white leading-tight">Game Hub</h1>
              <p className="text-white/70 text-sm font-semibold">8 permainan seru & mendidik</p>
            </div>
          </div>
        </motion.div>

        {/* Games Grid */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          {games.map((game, idx) => (
            <motion.div
              key={game.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <Link to={game.path} className="block h-full">
                <div
                  className={`bg-gradient-to-br ${game.color} rounded-3xl p-4 h-full flex flex-col justify-between shadow-lg`}
                  style={{ minHeight: '150px' }}
                >
                  <div>
                    <div className="text-3xl mb-2">{game.emoji}</div>
                    <h3 className="text-white font-black text-sm leading-tight mb-1">{game.title}</h3>
                    <p className="text-white/80 text-xs font-semibold leading-snug">{game.description}</p>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="bg-white/20 rounded-full px-2.5 py-1 text-xs text-white font-black">
                      {game.difficulty}
                    </div>
                    <div className="flex gap-0.5">
                      {[1, 2, 3].map(s => (
                        <span key={s} className={`text-xs ${s <= game.diffStars ? 'text-yellow-300' : 'text-white/30'}`}>★</span>
                      ))}
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Tips Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="rounded-3xl p-5"
          style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.35)' }}
        >
          <p className="text-white/80 text-xs font-black uppercase tracking-wider mb-4">💡 Petua Bermain</p>
          <div className="grid grid-cols-2 gap-3">
            {tips.map((tip, i) => (
              <div key={i} className="bg-white/20 rounded-2xl p-3 flex flex-col gap-1">
                <span className="text-2xl">{tip.emoji}</span>
                <p className="text-white font-black text-xs">{tip.title}</p>
                <p className="text-white/70 text-xs leading-snug">{tip.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>

      </div>
    </div>
  );
}