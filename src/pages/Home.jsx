import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/AuthContext';
import { useAgeGroup } from '@/lib/AgeGroupContext';
import { Link } from 'react-router-dom';
import CategoryGrid from '@/components/home/CategoryGrid';

export default function Home() {
  const { isAuthenticated, user } = useAuth();
  const { ageGroup, toggleAgeGroup } = useAgeGroup() || {};
  const safeAgeGroup = ageGroup || 'prasekolah';
  const safeToggle = toggleAgeGroup || (() => {});

  return (
    <div className="min-h-screen bg-amber-50">
      <div className="max-w-lg mx-auto px-4 py-6 pb-24">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <span className="text-3xl">🎓</span>
            <h1 className="text-2xl font-black text-gray-800">Jom Belajar</h1>
          </div>
          {!isAuthenticated && (
            <Link to="/landing">
              <motion.button
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2 bg-game-orange text-white rounded-full text-sm font-bold hover:bg-orange-600 transition-all"
              >
                Log Masuk
              </motion.button>
            </Link>
          )}
        </div>

        {/* Welcome */}
        {isAuthenticated && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm font-semibold text-game-purple mb-6"
          >
            👋 Halo, {user?.full_name || 'Teman'}!
          </motion.p>
        )}

        {/* Age Group Toggle */}
        <div className="mb-8 pb-6 border-b-2 border-amber-200">
          <p className="text-xs font-bold text-gray-700 uppercase mb-3">Umur Anak</p>
          <div className="flex gap-3">
            {[
              { key: 'prasekolah', label: 'Pra Sekolah' },
              { key: 'sekolah_rendah', label: 'Sekolah Rendah' }
            ].map((age) => (
              <motion.button
                key={age.key}
                onClick={() => safeToggle(age.key)}
                whileTap={{ scale: 0.95 }}
                className={`flex-1 px-4 py-3 rounded-2xl font-bold text-sm transition-all ${
                  safeAgeGroup === age.key
                    ? 'bg-game-orange text-white shadow-lg'
                    : 'bg-amber-100 text-gray-700 hover:bg-amber-200'
                }`}
              >
                {age.label}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Drawing Studio Shortcut */}
        <Link to="/drawing">
          <motion.div
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="mb-6 bg-gradient-to-r from-pink-400 to-purple-400 rounded-2xl p-4 flex items-center gap-4 text-white shadow-lg cursor-pointer"
          >
            <span className="text-4xl">🎨</span>
            <div>
              <p className="font-black text-lg">Studio Lukisan</p>
              <p className="text-sm opacity-90">Lukis bebas atau buat tracing huruf & bentuk!</p>
            </div>
            <span className="ml-auto text-2xl">→</span>
          </motion.div>
        </Link>

        {/* Category Grid */}
        <h2 className="text-2xl font-black text-gray-800 mb-6">Pilih Subjek</h2>
        <CategoryGrid />

        {/* CTA Section */}
        {!isAuthenticated && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-12 bg-gradient-to-br from-game-orange to-orange-400 rounded-3xl p-8 text-center text-white shadow-lg"
          >
            <p className="text-4xl mb-3">🎮</p>
            <p className="text-xl font-black mb-3">Belum Mendaftar?</p>
            <p className="text-sm mb-6 opacity-95">
              Daftarlah sekarang untuk akses 200+ permainan edukatif!
            </p>
            <Link to="/landing">
              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-3 bg-white text-game-orange rounded-full font-black shadow-lg hover:shadow-xl transition-all"
              >
                Lihat Paket Sekarang
              </motion.button>
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  );
}