import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Palette, BookOpen, UserCircle, BarChart3, Settings,
  UserPlus, Trophy, ChevronDown, Shield, LogOut, MessageCircle, Home, Share2, Gamepad2, Puzzle
} from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { useSafeLocation } from '@/hooks/useSafeLocation';
import { useScrollDirection } from '@/hooks/useScrollDirection';

const NAV_GROUPS = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    submenu: [
      { path: '/dashboard', label: 'Halaman Utama', icon: Home },
      { path: '/settings', label: 'Tetapan Akaun', icon: Settings },
      { path: '/contact', label: 'Hubungi Kami', icon: MessageCircle },
    ],
  },
  {
    key: 'aktiviti',
    label: 'Aktiviti',
    submenu: [
      { path: '/games-subjek', label: 'Games Subjek', icon: Gamepad2 },
      { path: '/games-hub', label: 'Mini Games', icon: Puzzle },
      { path: '/drawing', label: 'Studio Lukisan', icon: Palette },
      { path: '/story-kid', label: 'Story Kid', icon: BookOpen },
      { path: '/friends', label: 'Kawan', icon: UserPlus },
      { path: '/challenges', label: 'Cabaran', icon: Trophy },
    ],
  },
  {
    key: 'keluarga',
    label: 'Keluarga',
    submenu: [
      { path: '/children-profiles', label: 'Profil Anak', icon: UserCircle },
      { path: '/parent-dashboard', label: 'Prestasi Anak', icon: BarChart3 },
    ],
  },
  {
    key: 'affiliate',
    label: 'Affiliate',
    path: '/affiliate',
  },
];

export default function UserTopHeader() {
  const { user, logout } = useAuth() || {};
  const location = useSafeLocation();
  const [openMenu, setOpenMenu] = useState(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const navRef = useRef(null);
  const isVisible = useScrollDirection();

  const isAdmin = user?.role === 'admin';
  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname === path || location.pathname.startsWith(path);
  };

  // Auto-detect halaman background gelap — pill jadi dark glass + text putih
  const DARK_BG_PATHS = ['/games-hub', '/mini-games', '/parent-dashboard', '/children-profiles'];
  const isDarkBg = DARK_BG_PATHS.some(p => location.pathname.startsWith(p));

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setOpenMenu(null);
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setOpenMenu(null);
    setUserMenuOpen(false);
  }, [location.pathname]);

  return (
    <header
      ref={navRef}
      className={`hidden sm:flex fixed top-5 left-0 right-0 z-50 justify-center px-4 pointer-events-none transition-transform duration-300 ${isVisible ? 'translate-y-0' : '-translate-y-[150%]'}`}
    >
      {/* Center: Floating pill nav (Apple Fitness style — adaptive glass) */}
      <nav
        className="pointer-events-auto flex items-center gap-0 px-1.5 py-1.5 rounded-full shadow-xl shadow-black/20"
        style={{
          background: isDarkBg
            ? 'linear-gradient(135deg, rgba(15,23,42,0.65), rgba(30,41,59,0.45))'
            : 'linear-gradient(135deg, rgba(255,255,255,0.55), rgba(255,255,255,0.25))',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          border: isDarkBg ? '1px solid rgba(255,255,255,0.18)' : '1px solid rgba(255,255,255,0.6)',
          boxShadow: isDarkBg
            ? '0 8px 32px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.15)'
            : '0 8px 32px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.7)',
        }}
      >
        <Link to="/" title="Ke Landing Page" className="flex-shrink-0">
          <img
            src="https://media.base44.com/images/public/69f1c132ffcd7c660466eec5/c0ad02d9e_ChatGPTImageMay12026at12_29_37PM.png"
            alt="CeriaKid"
            className="h-8 w-8 rounded-full object-cover ml-1 mr-2 ring-1 ring-white/60 shadow-sm hover:ring-amber-300 transition-all"
          />
        </Link>
        {isAdmin && (
          <Link
            to="/admin-dashboard"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-black transition-all ${
              isDarkBg
                ? 'text-amber-300 hover:text-amber-200 hover:bg-white/15'
                : 'text-amber-700 hover:text-amber-900 hover:bg-white/50'
            }`}
            title="Tukar ke Admin Panel"
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Admin</span>
          </Link>
        )}
        {NAV_GROUPS.map(group => {
          const hasSubmenu = group.submenu && group.submenu.length > 0;
          const groupActive = hasSubmenu ? group.submenu.some(s => isActive(s.path)) : isActive(group.path);
          const isOpen = openMenu === group.key;
          const showActive = groupActive || isOpen;

          if (!hasSubmenu) {
            return (
              <Link
                key={group.key}
                to={group.path}
                className={`relative px-3 py-1.5 rounded-full font-black text-sm transition-colors ${
                  showActive
                    ? 'text-white'
                    : (isDarkBg ? 'text-white hover:text-white' : 'text-slate-800 hover:text-slate-900')
                }`}
              >
                {showActive && (
                  <motion.span
                    layoutId="nav-pill"
                    className="absolute inset-0 rounded-full ring-1 ring-orange-300/40 shadow-lg shadow-orange-500/30"
                    style={{ background: 'linear-gradient(135deg, #fb923c, #f97316)' }}
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative">{group.label}</span>
              </Link>
            );
          }

          return (
            <div key={group.key} className="relative">
              <button
                type="button"
                onClick={() => setOpenMenu(isOpen ? null : group.key)}
                className={`relative flex items-center gap-1 px-3 py-1.5 rounded-full font-black text-sm transition-colors ${
                  showActive
                    ? 'text-white'
                    : (isDarkBg ? 'text-white hover:text-white' : 'text-slate-800 hover:text-slate-900')
                }`}
              >
                {showActive && (
                  <motion.span
                    layoutId="nav-pill"
                    className="absolute inset-0 rounded-full ring-1 ring-orange-300/40 shadow-lg shadow-orange-500/30"
                    style={{ background: 'linear-gradient(135deg, #fb923c, #f97316)' }}
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative">{group.label}</span>
                <ChevronDown className={`relative w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -6, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full left-1/2 -translate-x-1/2 mt-3 min-w-[14rem] rounded-2xl p-2 shadow-2xl z-50"
                    style={{
                      background: 'rgba(20, 14, 38, 0.92)',
                      backdropFilter: 'blur(28px) saturate(180%)',
                      WebkitBackdropFilter: 'blur(28px) saturate(180%)',
                      border: '1px solid rgba(255,255,255,0.12)',
                    }}
                  >
                    {group.submenu.map(sub => {
                      const SubIcon = sub.icon;
                      const subActive = isActive(sub.path);
                      return (
                        <Link
                          key={sub.path}
                          to={sub.path}
                          className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-bold text-xs transition-all ${
                            subActive ? 'bg-white/15 text-amber-300' : 'text-white/85 hover:bg-white/10 hover:text-white'
                          }`}
                        >
                          <SubIcon className="w-3.5 h-3.5 flex-shrink-0" />
                          <span>{sub.label}</span>
                        </Link>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </nav>
    </header>
  );
}