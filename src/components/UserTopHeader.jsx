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
import { base44 } from '@/api/base44Client';

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
      { path: '/social', label: 'Social & Challenge', icon: UserPlus },
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

  // Fallback: kalau user.avatarUrl belum sync, ambil terus dari DB (sama macam hero)
  useEffect(() => {
    if (avatarUrl || !user?.email) return;
    base44.auth.me().then((fresh) => {
      if (fresh?.avatarUrl) setAvatarUrl(fresh.avatarUrl);
    }).catch(() => {});
  }, [user?.email, avatarUrl]);

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
        className="pointer-events-auto flex items-center gap-0 px-1.5 py-0.5 rounded-full"
        style={{
          background: isDarkBg
            ? 'linear-gradient(135deg, rgba(15,23,42,0.65), rgba(30,41,59,0.45))'
            : 'linear-gradient(135deg, rgba(255,255,255,0.55), rgba(255,255,255,0.25))',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        }}
      >
        {isAdmin && (
          <Link
            to="/admin-dashboard"
            className={`flex items-center gap-1 px-1.5 py-0.5 lg:px-2 lg:py-0.5 rounded-full text-sm lg:text-[15px] font-black transition-all ${
              isDarkBg
                ? 'text-amber-300 hover:text-amber-200 hover:bg-white/15'
                : 'text-amber-700 hover:text-amber-900 hover:bg-white/50'
            }`}
            title="Tukar ke Admin Panel"
          >
            <Shield className="w-4 h-4 lg:w-[18px] lg:h-[18px]" />
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
                className={`relative px-2 py-1.5 lg:px-2.5 lg:py-2 rounded-full font-black text-sm lg:text-[15px] transition-colors ${
                  showActive
                    ? 'text-white'
                    : 'text-white hover:text-white'
                }`}
              >
                {showActive && (
                  <motion.span
                    layoutId="nav-pill"
                    className="absolute inset-0 rounded-full brand-gradient-br"
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
                className={`relative flex items-center gap-0.5 px-2 py-1.5 lg:px-2.5 lg:py-2 rounded-full font-black text-sm lg:text-[15px] transition-colors ${
                  showActive
                    ? 'text-white'
                    : 'text-white hover:text-white'
                }`}
              >
                {showActive && (
                  <motion.span
                    layoutId="nav-pill"
                    className="absolute inset-0 rounded-full brand-gradient-br"
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
                            subActive ? 'bg-white/15 text-purple-300' : 'text-white/85 hover:bg-white/10 hover:text-white'
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
              <img src={avatarUrl} alt="Avatar" className="w-9 h-9 lg:w-10 lg:h-10 rounded-full object-cover ring-1 ring-white/60 shadow-sm" />
            ) : (
              <span className="w-7 h-7 lg:w-8 lg:h-8 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center text-white text-xs font-black ring-1 ring-white/60">
                {(user?.full_name || user?.email || '?').charAt(0).toUpperCase()}
              </span>
            )}
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