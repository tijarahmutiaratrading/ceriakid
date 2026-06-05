import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, ChevronDown, ChevronRight, X } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { useSafeLocation } from '@/hooks/useSafeLocation';
import { useSelectedChild } from '@/lib/SelectedChildContext';
import { haptic } from '@/lib/haptics';
import { getChildAvatar } from '@/lib/childAvatars';
import ChildSwitcherModal from '@/components/header/ChildSwitcherModal';

// Page title mapping (static)
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
  '/admin-dashboard': 'Admin',
};

// Logo URL
const LOGO_URL = 'https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/443c6c7e7_ChatGPTImageJun32026at06_14_57PM.png';

export default function AppHeader({ showBack = null, backTo = '/', title = null, theme = 'auto' }) {
  const [isOpen, setIsOpen] = useState(false);
  const [navVisible, setNavVisible] = useState(true);
  const [expandedSubmenu, setExpandedSubmenu] = useState(null);
  const [headerSwitcherOpen, setHeaderSwitcherOpen] = useState(false);

  const { isAuthenticated, user, logout } = useAuth() || {};
  const { selectedChild, childrenList, setSelectedChild } = useSelectedChild() || {};
  const location = useSafeLocation();
  const navigate = useNavigate();

  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
  const lastScrollY = useRef(0);

  const isAdmin = user?.role === 'admin';
  const isLanding = location.pathname === '/' || location.pathname === '/landing';
  const isPlayingGame = location.pathname.startsWith('/play/');

  const resolvedTheme = theme === 'auto' ? (isPlayingGame ? 'dark' : 'light') : theme;
  const isDarkPill = resolvedTheme === 'dark';

  // Avatar sync — listen for updates
  useEffect(() => { setAvatarUrl(user?.avatarUrl || ''); }, [user?.avatarUrl]);
  useEffect(() => {
    const handler = (e) => setAvatarUrl(e.detail?.avatarUrl || '');
    window.addEventListener('avatar-updated', handler);
    return () => window.removeEventListener('avatar-updated', handler);
  }, []);

  // Scroll-aware visibility — passive listener
  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      if (currentY < 50) setNavVisible(true);
      else setNavVisible(currentY <= lastScrollY.current);
      lastScrollY.current = currentY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // ESC key + body lock — gabung dalam satu effect
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => { if (e.key === 'Escape') setIsOpen(false); };
    window.addEventListener('keydown', handleKey);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleKey);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  const toggleDrawer = () => { haptic('light'); setIsOpen(v => !v); };
  const closeDrawer = () => setIsOpen(false);

  // Build menu items
  const menuSections = buildMenuSections({ isLanding, isAuthenticated, isAdmin });

  const isActive = (path) => path === '/' ? location.pathname === '/' : location.pathname === path || location.pathname.startsWith(path);

  const pageTitle = title || PAGE_TITLES[location.pathname] || 'CeriaKid';
  const showChildSwitcher = isAuthenticated && selectedChild && (childrenList?.length || 0) > 1;

  return (
    <>
      {/* Top header pill */}
      <nav
        className="sm:hidden fixed top-0 left-0 right-0 z-40 px-3 py-3 transition-transform duration-300"
        style={{
          transform: navVisible ? 'translateY(0)' : 'translateY(-100%)',
          paddingTop: 'max(0.75rem, env(safe-area-inset-top))',
        }}
      >
        <div
          className={`max-w-[52rem] mx-auto w-full grid grid-cols-[auto_1fr_auto] items-center gap-2 px-2.5 py-2 rounded-[1.75rem] shadow-lg ${
            isDarkPill ? 'bg-slate-900/90 ring-1 ring-white/20' : 'bg-white/95 ring-1 ring-slate-200'
          }`}
        >
          <button
            type="button"
            onClick={toggleDrawer}
            className={`px-3.5 py-2 rounded-full font-black text-xs shadow-sm active:scale-95 transition-transform ${
              isDarkPill ? 'bg-white text-game-purple' : 'bg-game-purple text-white'
            }`}
            aria-label={isOpen ? 'Tutup menu' : 'Buka menu'}
          >
            {isOpen ? 'Tutup' : 'Menu'}
          </button>

          <div className="min-w-0 text-center px-1">
            <p className={`text-[10px] font-black uppercase tracking-[0.18em] leading-none ${isDarkPill ? 'text-white/55' : 'text-slate-500'}`}>
              CeriaKid
            </p>
            <p className={`font-black text-sm truncate leading-tight mt-1 ${isDarkPill ? 'text-white' : 'text-slate-900'}`}>
              {pageTitle}
            </p>
          </div>

          <div className="flex items-center gap-2 justify-end">
            {showChildSwitcher && (
              <button
                type="button"
                onClick={() => { haptic('light'); setHeaderSwitcherOpen(true); }}
                aria-label={`Tukar anak: ${selectedChild.name}`}
                className="relative flex-shrink-0 active:scale-95 transition-transform"
              >
                <img
                  src={getChildAvatar(selectedChild)}
                  alt={selectedChild.name}
                  className={`w-9 h-9 rounded-full object-cover shadow ring-2 bg-white ${isDarkPill ? 'ring-yellow-300/80' : 'ring-pink-300'}`}
                />
                <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-pink-500 ring-2 ring-white flex items-center justify-center">
                  <ChevronDown className="w-2 h-2 text-white" strokeWidth={4} />
                </div>
              </button>
            )}

            <Link to={isAuthenticated ? '/settings' : '/'} aria-label={isAuthenticated ? 'Tetapan' : 'Home'}>
              {isAuthenticated ? (
                avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className={`w-10 h-10 rounded-full object-cover shadow ring-2 ${isDarkPill ? 'ring-white/60' : 'ring-purple-200'}`} />
                ) : (
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl shadow ring-2 ${isDarkPill ? 'bg-white/25 ring-white/50' : 'bg-purple-100 ring-purple-200'}`}>
                    🐱
                  </div>
                )
              ) : (
                <img src={LOGO_URL} alt="CeriaKid" className="h-9 rounded-2xl shadow ring-1 ring-white/40" loading="lazy" />
              )}
            </Link>
          </div>
        </div>
      </nav>

      {/* Overlay */}
      {isOpen && (
        <div
          onClick={closeDrawer}
          className="sm:hidden fixed inset-0 z-40 bg-slate-950/50 animate-in fade-in duration-200"
          aria-hidden="true"
        />
      )}

      {/* Drawer */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Menu navigasi"
          className="sm:hidden fixed left-3 right-3 top-4 bottom-4 z-50 flex flex-col rounded-[2rem] overflow-hidden shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200"
          style={{
            background: 'linear-gradient(165deg, #a855f7 0%, #ec4899 100%)',
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/15 flex-shrink-0" style={{ paddingTop: 'max(1rem, env(safe-area-inset-top))' }}>
            {isAuthenticated && user ? (
              <Link
                to="/settings"
                onClick={closeDrawer}
                className="flex-1 flex items-center gap-3 min-w-0"
              >
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="w-11 h-11 rounded-2xl object-cover ring-2 ring-white shadow" />
                ) : (
                  <div className="w-11 h-11 rounded-2xl bg-white/95 ring-2 ring-white flex items-center justify-center text-2xl shadow">🐱</div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-white font-black text-sm truncate">{user.full_name || 'User'}</p>
                  <p className="text-white/75 text-[11px] font-bold truncate">Tap untuk tetapan</p>
                </div>
                <ChevronRight className="w-4 h-4 text-white/70 flex-shrink-0" />
              </Link>
            ) : (
              <img src={LOGO_URL} alt="CeriaKid" className="h-8 rounded-lg" />
            )}

            <button
              type="button"
              onClick={closeDrawer}
              aria-label="Tutup"
              className="ml-2 p-2 rounded-xl bg-white/20 hover:bg-white/30 text-white flex-shrink-0 active:scale-95 transition-all"
            >
              <X className="w-5 h-5" strokeWidth={2.5} />
            </button>
          </div>

          {/* Active child quick switcher (top of nav) */}
          {showChildSwitcher && (
            <div className="px-3 pt-3 flex-shrink-0">
              <button
                type="button"
                onClick={() => { haptic('light'); setHeaderSwitcherOpen(true); }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-2xl bg-white/95 shadow active:scale-[0.98] transition-transform"
              >
                <img
                  src={getChildAvatar(selectedChild)}
                  alt={selectedChild.name}
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-pink-200 bg-white"
                />
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-pink-600 text-[9px] font-black uppercase tracking-wider leading-none">Anak Aktif</p>
                  <p className="text-slate-800 text-xs font-black truncate leading-tight mt-0.5">{selectedChild.name}</p>
                </div>
                <span className="text-pink-600 text-[10px] font-black uppercase px-2 py-1 rounded-lg bg-pink-100">Tukar</span>
              </button>
            </div>
          )}

          {/* Scrollable nav */}
          <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-1 overscroll-contain">
            {menuSections.map((section, idx) => (
              <MenuSection
                key={idx}
                section={section}
                isActive={isActive}
                expandedSubmenu={expandedSubmenu}
                onToggleSubmenu={(path) => setExpandedSubmenu(prev => prev === path ? null : path)}
                onNavigate={closeDrawer}
              />
            ))}
          </nav>

          {/* Logout footer */}
          {isAuthenticated && (
            <div className="px-3 py-3 border-t border-white/15 flex-shrink-0" style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}>
              <button
                type="button"
                onClick={() => { haptic('medium'); closeDrawer(); logout?.(); }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-black text-sm text-white bg-white/15 hover:bg-white/25 ring-1 ring-white/20 active:scale-[0.98] transition-all"
              >
                <LogOut className="w-5 h-5 flex-shrink-0" strokeWidth={2.5} />
                <span>Log Keluar</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Child switcher modal */}
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

/* ───── Helpers ───── */

function buildMenuSections({ isLanding, isAuthenticated, isAdmin }) {
  if (isLanding && !isAuthenticated) {
    return [{
      items: [
        { path: '/', label: 'Rumah' },
        { path: '#features', label: 'Ciri-ciri', external: true },
        { path: '#testimonials', label: 'Testimoni', external: true },
        { path: '#pricing', label: 'Harga', external: true },
        { path: '#faq', label: 'Soalan Lazim', external: true },
      ],
    }];
  }

  const sections = [{ items: [{ path: '/', label: 'Halaman Utama' }] }];

  if (isAuthenticated) {
    sections.push({
      title: 'Akaun',
      items: [
        { path: '/dashboard', label: 'Dashboard' },
        { path: '/settings', label: 'Tetapan Akaun' },
        { path: '/affiliate', label: 'Program Affiliate' },
        { path: '/contact', label: 'Hubungi Kami' },
      ],
    });

    sections.push({
      items: [
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
      ],
    });
  }

  if (isAdmin) {
    sections.push({
      title: 'Admin',
      items: [{
        path: '/admin-dashboard', label: 'Admin Dashboard',
        submenu: [
          { path: '/admin-dashboard?tab=analytics', label: 'Analytics' },
          { path: '/admin-dashboard?tab=health', label: 'System Health' },
          { path: '/admin-dashboard?tab=settings', label: 'Settings' },
        ],
      }],
    });
  }

  return sections;
}

function MenuSection({ section, isActive, expandedSubmenu, onToggleSubmenu, onNavigate }) {
  return (
    <div className="space-y-1">
      {section.title && (
        <p className="text-white/60 text-[10px] font-black uppercase tracking-wider px-3 pt-3 pb-1">
          {section.title}
        </p>
      )}
      {section.items.map((item) => (
        <MenuItem
          key={item.path}
          item={item}
          isActive={isActive}
          isExpanded={expandedSubmenu === item.path}
          onToggleSubmenu={() => onToggleSubmenu(item.path)}
          onNavigate={onNavigate}
        />
      ))}
    </div>
  );
}

function MenuItem({ item, isActive, isExpanded, onToggleSubmenu, onNavigate }) {
  const active = isActive(item.path);

  // External anchor (landing)
  if (item.external) {
    return (
      <a
        href={item.path}
        onClick={onNavigate}
        className="block px-4 py-3 rounded-2xl font-bold text-white text-sm active:bg-white/15 transition-colors"
      >
        {item.label}
      </a>
    );
  }

  // Submenu item
  if (item.submenu) {
    return (
      <div>
        <button
          type="button"
          onClick={() => { haptic('light'); onToggleSubmenu(); }}
          className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl font-bold text-sm transition-colors active:scale-[0.98] ${
            active || isExpanded
              ? 'bg-white/25 ring-1 ring-white/30 text-white font-black'
              : 'text-white active:bg-white/15'
          }`}
        >
          <span>{item.label}</span>
          {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>

        {isExpanded && (
          <div className="ml-3 mt-1 mb-1 pl-3 border-l-2 border-white/20 space-y-1 animate-in fade-in slide-in-from-top-1 duration-150">
            {item.submenu.map((sub) => (
              <Link
                key={sub.path}
                to={sub.path}
                onClick={() => { haptic('light'); onNavigate(); }}
                className={`block px-3 py-2.5 rounded-2xl font-bold text-xs transition-colors active:scale-[0.98] ${
                  isActive(sub.path)
                    ? 'bg-white/25 ring-1 ring-white/30 text-white font-black'
                    : 'text-white active:bg-white/15'
                }`}
              >
                {sub.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Regular link
  return (
    <Link
      to={item.path}
      onClick={() => { haptic('light'); onNavigate(); }}
      className={`block px-4 py-3 rounded-2xl font-bold text-sm transition-colors active:scale-[0.98] ${
        active
          ? 'bg-white/25 ring-1 ring-white/30 text-white font-black'
          : 'text-white active:bg-white/15'
      }`}
    >
      {item.label}
    </Link>
  );
}