import React from 'react';
import { motion } from 'framer-motion';
import { useLang } from '@/lib/LanguageContext';
import { useAuth } from '@/lib/AuthContext';
import { useAgeGroup } from '@/lib/AgeGroupContext';
import { Link } from 'react-router-dom';
import LanguageToggle from '@/components/game/LanguageToggle';
import CategoryGrid from '@/components/home/CategoryGrid';

export default function Home() {
  const { t } = useLang();
  const { isAuthenticated, user } = useAuth();
  const { ageGroup, setAgeGroup } = useAgeGroup();

  return (
    <div className="min-h-screen bg-pattern">
      <div className="max-w-lg mx-auto px-4 py-6 pb-24">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <span className="text-3xl">🎓</span>
            <h1 className="text-2xl font-black">Jom Belajar</h1>
          </div>
          {!isAuthenticated && (
            <Link to="/pricing">
              <motion.button
                whileTap={{ scale: 0.95 }}
                className="clay-button rounded-full px-4 py-2 text-sm font-bold bg-game-purple/20"
              >
                Masuk
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
        <div className="mb-6 pb-4 border-b-2 border-gray-200">
          <p className="text-xs font-bold text-gray-600 uppercase mb-3">Umur Anak</p>
          <div className="flex gap-2">
            {[
              { key: 'prasekolah', label: 'Pra Sekolah' },
              { key: 'sekolah_rendah', label: 'Sekolah Rendah' }
            ].map((age) => (
              <motion.button
                key={age.key}
                onClick={() => setAgeGroup(age.key)}
                whileTap={{ scale: 0.95 }}
                className={`flex-1 px-4 py-3 rounded-lg font-semibold text-sm transition-all ${
                  ageGroup === age.key
                    ? 'bg-game-purple text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {age.label}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Category Grid */}
        <h2 className="text-xl font-black mb-4">Pilih Subjek</h2>
        <CategoryGrid />

        {/* Legacy games fallback */}
        {!isAuthenticated && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-12 p-6 clay rounded-3xl text-center"
          >
            <p className="text-lg font-bold mb-4">🎮 Belum Mendaftar?</p>
            <p className="text-sm text-gray-600 mb-4">
              Daftarlah sekarang untuk mendapatkan akses 200+ permainan!
            </p>
            <Link to="/pricing">
              <motion.button
                whileHover={{ scale: 1.05 }}
                className="px-6 py-3 bg-game-purple text-white rounded-full font-bold"
              >
                Lihat Paket
              </motion.button>
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  );
}