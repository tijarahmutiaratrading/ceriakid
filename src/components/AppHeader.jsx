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
  
  // Auto-show back button on non-home pages
  const shouldShowBack = showBack !== null ? showBack : !isLanding;



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

  const isActive = (path) => path === '/' ? location.pathname === '/' : location.pathname === path || location.pathname.startsWith(path);

  return (
    <>
      {/* Header Bar */}
      <div className="fixed bottom-4 left-0 right-0 z-40 flex justify-center px-4">
        <div className={`w-full md:max-w-lg rounded-2xl px-3 sm:px-5 h-16 flex items-center justify-between ${
          isPlayingGame
            ? 'bg-white shadow-lg border border-gray-200'
            : 'bg-white/30 backdrop-blur-xl shadow-xl border border-white/30'
        }`}
             style={{
               boxShadow: isPlayingGame ? '0 4px 12px rgba(0, 0, 0, 0.1)' : '0 10px 30px rgba(0, 0, 0, 0.1)'
             }}>
          {/* Left: Hamburger */}
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 flex items-center justify-center text-gray-700 hover:bg-gray-100 rounded-lg transition-all"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Center: Logo / Title */}
          <Link to="/" className="flex items-center gap-2 flex-1 justify-center">
            <img src="https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/c0ad02d9e_ChatGPTImageMay12026at12_29_37PM.png" alt="CeriaKid" className="h-10 rounded-lg" />
          </Link>

          {/* Right: Language Switcher or Back */}
          <div className="flex items-center gap-2">
            {!isLanding && <LanguageSwitcher />}
            {shouldShowBack ? (
              <Link to={backTo}>
                <button type="button" className="p-2 flex items-center justify-center text-gray-700 hover:bg-gray-100 rounded-lg transition-all">
                  <ArrowLeft className="w-5 h-5" />
                </button>
              </Link>
            ) : (
              <div className="w-10" />
            )}
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
            className="fixed left-3 top-3 bottom-3 z-50 w-72 flex flex-col rounded-3xl overflow-hidden shadow-2xl"
            style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(30px)', WebkitBackdropFilter: 'blur(30px)', border: '1px solid rgba(255,255,255,0.3)' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <img src="https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/9519ccb9a_ChatGPTImageApr302026at06_37_02PM.png" alt="CeriaKid" className="h-10 rounded-xl" />
              <button type="button" onClick={() => setIsOpen(false)} className="p-2 rounded-xl text-gray-500 hover:text-gray-700 hover:bg-white/50 transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* User info */}
            {isAuthenticated && user && (
              <div className="px-5 py-4" style={{ background: 'rgba(255,255,255,0.1)', borderBottom: '1px solid rgba(255,255,255,0.2)' }}>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-game-purple to-game-pink flex items-center justify-center text-white font-black text-sm flex-shrink-0">
                    {user.full_name?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div className="min-w-0">
                    <p className="font-black text-white text-sm truncate">{user.full_name}</p>
                    <p className="text-xs text-white/70 truncate">{user.email}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Scrollable nav */}
            <nav className="flex-1 overflow-y-auto px-3 py-5 space-y-0.5">

              {/* Top / Landing items */}
              {topItems.map((item) =>
                item.external ? (
                  <a key={item.path} href={item.path} onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-gray-700 hover:bg-gray-100 transition-all text-sm">
                    <span>{item.label}</span>
                    </a>
                    ) : (
                    <Link key={item.path} to={item.path} onClick={() => setIsOpen(false)}>
                     <motion.div whileTap={{ scale: 0.97 }}
                       className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                         isActive(item.path) ? 'bg-game-purple/90 text-white shadow-sm' : 'text-white/80 hover:text-white hover:bg-white/20'
                       }`}>
                      <span>{item.label}</span>
                    </motion.div>
                  </Link>
                )
              )}

              {/* Dashboard section - without games link */}
              {dashboardItems.length > 0 && (
                <>
                  <p className="text-xs font-black text-white/50 uppercase tracking-wider px-4 pt-5 pb-2">Dashboard</p>
                  {dashboardItems.map((item) => (
                    <Link key={item.path} to={item.path} onClick={() => setIsOpen(false)}>
                      <motion.div whileTap={{ scale: 0.97 }}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all ${
                          isActive(item.path) ? 'bg-blue-500 text-white shadow-md' : 'text-white/80 hover:text-white hover:bg-white/20'
                        }`}>
                        <span>{item.label}</span>
                      </motion.div>
                    </Link>
                  ))}
                </>
              )}

              {/* Other features */}
              {isAuthenticated && otherItems.length > 0 && (
                <>
                  <p className="text-xs font-black text-white/50 uppercase tracking-wider px-4 pt-5 pb-2">Lain-lain</p>
                  {otherItems.map((item) => (
                    <Link key={item.path} to={item.path} onClick={() => setIsOpen(false)}>
                      <motion.div whileTap={{ scale: 0.97 }}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all ${
                          isActive(item.path) ? 'bg-gradient-to-r from-game-purple to-game-pink text-white shadow-md' : 'text-white/80 hover:text-white hover:bg-white/20'
                        }`}>
                        <span>{item.label}</span>
                      </motion.div>
                    </Link>
                  ))}
                </>
              )}

              {/* Admin section */}
              {adminItems.length > 0 && (
                <>
                  <p className="text-xs font-black text-white/50 uppercase tracking-wider px-4 pt-5 pb-2">Admin</p>
                  <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }}>
                    {adminItems.map((item) => (
                      <Link key={item.path} to={item.path} onClick={() => setIsOpen(false)}>
                        <motion.div whileTap={{ scale: 0.97 }}
                          className={`flex items-center gap-3 px-4 py-3 font-semibold text-sm transition-all border-b last:border-0 ${
                            isActive(item.path) ? 'bg-indigo-600 text-white shadow-md' : 'text-white/80 hover:text-white hover:bg-white/20'
                          }`}
                          style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                          <span>{item.label}</span>
                        </motion.div>
                      </Link>
                    ))}
                  </div>
                </>
              )}
            </nav>

            {/* Footer: Logout */}
            {isAuthenticated && (
              <div className="px-3 py-4" style={{ borderTop: '1px solid rgba(255,255,255,0.2)' }}>
                <motion.button type="button" whileTap={{ scale: 0.97 }}
                  onClick={() => { setIsOpen(false); logout?.(); }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm text-white/80 hover:text-white hover:bg-red-500/20 transition-all">
                  <LogOut className="w-5 h-5 flex-shrink-0" />
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