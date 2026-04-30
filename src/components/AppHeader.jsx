import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ArrowLeft, ChevronDown } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { useAgeGroup } from '@/lib/AgeGroupContext';

export default function AppHeader({ showBack = null, backTo = '/', title = null }) {
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated, user } = useAuth() || {};
  const { ageGroup = 'prasekolah' } = useAgeGroup() || {};
  const location = useLocation();
  const isAdmin = user?.role === 'admin';
  const isLanding = location.pathname === '/' || location.pathname === '/landing';
  
  // Auto-show back button on non-home pages
  const shouldShowBack = showBack !== null ? showBack : !isLanding;

  const subjectItems = [
    { path: '/games/bahasa_melayu', emoji: '🇲🇾', label: 'Bahasa Melayu' },
    { path: '/games/english', emoji: '🇬🇧', label: 'English' },
    { path: '/games/mathematics', emoji: '🔢', label: 'Matematik' },
    { path: '/games/science', emoji: '🔬', label: 'Sains' },
    ...(ageGroup === 'sekolah_rendah' ? [{ path: '/games/jawi', emoji: '🕌', label: 'Jawi' }] : []),
  ];

  const otherItems = [
    { path: '/drawing', emoji: '🎨', label: 'Studio Lukisan' },
    { path: '/parent-dashboard', emoji: '📊', label: 'Prestasi' },
    { path: '/friends', emoji: '👥', label: 'Kawan' },
    { path: '/challenges', emoji: '⚡', label: 'Cabaran' },
  ];

  // Determine menu based on user role and location
  let topItems = [];
  let showSubjectsSection = true;
  let adminItems = [];

  if (isLanding && !isAuthenticated) {
    topItems = [
      { path: '/', emoji: '🏠', label: 'Rumah' },
      { path: '#features', emoji: '⭐', label: 'Ciri-ciri', external: true },
      { path: '#testimonials', emoji: '💬', label: 'Testimoni', external: true },
      { path: '#pricing', emoji: '💰', label: 'Harga', external: true },
      { path: '#faq', emoji: '❓', label: 'Soalan Lazim', external: true },
    ];
    showSubjectsSection = false;
  } else {
    topItems = [{ path: '/', emoji: '🏠', label: 'Rumah' }];
    
    if (isAdmin) {
      adminItems = [
        { path: '/admin-hub', emoji: '🎛️', label: 'Admin Hub' },
        { path: '/admin-dashboard', emoji: '📊', label: 'Dashboard Admin' },
        { path: '/admin-settings', emoji: '⚙️', label: 'Settings' },
      ];
    }
  }

  const isActive = (path) => path === '/' ? location.pathname === '/' : location.pathname === path || location.pathname.startsWith(path);

  if (isLanding) return null;

  return (
    <>
      {/* Header Bar */}
      <div className="fixed bottom-4 left-0 right-0 z-40 flex justify-center px-4">
        <div className="w-full max-w-lg bg-gradient-to-r from-yellow-400 via-orange-400 to-purple-500 rounded-full px-6 h-16 flex items-center justify-between backdrop-blur-md bg-opacity-85 shadow-2xl"
             style={{
               boxShadow: '0 8px 32px rgba(245, 158, 11, 0.3), 0 0 60px rgba(168, 85, 247, 0.2)'
             }}>
          {/* Left: Hamburger or Back */}
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 flex items-center justify-center text-amber-800 hover:opacity-75 transition-opacity"
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Center: Logo / Title */}
          <Link to="/" className="flex items-center gap-2 flex-1 justify-center">
            <span className="text-2xl">🎓</span>
            <span className="font-black text-white text-xl">CeriaJaya</span>
          </Link>

          {/* Right: Back button or spacer */}
          {shouldShowBack ? (
            <Link to={backTo}>
              <button type="button" className="p-2 flex items-center justify-center text-white hover:opacity-75 transition-opacity">
                <ArrowLeft className="w-6 h-6" />
              </button>
            </Link>
          ) : (
            <div className="w-10" />
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
            className="fixed inset-0 z-40 bg-black/10"
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
            className="fixed left-0 top-0 z-50 h-screen w-64 bg-white rounded-r-2xl shadow-2xl pt-6 px-4 overflow-y-auto backdrop-filter-none"
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🎓</span>
                <span className="font-black text-game-purple text-lg">CeriaJaya</span>
              </div>
              <button type="button" onClick={() => setIsOpen(false)} className="p-1 rounded-lg text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="space-y-3">
              {/* Top Items */}
              {topItems.map((item) => (
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
                   <Link key={item.path} to={item.path} onClick={() => setIsOpen(false)} className="w-full">
                     <motion.button
                       type="button"
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

              {/* Subjects Section */}
              {showSubjectsSection && (
                <div className="space-y-1">
                  {subjectItems.map((item) => (
                    <Link key={item.path} to={item.path} onClick={() => setIsOpen(false)} className="w-full">
                      <motion.button
                        type="button"
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
                </div>
              )}

              {/* Other Items */}
              {otherItems.map((item) => (
                <Link key={item.path} to={item.path} onClick={() => setIsOpen(false)} className="w-full">
                  <motion.button
                    type="button"
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

              {/* Admin Items */}
              {adminItems.length > 0 && (
                <>
                  <div className="border-t border-gray-200 my-2" />
                  {adminItems.map((item) => (
                    <Link key={item.path} to={item.path} onClick={() => setIsOpen(false)} className="w-full">
                      <motion.button
                        type="button"
                        whileHover={{ x: 8 }}
                        whileTap={{ scale: 0.95 }}
                        className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all ${
                          isActive(item.path)
                            ? 'bg-red-500 text-white shadow-lg'
                            : 'text-red-600 hover:bg-red-50'
                        }`}
                      >
                        <span className="text-xl">{item.emoji}</span>
                        <span>{item.label}</span>
                      </motion.button>
                    </Link>
                  ))}
                </>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}