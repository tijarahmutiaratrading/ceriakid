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
  const [headerAvatarUrl, setHeaderAvatarUrl] = useState(user?.avatarUrl || '');
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
    setHeaderAvatarUrl(user?.avatarUrl || '');
  }, [user?.avatarUrl]);

  React.useEffect(() => {
    const handleAvatarUpdated = (event) => setHeaderAvatarUrl(event.detail?.avatarUrl || '');
    window.addEventListener('avatar-updated', handleAvatarUpdated);
    return () => window.removeEventListener('avatar-updated', handleAvatarUpdated);
  }, []);

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
    { path: '/drawing', emoji: '🎨', label: 'Studio Lukisan' },
    { path: '/story-kid', emoji: '📖', label: 'Story Kid' },
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

  const pageTitles = {
    '/': 'CeriaKid',
    '/dashboard': 'Dashboard',
    '/settings': 'Tetapan Akaun',
    '/children-profiles': 'Profil Anak',
    '/games-hub': 'Games Hub',
    '/parent-dashboard': 'Prestasi Anak',
    '/friends': 'Kawan',
    '/challenges': 'Cabaran',
    '/drawing': 'Studio Lukisan',
    '/admin-dashboard': 'Admin Dashboard',
  };

  const displayTitle = title || pageTitles[location.pathname] || (location.pathname.startsWith('/games/') ? 'Permainan' : 'CeriaKid');

  return (
    <>
      {/* Top Header */}
       <nav className="fixed top-0 left-0 right-0 z-50 px-3 sm:px-6 py-3 sm:py-4 transition-transform duration-300" style={{ transform: navVisible ? 'translateY(0)' : 'translateY(-100%)' }}>
         <div
           className={`max-w-3xl mx-auto w-full grid grid-cols-[auto_1fr_auto] items-center gap-2 sm:gap-4 px-2.5 sm:px-4 py-2 rounded-[1.75rem] ring-1 ${isPlayingGame ? 'ring-white/25 shadow-2xl shadow-slate-950/25' : 'pro-glass ring-white/20'}`}
           style={isPlayingGame ? { background: 'linear-gradient(135deg, rgba(15,23,42,0.9), rgba(88,28,135,0.82))', backdropFilter: 'blur(22px)' } : undefined}
         >
           <motion.button
             type="button"
             onClick={() => setIsOpen(!isOpen)}
             whileTap={{ scale: 0.95 }}
             className="px-3.5 sm:px-5 py-2.5 bg-white text-game-purple rounded-full font-black text-xs sm:text-sm shadow-lg hover:bg-white/95 transition-colors"
           >
             {isOpen ? 'Tutup' : 'Menu'}
           </motion.button>

           <div className="min-w-0 text-center px-1">
             <p className="text-white/55 text-[10px] sm:text-[11px] font-black uppercase tracking-[0.18em] leading-none">CeriaKid</p>
             <p className="text-white font-black text-sm sm:text-base truncate leading-tight mt-1">{displayTitle}</p>
           </div>

           <div className="flex items-center gap-2 justify-end">
             <Link to={isAuthenticated ? "/settings" : "/"} className="flex items-center justify-end" title={isAuthenticated ? 'Tetapan Profil' : 'CeriaKid'}>
               {isAuthenticated ? (
                 headerAvatarUrl ? (
                   <img src={headerAvatarUrl} alt="Avatar" className="w-10 h-10 rounded-full object-cover cursor-pointer shadow-lg ring-2 ring-white/60" />
                 ) : (
                   <div className="w-10 h-10 rounded-full bg-white/25 border-2 border-white/50 flex items-center justify-center text-xl cursor-pointer shadow-lg">🐱</div>
                 )
               ) : (
                 <img src="https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/c0ad02d9e_ChatGPTImageMay12026at12_29_37PM.png" alt="CeriaKid" className="h-9 sm:h-10 rounded-2xl cursor-pointer shadow-lg ring-1 ring-white/40" />
               )}
             </Link>
           </div>
         </div>
       </nav>



      {/* Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className={`fixed inset-0 z-40 ${isPlayingGame ? 'bg-slate-950/35 backdrop-blur-[1px]' : 'bg-black/10'}`}
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
            className={`fixed left-3 right-3 sm:right-auto top-20 bottom-3 z-50 sm:w-80 flex flex-col rounded-3xl overflow-hidden shadow-2xl ${isPlayingGame ? 'border border-white/20' : 'pro-glass'}`}
            style={isPlayingGame ? { background: 'linear-gradient(160deg, rgba(15,23,42,0.93), rgba(88,28,135,0.86), rgba(190,24,93,0.72))', backdropFilter: 'blur(24px)' } : undefined}
          >
            {/* Header with User Profile */}
            {isAuthenticated && user ? (
              <div className="px-4 py-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  {headerAvatarUrl ? (
                    <img src={headerAvatarUrl} alt="Avatar" className="w-12 h-12 rounded-full object-cover border-2 border-white/60 flex-shrink-0" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-white/40 border-2 border-white/60 flex items-center justify-center text-2xl flex-shrink-0">🐱</div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-black text-sm truncate">{user.full_name || 'User'}</p>
                    <p className="text-white/70 text-xs truncate">{user.email}</p>
                  </div>
                  <button type="button" onClick={() => setIsOpen(false)} className="p-1.5 text-white/70 hover:text-white flex-shrink-0">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between px-5 py-3 border-b border-white/10">
                <img src="https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/c0ad02d9e_ChatGPTImageMay12026at12_29_37PM.png" alt="CeriaKid" className="h-8 rounded-lg" />
                <button type="button" onClick={() => setIsOpen(false)} className="p-1.5 text-white/70 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}

            {/* Scrollable nav */}
            <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-1">

              {/* Top / Landing items */}
              {topItems.map((item) =>
                item.external ? (
                  <a key={item.path} href={item.path} onClick={() => setIsOpen(false)}
                    className="flex items-center px-4 py-3 rounded-2xl font-bold text-white hover:bg-white/20 transition-all text-sm">
                    <span>{item.label}</span>
                  </a>
                ) : (
                  <Link key={item.path} to={item.path} onClick={() => setIsOpen(false)}>
                    <motion.div whileTap={{ scale: 0.97 }}
                      className={`flex items-center px-4 py-3 rounded-2xl font-bold text-sm transition-all ${
                        isActive(item.path) ? 'bg-white text-game-purple shadow-lg' : 'text-white/90 hover:bg-white/20 hover:text-white'
                      }`}>
                      <span>{item.label}</span>
                    </motion.div>
                  </Link>
                )
              )}

              {/* Dashboard section */}
              {dashboardItems.length > 0 && (
                <>
                  <div className="pt-2 pb-1.5">
                    <p className="text-xs font-black text-white/60 uppercase tracking-wider px-4">📱 Akaun</p>
                  </div>
                  {dashboardItems.map((item) => (
                    <Link key={item.path} to={item.path} onClick={() => setIsOpen(false)}>
                      <motion.div whileTap={{ scale: 0.97 }}
                        className={`flex items-center px-4 py-3 rounded-2xl font-bold text-sm transition-all ${
                          isActive(item.path) ? 'bg-white text-game-purple shadow-sm' : 'text-white hover:bg-white/20'
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
                  <div className="pt-2 pb-1.5">
                    <p className="text-xs font-black text-white/60 uppercase tracking-wider px-4">🎮 Fitur</p>
                  </div>
                  {otherItems.map((item) => (
                    <Link key={item.path} to={item.path} onClick={() => setIsOpen(false)}>
                      <motion.div whileTap={{ scale: 0.97 }}
                        className={`flex items-center px-4 py-3 rounded-2xl font-bold text-sm transition-all ${
                          isActive(item.path) ? 'bg-white text-game-purple shadow-sm' : 'text-white hover:bg-white/20'
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
                  <div className="pt-2 pb-1.5">
                    <p className="text-xs font-black text-white/60 uppercase tracking-wider px-4">🎛️ Admin</p>
                  </div>
                  {adminItems.map((item) => (
                    <Link key={item.path} to={item.path} onClick={() => setIsOpen(false)}>
                      <motion.div whileTap={{ scale: 0.97 }}
                        className={`flex items-center px-4 py-3 rounded-2xl font-bold text-sm transition-all ${
                          isActive(item.path) ? 'bg-white text-game-purple shadow-sm' : 'text-white hover:bg-white/20'
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
              <div className="px-3 py-3 border-t border-white/10">
                <motion.button type="button" whileTap={{ scale: 0.97 }}
                  onClick={() => { setIsOpen(false); logout?.(); }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-semibold text-sm text-white hover:bg-white/20 hover:text-red-300 transition-all">
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