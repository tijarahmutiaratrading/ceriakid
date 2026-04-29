import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, BookOpen, Calculator, Microscope, BarChart3, LogOut } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { useAgeGroup } from '@/lib/AgeGroupContext';
import LanguageToggle from '@/components/game/LanguageToggle';

export default function BottomNavigation() {
  const { isAuthenticated, logout } = useAuth();
  const { ageGroup } = useAgeGroup();
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
      className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-game-purple/95 via-game-pink/95 to-game-blue/95 rounded-t-3xl px-3 py-3 max-w-lg mx-auto shadow-2xl border-t-2 border-white/20"
      style={{ left: '50%', transform: 'translateX(-50%)' }}
    >
      <div className="flex items-center justify-between gap-1">
        {/* Nav Items - Scrollable */}
        <div className="flex gap-1 flex-1 overflow-x-auto pb-1">
          {navItems.map(item => (
            <Link key={item.path} to={item.path}>
              <motion.button
                whileTap={{ scale: 0.85 }}
                whileHover={{ scale: 1.05 }}
                className={`px-3 py-2 rounded-2xl font-bold text-sm whitespace-nowrap transition-all ${
                  isActive(item.path)
                    ? 'bg-white/90 text-game-purple shadow-lg'
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                <span className="text-base">{item.emoji}</span>
                <span className="hidden sm:inline ml-1">{item.label}</span>
              </motion.button>
            </Link>
          ))}
        </div>

        {/* Right Actions */}
        <div className="flex gap-1 flex-shrink-0">
          <LanguageToggle />
          {isAuthenticated && (
            <motion.button
              whileTap={{ scale: 0.85 }}
              onClick={logout}
              className="bg-white/20 hover:bg-white/30 text-white rounded-2xl p-2 font-bold transition-all"
              title="Keluar"
            >
              <LogOut className="w-4 h-4" />
            </motion.button>
          )}
        </div>
      </div>
    </motion.nav>
  );
}