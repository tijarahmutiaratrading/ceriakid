import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ArrowLeft, LogOut, ChevronDown, ChevronRight } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { useAgeGroup } from '@/lib/AgeGroupContext';
import { useSafeLocation } from '@/hooks/useSafeLocation';
import LanguageSwitcher from '@/components/LanguageSwitcher';


export default function AppHeader({ showBack = null, backTo = '/', title = null, theme = 'auto' }) {
  const [isOpen, setIsOpen] = useState(false);
  const [navVisible, setNavVisible] = useState(true);
  const [expandedSubmenu, setExpandedSubmenu] = useState(null);
  const { isAuthenticated, user, logout } = useAuth() || {};
  const [headerAvatarUrl, setHeaderAvatarUrl] = useState(user?.avatarUrl || '');
  const { ageGroup = 'prasekolah' } = useAgeGroup() || {};
  const location = useSafeLocation();
  const navigate = useNavigate();
  const isAdmin = user?.role === 'admin';
  const isLanding = location.pathname === '/' || location.pathname === '/landing';
  const isPlayingGame = location.pathname.startsWith('/play/');
  const lastScrollY = React.useRef(0);

  // Dynamic theme: 'dark' = pill gelap utk background terang | 'light' = pill cerah utk background gelap
  // 'auto' = ikut isPlayingGame (default lama)
  const resolvedTheme = theme === 'auto' ? (isPlayingGame ? 'dark' : 'light') : theme;
  const isDarkPill = resolvedTheme === 'dark';
  
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





  // Determine menu based on user role and location
  let topItems = [];
  let adminItems = [];
  let dashboardItems = [];
  let groupedItems = [];

  if (isLanding && !isAuthenticated) {
    topItems = [
      { path: '/', label: 'Rumah' },
      { path: '#features', label: 'Ciri-ciri', external: true },
      { path: '#testimonials', label: 'Testimoni', external: true },
      { path: '#pricing', label: 'Harga', external: true },
      { path: '#faq', label: 'Soalan Lazim', external: true },
    ];
  } else {
    topItems = [{ path: '/', label: 'Halaman Utama' }];

    if (isAuthenticated) {
      dashboardItems = [
        { path: '/dashboard', label: 'Dashboard Pengguna' },
      ];

      groupedItems = [
        {
          path: '/group-keluarga',
          label: 'Keluarga',
          submenu: [
            { path: '/children-profiles', label: 'Profil Anak' },
            { path: '/parent-dashboard', label: 'Prestasi Anak' },
            { path: '/settings', label: 'Tetapan' },
          ],
        },
        {
          path: '/group-aktiviti',
          label: 'Aktiviti',
          submenu: [
            { path: '/drawing', label: 'Studio Lukisan' },
            { path: '/story-kid', label: 'Story Kid' },
          ],
        },
        {
          path: '/group-cikgu-ai',
          label: 'Cikgu AI',
          submenu: [
            { path: '/ai-assistant', label: 'Cikgu Firdaus — Tutor' },
            { path: '/quiz-ai', label: 'Cikgu Rosie — Kuiz' },
            { path: '/story-generator', label: 'Cikgu Mira — Cerita' },
            { path: '/bbm-generator', label: 'Cikgu Daniel — BBM' },
          ],
        },
        {
          path: '/group-sosial',
          label: 'Sosial',
          submenu: [
            { path: '/friends', label: 'Kawan' },
            { path: '/challenges', label: 'Cabaran' },
          ],
        },
        {
          path: '/group-sokongan',
          label: 'Sokongan',
          submenu: [
            { path: '/contact', label: 'Hubungi Kami' },
          ],
        },
      ];
    }

    if (isAdmin) {
      adminItems = [
        {
          path: '/admin-dashboard',
          label: 'Admin Dashboard',
          submenu: [
            { path: '/admin-dashboard?tab=analytics', label: 'Analytics' },
            { path: '/admin-dashboard?tab=gamemanager', label: 'Game Manager' },
            { path: '/admin-dashboard?tab=health', label: 'System Health' },
            { path: '/admin-dashboard?tab=settings', label: 'Settings' },
          ],
        },
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
       <nav className="lg:hidden fixed top-0 left-0 right-0 z-40 px-3 sm:px-6 py-3 sm:py-4 transition-transform duration-300" style={{ transform: navVisible ? 'translateY(0)' : 'translateY(-100%)' }}>
         <div
           className={`max-w-[52rem] mx-auto w-full grid grid-cols-[auto_1fr_auto] items-center gap-2 sm:gap-4 px-2.5 sm:px-4 py-2 rounded-[1.75rem] ring-1 ${isDarkPill ? 'ring-white/25 shadow-2xl shadow-slate-950/25' : 'pro-glass ring-white/20'}`}
           style={isDarkPill ? { background: 'linear-gradient(135deg, rgba(15,23,42,0.9), rgba(88,28,135,0.82))', backdropFilter: 'blur(22px)' } : undefined}
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
             <p className={`${isDarkPill ? 'text-white/55' : 'text-slate-500'} text-[10px] sm:text-[11px] font-black uppercase tracking-[0.18em] leading-none`}>CeriaKid</p>
             <p className={`${isDarkPill ? 'text-white' : 'text-slate-900'} font-black text-sm sm:text-base truncate leading-tight mt-1`}>{displayTitle}</p>
           </div>

           <div className="flex items-center gap-2 justify-end">
             <Link to={isAuthenticated ? "/settings" : "/"} className="flex items-center justify-end" title={isAuthenticated ? 'Tetapan Profil' : 'CeriaKid'}>
               {isAuthenticated ? (
                 headerAvatarUrl ? (
                   <img src={headerAvatarUrl} alt="Avatar" className={`w-10 h-10 rounded-full object-cover cursor-pointer shadow-lg ring-2 ${isDarkPill ? 'ring-white/60' : 'ring-purple-200'}`} />
                 ) : (
                   <div className={`w-10 h-10 rounded-full ${isDarkPill ? 'bg-white/25 border-white/50' : 'bg-purple-100 border-purple-200'} border-2 flex items-center justify-center text-xl cursor-pointer shadow-lg`}>🐱</div>
                 )
               ) : (
                 <img src="https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/c0ad02d9e_ChatGPTImageMay12026at12_29_37PM.png" alt="CeriaKid" className="h-9 sm:h-10 rounded-2xl cursor-pointer shadow-lg ring-1 ring-white/40" />
               )}
             </Link>
           </div>
         </div>
       </nav>



      {/* Overlay — mobile only */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className={`lg:hidden fixed inset-0 z-40 ${isPlayingGame ? 'bg-slate-950/35 backdrop-blur-[1px]' : 'bg-black/10'}`}
          />
        )}
      </AnimatePresence>

      {/* Menu Drawer — mobile only */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: -320, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -320, opacity: 0 }}
            transition={{ type: 'spring', damping: 22, stiffness: 280 }}
            className="lg:hidden fixed left-3 right-3 top-20 bottom-3 z-50 flex flex-col rounded-3xl overflow-hidden shadow-2xl border border-white/20"
            style={{ background: 'linear-gradient(160deg, rgba(71,85,105,0.78), rgba(51,65,85,0.72), rgba(71,85,105,0.78))', backdropFilter: 'blur(28px) saturate(160%)', WebkitBackdropFilter: 'blur(28px) saturate(160%)' }}
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

              {/* Grouped features (Keluarga / Aktiviti / Sosial) + Admin section */}
              {[...groupedItems, ...adminItems].length > 0 && (
                <>
                  {[...groupedItems, ...adminItems].map((item) => {
                    const hasSubmenu = item.submenu && item.submenu.length > 0;
                    const isExpanded = expandedSubmenu === item.path;
                    const itemActive = isActive(item.path);

                    if (!hasSubmenu) {
                      return (
                        <Link key={item.path} to={item.path} onClick={() => setIsOpen(false)}>
                          <motion.div whileTap={{ scale: 0.97 }}
                            className={`flex items-center px-4 py-3 rounded-2xl font-bold text-sm transition-all ${
                              itemActive ? 'bg-white text-game-purple shadow-sm' : 'text-white hover:bg-white/20'
                            }`}>
                            <span>{item.label}</span>
                          </motion.div>
                        </Link>
                      );
                    }

                    return (
                      <div key={item.path}>
                        <motion.button
                          type="button"
                          whileTap={{ scale: 0.97 }}
                          onClick={() => setExpandedSubmenu(isExpanded ? null : item.path)}
                          className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl font-bold text-sm transition-all ${
                            itemActive ? 'bg-white text-game-purple shadow-sm' : 'text-white hover:bg-white/20'
                          }`}
                        >
                          <span>{item.label}</span>
                          {isExpanded ? <ChevronDown className="w-4 h-4 flex-shrink-0" /> : <ChevronRight className="w-4 h-4 flex-shrink-0" />}
                        </motion.button>

                        <AnimatePresence initial={false}>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <div className="ml-3 mt-1 mb-1 pl-3 border-l-2 border-white/20 space-y-1">
                                {item.submenu.map((sub) => (
                                  <Link key={sub.path} to={sub.path} onClick={() => setIsOpen(false)}>
                                    <motion.div whileTap={{ scale: 0.97 }}
                                      className="flex items-center px-3 py-2.5 rounded-xl font-bold text-xs text-white/85 hover:bg-white/15 hover:text-white transition-all">
                                      <span>{sub.label}</span>
                                    </motion.div>
                                  </Link>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
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