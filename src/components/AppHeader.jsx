import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { useSafeLocation } from '@/hooks/useSafeLocation';
import { useSelectedChild } from '@/lib/SelectedChildContext';
import { haptic } from '@/lib/haptics';
import { base44 } from '@/api/base44Client';
import { getActiveTier } from '@/lib/tierAccess';
import { getChildAvatar } from '@/lib/childAvatars';
import AppDrawer from '@/components/header/AppDrawer';
import ChildSwitcherModal from '@/components/header/ChildSwitcherModal';

const PAGE_TITLES = {
  '/': 'CeriaKid',
  '/dashboard': 'Dashboard',
  '/settings': 'Tetapan Akaun',
  '/children-profiles': 'Profil Anak',
  '/games-hub': 'Game Hub',
  '/games-subjek': 'Belajar Ikut Subjek',
  '/parent-dashboard': 'Prestasi Anak',
  '/friends': 'Kawan',
  '/challenges': 'Cabaran',
  '/drawing': 'Studio Lukisan',
  '/story-kid': 'Story Kid',
  '/ai-assistant': 'Cikgu Firdaus',
  '/quiz-ai': 'Cikgu Rosie',
  '/story-generator': 'Cikgu Mira',
  '/bbm-generator': 'Cikgu Daniel',
  '/buy-credits': 'Beli Kredit',
  '/affiliate': 'Affiliate',
  '/admin-dashboard': 'Admin Dashboard',
};

export default function AppHeader({ showBack = null, backTo = '/', title = null, theme = 'auto' }) {
  const [isOpen, setIsOpen] = useState(false);
  const [navVisible, setNavVisible] = useState(true);
  const [headerSwitcherOpen, setHeaderSwitcherOpen] = useState(false);
  const [userTier, setUserTier] = useState('free');

  const { isAuthenticated, user, logout } = useAuth() || {};
  const [headerAvatarUrl, setHeaderAvatarUrl] = useState(user?.avatarUrl || '');
  const { selectedChild, childrenList, setSelectedChild } = useSelectedChild() || {};
  const location = useSafeLocation();

  const isAdmin = user?.role === 'admin';
  const isLanding = location.pathname === '/' || location.pathname === '/landing';
  const isPlayingGame = location.pathname.startsWith('/play/');
  const lastScrollY = useRef(0);

  const resolvedTheme = theme === 'auto' ? (isPlayingGame ? 'dark' : 'light') : theme;
  const isDarkPill = resolvedTheme === 'dark';
  const _shouldShowBack = showBack !== null ? showBack : !isLanding;

  // Avatar sync
  useEffect(() => { setHeaderAvatarUrl(user?.avatarUrl || ''); }, [user?.avatarUrl]);
  useEffect(() => {
    const handler = (e) => setHeaderAvatarUrl(e.detail?.avatarUrl || '');
    window.addEventListener('avatar-updated', handler);
    return () => window.removeEventListener('avatar-updated', handler);
  }, []);

  // Load tier ONCE on mount (untuk show crown badge dalam drawer)
  useEffect(() => {
    if (!user?.email) return;
    base44.entities.UserSubscription
      .filter({ email: user.email })
      .then((subs) => setUserTier(getActiveTier(subs?.[0])))
      .catch(() => {});
  }, [user?.email]);

  // Scroll-aware visibility
  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY;
      if (y < 50) setNavVisible(true);
      else if (y > lastScrollY.current) setNavVisible(false);
      else setNavVisible(true);
      lastScrollY.current = y;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleDrawer = () => { haptic('light'); setIsOpen((v) => !v); };

  const pageTitle = title || PAGE_TITLES[location.pathname] || 'CeriaKid';

  return (
    <>
      {/* Top Header */}
      <nav
        className="sm:hidden fixed top-0 left-0 right-0 z-40 px-3 sm:px-6 py-3 sm:py-4 transition-transform duration-300"
        style={{ transform: navVisible ? 'translateY(0)' : 'translateY(-100%)', paddingTop: 'max(0.75rem, env(safe-area-inset-top))' }}
      >
        <div
          className={`max-w-[52rem] mx-auto w-full grid grid-cols-[auto_1fr_auto] items-center gap-2 sm:gap-4 px-2.5 sm:px-4 py-2 rounded-[1.75rem] ring-1 ${
            isDarkPill ? 'ring-white/25 shadow-2xl shadow-slate-950/25' : 'pro-glass ring-white/20'
          }`}
          style={
            isDarkPill
              ? { background: 'linear-gradient(135deg, rgba(15,23,42,0.9), rgba(88,28,135,0.82))', backdropFilter: 'blur(22px)' }
              : undefined
          }
        >
          <button
            type="button"
            onClick={toggleDrawer}
            className="px-3.5 sm:px-5 py-2.5 bg-white text-game-purple rounded-full font-black text-xs sm:text-sm shadow-lg active:bg-white/95 transition-colors"
          >
            {isOpen ? 'Tutup' : 'Menu'}
          </button>

          <div className="min-w-0 text-center px-1">
            <p className={`${isDarkPill ? 'text-white/55' : 'text-slate-500'} text-[10px] sm:text-[11px] font-black uppercase tracking-[0.18em] leading-none`}>
              CeriaKid
            </p>
            <p className={`${isDarkPill ? 'text-white' : 'text-slate-900'} font-black text-sm sm:text-base truncate leading-tight mt-1`}>
              {pageTitle}
            </p>
          </div>

          <div className="flex items-center gap-2 justify-end">
            <Link to={isAuthenticated ? '/settings' : '/'} className="flex items-center justify-end" title={isAuthenticated ? 'Tetapan Profil' : 'CeriaKid'}>
              {isAuthenticated ? (
                headerAvatarUrl ? (
                  <img
                    src={headerAvatarUrl}
                    alt="Avatar"
                    className={`w-10 h-10 rounded-full object-cover cursor-pointer shadow-lg ring-2 ${isDarkPill ? 'ring-white/60' : 'ring-purple-200'}`}
                  />
                ) : (
                  <div className={`w-10 h-10 rounded-full ${isDarkPill ? 'bg-white/25 border-white/50' : 'bg-purple-100 border-purple-200'} border-2 flex items-center justify-center text-xl cursor-pointer shadow-lg`}>
                    🐱
                  </div>
                )
              ) : (
                <img
                  src="https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/443c6c7e7_ChatGPTImageJun32026at06_14_57PM.png"
                  alt="CeriaKid"
                  className="h-9 sm:h-10 rounded-2xl cursor-pointer shadow-lg ring-1 ring-white/40"
                />
              )}
            </Link>
          </div>
        </div>
      </nav>

      {/* Drawer */}
      <AppDrawer
        open={isOpen}
        onClose={() => setIsOpen(false)}
        user={user}
        avatarUrl={headerAvatarUrl}
        tier={userTier}
        selectedChild={selectedChild}
        childrenList={childrenList || []}
        onSwitchChild={setSelectedChild}
        isAuthenticated={isAuthenticated}
        isAdmin={isAdmin}
        isLanding={isLanding}
        activePath={location.pathname}
        onLogout={logout}
      />

      {/* Top-header child switcher (separate from drawer) */}
      <ChildSwitcherModal
        open={headerSwitcherOpen}
        children={childrenList || []}
        selectedChild={selectedChild}
        onSelect={setSelectedChild}
        onClose={() => setHeaderSwitcherOpen(false)}
        onAddChild={() => setHeaderSwitcherOpen(false)}
      />
    </>
  );
}