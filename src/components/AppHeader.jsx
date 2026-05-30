import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, ChevronDown, ChevronRight, Sparkles, Pin, ChevronsUpDown } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { useAgeGroup } from '@/lib/AgeGroupContext';
import { useSafeLocation } from '@/hooks/useSafeLocation';
import { useSelectedChild } from '@/lib/SelectedChildContext';
import { haptic } from '@/lib/haptics';
import { base44 } from '@/api/base44Client';
import { getActiveTier } from '@/lib/tierAccess';
import { getPinned, togglePinned } from '@/lib/menuPrefs';
import { getChildAvatar } from '@/lib/childAvatars';
import DrawerProfileHeader from '@/components/header/DrawerProfileHeader';
import DrawerMenuItem from '@/components/header/DrawerMenuItem';
import ChildSwitcherModal from '@/components/header/ChildSwitcherModal';

export default function AppHeader({ showBack = null, backTo = '/', title = null, theme = 'auto' }) {
  const [isOpen, setIsOpen] = useState(false);
  const [navVisible, setNavVisible] = useState(true);
  const [expandedSubmenu, setExpandedSubmenu] = useState(null);
  const [pinnedItems, setPinnedItems] = useState([]);
  const [credits, setCredits] = useState(null);
  const [streak, setStreak] = useState(0);
  const [pendingNotifications, setPendingNotifications] = useState({ challenges: 0, sync: 0 });
  const [userTier, setUserTier] = useState('free');

  const [headerSwitcherOpen, setHeaderSwitcherOpen] = useState(false);

  const { isAuthenticated, user, logout } = useAuth() || {};
  const [headerAvatarUrl, setHeaderAvatarUrl] = useState(user?.avatarUrl || '');
  const { ageGroup = 'prasekolah' } = useAgeGroup() || {};
  const { selectedChild, childrenList, setSelectedChild } = useSelectedChild() || {};
  const location = useSafeLocation();
  const navigate = useNavigate();

  const isAdmin = user?.role === 'admin';
  const isLanding = location.pathname === '/' || location.pathname === '/landing';
  const isPlayingGame = location.pathname.startsWith('/play/');
  const lastScrollY = useRef(0);
  const touchStartX = useRef(null);

  const resolvedTheme = theme === 'auto' ? (isPlayingGame ? 'dark' : 'light') : theme;
  const isDarkPill = resolvedTheme === 'dark';
  const shouldShowBack = showBack !== null ? showBack : !isLanding;

  // Avatar sync
  useEffect(() => { setHeaderAvatarUrl(user?.avatarUrl || ''); }, [user?.avatarUrl]);
  useEffect(() => {
    const handleAvatarUpdated = (event) => setHeaderAvatarUrl(event.detail?.avatarUrl || '');
    window.addEventListener('avatar-updated', handleAvatarUpdated);
    return () => window.removeEventListener('avatar-updated', handleAvatarUpdated);
  }, []);

  // Scroll-aware visibility
  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      if (currentY < 50) setNavVisible(true);
      else if (currentY > lastScrollY.current) setNavVisible(false);
      else setNavVisible(true);
      lastScrollY.current = currentY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Load pinned + user stats bila drawer dibuka
  useEffect(() => {
    if (!isOpen || !user?.email) return;
    setPinnedItems(getPinned(user.email));

    // Fetch credits, streak, tier
    (async () => {
      try {
        const [creditData, subs, leaderboard] = await Promise.all([
          base44.entities.UserCredit.filter({ userEmail: user.email }).catch(() => []),
          base44.entities.UserSubscription.filter({ email: user.email }).catch(() => []),
          base44.entities.Leaderboard.filter({ userEmail: user.email }).catch(() => []),
        ]);
        setCredits(creditData?.[0]?.balance ?? 0);
        setUserTier(getActiveTier(subs?.[0]));
        const maxStreak = Math.max(0, ...leaderboard.map(l => l.currentStreak || 0));
        setStreak(maxStreak);
      } catch {}
    })();

    // Notifications (challenges pending + offline sync queue)
    try {
      const syncQueue = JSON.parse(localStorage.getItem('game_sync_queue') || '[]');
      setPendingNotifications(prev => ({ ...prev, sync: syncQueue.length }));
    } catch {}

    if (user?.email) {
      base44.entities.FriendChallenge.filter({ opponent: user.email, status: 'pending' })
        .then(c => setPendingNotifications(prev => ({ ...prev, challenges: c?.length || 0 })))
        .catch(() => {});
    }
  }, [isOpen, user?.email]);

  // ESC key to close
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => { if (e.key === 'Escape') { haptic('light'); setIsOpen(false); } };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen]);

  // Body scroll lock bila drawer terbuka
  useEffect(() => {
    if (isOpen) {
      const original = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = original; };
    }
  }, [isOpen]);

  // Swipe-to-close (swipe left)
  const handleTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; };
  const handleTouchEnd = (e) => {
    if (touchStartX.current == null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    if (deltaX < -60) { haptic('light'); setIsOpen(false); }
    touchStartX.current = null;
  };

  const handleToggleDrawer = () => { haptic('light'); setIsOpen(!isOpen); };

  // Menu items
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
        { path: '/settings', label: 'Tetapan Akaun' },
        { path: '/contact', label: 'Hubungi Kami' },
      ];
      groupedItems = [
        {
          path: '/group-aktiviti', label: 'Aktiviti',
          submenu: [
            { path: '/games-subjek', label: 'Belajar Ikut Subjek' },
            { path: '/games-hub', label: 'Game Hub' },
            { path: '/drawing', label: 'Studio Lukisan' },
            { path: '/story-kid', label: 'Story Kid' },
            { path: '/friends', label: 'Kawan' },
            { path: '/challenges', label: 'Cabaran' },
          ],
        },
        {
          path: '/group-keluarga', label: 'Keluarga',
          submenu: [
            { path: '/children-profiles', label: 'Profil Anak' },
            { path: '/parent-dashboard', label: 'Prestasi Anak' },
          ],
        },
        {
          path: '/group-cikgu-ai', label: 'Cikgu AI',
          submenu: [
            { path: '/ai-assistant', label: 'Cikgu Firdaus — Tutor' },
            { path: '/quiz-ai', label: 'Cikgu Rosie — Kuiz' },
            { path: '/story-generator', label: 'Cikgu Mira — Cerita' },
            { path: '/bbm-generator', label: 'Cikgu Daniel — BBM' },
          ],
        },
      ];
    }
    if (isAdmin) {
      adminItems = [{
        path: '/admin-dashboard', label: 'Admin Dashboard',
        submenu: [
          { path: '/admin-dashboard?tab=analytics', label: 'Analytics' },
          { path: '/admin-dashboard?tab=gamemanager', label: 'Game Manager' },
          { path: '/admin-dashboard?tab=health', label: 'System Health' },
          { path: '/admin-dashboard?tab=settings', label: 'Settings' },
        ],
      }];
    }
  }

  const isActive = (path) => path === '/' ? location.pathname === '/' : location.pathname === path || location.pathname.startsWith(path);

  // Notification counts per menu item
  const getNotificationCount = (path) => {
    if (path === '/challenges') return pendingNotifications.challenges;
    if (path === '/settings') return pendingNotifications.sync;
    return 0;
  };

  const handlePinToggle = (path, label) => {
    if (!user?.email) return;
    const updated = togglePinned(user.email, path, label);
    setPinnedItems(updated);
  };

  const closeDrawer = () => setIsOpen(false);

  return (
    <>
      {/* Top Header */}
      <nav className="sm:hidden fixed top-0 left-0 right-0 z-40 px-3 sm:px-6 py-3 sm:py-4 transition-transform duration-300" style={{ transform: navVisible ? 'translateY(0)' : 'translateY(-100%)', paddingTop: 'max(0.75rem, env(safe-area-inset-top))' }}>
        <div
          className={`max-w-[52rem] mx-auto w-full grid grid-cols-[auto_1fr_auto] items-center gap-2 sm:gap-4 px-2.5 sm:px-4 py-2 rounded-[1.75rem] ring-1 ${isDarkPill ? 'ring-white/25 shadow-2xl shadow-slate-950/25' : 'pro-glass ring-white/20'}`}
          style={isDarkPill ? { background: 'linear-gradient(135deg, rgba(15,23,42,0.9), rgba(88,28,135,0.82))', backdropFilter: 'blur(22px)' } : undefined}
        >
          <motion.button
            type="button"
            onClick={handleToggleDrawer}
            whileTap={{ scale: 0.95 }}
            className="px-3.5 sm:px-5 py-2.5 bg-white text-game-purple rounded-full font-black text-xs sm:text-sm shadow-lg hover:bg-white/95 transition-colors relative"
          >
            {isOpen ? 'Tutup' : 'Menu'}
            {!isOpen && (pendingNotifications.challenges + pendingNotifications.sync) > 0 && (
              <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-rose-500 border-2 border-white animate-pulse" />
            )}
          </motion.button>

          <div className="min-w-0 text-center px-1">
            <p className={`${isDarkPill ? 'text-white/55' : 'text-slate-500'} text-[10px] sm:text-[11px] font-black uppercase tracking-[0.18em] leading-none`}>CeriaKid</p>
            <p className={`${isDarkPill ? 'text-white' : 'text-slate-900'} font-black text-sm sm:text-base truncate leading-tight mt-1`}>{title || pageTitles[location.pathname] || 'CeriaKid'}</p>
          </div>

          <div className="flex items-center gap-2 justify-end">
            {/* Child switcher pill — match drawer style */}
            {isAuthenticated && selectedChild && (childrenList?.length || 0) > 1 && (
              <motion.button
                type="button"
                whileTap={{ scale: 0.96 }}
                onClick={() => { haptic('light'); setHeaderSwitcherOpen(true); }}
                aria-label={`Anak aktif: ${selectedChild.name}. Tap untuk tukar.`}
                className="flex items-center gap-1.5 pl-1 pr-1.5 py-1 rounded-full bg-white/95 shadow-md hover:bg-white transition-all flex-shrink-0"
              >
                <img
                  src={getChildAvatar(selectedChild)}
                  alt={selectedChild.name}
                  className="w-7 h-7 rounded-full object-cover ring-2 ring-pink-200 bg-white flex-shrink-0"
                />
                <div className="text-left leading-none">
                  <p className="text-pink-600 text-[8px] font-black uppercase tracking-wider">Anak Aktif</p>
                  <p className="text-slate-800 text-[11px] font-black truncate max-w-[70px] mt-0.5">{selectedChild.name}</p>
                </div>
                <div className="flex items-center gap-0.5 px-1.5 py-1 rounded-md bg-pink-100 flex-shrink-0">
                  <span className="text-pink-600 text-[8px] font-black uppercase tracking-wider">Tukar</span>
                  <ChevronsUpDown className="w-2.5 h-2.5 text-pink-600" strokeWidth={3} />
                </div>
              </motion.button>
            )}

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

      {/* Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeDrawer}
            className="sm:hidden fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      {/* Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            role="dialog"
            aria-modal="true"
            aria-label="Menu navigasi"
            className="sm:hidden fixed left-3 right-3 top-4 bottom-4 z-50 flex flex-col rounded-[2rem] overflow-hidden"
            style={{
              background: 'rgba(255,255,255,0.18)',
              backdropFilter: 'blur(32px) saturate(180%)',
              WebkitBackdropFilter: 'blur(32px) saturate(180%)',
              boxShadow: '0 25px 60px -10px rgba(0,0,0,0.35), inset 0 0 0 1px rgba(255,255,255,0.35)',
            }}
          >
            {/* Header: profile + stats + active child */}
            {isAuthenticated && user ? (
              <DrawerProfileHeader
                user={user}
                avatarUrl={headerAvatarUrl}
                selectedChild={selectedChild}
                childCount={childrenList?.length || 0}
                credits={credits}
                streak={streak}
                tier={userTier}
                onClose={closeDrawer}
              />
            ) : (
              <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-br from-pink-400 to-purple-500">
                <img src="https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/c0ad02d9e_ChatGPTImageMay12026at12_29_37PM.png" alt="CeriaKid" className="h-8 rounded-lg" />
                <button type="button" onClick={closeDrawer} className="p-2 rounded-xl bg-white/20 text-white">✕</button>
              </div>
            )}

            {/* Scrollable nav */}
            <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
              <>
                  {/* Pinned */}
                  {isAuthenticated && pinnedItems.length > 0 && (
                    <>
                      <p className="text-amber-600 text-[10px] font-black uppercase tracking-wider px-3 pt-3 pb-1.5 flex items-center gap-1.5">
                        <Pin className="w-3 h-3 fill-current" /> Pin Anda
                      </p>
                      {pinnedItems.map((item) => (
                        <DrawerMenuItem
                          key={`pin-${item.path}`}
                          to={item.path}
                          label={item.label}
                          active={isActive(item.path)}
                          notificationCount={getNotificationCount(item.path)}
                          showPin
                          pinned
                          onPinToggle={() => handlePinToggle(item.path, item.label)}
                          onNavigate={closeDrawer}
                        />
                      ))}
                    </>
                  )}

                  {/* Upgrade nudge — free tier only */}
                  {isAuthenticated && userTier === 'free' && (
                    <Link
                      to="/settings"
                      onClick={() => { haptic('medium'); closeDrawer(); }}
                      className="block mx-1 my-3 p-3.5 rounded-2xl transition-all relative overflow-hidden"
                      style={{
                        background: 'linear-gradient(135deg, #fde047 0%, #fb923c 50%, #f472b6 100%)',
                        boxShadow: '0 6px 20px rgba(251, 146, 60, 0.4)',
                      }}
                    >
                      <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full bg-white/20 blur-2xl pointer-events-none" />
                      <div className="relative flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white/95 flex items-center justify-center flex-shrink-0 shadow">
                          <Sparkles className="w-5 h-5 text-orange-500" strokeWidth={2.5} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white/90 text-[10px] font-black uppercase tracking-wider leading-none drop-shadow">Naik Taraf</p>
                          <p className="text-white text-sm font-black leading-tight mt-1 drop-shadow">Buka semua game + AI →</p>
                        </div>
                      </div>
                    </Link>
                  )}

                  {/* Section divider */}
                  {isAuthenticated && pinnedItems.length > 0 && (
                    <p className="text-white/70 text-[10px] font-black uppercase tracking-wider px-3 pt-3 pb-1.5">Semua Menu</p>
                  )}

                  {/* Top items */}
                  {topItems.map((item) =>
                    item.external ? (
                      <a key={item.path} href={item.path} onClick={closeDrawer}
                        className="flex items-center px-4 py-3 rounded-2xl font-bold text-white hover:bg-white/15 transition-all text-sm">
                        {item.label}
                      </a>
                    ) : (
                      <DrawerMenuItem
                        key={item.path}
                        to={item.path}
                        label={item.label}
                        active={isActive(item.path)}
                        notificationCount={getNotificationCount(item.path)}
                        onNavigate={closeDrawer}
                      />
                    )
                  )}

                  {/* Dashboard items */}
                  {dashboardItems.map((item) => (
                    <DrawerMenuItem
                      key={item.path}
                      to={item.path}
                      label={item.label}
                      active={isActive(item.path)}
                      notificationCount={getNotificationCount(item.path)}
                      showPin
                      pinned={pinnedItems.some(p => p.path === item.path)}
                      onPinToggle={() => handlePinToggle(item.path, item.label)}
                      onNavigate={closeDrawer}
                    />
                  ))}

                  {/* Grouped + admin */}
                  {[...groupedItems, ...adminItems].map((item) => {
                    const isExpanded = expandedSubmenu === item.path;
                    const itemActive = isActive(item.path);
                    return (
                      <div key={item.path}>
                        <motion.button
                          type="button"
                          whileTap={{ scale: 0.97 }}
                          onClick={() => { haptic('light'); setExpandedSubmenu(isExpanded ? null : item.path); }}
                          className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl font-bold text-sm transition-all ${
                            itemActive || isExpanded
                              ? 'bg-white/95 text-pink-600 shadow-sm font-black'
                              : 'text-white hover:bg-white/15'
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
                              <div className="ml-3 mt-1 mb-1 pl-3 border-l-2 border-pink-200 space-y-1">
                                {item.submenu.map((sub) => (
                                  <DrawerMenuItem
                                    key={sub.path}
                                    to={sub.path}
                                    label={sub.label}
                                    active={isActive(sub.path)}
                                    notificationCount={getNotificationCount(sub.path)}
                                    size="small"
                                    showPin
                                    pinned={pinnedItems.some(p => p.path === sub.path)}
                                    onPinToggle={() => handlePinToggle(sub.path, sub.label)}
                                    onNavigate={closeDrawer}
                                  />
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
              </>
            </nav>

            {/* Footer: Logout */}
            {isAuthenticated && (
              <div className="px-3 py-3 border-t border-pink-100 bg-white/40">
                <motion.button type="button" whileTap={{ scale: 0.97 }}
                  onClick={() => { haptic('medium'); closeDrawer(); logout?.(); }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-black text-sm text-rose-600 hover:bg-rose-50 transition-all">
                  <LogOut className="w-5 h-5 flex-shrink-0" strokeWidth={2.5} />
                  <span>Log Keluar</span>
                </motion.button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top header child switcher modal */}
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

// Page title mapping (outside component to avoid recreation)
const pageTitles = {
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