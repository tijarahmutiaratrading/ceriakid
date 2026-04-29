import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, BookOpen, Calculator, Microscope, BarChart3, LogOut } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import LanguageToggle from '@/components/game/LanguageToggle';

export default function BottomNavigation() {
  const { isAuthenticated, logout } = useAuth();
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
      className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md rounded-t-2xl shadow-2xl border-t border-gray-200"
    >
      <div className="max-w-xl mx-auto px-2 py-3 flex items-center justify-around gap-1">
        {/* Nav Items */}
        {navItems.map(item => (
          <Link key={item.path} to={item.path} className="flex-1">
            <motion.button
              whileTap={{ scale: 0.9 }}
              whileHover={{ scale: 1.05 }}
              className={`w-full flex flex-col items-center gap-1 py-3 rounded-xl transition-all ${
                isActive(item.path)
                  ? 'bg-game-purple/20 text-game-purple'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span className="text-2xl">{item.emoji}</span>
              <span className="text-xs font-semibold">{item.label}</span>
            </motion.button>
          </Link>
        ))}

        {/* Separator */}
        <div className="w-px h-8 bg-gray-300" />

        {/* Right Actions */}
        <div className="flex flex-col items-center gap-2">
          <LanguageToggle />
          {isAuthenticated && (
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={logout}
              className="text-gray-600 hover:text-red-600 transition-all"
              title="Keluar"
            >
              <LogOut className="w-5 h-5" />
            </motion.button>
          )}
        </div>
      </div>
    </motion.nav>
  );
}