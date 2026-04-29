import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { useAgeGroup } from '@/lib/AgeGroupContext';

export default function HamburgerMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated } = useAuth();
  const { ageGroup, toggleAgeGroup } = useAgeGroup() || {};
  const safeAgeGroup = ageGroup || 'prasekolah';
  const safeToggle = toggleAgeGroup || (() => {});
  const location = useLocation();

  // Don't show on landing, pricing, admin & client dashboards
  if (location.pathname === '/landing' || location.pathname === '/pricing' || 
      location.pathname === '/admin-dashboard' || location.pathname === '/client-dashboard') {
    return null;
  }

  const navItems = [
    { path: '/', emoji: '🏠', label: 'Rumah' },
    { path: '/games/bahasa_melayu', emoji: '🇲🇾', label: 'Bahasa Melayu' },
    { path: '/games/english', emoji: '🇬🇧', label: 'English' },
    { path: '/games/mathematics', emoji: '🔢', label: 'Matematik' },
    { path: '/games/science', emoji: '🔬', label: 'Sains' },
    ...(safeAgeGroup === 'sekolah_rendah' ? [{ path: '/games/jawi', emoji: '🕌', label: 'Jawi' }] : []),
    { path: '/drawing', emoji: '🎨', label: 'Studio Lukisan' },
    ...(isAuthenticated ? [{ path: '/parent-dashboard', emoji: '📊', label: 'Prestasi' }] : []),
  ];

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path);

  return (
    <>
      {/* Menu Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 p-2 rounded-full bg-game-purple text-white shadow-lg"
        whileTap={{ scale: 0.9 }}
        whileHover={{ scale: 1.05 }}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
            >
              <X className="w-6 h-6" />
            </motion.div>
          ) : (
            <motion.div
              key="menu"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
            >
              <Menu className="w-6 h-6" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      {/* Menu Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="fixed left-0 top-0 z-40 h-screen w-64 bg-white rounded-r-2xl shadow-2xl pt-20 px-4 overflow-y-auto"
          >
            <nav className="space-y-3">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                >
                  <motion.button
                    whileHover={{ x: 8 }}
                    whileTap={{ scale: 0.95 }}
                    className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all ${
                      isActive(item.path)
                        ? 'bg-game-purple text-white shadow-lg'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span className="text-xl">{item.emoji}</span>
                    <span>{item.label}</span>
                  </motion.button>
                </Link>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}