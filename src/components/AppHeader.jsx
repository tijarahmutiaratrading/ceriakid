import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ArrowLeft, LogOut } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { useAgeGroup } from '@/lib/AgeGroupContext';
import { useSafeLocation } from '@/hooks/useSafeLocation';
import LanguageSwitcher from '@/components/LanguageSwitcher';

export default function AppHeader({ showBack = null, backTo = '/', title = null }) {
  const [isOpen, setIsOpen] = useState(false);
  const [navVisible, setNavVisible] = useState(true);
  const { isAuthenticated, user, logout } = useAuth() || {};
  const { ageGroup = 'prasekolah' } = useAgeGroup() || {};
  const location = useSafeLocation();
  const navigate = useNavigate();
  const isAdmin = user?.role === 'admin';
  const isLanding = location.pathname === '/' || location.pathname === '/landing';
  const isPlayingGame = location.pathname.startsWith('/play/');
  const lastScrollY = React.useRef(0);
  
  // Auto-show back button on non-home pages
  const shouldShowBack = showBack !== null ? showBack : !isLanding;

  React.useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      if (currentY < 50) {
        setNavVisible(true);
      } else if (currentY > lastScrollY.current) {
        setNavVisible(false);
      } else {
        setNavVisible(true);
      }
      lastScrollY.current = currentY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);



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

  const navItems = [
    { emoji: '☰', label: 'Menu', action: () => setIsOpen(!isOpen) },
    { emoji: '🎮', label: 'Games', path: '/dashboard' },
    { emoji: '📊', label: 'Prestasi', path: '/parent-dashboard' },
    { emoji: '🎨', label: 'Drawing', path: '/drawing' },
    { emoji: '⬅️', label: 'Back', action: () => navigate(-1) },
  ];

  return (
    <>
      {/* Top Header - Landing Style */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 transition-transform duration-300" style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.2)', transform: navVisible ? 'translateY(0)' : 'translateY(-100%)' }}>
        <div className="max-w-lg mx-auto w-full flex items-center justify-between">
          <Link to="/">
            <img src="https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/c0ad02d9e_ChatGPTImageMay12026at12_29_37PM.png" alt="CeriaKid" className="h-10 rounded-lg cursor-pointer" />
          </Link>
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-500 to-slate-700 flex items-center justify-center text-white font-black text-sm hover:shadow-md transition-all"
          >
            {user?.full_name?.[0]?.toUpperCase() || '👤'}
          </button>
        </div>
      </nav>

      {/* Bottom Navigation Bar */}
      <div className="fixed bottom-8 left-0 right-0 z-40 flex justify-center px-4 transition-transform duration-300" style={{ transform: navVisible ? 'translateY(0)' : 'translateY(120px)' }}>
        <div className="w-full md:max-w-lg rounded-2xl h-16 flex items-center justify-around"
             style={{
                background: 'rgba(255,255,255,0.18)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                border: '1px solid rgba(255,255,255,0.35)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.12)'
             }}>
          {navItems.map((item) => {
            const isBackButton = item.label === 'Back';
            return isBackButton ? (
              <button key={item.label} type="button" onClick={item.action} className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-500 to-slate-700 flex items-center justify-center text-white font-black text-sm hover:shadow-md transition-all">
                {item.emoji}
              </button>
            ) : item.path ? (
              <Link key={item.label} to={item.path} className="flex flex-col items-center gap-1 text-center">
                <span className="text-xl">{item.emoji}</span>
                <span className="text-xs font-bold text-gray-700">{item.label}</span>
              </Link>
            ) : (
              <button key={item.label} onClick={item.action} className="flex flex-col items-center gap-1 text-center hover:opacity-70 transition-all">
                <span className="text-xl">{item.emoji}</span>
                <span className="text-xs font-bold text-gray-700">{item.label}</span>
              </button>
            );
          })}
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
            className="fixed left-3 top-3 bottom-3 z-50 w-72 flex flex-col rounded-3xl overflow-hidden shadow-2xl bg-white"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 bg-white/80">
              <img src="https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/c0ad02d9e_ChatGPTImageMay12026at12_29_37PM.png" alt="CeriaKid" className="h-10 rounded-xl" />
              <button type="button" onClick={() => setIsOpen(false)} className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* User info */}
            {isAuthenticated && user && (
              <div className="px-5 py-3 bg-white/60 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-500 to-slate-700 flex items-center justify-center text-white font-black text-sm flex-shrink-0">
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
            <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">

              {/* Top / Landing items */}
              {topItems.map((item) =>
                item.external ? (
                  <a key={item.path} href={item.path} onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-2xl font-semibold text-gray-700 hover:bg-white transition-all text-sm">
                    <span>{item.label}</span>
                  </a>
                ) : (
                  <Link key={item.path} to={item.path} onClick={() => setIsOpen(false)}>
                    <motion.div whileTap={{ scale: 0.97 }}
                      className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-semibold text-sm transition-all ${
                        isActive(item.path) ? 'bg-[#5b7db1] text-white shadow-sm' : 'text-gray-700 hover:bg-white'
                      }`}>
                      <span>{item.label}</span>
                    </motion.div>
                  </Link>
                )
              )}

              {/* Dashboard section */}
              {dashboardItems.length > 0 && (
                <>
                  {dashboardItems.map((item) => (
                    <Link key={item.path} to={item.path} onClick={() => setIsOpen(false)}>
                      <motion.div whileTap={{ scale: 0.97 }}
                        className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-semibold text-sm transition-all ${
                          isActive(item.path) ? 'bg-[#5b7db1] text-white shadow-sm' : 'text-gray-700 hover:bg-white'
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
                  {otherItems.map((item) => (
                    <Link key={item.path} to={item.path} onClick={() => setIsOpen(false)}>
                      <motion.div whileTap={{ scale: 0.97 }}
                        className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-semibold text-sm transition-all ${
                          isActive(item.path) ? 'bg-[#5b7db1] text-white shadow-sm' : 'text-gray-700 hover:bg-white'
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
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider px-4 pt-4 pb-1">Admin</p>
                  {adminItems.map((item) => (
                    <Link key={item.path} to={item.path} onClick={() => setIsOpen(false)}>
                      <motion.div whileTap={{ scale: 0.97 }}
                        className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-semibold text-sm transition-all ${
                          isActive(item.path) ? 'bg-[#5b7db1] text-white shadow-sm' : 'text-gray-700 hover:bg-white'
                        }`}>
                        <span>{item.label}</span>
                      </motion.div>
                    </Link>
                  ))}
                </>
              )}
            </nav>

            {/* Footer: Logout */}
            {isAuthenticated && (
              <div className="px-3 py-3 border-t border-gray-200 bg-white/40">
                <motion.button type="button" whileTap={{ scale: 0.97 }}
                  onClick={() => { setIsOpen(false); logout?.(); }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-semibold text-sm text-gray-700 hover:bg-white hover:text-red-500 transition-all">
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