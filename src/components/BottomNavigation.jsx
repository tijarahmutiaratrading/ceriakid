import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, BookOpen, Calculator, Microscope, BarChart3, LogOut } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { useAgeGroup } from '@/lib/AgeGroupContext';
import LanguageToggle from '@/components/game/LanguageToggle';

export default function BottomNavigation() {
  const { isAuthenticated, logout } = useAuth();
  const { ageGroup, setAgeGroup } = useAgeGroup();
  const location = useLocation();

  // Don't show nav on landing & pricing
  if (location.pathname === '/landing' || location.pathname === '/pricing') {
    return null;
  }

  const navItems = [
    { path: '/', emoji: '🏠', label: 'Home', category: 'home' },
    { path: `/games/bahasa_melayu`, emoji: '🇲🇾', label: 'Bahasa', category: 'bahasa_melayu' },
    { path: `/games/english`, emoji: '🇬🇧', label: 'English', category: 'english' },
    { path: `/games/mathematics`, emoji: '🔢', label: 'Math', category: 'mathematics' },
    { path: `/games/science`, emoji: '🔬', label: 'Science', category: 'science' },
    ...(isAuthenticated ? [{ path: '/parent-dashboard', emoji: '📊', label: 'Prestasi', category: 'dashboard' }] : []),
  ];

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path);

  return (
    <motion.nav
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.3 }}
      className="fixed bottom-0 inset-x-0 bg-gradient-to-r from-white via-white to-white/95 backdrop-blur-lg rounded-t-3xl shadow-2xl border-t-2 border-gray-100 z-40"
    >
      <div className="max-w-2xl mx-auto px-3 py-4 flex items-center justify-between">
        {/* Nav Items - Main Categories */}
        <div className="flex-1 flex items-center justify-around gap-1">
          {navItems.slice(0, -1).map(item => (
            <Link key={item.path} to={item.path} className="flex-1 max-w-[70px]">
              <motion.button
                whileTap={{ scale: 0.85 }}
                whileHover={{ scale: 1.08 }}
                className={`w-full flex flex-col items-center gap-1.5 py-3 px-2 rounded-2xl transition-all duration-200 ${
                  isActive(item.path)
                    ? 'bg-gradient-to-br from-game-purple/30 to-game-pink/20 text-game-purple shadow-md'
                    : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                <span className="text-2xl">{item.emoji}</span>
                <span className="text-xs font-bold tracking-wide">{item.label}</span>
              </motion.button>
            </Link>
          ))}
        </div>

        {/* Divider */}
        <div className="flex flex-col gap-1">
          <div className="w-0.5 h-6 bg-gradient-to-b from-transparent via-gray-300 to-transparent" />
        </div>

        {/* Age Group Selector */}
        <div className="flex items-center gap-1">
          <motion.button
            whileTap={{ scale: 0.85 }}
            whileHover={{ scale: 1.05 }}
            onClick={() => setAgeGroup('prasekolah')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
              ageGroup === 'prasekolah'
                ? 'bg-game-yellow/40 text-gray-800 shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            4-6 Tahun
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.85 }}
            whileHover={{ scale: 1.05 }}
            onClick={() => setAgeGroup('sekolah_rendah')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
              ageGroup === 'sekolah_rendah'
                ? 'bg-game-blue/40 text-gray-800 shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            7-12 Tahun
          </motion.button>
        </div>

        {/* Divider */}
        <div className="w-0.5 h-6 bg-gradient-to-b from-transparent via-gray-300 to-transparent" />

        {/* Right Actions - Dashboard & Settings */}
        <div className="flex items-center gap-2">
          {isAuthenticated && (
            <Link to="/parent-dashboard" className="flex-1">
              <motion.button
                whileTap={{ scale: 0.85 }}
                whileHover={{ scale: 1.08 }}
                className={`flex flex-col items-center gap-1.5 py-3 px-3 rounded-2xl transition-all duration-200 ${
                  isActive('/parent-dashboard')
                    ? 'bg-gradient-to-br from-game-purple/30 to-game-pink/20 text-game-purple shadow-md'
                    : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                <span className="text-2xl">📊</span>
                <span className="text-xs font-bold">Prestasi</span>
              </motion.button>
            </Link>
          )}

          <LanguageToggle />

          {isAuthenticated && (
            <motion.button
              whileTap={{ scale: 0.85 }}
              whileHover={{ scale: 1.08 }}
              onClick={logout}
              className="flex flex-col items-center gap-1.5 py-3 px-3 rounded-2xl text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all duration-200"
              title="Keluar"
            >
              <LogOut className="w-5 h-5" />
              <span className="text-xs font-bold">Keluar</span>
            </motion.button>
          )}
        </div>
      </div>
    </motion.nav>
  );
}