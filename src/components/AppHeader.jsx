import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { useAgeGroup } from '@/lib/AgeGroupContext';

export default function AppHeader({ showBack = false, backTo = '/', title = null }) {
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated, user } = useAuth() || {};
  const { ageGroup = 'prasekolah' } = useAgeGroup() || {};
  const location = useLocation();
  const isAdmin = user?.role === 'admin';
  const isLanding = location.pathname === '/landing' || location.pathname === '/';

  // Determine menu based on user role and location
  let navItems = [];

  if (isLanding && !isAuthenticated) {
    // Public/Landing page menu
    navItems = [
      { path: '/', emoji: '🏠', label: 'Rumah' },
      { path: '#features', emoji: '⭐', label: 'Ciri-ciri', external: true },
      { path: '#testimonials', emoji: '💬', label: 'Testimoni', external: true },
      { path: '#pricing', emoji: '💰', label: 'Harga', external: true },
      { path: '#faq', emoji: '❓', label: 'Soalan Lazim', external: true },
    ];
  } else if (isAdmin) {
    // Admin menu
    navItems = [
      { path: '/admin-hub', emoji: '🎛️', label: 'Admin Hub' },
      { path: '/admin-dashboard', emoji: '📊', label: 'Dashboard' },
      { path: '/admin-settings', emoji: '⚙️', label: 'Settings' },
    ];
  } else if (isAuthenticated) {
    // Client menu
    navItems = [
      { path: '/', emoji: '🏠', label: 'Rumah' },
      { path: '/games/bahasa_melayu', emoji: '🇲🇾', label: 'Bahasa Melayu' },
      { path: '/games/english', emoji: '🇬🇧', label: 'English' },
      { path: '/games/mathematics', emoji: '🔢', label: 'Matematik' },
      { path: '/games/science', emoji: '🔬', label: 'Sains' },
      ...(ageGroup === 'sekolah_rendah' ? [{ path: '/games/jawi', emoji: '🕌', label: 'Jawi' }] : []),
      { path: '/drawing', emoji: '🎨', label: 'Studio Lukisan' },
      { path: '/parent-dashboard', emoji: '📊', label: 'Prestasi' },
      { path: '/friends', emoji: '👥', label: 'Kawan' },
      { path: '/challenges', emoji: '⚡', label: 'Cabaran' },
      ...(isAdmin ? [{ path: '/admin-hub', emoji: '🎛️', label: 'Admin Hub' }] : []),
    ];
  }

  const isActive = (path) => path === '/' ? location.pathname === '/' : location.pathname === path || location.pathname.startsWith(path);

  return (
    <>
      {/* Header Bar */}
      <div className="bg-white/90 backdrop-blur-sm border-b border-amber-100 shadow-sm">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
          {/* Left: Hamburger or Back */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded-xl bg-game-purple text-white shadow-md flex items-center justify-center"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Center: Logo / Title */}
          <Link to="/" className="flex items-center gap-2">
            <span className="text-xl">🎓</span>
            <span className="font-black text-game-purple text-lg">CeriaJaya</span>
          </Link>

          {/* Right: Back button or spacer */}
          {showBack ? (
            <Link to={backTo}>
              <button className="p-2 rounded-xl bg-gray-100 text-gray-600 flex items-center justify-center">
                <ArrowLeft className="w-5 h-5" />
              </button>
            </Link>
          ) : (
            <div className="w-9" />
          )}
        </div>
      </div>

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
            className="fixed left-0 top-0 z-50 h-screen w-64 bg-white rounded-r-2xl shadow-2xl pt-6 px-4 overflow-y-auto"
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🎓</span>
                <span className="font-black text-game-purple text-lg">CeriaJaya</span>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-1 rounded-lg text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="space-y-2">
              {navItems.map((item) => (
                item.external ? (
                  <a
                    key={item.path}
                    href={item.path}
                    onClick={() => setIsOpen(false)}
                    className="w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-gray-700 hover:bg-gray-100 transition-all"
                  >
                    <span className="text-xl">{item.emoji}</span>
                    <span>{item.label}</span>
                  </a>
                ) : (
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
                )
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}