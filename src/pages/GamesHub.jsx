import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import AppHeader from '@/components/AppHeader';
import { useAgeGroup } from '@/lib/AgeGroupContext';

// Mini game type metadata
const MINI_GAME_META = {
  memory: { emoji: '🧠', title: 'Permainan Ingatan', description: 'Cari pasangan kad yang sama!', path: '/games/memory', color: 'from-purple-500 to-pink-500', level: 'Mudah', skills: ['Ingatan', 'Fokus'] },
  dragdrop: { emoji: '🎯', title: 'Padankan Huruf', description: 'Seret huruf ke gambar yang betul.', path: '/games/dragdrop', color: 'from-blue-500 to-cyan-400', level: 'Mudah', skills: ['Huruf', 'Perbendaharaan kata'] },
  wordbuilder: { emoji: '📝', title: 'Bentuk Perkataan', description: 'Susun huruf untuk bina perkataan!', path: '/games/wordbuilder', color: 'from-green-500 to-emerald-400', level: 'Sederhana', skills: ['Ejaan', 'Kosa kata'] },
  sorting: { emoji: '🗂️', title: 'Isih Kategori', description: 'Seret item ke kategori yang betul.', path: '/games/sorting', color: 'from-orange-500 to-yellow-400', level: 'Sederhana', skills: ['Klasifikasi', 'Alam sekitar'] },
  tracing: { emoji: '✏️', title: 'Seni Menulis', description: 'Lukis huruf dengan garis panduan!', path: '/games/tracing', color: 'from-violet-500 to-purple-500', level: 'Sederhana', skills: ['Menulis', 'Motor halus'] },
  story: { emoji: '📖', title: 'Petualangan Cerita', description: 'Pilih jalan cerita yang tepat!', path: '/games/story', color: 'from-amber-500 to-orange-400', level: 'Mudah', skills: ['Kefahaman', 'Keputusan'] },
  tilematch: { emoji: '🔢', title: 'Padankan 3 Sama', description: 'Pilih 3 petak dengan nilai sama!', path: '/games/tilematch', color: 'from-pink-500 to-purple-500', level: 'Sukar', skills: ['Matematik', 'Tambah'] },
  physics: { emoji: '🚀', title: 'Lontarkan Bola', description: 'Atur kuasa & sudut untuk kena sasaran!', path: '/games/physics', color: 'from-sky-500 to-blue-500', level: 'Sukar', skills: ['Fizik', 'Penaakulan'] },
};

const levelColors = {
  Mudah: 'bg-green-400/80 text-white',
  Sederhana: 'bg-yellow-400/80 text-white',
  Sukar: 'bg-red-400/80 text-white',
};

export default function GamesHub() {
  const { ageGroup } = useAgeGroup() || { ageGroup: 'prasekolah' };
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadGames = async () => {
      try {
        const gameIds = Object.keys(MINI_GAME_META);
        const results = await Promise.all(
          gameIds.map(id => base44.entities.Game.filter({ category: id, isPublished: true }))
        );
        
        const loadedGames = [];
        gameIds.forEach((id, i) => {
          const dbGames = results[i] || [];
          if (dbGames.length > 0) {
            const meta = MINI_GAME_META[id];
            dbGames.forEach(g => {
              loadedGames.push({
                id: g.id,
                typeId: id,
                emoji: meta.emoji,
                title: meta.title,
                description: meta.description,
                path: meta.path,
                color: meta.color,
                level: meta.level,
                skills: meta.skills,
                ageGroup: g.ageGroup,
              });
            });
          }
        });
        
        setGames(loadedGames);
      } catch (err) {
        console.error('Failed to load mini games:', err);
      } finally {
        setLoading(false);
      }
    };
    
    loadGames();
  }, [ageGroup]);

  const filteredGames = games.filter(g => !g.ageGroup || g.ageGroup === ageGroup);

  const GameCard = ({ game, idx }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.06 }}
      whileHover={{ scale: 1.03, y: -4 }}
      whileTap={{ scale: 0.97 }}
    >
      <Link to={game.path} className="block h-full">
        <div className={`bg-gradient-to-br ${game.color} rounded-3xl p-4 h-full flex flex-col justify-between shadow-lg`} style={{ minHeight: '155px' }}>
          <div>
            <div className="flex items-start justify-between mb-2">
              <div className="text-3xl">{game.emoji}</div>
              <div className={`text-xs px-2 py-0.5 rounded-full font-black ${levelColors[game.level]}`}>
                {game.level}
              </div>
            </div>
            <h3 className="text-white font-black text-sm leading-tight mb-1">{game.title}</h3>
            <p className="text-white/80 text-xs font-semibold leading-snug">{game.description}</p>
          </div>
          <div className="mt-3 flex gap-1 flex-wrap">
            {game.skills.map(s => (
              <span key={s} className="bg-white/20 rounded-full px-2 py-0.5 text-white text-xs font-bold">{s}</span>
            ))}
          </div>
        </div>
      </Link>
    </motion.div>
  );

  return (
    <div className="min-h-screen font-nunito bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 relative overflow-hidden">
      {/* Background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
        <div className="absolute top-1/3 -left-20 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <AppHeader showBack={true} backTo="/dashboard" />

      <div className="relative max-w-3xl mx-auto px-4 pb-32 pt-28 md:pt-32">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-5 rounded-3xl"
          style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.4)' }}
        >
          <div className="flex items-center gap-3">
            <div className="text-5xl">🎮</div>
            <div className="flex-1">
              <h1 className="text-3xl font-black text-white leading-tight">Game Hub</h1>
              <p className="text-white/70 text-sm font-semibold">
                {ageGroup === 'prasekolah' ? '🧒 Prasekolah' : '🎒 Sekolah Rendah'} · {filteredGames.length} permainan interaktif
              </p>
            </div>
          </div>

          {/* Skill legend */}
          <div className="flex gap-2 mt-4 flex-wrap">
            {[{ label: 'Mudah', color: 'bg-green-400/80' }, { label: 'Sederhana', color: 'bg-yellow-400/80' }, { label: 'Sukar', color: 'bg-red-400/80' }].map(l => (
              <span key={l.label} className={`${l.color} text-white text-xs px-2.5 py-1 rounded-full font-bold`}>{l.label}</span>
            ))}
            <span className="text-white/50 text-xs self-center ml-1">— Tahap kesukaran</span>
          </div>
        </motion.div>

        {/* Games Grid */}
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-white" />
          </div>
        ) : filteredGames.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-white/70 text-lg font-semibold">Tiada mini games dijana lagi untuk peringkat ini</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 mb-6">
            {filteredGames.map((game, idx) => (
              <GameCard key={game.id} game={game} idx={idx} />
            ))}
          </div>
        )}

        {/* Info card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="p-5 rounded-3xl text-center"
          style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.3)' }}
        >
          <p className="text-white font-black text-base mb-1">💡 Tips Ibu Bapa</p>
          <p className="text-white/70 text-sm">Semua permainan direka untuk merangsang perkembangan kognitif. Main bersama anak untuk pengalaman terbaik!</p>
        </motion.div>
      </div>
    </div>
  );
}