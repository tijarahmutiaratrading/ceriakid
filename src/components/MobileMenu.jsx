import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Home, BarChart3, LogOut } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import LanguageToggle from '@/components/game/LanguageToggle';

export default function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated, logout, user } = useAuth();
  const location = useLocation();

  // Don't show nav on landing & pricing
  if (location.pathname === '/landing' || location.pathname === '/pricing') {
    return null;
  }

  const navItems = [
    { path: '/', icon: Home, label: 'Rumah', emoji: '🏠' },
    ...(isAuthenticated ? [{ path: '/parent-dashboard', icon: BarChart3, label: 'Prestasi', emoji: '📊' }] : []),
  ];

  const handleLogout = () => {
    setIsOpen(false);
    logout();
  };

  return (
    <>
      {/* Hamburger Button - Fixed Top */}
      <motion.button
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-40 bg-gradient-to-r from-game-purple to-game-pink text-white p-3 rounded-2xl shadow-lg"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </motion.button>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/40 z-30"
          />
        )}
      </AnimatePresence>

      {/* Mobile Menu Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ type: 'spring', damping: 20 }}
            className="fixed left-0 top-0 bottom-0 w-64 bg-gradient-to-b from-game-purple to-game-pink z-40 shadow-2xl pt-20 px-4 overflow-y-auto"
          >
            {/* Menu Items */}
            <div className="space-y-3 mb-8">
              {navItems.map(item => (
                <Link key={item.path} to={item.path} onClick={() => setIsOpen(false)}>
                  <motion.div
                    whileTap={{ scale: 0.95 }}
                    className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${
                      location.pathname === item.path
                        ? 'bg-white text-game-purple shadow-lg'
                        : 'bg-white/20 text-white hover:bg-white/30'
                    }`}
                  >
                    <span className="text-2xl">{item.emoji}</span>
                    <span className="font-bold">{item.label}</span>
                  </motion.div>
                </Link>
              ))}
            </div>

            {/* Divider */}
            <div className="h-px bg-white/30 my-6" />

            {/* User Info & Actions */}
            {isAuthenticated && (
              <div className="space-y-3">
                <div className="px-4 py-3">
                  <p className="text-xs text-white/70">Logged in as</p>
                  <p className="text-sm font-bold text-white truncate">{user?.email}</p>
                </div>

                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 bg-red-500/90 hover:bg-red-600 text-white rounded-2xl font-bold transition-all"
                >
                  <LogOut className="w-5 h-5" />
                  Keluar
                </motion.button>
              </div>
            )}

            {/* Language Toggle - Bottom */}
            <div className="fixed bottom-6 left-4 right-4 max-w-52">
              <LanguageToggle />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}