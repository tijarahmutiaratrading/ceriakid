import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, LogOut, ChevronDown, ChevronRight, Search } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { useSafeLocation } from '@/hooks/useSafeLocation';

// Accent color (Nike-style lime/yellow-green)
const ACCENT = '#D8FF3E';

// Main nav items shown as a horizontal scrollable pill (centered on desktop)
const MAIN_NAV = [
  { path: '/dashboard', label: 'Untuk Anda' },
  { path: '/games-hub', label: 'Games' },
  { path: '/parent-dashboard', label: 'Prestasi' },
  { path: '/friends', label: 'Kawan' },
  { path: '/challenges', label: 'Cabaran' },
  { path: '/drawing', label: 'Drawing' },
  { path: '/story-kid', label: 'Story' },
  { path: '/children-profiles', label: 'Profil' },
];

const LANDING_NAV = [
  { path: '/', label: 'Rumah' },
  { path: '#features', label: 'Ciri-ciri', external: true },
  { path: '#testimonials', label: 'Testimoni', external: true },
  { path: '#pricing', label: 'Harga', external: true },
  { path: '#faq', label: 'FAQ', external: true },
];

const PAGE_TITLES = {
  '/': 'CeriaKid',
  '/dashboard': 'Untuk Anda',
  '/settings': 'Tetapan',
  '/children-profiles': 'Profil Anak',
  '/games-hub': 'Games',
  '/parent-dashboard': 'Prestasi',
  '/friends': 'Kawan',
  '/challenges': 'Cabaran',
  '/drawing': 'Drawing',
  '/story-kid': 'Story Kid',
  '/admin-dashboard': 'Admin',
};

export default function AppHeader({ title = null }) {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedSubmenu, setExpandedSubmenu] = useState(null);
  const { isAuthenticated, user, logout } = useAuth() || {};
  const [headerAvatarUrl, setHeaderAvatarUrl] = useState(user?.avatarUrl || '');
  const location = useSafeLocation();
  const navigate = useNavigate();
  const isAdmin = user?.role === 'admin';
  const isLanding = location.pathname === '/' || location.pathname === '/landing';

  React.useEffect(() => {
    setHeaderAvatarUrl(user?.avatarUrl || '');
  }, [user?.avatarUrl]);

  React.useEffect(() => {
    const onAvatar = (e) => setHeaderAvatarUrl(e.detail?.avatarUrl || '');
    window.addEventListener('avatar-updated', onAvatar);
    return () => window.removeEventListener('avatar-updated', onAvatar);
  }, []);

  const isActive = (path) =>
    path === '/' ? location.pathname === '/' : location.pathname === path || location.pathname.startsWith(path);

  // Choose nav set based on auth state. Admin gets an extra "Admin" tab.
  const baseNav = isLanding && !isAuthenticated ? LANDING_NAV : MAIN_NAV;
  const navItems = isAdmin ? [...baseNav, { path: '/admin-dashboard', label: 'Admin' }] : baseNav;
  const displayTitle = title || PAGE_TITLES[location.pathname] || 'CeriaKid';

  // Drawer menu items (full set for hamburger)
  const dashboardItems = isAuthenticated ? [{ path: '/dashboard', label: 'Dashboard' }] : [];
  const groupedItems = isAuthenticated ? [
    { path: '/group-keluarga', label: 'Keluarga', submenu: [
      { path: '/children-profiles', label: 'Profil Anak' },
      { path: '/parent-dashboard', label: 'Prestasi Anak' },
      { path: '/settings', label: 'Tetapan' },
    ]},
    { path: '/group-aktiviti', label: 'Aktiviti', submenu: [
      { path: '/games-hub', label: 'Games Hub' },
      { path: '/drawing', label: 'Studio Lukisan' },
      { path: '/story-kid', label: 'Story Kid' },
    ]},
    { path: '/group-sosial', label: 'Sosial', submenu: [
      { path: '/friends', label: 'Kawan' },
      { path: '/challenges', label: 'Cabaran' },
    ]},
  ] : [];
  const adminItems = isAdmin ? [
    { path: '/admin-dashboard', label: 'Admin Dashboard', submenu: [
      { path: '/admin-dashboard?tab=analytics', label: 'Analytics' },
      { path: '/admin-dashboard?tab=customers', label: 'Pelanggan' },
      { path: '/admin-dashboard?tab=launch', label: 'Launch Control' },
      { path: '/admin-dashboard?tab=health', label: 'System Health' },
      { path: '/admin-dashboard?tab=settings', label: 'Settings' },
    ]},
  ] : [];

  return (
    <>
      {/* === TOP HEADER === Nike-style dark pill nav === */}
      <header className="fixed top-0 left-0 right-0 z-50 px-3 sm:px-6 pt-3 sm:pt-4 pointer-events-none">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-3 pointer-events-auto">
          {/* LEFT: Hamburger */}
          <motion.button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            whileTap={{ scale: 0.92 }}
            className="flex items-center justify-center w-11 h-11 rounded-full bg-black/70 backdrop-blur-xl ring-1 ring-white/10 text-white shadow-xl flex-shrink-0"
            aria-label="Menu"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </motion.button>

          {/* CENTER: Dark pill with scrollable nav */}
          <nav className="flex-1 min-w-0 flex justify-center">
            <div
              className="inline-flex items-center gap-0.5 sm:gap-1 rounded-full bg-black/70 backdrop-blur-xl ring-1 ring-white/10 shadow-xl px-1.5 py-1.5 max-w-full overflow-x-auto scrollbar-hide"
              style={{ scrollbarWidth: 'none' }}
            >
              {navItems.map((item) => {
                const active = !item.external && isActive(item.path);
                const className = `relative whitespace-nowrap px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-black tracking-tight transition-colors ${
                  active ? 'text-black' : 'text-white/85 hover:text-white'
                }`;
                const content = (
                  <>
                    {active && (
                      <motion.span
                        layoutId="activeNavPill"
                        className="absolute inset-0 rounded-full shadow-md"
                        style={{ backgroundColor: ACCENT }}
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                    <span className="relative z-10">{item.label}</span>
                  </>
                );
                return item.external ? (
                  <a key={item.path} href={item.path} className={className}>
                    {content}
                  </a>
                ) : (
                  <Link key={item.path} to={item.path} className={className}>
                    {content}
                  </Link>
                );
              })}

              {/* Search icon at end of pill (decorative — opens drawer) */}
              <button
                type="button"
                onClick={() => setIsOpen(true)}
                className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-full text-white/85 hover:text-white hover:bg-white/10 transition-colors flex-shrink-0"
                aria-label="Search"
              >
                <Search className="w-4 h-4" />
              </button>
            </div>
          </nav>

          {/* RIGHT: Avatar */}
          <Link
            to={isAuthenticated ? '/settings' : '/'}
            className="flex items-center justify-center flex-shrink-0"
            aria-label="Profile"
          >
            {isAuthenticated ? (
              headerAvatarUrl ? (
                <img
                  src={headerAvatarUrl}
                  alt="Avatar"
                  className="w-11 h-11 rounded-full object-cover ring-2 ring-white/30 shadow-xl"
                />
              ) : (
                <div className="w-11 h-11 rounded-full bg-black/70 backdrop-blur-xl ring-1 ring-white/10 flex items-center justify-center text-xl shadow-xl">
                  🐱
                </div>
              )
            ) : (
              <img
                src="https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/c0ad02d9e_ChatGPTImageMay12026at12_29_37PM.png"
                alt="CeriaKid"
                className="w-11 h-11 rounded-full object-cover ring-2 ring-white/30 shadow-xl"
              />
            )}
          </Link>
        </div>

        {/* Page title strip (small, under pill on mobile) */}
        {displayTitle && displayTitle !== 'CeriaKid' && (
          <div className="md:hidden max-w-7xl mx-auto mt-2 pointer-events-none">
            <p className="text-white/55 text-[10px] font-black uppercase tracking-[0.18em] leading-none text-center drop-shadow-lg">
              {displayTitle}
            </p>
          </div>
        )}
      </header>

      {/* === Hide scrollbar on the pill === */}
      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
      `}</style>

      {/* === Drawer overlay === */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      {/* === Drawer menu === */}
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            initial={{ x: -340, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -340, opacity: 0 }}
            transition={{ type: 'spring', damping: 24, stiffness: 280 }}
            className="fixed left-3 right-3 sm:right-auto top-20 bottom-3 z-50 sm:w-80 flex flex-col rounded-3xl overflow-hidden shadow-2xl ring-1 ring-white/10"
            style={{ background: 'linear-gradient(160deg, rgba(15,15,18,0.95), rgba(28,20,45,0.95))', backdropFilter: 'blur(24px)' }}
          >
            {/* Header */}
            {isAuthenticated && user ? (
              <div className="px-4 py-4 border-b border-white/10 flex items-center gap-3">
                {headerAvatarUrl ? (
                  <img src={headerAvatarUrl} alt="Avatar" className="w-12 h-12 rounded-full object-cover ring-2 ring-white/30 flex-shrink-0" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-white/15 ring-2 ring-white/25 flex items-center justify-center text-2xl flex-shrink-0">🐱</div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-white font-black text-sm truncate">{user.full_name || 'User'}</p>
                  <p className="text-white/60 text-xs truncate">{user.email}</p>
                </div>
                <button type="button" onClick={() => setIsOpen(false)} className="p-2 text-white/70 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
                <img src="https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/c0ad02d9e_ChatGPTImageMay12026at12_29_37PM.png" alt="CeriaKid" className="h-8 rounded-lg" />
                <button type="button" onClick={() => setIsOpen(false)} className="p-2 text-white/70 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Nav */}
            <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
              {(isLanding && !isAuthenticated ? LANDING_NAV : []).map((item) => (
                item.external ? (
                  <a key={item.path} href={item.path} onClick={() => setIsOpen(false)} className="block px-4 py-3 rounded-2xl font-bold text-sm text-white/90 hover:bg-white/10">
                    {item.label}
                  </a>
                ) : (
                  <Link key={item.path} to={item.path} onClick={() => setIsOpen(false)} className={`block px-4 py-3 rounded-2xl font-bold text-sm transition-all ${isActive(item.path) ? 'text-black' : 'text-white/90 hover:bg-white/10'}`} style={isActive(item.path) ? { backgroundColor: ACCENT } : undefined}>
                    {item.label}
                  </Link>
                )
              ))}

              {dashboardItems.map((item) => (
                <Link key={item.path} to={item.path} onClick={() => setIsOpen(false)}
                  className={`block px-4 py-3 rounded-2xl font-bold text-sm transition-all ${isActive(item.path) ? 'text-black' : 'text-white/90 hover:bg-white/10'}`}
                  style={isActive(item.path) ? { backgroundColor: ACCENT } : undefined}>
                  {item.label}
                </Link>
              ))}

              {[...groupedItems, ...adminItems].map((item) => {
                const hasSub = item.submenu?.length > 0;
                const expanded = expandedSubmenu === item.path;
                if (!hasSub) {
                  return (
                    <Link key={item.path} to={item.path} onClick={() => setIsOpen(false)}
                      className="block px-4 py-3 rounded-2xl font-bold text-sm text-white/90 hover:bg-white/10">
                      {item.label}
                    </Link>
                  );
                }
                return (
                  <div key={item.path}>
                    <button type="button" onClick={() => setExpandedSubmenu(expanded ? null : item.path)}
                      className="w-full flex items-center justify-between px-4 py-3 rounded-2xl font-bold text-sm text-white/90 hover:bg-white/10">
                      <span>{item.label}</span>
                      {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </button>
                    <AnimatePresence initial={false}>
                      {expanded && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                          <div className="ml-3 mt-1 mb-1 pl-3 border-l-2 border-white/15 space-y-1">
                            {item.submenu.map((sub) => (
                              <Link key={sub.path} to={sub.path} onClick={() => setIsOpen(false)}
                                className="block px-3 py-2.5 rounded-xl font-bold text-xs text-white/80 hover:bg-white/10 hover:text-white">
                                {sub.label}
                              </Link>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </nav>

            {/* Logout */}
            {isAuthenticated && (
              <div className="px-3 py-3 border-t border-white/10">
                <button type="button" onClick={() => { setIsOpen(false); logout?.(); }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-semibold text-sm text-white/85 hover:bg-white/10 hover:text-red-300">
                  <LogOut className="w-4 h-4" />
                  Log Keluar
                </button>
              </div>
            )}
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}