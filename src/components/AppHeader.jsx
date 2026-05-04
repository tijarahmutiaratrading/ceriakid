import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ArrowLeft, LogOut } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { useAgeGroup } from '@/lib/AgeGroupContext';
import LanguageSwitcher from '@/components/LanguageSwitcher';

export default function AppHeader({ showBack = null, backTo = '/', title = null }) {
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth() || {};
  const { ageGroup = 'prasekolah' } = useAgeGroup() || {};
  const location = useLocation();
  const isAdmin = user?.role === 'admin';
  const isLanding = location.pathname === '/' || location.pathname === '/landing';
  const isPlayingGame = location.pathname.startsWith('/play/');
  const isActive = (path) => path === '/' ? location.pathname === '/' : location.pathname === path || location.pathname.startsWith(path);

  const otherItems = [
    { path: '/children-profiles', emoji: '👨‍👩‍👧‍👦', label: 'Profil Anak' },
    { path: '/bbm', emoji: '📚', label: 'Bahan Bantu Mengajar' },
    { path: '/drawing', emoji: '🎨', label: 'Studio Lukisan' },
    { path: '/parent-dashboard', emoji: '📊', label: 'Prestasi Anak' },
    { path: '/friends', emoji: '👥', label: 'Kawan' },
    { path: '/challenges', emoji: '⚡', label: 'Cabaran' },
  ];

  // Determine menu based on user role and location
  let topItems = [];
  let adminItems = [];
  let dashboardItems = [];

  if (isLanding && !isAuthenticated) {
    topItems = [
      { path: '/', emoji: '🏠', label: 'Rumah' },
      { path: '#features', emoji: '⭐', label: 'Ciri-ciri', external: true },
      { path: '#testimonials', emoji: '💬', label: 'Testimoni', external: true },
      { path: '#pricing', emoji: '💰', label: 'Harga', external: true },
      { path: '#faq', emoji: '❓', label: 'Soalan Lazim', external: true },
    ];
  } else {
    topItems = [{ path: '/', emoji: '🏠', label: 'Halaman Utama' }];
    
    if (isAuthenticated) {
      dashboardItems = [
        { path: '/dashboard', emoji: '📊', label: 'Dashboard Pengguna' },
        { path: '/settings', emoji: '⚙️', label: 'Tetapan' },
      ];
    }
    
    if (isAdmin) {
      adminItems = [
        { path: '/admin-dashboard', emoji: '🎛️', label: 'Admin Dashboard' },
        { path: '/admin-game-manager', emoji: '⚙️', label: 'Game Manager' },
        { path: '/admin-bbm-generator', emoji: '📚', label: 'BBM Generator' },
      ];
    }
  }

  const navItems = [
    { path: '/dashboard', emoji: '🏠', label: 'Rumah' },
    { path: '/games-hub', emoji: '🎮', label: 'Games' },
    { path: '/parent-dashboard', emoji: '📊', label: 'Prestasi' },
    { path: '/dashboard', emoji: '📱', label: 'Dashboard' },
  ];

  return (
    <>
      {/* Header Bar - Sticky Bottom Nav */}
      <div className="fixed bottom-0 left-0 right-0 z-40 flex justify-center px-3 pb-3">
        <div className={`w-full md:max-w-lg rounded-3xl h-20 flex items-center justify-around border-t`}
             style={{
               background: 'linear-gradient(135deg, #1a5f5f 0%, #0d3d3d 100%)',
               backdropFilter: 'blur(24px)',
               WebkitBackdropFilter: 'blur(24px)',
               borderTop: '1px solid rgba(255,255,255,0.1)',
               boxShadow: '0 -8px 32px rgba(0,0,0,0.5), 0 4px 16px rgba(0,0,0,0.4)'
             }}>
          {isAuthenticated ? (
            <>
              {navItems.map((item) => (
                <Link key={item.path} to={item.path} className="flex-1">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    className={`w-full h-20 flex flex-col items-center justify-center gap-1 transition-all ${
                      isActive(item.path) ? 'text-white' : 'text-gray-300 hover:text-white'
                    }`}
                  >
                    <span className="text-2xl">{item.emoji}</span>
                    <span className="text-xs font-bold">{item.label}</span>
                  </motion.button>
                </Link>
              ))}
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className="flex-1 h-20 flex flex-col items-center justify-center gap-1 text-gray-300 hover:text-white transition-all"
              >
                <span className="text-2xl">☰</span>
                <span className="text-xs font-bold">Menu</span>
              </motion.button>
            </>
          ) : (
            <>
              <Link to="/" className="flex-1">
                <motion.button whileTap={{ scale: 0.95 }} className="w-full h-20 flex flex-col items-center justify-center gap-1 text-white">
                  <span className="text-2xl">🏠</span>
                  <span className="text-xs font-bold">Rumah</span>
                </motion.button>
              </Link>
              <Link to="/games-hub" className="flex-1">
                <motion.button whileTap={{ scale: 0.95 }} className="w-full h-20 flex flex-col items-center justify-center gap-1 text-gray-300">
                  <span className="text-2xl">🎮</span>
                  <span className="text-xs font-bold">Games</span>
                </motion.button>
              </Link>
              <Link to="/bbm" className="flex-1">
                <motion.button whileTap={{ scale: 0.95 }} className="w-full h-20 flex flex-col items-center justify-center gap-1 text-gray-300">
                  <span className="text-2xl">📚</span>
                  <span className="text-xs font-bold">BBM</span>
                </motion.button>
              </Link>
              <button onClick={() => setIsOpen(!isOpen)} className="flex-1 flex flex-col items-center justify-center gap-1 text-gray-300 h-20">
                <span className="text-2xl">☰</span>
                <span className="text-xs font-bold">Menu</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Top Header Bar - User Profile Section */}
      <div className="fixed top-0 left-0 right-0 z-50 flex justify-center px-0">
        <div className="w-full md:max-w-lg bg-gradient-to-r from-slate-800 to-slate-700 text-white px-4 py-3 flex items-center justify-between border-b border-slate-600">
          {isAuthenticated && user ? (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center gap-2 flex-1"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-black text-sm flex-shrink-0">
                {user.full_name?.[0]?.toUpperCase() || '?'}
              </div>
              <div className="text-left min-w-0 flex-1">
                <p className="text-sm font-black leading-tight">{user.full_name || 'User'}</p>
              </div>
            </motion.button>
          ) : (
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center gap-2"
            >
              <Menu className="w-5 h-5" />
              <span className="font-bold">Menu</span>
            </button>
          )}
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="flex items-center gap-1 text-xs font-black px-2 py-1 bg-white/10 rounded-full">
              <span>😊</span>
              <span>0</span>
            </div>
            <button className="p-1.5 hover:bg-white/10 rounded-lg transition-all">
              <span className="text-lg">🔔</span>
            </button>
            <button className="p-1.5 hover:bg-white/10 rounded-lg transition-all">
              <span className="text-lg">🎁</span>
            </button>
          </div>
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
            initial={{ x: -320, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -320, opacity: 0 }}
            transition={{ type: 'spring', damping: 22, stiffness: 280 }}
            className="fixed left-0 top-0 bottom-20 z-50 w-72 flex flex-col rounded-r-3xl overflow-hidden shadow-2xl"
            style={{ background: 'rgba(255,255,255,0.98)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-white">
              <img src="https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/c0ad02d9e_ChatGPTImageMay12026at12_29_37PM.png" alt="CeriaKid" className="h-10 rounded-lg" />
              <button type="button" onClick={() => setIsOpen(false)} className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* User info */}
            {isAuthenticated && user && (
              <div className="px-5 py-4 bg-white border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-black text-sm flex-shrink-0">
                    {user.full_name?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-gray-800 text-sm truncate">{user.full_name}</p>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Scrollable nav */}
            <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">

              {/* Authenticated nav */}
              {isAuthenticated && (
                <>
                  {navItems.map((item) => (
                    <Link key={item.path} to={item.path} onClick={() => setIsOpen(false)}>
                      <motion.div whileTap={{ scale: 0.97 }}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all ${
                          isActive(item.path) ? 'bg-purple-100 text-purple-600' : 'text-gray-700 hover:bg-gray-100'
                        }`}>
                        <span className="text-lg">{item.emoji}</span>
                        <span>{item.label}</span>
                      </motion.div>
                    </Link>
                  ))}
                </>
              )}

              {/* Other features */}
              {isAuthenticated && otherItems.length > 0 && (
                <>
                  <div className="border-t border-gray-100 my-2" />
                  {otherItems.slice(0, 3).map((item) => (
                    <Link key={item.path} to={item.path} onClick={() => setIsOpen(false)}>
                      <motion.div whileTap={{ scale: 0.97 }}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all ${
                          isActive(item.path) ? 'bg-purple-100 text-purple-600' : 'text-gray-700 hover:bg-gray-100'
                        }`}>
                        <span className="text-lg">{item.emoji}</span>
                        <span>{item.label}</span>
                      </motion.div>
                    </Link>
                  ))}
                </>
              )}

              {/* Admin section */}
              {adminItems.length > 0 && (
                <>
                  <div className="border-t border-gray-100 my-2" />
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider px-4 pt-2 pb-1">Admin</p>
                  {adminItems.map((item) => (
                    <Link key={item.path} to={item.path} onClick={() => setIsOpen(false)}>
                      <motion.div whileTap={{ scale: 0.97 }}
                        className={`flex items-center gap-3 px-4 py-2.5 rounded-xl font-semibold text-xs transition-all ${
                          isActive(item.path) ? 'bg-red-100 text-red-600' : 'text-gray-600 hover:bg-gray-100'
                        }`}>
                        <span className="text-lg">{item.emoji}</span>
                        <span>{item.label}</span>
                      </motion.div>
                    </Link>
                  ))}
                </>
              )}
            </nav>

            {/* Footer: Logout */}
            {isAuthenticated && (
              <div className="px-3 py-3 border-t border-gray-100 bg-white">
                <motion.button type="button" whileTap={{ scale: 0.97 }}
                  onClick={() => { setIsOpen(false); logout?.(); }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-all">
                  <LogOut className="w-4 h-4 flex-shrink-0" />
                  <span>Log Keluar</span>
                </motion.button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}