import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Palette, BookOpen, UserCircle, BarChart3, Settings,
  UserPlus, Trophy, ChevronDown, Shield, LogOut, MessageCircle, Home, Share2, Gamepad2, Puzzle,
  GraduationCap, Brain, FileText, Sparkles
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
      { path: '/', label: 'Landing Page', icon: Sparkles },
      { path: '/contact', label: 'Hubungi Kami', icon: MessageCircle },
    ],
  },
  {
    key: 'belajar',
    label: 'Belajar',
    submenu: [
      { path: '/games-subjek', label: 'Belajar Ikut Subjek', icon: Gamepad2 },
      { path: '/games-hub', label: 'Game Hub', icon: Puzzle },
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
      { path: '/affiliate', label: 'Program Affiliate', icon: Share2 },
    ],
  },
  {
    key: 'cikgu-ai',
    label: 'Cikgu AI',
    submenu: [
      { path: '/ai-assistant', label: 'Cikgu Firdaus — Tutor', icon: GraduationCap },
      { path: '/quiz-ai', label: 'Cikgu Rosie — Kuiz', icon: Brain },
      { path: '/story-generator', label: 'Cikgu Mira — Cerita', icon: BookOpen },
      { path: '/bbm-generator', label: 'Cikgu Daniel — BBM', icon: FileText },
    ],
  },
];

export default function UserTopHeader() {
  const { user, logout } = useAuth() || {};
  const location = useSafeLocation();
  const [openMenu, setOpenMenu] = useState(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
  const navRef = useRef(null);
  const isVisible = useScrollDirection();

  // Sync avatar dengan user & event avatar-updated
  useEffect(() => { setAvatarUrl(user?.avatarUrl || ''); }, [user?.avatarUrl]);
  useEffect(() => {
    const handler = (e) => setAvatarUrl(e.detail?.avatarUrl || '');
    window.addEventListener('avatar-updated', handler);
    return () => window.removeEventListener('avatar-updated', handler);
  }, []);

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
        className="pointer-events-auto flex items-center gap-0.5 px-2 py-1 rounded-full shadow-xl shadow-black/20"
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
        {isAdmin && (
          <Link
            to="/admin-dashboard"
            className={`flex items-center gap-1.5 px-2 py-1 lg:px-3 lg:py-1.5 rounded-full text-sm lg:text-base font-black transition-all ${
              isDarkBg
                ? 'text-amber-300 hover:text-amber-200 hover:bg-white/15'
                : 'text-amber-700 hover:text-amber-900 hover:bg-white/50'
            }`}
            title="Tukar ke Admin Panel"
          >
            <Shield className="w-3 h-3 lg:w-3.5 lg:h-3.5" />
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
                className={`relative px-2 py-1 lg:px-3 lg:py-1.5 rounded-full font-black text-sm lg:text-base transition-colors ${
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
                className={`relative flex items-center gap-1 px-2 py-1 lg:px-3 lg:py-1.5 rounded-full font-black text-sm lg:text-base transition-colors ${
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
                <ChevronDown className={`relative w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
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

        {/* User menu — profil & logout */}
        <div className="relative ml-1">
          <button
            type="button"
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className={`flex items-center gap-1 pl-1 pr-2 py-1 rounded-full font-black text-sm transition-colors ${
              isDarkBg ? 'text-white hover:bg-white/15' : 'text-slate-800 hover:bg-white/50'
            }`}
            title="Akaun"
          >
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" className="w-7 h-7 lg:w-8 lg:h-8 rounded-full object-cover ring-1 ring-white/60 shadow-sm" />
            ) : (
              <span className="w-7 h-7 lg:w-8 lg:h-8 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center text-white text-xs font-black ring-1 ring-white/60">
                {(user?.full_name || user?.email || '?').charAt(0).toUpperCase()}
              </span>
            )}
            <ChevronDown className={`w-3 h-3 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {userMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.96 }}
                transition={{ duration: 0.15 }}
                className="absolute top-full right-0 mt-3 min-w-[14rem] rounded-2xl p-2 shadow-2xl z-50"
                style={{
                  background: 'rgba(20, 14, 38, 0.92)',
                  backdropFilter: 'blur(28px) saturate(180%)',
                  WebkitBackdropFilter: 'blur(28px) saturate(180%)',
                  border: '1px solid rgba(255,255,255,0.12)',
                }}
              >
                <div className="px-3 py-2.5 border-b border-white/10 mb-1">
                  <p className="text-white font-black text-xs truncate">{user?.full_name || 'Pengguna'}</p>
                  <p className="text-white/60 font-bold text-[10px] truncate">{user?.email}</p>
                </div>
                <Link
                  to="/settings"
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-bold text-xs text-white/85 hover:bg-white/10 hover:text-white transition-all"
                >
                  <Settings className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>Tetapan Akaun</span>
                </Link>
                <button
                  type="button"
                  onClick={() => logout?.()}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-bold text-xs text-red-300 hover:bg-red-500/15 hover:text-red-200 transition-all"
                >
                  <LogOut className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>Log Keluar</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </nav>
    </header>
  );
}